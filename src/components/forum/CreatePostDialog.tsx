import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2, ImagePlus } from 'lucide-react';
import { ForumCategory, ForumPost } from '@/hooks/useForum';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: ForumCategory[];
  onSubmit: (title: string, content: string, categoryId?: string, imageUrl?: string) => Promise<any>;
  editingPost?: ForumPost | null;
  onUpdate?: (postId: string, title: string, content: string, categoryId?: string) => Promise<boolean>;
}

export function CreatePostDialog({
  open,
  onOpenChange,
  categories,
  onSubmit,
  editingPost,
  onUpdate
}: CreatePostDialogProps) {
  const { t } = useTranslation();
  const [title, setTitle] = useState(editingPost?.title || '');
  const [content, setContent] = useState(editingPost?.content || '');
  const [categoryId, setCategoryId] = useState<string>(editingPost?.category_id || '');
  const [imageUrl, setImageUrl] = useState(editingPost?.image_url || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!editingPost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      if (isEditing && onUpdate) {
        const success = await onUpdate(
          editingPost.id,
          title.trim(),
          content.trim(),
          categoryId || undefined
        );
        if (success) {
          onOpenChange(false);
          resetForm();
        }
      } else {
        const result = await onSubmit(
          title.trim(),
          content.trim(),
          categoryId || undefined,
          imageUrl || undefined
        );
        if (result) {
          onOpenChange(false);
          resetForm();
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setCategoryId('');
    setImageUrl('');
  };

  // Reset form when dialog opens/closes or editingPost changes
  useState(() => {
    if (editingPost) {
      setTitle(editingPost.title);
      setContent(editingPost.content);
      setCategoryId(editingPost.category_id || '');
      setImageUrl(editingPost.image_url || '');
    } else {
      resetForm();
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[550px] p-0 overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #FFFBE6 0%, #F0FFF4 100%)',
          border: '2px solid #DAA520',
        }}
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle
            className="text-xl font-bold"
            style={{ color: '#8B6914' }}
          >
            {isEditing ? t('forum.edit_post') : t('forum.create_post')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Category select */}
          <div>
            <label className="text-sm font-medium mb-1.5 block" style={{ color: '#8B6914' }}>
              {t('forum.category')}
            </label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger
                className="w-full"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderColor: 'rgba(218, 165, 32, 0.5)',
                }}
              >
                <SelectValue placeholder={t('forum.select_category')} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <span>{cat.icon}</span>
                      <span>{cat.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title input */}
          <div>
            <label className="text-sm font-medium mb-1.5 block" style={{ color: '#8B6914' }}>
              {t('forum.title')} *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('forum.title_placeholder')}
              required
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'rgba(218, 165, 32, 0.5)',
              }}
            />
          </div>

          {/* Content textarea */}
          <div>
            <label className="text-sm font-medium mb-1.5 block" style={{ color: '#8B6914' }}>
              {t('forum.content')} *
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('forum.content_placeholder')}
              required
              rows={6}
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'rgba(218, 165, 32, 0.5)',
              }}
            />
          </div>

          {/* Image URL input */}
          {!isEditing && (
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: '#8B6914' }}>
                <span className="flex items-center gap-2">
                  <ImagePlus className="w-4 h-4" />
                  {t('forum.image_url')}
                </span>
              </label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                type="url"
                style={{
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderColor: 'rgba(218, 165, 32, 0.5)',
                }}
              />
            </div>
          )}

          {/* Image preview */}
          {imageUrl && (
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-40 object-cover"
                onError={() => setImageUrl('')}
              />
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Submit buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              style={{
                borderColor: '#DAA520',
                color: '#8B6914',
              }}
            >
              {t('chat.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="flex-1 text-white"
              style={{
                background: 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)',
              }}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                isEditing ? t('forum.update') : t('forum.post')
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
