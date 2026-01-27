
Mục tiêu: Khắc phục tình trạng Angel AI trả lời “cụt ngang” khi câu hỏi cần câu trả lời rất dài (ví dụ: giới thiệu FUN Ecosystem + chi tiết từng platform). Hiện tượng xảy ra trên Desktop và không có toast lỗi → nhiều khả năng do giới hạn độ dài đầu ra từ backend hoặc do parser streaming ở frontend làm rơi mất một phần dữ liệu.

## 1) Chẩn đoán từ code hiện tại (điểm chính)
### 1.1 Backend đang giới hạn độ dài câu trả lời
Trong backend function `supabase/functions/chat/index.ts`, khi gọi Lovable AI Gateway đang đặt:
- `stream: true`
- `max_tokens: 1500`

Giới hạn 1500 tokens là khá thấp cho một câu trả lời “rất chi tiết”, đặc biệt khi system prompt đã dài hơn sau khi tích hợp Hiến Pháp + Eternal Core. Điều này khiến model tự dừng giữa chừng mà không báo lỗi phía app.

### 1.2 Frontend streaming parser có thể làm “rơi” token khi JSON bị cắt
Ở `src/pages/Chat.tsx`, client đọc SSE và `JSON.parse` từng dòng. Nếu parse lỗi thì hiện tại `catch { /* ignore */ }` → có thể làm mất những mảnh JSON bị cắt ngang giữa các chunk (trường hợp hiếm nhưng có thể xảy ra), khiến nội dung hiển thị bị thiếu hoặc kết thúc sớm.

## 2) Thiết kế giải pháp
Giải pháp sẽ gồm 2 lớp (ưu tiên an toàn, ít ảnh hưởng):

### A. Tăng giới hạn output từ backend (fix cốt lõi)
- Tăng `max_tokens` từ `1500` lên mức cao hơn (đề xuất 3500–4500).
- (Tùy chọn) cập nhật model về mặc định mới hơn nếu cần chất lượng/độ ổn định streaming tốt hơn. Nhưng ưu tiên trước mắt là tăng `max_tokens` (thay đổi tối thiểu, hiệu quả lớn).

Kỳ vọng: Câu trả lời dài sẽ không bị dừng giữa chừng.

### B. Sửa streaming parser ở frontend để không làm rơi dữ liệu (fix độ ổn định)
- Khi gặp `JSON.parse` lỗi, không “ignore” luôn:
  - Đưa dòng chưa parse được quay lại buffer và chờ chunk tiếp theo (cơ chế re-buffer).
- Đồng thời theo dõi (nếu gateway trả về) `finish_reason` để debug/hiển thị tốt hơn về sau.

Kỳ vọng: Không bị thiếu token do parsing, câu trả lời dài ổn định hơn.

### C. (Tùy chọn) Cơ chế “tự động tiếp tục” khi vẫn bị chạm giới hạn
Nếu sau khi tăng `max_tokens` vẫn có trường hợp quá dài:
- Nhận diện `finish_reason === "length"` (nếu có trong stream).
- Tự động gửi thêm một lượt “Tiếp tục phần còn lại” và hiển thị thành message kế tiếp (đảm bảo liền mạch).

Mặc định: để “tắt” (hoặc chỉ bật khi phát hiện finish_reason=length), vì sẽ tăng số lần gọi AI.

## 3) Các thay đổi dự kiến theo file
### 3.1 Backend
**File:** `supabase/functions/chat/index.ts`
- Thay `max_tokens: 1500` → `max_tokens: 4000` (con số có thể điều chỉnh sau khi test thực tế).
- (Tùy chọn) Đổi `model: 'google/gemini-2.5-flash'` → `'google/gemini-3-flash-preview'` nếu cần đồng bộ theo khuyến nghị hiện tại; tuy nhiên không bắt buộc để fix lỗi cụt ngang.

### 3.2 Frontend
**File:** `src/pages/Chat.tsx`
- Cải thiện vòng lặp đọc stream:
  - Không split đơn giản rồi “bỏ qua” parse lỗi.
  - Khi parse lỗi: put-back line vào buffer và break để chờ thêm dữ liệu.
- (Tùy chọn) Ghi nhận `finish_reason` (nếu có) để quyết định có tự động “continue” hay không.

## 4) Cách kiểm thử sau khi làm
1. Trên trang Chat (Desktop), gửi đúng câu hỏi bạn đưa:
   “Hi bé Angel! … giới thiệu FUN Ecosystem … giới thiệu chi tiết từng platform …”
2. Kỳ vọng: Angel AI trả lời hết danh sách platform, không dừng ở giữa (ví dụ đang tới mục 8 thì ngừng).
3. Test thêm 1–2 câu hỏi dài khác (tổng hợp sứ mệnh + triết lý + từng platform).
4. Nếu vẫn thấy bị cụt:
   - Kiểm tra xem stream có `finish_reason=length` hay không.
   - Khi có → bật cơ chế auto-continue (mục 2C) để câu trả lời luôn hoàn chỉnh.

## 5) Rủi ro & lưu ý
- Tăng `max_tokens` làm câu trả lời dài hơn → tăng thời gian phản hồi và chi phí AI cho mỗi câu hỏi dài (nhưng đúng với nhu cầu “rất chi tiết” của bạn).
- Nếu câu hỏi cực dài + yêu cầu cực chi tiết, vẫn có thể chạm giới hạn model. Khi đó cơ chế auto-continue là phương án “bảo hiểm” tốt nhất.
- Frontend parser fix là rất đáng làm vì hiện tại parse lỗi đang bị bỏ qua hoàn toàn.

## 6) Phạm vi thay đổi (tóm tắt)
- Sửa 2 file:
  1) `supabase/functions/chat/index.ts` (tăng max_tokens)
  2) `src/pages/Chat.tsx` (stream parser robust + (tùy chọn) auto-continue theo finish_reason)

Sau khi bạn bấm Approve (đang ở chế độ read-only), mình sẽ chuyển sang triển khai các thay đổi trên và test nhanh bằng một request chat dài để xác nhận không còn bị cụt ngang.
