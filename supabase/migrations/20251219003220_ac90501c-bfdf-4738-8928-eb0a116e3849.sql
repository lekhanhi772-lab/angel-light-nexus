-- Make the sacred-documents bucket public for reading
UPDATE storage.buckets SET public = true WHERE id = 'sacred-documents';

-- Create policy for public read access on storage.objects
CREATE POLICY "Public can read sacred documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'sacred-documents');

-- Create policy for authenticated users to upload (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Authenticated users can upload documents'
    ) THEN
        CREATE POLICY "Authenticated users can upload documents"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'sacred-documents' AND auth.role() = 'authenticated');
    END IF;
END $$;

-- Create policy for authenticated users to delete (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Authenticated users can delete documents'
    ) THEN
        CREATE POLICY "Authenticated users can delete documents"
        ON storage.objects FOR DELETE
        USING (bucket_id = 'sacred-documents' AND auth.role() = 'authenticated');
    END IF;
END $$;