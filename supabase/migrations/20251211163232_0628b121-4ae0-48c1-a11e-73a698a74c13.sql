-- Update storage policies to ensure uploads work
-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public uploads to sacred-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads from sacred-documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow public deletes from sacred-documents" ON storage.objects;

-- Create permissive policies for the sacred-documents bucket
CREATE POLICY "Allow public uploads to sacred-documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'sacred-documents');

CREATE POLICY "Allow public downloads from sacred-documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'sacred-documents');

CREATE POLICY "Allow public deletes from sacred-documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'sacred-documents');

CREATE POLICY "Allow public updates to sacred-documents"
ON storage.objects FOR UPDATE
USING (bucket_id = 'sacred-documents');