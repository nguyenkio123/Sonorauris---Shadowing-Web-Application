# 🤖 AGENT INSTRUCTION & PROJECT CONTEXT (AGENTS.md)
> **CRITICAL DIRECTIVE FOR ALL AI AGENTS:**
> **READ THIS FILE FIRST BEFORE INSPECTING CODEBASE OR ASKING QUESTIONS.**
> This file is the **Single Source of Truth (SSOT)** for project status, architecture, coding guidelines, and development workflows. You do **not** need to re-read the entire 90KB SRS document or re-index the whole codebase from scratch.

---

## 📌 1. Mandatory Agent Rules & Workflow

### 1.1. Git & Push Policy (QUY TẮC COMMIT & PUSH)
- **Luôn tự động commit & push lên `main`**: Mỗi khi hoàn thành một chức năng mới, một chỉnh sửa lớn hoặc sửa lỗi quan trọng trong codebase, Agent **phải tạo commit rõ ràng (Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`) và push trực tiếp lên branch `main` trên GitHub (`origin main`)**.
- Kiểm tra `git status` và chạy kiểm tra build (`npm run build`) trước khi commit để đảm bảo không commit code lỗi.

### 1.2. Coding Philosophy (TRIẾT LÝ VIẾT CODE)
- **Code tối giản, sạch gọn (Minimalist & Concise)**: Tránh viết code rườm rà, boilerplate thừa, over-engineering hoặc tạo abstraction không cần thiết.
- **Tận dụng tối đa thư viện có sẵn (No Reinventing The Wheel)**:
  - Icons: `lucide-react` (đã cài).
  - Styling: Tailwind CSS v4 (`@tailwindcss/vite`, `index.css`).
  - Routing: `react-router-dom` v7.
  - Backend/Realtime: `@supabase/supabase-js`.
  - Media/Audio: Trình duyệt gốc `MediaRecorder`, `AudioContext`, YouTube IFrame API.
- **Tuân thủ Design System (DESIGN.md)**:
  - Phong cách Airbnb: Nền trắng sạch canvas `#ffffff`, màu điểm nhấn Rausch `#ff385c`, viền nhẹ `#ebebeb`, bo góc mềm `rounded-xl` / `rounded-full`, typography sạch sẽ (Airbnb Cereal VF / Inter).
  - Tránh các khối màu thô kệch; luôn có hiệu ứng vi mô mượt mà (micro-transitions).

---

## 🎯 2. Trạng Thái Dự Án So Với Đặc Tả (SRS v1.0 Matrix)

**Dự án:** **Sonorauris** — Competitive English Shadowing Web Application  
**Bản phát hành hiện tại:** Competition MVP v1.0  
**Build Status:** `tsc -b && vite build` ✅ Thành công 100%.

### Bảng Đối Chiếu Tính Năng:

| Mã SRS | Tên tính năng | Ưu tiên | Trạng thái hiện tại | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :---: | :--- |
| **FR-AUTH-01** | Đăng ký / Đăng nhập | P0 | 🟡 Mock Local | Đang dùng mock user `Demo Player` trong `localStorage`. Cần form/auth khi nối Supabase Auth. |
| **FR-AUTH-02** | Hồ sơ cá nhân | P0 | 🟡 Mock Local | Hiển thị avatar, tên, stats trên Header. Chưa có trang/modal chỉnh sửa profile. |
| **FR-CONT-01** | Danh mục clip chọn lọc | P0 | 🟢 Hoàn thành | Đã có 20/20 clip chuẩn tại `src/data/clips.ts` phủ đều 5 chủ đề và 3 cấp độ. |
| **FR-CONT-02** | Nhúng phát YouTube | P0 | 🟢 Hoàn thành | `YouTubePlayer.tsx` nhúng iframe, tự ngắt chính xác theo `startTimeSec` ➔ `endTimeSec`. |
| **FR-CONT-03** | Transcript tham chiếu | P0 | 🟢 Hoàn thành | Transcript chuẩn 100% đặt nổi bật tại cột phải `PracticePage.tsx`. |
| **FR-REC-01** | Quyền Microphone | P0 | 🟢 Hoàn thành | `AudioRecorder.tsx` xin quyền khi bấm thu âm, có thông báo khi từ chối quyền. |
| **FR-REC-02** | Thu âm MediaRecorder | P0 | 🟢 Hoàn thành | Thu âm, đếm giây, sóng âm visualizer, nghe lại playback, thu lại. |
| **FR-REC-03** | Nộp file âm thanh | P0 | 🟢 Hoàn thành | Nộp Blob âm thanh vào pipeline chấm điểm. |
| **FR-AI-01** | Đánh giá 4 tiêu chí AI | P0 | 🟢 Hoàn thành | Adapter Azure Speech (`azureSpeech.ts`) + fallback local engine (NFR-05, NFR-10). |
| **FR-AI-02** | Trả kết quả chi tiết | P0 | 🟢 Hoàn thành | `ResultPage.tsx` hiển thị Battle Score và 4 chỉ số điểm. |
| **FR-AI-03** | Lỗi cấp từ (Miscues) | P0 | 🟢 Hoàn thành | Gắn nhãn Mispronounced, Omission, kèm gợi ý IPA chi tiết. |
| **FR-PROG-01** | Điểm kinh nghiệm XP | P0 | 🟢 Hoàn thành | Tích lũy qua sổ cái bất biến `RewardTransaction` (idempotent ledger). |
| **FR-PROG-02** | Tiền thưởng Coins | P0 | 🟢 Hoàn thành | Quản lý qua ledger, chống gian lận F5 / spam request. |
| **FR-PROG-03** | Chuỗi ngày (Streak) | P0 | 🟢 Hoàn thành | Tăng 1 ngày khi hoàn thành bài tập đầu tiên trong ngày dương lịch. |
| **FR-PROG-04** | Khôi phục Streak | P0 | 🟢 Hoàn thành | Tiêu tốn 30 Coins để khôi phục streak (tối đa 1 lần/7 ngày) trực tiếp tại `/shop`. |
| **FR-SHOP-01** | Cửa hàng Ngoại trang | P0 | 🟢 Hoàn thành | Trang `/shop` mua & trang bị Avatar, Khung, Danh hiệu bằng Coins qua Ledger. |
| **FR-BAT-01** | Tạo phòng 1v1 | P0 | 🟢 Hoàn thành | Tạo phòng sinh mã 5 ký tự (`BattleLobbyPage.tsx`); phát Supabase Realtime broadcast. |
| **FR-BAT-02** | Vào phòng bằng mã | P0 | 🟢 Hoàn thành | Nhập mã 5 ký tự; hỗ trợ 2 người chơi thật qua mạng Internet và bot offline. |
| **FR-BAT-03** | Sẵn sàng & Đếm ngược | P0 | 🟢 Hoàn thành | Máy trạng thái đếm ngược đồng bộ 3-2-1 (`BattleRoomPage.tsx`). |
| **FR-BAT-04** | Đánh giá trận đấu | P0 | 🟢 Hoàn thành | Cả 2 nộp bài độc lập, server chấm dựa trên cùng 1 transcript. |
| **FR-BAT-05** | Xác định kết quả đấu | P0 | 🟢 Hoàn thành | So sánh Battle Score -> VICTORY / DEFEAT / DRAW (`BattleResultPage.tsx`). |
| **FR-BAT-06** | Trả thưởng trận đấu | P0 | 🟢 Hoàn thành | Thắng (+100 XP, +30 Coins), Hòa (+50 XP, +15 Coins), Thua (+25 XP, +5 Coins). |
| **FR-QUEST-01**| 3 Nhiệm vụ hằng ngày | P1 | 🟢 Hoàn thành | 3 nhiệm vụ ngày (Solo, Điểm cao ≥80, Đấu 1v1), theo dõi thời gian thực, modal nhận thưởng XP/Coins qua Ledger. |
| **FR-DICT-01** | Tra từ điển transcript | P1 | 🟢 Hoàn thành | Click vào từ trong transcript hiển thị nghĩa, phiên âm IPA, câu ví dụ và phát âm audio qua Free Dictionary API + Web Speech. |
| **FR-BAT-07** | Phòng đấu 3–5 người | P1 | 🟢 Hoàn thành | Sức chứa 2–5 người (1v1, Trio, Squad, Royale), bot sparring tự lấp đầy, bảng xếp hạng Podium và huy chương tại kết quả. |

---

## 🏗️ 3. Kiến Trúc & Cấu Trúc File Quan Trọng

```
d:\Shadowing-web-application\
├── src/
│   ├── api/
│   │   ├── index.ts          # Public API facade (getMe, getClips, submitAttempt, createRoom, quests, etc.)
│   │   ├── dictionary.ts     # Free Dictionary API adapter + Web Speech fallback
│   │   ├── mockServer.ts     # Mô phỏng AI assessment & State machine phòng đấu 2-5 người (F5-resilient)
│   │   └── storage.ts        # Immutable Ledger, LocalStorage cache, Daily quests state
│   ├── components/
│   │   ├── common/           # DictionaryModal.tsx (Tra từ điển transcript)
│   │   ├── layout/           # Header.tsx, DailyQuestsModal.tsx, Footer.tsx, DemoCheatBar.tsx
│   │   ├── player/           # YouTubePlayer.tsx (IFrame API controller, boundary guard)
│   │   └── recorder/         # AudioRecorder.tsx (MediaRecorder, Visualizer, Playback)
│   ├── config/
│   │   ├── demo.ts           # Cấu hình Demo, forced outcomes, bot delay
│   │   └── scoring.ts        # Trọng số Battle Score (SRS 8.2) & Định mức phần thưởng
│   ├── data/
│   │   ├── clips.ts          # Danh mục 20 clips mẫu chuẩn YouTube
│   │   ├── quests.ts         # 3 Nhiệm vụ hằng ngày mẫu
│   │   └── shopItems.ts      # Danh mục ngoại trang (Avatars, Frames, Titles)
│   ├── hooks/
│   │   └── useRoom.ts        # Polling/sync trạng thái phòng đấu theo thời gian thực
│   ├── pages/
│   │   ├── HomeCatalogPage.tsx   # Trang chủ: duyệt danh mục clip, lọc topic/level, search
│   │   ├── PracticePage.tsx      # Luyện tập Solo: Video + Clickable Transcript Dictionary + Audio Recorder
│   │   ├── ResultPage.tsx        # Kết quả chấm điểm 4 tiêu chí + Từ lỗi + Thưởng
│   │   ├── ShopPage.tsx          # Cửa hàng ngoại trang & Khôi phục Streak
│   │   ├── BattleLobbyPage.tsx   # Sảnh đấu trường 2-5 người: Tạo phòng, Chọn mode, Vào phòng
│   │   ├── BattleRoomPage.tsx    # Phòng thi đấu: Đếm ngược 3-2-1, cùng làm bài
│   │   └── BattleResultPage.tsx  # Bảng kết quả so tài 1v1 hoặc Bảng xếp hạng Podium 3-5 người
│   ├── routes/
│   │   └── AppRoutes.tsx     # Bộ định tuyến React Router v7
│   └── types/                # Types: clip.ts, attempt.ts, battle.ts, transaction.ts, user.ts, quest.ts, shop.ts
├── DEMO_SCRIPT.md            # Kịch bản quay video demo 120 giây chi tiết
├── DESIGN.md                 # Toàn bộ design token, typography, spacing chuẩn Airbnb
└── Đặc tả Yêu cầu Phần mềm (SRS) - English Shadowing MVP v1.0.md # Tài liệu đặc tả gốc
```

---

## ⚙️ 4. Thông Tin Kỹ Thuật Cần Nhớ Khi Coding

1. **Công thức Battle Score (SRS 8.2 & `src/config/scoring.ts`)**:
   $$\text{Battle Score} = \text{round}(0.35 \times \text{Accuracy} + 0.25 \times \text{Fluency} + 0.20 \times \text{Completeness} + 0.20 \times \text{Prosody})$$
   *Tuyệt đối không dùng từ "Accent" trong UI và code.*

2. **Cơ chế chống gian lận phần thưởng (Ledger Pattern - `src/api/storage.ts`)**:
   Mọi phần thưởng phải lưu dưới dạng transaction với khóa duy nhất: `(referenceType, referenceId, type)`. Khi người dùng F5 hoặc gọi lại request, hàm `addRewardTransactions` tự động bỏ qua nếu đã tồn tại.

3. **Phím tắt Demo Cheat (phục vụ test & quay video demo - `DEMO_SCRIPT.md`)**:
   - `Shift + 1`: Ép kết quả 1v1 thành **WIN**.
   - `Shift + 2`: Ép kết quả 1v1 thành **LOSE**.
   - `Shift + 3`: Ép kết quả 1v1 thành **DRAW**.
   - `Shift + 0`: Bỏ ép điểm (tự nhiên).
   - `Shift + S`: Bỏ qua thu âm, nộp bài đấu ngay lập tức.
   - `Shift + D`: Bật/tắt thanh công cụ cheat.
   - `Shift + R`: Reset toàn bộ dữ liệu demo về trạng thái ban đầu (120 XP, 45 Coins, Streak 3d).

4. **Trạng thái phần thưởng**:
   `PracticePage.tsx` và `scoring.ts` đã đồng bộ hoàn toàn (`+50 XP` / `+15 Coins` cho lượt Luyện tập Solo).

---

## 📋 5. Lộ Trình Công Việc Kế Tiếp (Prioritized Roadmap)

### Giai đoạn 1: Hoàn thiện 100% tính năng P0 (✅ HOÀN THÀNH)
1. ✅ **Fix lỗi lệch phần thưởng** tại `PracticePage.tsx` đồng bộ với `scoring.ts`.
2. ✅ **Cửa hàng Ngoại trang (FR-SHOP-01)**: Trang `/shop` mua và trang bị Avatar, Khung aura, Danh hiệu bằng Coins qua Ledger.
3. ✅ **Khôi phục Streak (FR-PROG-04)**: Dùng 30 Coins để khôi phục chuỗi ngày khi nhấn vào Streak / Shop (cooldown 7 ngày).
4. ✅ **Bổ sung Clip (`src/data/clips.ts`)**: Đã đạt 20 clip tiếng Anh chất lượng cao từ YouTube phủ đều 5 chủ đề và 3 cấp độ.

### Giai đoạn 2: Kết nối Supabase Realtime & Backend API (✅ HOÀN THÀNH)
1. ✅ **Cấu hình & Schema PostgreSQL/Supabase**: Đã tạo file `supabase/schema.sql` đầy đủ theo SRS mục 12 và cập nhật `.env.example`.
2. ✅ **Multiplayer 1v1 qua Supabase Realtime**: `realtimeRoom.ts` và `useRoom.ts` hỗ trợ Broadcast Channel (<50ms) để 2 máy tính thật tham gia và thi đấu trực tiếp qua Internet.
3. ✅ **Adapter Azure Speech Pronunciation Assessment**: Module `azureSpeech.ts` chuẩn hóa 4 chỉ số (Accuracy, Fluency, Completeness, Prosody) và lỗi cấp từ với cơ chế fallback local engine an toàn.

### Giai đoạn 3: Hoàn thiện toàn bộ tính năng P1 (✅ HOÀN THÀNH)
1. ✅ **Tra từ điển trên Transcript khi click (`FR-DICT-01`)**: Tích hợp Free Dictionary API, phát âm âm thanh bản xứ + Web Speech synthesis fallback, modal popover chuẩn Airbnb.
2. ✅ **3 Nhiệm vụ hằng ngày (`FR-QUEST-01`)**: Tự động tính toán tiến độ hằng ngày (Luyện tập solo, Đạt điểm cao ≥80, Tham gia đấu trường 1v1) và nhận thưởng XP/Coins qua Ledger.
3. ✅ **Phòng đấu 3–5 người (`FR-BAT-07`)**: Tùy chọn sức chứa phòng (2P, 3P, 4P, 5P), bot sparring đa dạng (Alpha, Neo, Max, Iris), và bảng xếp hạng Podium trao huy chương vàng/bạc/đồng tại trang kết quả.


---
*File này được tạo tự động và cập nhật liên tục để đảm bảo hiệu suất tốt nhất cho các phiên làm việc của Agent.*
