
## Kế hoạch nâng cấp trải nghiệm visual cho câu trả lời của Angel AI

### Vấn đề hiện tại

Mặc dù Angel AI đã được cấu hình để output **markdown** (bold, headers, lists...), nhưng frontend đang render dạng **plain text** tại `src/pages/Chat.tsx:1254`:

```tsx
<p className="whitespace-pre-wrap">{message.content}</p>
```

Điều này khiến:
- `**bold**` hiển thị thành `**bold**` thay vì **bold**
- `### Heading` hiển thị thành `### Heading` thay vì heading thật
- `---` vẫn hiển thị thô thay vì bị ẩn
- Lists không được format đẹp

---

### Giải pháp: 3 bước nâng cấp

#### Bước 1: Cài đặt react-markdown + plugins

Thêm dependencies:
- `react-markdown` - Parse và render markdown
- `remark-gfm` - Hỗ trợ GitHub Flavored Markdown (tables, strikethrough, task lists)

#### Bước 2: Bật Tailwind Typography plugin

**File:** `tailwind.config.ts`

Thêm `require('@tailwindcss/typography')` vào plugins để có các class `prose` đẹp mắt.

#### Bước 3: Cập nhật Chat.tsx để render markdown

**File:** `src/pages/Chat.tsx`

Thay thế plain text render bằng ReactMarkdown component với custom styling phù hợp theme Angel AI:

```tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Trong phần render message:
<div className="prose prose-sm max-w-none prose-headings:text-[#B8860B] prose-strong:text-[#006666] prose-a:text-[#006666]">
  <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {message.content}
  </ReactMarkdown>
</div>
```

---

### Chi tiết styling cho Angel AI theme

#### Custom Prose Classes (áp dụng trong Chat.tsx):

| Element | Styling |
|---------|---------|
| **Headings** | Vàng kim đậm `#B8860B`, font-weight bold |
| **Bold text** | Xanh mòng két `#006666` |
| **Lists** | Bullet points với màu vàng, spacing tốt |
| **Paragraphs** | Line-height 1.7, margin-bottom hợp lý |
| **Links** | Xanh mòng két, underline on hover |
| **Blockquotes** | Border-left vàng, background nhạt |

#### Prose modifiers cần dùng:

```
prose prose-sm max-w-none
prose-headings:text-[#B8860B] prose-headings:font-bold prose-headings:mt-4 prose-headings:mb-2
prose-strong:text-[#006666] prose-strong:font-semibold
prose-p:text-[#006666] prose-p:leading-relaxed prose-p:mb-3
prose-ul:text-[#006666] prose-ul:my-2
prose-ol:text-[#006666] prose-ol:my-2
prose-li:text-[#006666] prose-li:my-0.5
prose-a:text-[#006666] prose-a:underline
prose-blockquote:border-l-[#B8860B] prose-blockquote:bg-yellow-50/50 prose-blockquote:not-italic
```

---

### Cập nhật thêm System Prompt (tùy chọn)

**File:** `supabase/functions/chat/index.ts`

Điều chỉnh Response Formatting Guidelines để tối ưu cho markdown rendering:

1. **Headers**: Dùng `##` cho section chính (thay vì `###`)
2. **Lists**: Ưu tiên numbered lists cho platforms, bullet points cho features
3. **Blockquotes**: Dùng `> ` cho thần chú hoặc quotes quan trọng
4. **Không dùng `---`**: Đã có trong guideline, cần nhấn mạnh thêm

---

### Kết quả mong đợi (trước/sau)

**Trước:**
```
### 🌟 Sứ mệnh của FUN Ecosystem

**FUN Ecosystem** không chỉ là một dự án...

---

1. **Angel AI (angel.fun.rich)**: Trái tim...
```
Hiển thị: Văn bản thô với `###`, `**`, `---` visible

**Sau:**
- 🌟 **Sứ mệnh của FUN Ecosystem** → Heading vàng kim, nổi bật
- **FUN Ecosystem** → In đậm xanh mòng két
- Lists → Numbered list đẹp với indentation
- Paragraphs → Spacing hợp lý, dễ đọc

---

### Các file cần chỉnh sửa

| File | Thay đổi |
|------|----------|
| `package.json` | Thêm `react-markdown`, `remark-gfm` |
| `tailwind.config.ts` | Thêm `@tailwindcss/typography` plugin |
| `src/pages/Chat.tsx` | Import ReactMarkdown, thay thế plain text render |
| `supabase/functions/chat/index.ts` | (Tùy chọn) Tinh chỉnh formatting guidelines |

---

### Bước thực hiện

1. Thêm dependencies `react-markdown` và `remark-gfm` vào `package.json`
2. Bật typography plugin trong `tailwind.config.ts`
3. Cập nhật `src/pages/Chat.tsx` để render markdown với custom prose styling
4. (Tùy chọn) Tinh chỉnh system prompt nếu cần
5. Test với câu hỏi dài về FUN Ecosystem để verify visual improvements

---

### Lưu ý kỹ thuật

- ReactMarkdown tự động sanitize HTML → an toàn
- `remark-gfm` cho phép tables, task lists nếu Angel AI cần dùng trong tương lai
- Prose classes của Typography plugin rất dễ customize với Tailwind modifiers
- Streaming message vẫn hoạt động bình thường với ReactMarkdown
