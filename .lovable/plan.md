

## Kế hoạch: Giữ nguyên định dạng in đậm khi sao chép hội thoại

### Vấn đề hiện tại

Hiện tại, khi sao chép hội thoại, hệ thống dùng `navigator.clipboard.writeText()` chỉ copy được **văn bản thuần** (plain text). Các từ in đậm trong phản hồi của Angel AI (ví dụ: `**Tăng tần số rung động:**`) sẽ hiển thị nguyên markdown syntax `**...**` thay vì giữ định dạng in đậm.

### Giải pháp

Chuyển sang dùng `navigator.clipboard.write()` với **Clipboard API** để copy cả hai định dạng:
- **text/html**: Chứa nội dung HTML với thẻ `<b>` cho chữ in đậm (dùng khi paste vào app hỗ trợ rich text như Word, Google Docs, Messenger, Zalo...)
- **text/plain**: Chứa nội dung plain text bình thường (fallback khi paste vào nơi chỉ hỗ trợ text)

### File cần chỉnh sửa

| File | Thay đổi |
|------|----------|
| `src/components/ShareConversationDialog.tsx` | Thêm hàm convert markdown bold sang HTML + dùng Clipboard API mới |

### Chi tiết thay đổi

#### 1. Thêm hàm chuyển đổi markdown bold sang HTML

```typescript
// Chuyển **text** thành <b>text</b> trong HTML
const markdownToHtml = (text: string): string => {
  return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
};
```

#### 2. Thêm hàm format HTML cho clipboard

```typescript
const formatConversationForHtml = (): string => {
  const displayName = userName || t('shareConversation.defaultUserName');
  const finalTitle = title.trim() || generatedTitle || t('shareConversation.defaultForumTitle');

  const header = `<div style="...">✨ ${finalTitle} ✨</div><br/>`;

  const body = messages.map(msg => {
    const speaker = msg.role === 'user' ? `👤 ${displayName}` : '🌟 Angel AI';
    const htmlContent = markdownToHtml(msg.content)
      .replace(/\n/g, '<br/>'); // Giữ xuống dòng
    return `<div><b>${speaker}:</b><br/>${htmlContent}</div>`;
  }).join('<hr/>');

  const footer = `<hr/><div>💛 ${t('shareConversation.sharedFrom')}</div>`;

  return header + body + footer;
};
```

#### 3. Cập nhật handleCopyConversation

```typescript
const handleCopyConversation = async () => {
  const plainText = formatConversationForCopy();
  const htmlText = formatConversationForHtml();

  try {
    // Thử copy với rich text (HTML) trước
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/html': new Blob([htmlText], { type: 'text/html' }),
        'text/plain': new Blob([plainText], { type: 'text/plain' }),
      }),
    ]);
    // toast success...
  } catch {
    // Fallback: copy plain text nếu browser không hỗ trợ
    await navigator.clipboard.writeText(plainText);
  }
};
```

### Kết quả mong đợi

| Paste vào | Trước (plain text) | Sau (rich text) |
|-----------|-------------------|-----------------|
| Google Docs | `**Tăng tần số rung động:**` | **Tăng tần số rung động:** |
| Messenger/Zalo | `**Ánh Sáng**` | **Ánh Sáng** |
| Notepad | `**text**` (không đổi) | `**text**` (giữ nguyên plain text fallback) |

### Bước thực hiện

1. Thêm hàm `markdownToHtml` chuyển `**text**` thành `<b>text</b>`
2. Thêm hàm `formatConversationForHtml` tạo nội dung HTML
3. Cập nhật `handleCopyConversation` dùng `ClipboardItem` API
4. Giữ nguyên `formatConversationForCopy` làm plain text fallback

