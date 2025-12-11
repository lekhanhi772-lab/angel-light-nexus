import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Split text into chunks
function chunkText(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start += chunkSize - overlap;
    
    if (start + overlap >= text.length) break;
  }
  
  return chunks;
}

// Extract text from different file types
async function extractText(content: string, fileType: string): Promise<string> {
  // For now, handle text-based files
  // PDF and DOCX would need additional libraries
  if (fileType === 'text/plain' || fileType.includes('text')) {
    return content;
  }
  
  // For other types, try to extract as text
  return content;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string || file?.name || 'Untitled';

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size}`);

    // Validate file type
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    const isAllowed = allowedTypes.some(type => file.type.includes(type)) || 
                      file.name.endsWith('.txt') || 
                      file.name.endsWith('.pdf') || 
                      file.name.endsWith('.docx');

    if (!isAllowed) {
      return new Response(
        JSON.stringify({ error: 'File type not supported. Please upload .txt, .pdf, or .docx files.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 50MB.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Upload file to storage
    const filePath = `${Date.now()}_${file.name}`;
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('sacred-documents')
      .upload(filePath, uint8Array, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file to storage' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract text content
    let textContent = '';
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      textContent = new TextDecoder().decode(uint8Array);
    } else {
      // For PDF/DOCX, store the file and extract basic text
      // In production, you'd use a proper parser library
      textContent = new TextDecoder().decode(uint8Array);
    }

    // Create document record
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        title: title,
        file_name: file.name,
        file_path: filePath,
        file_size: file.size,
        file_type: file.type
      })
      .select()
      .single();

    if (docError) {
      console.error('Document insert error:', docError);
      return new Response(
        JSON.stringify({ error: 'Failed to create document record' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Document created: ${document.id}`);

    // Chunk the text and store
    const chunks = chunkText(textContent);
    console.log(`Created ${chunks.length} chunks`);

    const chunkInserts = chunks.map((content, index) => ({
      document_id: document.id,
      content: content,
      chunk_index: index
    }));

    const { error: chunksError } = await supabase
      .from('document_chunks')
      .insert(chunkInserts);

    if (chunksError) {
      console.error('Chunks insert error:', chunksError);
      // Don't fail the whole operation, document is still saved
    }

    console.log(`Successfully processed document: ${document.title}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        document: document,
        chunksCount: chunks.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Upload error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
