import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send, Trash2, Reply, Loader2 } from 'lucide-react';
import { ForumComment } from '@/hooks/useForum';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS, fr, ja, ko } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface CommentSectionProps {
  postId: string;
  comments: ForumComment[];
  onAddComment: (postId: string, content: string, parentId?: string) => Promise<ForumComment | null>;
  onDeleteComment: (commentId: string, postId: string) => Promise<boolean>;
  onRefresh: () => void;
}

const localeMap: Record<string, any> = {
  vi,
  en: enUS,
  fr,
  ja,
  ko
};

function CommentItem({
  comment,
  postId,
  onReply,
  onDelete,
  depth = 0,
  locale
}: {
  comment: ForumComment;
  postId: string;
  onReply: (parentId: string) => void;
  onDelete: (commentId: string) => void;
  depth?: number;
  locale: any;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAuthor = user?.id === comment.author_id;

  const timeAgo = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale
  });

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/user/${comment.author_id}`);
  };

  return (
    <div
      className="py-3"
      style={{
        marginLeft: depth > 0 ? `${Math.min(depth * 24, 72)}px` : 0,
        borderLeft: depth > 0 ? '2px solid rgba(218, 165, 32, 0.2)' : 'none',
        paddingLeft: depth > 0 ? '12px' : 0,
      }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar - clickable */}
        <div 
          className="cursor-pointer transition-transform hover:scale-105"
          onClick={handleAuthorClick}
        >
          {comment.author?.avatar_url ? (
            <img
              src={comment.author.avatar_url}
              alt={comment.author.display_name || 'User'}
              className="w-8 h-8 rounded-full border"
              style={{ borderColor: '#DAA520' }}
            />
          ) : (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #DAA520 0%, #FFA500 100%)' }}
            >
              {(comment.author?.display_name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1">
            <span 
              className="font-semibold text-sm cursor-pointer hover:underline" 
              style={{ color: '#8B6914' }}
              onClick={handleAuthorClick}
            >
              {comment.author?.display_name || t('forum.anonymous')}
            </span>
            <span className="text-xs" style={{ color: '#8B7355' }}>
              {timeAgo}
            </span>
          </div>

          {/* Content */}
          <p className="text-sm whitespace-pre-wrap" style={{ color: '#5D4E37' }}>
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => onReply(comment.id)}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full hover:bg-[#FFFACD] transition-colors"
              style={{ color: '#B8860B' }}
            >
              <Reply className="w-3 h-3" />
              {t('forum.reply')}
            </button>
            {isAuthor && (
              <button
                onClick={() => onDelete(comment.id)}
                className="flex items-center gap-1 text-xs px-2 py-1 rounded-full hover:bg-red-50 transition-colors text-red-500"
              >
                <Trash2 className="w-3 h-3" />
                {t('forum.delete')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              onReply={onReply}
              onDelete={onDelete}
              depth={depth + 1}
              locale={locale}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommentSection({
  postId,
  comments,
  onAddComment,
  onDeleteComment,
  onRefresh
}: CommentSectionProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const locale = localeMap[i18n.language] || vi;

  const handleSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await onAddComment(postId, newComment.trim(), replyingTo || undefined);
      if (result) {
        setNewComment('');
        setReplyingTo(null);
        onRefresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    const success = await onDeleteComment(commentId, postId);
    if (success) {
      onRefresh();
    }
  };

  const handleReply = (parentId: string) => {
    setReplyingTo(parentId);
    // Focus the textarea
    const textarea = document.getElementById('comment-input');
    textarea?.focus();
  };

  const replyingToComment = replyingTo
    ? comments.find(c => c.id === replyingTo) ||
      comments.flatMap(c => c.replies || []).find(r => r.id === replyingTo)
    : null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold" style={{ color: '#8B6914' }}>
        {t('forum.comments')} ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
      </h3>

      {/* Comment input */}
      {user ? (
        <div className="space-y-2">
          {replyingTo && (
            <div
              className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg"
              style={{ background: 'rgba(218, 165, 32, 0.1)', color: '#8B6914' }}
            >
              <Reply className="w-4 h-4" />
              <span>
                {t('forum.replying_to')} <strong>{replyingToComment?.author?.display_name || t('forum.anonymous')}</strong>
              </span>
              <button
                onClick={() => setReplyingTo(null)}
                className="ml-auto text-xs hover:underline"
                style={{ color: '#B8860B' }}
              >
                {t('chat.cancel')}
              </button>
            </div>
          )}
          <div className="flex gap-3">
            <Textarea
              id="comment-input"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={t('forum.write_comment')}
              rows={2}
              className="flex-1"
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'rgba(218, 165, 32, 0.5)',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button
              onClick={handleSubmit}
              disabled={!newComment.trim() || isSubmitting}
              className="self-end text-white"
              style={{
                background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
              }}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-center py-4" style={{ color: '#8B7355' }}>
          {t('forum.login_to_comment')}
        </p>
      )}

      {/* Comments list */}
      <div
        className="divide-y"
        style={{ borderColor: 'rgba(218, 165, 32, 0.15)' }}
      >
        {comments.length > 0 ? (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              postId={postId}
              onReply={handleReply}
              onDelete={handleDelete}
              locale={locale}
            />
          ))
        ) : (
          <p className="text-sm text-center py-6" style={{ color: '#8B7355' }}>
            {t('forum.no_comments')}
          </p>
        )}
      </div>
    </div>
  );
}
