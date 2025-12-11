-- Enable pgvector extension for vector search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table to store uploaded document metadata
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create document_chunks table for RAG
CREATE TABLE public.document_chunks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  embedding vector(1536),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;

-- RLS policies for documents
CREATE POLICY "Anyone can view documents"
ON public.documents FOR SELECT USING (true);

CREATE POLICY "Anyone can create documents"
ON public.documents FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete documents"
ON public.documents FOR DELETE USING (true);

-- RLS policies for document_chunks
CREATE POLICY "Anyone can view chunks"
ON public.document_chunks FOR SELECT USING (true);

CREATE POLICY "Anyone can create chunks"
ON public.document_chunks FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete chunks"
ON public.document_chunks FOR DELETE USING (true);

-- Create index for full-text search
CREATE INDEX idx_document_chunks_content ON public.document_chunks USING gin(to_tsvector('simple', content));

-- Trigger for updated_at
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('sacred-documents', 'sacred-documents', false, 52428800);

-- Storage policies
CREATE POLICY "Anyone can upload sacred documents"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'sacred-documents');

CREATE POLICY "Anyone can view sacred documents"
ON storage.objects FOR SELECT USING (bucket_id = 'sacred-documents');

CREATE POLICY "Anyone can delete sacred documents"
ON storage.objects FOR DELETE USING (bucket_id = 'sacred-documents');

-- Function to search documents by text
CREATE OR REPLACE FUNCTION public.search_documents(search_query TEXT, match_count INT DEFAULT 5)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  chunk_index INT,
  document_title TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.id,
    dc.document_id,
    dc.content,
    dc.chunk_index,
    d.title as document_title,
    ts_rank(to_tsvector('simple', dc.content), plainto_tsquery('simple', search_query))::FLOAT as similarity
  FROM document_chunks dc
  JOIN documents d ON d.id = dc.document_id
  WHERE to_tsvector('simple', dc.content) @@ plainto_tsquery('simple', search_query)
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;