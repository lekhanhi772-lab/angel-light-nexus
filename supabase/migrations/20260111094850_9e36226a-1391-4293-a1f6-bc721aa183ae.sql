-- Create bookmarked_messages table
CREATE TABLE public.bookmarked_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  message_id UUID REFERENCES public.chat_messages(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bookmarked_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own bookmarks"
ON public.bookmarked_messages
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks"
ON public.bookmarked_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks"
ON public.bookmarked_messages
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks"
ON public.bookmarked_messages
FOR UPDATE
USING (auth.uid() = user_id);

-- Add onboarding_completed column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Add index for performance
CREATE INDEX idx_bookmarked_messages_user_id ON public.bookmarked_messages(user_id);
CREATE INDEX idx_bookmarked_messages_message_id ON public.bookmarked_messages(message_id);