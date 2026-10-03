# 🎙️ Sonorauris — Competitive English Shadowing Web Application

<p align="center">
  <img src="public/logo.jpe" alt="Sonorauris Logo" width="120" style="border-radius: 20px; box-shadow: 0 4px 14px rgba(0,0,0,0.1);" />
</p>

<p align="center">
  <strong>Master spoken English rhythm, intonation, and connected speech through authentic video shadowing and real-time multiplayer duels.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Acceptance%20Tests-57%2F57%20Passed%20(100%25)-4E9488?style=flat-square" alt="Tests" />
  <img src="https://img.shields.io/badge/Build-Passing-10b981?style=flat-square" alt="Build" />
  <img src="https://img.shields.io/badge/Design%20System-Airbnb%20Minimalist-171B2A?style=flat-square" alt="Design" />
  <img src="https://img.shields.io/badge/License-MIT-gray?style=flat-square" alt="License" />
</p>

---

## ✨ Tổng Quan Dự Án

**Sonorauris** là nền tảng web luyện nói tiếng Anh theo phương pháp **Shadowing** (nói nhại thời gian thực) kết hợp yếu tố đối kháng (Competitive Arena) và chẩn đoán phát âm chuẩn xác. Ứng dụng mang đến trải nghiệm học tập cuốn hút, mượt mà chuẩn phong cách thiết kế Airbnb với tỷ lệ màu 60-30-10 sang trọng.

### 🌟 Tính Năng Cốt Lõi

1. **🎧 Luyện Tập Solo (Authentic Shadowing Practice):**
   - 20 bài tập video chất lượng cao từ YouTube phủ đều 5 chủ đề và 3 cấp độ (Beginner, Intermediate, Advanced).
   - Đồng bộ chính xác 100% từng mili-giây giữa transcript hiển thị và khẩu âm thực tế của diễn giả.
   - Thu âm giọng đọc trực tiếp với MediaRecorder và bộ hiển thị sóng âm sống động (Audio Visualizer).

2. **📖 Tra Từ Điển Transcript Siêu Tốc (Zero-cost Transcript Dictionary):**
   - Click vào bất kỳ từ vựng nào trong transcript để xem định nghĩa ngữ cảnh, phiên âm quốc tế IPA và phát âm chuẩn bản xứ.
   - Kiến trúc 3 tầng dự phòng hoàn toàn miễn phí: **Free Dictionary API ➔ Datamuse Princeton WordNet ➔ Wiktionary REST API**.
   - Bộ giải thuật Morphological Lemmatization tự động tìm từ gốc cho các dạng số nhiều (`-s`, `-ies`), quá khứ (`-ed`), tiếp diễn (`-ing`), so sánh (`-est`).
   - Bộ nhớ đệm kép Dual-cache cho tốc độ mở popup từ điển tức thì trong **0 mili-giây**.

3. **⚔️ Đấu Trường Đối Kháng 1v1 & 3–5 Người (Real-time Arena):**
   - Tạo phòng sinh mã ngẫu nhiên 5 ký tự và mời bạn bè tham gia qua Supabase Realtime Broadcast (<50ms).
   - Hỗ trợ thi đấu từ 2 đến 5 người chơi (1v1, Trio, Squad, Royale) kèm dàn bot thông minh (Alpha, Neo, Max, Iris) tự động lấp đầy phòng.
   - Đồng bộ đếm ngược 3-2-1 và chấm điểm độc lập dựa trên cùng một đoạn transcript.
   - Bảng xếp hạng bục vinh quang (Podium) trao huy chương Vàng / Bạc / Đồng tại trang kết quả.

4. **🎯 Đánh Giá 4 Tiêu Chí AI (Pronunciation Assessment):**
   - Chấm điểm đa chiều gồm 4 chỉ số: **Độ chính xác (Accuracy 35%)**, **Độ lưu loát (Fluency 25%)**, **Độ hoàn thiện (Completeness 20%)**, và **Ngữ điệu (Prosody 20%)**.
   - Phân tích chi tiết lỗi phát âm cấp từ (Mispronounced, Omission) kèm phiên âm IPA gợi ý.

5. **💎 Hệ Thống Sổ Cái Phần Thưởng (Immutable Ledger & Anti-Cheat):**
   - Tích lũy điểm kinh nghiệm (**XP**) và tiền thưởng (**Coins**) an toàn, chống gian lận F5 hoặc spam request.
   - Chuỗi ngày luyện tập liên tục (**Streak**) và tính năng khôi phục chuỗi (**Streak Insurance**) tiêu tốn 30 Coins (cooldown 7 ngày).
   - 3 Nhiệm vụ hằng ngày (**Daily Quests**) tự động làm mới vào 00:00 hằng ngày.

6. **🛍️ Cửa Hàng Ngoại Trang (Cosmetic Shop):**
   - Dùng Coins kiếm được qua bài tập để mua và trang bị Avatar, Khung hào quang (Frames), và Danh hiệu cá nhân (Titles).

---

## 🎨 Hệ Thống Nhận Diện Thương Hiệu (Design Tokens)

Tuân thủ nghiêm ngặt quy tắc phối màu chuẩn **60 - 30 - 10**:
- **60% Nền Canvas sáng:** Màu Trắng `#FFFFFF` và Surface Soft `#F7F9FA` chuẩn phong cách tối giản Airbnb.
- **30% Màu Navy Đậm (`#171B2A`):** Dùng cho tiêu đề (`h1`–`h6`), văn bản chính (Ink), viền card, huy hiệu và nút phụ.
- **10% Màu Xanh Turquoise Điểm Nhấn (`#4E9488`):** Dùng cho logo Sonorauris, các nút hành động chính (Primary CTA), thanh tiến trình, icon Streak Flame và các liên kết tương tác.

---

## 📊 Công Thức Chấm Điểm Battle Score (SRS 8.2)

$$\text{Battle Score} = \text{round}(0.35 \times \text{Accuracy} + 0.25 \times \text{Fluency} + 0.20 \times \text{Completeness} + 0.20 \times \text{Prosody})$$

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Cục Bộ

### 1. Yêu Cầu Môi Trường
- **Node.js:** Phiên bản 18.x hoặc mới hơn.
- **npm:** Đi kèm với Node.js.

### 2. Cài Đặt
```bash
# Clone repository
git clone https://github.com/nguyenkio123/Sonorauris---Shadowing-Web-Application.git
cd Sonorauris---Shadowing-Web-Application

# Cài đặt các gói phụ thuộc
npm install
```

### 3. Chạy Môi Trường Phát Triển (Dev Server)
```bash
npm run dev
```
Mở trình duyệt tại: `http://localhost:5173/`

### 4. Chạy Bộ Kiểm Thử Nghiệm Thu (Acceptance Tests)
```bash
npm run test:acceptance
```
*Kết quả:* **57/57 tests PASS (100%)** bao gồm kiểm tra clips, scoring engine, sổ cái ledger, chuỗi streak, cửa hàng, nhiệm vụ và phòng đấu đa người chơi.

### 5. Build Bản Triển Khai Production
```bash
npm run build
```

---

## ⌨️ Phím Tắt Tiện Ích Cho Demo (Demo Cheat Shortcuts)

Phục vụ quá trình chấm điểm, demo và kiểm thử nhanh tính năng:
- `Shift + 1`: Ép kết quả trận đấu 1v1 thành **WIN**.
- `Shift + 2`: Ép kết quả trận đấu 1v1 thành **LOSE**.
- `Shift + 3`: Ép kết quả trận đấu 1v1 thành **DRAW**.
- `Shift + 0`: Chế độ chấm điểm tự nhiên (AUTO).
- `Shift + S`: Bỏ qua thời gian thu âm, nộp bài thi đấu ngay lập tức.
- `Shift + D`: Bật / Tắt thanh công cụ Demo Cheat Bar.
- `Shift + R`: Đưa toàn bộ tài khoản về mốc dữ liệu ban đầu (120 XP, 45 Coins, Streak 3 ngày).

---

## 📄 Bản Quyền & Giấy Phép

Dự án phát triển phục vụ mục đích học tập và thi đấu công nghệ. Bản quyền © 2026 **Sonorauris, Inc.** All rights reserved.
