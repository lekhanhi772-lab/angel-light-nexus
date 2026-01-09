import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API Key
    const apiKey = req.headers.get('x-api-key');
    const SHARE_API_KEY = Deno.env.get('SHARE_API_KEY');
    
    if (!SHARE_API_KEY || apiKey !== SHARE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid API Key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse query parameters
    const url = new URL(req.url);
    const since = url.searchParams.get('since'); // ISO date string
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Query documents with optional date filter
    let documentsQuery = supabase
      .from('documents')
      .select('*', { count: 'exact' });
    
    if (since) {
      documentsQuery = documentsQuery.gte('updated_at', since);
    }
    
    documentsQuery = documentsQuery
      .order('created_at', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data: documents, error: docsError, count: totalDocs } = await documentsQuery;

    if (docsError) {
      throw new Error(`Error fetching documents: ${docsError.message}`);
    }

    if (!documents || documents.length === 0) {
      return new Response(
        JSON.stringify({ 
          documents: [], 
          chunks: [], 
          total: 0,
          message: 'No documents found' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get document IDs
    const docIds = documents.map(d => d.id);

    // Fetch chunks for these documents
    const { data: chunks, error: chunksError } = await supabase
      .from('document_chunks')
      .select('id, document_id, content, chunk_index, created_at')
      .in('document_id', docIds)
      .order('chunk_index', { ascending: true });

    if (chunksError) {
      throw new Error(`Error fetching chunks: ${chunksError.message}`);
    }

    // Also fetch folders if any
    const folderIds = [...new Set(documents.filter(d => d.folder_id).map(d => d.folder_id))];
    let folders: any[] = [];
    
    if (folderIds.length > 0) {
      const { data: foldersData, error: foldersError } = await supabase
        .from('folders')
        .select('*')
        .in('id', folderIds);
      
      if (!foldersError && foldersData) {
        folders = foldersData;
      }
    }

    console.log(`[share-documents] Sharing ${documents.length} documents, ${chunks?.length || 0} chunks, ${folders.length} folders`);

    return new Response(
      JSON.stringify({
        documents,
        chunks: chunks || [],
        folders,
        total: totalDocs || documents.length,
        pagination: {
          limit,
          offset,
          hasMore: (offset + limit) < (totalDocs || 0)
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('[share-documents] Error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
