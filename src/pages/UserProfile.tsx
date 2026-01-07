import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useForum, ForumPost } from '@/hooks/useForum';
import { ForumPostCard } from '@/components/forum/ForumPostCard';
import { GiftDialog } from '@/components/GiftDialog';
import { Web3Provider } from '@/components/Web3Provider';
import { ArrowLeft, Sparkles, Calendar, MessageCircle, Gift, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UserProfileData {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  wallet_address: string | null;
  created_at: string;
  has_light_spreader_badge: boolean | null;
}

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [userPosts, setUserPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGiftDialog, setShowGiftDialog] = useState(false);
  const [postStats, setPostStats] = useState({ postsCount: 0, totalLikes: 0 });
  
  const { posts, toggleLike, deletePost } = useForum();
  
  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch user's posts
        const { data: postsData, error: postsError } = await supabase
          .from('forum_posts')
          .select('*')
          .eq('author_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!postsError && postsData) {
          // Get categories for posts
          const categoryIds = [...new Set(postsData.filter(p => p.category_id).map(p => p.category_id))];
          const { data: categories } = categoryIds.length > 0
            ? await supabase.from('forum_categories').select('id, name, icon').in('id', categoryIds)
            : { data: [] };

          const categoryMap = new Map((categories || []).map(c => [c.id, c]));

          const postsWithDetails: ForumPost[] = postsData.map(post => ({
            ...post,
            author: { display_name: profileData?.display_name, avatar_url: profileData?.avatar_url, wallet_address: profileData?.wallet_address },
            category: post.category_id ? categoryMap.get(post.category_id) : undefined,
          }));

          setUserPosts(postsWithDetails);
          
          // Calculate stats
          const totalLikes = postsData.reduce((sum, p) => sum + p.likes_count, 0);
          setPostStats({ postsCount: postsData.length, totalLikes });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  // Calculate days since joined
  const daysSinceJoined = profile?.created_at
    ? Math.max(1, Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #FFFBE6 0%, #FFF8DC 100%)' }}>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#DAA520' }} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: 'linear-gradient(180deg, #FFFBE6 0%, #FFF8DC 100%)' }}>
        <p className="text-lg mb-4" style={{ color: '#8B6914' }}>{t('user_profile.not_found', 'Không tìm thấy người dùng')}</p>
        <Button onClick={() => navigate(-1)} variant="outline" style={{ borderColor: '#DAA520', color: '#8B6914' }}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('forum.back_to_forum')}
        </Button>
      </div>
    );
  }

  return (
    <Web3Provider>
      <div 
        className="min-h-screen py-8 px-4 relative overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #FFFBE6 0%, #FFF8DC 50%, #FFFACD 100%)' }}
      >
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
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
          {/* Back button */}
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="mb-6"
            style={{ color: '#8B6914' }}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('user_profile.back', 'Quay lại')}
          </Button>

          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div 
              className="relative rounded-full p-1 mb-4"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #DAA520 50%, #FFD700 100%)',
                boxShadow: '0 0 30px rgba(218, 165, 32, 0.3)',
              }}
            >
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name || 'User'}
                  className="w-28 h-28 rounded-full object-cover"
                />
              ) : (
                <div 
                  className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)' }}
                >
                  {(profile.display_name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Light Spreader Badge */}
              {profile.has_light_spreader_badge && (
                <div 
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', boxShadow: '0 0 10px rgba(255, 215, 0, 0.5)' }}
                  title={t('user_profile.light_spreader', 'Người Lan Tỏa Ánh Sáng')}
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            
            <h2 className="text-2xl font-bold mb-1" style={{ color: '#B8860B' }}>
              {profile.display_name || t('forum.anonymous')}
            </h2>
            
            {profile.has_light_spreader_badge && (
              <span 
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mb-4"
                style={{ background: 'rgba(255, 215, 0, 0.2)', color: '#B8860B' }}
              >
                <Sparkles className="w-3 h-3" />
                {t('user_profile.light_spreader', 'Người Lan Tỏa Ánh Sáng')}
              </span>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div 
              className="p-4 rounded-2xl text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.95) 0%, rgba(255, 248, 220, 0.95) 100%)',
                border: '1px solid rgba(218, 165, 32, 0.3)',
              }}
            >
              <Calendar className="w-6 h-6 mx-auto mb-1" style={{ color: '#DAA520' }} />
              <p className="text-xl font-bold" style={{ color: '#B8860B' }}>{daysSinceJoined}</p>
              <p className="text-xs" style={{ color: '#8B6914' }}>{t('user_profile.days', 'ngày')}</p>
            </div>
            
            <div 
              className="p-4 rounded-2xl text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.95) 0%, rgba(255, 248, 220, 0.95) 100%)',
                border: '1px solid rgba(218, 165, 32, 0.3)',
              }}
            >
              <MessageCircle className="w-6 h-6 mx-auto mb-1" style={{ color: '#DAA520' }} />
              <p className="text-xl font-bold" style={{ color: '#B8860B' }}>{postStats.postsCount}</p>
              <p className="text-xs" style={{ color: '#8B6914' }}>{t('user_profile.posts', 'bài viết')}</p>
            </div>
            
            <div 
              className="p-4 rounded-2xl text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.95) 0%, rgba(255, 248, 220, 0.95) 100%)',
                border: '1px solid rgba(218, 165, 32, 0.3)',
              }}
            >
              <Sparkles className="w-6 h-6 mx-auto mb-1" style={{ color: '#DAA520' }} />
              <p className="text-xl font-bold" style={{ color: '#B8860B' }}>{postStats.totalLikes}</p>
              <p className="text-xs" style={{ color: '#8B6914' }}>{t('forum.likes', 'Thích')}</p>
            </div>
          </div>

          {/* Gift Button - only show for other users with wallet */}
          {!isOwnProfile && profile.wallet_address && (
            <Button
              onClick={() => setShowGiftDialog(true)}
              className="w-full mb-8 text-white py-6 text-lg"
              style={{
                background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
                boxShadow: '0 4px 15px rgba(218, 165, 32, 0.3)',
              }}
            >
              <Gift className="w-5 h-5 mr-2" />
              {t('user_profile.send_gift', 'Tặng Quà Ánh Sáng')} ✨
            </Button>
          )}

          {/* No wallet message */}
          {!isOwnProfile && !profile.wallet_address && (
            <div 
              className="p-4 rounded-2xl text-center mb-8"
              style={{
                background: 'rgba(255, 251, 230, 0.8)',
                border: '1px dashed rgba(218, 165, 32, 0.4)',
              }}
            >
              <Gift className="w-8 h-8 mx-auto mb-2" style={{ color: '#DAA520', opacity: 0.5 }} />
              <p className="text-sm" style={{ color: '#8B7355' }}>
                {t('user_profile.no_wallet', 'Người dùng chưa kết nối ví để nhận quà')}
              </p>
            </div>
          )}

          {/* Recent Posts */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#B8860B' }}>
              <MessageCircle className="w-5 h-5" style={{ color: '#DAA520' }} />
              {t('user_profile.recent_posts', 'Bài viết gần đây')}
            </h3>
            
            {userPosts.length > 0 ? (
              <div className="grid gap-4">
                {userPosts.map((post) => (
                  <ForumPostCard
                    key={post.id}
                    post={post}
                    onLike={toggleLike}
                    onDelete={deletePost}
                    onEdit={() => {}}
                  />
                ))}
              </div>
            ) : (
              <div 
                className="text-center py-8 rounded-2xl"
                style={{
                  background: 'rgba(255, 251, 230, 0.8)',
                  border: '1px dashed rgba(218, 165, 32, 0.4)',
                }}
              >
                <p className="text-sm" style={{ color: '#8B7355' }}>
                  {t('user_profile.no_posts', 'Chưa có bài viết nào')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Gift Dialog */}
        <GiftDialog
          open={showGiftDialog}
          onOpenChange={setShowGiftDialog}
          recipientAddress={profile.wallet_address || ''}
          recipientName={profile.display_name || t('forum.anonymous')}
        />
      </div>
    </Web3Provider>
  );
}
