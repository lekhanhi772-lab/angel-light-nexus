import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { Web3Provider } from '@/components/Web3Provider';
import { WalletConnect } from '@/components/WalletConnect';
import { WalletBalances } from '@/components/WalletBalances';
import { ReferralCard } from '@/components/ReferralCard';
import { NotificationBell } from '@/components/NotificationBell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Wallet, Users, BarChart3, Bell } from 'lucide-react';
import { toast } from 'sonner';
import StatisticsDashboard from '@/components/StatisticsDashboard';
import NotificationSettings from '@/components/NotificationSettings';
import AwakeningDashboard from '@/components/AwakeningDashboard';

const Profile = () => {
  const { t } = useTranslation();
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  
  const [walletConnected, setWalletConnected] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      toast.info(t('profile.login_required') + ' 💛');
      navigate('/luat-anh-sang?action=register');
    }
  }, [user, loading, navigate, t]);

  // Track saved wallet to avoid duplicate saves/toasts
  const savedWalletRef = useRef<string | null>(profile?.wallet_address ?? null);
  const walletBonusAwarded = useRef(false);

  // Award wallet connection bonus
  const awardWalletBonus = async () => {
    if (walletBonusAwarded.current || !user) return;
    walletBonusAwarded.current = true;

    try {
      const { data, error } = await supabase.rpc('award_activity_points', {
        p_user_id: user.id,
        p_activity_type: 'wallet_connect',
        p_points: 30,
        p_metadata: {}
      });

      if (!error && data?.[0]?.success) {
        toast.success(t('profile.wallet_bonus'), {
          description: t('profile.wallet_connected'),
          duration: 5000,
          icon: '🎉',
        });
      }
    } catch (err) {
      console.error('Wallet bonus error:', err);
    }
  };

  // Save wallet address to profile
  const handleWalletChange = async (address: string | null) => {
    setWalletConnected(!!address);
    
    if (!user || !address) return;

    // Skip if already saved this wallet address
    if (savedWalletRef.current === address) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ wallet_address: address })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving wallet:', error);
      } else {
        // Award bonus only on first wallet connection
        if (!savedWalletRef.current) {
          awardWalletBonus();
        }
        savedWalletRef.current = address;
        toast.success(t('profile.wallet_saved') + ' ✨');
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
          {/* Header with Notification Bell */}
          <div className="flex justify-end mb-4">
            <NotificationBell userId={user?.id} />
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


          {/* Tabbed Content */}
          <Tabs defaultValue="awakening" className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6 h-auto p-1 bg-[#FFF8DC]/80 border border-[#DAA520]/30 rounded-xl">
              <TabsTrigger 
                value="awakening" 
                className="flex flex-col sm:flex-row items-center gap-1 py-2 px-2 text-[#8B6914] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FFD700]/20 data-[state=active]:to-[#DAA520]/20 data-[state=active]:text-[#B8860B] data-[state=active]:border data-[state=active]:border-[#DAA520]/50 rounded-lg transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">{t('profile.tabs.awakening')}</span>
                <span className="text-xs sm:hidden">✨</span>
              </TabsTrigger>
              <TabsTrigger 
                value="wallet" 
                className="flex flex-col sm:flex-row items-center gap-1 py-2 px-2 text-[#8B6914] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FFD700]/20 data-[state=active]:to-[#DAA520]/20 data-[state=active]:text-[#B8860B] data-[state=active]:border data-[state=active]:border-[#DAA520]/50 rounded-lg transition-all"
              >
                <Wallet className="w-4 h-4" />
                <span className="text-xs sm:text-sm">{t('profile.tabs.wallet')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="referral" 
                className="flex flex-col sm:flex-row items-center gap-1 py-2 px-2 text-[#8B6914] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FFD700]/20 data-[state=active]:to-[#DAA520]/20 data-[state=active]:text-[#B8860B] data-[state=active]:border data-[state=active]:border-[#DAA520]/50 rounded-lg transition-all"
              >
                <Users className="w-4 h-4" />
                <span className="text-xs sm:text-sm">{t('profile.tabs.referral')}</span>
              </TabsTrigger>
              <TabsTrigger 
                value="stats" 
                className="flex flex-col sm:flex-row items-center gap-1 py-2 px-2 text-[#8B6914] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FFD700]/20 data-[state=active]:to-[#DAA520]/20 data-[state=active]:text-[#B8860B] data-[state=active]:border data-[state=active]:border-[#DAA520]/50 rounded-lg transition-all"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">{t('profile.tabs.stats')}</span>
                <span className="text-xs sm:hidden">📊</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="flex flex-col sm:flex-row items-center gap-1 py-2 px-2 text-[#8B6914] data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#FFD700]/20 data-[state=active]:to-[#DAA520]/20 data-[state=active]:text-[#B8860B] data-[state=active]:border data-[state=active]:border-[#DAA520]/50 rounded-lg transition-all"
              >
                <Bell className="w-4 h-4" />
                <span className="text-xs sm:text-sm hidden sm:inline">{t('profile.tabs.notifications')}</span>
                <span className="text-xs sm:hidden">🔔</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab: Awakening */}
            <TabsContent value="awakening" className="mt-0">
              <AwakeningDashboard />
            </TabsContent>

            {/* Tab: Wallet */}
            <TabsContent value="wallet" className="mt-0">
              <div 
                className="p-6 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.98) 0%, rgba(255, 248, 220, 0.98) 100%)',
                  border: '2px solid rgba(218, 165, 32, 0.5)',
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5" style={{ color: '#DAA520' }} />
                  <h3 className="text-lg font-bold" style={{ color: '#B8860B' }}>
                    {t('profile.web3_wallet')}
                  </h3>
                </div>
                <p className="text-sm mb-4" style={{ color: '#8B6914' }}>
                  {t('profile.web3_description')} ✨
                </p>
                <WalletConnect onWalletChange={handleWalletChange} />
                
                <div className="mt-6">
                  <WalletBalances />
                </div>
              </div>
            </TabsContent>

            {/* Tab: Referral */}
            <TabsContent value="referral" className="mt-0">
              <ReferralCard userId={user?.id} />
            </TabsContent>

            {/* Tab: Statistics */}
            <TabsContent value="stats" className="mt-0">
              <StatisticsDashboard />
            </TabsContent>

            {/* Tab: Notifications */}
            <TabsContent value="notifications" className="mt-0">
              <NotificationSettings />
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </Web3Provider>
  );
};

export default Profile;
