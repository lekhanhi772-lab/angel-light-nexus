-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can insert documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can update documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can delete documents" ON public.documents;
DROP POLICY IF EXISTS "Admins can insert folders" ON public.folders;
DROP POLICY IF EXISTS "Admins can update folders" ON public.folders;
DROP POLICY IF EXISTS "Admins can delete folders" ON public.folders;
DROP POLICY IF EXISTS "Admins can insert chunks" ON public.document_chunks;
DROP POLICY IF EXISTS "Admins can delete chunks" ON public.document_chunks;

-- Create new public policies for documents
CREATE POLICY "Anyone can insert documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update documents" 
ON public.documents 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete documents" 
ON public.documents 
FOR DELETE 
USING (true);

-- Create new public policies for folders
CREATE POLICY "Anyone can insert folders" 
ON public.folders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update folders" 
ON public.folders 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete folders" 
ON public.folders 
FOR DELETE 
USING (true);

-- Create new public policies for document_chunks
CREATE POLICY "Anyone can insert chunks" 
ON public.document_chunks 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can delete chunks" 
ON public.document_chunks 
FOR DELETE 
USING (true);

-- Update storage policies for sacred-documents bucket
DROP POLICY IF EXISTS "Admin can upload files" ON storage.objects;
DROP POLICY IF EXISTS "Admin can delete files" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view sacred documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload to sacred-documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete from sacred-documents" ON storage.objects;

CREATE POLICY "Anyone can view sacred documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'sacred-documents');

CREATE POLICY "Anyone can upload to sacred-documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'sacred-documents');

CREATE POLICY "Anyone can delete from sacred-documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'sacred-documents');