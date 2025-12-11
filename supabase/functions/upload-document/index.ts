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
  
  // Clean the text first
  const cleanedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  
  if (!cleanedText || cleanedText.length === 0) {
    return [];
  }
  
  while (start < cleanedText.length) {
    const end = Math.min(start + chunkSize, cleanedText.length);
    const chunk = cleanedText.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    start += chunkSize - overlap;
    
    if (start + overlap >= cleanedText.length) break;
  }
  
  return chunks;
}

// Extract text from PDF using pdf.js approach - extract readable text from binary
function extractTextFromPDF(uint8Array: Uint8Array): string {
  console.log('Extracting text from PDF...');
  
  // Convert to string to find text streams
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const pdfContent = decoder.decode(uint8Array);
  
  // Multiple approaches to extract text from PDF
  const textParts: string[] = [];
  
  // Approach 1: Find text between BT and ET markers (Text objects)
  const textObjectRegex = /BT\s*([\s\S]*?)\s*ET/g;
  let match;
  while ((match = textObjectRegex.exec(pdfContent)) !== null) {
    const textBlock = match[1];
    
    // Extract text from Tj operators (show text)
    const tjMatches = textBlock.match(/\(([^)]*)\)\s*Tj/g);
    if (tjMatches) {
      for (const tj of tjMatches) {
        const textMatch = tj.match(/\(([^)]*)\)/);
        if (textMatch) {
          textParts.push(decodeEscapedText(textMatch[1]));
        }
      }
    }
    
    // Extract text from TJ operators (show text with positioning)
    const tjArrayMatches = textBlock.match(/\[(.*?)\]\s*TJ/g);
    if (tjArrayMatches) {
      for (const tjArray of tjArrayMatches) {
        const stringMatches = tjArray.match(/\(([^)]*)\)/g);
        if (stringMatches) {
          for (const str of stringMatches) {
            const textMatch = str.match(/\(([^)]*)\)/);
            if (textMatch) {
              textParts.push(decodeEscapedText(textMatch[1]));
            }
          }
        }
      }
    }
  }
  
  // Approach 2: Find Unicode text streams
  const unicodeRegex = /<([0-9A-Fa-f]+)>\s*Tj/g;
  while ((match = unicodeRegex.exec(pdfContent)) !== null) {
    const hexString = match[1];
    const decoded = decodeHexString(hexString);
    if (decoded) {
      textParts.push(decoded);
    }
  }
  
  // Approach 3: Look for stream content that might contain readable text
  const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
  while ((match = streamRegex.exec(pdfContent)) !== null) {
    const streamContent = match[1];
    // Only process if it looks like it contains readable text
    const readableMatches = streamContent.match(/[A-Za-zÀ-ỹ0-9\s,.!?;:\-'"()]{20,}/g);
    if (readableMatches) {
      textParts.push(...readableMatches);
    }
  }
  
  let extractedText = textParts.join(' ').trim();
  
  // Clean up the text
  extractedText = extractedText
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\t/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[^\x20-\x7E\u00C0-\u024F\u1E00-\u1EFF\n]/g, ' ') // Keep Latin chars and Vietnamese
    .trim();
  
  console.log(`Extracted ${extractedText.length} characters from PDF`);
  return extractedText;
}

// Decode escaped text in PDF strings
function decodeEscapedText(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\(/g, '(')
    .replace(/\\\)/g, ')')
    .replace(/\\\\/g, '\\');
}

// Decode hex string to text
function decodeHexString(hex: string): string {
  try {
    let result = '';
    for (let i = 0; i < hex.length; i += 4) {
      const charCode = parseInt(hex.substr(i, 4), 16);
      if (charCode > 0 && charCode < 65536) {
        result += String.fromCharCode(charCode);
      }
    }
    return result;
  } catch {
    return '';
  }
}

// Sanitize filename for storage
function sanitizeFileName(fileName: string): string {
  const normalized = fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/["'"'""]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  return normalized || 'document';
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

    // Upload file to storage with sanitized filename
    const sanitizedName = sanitizeFileName(file.name);
    const filePath = `${Date.now()}_${sanitizedName}`;
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    console.log(`Uploading to path: ${filePath}`);

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

    // Extract text content based on file type
    let textContent = '';
    
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      // Plain text files
      textContent = new TextDecoder('utf-8').decode(uint8Array);
      console.log(`Extracted ${textContent.length} chars from TXT file`);
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      // PDF files - use custom extraction
      textContent = extractTextFromPDF(uint8Array);
      
      // If extraction failed, try to use AI to describe the content
      if (textContent.length < 50) {
        console.log('PDF extraction yielded minimal text, file may need manual processing');
        textContent = `[Tài liệu PDF: ${title}] - Nội dung cần được xử lý thủ công hoặc upload dưới dạng TXT.`;
      }
    } else {
      // Other formats - try basic text extraction
      const decoder = new TextDecoder('utf-8', { fatal: false });
      textContent = decoder.decode(uint8Array);
    }

    console.log(`Final text content length: ${textContent.length}`);
    console.log(`Text preview: ${textContent.substring(0, 200)}...`);

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

    if (chunks.length > 0) {
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
      } else {
        console.log(`Successfully inserted ${chunks.length} chunks`);
      }
    } else {
      console.log('No chunks created - text extraction may have failed');
    }

    console.log(`Successfully processed document: ${document.title}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        document: document,
        chunksCount: chunks.length,
        textLength: textContent.length
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
