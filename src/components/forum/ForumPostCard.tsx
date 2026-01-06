import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, MessageCircle, Clock, MoreHorizontal, Edit, Trash2, Pin } from 'lucide-react';
import { ForumPost } from '@/hooks/useForum';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS, fr, ja, ko } from 'date-fns/locale';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ForumPostCardProps {
  post: ForumPost;
  onLike: (postId: string) => void;
  onDelete: (postId: string) => void;
  onEdit: (post: ForumPost) => void;
}

const localeMap: Record<string, any> = {
  vi,
  en: enUS,
  fr,
  ja,
  ko
};

export function ForumPostCard({ post, onLike, onDelete, onEdit }: ForumPostCardProps) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isAuthor = user?.id === post.author_id;
  const locale = localeMap[i18n.language] || vi;

  const timeAgo = formatDistanceToNow(new Date(post.created_at), {
    addSuffix: true,
    locale
  });

  const handleCardClick = () => {
    navigate(`/forum/${post.id}`);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(post.id);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="relative p-5 rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        style={{
          background: 'linear-gradient(145deg, rgba(255, 251, 230, 0.9) 0%, rgba(255, 248, 220, 0.95) 100%)',
          border: '1px solid rgba(218, 165, 32, 0.3)',
        }}
      >
        {/* Pinned indicator */}
        {post.is_pinned && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
            style={{ background: 'rgba(218, 165, 32, 0.2)', color: '#B8860B' }}
          >
            <Pin className="w-3 h-3" />
            {t('forum.pinned')}
          </div>
        )}

        {/* Header: Author info + Menu */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {post.author?.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt={post.author.display_name || 'User'}
                className="w-10 h-10 rounded-full border-2"
                style={{ borderColor: '#DAA520' }}
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ background: 'linear-gradient(135deg, #DAA520 0%, #FFA500 100%)' }}
              >
                {(post.author?.display_name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-sm" style={{ color: '#8B6914' }}>
                {post.author?.display_name || t('forum.anonymous')}
              </p>
              <div className="flex items-center gap-2 text-xs" style={{ color: '#8B7355' }}>
                <Clock className="w-3 h-3" />
                {timeAgo}
              </div>
            </div>
          </div>

          {/* Author menu */}
          {isAuthor && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <button className="p-1.5 rounded-full hover:bg-[#FFFACD] transition-colors">
                  <MoreHorizontal className="w-5 h-5" style={{ color: '#8B7355' }} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(post); }}>
                  <Edit className="w-4 h-4 mr-2" />
                  {t('forum.edit')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); setShowDeleteDialog(true); }}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('forum.delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Category badge */}
        {post.category && (
          <div
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mb-2"
            style={{ background: 'rgba(218, 165, 32, 0.15)', color: '#B8860B' }}
          >
            <span>{post.category.icon}</span>
            <span>{post.category.name}</span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold mb-2" style={{ color: '#8B6914' }}>
          {post.title}
        </h3>

        {/* Content preview */}
        <p
          className="text-sm mb-4 line-clamp-3"
          style={{ color: '#5D4E37' }}
        >
          {post.content}
        </p>

        {/* Image preview */}
        {post.image_url && (
          <div className="mb-4 rounded-xl overflow-hidden">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Footer: Likes + Comments */}
        <div className="flex items-center gap-4 pt-3 border-t" style={{ borderColor: 'rgba(218, 165, 32, 0.2)' }}>
          <button
            onClick={handleLikeClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all hover:scale-105"
            style={{
              background: post.is_liked ? 'rgba(255, 107, 107, 0.15)' : 'rgba(218, 165, 32, 0.1)',
            }}
          >
            <Heart
              className="w-4 h-4"
              style={{ color: post.is_liked ? '#FF6B6B' : '#B8860B' }}
              fill={post.is_liked ? '#FF6B6B' : 'none'}
            />
            <span
              className="text-sm font-medium"
              style={{ color: post.is_liked ? '#FF6B6B' : '#B8860B' }}
            >
              {post.likes_count}
            </span>
          </button>

          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(218, 165, 32, 0.1)' }}
          >
            <MessageCircle className="w-4 h-4" style={{ color: '#B8860B' }} />
            <span className="text-sm font-medium" style={{ color: '#B8860B' }}>
              {post.comments_count}
            </span>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('forum.delete_confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('forum.delete_confirm_description')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('chat.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(post.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('chat.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
