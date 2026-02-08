

## Kế hoạch: Xử lý ký tự markdown (###, ---) khi copy tin nhắn

### Vấn đề hiện tại

Hàm `markdownToHtml` chỉ chuyển đổi `**bold**` sang `<b>`, nhưng chưa xử lý:
- `### Tiêu đề` -- hiển thị nguyên ký tự `###` khi paste
- `---` -- hiển thị nguyên dấu gạch ngang khi paste
- Các heading khác: `#`, `##`, `####`

Ngoài ra, hàm này đang bị **trùng lặp ở 3 file** (Chat.tsx, SharedConversation.tsx, ShareConversationDialog.tsx).

### Giải pháp

1. Tạo hàm tiện ích chung `markdownToHtml` trong `src/lib/utils.ts`
2. Xử lý đầy đủ các cú pháp markdown phổ biến
3. Cập nhật 3 file để dùng hàm chung

### File cần thay đổi

| File | Thay đổi |
|------|----------|
| `src/lib/utils.ts` | Thêm hàm `markdownToHtml` xử lý đầy đủ markdown |
| `src/pages/Chat.tsx` | Import và dùng hàm chung, xóa hàm local |
| `src/pages/SharedConversation.tsx` | Import và dùng hàm chung, xóa hàm local |
| `src/components/ShareConversationDialog.tsx` | Import và dùng hàm chung, xóa hàm local |

### Chi tiết kỹ thuật

#### 1. Hàm `markdownToHtml` mới trong `src/lib/utils.ts`

```typescript
export const markdownToHtml = (text: string): string => {
  return text
    // Heading ### / ## / # -> in đậm, viết hoa
    .replace(/^#{1,4}\s+(.*?)$/gm, '<b>$1</b>')
    // Dấu --- (horizontal rule) -> loại bỏ hoàn toàn
    .replace(/^-{3,}$/gm, '')
    // Bold **text** -> <b>text</b>
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
};
```

Bảng chuyển đổi:

| Markdown | HTML Output |
|----------|-------------|
| `### Tiêu đề` | `<b>Tiêu de</b>` |
| `## Tiêu đề` | `<b>Tiêu de</b>` |
| `---` | (bỏ trống - loại bỏ) |
| `**chữ đậm**` | `<b>chữ đậm</b>` |

#### 2. Cập nhật 3 file

Ở cả Chat.tsx, SharedConversation.tsx, ShareConversationDialog.tsx:
- Thêm `import { markdownToHtml } from '@/lib/utils'`
- Xóa hàm `markdownToHtml` local (đang khai báo riêng trong mỗi file)
- Giữ nguyên logic copy clipboard (không thay đổi)

### Kết quả mong đợi

| Paste vào Word | Truoc | Sau |
|----------------|-------|-----|
| `### Tiêu đề` | Hiện nguyên `###` | **Tiêu đề** (in đậm) |
| `---` | Hiện dấu `---` | (không hiển thị gì) |
| `**chữ đậm**` | **chữ đậm** | **chữ đậm** (giữ nguyên) |

