-- Admin can view all conversations
CREATE POLICY "Admins can view all conversations" 
ON public.conversations 
FOR SELECT 
USING (is_admin());

-- Admin can view all chat messages
CREATE POLICY "Admins can view all messages" 
ON public.chat_messages 
FOR SELECT 
USING (is_admin());