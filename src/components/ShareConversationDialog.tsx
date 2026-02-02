import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2, Link, MessageSquare, Copy, Check, Loader2, ClipboardCopy } from 'lucide-react';
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

  const formatConversationForCopy = (): string => {
    const displayName = userName || t('shareConversation.defaultUserName');
    const header = `✨ ${t('shareConversation.conversationHeader')} ✨\n${title ? `📌 ${title}\n` : ''}\n`;
    
    const body = messages.map(msg => {
      const speaker = msg.role === 'user' ? `👤 ${displayName}` : '🌟 Angel AI';
      return `${speaker}:\n${msg.content}`;
    }).join('\n\n---\n\n');
    
    const footer = `\n\n---\n💛 ${t('shareConversation.sharedFrom')}`;
    
    return header + body + footer;
  };

  const handleCopyConversation = async () => {
    const text = formatConversationForCopy();
    try {
      await navigator.clipboard.writeText(text);
      setCopiedConversation(true);
      toast.success(t('shareConversation.conversationCopied'));
      setTimeout(() => setCopiedConversation(false), 2000);
    } catch {
      toast.error(t('shareConversation.shareError'));
    }
  };

  const handleShareLink = async () => {
    const url = await shareViaLink(conversationId, userId, title || undefined);
    if (url) {
      setShareUrl(url);
    }
  };

  const handleShareForum = async () => {
    const forumTitle = title || t('shareConversation.defaultForumTitle');
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
              placeholder={t('shareConversation.titlePlaceholder')}
              className="border-amber-200 focus:border-amber-400 bg-white/80"
            />
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
                disabled={isSharing || !title.trim()}
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
              {!title.trim() && (
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
