import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart, MessageCircle, Clock, Loader2, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ForumPost, ForumComment, useForum } from '@/hooks/useForum';
import { useAuth } from '@/hooks/useAuth';
import { CommentSection } from '@/components/forum/CommentSection';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS, fr, ja, ko } from 'date-fns/locale';

const localeMap: Record<string, any> = {
  vi,
  en: enUS,
  fr,
  ja,
  ko
};

export default function ForumPostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toggleLike, fetchComments, createComment, deleteComment } = useForum();

  const [post, setPost] = useState<ForumPost | null>(null);
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [loading, setLoading] = useState(true);

  const locale = localeMap[i18n.language] || vi;

  const fetchPost = useCallback(async () => {
    if (!postId) return;

    try {
      setLoading(true);
      
      // Fetch post
      const { data: postData, error: postError } = await supabase
        .from('forum_posts')
        .select('*')
        .eq('id', postId)
        .single();

      if (postError) throw postError;

      // Fetch author and category
      const [{ data: profile }, { data: category }] = await Promise.all([
        supabase.from('profiles').select('display_name, avatar_url, wallet_address').eq('user_id', postData.author_id).single(),
        postData.category_id 
          ? supabase.from('forum_categories').select('name, icon').eq('id', postData.category_id).single()
          : { data: null }
      ]);

      // Check if user liked this post
      let isLiked = false;
      if (user) {
        const { data: likeData } = await supabase
          .from('forum_likes')
          .select('id')
          .eq('post_id', postId)
          .eq('user_id', user.id)
          .single();
        
        isLiked = !!likeData;
      }

      setPost({
        ...postData,
        author: profile ? { display_name: profile.display_name, avatar_url: profile.avatar_url, wallet_address: profile.wallet_address } : { display_name: null, avatar_url: null },
        category: category || undefined,
        is_liked: isLiked
      });

      // Fetch comments
      const commentsData = await fetchComments(postId);
      setComments(commentsData);
    } catch (err: any) {
      console.error('Error fetching post:', err);
      toast.error(t('forum.error_loading'));
      navigate('/forum');
    } finally {
      setLoading(false);
    }
  }, [postId, user, navigate, t, fetchComments]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleLike = async () => {
    if (!post) return;
    const success = await toggleLike(post.id);
    if (success) {
      setPost(prev => prev ? {
        ...prev,
        is_liked: !prev.is_liked,
        likes_count: prev.is_liked ? prev.likes_count - 1 : prev.likes_count + 1
      } : null);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t('forum.link_copied'));
    } catch {
      toast.error(t('forum.copy_failed'));
    }
  };

  const refreshComments = async () => {
    if (!postId) return;
    const commentsData = await fetchComments(postId);
    setComments(commentsData);
    // Update comments count
    setPost(prev => prev ? { ...prev, comments_count: commentsData.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0) } : null);
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #FFFBE6 0%, #F0FFF4 100%)' }}
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#DAA520' }} />
      </div>
    );
  }

  if (!post) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg, #FFFBE6 0%, #F0FFF4 100%)' }}
      >
        <p style={{ color: '#8B7355' }}>{t('forum.post_not_found')}</p>
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale
  });

  return (
    <div
      className="min-h-screen py-8 px-4 md:px-8"
      style={{
        background: 'linear-gradient(180deg, #FFFBE6 0%, #F0FFF4 50%, #FFFBE6 100%)',
      }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/forum')}
          className="mb-6"
          style={{ color: '#8B6914' }}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('forum.back_to_forum')}
        </Button>

        {/* Post content */}
        <article
          className="p-6 md:p-8 rounded-2xl mb-8"
          style={{
            background: 'linear-gradient(145deg, rgba(255, 251, 230, 0.95) 0%, rgba(255, 248, 220, 1) 100%)',
            border: '1px solid rgba(218, 165, 32, 0.3)',
          }}
        >
          {/* Author header */}
          <div className="flex items-center gap-4 mb-6">
            {post.author?.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt={post.author.display_name || 'User'}
                className="w-12 h-12 rounded-full border-2"
                style={{ borderColor: '#DAA520' }}
              />
            ) : (
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
                style={{ background: 'linear-gradient(135deg, #DAA520 0%, #FFA500 100%)' }}
              >
                {(post.author?.display_name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold" style={{ color: '#8B6914' }}>
                {post.author?.display_name || t('forum.anonymous')}
              </p>
              <div className="flex items-center gap-2 text-sm" style={{ color: '#8B7355' }}>
                <Clock className="w-4 h-4" />
                {timeAgo}
              </div>
            </div>
          </div>

          {/* Category */}
          {post.category && (
            <div
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium mb-4"
              style={{ background: 'rgba(218, 165, 32, 0.15)', color: '#B8860B' }}
            >
              <span>{post.category.icon}</span>
              <span>{post.category.name}</span>
            </div>
          )}

          {/* Title */}
          <h1
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{
              fontFamily: "'Playfair Display', serif",
              color: '#8B6914',
            }}
          >
            {post.title}
          </h1>

          {/* Content */}
          <div
            className="prose prose-lg max-w-none mb-6"
            style={{ color: '#5D4E37' }}
          >
            <p className="whitespace-pre-wrap">{post.content}</p>
          </div>

          {/* Image */}
          {post.image_url && (
            <div className="mb-6 rounded-xl overflow-hidden">
              <img
                src={post.image_url}
                alt={post.title}
                className="w-full max-h-[500px] object-contain bg-black/5"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-4 border-t" style={{ borderColor: 'rgba(218, 165, 32, 0.2)' }}>
            <button
              onClick={handleLike}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105"
              style={{
                background: post.is_liked ? 'rgba(255, 107, 107, 0.15)' : 'rgba(218, 165, 32, 0.1)',
              }}
            >
              <Heart
                className="w-5 h-5"
                style={{ color: post.is_liked ? '#FF6B6B' : '#B8860B' }}
                fill={post.is_liked ? '#FF6B6B' : 'none'}
              />
              <span
                className="font-medium"
                style={{ color: post.is_liked ? '#FF6B6B' : '#B8860B' }}
              >
                {post.likes_count} {t('forum.likes')}
              </span>
            </button>

            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{ background: 'rgba(218, 165, 32, 0.1)' }}
            >
              <MessageCircle className="w-5 h-5" style={{ color: '#B8860B' }} />
              <span className="font-medium" style={{ color: '#B8860B' }}>
                {post.comments_count} {t('forum.comments')}
              </span>
            </div>

            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105 ml-auto"
              style={{ background: 'rgba(218, 165, 32, 0.1)' }}
            >
              <Share2 className="w-5 h-5" style={{ color: '#B8860B' }} />
              <span className="font-medium hidden sm:inline" style={{ color: '#B8860B' }}>
                {t('forum.share')}
              </span>
            </button>
          </div>
        </article>

        {/* Comments section */}
        <div
          className="p-6 md:p-8 rounded-2xl"
          style={{
            background: 'linear-gradient(145deg, rgba(255, 251, 230, 0.95) 0%, rgba(255, 248, 220, 1) 100%)',
            border: '1px solid rgba(218, 165, 32, 0.3)',
          }}
        >
          <CommentSection
            postId={post.id}
            comments={comments}
            onAddComment={createComment}
            onDeleteComment={deleteComment}
            onRefresh={refreshComments}
          />
        </div>
      </div>
    </div>
  );
}
