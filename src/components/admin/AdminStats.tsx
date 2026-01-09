import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, MessagesSquare, Crown, TrendingUp } from 'lucide-react';

export const AdminStats = () => {
  const { data: profilesCount } = useQuery({
    queryKey: ['admin-stats-profiles'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: conversationsCount } = useQuery({
    queryKey: ['admin-stats-conversations'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: messagesCount } = useQuery({
    queryKey: ['admin-stats-messages'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: adminsCount } = useQuery({
    queryKey: ['admin-stats-admins'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');
      
      if (error) throw error;
      return count || 0;
    },
  });

  const stats = [
    {
      title: 'Tổng Users',
      value: profilesCount ?? '...',
      icon: Users,
      color: '#DAA520',
    },
    {
      title: 'Cuộc trò chuyện',
      value: conversationsCount ?? '...',
      icon: MessageSquare,
      color: '#FFA500',
    },
    {
      title: 'Tin nhắn',
      value: messagesCount ?? '...',
      icon: MessagesSquare,
      color: '#B8860B',
    },
    {
      title: 'Admins',
      value: adminsCount ?? '...',
      icon: Crown,
      color: '#8B6914',
    },
  ];

  const avgMessagesPerConv = conversationsCount && conversationsCount > 0 
    ? Math.round((messagesCount || 0) / conversationsCount) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="bg-white/80 border-[#DAA520]/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#8B7355]">
                {stat.title}
              </CardTitle>
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" style={{ color: stat.color }}>
                {stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Insights */}
      <Card className="bg-white/80 border-[#DAA520]/20">
        <CardHeader>
          <CardTitle className="text-lg text-[#8B6914] flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Thông tin bổ sung
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2 border-b border-[#DAA520]/10">
            <span className="text-[#8B7355]">Trung bình tin nhắn/cuộc trò chuyện</span>
            <span className="font-semibold text-[#8B6914]">{avgMessagesPerConv}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#DAA520]/10">
            <span className="text-[#8B7355]">Users đã chat với Angel AI</span>
            <span className="font-semibold text-[#8B6914]">
              {conversationsCount || 0} / {profilesCount || 0}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-[#8B7355]">Tỷ lệ users hoạt động</span>
            <span className="font-semibold text-[#8B6914]">
              {profilesCount && profilesCount > 0 
                ? Math.round(((conversationsCount || 0) / profilesCount) * 100)
                : 0}%
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
