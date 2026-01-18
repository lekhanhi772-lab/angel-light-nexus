import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

interface SharedConversation {
  id: string;
  conversation_id: string;
  user_id: string;
  share_token: string;
  title: string | null;
  is_public: boolean;
  forum_post_id: string | null;
  created_at: string;
  expires_at: string | null;
}

// Discussion category ID
const DISCUSSION_CATEGORY_ID = '73c93754-b86e-4282-b070-7e072dd11d5e';

// Generate a random token for sharing
const generateShareToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Format messages to display in forum post
const formatMessagesForForum = (messages: Message[]): string => {
  return messages.map(msg => {
    const role = msg.role === 'user' ? '👤 **Người dùng:**' : '✨ **Angel AI:**';
    let content = `${role}\n${msg.content}`;
    if (msg.imageUrl) {
      content += `\n\n![Generated Image](${msg.imageUrl})`;
    }
    return content;
  }).join('\n\n---\n\n');
};

export const useShareConversation = () => {
  const { t } = useTranslation();
  const [isSharing, setIsSharing] = useState(false);

  // Share conversation via public link
  const shareViaLink = async (
    conversationId: string,
    userId: string,
    title?: string
  ): Promise<string | null> => {
    setIsSharing(true);
    try {
      const shareToken = generateShareToken();
      
      const { data, error } = await supabase
        .from('shared_conversations')
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          share_token: shareToken,
          title: title || null,
          is_public: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error sharing conversation:', error);
        toast.error(t('shareConversation.shareError'));
        return null;
      }

      const shareUrl = `${window.location.origin}/shared/${shareToken}`;
      
      // Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(t('shareConversation.linkCopied'));
      } catch {
        toast.success(t('shareConversation.linkCreated'));
      }

      return shareUrl;
    } catch (error) {
      console.error('Share via link error:', error);
      toast.error(t('shareConversation.shareError'));
      return null;
    } finally {
      setIsSharing(false);
    }
  };

  // Share conversation to forum
  const shareToForum = async (
    conversationId: string,
    userId: string,
    messages: Message[],
    title: string
  ): Promise<string | null> => {
    setIsSharing(true);
    try {
      const shareToken = generateShareToken();
      const formattedContent = formatMessagesForForum(messages);
      
      // Create forum post first
      const { data: forumPost, error: forumError } = await supabase
        .from('forum_posts')
        .insert({
          author_id: userId,
          category_id: DISCUSSION_CATEGORY_ID,
          title: title,
          content: `📝 **Chia sẻ hội thoại với Angel AI:**\n\n${formattedContent}`,
          is_pinned: false,
        })
        .select()
        .single();

      if (forumError) {
        console.error('Error creating forum post:', forumError);
        toast.error(t('shareConversation.forumError'));
        return null;
      }

      // Create shared conversation record
      const { error: shareError } = await supabase
        .from('shared_conversations')
        .insert({
          conversation_id: conversationId,
          user_id: userId,
          share_token: shareToken,
          title: title,
          is_public: true,
          forum_post_id: forumPost.id,
        });

      if (shareError) {
        console.error('Error creating share record:', shareError);
        // Post was created but share record failed - still redirect to post
      }

      toast.success(t('shareConversation.postedToForum'));
      return forumPost.id;
    } catch (error) {
      console.error('Share to forum error:', error);
      toast.error(t('shareConversation.forumError'));
      return null;
    } finally {
      setIsSharing(false);
    }
  };

  // Get shared conversation by token
  const getSharedConversation = async (shareToken: string) => {
    try {
      const { data: shared, error: sharedError } = await supabase
        .from('shared_conversations')
        .select('*')
        .eq('share_token', shareToken)
        .eq('is_public', true)
        .single();

      if (sharedError || !shared) {
        return { shared: null, messages: [], sharer: null };
      }

      // Get messages for this conversation
      const { data: messages, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', shared.conversation_id)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('Error fetching messages:', messagesError);
        return { shared, messages: [], sharer: null };
      }

      // Get sharer profile
      const { data: sharer } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', shared.user_id)
        .single();

      return {
        shared: shared as SharedConversation,
        messages: messages?.map(m => ({
          id: m.id,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          imageUrl: m.image_url || undefined,
        })) || [],
        sharer,
      };
    } catch (error) {
      console.error('Get shared conversation error:', error);
      return { shared: null, messages: [], sharer: null };
    }
  };

  // Delete a shared conversation
  const deleteShare = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('shared_conversations')
        .delete()
        .eq('id', shareId);

      if (error) {
        toast.error('Không thể xóa share');
        return false;
      }

      toast.success('Đã xóa link chia sẻ');
      return true;
    } catch {
      return false;
    }
  };

  return {
    isSharing,
    shareViaLink,
    shareToForum,
    getSharedConversation,
    deleteShare,
  };
};
