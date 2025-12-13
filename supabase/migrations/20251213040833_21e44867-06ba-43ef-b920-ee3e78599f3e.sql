-- Add UPDATE policy for documents table to allow moving files between folders
CREATE POLICY "Anyone can update documents"
ON public.documents
FOR UPDATE
USING (true)
WITH CHECK (true);