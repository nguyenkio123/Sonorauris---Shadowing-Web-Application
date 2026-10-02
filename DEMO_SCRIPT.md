# 🎬 KỊCH BẢN QUAY VIDEO DEMO 2 PHÚT (DEMO_SCRIPT.md)
**Dự án:** Sonorauris — Competitive English Shadowing Web Application (MVP v1.0)  
**Thời lượng video:** Đúng 120 giây (2 phút)  
**Môi trường chạy:** `http://localhost:5173/` (Khuyên dùng trình duyệt Chrome/Edge, tỷ lệ khung hình 16:9 1080p, chế độ Toàn màn hình `F11`)

---

## 🛠️ Chuẩn bị trước khi bấm máy (Pre-recording Setup)

1. **Khởi động dự án:**
   ```bash
   npm run dev
   ```
   Mở trình duyệt tại [http://localhost:5173/](http://localhost:5173/).

2. **Đưa hệ thống về trạng thái sạch (Clean State):**
   * Bấm tổ hợp phím **`Shift + R`** (hoặc mở thanh cheat `Shift + D` rồi bấm Reset) -> Chọn **OK**.
   * Số dư ban đầu sẽ trở về chuẩn xác: **120 XP**, **45 Coins**, **Streak 3 ngày**, lịch sử trống.

3. **Ẩn thanh Demo Cheats:**
   * Mặc định thanh Demo Cheat đã ẩn hoàn toàn. Đảm bảo góc dưới màn hình không có thanh cheat để video đạt tính chuyên nghiệp cao nhất.

4. **Các phím tắt "cứu nguy" khi quay video (Cheat Hotkeys):**
   * **`Shift + 1`**: Ép kết quả trận đấu 1v1 thành **WIN** (thắng áp đảo).
   * **`Shift + 2`**: Ép kết quả trận đấu 1v1 thành **LOSE** (thua sít sao).
   * **`Shift + 3`**: Ép kết quả trận đấu 1v1 thành **DRAW** (hòa).
   * **`Shift + 0`**: Bỏ ép điểm (chấm điểm tự nhiên).
   * **`Shift + S`**: Nộp bài thi đấu ngay lập tức (bỏ qua thu âm khi quay cảnh đấu nếu cần gấp).
   * **`Shift + D`**: Bật/tắt thanh công cụ cheat.
   * **`Shift + R`**: Reset toàn bộ dữ liệu demo về trạng thái ban đầu.

---

## ⏱️ DÒNG THỜI GIAN VÀ CÁC BƯỚC THAO TÁC (TIMELINE 0:00 – 2:00)

### 📍 PHÂN CẢNH 1: TỔNG QUAN & DUYỆT BỘ LỌC (0:00 – 0:25)
* **Màn hình:** Trang chủ (`/`)
* **Thao tác người quay:**
  1. `[0:00 - 0:08]`: Quay lướt thanh Header (chỉ vào huy hiệu **Streak 3d 🔥**, **Coins 45 🪙**, **XP 120 ⚡** và avatar `Demo Player`).
  2. `[0:08 - 0:15]`: Cuộn nhẹ qua Hero Banner *"Listen, Repeat & Battle in Real-Time"*.
  3. `[0:15 - 0:25]`: Bấm vào bộ lọc **Topic** (chọn `Work & Tech` hoặc `Daily Life`), sau đó chọn **Level** (`Beginner`). Danh sách 5 clip lọc tức thì.
* **Lời bình gợi ý (Voice-over):**
  > *"Xin chào ban giám khảo, đây là Sonorauris — nền tảng luyện nói tiếng Anh bằng kỹ thuật Shadowing kết hợp cơ chế thi đấu đối kháng thời gian thực. Trên màn hình chính, tiến trình học của người dùng được lưu trữ an toàn bằng sổ cái Ledger. Người học có thể dễ dàng chọn các đoạn clip chuẩn bản xứ từ 8 đến 20 giây được phân loại theo chủ đề và độ khó."*

---

### 📍 PHÂN CẢNH 2: LUYỆN TẬP SOLO SHADOWING (0:25 – 0:55)
* **Màn hình:** Chi tiết Luyện tập Solo (`/practice/clip-1`)
* **Thao tác người quay:**
  1. `[0:25 - 0:28]`: Bấm nút **"Practice"** tại clip đầu tiên (*Finding What You Love* - Stanford Speech).
  2. `[0:28 - 0:38]`: Bấm nút **"Play Segment"** trên video YouTube IFrame. Video tự động phát chuẩn xác đoạn `23s – 41s` (đúng giọng Steve Jobs mở đầu) và tự dừng khi hết đoạn.
  3. `[0:38 - 0:42]`: Chỉ vào khung **Target Transcript** to rõ bên phải.
  4. `[0:42 - 0:50]`: Bấm nút micro đỏ lớn **"Click to Start Recording"**. Đọc to theo câu mẫu:
     *(Đọc: "I am honored to be with you today for your commencement from one of the finest universities in the world...")*. Thanh sóng âm và đồng hồ đếm giây hoạt động sống động.
  5. `[0:50 - 0:55]`: Bấm nút vuông để dừng. Có thể bấm Play nghe lại 1 giây, sau đó bấm nút **"Submit for AI Assessment"**.
* **Lời bình gợi ý (Voice-over):**
  > *"Ở chế độ Solo, hệ thống nhúng YouTube IFrame API cắt chính xác đoạn mẫu cần luyện. Người học đọc kịch bản chuẩn, kích hoạt micro trên trình duyệt để nhại lại giọng nói theo kỹ thuật Shadowing. Sau khi thu âm, học viên có thể nghe lại và nộp bài để AI chấm điểm."*

---

### 📍 PHÂN CẢNH 3: MÀN HÌNH KẾT QUẢ AI & SỔ CÁI PHẦN THƯỞNG (0:55 – 1:20)
* **Màn hình:** Kết quả đánh giá (`/result/attempt-...`)
* **Thao tác người quay:**
  1. `[0:55 - 1:00]`: Màn hình chuyển động hiệu ứng *"Analyzing Voice Shadowing..."* trong ~1.5 giây.
  2. `[1:00 - 1:12]`: Màn hình kết quả xuất hiện:
     * Chỉ vào điểm tổng hợp **Battle Score (ví dụ: 88/100)** và huy hiệu thưởng **+50 XP**, **+15 Coins**.
     * Lướt qua 4 chỉ số cốt lõi: **Accuracy**, **Fluency**, **Completeness**, **Prosody** (tuyệt đối không dùng khái niệm Accent mơ hồ).
  3. `[1:12 - 1:20]`: Cuộn xuống phần **Word-Level Diagnostics**, chỉ vào từ có gắn nhãn lỗi màu hổ phách `[Mispronounced]` kèm gợi ý phiên âm.
* **Lời bình gợi ý (Voice-over):**
  > *"Chỉ sau 1,5 giây, hệ thống trả về kết quả chuẩn hóa theo 4 tiêu chí khắt khe: Độ chính xác, Lưu loát, Đầy đủ và Ngữ điệu. Các từ phát âm lỗi được gắn nhãn chi tiết kèm gợi ý phiên âm IPA. Điểm số tự động quy đổi thành XP và Coins được ghi nhận bất biến vào sổ cái, chống hoàn toàn việc gian lận tải lại trang."*

---

### 📍 PHÂN CẢNH 4: SẢNH ĐẤU TRƯỜNG 1v1 & GHÉP ĐỐI THỦ (1:20 – 1:40)
* **Màn hình:** Sảnh thi đấu (`/battle/lobby`)
* **Thao tác người quay:**
  1. `[1:20 - 1:25]`: Bấm nút **"Challenge in 1v1 Battle"** trên màn hình kết quả (hoặc nút Battle 1v1 trên Header).
  2. `[1:25 - 1:30]`: Bấm **"Create Private Room"**. Phòng thi đấu tạo thành công với mã 5 ký tự (ví dụ: `SH7A2`). Bấm nút **"Copy Code"** (hiện thông báo Copied!).
  3. `[1:30 - 1:35]`: Trong lúc chờ, sau đúng ~3 giây, đối thủ giả lập **ShadowBot AI 🤖** tự động bước vào phòng đấu.
  4. `[1:35 - 1:40]`: Bấm nút xanh **"I AM READY!"**. Đối thủ cũng chuyển sang READY. Hệ thống thông báo bắt đầu đếm ngược.
* **Lời bình gợi ý (Voice-over):**
  > *"Điểm đặc sắc nhất của Sonorauris là Đấu trường 1v1 thời gian thực. Người chơi tạo phòng kín với mã 5 ký tự. Khi thi đấu một mình, bot đối thủ ShadowBot AI sẽ tự động tham gia. Khi cả hai bấm Sẵn sàng, máy trạng thái ván đấu sẽ kích hoạt đếm ngược 3-2-1 đồng bộ."*

---

### 📍 PHÂN CẢNH 5: THI ĐẤU ĐỐI KHÁNG & BẢNG KẾT QUẢ WIN/LOSE (1:40 – 2:00)
* **Màn hình:** Đấu trường (`/battle/room/...`) và Kết quả ván đấu (`/battle/result/...`)
* **Thao tác người quay:**
  1. `[1:40 - 1:45]`: Đồng hồ 3D đếm ngược **3... 2... 1... GO!**.
  2. `[1:45 - 1:50]`: Video bắt đầu phát đồng bộ cho cả 2 bên. Cột bên phải người chơi thu âm (hoặc bấm nhanh nút **"Skip Record [Shift+S]"** để nộp bài ngay). Đối thủ hiển thị trạng thái *"Speaking..."* rồi *"Submitted"*.
  3. `[1:50 - 1:53]`: Màn hình chờ niêm phong *"Sealed AI Assessment in Progress"* trong ~1.5 giây mà không làm lộ điểm số trước.
  4. `[1:53 - 2:00]`: Màn hình kết quả ván đấu bùng nổ:
     * Huy hiệu **VICTORY!** rực rỡ.
     * Bảng so sánh điểm số hai bên: Người chơi (88 điểm) vs ShadowBot AI (78 điểm), chênh lệch `+10 pts`.
     * Phần thưởng thắng trận **+100 XP**, **+30 Coins**.
     * Bấm nút **"Instant Rematch 1v1"** hoặc **"Return to Catalog"** để kết thúc video.
* **Lời bình gợi ý (Voice-over):**
  > *"Cả hai đấu thủ cùng nghe một clip và nộp bài thu âm độc lập. Server thu thập audio, gửi đi đánh giá kín và công bố kết quả chung cuộc. Với điểm Battle Score cao hơn, người chơi giành chiến thắng thuyết phục và nhận thưởng lớn. Sonorauris biến việc học phát âm khô khan thành một trải nghiệm thể thao điện tử đầy hào hứng. Cảm ơn ban giám khảo đã theo dõi!"*

---

## 💡 Mẹo nhỏ cho video hoàn hảo
* Nếu muốn video kết thúc bằng cảnh **VICTORY**, hãy nhấn **`Shift + 1`** trước khi bấm Ready ván đấu.
* Hãy quay ở độ phân giải 1080p, tốc độ 60fps để các hiệu ứng thanh sóng âm và đếm ngược hiển thị mượt mà nhất.
