import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageSquare, User, Sparkles, Calendar, ArrowRight, Home, Copy, Check, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, markdownToHtml } from '@/lib/utils';
import { useShareConversation } from '@/hooks/useShareConversation';
import { useEdgeTTS } from '@/hooks/useEdgeTTS';
import { getSpeechCode, getEdgeVoice } from '@/i18n';
import { toast } from 'sonner';
import angelAvatar from '@/assets/angel-avatar.png';
import ParticleBackground from '@/components/ParticleBackground';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
}

interface Sharer {
  display_name: string | null;
  avatar_url: string | null;
}

const SharedConversation = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const { t, i18n } = useTranslation();
  const { getSharedConversation } = useShareConversation();
  
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sharer, setSharer] = useState<Sharer | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);

  const currentEdgeVoice = getEdgeVoice(i18n.language);
  const currentSpeechCode = getSpeechCode(i18n.language);

  const edgeTTS = useEdgeTTS({
    onSpeakingStart: () => {},
    onSpeakingEnd: () => {
      setSpeakingId(null);
      setLoadingAudioId(null);
    },
  });

  useEffect(() => {
    const loadSharedConversation = async () => {
      if (!shareToken) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const result = await getSharedConversation(shareToken);
      
      if (!result.shared) {
        setNotFound(true);
      } else {
        setMessages(result.messages);
        setSharer(result.sharer);
        setTitle(result.shared.title);
        setCreatedAt(result.shared.created_at);
      }
      
      setLoading(false);
    };

    loadSharedConversation();
  }, [shareToken]);


  const handleCopy = async (text: string, id: string) => {
    try {
      const htmlText = markdownToHtml(text).replace(/\n/g, '<br/>');
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([htmlText], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' }),
        }),
      ]);
      setCopiedId(id);
      toast.success(t('chat.copied'));
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        toast.success(t('chat.copied'));
        setTimeout(() => setCopiedId(null), 2000);
      } catch {
        toast.error('Copy failed');
      }
    }
  };

  const handleSpeak = async (text: string, id: string) => {
    if (speakingId === id) {
      edgeTTS.stopSpeaking();
      setSpeakingId(null);
      return;
    }

    setLoadingAudioId(id);
    setSpeakingId(id);
    
    try {
      await edgeTTS.speak(text, currentEdgeVoice, currentSpeechCode);
    } catch {
      setSpeakingId(null);
    } finally {
      setLoadingAudioId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-amber-500 animate-pulse mx-auto mb-4" />
          <p className="text-amber-700">{t('shareConversation.loading')}</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <MessageSquare className="w-16 h-16 text-amber-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-amber-800 mb-2">
            {t('shareConversation.notFound')}
          </h1>
          <p className="text-amber-600 mb-6">
            {t('shareConversation.notFoundDescription')}
          </p>
          <Link to="/">
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <Home className="w-4 h-4 mr-2" />
              {t('shareConversation.backHome')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative">
      <ParticleBackground />
      
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-amber-200/50 p-6 mb-6 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-amber-200">
                <AvatarImage src={sharer?.avatar_url || ''} />
                <AvatarFallback className="bg-amber-100 text-amber-700">
                  <User className="w-6 h-6" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-amber-600">{t('shareConversation.sharedBy')}</p>
                <p className="font-semibold text-amber-800">
                  {sharer?.display_name || t('shareConversation.anonymous')}
                </p>
              </div>
            </div>
            {createdAt && (
              <div className="flex items-center gap-1 text-sm text-amber-500">
                <Calendar className="w-4 h-4" />
                {new Date(createdAt).toLocaleDateString(i18n.language)}
              </div>
            )}
          </div>
          
          {title && (
            <h1 className="text-xl font-bold text-amber-800 mb-2">{title}</h1>
          )}
          
          <p className="text-sm text-amber-600">
            {t('shareConversation.messagesCount', { count: messages.length })}
          </p>
        </div>

        {/* Messages */}
        <div className="space-y-4 mb-8">
          {messages.map((message, index) => {
            const messageId = message.id || `msg-${index}`;
            const isUser = message.role === 'user';
            
            return (
              <div
                key={messageId}
                className={cn(
                  'flex gap-3',
                  isUser ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <Avatar className={cn(
                  'w-10 h-10 shrink-0',
                  isUser ? 'border-2 border-blue-200' : 'border-2 border-amber-200'
                )}>
                  {isUser ? (
                    <>
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        <User className="w-5 h-5" />
                      </AvatarFallback>
                    </>
                  ) : (
                    <AvatarImage src={angelAvatar} alt="Angel AI" />
                  )}
                </Avatar>

                <div className={cn(
                  'max-w-[80%] rounded-2xl p-4 relative group',
                  isUser 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white'
                    : 'bg-white/90 border border-amber-100 text-gray-800'
                )}>
                  {/* Action buttons */}
                  <div className={cn(
                    'absolute top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity',
                    isUser ? 'left-2' : 'right-2'
                  )}>
                    <button
                      onClick={() => handleCopy(message.content, messageId)}
                      className={cn(
                        'p-1.5 rounded-full transition-colors',
                        isUser 
                          ? 'bg-white/20 hover:bg-white/30 text-white'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-600'
                      )}
                    >
                      {copiedId === messageId ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleSpeak(message.content, messageId)}
                      className={cn(
                        'p-1.5 rounded-full transition-colors',
                        isUser 
                          ? 'bg-white/20 hover:bg-white/30 text-white'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-600'
                      )}
                    >
                      {loadingAudioId === messageId ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : speakingId === messageId ? (
                        <VolumeX className="w-3.5 h-3.5" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </p>

                  {message.imageUrl && (
                    <img
                      src={message.imageUrl}
                      alt="Generated"
                      className="mt-3 rounded-lg max-w-full"
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-6 text-center border border-amber-200/50">
          <Sparkles className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-amber-800 mb-2">
            {t('shareConversation.ctaTitle')}
          </h2>
          <p className="text-sm text-amber-600 mb-4">
            {t('shareConversation.ctaDescription')}
          </p>
          <Link to="/chat">
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
              {t('shareConversation.continueWithAngel')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SharedConversation;
