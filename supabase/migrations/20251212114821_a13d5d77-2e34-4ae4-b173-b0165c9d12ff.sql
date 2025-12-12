-- Create folders table for organizing documents
CREATE TABLE public.folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add folder_id to documents table
ALTER TABLE public.documents 
ADD COLUMN folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL;

-- Enable RLS on folders
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for folders
CREATE POLICY "Anyone can view folders" 
ON public.folders 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create folders" 
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

-- Add trigger for updated_at
CREATE TRIGGER update_folders_updated_at
BEFORE UPDATE ON public.folders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create default folder "Tổng hợp"
INSERT INTO public.folders (name) VALUES ('Tổng hợp');