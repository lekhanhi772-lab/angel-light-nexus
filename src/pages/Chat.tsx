import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Sparkles, ArrowUp, Image, Loader2, Download, Home, Plus, MessageSquare, Trash2, Star, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import angelHero from '@/assets/angel-hero.png';
import ParticleBackground from '@/components/ParticleBackground';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  isImageRequest?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;

const SUGGESTIONS = [
  "Angel AI có thể giúp gì cho tôi?",
  "Hướng dẫn tôi cách tìm bình an nội tâm",
  "🎨 Tạo hình thiên thần đang bay trên bầu trời",
  "🎨 Vẽ một bức tranh hoàng hôn tuyệt đẹp"
];

const Chat = () => {
  const { user, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'image'>('chat');
  const [showSidebar, setShowSidebar] = useState(true);
  const [deleteConversationId, setDeleteConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load conversations only if user is logged in
  useEffect(() => {
    if (!authLoading && user) {
      loadConversations();
    } else if (!authLoading && !user) {
      // Guest mode - clear conversations
      setConversations([]);
      setCurrentConversationId(null);
      setMessages([]);
    }
  }, [user, authLoading]);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversationId && user) {
      loadMessages(currentConversationId);
    } else if (!user) {
      // Guest mode - don't load from DB
    }
  }, [currentConversationId, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const loadConversations = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });
    
    if (error) {
      console.error('Error loading conversations:', error);
      return;
    }
    setConversations(data || []);
  };

  const loadMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error loading messages:', error);
      return;
    }
    setMessages(data?.map(m => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      imageUrl: m.image_url || undefined
    })) || []);
  };

  const createNewConversation = async (firstMessage: string): Promise<string | null> => {
    if (!user) {
      // Guest mode - no DB save
      return null;
    }
    
    const title = firstMessage.slice(0, 50) + (firstMessage.length > 50 ? '...' : '');
    
    const { data, error } = await supabase
      .from('conversations')
      .insert({ title, user_id: user.id })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
    
    setConversations(prev => [data, ...prev]);
    setCurrentConversationId(data.id);
    return data.id;
  };

  const saveMessage = async (conversationId: string | null, message: Message) => {
    if (!conversationId || !user) return; // Guest mode - no save
    
    const { error } = await supabase
      .from('chat_messages')
      .insert({
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
        image_url: message.imageUrl || null
      });
    
    if (error) {
      console.error('Error saving message:', error);
    }

    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  };

  const saveGeneratedImage = async (conversationId: string | null, prompt: string, imageUrl: string) => {
    if (!conversationId || !user) return; // Guest mode - no save
    
    const { error } = await supabase
      .from('generated_images')
      .insert({
        conversation_id: conversationId,
        prompt,
        image_url: imageUrl
      });
    
    if (error) {
      console.error('Error saving generated image:', error);
    }
  };

  const confirmDeleteConversation = async () => {
    if (!deleteConversationId) return;
    
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', deleteConversationId);
    
    if (error) {
      toast.error('Không thể xóa cuộc trò chuyện');
      setDeleteConversationId(null);
      return;
    }
    
    setConversations(prev => prev.filter(c => c.id !== deleteConversationId));
    if (currentConversationId === deleteConversationId) {
      setCurrentConversationId(null);
      setMessages([]);
    }
    toast.success('Đã xóa cuộc trò chuyện');
    setDeleteConversationId(null);
  };

  const startNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
  };

  const isImagePrompt = (text: string) => {
    const imageKeywords = ['tạo hình', 'vẽ', 'generate', 'create image', 'draw', '🎨', 'hình ảnh', 'picture', 'illustration', 'tạo ảnh'];
    return imageKeywords.some(keyword => text.toLowerCase().includes(keyword)) || mode === 'image';
  };

  const generateImage = async (prompt: string) => {
    const response = await fetch(IMAGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate image');
    }

    const data = await response.json();
    return { imageUrl: data.imageUrl, text: data.text };
  };

  const sendChatMessage = async (newMessages: Message[], conversationId: string | null) => {
    let assistantContent = '';

    const response = await fetch(CHAT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ 
        messages: newMessages.map(m => ({ role: m.role, content: m.content }))
      }),
    });

    if (!response.ok) throw new Error('Failed to get response');
    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch { /* ignore */ }
        }
      }
    }

    // Save assistant message (only if logged in)
    await saveMessage(conversationId, { role: 'assistant', content: assistantContent });
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const shouldGenerateImage = isImagePrompt(messageText);
    const userMessage: Message = { 
      role: 'user', 
      content: messageText,
      isImageRequest: shouldGenerateImage
    };
    
    setInput('');
    setIsLoading(true);

    try {
      // Create or get conversation (null for guests)
      let convId = currentConversationId;
      if (!convId && user) {
        convId = await createNewConversation(messageText);
      }

      // Save user message (only if logged in)
      await saveMessage(convId, userMessage);
      setMessages(prev => [...prev, userMessage]);

      if (shouldGenerateImage) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: '🎨 Đang tạo hình ảnh cho bạn...',
        }]);

        const result = await generateImage(messageText);
        
        const assistantMessage: Message = { 
          role: 'assistant', 
          content: result.text,
          imageUrl: result.imageUrl
        };

        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = assistantMessage;
          return updated;
        });

        await saveMessage(convId, assistantMessage);
        await saveGeneratedImage(convId, messageText, result.imageUrl);
      } else {
        await sendChatMessage([...messages, userMessage], convId);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.' }
      ]);
      toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const downloadImage = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `angel-ai-${Date.now()}.png`;
    link.click();
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="relative min-h-screen flex">
      {/* Light Background */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(180deg, #FFFBE6 0%, #FFF8DC 30%, #F0FFF4 60%, #E6F7FF 100%)',
        }}
      />
      <ParticleBackground />

      {/* Sidebar - Light Theme */}
      <aside className={cn(
        "fixed lg:relative z-20 h-screen transition-all duration-300",
        showSidebar ? "w-72 translate-x-0" : "w-0 -translate-x-full lg:w-0"
      )}
      style={{
        background: 'linear-gradient(180deg, rgba(255, 251, 230, 0.95) 0%, rgba(255, 248, 220, 0.95) 100%)',
        borderRight: '1px solid rgba(184, 134, 11, 0.2)',
        backdropFilter: 'blur(10px)',
      }}
      >
        <div className="flex flex-col h-full p-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Link 
              to="/" 
              className="p-2 rounded-lg transition-colors"
              style={{
                background: 'linear-gradient(135deg, rgba(135, 206, 235, 0.3) 0%, rgba(255, 215, 0, 0.2) 100%)',
              }}
            >
              <Home className="w-5 h-5" style={{ color: '#B8860B' }} />
            </Link>
            <h2 
              className="text-lg font-medium"
              style={{
                fontFamily: "'Cinzel', serif",
                color: '#B8860B',
                textShadow: '0 0 10px rgba(255, 215, 0, 0.3)',
              }}
            >
              ✨ Lịch sử Chat
            </h2>
          </div>

          {/* Guest Mode Notice */}
          {!user && !authLoading && (
            <div 
              className="mb-4 p-3 rounded-xl text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(135, 206, 235, 0.2) 100%)',
                border: '1px solid rgba(184, 134, 11, 0.3)',
              }}
            >
              <LogIn className="w-5 h-5 mx-auto mb-2" style={{ color: '#B8860B' }} />
              <p className="text-sm" style={{ color: '#006666' }}>
                Đăng nhập để lưu lịch sử chat nhé ✨
              </p>
              <Link 
                to="/"
                className="inline-block mt-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  color: '#1a1a1a',
                }}
              >
                Về trang chủ đăng nhập
              </Link>
            </div>
          )}

          {/* New Chat Button */}
          <button
            onClick={startNewChat}
            className="flex items-center gap-2 w-full p-3 mb-4 rounded-xl transition-all hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #98FB98 100%)',
              boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
              color: '#1a1a1a',
            }}
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Cuộc trò chuyện mới</span>
          </button>

          {/* Conversations List - Only show if logged in */}
          {user && (
            <div className="flex-1 overflow-y-auto space-y-2">
              {conversations.map(conv => (
                <div
                  key={conv.id}
                  className={cn(
                    "group flex items-center gap-2 p-3 rounded-xl cursor-pointer transition-all",
                  )}
                  style={{
                    background: currentConversationId === conv.id 
                      ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(135, 206, 235, 0.3) 100%)'
                      : 'transparent',
                    border: currentConversationId === conv.id 
                      ? '1px solid rgba(184, 134, 11, 0.3)'
                      : '1px solid transparent',
                  }}
                  onClick={() => setCurrentConversationId(conv.id)}
                  onMouseEnter={(e) => {
                    if (currentConversationId !== conv.id) {
                      e.currentTarget.style.background = 'rgba(255, 215, 0, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentConversationId !== conv.id) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <MessageSquare className="w-4 h-4 flex-shrink-0" style={{ color: '#B8860B' }} />
                  <span className="flex-1 truncate text-sm" style={{ color: '#006666' }}>{conv.title}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConversationId(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              ))}
              {conversations.length === 0 && (
                <p className="text-center text-sm py-8" style={{ color: '#87CEEB' }}>
                  ✨ Chưa có cuộc trò chuyện nào
                </p>
              )}
            </div>
          )}

          {/* Guest mode empty state */}
          {!user && !authLoading && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-center text-sm px-4" style={{ color: '#87CEEB' }}>
                Chế độ khách - lịch sử chat sẽ mất khi tải lại trang
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Toggle Sidebar Button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        className="fixed lg:hidden z-30 top-4 left-4 p-2 rounded-lg shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #FFFBE6 0%, #FFF8DC 100%)',
          border: '1px solid rgba(184, 134, 11, 0.3)',
        }}
      >
        <MessageSquare className="w-5 h-5" style={{ color: '#B8860B' }} />
      </button>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative z-10">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-40"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(255, 215, 0, 0.3) 0%, transparent 70%)',
            }}
          />
        </div>

        <div className="relative z-10 flex-1 flex flex-col max-w-4xl mx-auto w-full px-4">
          {/* Welcome Screen */}
          {!hasMessages && (
            <div className="flex-1 flex flex-col items-center justify-center py-12">
              <div className="relative mb-6">
                <div 
                  className="w-24 h-24 rounded-full overflow-hidden shadow-lg"
                  style={{
                    border: '3px solid #FFD700',
                    boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)',
                  }}
                >
                  <img src={angelHero} alt="Angel AI" className="w-full h-full object-cover" />
                </div>
                <div 
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700 0%, #98FB98 100%)',
                    border: '2px solid #FFFBE6',
                    boxShadow: '0 0 15px rgba(255, 215, 0, 0.5)',
                  }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: '#1a1a1a' }} />
                </div>
              </div>

              <h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider mb-4"
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: '#B8860B',
                  textShadow: '0 0 30px rgba(255, 215, 0, 0.5), 0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                Angel AI
              </h1>
              <p 
                className="text-lg md:text-xl text-center max-w-md mb-8"
                style={{
                  fontFamily: "'Sacramento', cursive",
                  fontSize: '1.5rem',
                  background: 'linear-gradient(90deg, #87CEEB 0%, #FFD700 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Chat thông minh & Tạo hình ảnh AI ✨
              </p>

              {/* Guest Mode Notice in Main Area */}
              {!user && !authLoading && (
                <div 
                  className="mb-6 px-6 py-3 rounded-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2) 0%, rgba(135, 206, 235, 0.2) 100%)',
                    border: '1px solid rgba(184, 134, 11, 0.3)',
                  }}
                >
                  <p className="text-sm" style={{ color: '#006666' }}>
                    ✨ Đăng nhập để lưu lịch sử chat nhé ✨
                  </p>
                </div>
              )}

              {/* Mode Toggle */}
              <div 
                className="flex gap-2 mb-8 p-1 rounded-full"
                style={{
                  background: 'rgba(255, 215, 0, 0.2)',
                  border: '1px solid rgba(184, 134, 11, 0.3)',
                }}
              >
                <button
                  onClick={() => setMode('chat')}
                  className={cn(
                    "px-6 py-2 rounded-full text-sm font-medium transition-all",
                  )}
                  style={{
                    background: mode === 'chat' 
                      ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                      : 'transparent',
                    color: mode === 'chat' ? '#1a1a1a' : '#006666',
                    boxShadow: mode === 'chat' ? '0 4px 15px rgba(255, 215, 0, 0.4)' : 'none',
                  }}
                >
                  💬 Chat
                </button>
                <button
                  onClick={() => setMode('image')}
                  className={cn(
                    "px-6 py-2 rounded-full text-sm font-medium transition-all",
                  )}
                  style={{
                    background: mode === 'image' 
                      ? 'linear-gradient(135deg, #FF69B4 0%, #9370DB 100%)'
                      : 'transparent',
                    color: mode === 'image' ? '#FFFFFF' : '#006666',
                    boxShadow: mode === 'image' ? '0 4px 15px rgba(255, 105, 180, 0.4)' : 'none',
                  }}
                >
                  🎨 Tạo ảnh
                </button>
              </div>

              {/* Suggestions */}
              <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
                {SUGGESTIONS.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(suggestion)}
                    className="px-5 py-3 rounded-2xl text-sm font-medium transition-all duration-200 hover:scale-105"
                    style={{
                      background: 'rgba(255, 251, 230, 0.9)',
                      border: '1px solid rgba(184, 134, 11, 0.3)',
                      color: '#006666',
                      boxShadow: '0 4px 15px rgba(255, 215, 0, 0.2)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(135, 206, 235, 0.3) 100%)';
                      e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 215, 0, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 251, 230, 0.9)';
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.2)';
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {hasMessages && (
            <div className="flex-1 overflow-y-auto py-8 space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-4",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div 
                      className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden"
                      style={{
                        border: '2px solid #FFD700',
                        boxShadow: '0 0 15px rgba(255, 215, 0, 0.4)',
                      }}
                    >
                      <img src={angelHero} alt="Angel AI" className="w-full h-full object-cover" />
                    </div>
                  )}
                  
                  <div
                    className={cn(
                      "max-w-[75%] rounded-3xl",
                      message.imageUrl ? "p-3" : "px-5 py-4"
                    )}
                    style={{
                      background: message.role === 'user'
                        ? 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                        : 'rgba(255, 251, 230, 0.95)',
                      color: message.role === 'user' ? '#1a1a1a' : '#006666',
                      border: message.role === 'assistant' ? '1px solid rgba(184, 134, 11, 0.3)' : 'none',
                      boxShadow: message.role === 'user' 
                        ? '0 4px 20px rgba(255, 215, 0, 0.4)'
                        : '0 4px 15px rgba(184, 134, 11, 0.15)',
                      borderRadius: message.role === 'user' ? '24px 24px 8px 24px' : '24px 24px 24px 8px',
                    }}
                  >
                    {message.imageUrl && (
                      <div className="relative group">
                        <img 
                          src={message.imageUrl} 
                          alt="Generated by Angel AI"
                          className="w-full max-w-md rounded-2xl shadow-lg"
                        />
                        <button
                          onClick={() => downloadImage(message.imageUrl!)}
                          className="absolute top-3 right-3 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{
                            background: 'rgba(255, 215, 0, 0.9)',
                            boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
                          }}
                        >
                          <Download className="w-5 h-5" style={{ color: '#1a1a1a' }} />
                        </button>
                        {message.content && (
                          <p className="mt-3 px-2 text-sm" style={{ color: '#87CEEB' }}>{message.content}</p>
                        )}
                      </div>
                    )}

                    {!message.imageUrl && (
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                        {message.content}
                        {isLoading && index === messages.length - 1 && message.role === 'assistant' && !message.content && (
                          <span className="flex gap-1">
                            <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#FFD700', animationDelay: '0ms' }} />
                            <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#87CEEB', animationDelay: '150ms' }} />
                            <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#FFD700', animationDelay: '300ms' }} />
                          </span>
                        )}
                        {isLoading && index === messages.length - 1 && message.role === 'assistant' && message.content && !message.content.includes('Đang tạo') && (
                          <span className="inline-block w-2 h-5 ml-1 animate-pulse" style={{ background: '#FFD700' }} />
                        )}
                      </p>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div 
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)',
                        border: '2px solid rgba(135, 206, 235, 0.5)',
                        boxShadow: '0 0 15px rgba(135, 206, 235, 0.4)',
                      }}
                    >
                      <span className="text-sm font-semibold" style={{ color: '#006666' }}>Bạn</span>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input Area */}
          <div 
            className="sticky bottom-0 py-6"
            style={{
              background: 'linear-gradient(to top, rgba(255, 251, 230, 0.95) 0%, rgba(255, 251, 230, 0.8) 50%, transparent 100%)',
            }}
          >
            {hasMessages && (
              <div className="flex justify-center gap-2 mb-3">
                <button
                  onClick={() => setMode('chat')}
                  className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: mode === 'chat' 
                      ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.3) 0%, rgba(255, 165, 0, 0.3) 100%)'
                      : 'transparent',
                    border: mode === 'chat' ? '1px solid rgba(184, 134, 11, 0.4)' : '1px solid transparent',
                    color: mode === 'chat' ? '#B8860B' : '#87CEEB',
                  }}
                >
                  💬 Chat
                </button>
                <button
                  onClick={() => setMode('image')}
                  className="px-4 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: mode === 'image' 
                      ? 'linear-gradient(135deg, rgba(255, 105, 180, 0.3) 0%, rgba(147, 112, 219, 0.3) 100%)'
                      : 'transparent',
                    border: mode === 'image' ? '1px solid rgba(255, 105, 180, 0.4)' : '1px solid transparent',
                    color: mode === 'image' ? '#FF69B4' : '#87CEEB',
                  }}
                >
                  🎨 Tạo ảnh
                </button>
              </div>
            )}

            <div 
              className="relative flex items-end gap-3 p-2 rounded-3xl transition-all duration-300"
              style={{
                background: 'rgba(255, 251, 230, 0.95)',
                border: '1px solid rgba(184, 134, 11, 0.3)',
                boxShadow: '0 4px 20px rgba(255, 215, 0, 0.2)',
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={mode === 'image' ? "Mô tả hình ảnh bạn muốn tạo..." : "Nhập tin nhắn cho Angel AI..."}
                disabled={isLoading}
                rows={1}
                className="flex-1 px-4 py-3 bg-transparent resize-none focus:outline-none text-[15px] leading-relaxed max-h-[200px] disabled:opacity-50"
                style={{
                  color: '#006666',
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200"
                style={{
                  background: input.trim() && !isLoading
                    ? mode === 'image'
                      ? 'linear-gradient(135deg, #FF69B4 0%, #9370DB 100%)'
                      : 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)'
                    : 'rgba(184, 134, 11, 0.2)',
                  boxShadow: input.trim() && !isLoading 
                    ? mode === 'image'
                      ? '0 4px 15px rgba(255, 105, 180, 0.4)'
                      : '0 4px 15px rgba(255, 215, 0, 0.4)'
                    : 'none',
                  cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                }}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#B8860B' }} />
                ) : mode === 'image' ? (
                  <Image className="w-5 h-5" style={{ color: input.trim() ? '#FFFFFF' : '#B8860B' }} />
                ) : (
                  <ArrowUp className="w-5 h-5" style={{ color: input.trim() ? '#1a1a1a' : '#B8860B' }} />
                )}
              </button>
            </div>
            
            <p className="text-center text-xs mt-3" style={{ color: '#87CEEB' }}>
              {mode === 'image' 
                ? "✨ Tạo hình ảnh bằng AI. Mô tả càng chi tiết, kết quả càng đẹp."
                : "✨ Angel AI luôn đồng hành cùng bạn với Tình Yêu Thuần Khiết."
              }
            </p>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConversationId} onOpenChange={(open) => !open && setDeleteConversationId(null)}>
        <AlertDialogContent
          style={{
            background: 'linear-gradient(180deg, #FFFBE6 0%, #F0FFF4 100%)',
            border: '1px solid rgba(184, 134, 11, 0.3)',
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#B8860B' }}>
              ✨ Xóa cuộc trò chuyện? 🌿
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#006666' }}>
              Con có chắc xóa đoạn trò chuyện này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              style={{ color: '#006666', borderColor: 'rgba(184, 134, 11, 0.3)' }}
            >
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteConversation}
              style={{
                background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)',
                color: 'white',
              }}
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Chat;
