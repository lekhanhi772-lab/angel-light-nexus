import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MessageSquare, User, Calendar, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MessageThread } from './MessageThread';

interface Conversation {
  id: string;
  title: string | null;
  user_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Profile {
  user_id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface MessageCount {
  conversation_id: string;
  count: number;
}

export const ConversationList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

  const { data: conversations, isLoading: convsLoading } = useQuery({
    queryKey: ['admin-conversations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as Conversation[];
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ['admin-profiles-for-convs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, email, avatar_url');
      
      if (error) throw error;
      return data as Profile[];
    },
  });

  const { data: messageCounts } = useQuery({
    queryKey: ['admin-message-counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('conversation_id');
      
      if (error) throw error;
      
      // Count messages per conversation
      const counts: Record<string, number> = {};
      data.forEach(msg => {
        counts[msg.conversation_id] = (counts[msg.conversation_id] || 0) + 1;
      });
      
      return Object.entries(counts).map(([conversation_id, count]) => ({
        conversation_id,
        count,
      })) as MessageCount[];
    },
  });

  const getProfileForUser = (userId: string | null): Profile | null => {
    if (!userId) return null;
    return profiles?.find(p => p.user_id === userId) || null;
  };

  const getMessageCount = (conversationId: string): number => {
    return messageCounts?.find(mc => mc.conversation_id === conversationId)?.count || 0;
  };

  const filteredConversations = conversations?.filter(conv => {
    const searchLower = searchTerm.toLowerCase();
    const profile = getProfileForUser(conv.user_id);
    return (
      conv.title?.toLowerCase().includes(searchLower) ||
      profile?.display_name?.toLowerCase().includes(searchLower) ||
      profile?.email?.toLowerCase().includes(searchLower)
    );
  });

  if (convsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#DAA520] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7355]" />
        <Input
          placeholder="Tìm kiếm theo tiêu đề hoặc tên user..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/80 border-[#DAA520]/30 focus:border-[#DAA520]"
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-[#8B7355]">
        <span>Tổng: <strong className="text-[#8B6914]">{conversations?.length || 0}</strong> cuộc trò chuyện</span>
        <span>Tổng tin nhắn: <strong className="text-[#8B6914]">{messageCounts?.reduce((sum, mc) => sum + mc.count, 0) || 0}</strong></span>
      </div>

      {/* Conversation Cards */}
      <div className="grid gap-3">
        {filteredConversations?.map((conv) => {
          const profile = getProfileForUser(conv.user_id);
          const messageCount = getMessageCount(conv.id);
          
          return (
            <Card 
              key={conv.id} 
              className="bg-white/80 border-[#DAA520]/20 hover:border-[#DAA520]/50 transition-colors cursor-pointer"
              onClick={() => setSelectedConversation(conv)}
            >
              <CardContent className="flex items-center gap-4 py-4">
                {/* User Avatar */}
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name || 'User'}
                    className="w-10 h-10 rounded-full border-2 border-[#DAA520] flex-shrink-0"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #DAA520 0%, #FFA500 100%)' }}
                  >
                    {(profile?.display_name || profile?.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#8B6914] truncate">
                      {conv.title || 'Cuộc trò chuyện mới'}
                    </h3>
                    <Badge variant="outline" className="border-[#DAA520]/50 text-[#8B7355] text-xs flex-shrink-0">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      {messageCount}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#8B7355]">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {profile?.display_name || profile?.email?.split('@')[0] || 'Unknown'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(conv.updated_at), 'dd/MM/yyyy HH:mm', { locale: vi })}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-[#DAA520] flex-shrink-0" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredConversations?.length === 0 && (
        <div className="text-center py-12 text-[#8B7355]">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Không tìm thấy cuộc trò chuyện nào</p>
        </div>
      )}

      {/* Message Thread Dialog */}
      <Dialog open={!!selectedConversation} onOpenChange={() => setSelectedConversation(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden bg-[#FFFBE6]">
          <DialogHeader>
            <DialogTitle className="text-[#8B6914] flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {selectedConversation?.title || 'Cuộc trò chuyện'}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            {selectedConversation && (
              <MessageThread 
                conversationId={selectedConversation.id} 
                profile={getProfileForUser(selectedConversation.user_id)}
              />
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};
