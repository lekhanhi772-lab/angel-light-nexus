import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2, Link, MessageSquare, Copy, Check, Loader2, ClipboardCopy, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useShareConversation } from '@/hooks/useShareConversation';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

interface ShareConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  userId: string;
  messages: Message[];
  defaultTitle?: string;
  userName?: string;
}

export const ShareConversationDialog = ({
  open,
  onOpenChange,
  conversationId,
  userId,
  messages,
  defaultTitle = '',
  userName,
}: ShareConversationDialogProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isSharing, shareViaLink, shareToForum } = useShareConversation();
  
  const [title, setTitle] = useState(defaultTitle);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedConversation, setCopiedConversation] = useState(false);
  const [activeTab, setActiveTab] = useState('link');
  
  // 🏷️ AI-generated title states
  const [generatedTitle, setGeneratedTitle] = useState<string>('');
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

  // 🏷️ Generate smart title when dialog opens
  useEffect(() => {
    if (open && messages.length > 0 && !generatedTitle && !title.trim()) {
      generateSmartTitle();
    }
  }, [open, messages]);

  // Reset states when dialog closes
  useEffect(() => {
    if (!open) {
      setGeneratedTitle('');
      setIsGeneratingTitle(false);
    }
  }, [open]);

  const generateSmartTitle = async () => {
    if (messages.length === 0) return;
    
    setIsGeneratingTitle(true);
    try {
      // Tạo summary của hội thoại để gửi cho AI
      const conversationSummary = messages.map(m => ({
        role: m.role,
        content: m.content.slice(0, 300) // Giới hạn để không quá nặng
      }));

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      
      const response = await fetch(`${supabaseUrl}/functions/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          messages: conversationSummary,
          generateTitle: true,
          language: 'vi'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate title');
      }

      const data = await response.json();
      const smartTitle = data?.title?.trim() || '';
      
      if (smartTitle) {
        setGeneratedTitle(smartTitle);
        console.log('🏷️ AI generated title:', smartTitle);
      }
    } catch (error) {
      console.error('Error generating smart title:', error);
      // Fallback: dùng tin nhắn đầu tiên của user
      const firstUserMsg = messages.find(m => m.role === 'user');
      if (firstUserMsg) {
        const fallbackTitle = firstUserMsg.content.slice(0, 50).trim();
        setGeneratedTitle(fallbackTitle.length > 47 ? fallbackTitle.slice(0, 47) + '...' : fallbackTitle);
      }
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  // Chuyển **text** thành <b>text</b> trong HTML
  const markdownToHtml = (text: string): string => {
    return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  };

  const formatConversationForCopy = (): string => {
    const displayName = userName || t('shareConversation.defaultUserName');
    
    // 🏷️ Sử dụng tiêu đề: User input > AI generated > Default
    const finalTitle = title.trim() || generatedTitle || t('shareConversation.defaultForumTitle');
    
    const header = `✨ ${finalTitle} ✨\n\n`;
    
    const body = messages.map(msg => {
      const speaker = msg.role === 'user' ? `👤 ${displayName}` : '🌟 Angel AI';
      return `${speaker}:\n${msg.content}`;
    }).join('\n\n---\n\n');
    
    const footer = `\n\n---\n💛 ${t('shareConversation.sharedFrom')}`;
    
    return header + body + footer;
  };

  const formatConversationForHtml = (): string => {
    const displayName = userName || t('shareConversation.defaultUserName');
    const finalTitle = title.trim() || generatedTitle || t('shareConversation.defaultForumTitle');

    const header = `<div style="font-size:18px;font-weight:bold;margin-bottom:12px;">✨ ${finalTitle} ✨</div>`;

    const body = messages.map(msg => {
      const speaker = msg.role === 'user' ? `👤 ${displayName}` : '🌟 Angel AI';
      const htmlContent = markdownToHtml(msg.content).replace(/\n/g, '<br/>');
      return `<div style="margin-bottom:12px;"><b>${speaker}:</b><br/>${htmlContent}</div>`;
    }).join('<hr style="border:none;border-top:1px solid #e5e5e5;margin:8px 0;"/>');

    const footer = `<hr style="border:none;border-top:1px solid #e5e5e5;margin:8px 0;"/><div>💛 ${t('shareConversation.sharedFrom')}</div>`;

    return header + body + footer;
  };

  const handleCopyConversation = async () => {
    const plainText = formatConversationForCopy();
    const htmlText = formatConversationForHtml();
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([htmlText], { type: 'text/html' }),
          'text/plain': new Blob([plainText], { type: 'text/plain' }),
        }),
      ]);
      setCopiedConversation(true);
      toast.success(t('shareConversation.conversationCopied'));
      setTimeout(() => setCopiedConversation(false), 2000);
    } catch {
      // Fallback: copy plain text nếu browser không hỗ trợ ClipboardItem
      try {
        await navigator.clipboard.writeText(plainText);
        setCopiedConversation(true);
        toast.success(t('shareConversation.conversationCopied'));
        setTimeout(() => setCopiedConversation(false), 2000);
      } catch {
        toast.error(t('shareConversation.shareError'));
      }
    }
  };

  const handleShareLink = async () => {
    const url = await shareViaLink(conversationId, userId, title || undefined);
    if (url) {
      setShareUrl(url);
    }
  };

  const handleShareForum = async () => {
    const forumTitle = title || generatedTitle || t('shareConversation.defaultForumTitle');
    const postId = await shareToForum(conversationId, userId, messages, forumTitle);
    if (postId) {
      onOpenChange(false);
      navigate(`/forum/${postId}`);
    }
  };

  const handleCopyUrl = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Already shown toast in hook
      }
    }
  };

  const handleClose = () => {
    setShareUrl(null);
    setCopied(false);
    setCopiedConversation(false);
    setTitle(defaultTitle);
    setGeneratedTitle('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-800">
            <Share2 className="w-5 h-5" />
            {t('shareConversation.title')}
          </DialogTitle>
          <DialogDescription className="text-amber-700/80">
            {t('shareConversation.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title input */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-amber-800">
              {t('shareConversation.customTitle')}
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={generatedTitle || t('shareConversation.titlePlaceholder')}
              className="border-amber-200 focus:border-amber-400 bg-white/80"
            />
            
            {/* AI Generated Title Indicator */}
            {isGeneratingTitle && (
              <div className="flex items-center gap-2 text-amber-600 text-xs">
                <Sparkles className="w-3 h-3 animate-pulse" />
                {t('shareConversation.generatingTitle')}
              </div>
            )}
            
            {generatedTitle && !title.trim() && !isGeneratingTitle && (
              <div className="flex items-center gap-2 text-amber-600 text-xs">
                <Sparkles className="w-3 h-3" />
                {t('shareConversation.autoTitle')}: <strong className="text-amber-800">{generatedTitle}</strong>
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="bg-white/60 rounded-lg p-3 border border-amber-100">
            <p className="text-xs text-amber-600 mb-1">{t('shareConversation.preview')}</p>
            <p className="text-sm text-amber-800">
              {t('shareConversation.messagesCount', { count: messages.length })}
            </p>
          </div>

          {/* Share options tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-amber-100/50">
              <TabsTrigger 
                value="link" 
                className="data-[state=active]:bg-amber-200 data-[state=active]:text-amber-900 text-xs sm:text-sm"
              >
                <Link className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t('shareConversation.getLink')}</span>
                <span className="sm:hidden">Link</span>
              </TabsTrigger>
              <TabsTrigger 
                value="forum"
                className="data-[state=active]:bg-amber-200 data-[state=active]:text-amber-900 text-xs sm:text-sm"
              >
                <MessageSquare className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t('shareConversation.postToForum')}</span>
                <span className="sm:hidden">Forum</span>
              </TabsTrigger>
              <TabsTrigger 
                value="copy"
                className="data-[state=active]:bg-amber-200 data-[state=active]:text-amber-900 text-xs sm:text-sm"
              >
                <ClipboardCopy className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">{t('shareConversation.copyTab')}</span>
                <span className="sm:hidden">{t('shareConversation.copyTab')}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="space-y-3 mt-4">
              {shareUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={shareUrl}
                      readOnly
                      className="text-sm bg-white border-amber-200"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleCopyUrl}
                      className="shrink-0 border-amber-200 hover:bg-amber-100"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-amber-600 text-center">
                    {t('shareConversation.linkReady')}
                  </p>
                </div>
              ) : (
                <Button
                  onClick={handleShareLink}
                  disabled={isSharing}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                >
                  {isSharing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('shareConversation.creating')}
                    </>
                  ) : (
                    <>
                      <Link className="w-4 h-4 mr-2" />
                      {t('shareConversation.createLink')}
                    </>
                  )}
                </Button>
              )}
            </TabsContent>

            <TabsContent value="forum" className="space-y-3 mt-4">
              <p className="text-sm text-amber-700">
                {t('shareConversation.forumDescription')}
              </p>
              <Button
                onClick={handleShareForum}
                disabled={isSharing || (!title.trim() && !generatedTitle)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                {isSharing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('shareConversation.posting')}
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {t('shareConversation.postNow')}
                  </>
                )}
              </Button>
              {!title.trim() && !generatedTitle && !isGeneratingTitle && (
                <p className="text-xs text-red-500 text-center">
                  {t('shareConversation.titleRequired')}
                </p>
              )}
            </TabsContent>

            <TabsContent value="copy" className="space-y-3 mt-4">
              <p className="text-sm text-amber-700">
                {t('shareConversation.copyDescription')}
              </p>
              <div className="bg-white/60 rounded-lg p-3 border border-amber-100 max-h-32 overflow-y-auto">
                <p className="text-xs text-amber-600 font-mono whitespace-pre-wrap">
                  {formatConversationForCopy().slice(0, 200)}...
                </p>
              </div>
              <Button
                onClick={handleCopyConversation}
                disabled={isGeneratingTitle}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
              >
                {copiedConversation ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {t('chat.copied')}
                  </>
                ) : (
                  <>
                    <ClipboardCopy className="w-4 h-4 mr-2" />
                    {t('shareConversation.copyButton')}
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
