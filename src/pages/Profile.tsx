import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Web3Provider } from '@/components/Web3Provider';
import { WalletConnect } from '@/components/WalletConnect';
import { WalletBalances } from '@/components/WalletBalances';
import { Sparkles, MessageCircle, Calendar, ScrollText, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

// 8 câu thần chú
const MANTRAS = [
  "⭐️ Con là ánh sáng thiêng liêng của Cha Vũ Trụ",
  "⭐️ Con cho phép mọi buồn lo tan biến ngay lúc này",
  "⭐️ Con là dòng chảy của tình yêu vô điều kiện",
  "⭐️ Con mở lòng đón nhận mọi phước lành đang đến",
  "⭐️ Con tin vào hành trình thiêng liêng của linh hồn mình",
  "⭐️ Con kết nối sâu sắc với năng lượng vũ trụ bao la",
  "⭐️ Con chọn bình an và hạnh phúc trong từng khoảnh khắc",
  "⭐️ Con biết ơn tất cả những gì đã, đang và sẽ đến với mình"
];

const Profile = () => {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  
  const [chatStats, setChatStats] = useState({ totalMessages: 0, daysSinceJoined: 0 });
  const [recentMessages, setRecentMessages] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      toast.info("Con đăng nhập để mở ngôi nhà ánh sáng riêng nhé 💛");
      navigate('/luat-anh-sang?action=register');
    }
  }, [user, loading, navigate]);

  // Fetch chat stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Get total messages
        const { count: messageCount } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'user');

        // Get conversations for this user
        const { data: conversations } = await supabase
          .from('conversations')
          .select('id')
          .eq('user_id', user.id);

        let userMessageCount = 0;
        if (conversations && conversations.length > 0) {
          const conversationIds = conversations.map(c => c.id);
          const { count } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .in('conversation_id', conversationIds)
            .eq('role', 'user');
          userMessageCount = count || 0;
        }

        // Calculate days since joined
        const createdAt = user.created_at;
        const daysSinceJoined = createdAt 
          ? Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        setChatStats({
          totalMessages: userMessageCount,
          daysSinceJoined: Math.max(1, daysSinceJoined)
        });

        // Get recent messages
        if (conversations && conversations.length > 0) {
          const conversationIds = conversations.map(c => c.id);
          const { data: messages } = await supabase
            .from('chat_messages')
            .select('*')
            .in('conversation_id', conversationIds)
            .order('created_at', { ascending: false })
            .limit(20);
          
          setRecentMessages(messages || []);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [user, profile]);

  // Save wallet address to profile
  const handleWalletChange = async (address: string | null) => {
    setWalletConnected(!!address);
    
    if (!user || !address) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ wallet_address: address })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving wallet:', error);
      } else {
        toast.success('Đã lưu ví ánh sáng của con! ✨');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFFBE6 0%, #FFF8DC 100%)' }}>
        <div className="w-10 h-10 border-4 border-[#DAA520] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Web3Provider>
      <div 
        className="min-h-screen py-8 px-4 relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(180deg, #FFFBE6 0%, #FFF8DC 50%, #FFFACD 100%)',
        }}
      >
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full animate-pulse"
              style={{
                background: 'radial-gradient(circle, rgba(218,165,32,0.6) 0%, transparent 70%)',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6" style={{ color: '#DAA520' }} />
              <span style={{ color: '#B8860B' }}>✦</span>
              <Sparkles className="w-6 h-6" style={{ color: '#DAA520' }} />
            </div>
            <h1 
              className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2"
              style={{ 
                fontFamily: "'Playfair Display', serif",
                color: '#B8860B',
              }}
            >
              Hành Trình Ánh Sáng Của Con ✨
            </h1>
          </div>

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div 
              className="relative rounded-full p-1 mb-4"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #DAA520 50%, #FFD700 100%)',
                boxShadow: '0 0 30px rgba(218, 165, 32, 0.3)',
              }}
            >
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name || 'User'}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover"
                />
              ) : (
                <div 
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)' }}
                >
                  {(profile?.display_name || profile?.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h2 
              className="text-xl sm:text-2xl font-bold"
              style={{ color: '#B8860B' }}
            >
              {profile?.display_name || profile?.email?.split('@')[0] || 'Linh hồn ánh sáng'}
            </h2>
            <p 
              className="text-sm"
              style={{ color: '#8B6914' }}
            >
              {profile?.email || user.email}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div 
              className="p-4 rounded-2xl text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.95) 0%, rgba(255, 248, 220, 0.95) 100%)',
                border: '1px solid rgba(218, 165, 32, 0.3)',
              }}
            >
              <Calendar className="w-8 h-8 mx-auto mb-2" style={{ color: '#DAA520' }} />
              <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#B8860B' }}>
                {loadingStats ? '...' : chatStats.daysSinceJoined}
              </p>
              <p className="text-xs sm:text-sm" style={{ color: '#8B6914' }}>
                Ngày đồng hành với bé Angel
              </p>
            </div>
            
            <div 
              className="p-4 rounded-2xl text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.95) 0%, rgba(255, 248, 220, 0.95) 100%)',
                border: '1px solid rgba(218, 165, 32, 0.3)',
              }}
            >
              <MessageCircle className="w-8 h-8 mx-auto mb-2" style={{ color: '#DAA520' }} />
              <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#B8860B' }}>
                {loadingStats ? '...' : chatStats.totalMessages}
              </p>
              <p className="text-xs sm:text-sm" style={{ color: '#8B6914' }}>
                Lượt kết nối ánh sáng
              </p>
            </div>
          </div>

          {/* Web3 Wallet Section */}
          <div 
            className="p-6 rounded-2xl mb-8"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.98) 0%, rgba(255, 248, 220, 0.98) 100%)',
              border: '2px solid rgba(218, 165, 32, 0.5)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" style={{ color: '#DAA520' }} />
              <h3 className="text-lg font-bold" style={{ color: '#B8860B' }}>
                Ví Ánh Sáng Web3
              </h3>
            </div>
            <p className="text-sm mb-4" style={{ color: '#8B6914' }}>
              Kết nối ví để nhận Camly Coin và phước lành từ Vũ Trụ ✨
            </p>
            <WalletConnect onWalletChange={handleWalletChange} />
            
            {/* Wallet Balances - tự động hiển thị khi ví đã kết nối */}
            <div className="mt-6">
              <WalletBalances />
            </div>
          </div>

          {/* Recent Chat History */}
          <div 
            className="p-6 rounded-2xl mb-8"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.98) 0%, rgba(255, 248, 220, 0.98) 100%)',
              border: '1px solid rgba(218, 165, 32, 0.3)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <ScrollText className="w-5 h-5" style={{ color: '#DAA520' }} />
              <h3 className="text-lg font-bold" style={{ color: '#B8860B' }}>
                Lịch sử trò chuyện gần đây
              </h3>
            </div>
            
            {recentMessages.length > 0 ? (
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-3">
                  {recentMessages.map((msg, i) => (
                    <div 
                      key={msg.id || i}
                      className="p-3 rounded-xl text-sm"
                      style={{
                        background: msg.role === 'user' 
                          ? 'rgba(218, 165, 32, 0.1)' 
                          : 'rgba(255, 255, 255, 0.5)',
                        borderLeft: msg.role === 'user' 
                          ? '3px solid #DAA520' 
                          : '3px solid #B8860B',
                      }}
                    >
                      <p 
                        className="text-xs font-medium mb-1"
                        style={{ color: msg.role === 'user' ? '#DAA520' : '#B8860B' }}
                      >
                        {msg.role === 'user' ? 'Con' : 'Bé Angel'}
                      </p>
                      <p style={{ color: '#5a5a5a' }}>
                        {msg.content.substring(0, 100)}{msg.content.length > 100 ? '...' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <p className="text-sm text-center py-4" style={{ color: '#8B6914' }}>
                Chưa có lịch sử trò chuyện. Hãy bắt đầu hành trình với bé Angel! 💛
              </p>
            )}
          </div>

          {/* Mantras Section */}
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 hover:scale-[1.01]"
                style={{
                  background: 'linear-gradient(135deg, rgba(218, 165, 32, 0.15) 0%, rgba(255, 248, 220, 0.95) 100%)',
                  border: '1px solid rgba(218, 165, 32, 0.4)',
                }}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6" style={{ color: '#DAA520' }} />
                  <span className="font-bold" style={{ color: '#B8860B' }}>
                    Xem lại 8 Câu Thần Chú Ánh Sáng
                  </span>
                </div>
                <ChevronRight className="w-5 h-5" style={{ color: '#DAA520' }} />
              </button>
            </DialogTrigger>
            <DialogContent 
              className="max-w-lg"
              style={{
                background: 'linear-gradient(180deg, #FFFBE6 0%, #FFF8DC 100%)',
                border: '2px solid #DAA520',
              }}
            >
              <DialogHeader>
                <DialogTitle 
                  className="text-center text-xl font-bold"
                  style={{ color: '#B8860B' }}
                >
                  ✨ 8 Câu Thần Chú Ánh Sáng ✨
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 mt-4">
                {MANTRAS.map((mantra, i) => (
                  <p 
                    key={i}
                    className="text-sm p-3 rounded-xl italic"
                    style={{
                      background: 'rgba(218, 165, 32, 0.1)',
                      color: '#8B6914',
                    }}
                  >
                    {mantra}
                  </p>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Web3Provider>
  );
};

export default Profile;
