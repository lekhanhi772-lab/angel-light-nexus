-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check if user has a role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role = 'admin'
  )
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
ON public.user_roles
FOR ALL
USING (public.is_admin());

-- Update RLS policies for documents table
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create documents" ON public.documents;
DROP POLICY IF EXISTS "Anyone can delete documents" ON public.documents;
DROP POLICY IF EXISTS "Anyone can update documents" ON public.documents;
DROP POLICY IF EXISTS "Anyone can view documents" ON public.documents;

-- Create new policies: Everyone can read, only admin can write
CREATE POLICY "Everyone can view documents"
ON public.documents
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert documents"
ON public.documents
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update documents"
ON public.documents
FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can delete documents"
ON public.documents
FOR DELETE
USING (public.is_admin());

-- Update RLS policies for folders table
DROP POLICY IF EXISTS "Anyone can create folders" ON public.folders;
DROP POLICY IF EXISTS "Anyone can delete folders" ON public.folders;
DROP POLICY IF EXISTS "Anyone can update folders" ON public.folders;
DROP POLICY IF EXISTS "Anyone can view folders" ON public.folders;

-- Create new policies: Everyone can read, only admin can write
CREATE POLICY "Everyone can view folders"
ON public.folders
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert folders"
ON public.folders
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update folders"
ON public.folders
FOR UPDATE
USING (public.is_admin());

CREATE POLICY "Admins can delete folders"
ON public.folders
FOR DELETE
USING (public.is_admin());

-- Update RLS policies for document_chunks table
DROP POLICY IF EXISTS "Anyone can create chunks" ON public.document_chunks;
DROP POLICY IF EXISTS "Anyone can delete chunks" ON public.document_chunks;
DROP POLICY IF EXISTS "Anyone can view chunks" ON public.document_chunks;

CREATE POLICY "Everyone can view chunks"
ON public.document_chunks
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert chunks"
ON public.document_chunks
FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete chunks"
ON public.document_chunks
FOR DELETE
USING (public.is_admin());

-- Update storage policies for sacred-documents bucket
-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete documents" ON storage.objects;

-- Create new storage policies
CREATE POLICY "Everyone can view sacred documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'sacred-documents');

CREATE POLICY "Everyone can download sacred documents"
ON storage.objects
FOR SELECT
USING (bucket_id = 'sacred-documents');

CREATE POLICY "Admins can upload sacred documents"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'sacred-documents' AND public.is_admin());

CREATE POLICY "Admins can update sacred documents"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'sacred-documents' AND public.is_admin());

CREATE POLICY "Admins can delete sacred documents"
ON storage.objects
FOR DELETE
USING (bucket_id = 'sacred-documents' AND public.is_admin());