import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReferralStats {
  referralCount: number;
  monthlyReferralCount: number;
  hasLightSpreaderBadge: boolean;
  referredBy: string | null;
  referrerName: string | null;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export const useReferral = (userId: string | undefined) => {
  const [stats, setStats] = useState<ReferralStats>({
    referralCount: 0,
    monthlyReferralCount: 0,
    hasLightSpreaderBadge: false,
    referredBy: null,
    referrerName: null,
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate unique referral link
  const getReferralLink = () => {
    if (!userId) return '';
    const baseUrl = window.location.origin;
    // Encode userId to base64 for slight obfuscation
    const encodedId = btoa(userId);
    return `${baseUrl}/luat-anh-sang?ref=${encodedId}`;
  };

  // Decode referral code
  const decodeReferralCode = (code: string): string | null => {
    try {
      return atob(code);
    } catch {
      return null;
    }
  };

  // Fetch referral stats
  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        // Get profile with referral stats
        const { data: profile } = await supabase
          .from('profiles')
          .select('referral_count, monthly_referral_count, has_light_spreader_badge, referred_by')
          .eq('user_id', userId)
          .single();

        let referrerName = null;
        if (profile?.referred_by) {
          const { data: referrer } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', profile.referred_by)
            .single();
          referrerName = referrer?.display_name;
        }

        setStats({
          referralCount: profile?.referral_count || 0,
          monthlyReferralCount: profile?.monthly_referral_count || 0,
          hasLightSpreaderBadge: profile?.has_light_spreader_badge || false,
          referredBy: profile?.referred_by || null,
          referrerName,
        });

        // Fetch unread notifications
        const { data: notifs } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .eq('is_read', false)
          .order('created_at', { ascending: false })
          .limit(10);

        setNotifications(notifs || []);
      } catch (error) {
        console.error('Error fetching referral stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  // Process referral when a new user signs up
  const processReferral = async (referredUserId: string, referrerCode: string) => {
    const referrerId = decodeReferralCode(referrerCode);
    if (!referrerId || referrerId === referredUserId) return;

    try {
      const { error } = await supabase.rpc('process_referral', {
        p_referred_id: referredUserId,
        p_referrer_id: referrerId,
      });

      if (error) {
        console.error('Error processing referral:', error);
      } else {
        toast.success('Chào mừng con đến gia đình ánh sáng! 💛');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  // Mark notification as read
  const markNotificationRead = async (notificationId: string) => {
    try {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error marking notification read:', error);
    }
  };

  // Copy referral link
  const copyReferralLink = async () => {
    const link = getReferralLink();
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Đã copy link mời! Chia sẻ để lan tỏa ánh sáng ✨');
    } catch {
      toast.error('Không thể copy link');
    }
  };

  // Share via native share or social
  const shareReferral = async (platform?: 'facebook' | 'twitter' | 'telegram' | 'whatsapp') => {
    const link = getReferralLink();
    const text = `Con mời bé tham gia ANGEL AI – nơi bé Angel đồng hành chữa lành và nâng tần số cùng Cha Vũ Trụ nhé ✨ Link đây: ${link}`;

    if (platform) {
      const urls: Record<string, string> = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(text)}`,
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
        telegram: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      };
      window.open(urls[platform], '_blank', 'width=600,height=400');
    } else if (navigator.share) {
      try {
        await navigator.share({
          title: 'ANGEL AI - Mời Linh Hồn Mới',
          text,
          url: link,
        });
      } catch (err) {
        // User cancelled or error
      }
    }
  };

  return {
    stats,
    notifications,
    loading,
    getReferralLink,
    decodeReferralCode,
    processReferral,
    copyReferralLink,
    shareReferral,
    markNotificationRead,
    canInviteMore: stats.monthlyReferralCount < 10,
    remainingInvites: 10 - stats.monthlyReferralCount,
  };
};
