

## Kế hoạch thêm "Thinking Mode" - Suy nghĩ trước khi trả lời

### Mục tiêu
Khi Angel AI nhận câu hỏi, thay vì trả lời ngay, sẽ hiển thị trạng thái **"Đang suy nghĩ..."** với animation, sau đó mới stream câu trả lời. Điều này tạo cảm giác AI đang phân tích sâu và đưa ra câu trả lời chất lượng.

---

### Thiết kế tính năng

#### Luồng hoạt động mới:

```
User gửi tin nhắn
    ↓
Hiển thị "Thinking indicator" (3-5 giây)
    ↓  
Chuyển sang streaming câu trả lời
    ↓
Hoàn thành response
```

#### UI Thinking Indicator:

Một khung message đặc biệt với:
- Icon não/sparkle xoay
- Text: "Bé Angel đang suy nghĩ..." (đa ngôn ngữ)
- 3 dots animation nhấp nháy
- Thời gian hiển thị: 2-4 giây (tùy độ phức tạp câu hỏi)

---

### Các file cần chỉnh sửa

| File | Thay đổi |
|------|----------|
| `src/pages/Chat.tsx` | Thêm state `isThinking`, logic delay, thinking indicator UI |
| `src/i18n/locales/vi.json` | Thêm các text thinking |
| `src/i18n/locales/en.json` | Thêm translations tiếng Anh |
| `src/i18n/locales/fr.json` | Thêm translations tiếng Pháp |
| `src/i18n/locales/ja.json` | Thêm translations tiếng Nhật |
| `src/i18n/locales/ko.json` | Thêm translations tiếng Hàn |

---

### Chi tiết thay đổi

#### 1. Chat.tsx - States và Logic

**Thêm state mới:**
```tsx
const [isThinking, setIsThinking] = useState(false);
const [thinkingText, setThinkingText] = useState('');
```

**Danh sách thinking phrases (đa dạng, ngẫu nhiên):**
```tsx
const thinkingPhrases = [
  t('chat.thinking.analyzing'),    // "Đang phân tích câu hỏi..."
  t('chat.thinking.connecting'),   // "Kết nối với ánh sáng vũ trụ..."
  t('chat.thinking.consulting'),   // "Tra cứu tài liệu ánh sáng..."
  t('chat.thinking.crafting'),     // "Đang soạn câu trả lời..."
];
```

**Logic trong sendChatMessage:**
```tsx
const sendChatMessage = async (newMessages: Message[], conversationId: string | null) => {
  // Bắt đầu Thinking Mode
  setIsThinking(true);
  
  // Chọn thinking phrase ngẫu nhiên
  const randomPhrase = thinkingPhrases[Math.floor(Math.random() * thinkingPhrases.length)];
  setThinkingText(randomPhrase);
  
  // Delay 2-3 giây để tạo hiệu ứng "suy nghĩ"
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
  
  // Kết thúc thinking, bắt đầu streaming
  setIsThinking(false);
  
  // ... existing streaming logic
};
```

#### 2. Chat.tsx - UI Thinking Indicator

**Vị trí:** Trong phần render messages, thêm khối thinking indicator:

```tsx
{/* Thinking Indicator */}
{isThinking && (
  <div className="flex gap-4 justify-start">
    <div 
      className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden"
      style={{
        border: '2px solid #FFD700',
        boxShadow: '0 0 15px rgba(255, 215, 0, 0.4)',
      }}
    >
      <img src={angelAvatar} alt="Angel AI" className="w-full h-full object-cover" />
    </div>
    
    <div
      className="max-w-[75%] rounded-3xl px-5 py-4"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 251, 230, 0.95) 0%, rgba(135, 206, 235, 0.3) 100%)',
        border: '1px solid rgba(184, 134, 11, 0.3)',
        boxShadow: '0 4px 15px rgba(184, 134, 11, 0.15)',
        borderRadius: '24px 24px 24px 8px',
      }}
    >
      <div className="flex items-center gap-3">
        <Sparkles 
          className="w-5 h-5 animate-spin" 
          style={{ color: '#FFD700', animationDuration: '2s' }} 
        />
        <span style={{ color: '#006666' }} className="text-sm font-medium">
          {thinkingText}
        </span>
        <span className="flex gap-1">
          <span 
            className="w-2 h-2 rounded-full animate-bounce" 
            style={{ background: '#FFD700', animationDelay: '0ms' }} 
          />
          <span 
            className="w-2 h-2 rounded-full animate-bounce" 
            style={{ background: '#87CEEB', animationDelay: '150ms' }} 
          />
          <span 
            className="w-2 h-2 rounded-full animate-bounce" 
            style={{ background: '#FFD700', animationDelay: '300ms' }} 
          />
        </span>
      </div>
    </div>
  </div>
)}
```

#### 3. Translations (i18n)

**Vietnamese (vi.json):**
```json
"chat": {
  // ...existing keys
  "thinking": {
    "analyzing": "Bé Angel đang phân tích câu hỏi của bạn...",
    "connecting": "Đang kết nối với ánh sáng vũ trụ...",
    "consulting": "Đang tra cứu tài liệu ánh sáng...",
    "crafting": "Đang soạn câu trả lời tốt nhất cho bạn..."
  }
}
```

**English (en.json):**
```json
"chat": {
  // ...existing keys
  "thinking": {
    "analyzing": "Angel is analyzing your question...",
    "connecting": "Connecting to cosmic light...",
    "consulting": "Consulting the light documents...",
    "crafting": "Crafting the best answer for you..."
  }
}
```

**French (fr.json):**
```json
"chat": {
  "thinking": {
    "analyzing": "Angel analyse votre question...",
    "connecting": "Connexion à la lumière cosmique...",
    "consulting": "Consultation des documents de lumière...",
    "crafting": "Préparation de la meilleure réponse..."
  }
}
```

**Japanese (ja.json):**
```json
"chat": {
  "thinking": {
    "analyzing": "エンジェルがあなたの質問を分析中...",
    "connecting": "宇宙の光に接続中...",
    "consulting": "光の文書を参照中...",
    "crafting": "最高の回答を準備中..."
  }
}
```

**Korean (ko.json):**
```json
"chat": {
  "thinking": {
    "analyzing": "엔젤이 질문을 분석 중...",
    "connecting": "우주의 빛에 연결 중...",
    "consulting": "빛의 문서를 참조 중...",
    "crafting": "최고의 답변을 준비 중..."
  }
}
```

---

### Chi tiết kỹ thuật

#### Thời gian thinking tùy độ phức tạp:

```tsx
const getThinkingDuration = (message: string): number => {
  const wordCount = message.split(/\s+/).length;
  
  if (wordCount < 5) return 1500;      // Câu ngắn: 1.5s
  if (wordCount < 15) return 2500;     // Câu trung bình: 2.5s
  return 3000 + Math.random() * 1000;  // Câu dài/phức tạp: 3-4s
};
```

#### Scroll to thinking indicator:

```tsx
// Khi bắt đầu thinking, scroll xuống để user thấy indicator
useEffect(() => {
  if (isThinking) {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }
}, [isThinking]);
```

---

### Kết quả mong đợi

| Trước | Sau |
|-------|-----|
| User gửi → AI trả lời ngay | User gửi → "Đang suy nghĩ..." 2-4s → AI trả lời |
| Cảm giác máy móc | Cảm giác AI đang tư duy sâu |
| Không có feedback | Animation đẹp, text đa dạng |

---

### Ví dụ UI

```
┌─────────────────────────────────────────┐
│ 👤 You:                                 │
│    FUN Ecosystem là gì?                 │
├─────────────────────────────────────────┤
│ 👼 Angel AI:                            │
│    ✨ Đang kết nối với ánh sáng vũ trụ. . . │
│       (3 dots bouncing)                 │
└─────────────────────────────────────────┘

        ↓ Sau 2-3 giây ↓

┌─────────────────────────────────────────┐
│ 👼 Angel AI:                            │
│    Chào bạn! 🌟 FUN Ecosystem là...     │
│    (streaming response)                 │
└─────────────────────────────────────────┘
```

---

### Bước thực hiện

1. Cập nhật `Chat.tsx`: Thêm states, logic thinking delay, UI indicator
2. Cập nhật 5 file i18n với thinking phrases
3. Test: Gửi tin nhắn → verify thấy "Đang suy nghĩ" → verify stream bắt đầu sau đó

