

## Kế hoạch nâng cấp: AI Tự Động Đặt Tiêu Đề Hội Thoại

### Mục tiêu
Khi user mở dialog Chia sẻ và chọn tab "Sao Chép", Angel AI sẽ tự động phân tích toàn bộ hội thoại và tạo ra một **tiêu đề ngắn gọn, súc tích** phản ánh nội dung chính của cuộc trò chuyện.

---

### Thiết kế tính năng

#### Luồng hoạt động:

```
User mở Share Dialog
    ↓
Tự động gọi AI để phân tích messages
    ↓
AI trả về tiêu đề phù hợp (10-50 ký tự)
    ↓
Hiển thị tiêu đề trong header đoạn copy
```

#### Ví dụ:

| Nội dung hội thoại | Tiêu đề AI tạo ra |
|-------------------|-------------------|
| Hỏi về Tâm là gì, review tâm... | "Khám phá về Tâm và Review Tâm" |
| Hỏi về FUN Ecosystem | "Giới thiệu FUN Ecosystem" |
| Thảo luận về 8 câu thần chú | "8 Câu Thần Chú Ánh Sáng" |
| Hỏi cách sống chân thật | "Hành trình Sống Chân Thật" |

---

### Các file cần chỉnh sửa

| File | Thay đổi |
|------|----------|
| `src/components/ShareConversationDialog.tsx` | Thêm state + logic gọi AI tạo tiêu đề |
| `supabase/functions/chat/index.ts` | Thêm endpoint/logic generate title (hoặc dùng endpoint mới) |
| `src/i18n/locales/vi.json` | Sửa link `sharedFrom` + thêm text loading |
| `src/i18n/locales/en.json` | Tương tự |
| `src/i18n/locales/fr.json` | Tương tự |
| `src/i18n/locales/ja.json` | Tương tự |
| `src/i18n/locales/ko.json` | Tương tự |

---

### Chi tiết thay đổi

#### 1. ShareConversationDialog.tsx - Logic AI tạo tiêu đề

**Thêm states mới:**
```tsx
const [generatedTitle, setGeneratedTitle] = useState<string>('');
const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
```

**Hàm gọi AI tạo tiêu đề:**
```tsx
const generateSmartTitle = async () => {
  if (messages.length === 0) return;
  
  setIsGeneratingTitle(true);
  try {
    // Tạo prompt để AI phân tích và đặt tiêu đề
    const conversationSummary = messages.map(m => 
      `${m.role === 'user' ? 'User' : 'Angel'}: ${m.content.slice(0, 200)}`
    ).join('\n');
    
    const response = await fetch(`${supabaseUrl}/functions/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        messages: [{
          role: 'user',
          content: `Phân tích hội thoại sau và đặt MỘT tiêu đề ngắn gọn (10-40 ký tự) phản ánh nội dung chính. CHỈ trả về tiêu đề, không giải thích:\n\n${conversationSummary}`
        }],
        generateTitle: true, // Flag đặc biệt
        maxTokens: 50
      }),
    });
    
    // Parse response và lấy tiêu đề
    const reader = response.body?.getReader();
    let titleResult = '';
    // ... đọc stream và lấy text
    
    setGeneratedTitle(titleResult.trim());
  } catch (error) {
    console.error('Error generating title:', error);
    // Fallback: dùng tin nhắn đầu tiên của user
    const firstUserMsg = messages.find(m => m.role === 'user');
    setGeneratedTitle(firstUserMsg?.content.slice(0, 50) || '');
  } finally {
    setIsGeneratingTitle(false);
  }
};
```

**useEffect để tự động generate khi mở dialog:**
```tsx
useEffect(() => {
  if (open && messages.length > 0 && !generatedTitle) {
    generateSmartTitle();
  }
}, [open, messages]);
```

**Cập nhật formatConversationForCopy:**
```tsx
const formatConversationForCopy = (): string => {
  const displayName = userName || t('shareConversation.defaultUserName');
  
  // Sử dụng tiêu đề AI generate (hoặc title user nhập, hoặc fallback)
  const finalTitle = title.trim() || generatedTitle || t('shareConversation.defaultForumTitle');
  
  const header = `✨ ${finalTitle} ✨\n\n`;
  
  const body = messages.map(msg => {
    const speaker = msg.role === 'user' ? `👤 ${displayName}` : '🌟 Angel AI';
    return `${speaker}:\n${msg.content}`;
  }).join('\n\n---\n\n');
  
  const footer = `\n\n---\n💛 ${t('shareConversation.sharedFrom')}`;
  
  return header + body + footer;
};
```

#### 2. Cập nhật UI - Hiển thị trạng thái đang tạo tiêu đề

**Trong tab "copy", thêm indicator:**
```tsx
{isGeneratingTitle && (
  <div className="flex items-center gap-2 text-amber-600 text-sm">
    <Loader2 className="w-4 h-4 animate-spin" />
    {t('shareConversation.generatingTitle')}
  </div>
)}

{generatedTitle && !title.trim() && (
  <div className="text-xs text-amber-600">
    {t('shareConversation.autoTitle')}: <strong>{generatedTitle}</strong>
  </div>
)}
```

#### 3. Backend - Thêm mode generateTitle trong chat function

**Trong `supabase/functions/chat/index.ts`:**

Kiểm tra flag `generateTitle` và dùng prompt đơn giản hơn:
```typescript
if (body.generateTitle) {
  // Mode đặc biệt: chỉ tạo tiêu đề, không cần RAG, không cần web search
  const titlePrompt = `Bạn là AI đặt tiêu đề. Phân tích hội thoại và đặt MỘT tiêu đề tiếng Việt ngắn gọn (10-40 ký tự). CHỈ trả về tiêu đề, không emoji, không giải thích.`;
  
  // Gọi AI với prompt đơn giản
  // Trả về tiêu đề
}
```

#### 4. Translations - Cập nhật i18n

**Vietnamese (vi.json):**
```json
"shareConversation": {
  "sharedFrom": "Chia sẻ từ Angel AI - angelkhanhi.fun.rich",
  "generatingTitle": "Đang tạo tiêu đề thông minh...",
  "autoTitle": "Tiêu đề tự động"
}
```

**English (en.json):**
```json
"shareConversation": {
  "sharedFrom": "Shared from Angel AI - angelkhanhi.fun.rich",
  "generatingTitle": "Generating smart title...",
  "autoTitle": "Auto title"
}
```

**French (fr.json):**
```json
"shareConversation": {
  "sharedFrom": "Partagé depuis Angel AI - angelkhanhi.fun.rich",
  "generatingTitle": "Création du titre intelligent...",
  "autoTitle": "Titre automatique"
}
```

**Japanese (ja.json):**
```json
"shareConversation": {
  "sharedFrom": "Angel AIからの共有 - angelkhanhi.fun.rich",
  "generatingTitle": "スマートタイトルを生成中...",
  "autoTitle": "自動タイトル"
}
```

**Korean (ko.json):**
```json
"shareConversation": {
  "sharedFrom": "Angel AI에서 공유 - angelkhanhi.fun.rich",
  "generatingTitle": "스마트 제목 생성 중...",
  "autoTitle": "자동 제목"
}
```

---

### Kết quả sau khi nâng cấp

**Trước:**
```
✨ Hội Thoại với Angel AI ✨
📌 Hi bé Angel ạ! Bé Angel ơi, tâm là gì ạ?...

👤 Khả Nhi Lê:
Hi bé Angel ạ!...

---
💛 Chia sẻ từ Angel AI - angel.fun.rich
```

**Sau:**
```
✨ Khám Phá Về Tâm Và Review Tâm ✨

👤 Khả Nhi Lê:
Hi bé Angel ạ!...

---
💛 Chia sẻ từ Angel AI - angelkhanhi.fun.rich
```

---

### Ưu điểm của giải pháp

| Aspect | Benefit |
|--------|---------|
| **Tiêu đề thông minh** | AI phân tích toàn bộ nội dung, không chỉ câu đầu |
| **Ngắn gọn** | 10-40 ký tự, dễ đọc |
| **Tự động** | User không cần tự đặt tiêu đề |
| **Fallback** | Nếu AI lỗi, dùng tin nhắn đầu của user |
| **Override** | User vẫn có thể tự nhập title nếu muốn |

---

### Bước thực hiện

1. Cập nhật `supabase/functions/chat/index.ts`: Thêm mode `generateTitle`
2. Cập nhật `ShareConversationDialog.tsx`: Logic gọi AI + UI states
3. Cập nhật 5 file i18n: Link mới + text loading
4. Deploy edge function
5. Test: Mở Share dialog → verify tiêu đề được AI tạo tự động

