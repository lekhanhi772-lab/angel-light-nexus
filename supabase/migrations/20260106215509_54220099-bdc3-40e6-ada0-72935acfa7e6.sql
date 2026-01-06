
-- Create forum_categories table
CREATE TABLE public.forum_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '💬',
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on forum_categories
ALTER TABLE public.forum_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view categories
CREATE POLICY "Everyone can view categories"
ON public.forum_categories
FOR SELECT
USING (true);

-- Only admins can manage categories
CREATE POLICY "Admins can manage categories"
ON public.forum_categories
FOR ALL
USING (public.is_admin());

-- Create forum_posts table
CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL,
  category_id UUID REFERENCES public.forum_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on forum_posts
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

-- Everyone can view posts
CREATE POLICY "Everyone can view posts"
ON public.forum_posts
FOR SELECT
USING (true);

-- Authenticated users can create posts
CREATE POLICY "Authenticated users can create posts"
ON public.forum_posts
FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- Authors can update their posts
CREATE POLICY "Authors can update their posts"
ON public.forum_posts
FOR UPDATE
USING (auth.uid() = author_id);

-- Authors or admins can delete posts
CREATE POLICY "Authors or admins can delete posts"
ON public.forum_posts
FOR DELETE
USING (auth.uid() = author_id OR public.is_admin());

-- Create forum_comments table
CREATE TABLE public.forum_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  parent_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on forum_comments
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

-- Everyone can view comments
CREATE POLICY "Everyone can view comments"
ON public.forum_comments
FOR SELECT
USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
ON public.forum_comments
FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- Authors can update their comments
CREATE POLICY "Authors can update their comments"
ON public.forum_comments
FOR UPDATE
USING (auth.uid() = author_id);

-- Authors or admins can delete comments
CREATE POLICY "Authors or admins can delete comments"
ON public.forum_comments
FOR DELETE
USING (auth.uid() = author_id OR public.is_admin());

-- Create forum_likes table
CREATE TABLE public.forum_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Enable RLS on forum_likes
ALTER TABLE public.forum_likes ENABLE ROW LEVEL SECURITY;

-- Everyone can view likes
CREATE POLICY "Everyone can view likes"
ON public.forum_likes
FOR SELECT
USING (true);

-- Authenticated users can like posts
CREATE POLICY "Authenticated users can like posts"
ON public.forum_likes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove their likes
CREATE POLICY "Users can remove their likes"
ON public.forum_likes
FOR DELETE
USING (auth.uid() = user_id);

-- Create function to update likes_count
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for likes_count
CREATE TRIGGER on_forum_like_change
AFTER INSERT OR DELETE ON public.forum_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_post_likes_count();

-- Create function to update comments_count
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create trigger for comments_count
CREATE TRIGGER on_forum_comment_change
AFTER INSERT OR DELETE ON public.forum_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_post_comments_count();

-- Create trigger for updated_at on forum_posts
CREATE TRIGGER update_forum_posts_updated_at
BEFORE UPDATE ON public.forum_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default categories
INSERT INTO public.forum_categories (name, icon, description, display_order) VALUES
('Chia sẻ tâm linh', '✨', 'Chia sẻ những trải nghiệm tâm linh của bạn', 1),
('Thảo luận', '💬', 'Thảo luận về các chủ đề chung', 2),
('Hỏi đáp', '❓', 'Đặt câu hỏi và nhận câu trả lời từ cộng đồng', 3),
('Biết ơn', '💛', 'Chia sẻ lòng biết ơn của bạn', 4);

-- Enable realtime for forum tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_likes;
