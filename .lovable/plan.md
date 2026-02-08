
## Kế hoạch: Giữ định dạng in đậm cho nút Copy từng tin nhắn

### Vấn đề

Nút **Copy** trên từng tin nhắn trong trang Chat và SharedConversation vẫn dùng `navigator.clipboard.writeText()` (plain text), nên khi paste ra ngoài vẫn thấy dấu `**...**` thay vì chữ in đậm.

### File cần chỉnh sửa

| File | Vị trí | Thay đổi |
|------|--------|----------|
| `src/pages/Chat.tsx` | Dòng 156-166 (`handleCopyMessage`) | Chuyển sang Clipboard API rich text |
| `src/pages/SharedConversation.tsx` | Dòng 78-84 (`handleCopy`) | Chuyển sang Clipboard API rich text |

### Chi tiết thay đổi

#### 1. Chat.tsx - Cập nhật `handleCopyMessage`

**Trước:**
```typescript
const handleCopyMessage = async (text: string, messageId: string) => {
  try {
    await navigator.clipboard.writeText(text);
    setCopiedMessageId(messageId);
    toast.success(t('chat.copied'));
    setTimeout(() => setCopiedMessageId(null), 2000);
  } catch (err) {
    toast.error('Copy failed');
  }
};
```

**Sau:**
```typescript
const markdownToHtml = (text: string): string => {
  return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
};

const handleCopyMessage = async (text: string, messageId: string) => {
  try {
    const htmlText = markdownToHtml(text).replace(/\n/g, '<br/>');
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([htmlText], { type: 'text/html' }),
        'text/plain': new Blob([text], { type: 'text/plain' }),
      }),
    ]);
    setCopiedMessageId(messageId);
    toast.success(t('chat.copied'));
    setTimeout(() => setCopiedMessageId(null), 2000);
  } catch {
    // Fallback cho browser khong ho tro ClipboardItem
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      toast.success(t('chat.copied'));
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch {
      toast.error('Copy failed');
    }
  }
};
```

#### 2. SharedConversation.tsx - Cập nhật `handleCopy`

Tuong tu, chuyen `handleCopy` sang dung `ClipboardItem` voi ca `text/html` va `text/plain`.

### Logic hoat dong

```text
User bam nut Copy tin nhan
    |
    v
Chuyen markdown **text** thanh HTML <b>text</b>
    |
    v
Copy vao clipboard voi 2 dinh dang:
  - text/html: <b>text</b> (cho Word, Docs, Messenger...)
  - text/plain: **text** giu nguyen (cho Notepad, terminal...)
    |
    v
Khi paste vao app ho tro rich text -> hien thi in dam
Khi paste vao plain text editor -> hien thi nguyen ban
```

### Ket qua mong doi

| Hanh dong | Truoc | Sau |
|-----------|-------|-----|
| Copy 1 tin nhan, paste vao Docs | `**Tang tan so:**` | **Tang tan so:** |
| Copy 1 tin nhan, paste vao Messenger | `**Anh Sang**` | **Anh Sang** |
| Copy 1 tin nhan, paste vao Notepad | `**text**` | `**text**` (giu nguyen) |
