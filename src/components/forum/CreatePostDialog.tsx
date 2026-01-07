import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Loader2, ImagePlus, Upload } from 'lucide-react';
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
  onSubmit: (title: string, content: string, categoryId?: string, imageFile?: File) => Promise<any>;
  editingPost?: ForumPost | null;
  onUpdate?: (postId: string, title: string, content: string, categoryId?: string) => Promise<boolean>;
}

// Gratitude category ID from database
const GRATITUDE_CATEGORY_ID = '083333ad-83b2-408b-8a0d-32725de9e217';

export function CreatePostDialog({
  open,
  onOpenChange,
  categories,
  onSubmit,
  editingPost,
  onUpdate
}: CreatePostDialogProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const isEditing = !!editingPost;
  const isGratitudeCategory = categoryId === GRATITUDE_CATEGORY_ID;

  // Reset form when dialog opens/closes or editingPost changes
  useEffect(() => {
    if (open) {
      if (editingPost) {
        setTitle(editingPost.title);
        setContent(editingPost.content);
        setCategoryId(editingPost.category_id || '');
        setImagePreview(editingPost.image_url || '');
        setImageFile(null);
      } else {
        resetForm();
      }
    }
  }, [open, editingPost]);

  // Handle special restrictions for Gratitude category
  const handleContentKeyDown = (e: React.KeyboardEvent) => {
    if (isGratitudeCategory && e.key === 'Enter') {
      e.preventDefault();
    }
  };

  const handleContentPaste = (e: React.ClipboardEvent) => {
    if (isGratitudeCategory) {
      e.preventDefault();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For gratitude category, only content is required
    if (isGratitudeCategory) {
      if (!content.trim()) return;
    } else {
      if (!title.trim() || !content.trim()) return;
    }

    // Auto-generate title for gratitude posts
    const finalTitle = isGratitudeCategory 
      ? content.trim().substring(0, 50) + (content.trim().length > 50 ? '...' : '')
      : title.trim();

    setIsSubmitting(true);
    try {
      if (isEditing && onUpdate) {
        const success = await onUpdate(
          editingPost.id,
          finalTitle,
          content.trim(),
          categoryId || undefined
        );
        if (success) {
          onOpenChange(false);
          resetForm();
        }
      } else {
        const result = await onSubmit(
          finalTitle,
          content.trim(),
          categoryId || undefined,
          imageFile || undefined
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
    setImageFile(null);
    setImagePreview('');
  };

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return;
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }
    
    setImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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

          {/* Title input - Hidden for Gratitude category */}
          {!isGratitudeCategory && (
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: '#8B6914' }}>
                {t('forum.title_label')} *
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
          )}

          {/* Content textarea */}
          <div>
            <label className="text-sm font-medium mb-1.5 block" style={{ color: '#8B6914' }}>
              {isGratitudeCategory ? t('forum.gratitude_content', 'Lời biết ơn') : t('forum.content')} *
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleContentKeyDown}
              onPaste={handleContentPaste}
              placeholder={isGratitudeCategory 
                ? t('forum.gratitude_placeholder', 'Viết lời biết ơn của bạn (không xuống dòng)...') 
                : t('forum.content_placeholder')
              }
              required
              rows={isGratitudeCategory ? 3 : 6}
              style={{
                background: 'rgba(255, 255, 255, 0.8)',
                borderColor: 'rgba(218, 165, 32, 0.5)',
              }}
            />
          </div>

          {/* Image upload - Hidden for Gratitude category */}
          {!isEditing && !isGratitudeCategory && (
            <div>
              <label className="text-sm font-medium mb-1.5 block" style={{ color: '#8B6914' }}>
                <span className="flex items-center gap-2">
                  <ImagePlus className="w-4 h-4" />
                  {t('forum.image_upload', 'Hình ảnh (tùy chọn)')}
                </span>
              </label>
              
              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
                    transition-all duration-200
                    ${isDragging 
                      ? 'border-[#DAA520] bg-[#DAA520]/10' 
                      : 'border-[#DAA520]/50 hover:border-[#DAA520] hover:bg-[#DAA520]/5'
                    }
                  `}
                  style={{ background: 'rgba(255, 255, 255, 0.5)' }}
                >
                  <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#8B6914' }} />
                  <p className="text-sm" style={{ color: '#8B6914' }}>
                    {t('forum.drag_drop', 'Kéo thả ảnh vào đây hoặc nhấn để chọn')}
                  </p>
                  <p className="text-xs mt-1 opacity-70" style={{ color: '#8B6914' }}>
                    {t('forum.max_size', 'Tối đa 5MB')}
                  </p>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          )}

          {/* Show existing image when editing */}
          {isEditing && editingPost?.image_url && (
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={editingPost.image_url}
                alt="Post image"
                className="w-full h-40 object-cover"
              />
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
              disabled={isSubmitting || (!isGratitudeCategory && !title.trim()) || !content.trim()}
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
