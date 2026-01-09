/**
 * 🌟 SYNC-FROM-SOURCE EDGE FUNCTION 🌟
 * 
 * Copy file này sang project Angel AI mới!
 * 
 * Secrets cần thêm ở project mới:
 * - SOURCE_ANGEL_URL: https://cxzywdzwbgeybpqssske.supabase.co
 * - SOURCE_API_KEY: (giống SHARE_API_KEY của project gốc)
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncMetadata {
  lastSyncAt: string;
  totalDocsSynced: number;
  totalChunksSynced: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const SOURCE_ANGEL_URL = Deno.env.get('SOURCE_ANGEL_URL');
    const SOURCE_API_KEY = Deno.env.get('SOURCE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!SOURCE_ANGEL_URL || !SOURCE_API_KEY) {
      throw new Error('Missing SOURCE_ANGEL_URL or SOURCE_API_KEY secrets');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body for options
    let options = { fullSync: false, since: null as string | null };
    if (req.method === 'POST') {
      try {
        options = { ...options, ...(await req.json()) };
      } catch {
        // Use defaults
      }
    }

    console.log('[sync-from-source] Starting sync...', options);

    // Get last sync time from metadata (if not full sync)
    let lastSyncAt: string | null = null;
    if (!options.fullSync) {
      // You can store sync metadata in a simple table or use options.since
      lastSyncAt = options.since;
    }

    // Fetch documents from source in batches
    let offset = 0;
    const limit = 50;
    let hasMore = true;
    let totalDocsSynced = 0;
    let totalChunksSynced = 0;
    let totalFoldersSynced = 0;

    while (hasMore) {
      const syncUrl = new URL(`${SOURCE_ANGEL_URL}/functions/v1/share-documents`);
      syncUrl.searchParams.set('limit', limit.toString());
      syncUrl.searchParams.set('offset', offset.toString());
      if (lastSyncAt) {
        syncUrl.searchParams.set('since', lastSyncAt);
      }

      console.log(`[sync-from-source] Fetching batch: offset=${offset}, limit=${limit}`);

      const response = await fetch(syncUrl.toString(), {
        method: 'GET',
        headers: {
          'x-api-key': SOURCE_API_KEY,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Source API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const { documents, chunks, folders, pagination } = data;

      if (!documents || documents.length === 0) {
        console.log('[sync-from-source] No more documents to sync');
        break;
      }

      // Upsert folders first (if any)
      if (folders && folders.length > 0) {
        for (const folder of folders) {
          const { error: folderError } = await supabase
            .from('folders')
            .upsert({
              id: folder.id,
              name: folder.name,
              created_at: folder.created_at,
              updated_at: folder.updated_at,
            }, { onConflict: 'id' });

          if (folderError) {
            console.error(`[sync-from-source] Error upserting folder ${folder.id}:`, folderError);
          } else {
            totalFoldersSynced++;
          }
        }
      }

      // Upsert documents
      for (const doc of documents) {
        const { error: docError } = await supabase
          .from('documents')
          .upsert({
            id: doc.id,
            title: doc.title,
            file_name: doc.file_name,
            file_path: doc.file_path,
            file_size: doc.file_size,
            file_type: doc.file_type,
            folder_id: doc.folder_id,
            created_at: doc.created_at,
            updated_at: doc.updated_at,
          }, { onConflict: 'id' });

        if (docError) {
          console.error(`[sync-from-source] Error upserting document ${doc.id}:`, docError);
        } else {
          totalDocsSynced++;
        }
      }

      // Upsert chunks
      if (chunks && chunks.length > 0) {
        for (const chunk of chunks) {
          const { error: chunkError } = await supabase
            .from('document_chunks')
            .upsert({
              id: chunk.id,
              document_id: chunk.document_id,
              content: chunk.content,
              chunk_index: chunk.chunk_index,
              created_at: chunk.created_at,
            }, { onConflict: 'id' });

          if (chunkError) {
            console.error(`[sync-from-source] Error upserting chunk ${chunk.id}:`, chunkError);
          } else {
            totalChunksSynced++;
          }
        }
      }

      // Check if there are more pages
      hasMore = pagination?.hasMore || false;
      offset += limit;

      console.log(`[sync-from-source] Batch complete: ${documents.length} docs, ${chunks?.length || 0} chunks`);
    }

    const result: SyncMetadata = {
      lastSyncAt: new Date().toISOString(),
      totalDocsSynced,
      totalChunksSynced,
    };

    console.log('[sync-from-source] Sync complete!', result);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Đồng bộ thành công! 📚`,
        data: {
          ...result,
          totalFoldersSynced,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('[sync-from-source] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
