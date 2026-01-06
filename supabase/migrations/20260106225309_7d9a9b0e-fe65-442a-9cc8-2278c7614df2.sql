-- 1. Delete the "Hỏi đáp" category (no posts exist in it)
DELETE FROM forum_categories WHERE id = 'd6e89d25-097f-4c39-8b62-68e7b97b4231';

-- 2. Update display_order for "Biết ơn" category
UPDATE forum_categories SET display_order = 3 WHERE id = '083333ad-83b2-408b-8a0d-32725de9e217';

-- 3. Create storage bucket for forum images
INSERT INTO storage.buckets (id, name, public)
VALUES ('forum-images', 'forum-images', true)
ON CONFLICT (id) DO NOTHING;

-- 4. RLS Policy: Anyone can view forum images (public bucket)
CREATE POLICY "Anyone can view forum images"
ON storage.objects FOR SELECT
USING (bucket_id = 'forum-images');

-- 5. RLS Policy: Authenticated users can upload forum images
CREATE POLICY "Authenticated users can upload forum images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'forum-images' 
  AND auth.role() = 'authenticated'
);

-- 6. RLS Policy: Users can delete their own forum images
CREATE POLICY "Users can delete own forum images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'forum-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);