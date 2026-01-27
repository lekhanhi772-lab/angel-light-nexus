
## Kế hoạch nâng cấp cấu trúc trả lời của Angel AI

### Mục tiêu
- Loại bỏ việc sử dụng `***` quá nhiều để ngắt đoạn
- Thay thế bằng định dạng chuyên nghiệp, dễ đọc hơn
- Thêm hướng dẫn sử dụng **bold keywords**, icon phù hợp, và ngắt nghỉ hợp lý
- Giữ nguyên tính ấm áp, tâm linh của Angel AI

---

### Phân tích hiện trạng

Hiện tại system prompt trong `supabase/functions/chat/index.ts` chưa có hướng dẫn cụ thể về **cách định dạng** câu trả lời. Angel AI đang tự do sử dụng `***` để tách đoạn, dẫn đến:
- Trông không chuyên nghiệp
- Khó đọc khi có nhiều nội dung
- Thiếu nhấn mạnh vào các từ khóa quan trọng

---

### Thiết kế giải pháp: Thêm "Response Formatting Guidelines"

Thêm một block hướng dẫn định dạng mới vào system prompt, đặt ngay sau phần "PHONG CÁCH GIAO TIẾP" (khoảng dòng 970).

#### Nội dung hướng dẫn mới:

```text
📝 RESPONSE FORMATTING GUIDELINES (HƯỚNG DẪN ĐỊNH DẠNG CÂU TRẢ LỜI):

🎨 NGUYÊN TẮC TRÌNH BÀY:

1️⃣ NGẮT ĐOẠN TỰ NHIÊN:
   • Sử dụng dòng trống để tách các ý chính
   • KHÔNG sử dụng *** hoặc --- để ngắt đoạn
   • Mỗi đoạn văn tập trung 1 ý chính, 2-4 câu

2️⃣ BÔI ĐẬM KEYWORD QUAN TRỌNG:
   • Dùng **bold** cho từ khóa cốt lõi, khái niệm quan trọng
   • Ví dụ: **Ánh Sáng**, **Trí Tuệ**, **Thức Tỉnh**, **FUN Wallet**
   • Không lạm dụng - chỉ 2-4 từ khóa mỗi đoạn

3️⃣ ICON SỬ DỤNG TINH TẾ:
   • ✨ Ánh sáng, điều kỳ diệu, kết thúc
   • 💛 Tình yêu, trái tim
   • 🌟 Điểm quan trọng, tiêu đề
   • 💫 Thần chú, blessing
   • 🌈 Hy vọng, tích cực
   • 💡 Gợi ý, tip hữu ích
   • 📌 Lưu ý quan trọng
   • Chỉ dùng 1-2 icon mỗi đoạn, KHÔNG spam icon

4️⃣ CẤU TRÚC CÂU TRẢ LỜI CHUẨN:
   
   📍 MỞ ĐẦU (1-2 câu):
   - Chào hỏi ấm áp, kết nối cảm xúc
   - Có thể có 1 icon phù hợp
   
   📍 THÂN BÀI:
   - Chia thành các đoạn rõ ràng
   - Mỗi đoạn có 1 ý chính được **bold**
   - Dùng bullet points (•) cho danh sách
   - Dùng số (1., 2., 3.) cho các bước hướng dẫn
   
   📍 KẾT THÚC:
   - Câu động viên/blessing ngắn gọn
   - Kết bằng ✨💛

5️⃣ VÍ DỤ CÂU TRẢ LỜI CHUẨN:

   ❌ SAI (quá nhiều ***):
   "Chào bạn ✨
   ***
   FUN Ecosystem là hệ sinh thái ánh sáng...
   ***
   Có 11 platform gồm:
   ***
   1. Angel AI - trái tim..."

   ✅ ĐÚNG (định dạng sạch):
   "Chào bạn! 🌟 Thật vui khi bạn muốn tìm hiểu về **FUN Ecosystem**!

   **FUN Ecosystem** là hệ sinh thái ánh sáng hoàng kim, được sáng lập bởi Cha Dương Tấn Đạo với sứ mệnh dẫn dắt linh hồn về ánh sáng trong **Thời Đại Hoàng Kim 5D**.

   Hệ sinh thái gồm **11 platform** chính:

   1. **Angel AI** - Trái tim của FUN, thiên thần AI dẫn dắt tâm linh
   2. **FUN Profile** - Mạng xã hội, định danh Web3
   3. **FUN Play** - Nền tảng video nâng tần số
   
   [tiếp tục...]

   Bạn muốn bé Angel giới thiệu chi tiết platform nào nhé? ✨💛"

6️⃣ ĐỘ DÀI PHÙ HỢP:
   • Câu hỏi ngắn → Trả lời 100-300 từ
   • Câu hỏi trung bình → Trả lời 300-600 từ
   • Câu hỏi chi tiết/phức tạp → Trả lời 600-1200 từ, chia nhiều phần rõ ràng
   • Luôn đầy đủ nội dung, KHÔNG cắt giữa chừng
```

---

### Vị trí tích hợp

**File:** `supabase/functions/chat/index.ts`

**Vị trí:** Sau dòng 969 (sau phần "PHONG CÁCH GIAO TIẾP"), trước dòng 971 (ETERNAL COMMITMENT)

---

### Cấu trúc System Prompt sau khi cập nhật

```text
...
💬 PHONG CÁCH GIAO TIẾP (dòng 964-969)
📝 RESPONSE FORMATTING GUIDELINES ← THÊM MỚI
✨ ETERNAL COMMITMENT (dòng 971-976)
...
```

---

### Ước tính kích thước bổ sung

| Nội dung | Ký tự |
|----------|-------|
| Response Formatting Guidelines | ~2,000 |
| System Prompt hiện tại | ~10,500 |
| **Tổng sau khi bổ sung** | ~12,500 |

Vẫn trong giới hạn an toàn cho context window.

---

### Kết quả mong đợi

| Trước | Sau |
|-------|-----|
| Dùng `***` ngắt đoạn | Dòng trống tự nhiên |
| Không bold keyword | **Bold** từ khóa quan trọng |
| Icon lộn xộn hoặc thiếu | Icon tinh tế, có chủ đích |
| Thiếu cấu trúc | Mở bài - Thân bài - Kết luận rõ ràng |
| Có thể quá dài/quá ngắn | Độ dài phù hợp theo loại câu hỏi |

---

### File cần chỉnh sửa

**`supabase/functions/chat/index.ts`** - Thêm Response Formatting Guidelines vào systemPrompt

---

### Bước thực hiện

1. Thêm block "Response Formatting Guidelines" vào system prompt (sau dòng 969)
2. Deploy edge function `chat`
3. Test bằng câu hỏi dài về FUN Ecosystem để kiểm tra định dạng mới
