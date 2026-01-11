import { useState, useEffect } from 'react';
import { BarChart3, MessageCircle, Image, Calendar, TrendingUp, Flame, BookMarked } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBookmarks } from '@/hooks/useBookmarks';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslation } from 'react-i18next';

interface Stats {
  totalMessages: number;
  totalImages: number;
  daysSinceJoined: number;
  streak: number;
  forumPosts: number;
  forumComments: number;
}

interface DailyActivity {
  day: string;
  messages: number;
}

const StatisticsDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { bookmarks } = useBookmarks();
  const [stats, setStats] = useState<Stats>({
    totalMessages: 0,
    totalImages: 0,
    daysSinceJoined: 0,
    streak: 0,
    forumPosts: 0,
    forumComments: 0,
  });
  const [weeklyActivity, setWeeklyActivity] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get conversations for this user
        const { data: conversations } = await supabase
          .from('conversations')
          .select('id, created_at')
          .eq('user_id', user.id);

        let totalMessages = 0;
        let dailyMessageCounts: Record<string, number> = {};

        if (conversations && conversations.length > 0) {
          const conversationIds = conversations.map(c => c.id);
          
          // Get messages count
          const { data: messages } = await supabase
            .from('chat_messages')
            .select('created_at')
            .in('conversation_id', conversationIds)
            .eq('role', 'user');

          totalMessages = messages?.length || 0;

          // Calculate daily activity for the last 7 days
          const now = new Date();
          for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateKey = date.toISOString().split('T')[0];
            dailyMessageCounts[dateKey] = 0;
          }

          messages?.forEach(msg => {
            const dateKey = new Date(msg.created_at).toISOString().split('T')[0];
            if (dailyMessageCounts.hasOwnProperty(dateKey)) {
              dailyMessageCounts[dateKey]++;
            }
          });
        }

        // Get images count
        const { count: imageCount } = await supabase
          .from('generated_images')
          .select('*', { count: 'exact', head: true });

        // Get forum stats
        const { count: postCount } = await supabase
          .from('forum_posts')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', user.id);

        const { count: commentCount } = await supabase
          .from('forum_comments')
          .select('*', { count: 'exact', head: true })
          .eq('author_id', user.id);

        // Calculate days since joined
        const createdAt = user.created_at;
        const daysSinceJoined = createdAt
          ? Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        // Calculate streak (consecutive days with activity)
        let streak = 0;
        const sortedDates = Object.entries(dailyMessageCounts)
          .sort(([a], [b]) => b.localeCompare(a));
        
        for (const [, count] of sortedDates) {
          if (count > 0) streak++;
          else break;
        }

        setStats({
          totalMessages,
          totalImages: imageCount || 0,
          daysSinceJoined: Math.max(1, daysSinceJoined),
          streak,
          forumPosts: postCount || 0,
          forumComments: commentCount || 0,
        });

        // Format weekly activity for chart
        const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const activity = Object.entries(dailyMessageCounts).map(([date, messages]) => ({
          day: days[new Date(date).getDay()],
          messages,
        }));
        setWeeklyActivity(activity);

      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-3 border-[#DAA520] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { icon: MessageCircle, value: stats.totalMessages, label: t('stats.messages', 'Messages') },
    { icon: Image, value: stats.totalImages, label: t('stats.images', 'Images') },
    { icon: Flame, value: stats.streak, label: t('stats.streak', 'Day Streak') },
    { icon: BookMarked, value: bookmarks.length, label: t('stats.bookmarks', 'Bookmarks') },
  ];

  return (
    <div 
      className="p-6 rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.98) 0%, rgba(255, 248, 220, 0.98) 100%)',
        border: '1px solid rgba(218, 165, 32, 0.3)',
      }}
    >
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5" style={{ color: '#DAA520' }} />
        <h3 className="text-lg font-bold" style={{ color: '#B8860B' }}>
          {t('stats.title', 'Activity Statistics')}
        </h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="p-4 rounded-xl text-center"
            style={{
              background: 'rgba(255, 255, 255, 0.6)',
              border: '1px solid rgba(218, 165, 32, 0.2)',
            }}
          >
            <stat.icon className="w-6 h-6 mx-auto mb-2" style={{ color: '#DAA520' }} />
            <p className="text-2xl font-bold" style={{ color: '#B8860B' }}>
              {stat.value}
            </p>
            <p className="text-xs" style={{ color: '#8B6914' }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Weekly Activity Chart */}
      <div 
        className="p-4 rounded-xl"
        style={{
          background: 'rgba(255, 255, 255, 0.5)',
          border: '1px solid rgba(218, 165, 32, 0.15)',
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4" style={{ color: '#B8860B' }} />
          <span className="text-sm font-medium" style={{ color: '#B8860B' }}>
            {t('stats.weekly_activity', 'Weekly Activity')}
          </span>
        </div>
        
        <div className="h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyActivity}>
              <XAxis 
                dataKey="day" 
                tick={{ fill: '#8B6914', fontSize: 12 }}
                axisLine={{ stroke: '#DAA520', strokeOpacity: 0.3 }}
                tickLine={false}
              />
              <YAxis 
                hide 
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: '#FFFBE6',
                  border: '1px solid #DAA520',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
                labelStyle={{ color: '#B8860B', fontWeight: 'bold' }}
              />
              <Bar 
                dataKey="messages" 
                fill="url(#goldGradient)" 
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#DAA520" />
                  <stop offset="100%" stopColor="#B8860B" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forum Activity */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <div
          className="p-4 rounded-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(218, 165, 32, 0.15)',
          }}
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" style={{ color: '#DAA520' }} />
            <span className="text-2xl font-bold" style={{ color: '#B8860B' }}>
              {stats.daysSinceJoined}
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: '#8B6914' }}>
            {t('stats.days_joined', 'Days with Angel')}
          </p>
        </div>
        <div
          className="p-4 rounded-xl"
          style={{
            background: 'rgba(255, 255, 255, 0.5)',
            border: '1px solid rgba(218, 165, 32, 0.15)',
          }}
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" style={{ color: '#DAA520' }} />
            <span className="text-2xl font-bold" style={{ color: '#B8860B' }}>
              {stats.forumPosts + stats.forumComments}
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: '#8B6914' }}>
            {t('stats.forum_activity', 'Forum Activity')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatisticsDashboard;
