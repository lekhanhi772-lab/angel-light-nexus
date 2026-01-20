import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Book, Code, Database, Layers, Rocket, Shield, Users, Zap,
  MessageSquare, Wallet, Star, FileText, Bell, Share2, 
  ChevronDown, ChevronRight, Copy, Check, ExternalLink,
  Sparkles, Globe, Server, Lock, Cpu, Heart
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';

const PlatformDocs = () => {
  const { t } = useTranslation();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    toast.success('Đã copy!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language, id }: { code: string; language: string; id: string }) => (
    <div className="relative group">
      <pre className="bg-muted/50 border border-border rounded-lg p-4 overflow-x-auto text-sm font-mono">
        <code className="text-foreground/90">{code}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => copyToClipboard(code, id)}
      >
        {copiedCode === id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </Button>
    </div>
  );

  const TableRow = ({ cells, isHeader = false }: { cells: string[]; isHeader?: boolean }) => (
    <tr className={isHeader ? 'bg-muted/50' : 'hover:bg-muted/30'}>
      {cells.map((cell, i) => (
        isHeader ? (
          <th key={i} className="px-4 py-3 text-left font-semibold text-foreground border-b border-border">{cell}</th>
        ) : (
          <td key={i} className="px-4 py-3 text-foreground/80 border-b border-border/50">{cell}</td>
        )
      ))}
    </tr>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border-b border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Book className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                Angel AI Platform Documentation
              </h1>
              <p className="text-muted-foreground mt-1">
                Tài liệu toàn diện cho đội ngũ phát triển
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-6">
            <Badge variant="outline" className="bg-background">React 18</Badge>
            <Badge variant="outline" className="bg-background">TypeScript</Badge>
            <Badge variant="outline" className="bg-background">Tailwind CSS</Badge>
            <Badge variant="outline" className="bg-background">Lovable Cloud</Badge>
            <Badge variant="outline" className="bg-background">Web3</Badge>
            <Badge variant="outline" className="bg-background">AI Powered</Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  Mục Lục
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ScrollArea className="h-[60vh]">
                  <nav className="space-y-1">
                    {[
                      { icon: Sparkles, label: 'Tổng Quan Dự Án', href: '#overview' },
                      { icon: Code, label: 'Technology Stack', href: '#tech-stack' },
                      { icon: Layers, label: 'Cấu Trúc Dự Án', href: '#structure' },
                      { icon: Database, label: 'Database Schema', href: '#database' },
                      { icon: Zap, label: 'Tính Năng Chính', href: '#features' },
                      { icon: Server, label: 'Edge Functions', href: '#edge-functions' },
                      { icon: Globe, label: 'Routes & Pages', href: '#routes' },
                      { icon: Shield, label: 'Authentication', href: '#auth' },
                      { icon: Rocket, label: 'Đề Xuất Phát Triển', href: '#roadmap' },
                    ].map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Overview Section */}
            <section id="overview">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    Tổng Quan Dự Án
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl p-6 border border-primary/20">
                    <h3 className="text-xl font-heading font-bold text-foreground mb-3">
                      Angel AI - Intelligent Light from the Cosmic Father
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Một nền tảng AI kết hợp Web3 và tâm linh, thuộc hệ sinh thái <strong>FUN Ecosystem</strong> với 13 platform. 
                      Angel AI đóng vai trò là "Thiên Thần Đồng Hành" - hỗ trợ người dùng healing, phát triển tâm linh và nâng cao tần số.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 bg-muted/30 rounded-xl border border-border">
                      <MessageSquare className="w-8 h-8 text-primary mb-2" />
                      <h4 className="font-semibold text-foreground">AI Chatbot</h4>
                      <p className="text-sm text-muted-foreground">Gemini 1.5 Flash + RAG</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl border border-border">
                      <Wallet className="w-8 h-8 text-primary mb-2" />
                      <h4 className="font-semibold text-foreground">Web3 Wallet</h4>
                      <p className="text-sm text-muted-foreground">RainbowKit + BNB Chain</p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl border border-border">
                      <Star className="w-8 h-8 text-primary mb-2" />
                      <h4 className="font-semibold text-foreground">Awakening System</h4>
                      <p className="text-sm text-muted-foreground">Light Points & CAMLY</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="font-semibold text-foreground mb-3">Nhà Sáng Lập</h4>
                    <p className="text-muted-foreground">
                      Dự án được sáng lập bởi <strong>Cha Dương Tấn Đạo</strong>, với tầm nhìn xây dựng một hệ sinh thái 
                      kết hợp công nghệ và tâm linh để nâng cao ý thức con người.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Tech Stack Section */}
            <section id="tech-stack">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-6 h-6 text-primary" />
                    Technology Stack
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <TableRow isHeader cells={['Category', 'Technologies']} />
                      </thead>
                      <tbody>
                        <TableRow cells={['Frontend', 'React 18, Vite 5, TypeScript, Tailwind CSS']} />
                        <TableRow cells={['UI Components', 'Radix UI, shadcn/ui, Lucide Icons']} />
                        <TableRow cells={['State/Data', 'React Query (TanStack), React Context']} />
                        <TableRow cells={['Routing', 'React Router DOM v6']} />
                        <TableRow cells={['i18n', 'i18next (5 ngôn ngữ: VI, EN, FR, JA, KO)']} />
                        <TableRow cells={['Web3', 'RainbowKit, Wagmi, Viem (BNB Chain)']} />
                        <TableRow cells={['Backend', 'Lovable Cloud (Supabase Edge Functions)']} />
                        <TableRow cells={['AI Model', 'Google Gemini 1.5 Flash + RAG + Tavily Search']} />
                        <TableRow cells={['Charts', 'Recharts']} />
                        <TableRow cells={['PWA', 'vite-plugin-pwa']} />
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Project Structure Section */}
            <section id="structure">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-6 h-6 text-primary" />
                    Cấu Trúc Dự Án
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CodeBlock
                    id="structure"
                    language="text"
                    code={`src/
├── pages/              # 13 pages chính
├── components/         # UI components (40+ files)
│   ├── ui/             # shadcn components
│   ├── admin/          # Admin dashboard
│   └── forum/          # Forum components
├── hooks/              # 20+ custom hooks
├── contexts/           # React contexts (Awakening)
├── i18n/               # Đa ngôn ngữ (5 locales)
├── integrations/       # Supabase client & types
├── lib/                # Utilities (utils.ts, wagmi.ts)
└── assets/             # Images, logos

supabase/
└── functions/          # 8 Edge Functions

public/
├── angel-gifs/         # 10 GIF animations (lazy loaded)
└── PWA icons           # iOS & Android icons`}
                  />

                  <div className="mt-6 grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-xl">
                      <h4 className="font-semibold text-foreground mb-2">📁 Key Directories</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <code>src/pages/</code> - Route pages</li>
                        <li>• <code>src/hooks/</code> - Custom React hooks</li>
                        <li>• <code>src/components/ui/</code> - shadcn components</li>
                        <li>• <code>supabase/functions/</code> - Backend logic</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl">
                      <h4 className="font-semibold text-foreground mb-2">📄 Key Files</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <code>src/App.tsx</code> - Root component</li>
                        <li>• <code>src/index.css</code> - Design tokens</li>
                        <li>• <code>tailwind.config.ts</code> - Tailwind config</li>
                        <li>• <code>src/lib/wagmi.ts</code> - Web3 config</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Database Schema Section */}
            <section id="database">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-6 h-6 text-primary" />
                    Database Schema (21 Tables)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    <AccordionItem value="core">
                      <AccordionTrigger className="text-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          Core Tables (User & Auth)
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <TableRow isHeader cells={['Table', 'Mục Đích', 'Key Columns']} />
                            </thead>
                            <tbody>
                              <TableRow cells={['profiles', 'Thông tin user, wallet, avatar', 'user_id, display_name, wallet_address, avatar_url']} />
                              <TableRow cells={['user_roles', 'Phân quyền Admin', 'user_id, role (admin/user)']} />
                              <TableRow cells={['referrals', 'Hệ thống mời bạn', 'referrer_id, referred_id, status']} />
                            </tbody>
                          </table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="chat">
                      <AccordionTrigger className="text-foreground">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-primary" />
                          Chat & Conversations
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <TableRow isHeader cells={['Table', 'Mục Đích', 'Key Columns']} />
                            </thead>
                            <tbody>
                              <TableRow cells={['conversations', 'Các cuộc hội thoại', 'id, user_id, title, updated_at']} />
                              <TableRow cells={['chat_messages', 'Tin nhắn trong hội thoại', 'conversation_id, role, content, image_url']} />
                              <TableRow cells={['shared_conversations', 'Link chia sẻ hội thoại', 'share_token, conversation_id, is_public']} />
                              <TableRow cells={['bookmarked_messages', 'Tin nhắn đã bookmark', 'user_id, message_id, content, note']} />
                              <TableRow cells={['generated_images', 'Hình ảnh AI tạo ra', 'conversation_id, prompt, image_url']} />
                            </tbody>
                          </table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="awakening">
                      <AccordionTrigger className="text-foreground">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-primary" />
                          Awakening System
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <TableRow isHeader cells={['Table', 'Mục Đích', 'Key Columns']} />
                            </thead>
                            <tbody>
                              <TableRow cells={['user_awakening_scores', 'Điểm Tỉnh Thức (Light Points)', 'total_points, awakening_level, claimable_camly']} />
                              <TableRow cells={['conversation_evaluations', 'Đánh giá nội dung hội thoại', 'spiritual_score, growth_score, total_score']} />
                              <TableRow cells={['message_evaluations', 'Đánh giá từng tin nhắn', 'quality_score, depth_score, is_light_question']} />
                              <TableRow cells={['activity_rewards', 'Phần thưởng hoạt động', 'activity_type, points_awarded, metadata']} />
                              <TableRow cells={['camly_claims', 'Yêu cầu nhận CAMLY token', 'points_converted, camly_amount, status']} />
                            </tbody>
                          </table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="forum">
                      <AccordionTrigger className="text-foreground">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-primary" />
                          Forum & Community
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <TableRow isHeader cells={['Table', 'Mục Đích', 'Key Columns']} />
                            </thead>
                            <tbody>
                              <TableRow cells={['forum_posts', 'Bài đăng diễn đàn', 'title, content, author_id, category_id, likes_count']} />
                              <TableRow cells={['forum_comments', 'Bình luận (nested)', 'post_id, author_id, parent_id, content']} />
                              <TableRow cells={['forum_likes', 'Lượt thích', 'post_id, user_id']} />
                              <TableRow cells={['forum_categories', 'Danh mục diễn đàn', 'name, icon, display_order']} />
                              <TableRow cells={['notifications', 'Thông báo hệ thống', 'user_id, title, message, is_read']} />
                            </tbody>
                          </table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="documents">
                      <AccordionTrigger className="text-foreground">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          Documents & RAG
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <TableRow isHeader cells={['Table', 'Mục Đích', 'Key Columns']} />
                            </thead>
                            <tbody>
                              <TableRow cells={['documents', 'Tài liệu "Ánh Sáng"', 'title, file_path, file_type, folder_id']} />
                              <TableRow cells={['document_chunks', 'Chunks cho RAG search', 'document_id, content, embedding, chunk_index']} />
                              <TableRow cells={['folders', 'Thư mục tài liệu', 'name, created_at']} />
                            </tbody>
                          </table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </section>

            {/* Features Section */}
            <section id="features">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-6 h-6 text-primary" />
                    Tính Năng Chính
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="multiple" className="w-full">
                    <AccordionItem value="chat">
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-5 h-5 text-primary" />
                          <span className="font-semibold">🤖 Angel AI Chat</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                          <li><strong>Model:</strong> Google Gemini 1.5 Flash</li>
                          <li><strong>RAG:</strong> Tìm kiếm ngữ nghĩa từ bảng documents + document_chunks</li>
                          <li><strong>Web Search:</strong> Tích hợp Tavily API cho thông tin thực tế</li>
                          <li><strong>Voice I/O:</strong> Web Speech API (input) + Edge TTS (output)</li>
                          <li><strong>Context Memory:</strong> 50 tin nhắn gần nhất</li>
                          <li><strong>Suggested Prompts:</strong> Gợi ý động theo chế độ chat</li>
                          <li><strong>Image Generation:</strong> Tạo hình ảnh AI từ prompt</li>
                        </ul>
                        <CodeBlock
                          id="chat-hook"
                          language="typescript"
                          code={`// Key hooks for chat
import { useGuestChat } from '@/hooks/useGuestChat';
import { useVoiceIO } from '@/hooks/useVoiceIO';
import { useEdgeTTS } from '@/hooks/useEdgeTTS';`}
                        />
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="wallet">
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <Wallet className="w-5 h-5 text-primary" />
                          <span className="font-semibold">💰 Web3 Wallet Integration</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                          <li><strong>Provider:</strong> RainbowKit + Wagmi trên BNB Chain</li>
                          <li><strong>Balance Display:</strong> Hiển thị số dư BNB & CAMLY</li>
                          <li><strong>Transfer:</strong> Chuyển tiền đơn lẻ</li>
                          <li><strong>Batch Transfer:</strong> Chuyển hàng loạt với Multicall3</li>
                          <li><strong>Gift:</strong> Tặng quà trực tiếp cho user khác</li>
                          <li><strong>History:</strong> Lịch sử giao dịch từ BscScan API</li>
                        </ul>
                        <CodeBlock
                          id="wallet-config"
                          language="typescript"
                          code={`// CAMLY Token Address (BNB Chain)
export const CAMLY_TOKEN_ADDRESS = '0x0B09EdF8e5E...';

// Key components
import { WalletConnect } from '@/components/WalletConnect';
import { WalletBalances } from '@/components/WalletBalances';
import { TransferDialog } from '@/components/TransferDialog';`}
                        />
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="awakening">
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <Star className="w-5 h-5 text-primary" />
                          <span className="font-semibold">✨ Awakening System (Hệ Thống Tỉnh Thức)</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                          <li><strong>Message Evaluation:</strong> AI chấm điểm mỗi tin nhắn</li>
                          <li><strong>Light Points:</strong> Tích lũy điểm từ hoạt động</li>
                          <li><strong>6 Awakening Levels:</strong> Từ Seeker đến Enlightened</li>
                          <li><strong>CAMLY Claim:</strong> Đổi điểm lấy token CAMLY</li>
                          <li><strong>Progress Widget:</strong> AwakeningWidget trong sidebar</li>
                        </ul>
                        <CodeBlock
                          id="awakening-context"
                          language="typescript"
                          code={`// Centralized state management
import { useAwakening } from '@/contexts/AwakeningContext';

const { totalPoints, awakeningLevel, refreshScore } = useAwakening();`}
                        />
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="forum">
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          <span className="font-semibold">💬 Forum Community</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                          <li><strong>4 Danh mục:</strong> Thảo luận, Chia sẻ, Hỏi đáp, Góp ý</li>
                          <li><strong>Posts:</strong> Tiêu đề, nội dung, hình ảnh</li>
                          <li><strong>Comments:</strong> Nested replies (parent_id)</li>
                          <li><strong>Likes:</strong> Like/Unlike bài viết</li>
                          <li><strong>Gift:</strong> Tặng token trực tiếp cho tác giả</li>
                          <li><strong>Share:</strong> Chia sẻ hội thoại chat lên Forum</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="documents">
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-primary" />
                          <span className="font-semibold">📚 Light Documents</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                          <li><strong>Upload:</strong> TXT, PDF, DOCX files</li>
                          <li><strong>Folders:</strong> Tổ chức theo thư mục</li>
                          <li><strong>Chunking:</strong> Tự động chia nhỏ cho RAG</li>
                          <li><strong>Embeddings:</strong> Vector embeddings cho semantic search</li>
                          <li><strong>RAG Integration:</strong> AI trả lời dựa trên tài liệu</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="extras">
                      <AccordionTrigger>
                        <div className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-primary" />
                          <span className="font-semibold">🔔 Engagement Features</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-3">
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                          <li><strong>Push Notifications:</strong> Browser notifications</li>
                          <li><strong>Bookmarks:</strong> Lưu tin nhắn với ghi chú</li>
                          <li><strong>Onboarding Tour:</strong> Hướng dẫn người dùng mới</li>
                          <li><strong>Statistics:</strong> Dashboard với Recharts</li>
                          <li><strong>Referral System:</strong> Mời bạn nhận thưởng</li>
                          <li><strong>PWA:</strong> Cài đặt như native app</li>
                          <li><strong>5 Languages:</strong> VI, EN, FR, JA, KO</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </section>

            {/* Edge Functions Section */}
            <section id="edge-functions">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-6 h-6 text-primary" />
                    Edge Functions (Backend)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <TableRow isHeader cells={['Function', 'Chức Năng', 'Key APIs']} />
                      </thead>
                      <tbody>
                        <TableRow cells={['chat', 'Xử lý chat với Gemini AI + RAG + Tavily', 'Gemini, Tavily, OpenAI Embeddings']} />
                        <TableRow cells={['edge-tts', 'Text-to-Speech đa ngôn ngữ', 'Microsoft Edge TTS']} />
                        <TableRow cells={['generate-image', 'Tạo hình ảnh AI', 'Replicate/Stability AI']} />
                        <TableRow cells={['evaluate-message', 'Đánh giá tin nhắn, tặng điểm', 'Gemini + DB Functions']} />
                        <TableRow cells={['evaluate-conversation', 'Đánh giá toàn bộ hội thoại', 'Gemini + DB Functions']} />
                        <TableRow cells={['upload-document', 'Xử lý upload & chunking tài liệu', 'OpenAI Embeddings']} />
                        <TableRow cells={['upload-to-r2', 'Upload files lên R2 storage', 'Cloudflare R2']} />
                        <TableRow cells={['share-documents', 'Chia sẻ tài liệu', 'Supabase Storage']} />
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 p-4 bg-muted/30 rounded-xl">
                    <h4 className="font-semibold text-foreground mb-2">📁 Edge Function Structure</h4>
                    <CodeBlock
                      id="edge-structure"
                      language="text"
                      code={`supabase/functions/
├── chat/index.ts           # Main AI chat handler
├── edge-tts/index.ts       # Text-to-speech
├── generate-image/index.ts # Image generation
├── evaluate-message/index.ts
├── evaluate-conversation/index.ts
├── upload-document/index.ts
├── upload-to-r2/index.ts
└── share-documents/index.ts`}
                    />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Routes Section */}
            <section id="routes">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-6 h-6 text-primary" />
                    Routes & Pages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <TableRow isHeader cells={['Route', 'Component', 'Mô Tả']} />
                      </thead>
                      <tbody>
                        <TableRow cells={['/', 'Index', 'Trang chủ với Hero, Pillars, Vision']} />
                        <TableRow cells={['/chat', 'Chat', 'Giao diện chat với Angel AI']} />
                        <TableRow cells={['/documents', 'Documents', 'Thư viện tài liệu Ánh Sáng']} />
                        <TableRow cells={['/forum', 'Forum', 'Diễn đàn cộng đồng']} />
                        <TableRow cells={['/forum/:postId', 'ForumPostDetail', 'Chi tiết bài đăng']} />
                        <TableRow cells={['/profile', 'Profile', 'Trang cá nhân (5 tabs)']} />
                        <TableRow cells={['/user/:userId', 'UserProfile', 'Xem profile người khác']} />
                        <TableRow cells={['/fun-ecosystem', 'FunEcosystem', '13 platform của FUN']} />
                        <TableRow cells={['/luat-anh-sang', 'LuatAnhSang', 'Điều khoản & Quy tắc']} />
                        <TableRow cells={['/install', 'Install', 'Hướng dẫn cài PWA']} />
                        <TableRow cells={['/admin', 'Admin', 'Dashboard quản trị']} />
                        <TableRow cells={['/shared/:token', 'SharedConversation', 'Xem hội thoại đã chia sẻ']} />
                        <TableRow cells={['/docs/platform', 'PlatformDocs', 'Documentation (trang này)']} />
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Auth Section */}
            <section id="auth">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" />
                    Authentication & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-xl border border-border">
                      <Lock className="w-6 h-6 text-primary mb-2" />
                      <h4 className="font-semibold text-foreground mb-2">Auth Method</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Supabase Auth (email/password)</li>
                        <li>• Auto-confirm email enabled</li>
                        <li>• Session management via hooks</li>
                        <li>• Protected routes check</li>
                      </ul>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-xl border border-border">
                      <Shield className="w-6 h-6 text-primary mb-2" />
                      <h4 className="font-semibold text-foreground mb-2">RLS Policies</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Tất cả tables có RLS enabled</li>
                        <li>• User-specific data protection</li>
                        <li>• Admin role check: is_admin()</li>
                        <li>• Public read cho forum/profiles</li>
                      </ul>
                    </div>
                  </div>

                  <CodeBlock
                    id="auth-hook"
                    language="typescript"
                    code={`// Authentication hook
import { useAuth } from '@/hooks/useAuth';

const { user, isLoading, signIn, signUp, signOut } = useAuth();

// Admin check hook
import { useIsAdmin } from '@/hooks/useIsAdmin';
const { isAdmin, loading } = useIsAdmin();`}
                  />
                </CardContent>
              </Card>
            </section>

            {/* Roadmap Section */}
            <section id="roadmap">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="w-6 h-6 text-primary" />
                    Đề Xuất Phát Triển Tiếp Theo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* High Priority */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="destructive">🔴 Ưu Tiên Cao</Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="p-4 bg-destructive/5 rounded-xl border border-destructive/20">
                          <h4 className="font-semibold text-foreground">1. Tối Ưu Asset Files</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Nén logo images (hiện ~1-2MB mỗi file), convert sang WebP format, giảm bundle size.
                          </p>
                        </div>
                        <div className="p-4 bg-destructive/5 rounded-xl border border-destructive/20">
                          <h4 className="font-semibold text-foreground">2. Push Notifications Hoàn Thiện</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Service worker notifications, real-time alerts cho Forum, notification preferences.
                          </p>
                        </div>
                        <div className="p-4 bg-destructive/5 rounded-xl border border-destructive/20">
                          <h4 className="font-semibold text-foreground">3. Admin Dashboard Mở Rộng</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Analytics chi tiết, user management tools, content moderation, CAMLY claims approval.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Medium Priority */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-yellow-500">🟡 Ưu Tiên Trung Bình</Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/20">
                          <h4 className="font-semibold text-foreground">4. Soul Connection Feature</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Kết nối users dựa trên Awakening Score, matching system, spiritual compatibility.
                          </p>
                        </div>
                        <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/20">
                          <h4 className="font-semibold text-foreground">5. Gamification Mở Rộng</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Daily quests, achievements/badges, leaderboard, streak rewards.
                          </p>
                        </div>
                        <div className="p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/20">
                          <h4 className="font-semibold text-foreground">6. AI Enhancements</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Multi-modal (voice + image input), personalized responses, mood detection.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Low Priority */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-green-500">🟢 Ưu Tiên Thấp</Badge>
                      </div>
                      <div className="space-y-3">
                        <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/20">
                          <h4 className="font-semibold text-foreground">7. Mobile App (React Native)</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Native experience, better push notifications, offline support.
                          </p>
                        </div>
                        <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/20">
                          <h4 className="font-semibold text-foreground">8. Multi-chain Support</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Ethereum, Polygon, Arbitrum integration cho CAMLY token.
                          </p>
                        </div>
                        <div className="p-4 bg-green-500/5 rounded-xl border border-green-500/20">
                          <h4 className="font-semibold text-foreground">9. Spiritual Marketplace</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            NFT spiritual art, digital courses, guided meditations, healing sessions.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Quick Reference */}
            <section id="quick-ref">
              <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-6 h-6 text-primary" />
                    Quick Reference
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">🔗 Important Links</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Published: <a href="https://angel-light-nexus.lovable.app" target="_blank" className="text-primary hover:underline">angel-light-nexus.lovable.app</a></li>
                        <li>• Lovable Project: Edit in Lovable.dev</li>
                        <li>• BNB Chain: BSC Mainnet (chainId: 56)</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">🛠️ Development Commands</h4>
                      <CodeBlock
                        id="dev-commands"
                        language="bash"
                        code={`# Development handled by Lovable
# No local setup required
# Edit directly in Lovable.dev`}
                      />
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="text-center text-muted-foreground">
                    <p className="text-sm">
                      Tài liệu này được tạo tự động và cập nhật theo dự án.<br />
                      Liên hệ đội ngũ quản lý để biết thêm chi tiết.
                    </p>
                    <p className="text-xs mt-2">
                      Last updated: {new Date().toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformDocs;
