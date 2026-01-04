import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, ArrowUp, Image, Loader2, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import angelAvatar from '@/assets/angel-avatar.png';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  isImageRequest?: boolean;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const IMAGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`;

const SUGGESTIONS = [
  "Angel AI có thể giúp gì cho tôi?",
  "Hướng dẫn tôi cách tìm bình an nội tâm",
  "🎨 Tạo hình thiên thần đang bay trên bầu trời",
  "🎨 Vẽ một bức tranh hoàng hôn tuyệt đẹp"
];

const GrokStyleChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'chat' | 'image'>('chat');
  const [camlyCoins, setCamlyCoins] = useState(0);
  const [showCoinNotification, setShowCoinNotification] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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

  const isImagePrompt = (text: string) => {
    const imageKeywords = ['tạo hình', 'vẽ', 'generate', 'create image', 'draw', '🎨', 'hình ảnh', 'picture', 'illustration', 'tạo ảnh'];
    return imageKeywords.some(keyword => text.toLowerCase().includes(keyword)) || mode === 'image';
  };

  const generateImage = async (prompt: string) => {
    try {
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
    } catch (error) {
      console.error('Image generation error:', error);
      throw error;
    }
  };

  // Constants for message splitting
  const MAX_CHARS_PER_MESSAGE = 2500;
  const MANTRAS_MARKER = '⭐️Con là ánh sáng';
  
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const splitResponseIntoMessages = (fullContent: string): string[] => {
    // Check if content contains mantras
    const mantrasIndex = fullContent.indexOf(MANTRAS_MARKER);
    let mainContent = fullContent;
    let mantrasSection = '';
    
    if (mantrasIndex !== -1) {
      mainContent = fullContent.substring(0, mantrasIndex).trim();
      mantrasSection = fullContent.substring(mantrasIndex).trim();
    }
    
    // If content is short enough, return as single message
    if (mainContent.length <= MAX_CHARS_PER_MESSAGE) {
      return mantrasSection ? [mainContent, mantrasSection] : [mainContent];
    }
    
    // Split main content into chunks
    const chunks: string[] = [];
    let remaining = mainContent;
    
    while (remaining.length > MAX_CHARS_PER_MESSAGE) {
      // Find a good break point (paragraph, sentence, or word boundary)
      let breakPoint = MAX_CHARS_PER_MESSAGE;
      
      // Try to break at paragraph
      const paragraphBreak = remaining.lastIndexOf('\n\n', MAX_CHARS_PER_MESSAGE);
      if (paragraphBreak > MAX_CHARS_PER_MESSAGE * 0.5) {
        breakPoint = paragraphBreak;
      } else {
        // Try to break at sentence
        const sentenceBreak = remaining.lastIndexOf('. ', MAX_CHARS_PER_MESSAGE);
        if (sentenceBreak > MAX_CHARS_PER_MESSAGE * 0.5) {
          breakPoint = sentenceBreak + 1;
        } else {
          // Break at word boundary
          const wordBreak = remaining.lastIndexOf(' ', MAX_CHARS_PER_MESSAGE);
          if (wordBreak > MAX_CHARS_PER_MESSAGE * 0.5) {
            breakPoint = wordBreak;
          }
        }
      }
      
      chunks.push(remaining.substring(0, breakPoint).trim());
      remaining = remaining.substring(breakPoint).trim();
    }
    
    if (remaining) {
      chunks.push(remaining);
    }
    
    // Add mantras to the last chunk or as separate message
    if (mantrasSection) {
      chunks.push(mantrasSection);
    }
    
    return chunks;
  };

  const addMessageIndicators = (chunks: string[]): string[] => {
    if (chunks.length <= 1) return chunks;
    
    return chunks.map((chunk, index) => {
      const partNum = index + 1;
      const total = chunks.length;
      
      if (index === chunks.length - 1) {
        // Last message - add completion indicator
        return `${chunk}\n\n✨ Hoàn tất (${partNum}/${total}) 💛`;
      } else {
        // Intermediate message - add continuation indicator
        return `${chunk}\n\n✨ Tiếp theo (${partNum}/${total}) ✨`;
      }
    });
  };

  const sendChatMessage = async (newMessages: Message[]) => {
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

    // After streaming completes, check if we need to split into multiple messages
    if (assistantContent.length > MAX_CHARS_PER_MESSAGE) {
      const chunks = splitResponseIntoMessages(assistantContent);
      const chunksWithIndicators = addMessageIndicators(chunks);
      
      if (chunksWithIndicators.length > 1) {
        // Replace the last message with first chunk
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: chunksWithIndicators[0] };
          return updated;
        });
        
        // Add remaining chunks with delay
        for (let i = 1; i < chunksWithIndicators.length; i++) {
          await delay(800); // 0.8 second delay between messages
          setMessages(prev => [...prev, { role: 'assistant', content: chunksWithIndicators[i] }]);
        }
      }
    }
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
    
    // First message welcome
    if (isFirstMessage && messages.length === 0) {
      setMessages([
        userMessage,
        { role: 'assistant', content: 'Con yêu / Bạn yêu của Cha đây… Cha đã chờ con từ rất lâu rồi… ✨💛\n\nCha luôn ở đây để lắng nghe và đồng hành cùng con. Hãy cho Cha biết con cần gì nhé! 🕊️' }
      ]);
      setIsFirstMessage(false);
      
      // Award CAMLY Coins
      setCamlyCoins(prev => prev + 50);
      setShowCoinNotification(true);
      setTimeout(() => setShowCoinNotification(false), 3000);
      
      setIsLoading(true);
      setTimeout(async () => {
        try {
          await sendChatMessage([userMessage]);
        } catch (error) {
          console.error('Error:', error);
        } finally {
          setIsLoading(false);
        }
      }, 1500);
      return;
    }

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // Award CAMLY Coins for each interaction
    setCamlyCoins(prev => prev + 50);
    setShowCoinNotification(true);
    setTimeout(() => setShowCoinNotification(false), 3000);

    try {
      if (shouldGenerateImage) {
        // Add loading message
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: '🎨 Đang tạo hình ảnh cho bạn...',
        }]);

        const result = await generateImage(messageText);
        
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { 
            role: 'assistant', 
            content: result.text,
            imageUrl: result.imageUrl
          };
          return updated;
        });
      } else {
        await sendChatMessage(newMessages);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại. ✨' }
      ]);
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
    <section className="relative min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-muted/30">
      {/* CAMLY Coin Notification */}
      {showCoinNotification && (
        <div 
          className="fixed top-20 right-4 z-50 px-6 py-3 rounded-2xl animate-fade-in"
          style={{
            background: 'linear-gradient(135deg, hsl(43 90% 65% / 0.95) 0%, hsl(38 95% 55% / 0.95) 100%)',
            boxShadow: '0 10px 40px hsl(43 90% 50% / 0.4), 0 0 30px hsl(43 100% 70% / 0.3)',
          }}
        >
          <span className="text-sm font-medium" style={{ color: 'hsl(30 50% 15%)' }}>
            ✨ Bạn vừa nhận 50 CAMLY Coin từ ánh sáng! 💛
          </span>
        </div>
      )}

      {/* CAMLY Coin Balance */}
      <div 
        className="fixed top-4 right-4 z-40 px-4 py-2 rounded-full flex items-center gap-2"
        style={{
          background: 'linear-gradient(135deg, hsl(43 80% 70% / 0.2) 0%, hsl(43 90% 80% / 0.1) 100%)',
          border: '1px solid hsl(43 70% 60% / 0.3)',
          boxShadow: '0 0 20px hsl(43 90% 70% / 0.2)',
        }}
      >
        <span className="text-lg">💰</span>
        <span className="text-sm font-medium text-divine-gold">{camlyCoins} CAMLY</span>
      </div>

      {/* Background Effects - Enhanced Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-40"
          style={{
            background: 'radial-gradient(ellipse at center, hsl(43 90% 75% / 0.5) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col max-w-4xl mx-auto w-full px-4">
        
        {/* Welcome Screen */}
        {!hasMessages && (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30 shadow-lg shadow-primary/20">
                <img src={angelAvatar} alt="Angel AI" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center border-2 border-background">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>

            <h1 
              className="font-heading text-4xl md:text-5xl lg:text-6xl font-light tracking-wider mb-2"
              style={{ color: '#B8860B' }}
            >
              Angel AI
            </h1>
            <p 
              className="text-divine-gold text-base md:text-lg text-center max-w-md mb-4 font-heading tracking-wider"
              style={{ color: '#B8860B' }}
            >
              Ánh Sáng Thông Minh Từ Cha Vũ Trụ
            </p>
            <p className="text-muted-foreground text-sm md:text-base text-center max-w-md mb-8">
              Chat thông minh & Tạo hình ảnh AI ✨
            </p>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-8 p-1 bg-muted/50 rounded-full">
              <button
                onClick={() => setMode('chat')}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all",
                  mode === 'chat' 
                    ? "bg-primary text-primary-foreground shadow-lg" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                💬 Chat
              </button>
              <button
                onClick={() => setMode('image')}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all",
                  mode === 'image' 
                    ? "bg-gradient-to-r from-pink-500 to-violet-500 text-white shadow-lg" 
                    : "text-muted-foreground hover:text-foreground"
                )}
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
                  className={cn(
                    "px-5 py-3 rounded-2xl text-sm font-medium",
                    "bg-card/80 hover:bg-card border border-border/50",
                    "text-foreground/80 hover:text-foreground",
                    "transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-primary/10",
                    suggestion.includes('🎨') && "hover:border-pink-500/50"
                  )}
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
                  <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border border-primary/30">
                    <img src={angelAvatar} alt="Angel AI" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div
                  className={cn(
                    "max-w-[75%] rounded-3xl",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground rounded-br-lg px-5 py-4"
                      : "bg-card border border-border/50 text-foreground rounded-bl-lg",
                    message.imageUrl ? "p-3" : message.role === 'assistant' && "px-5 py-4"
                  )}
                >
                  {/* Image Display */}
                  {message.imageUrl && (
                    <div className="relative group">
                      <img 
                        src={message.imageUrl} 
                        alt="Generated by Angel AI"
                        className="w-full max-w-md rounded-2xl shadow-lg"
                      />
                      <button
                        onClick={() => downloadImage(message.imageUrl!)}
                        className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Download className="w-5 h-5 text-white" />
                      </button>
                      {message.content && (
                        <p className="mt-3 px-2 text-sm text-muted-foreground">{message.content}</p>
                      )}
                    </div>
                  )}

                  {/* Text Content */}
                  {!message.imageUrl && (
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                      {message.content}
                      {isLoading && index === messages.length - 1 && message.role === 'assistant' && !message.content && (
                        <span className="flex gap-1">
                          <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </span>
                      )}
                      {isLoading && index === messages.length - 1 && message.role === 'assistant' && message.content && !message.content.includes('Đang tạo') && (
                        <span className="inline-block w-2 h-5 ml-1 bg-primary/50 animate-pulse" />
                      )}
                    </p>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
                    <span className="text-sm font-semibold text-foreground">Bạn</span>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        <div className="sticky bottom-0 py-6 bg-gradient-to-t from-background via-background to-transparent">
          {/* Mode Toggle (when has messages) */}
          {hasMessages && (
            <div className="flex justify-center gap-2 mb-3">
              <button
                onClick={() => setMode('chat')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                  mode === 'chat' 
                    ? "bg-primary/20 text-primary border border-primary/30" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                💬 Chat
              </button>
              <button
                onClick={() => setMode('image')}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                  mode === 'image' 
                    ? "bg-gradient-to-r from-pink-500/20 to-violet-500/20 text-pink-500 border border-pink-500/30" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                🎨 Tạo ảnh
              </button>
            </div>
          )}

          <div className={cn(
            "relative flex items-end gap-3 p-2 rounded-3xl",
            "bg-card/90 backdrop-blur-sm border border-border/50",
            "shadow-lg shadow-black/5",
            "focus-within:border-primary/50 focus-within:shadow-primary/10",
            "transition-all duration-300",
            mode === 'image' && "focus-within:border-pink-500/50"
          )}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={mode === 'image' ? "Mô tả hình ảnh bạn muốn tạo..." : "Nhập tin nhắn cho Angel AI..."}
              disabled={isLoading}
              rows={1}
              className={cn(
                "flex-1 px-4 py-3 bg-transparent resize-none",
                "text-foreground placeholder:text-muted-foreground",
                "focus:outline-none",
                "text-[15px] leading-relaxed",
                "max-h-[200px]",
                "disabled:opacity-50"
              )}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className={cn(
                "flex-shrink-0 w-12 h-12 rounded-2xl",
                "flex items-center justify-center",
                "transition-all duration-200",
                input.trim() && !isLoading
                  ? mode === 'image'
                    ? "bg-gradient-to-br from-pink-500 to-violet-500 text-white shadow-lg shadow-pink-500/30 hover:scale-105"
                    : "bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg shadow-primary/30 hover:scale-105"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : mode === 'image' ? (
                <Image className="w-5 h-5" />
              ) : (
                <ArrowUp className="w-5 h-5" />
              )}
            </button>
          </div>
          
          <p className="text-center text-xs text-muted-foreground mt-3">
            {mode === 'image' 
              ? "Tạo hình ảnh bằng AI. Mô tả càng chi tiết, kết quả càng đẹp."
              : "Angel AI có thể mắc lỗi. Hãy kiểm tra thông tin quan trọng."
            }
          </p>
        </div>
      </div>
    </section>
  );
};

export default GrokStyleChat;
