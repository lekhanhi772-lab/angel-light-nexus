

## Kế hoạch thêm tính năng "Sao chép Hội Thoại" với tên người dùng

### Mục tiêu
- Thêm tab thứ 3 "Sao chép" trong dialog Share
- Khi copy, thay "Người dùng" / "Bạn" bằng **tên thực** của user (lấy từ `profile.display_name`)
- Fallback: nếu không có tên, dùng "Bạn"

---

### Luồng dữ liệu

```
useAuth() → profile.display_name
    ↓
Chat.tsx (truyền userName prop)
    ↓
ShareConversationDialog (nhận userName, dùng trong formatConversationForCopy)
```

---

### Các file cần chỉnh sửa

| File | Thay đổi |
|------|----------|
| `src/pages/Chat.tsx` | Lấy `profile` từ useAuth, truyền `userName` cho ShareConversationDialog |
| `src/components/ShareConversationDialog.tsx` | Thêm prop `userName`, thêm tab "Sao chép", logic format & copy |
| `src/i18n/locales/vi.json` | Thêm translations cho tab Sao chép |
| `src/i18n/locales/en.json` | Thêm translations tiếng Anh |
| `src/i18n/locales/fr.json` | Thêm translations tiếng Pháp |
| `src/i18n/locales/ja.json` | Thêm translations tiếng Nhật |
| `src/i18n/locales/ko.json` | Thêm translations tiếng Hàn |

---

### Chi tiết thay đổi

#### 1. Chat.tsx (dòng 52 và 1547-1554)

**Dòng 52** - Thêm `profile` vào destructuring:
```tsx
const { user, session, profile, loading: authLoading } = useAuth();
```

**Dòng 1547-1554** - Truyền thêm prop `userName`:
```tsx
<ShareConversationDialog
  open={showShareDialog}
  onOpenChange={setShowShareDialog}
  conversationId={currentConversationId}
  userId={user.id}
  messages={messages}
  defaultTitle={conversations.find(c => c.id === currentConversationId)?.title || ''}
  userName={profile?.display_name || undefined}
/>
```

#### 2. ShareConversationDialog.tsx

**Props interface** - Thêm `userName`:
```tsx
interface ShareConversationDialogProps {
  // ...existing props
  userName?: string;
}
```

**Imports** - Thêm icon `ClipboardCopy`:
```tsx
import { Share2, Link, MessageSquare, Copy, Check, Loader2, ClipboardCopy } from 'lucide-react';
```

**States** - Thêm state cho copy:
```tsx
const [copiedConversation, setCopiedConversation] = useState(false);
```

**Format function** - Dùng userName thay vì "Người dùng":
```tsx
const formatConversationForCopy = (): string => {
  const displayName = userName || t('shareConversation.defaultUserName');
  const header = `✨ Hội Thoại với Angel AI ✨\n${title ? `📌 ${title}\n` : ''}\n`;
  
  const body = messages.map(msg => {
    const speaker = msg.role === 'user' ? `👤 ${displayName}` : '🌟 Angel AI';
    return `${speaker}:\n${msg.content}`;
  }).join('\n\n---\n\n');
  
  const footer = `\n\n---\n💛 Chia sẻ từ Angel AI - angel.fun.rich`;
  
  return header + body + footer;
};
```

**Copy handler**:
```tsx
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
```

**UI** - Mở rộng Tabs từ 2 lên 3 cột:
```tsx
<TabsList className="grid w-full grid-cols-3 bg-amber-100/50">
  <TabsTrigger value="link">...</TabsTrigger>
  <TabsTrigger value="forum">...</TabsTrigger>
  <TabsTrigger value="copy">
    <ClipboardCopy className="w-4 h-4 mr-2" />
    {t('shareConversation.copyTab')}
  </TabsTrigger>
</TabsList>

{/* Thêm TabsContent cho copy */}
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
        {t('shareConversation.copied')}
      </>
    ) : (
      <>
        <ClipboardCopy className="w-4 h-4 mr-2" />
        {t('shareConversation.copyButton')}
      </>
    )}
  </Button>
</TabsContent>
```

#### 3. Translations (i18n)

**Vietnamese (vi.json)**:
```json
"shareConversation": {
  // ...existing keys
  "copyTab": "Sao Chép",
  "copyDescription": "Sao chép toàn bộ hội thoại để gửi qua tin nhắn, email...",
  "copyButton": "Sao Chép Hội Thoại",
  "conversationCopied": "Đã sao chép hội thoại! ✨",
  "defaultUserName": "Bạn"
}
```

**English (en.json)**:
```json
"shareConversation": {
  // ...existing keys
  "copyTab": "Copy",
  "copyDescription": "Copy the entire conversation to send via message, email...",
  "copyButton": "Copy Conversation",
  "conversationCopied": "Conversation copied! ✨",
  "defaultUserName": "You"
}
```

**French (fr.json)**:
```json
"shareConversation": {
  // ...existing keys
  "copyTab": "Copier",
  "copyDescription": "Copiez la conversation pour l'envoyer par message, email...",
  "copyButton": "Copier la conversation",
  "conversationCopied": "Conversation copiée ! ✨",
  "defaultUserName": "Vous"
}
```

**Japanese (ja.json)**:
```json
"shareConversation": {
  // ...existing keys
  "copyTab": "コピー",
  "copyDescription": "会話全体をコピーして、メッセージやメールで送信できます...",
  "copyButton": "会話をコピー",
  "conversationCopied": "会話をコピーしました！ ✨",
  "defaultUserName": "あなた"
}
```

**Korean (ko.json)**:
```json
"shareConversation": {
  // ...existing keys
  "copyTab": "복사",
  "copyDescription": "전체 대화를 복사하여 메시지, 이메일 등으로 보낼 수 있습니다...",
  "copyButton": "대화 복사",
  "conversationCopied": "대화가 복사되었습니다! ✨",
  "defaultUserName": "당신"
}
```

---

### Ví dụ kết quả khi copy

Giả sử user tên là "Nguyễn Văn A":

```
✨ Hội Thoại với Angel AI ✨
📌 Giới thiệu FUN Ecosystem

👤 Nguyễn Văn A:
Giới thiệu về FUN Ecosystem đi bé Angel!

---

🌟 Angel AI:
Chào bạn yêu dấu! 🌟 Bé Angel rất hạnh phúc khi được giới thiệu về **FUN Ecosystem**...

---

👤 Nguyễn Văn A:
Cảm ơn bé Angel!

---

🌟 Angel AI:
Không có chi bạn ơi! ✨💛

---
💛 Chia sẻ từ Angel AI - angel.fun.rich
```

---

### Bước thực hiện

1. Cập nhật `Chat.tsx`: lấy `profile` và truyền `userName`
2. Cập nhật `ShareConversationDialog.tsx`: thêm tab Sao chép + logic format/copy
3. Cập nhật 5 file i18n với translations mới
4. Test: Mở dialog Share → chọn tab Sao Chép → verify tên user hiển thị đúng

