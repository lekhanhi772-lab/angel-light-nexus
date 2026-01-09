import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { User, Bot } from 'lucide-react';
import angelAvatar from '@/assets/angel-avatar.png';

interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
  image_url: string | null;
}

interface Profile {
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface MessageThreadProps {
  conversationId: string;
  profile: Profile | null;
}

export const MessageThread = ({ conversationId, profile }: MessageThreadProps) => {
  const { data: messages, isLoading } = useQuery({
    queryKey: ['admin-messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as Message[];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-4 border-[#DAA520] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!messages?.length) {
    return (
      <div className="text-center py-12 text-[#8B7355]">
        <p>Chưa có tin nhắn nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {messages.map((message) => {
        const isUser = message.role === 'user';
        
        return (
          <div
            key={message.id}
            className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            {isUser ? (
              profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="User"
                  className="w-8 h-8 rounded-full border border-[#DAA520] flex-shrink-0"
                />
              ) : (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #DAA520 0%, #FFA500 100%)' }}
                >
                  <User className="w-4 h-4" />
                </div>
              )
            ) : (
              <img
                src={angelAvatar}
                alt="Angel AI"
                className="w-8 h-8 rounded-full border border-[#DAA520] flex-shrink-0"
              />
            )}

            {/* Message Content */}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                isUser
                  ? 'bg-gradient-to-r from-[#DAA520] to-[#FFA500] text-white'
                  : 'bg-white border border-[#DAA520]/20'
              }`}
            >
              <div className={`text-sm whitespace-pre-wrap ${isUser ? 'text-white' : 'text-[#8B6914]'}`}>
                {message.content}
              </div>
              
              {message.image_url && (
                <img
                  src={message.image_url}
                  alt="Attached image"
                  className="mt-2 rounded-lg max-w-full"
                />
              )}
              
              <div className={`text-xs mt-1 ${isUser ? 'text-white/70' : 'text-[#8B7355]/70'}`}>
                {format(new Date(message.created_at), 'dd/MM HH:mm', { locale: vi })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
