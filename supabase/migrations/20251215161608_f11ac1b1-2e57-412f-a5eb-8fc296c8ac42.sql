-- Add user_id column to conversations table (nullable for guest/existing data)
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);

-- Update RLS policies for conversations to support user-based access
-- Drop existing policies first
DROP POLICY IF EXISTS "Public can view conversations" ON public.conversations;
DROP POLICY IF EXISTS "Public can create conversations" ON public.conversations;
DROP POLICY IF EXISTS "Public can update conversations" ON public.conversations;
DROP POLICY IF EXISTS "Public can delete conversations" ON public.conversations;

-- Create new policies: users can only access their own conversations
CREATE POLICY "Users can view their own conversations" 
ON public.conversations 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own conversations" 
ON public.conversations 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own conversations" 
ON public.conversations 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own conversations" 
ON public.conversations 
FOR DELETE 
USING (user_id = auth.uid());

-- Also update chat_messages to only allow access via conversation owner
DROP POLICY IF EXISTS "Public can view messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Public can create messages" ON public.chat_messages;

CREATE POLICY "Users can view messages in their conversations" 
ON public.chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = chat_messages.conversation_id 
    AND conversations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in their conversations" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = chat_messages.conversation_id 
    AND conversations.user_id = auth.uid()
  )
);

-- Update generated_images policies similarly
DROP POLICY IF EXISTS "Public can view images" ON public.generated_images;
DROP POLICY IF EXISTS "Public can create images" ON public.generated_images;

CREATE POLICY "Users can view images in their conversations" 
ON public.generated_images 
FOR SELECT 
USING (
  conversation_id IS NULL OR
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = generated_images.conversation_id 
    AND conversations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create images in their conversations" 
ON public.generated_images 
FOR INSERT 
WITH CHECK (
  conversation_id IS NULL OR
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE conversations.id = generated_images.conversation_id 
    AND conversations.user_id = auth.uid()
  )
);