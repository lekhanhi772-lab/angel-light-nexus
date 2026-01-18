-- Tạo bảng shared_conversations để lưu trữ hội thoại chia sẻ
CREATE TABLE public.shared_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  share_token VARCHAR(32) UNIQUE NOT NULL,
  title VARCHAR(255),
  is_public BOOLEAN DEFAULT true,
  forum_post_id UUID REFERENCES public.forum_posts(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Index cho share_token (truy vấn nhanh)
CREATE INDEX idx_shared_conversations_token ON public.shared_conversations(share_token);

-- Index cho user_id
CREATE INDEX idx_shared_conversations_user ON public.shared_conversations(user_id);

-- Enable RLS
ALTER TABLE public.shared_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: User có thể tạo share cho conversation của mình
CREATE POLICY "Users can share own conversations"
ON public.shared_conversations FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (SELECT 1 FROM conversations WHERE id = conversation_id AND user_id = auth.uid())
);

-- Policy: Ai cũng xem được shared conversation công khai
CREATE POLICY "Anyone can view public shared conversations"
ON public.shared_conversations FOR SELECT
USING (is_public = true);

-- Policy: Owner có thể xem tất cả shares của mình (kể cả private)
CREATE POLICY "Owners can view their shares"
ON public.shared_conversations FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy: Owner có thể update share của mình
CREATE POLICY "Owners can update their shares"
ON public.shared_conversations FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Policy: Owner có thể xóa share của mình
CREATE POLICY "Owners can delete their shares"
ON public.shared_conversations FOR DELETE
TO authenticated
USING (user_id = auth.uid());