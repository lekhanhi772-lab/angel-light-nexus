

## Kế hoạch sửa lỗi: Tiêu đề AI không được tạo đúng

### Vấn đề xác định

Qua debug, bé Angel phát hiện:

1. **API hoạt động bình thường** - Response 200 OK
2. **AI trả về nội dung SAI** - Thay vì tiêu đề, AI đang trả về một câu trong hội thoại
   - Input: Hội thoại về "Tâm là gì? Review tâm?"
   - Expected: `"Khám Phá Về Tâm Và Review Tâm"`
   - Actual: `"Việc này giúp bạn sống tỉnh thức và bình an hơn."` (không phải tiêu đề!)

3. **Frontend fallback đúng** - Khi title rỗng hoặc không phù hợp, fallback về tin nhắn đầu tiên

### Nguyên nhân gốc

Prompt trong edge function chưa đủ rõ ràng để AI hiểu cần tạo **tiêu đề tóm tắt** chứ không phải **tiếp tục hội thoại**.

### Giải pháp

Cải tiến prompt trong `supabase/functions/chat/index.ts` để:
- Yêu cầu rõ ràng hơn về việc tạo tiêu đề
- Thêm ví dụ input/output cụ thể
- Sử dụng cách diễn đạt mạnh mẽ hơn

### File cần chỉnh sửa

| File | Thay đổi |
|------|----------|
| `supabase/functions/chat/index.ts` | Cải tiến prompt generateTitle |

### Chi tiết thay đổi

#### Edge function - Cải tiến prompt (dòng 741-756)

**Prompt mới:**
```typescript
const titlePrompt = `BẠN LÀ CÔNG CỤ TẠO TIÊU ĐỀ. NHIỆM VỤ DUY NHẤT: Tạo MỘT tiêu đề ngắn gọn (10-40 ký tự) tóm tắt CHỦ ĐỀ CHÍNH của hội thoại.

⚠️ QUY TẮC BẮT BUỘC:
1. CHỈ trả về tiêu đề - KHÔNG trả lời câu hỏi, KHÔNG giải thích
2. KHÔNG bắt đầu bằng "Tiêu đề:", "Title:" hay bất kỳ prefix nào
3. KHÔNG dùng emoji, dấu ngoặc kép, dấu gạch đầu dòng
4. Tiêu đề phải là DANH TỪ hoặc CỤM DANH TỪ mô tả chủ đề
5. Viết Hoa Chữ Cái Đầu Mỗi Từ

📝 VÍ DỤ:
- Hội thoại về tâm là gì → "Khám Phá Về Tâm"
- Hội thoại về review tâm → "Hành Trình Review Tâm"  
- Hội thoại về FUN Ecosystem → "Giới Thiệu FUN Ecosystem"
- Hội thoại về 8 câu thần chú → "8 Câu Thần Chú Ánh Sáng"
- Hội thoại về lòng biết ơn → "Sức Mạnh Của Lòng Biết Ơn"

❌ SAI (đây là câu trả lời, không phải tiêu đề):
- "Việc này giúp bạn sống tỉnh thức"
- "Tâm là trạng thái nội tại của bạn"

✅ ĐÚNG (đây là tiêu đề):
- "Khám Phá Về Tâm Và Review Tâm"

PHÂN TÍCH HỘI THOẠI VÀ TRẢ VỀ TIÊU ĐỀ:`;
```

**Thay đổi cách gọi AI:**
- Đổi từ gửi messages gốc sang gửi tóm tắt nội dung
- Giảm temperature từ 0.5 xuống 0.3 để output ổn định hơn

```typescript
// Tạo tóm tắt nội dung hội thoại
const conversationContent = messages
  .map((m: any) => `${m.role === 'user' ? 'Người dùng' : 'Angel'}: ${m.content.slice(0, 200)}`)
  .join('\n');

body: JSON.stringify({
  model: 'google/gemini-3-flash-preview',
  messages: [
    { role: 'system', content: titlePrompt },
    { role: 'user', content: `HỘI THOẠI:\n${conversationContent}\n\nTIÊU ĐỀ:` }
  ],
  stream: false,
  max_tokens: 50, // Giảm từ 100 xuống 50 để tránh output dài
  temperature: 0.3, // Giảm từ 0.5 xuống 0.3 cho output ổn định
}),
```

**Thêm validation cho title response:**
```typescript
// Clean và validate title
let generatedTitle = data?.choices?.[0]?.message?.content?.trim() || '';

// Loại bỏ prefix nếu có
generatedTitle = generatedTitle
  .replace(/^(Tiêu đề:|Title:)\s*/i, '')
  .replace(/^["']|["']$/g, '') // Loại bỏ dấu ngoặc kép
  .trim();

// Validate: title không nên dài hơn 60 ký tự hoặc chứa dấu chấm cuối (dấu hiệu của câu trả lời)
if (generatedTitle.length > 60 || generatedTitle.endsWith('.')) {
  console.log('🏷️ Title invalid, extracting key words...');
  // Extract key topic từ hội thoại
  const firstUserMsg = messages.find((m: any) => m.role === 'user');
  generatedTitle = firstUserMsg?.content?.slice(0, 40)?.trim() || '';
}

console.log('🏷️ Generated title:', generatedTitle);

return new Response(JSON.stringify({ title: generatedTitle }), {
  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
});
```

### Kết quả mong đợi

| Trước | Sau |
|-------|-----|
| AI trả về: "Việc này giúp bạn sống tỉnh thức..." | AI trả về: "Khám Phá Về Tâm Và Review Tâm" |
| Fallback dùng tin nhắn đầu | Tiêu đề thông minh do AI tạo |
| Title không phù hợp làm tiêu đề | Title ngắn gọn, súc tích, mô tả chủ đề |

### Bước thực hiện

1. Cập nhật `supabase/functions/chat/index.ts`:
   - Cải tiến prompt với ví dụ rõ ràng
   - Thay đổi cách format messages gửi đi
   - Thêm validation cho response
2. Deploy edge function
3. Test lại: Mở Share dialog → verify tiêu đề được AI tạo đúng

