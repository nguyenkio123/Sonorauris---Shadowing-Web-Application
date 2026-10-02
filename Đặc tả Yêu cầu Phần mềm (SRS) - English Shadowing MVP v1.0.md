# **TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM (SRS)**

## **Ứng dụng Web Luyện nói Tiếng Anh Đối kháng (English Shadowing) — Bản MVP v1.0**

| THÔNG TIN BỐI CẢNH DỰ ÁN | Nhóm 3 sinh viên • Thời gian thực hiện: \~4 tuần • Quy mô cuộc thi cấp trường • Ưu tiên hoàn thiện MVP cốt lõi |
| :---- | :---- |
| **Trạng thái tài liệu** | Tài liệu đặc tả cơ sở phục vụ lập kế hoạch triển khai |
| **Bản phát hành mục tiêu** | MVP dự thi (Competition MVP) |
| **Đối tượng người dùng chính** | Sinh viên đại học, trình độ tiếng Anh tương đương A2–B2 |
| **Cập nhật lần cuối** | 28 tháng 09 năm 2026 |

## **1\. Tóm tắt Tổng quan (Executive Summary)**

* **Ý niệm sản phẩm (Product Concept):** Ứng dụng web biến kỹ thuật luyện nói *Shadowing* qua video ngắn thành một chu trình học tập có thể đo lường và mang tính thi đấu: người học nghe một video ngắn, nhại lại lời thoại mẫu, ghi âm bài nói, nhận phản hồi phát âm tự động từ AI và tùy chọn thi đấu đối kháng với bạn bè trên cùng một thử thách.  
* **Vòng lặp cốt lõi (Core Loop):![][image1]**  
* **Nguyên tắc MVP:** Ứng dụng không hướng tới trở thành nền tảng tiếng Anh đa năng. Bản MVP tập trung duy nhất vào bản sắc cốt lõi: **Luyện Shadowing mang tính thi đấu**. Các tính năng từ điển, nhiệm vụ, chuỗi ngày học (streak) và vật phẩm ngoại trang đóng vai trò bổ trợ; các tính năng như Chatbot AI, tự động ghép trận toàn cầu, gọi thoại/video trực tiếp và công cụ tự động phân tích URL YouTube người dùng tải lên đều nằm ngoài phạm vi MVP.

## **2\. Mục tiêu Sản phẩm và Phạm vi Loại trừ (Goals & Non-Goals)**

### **2.1 Mục tiêu (Goals)**

1. Cung cấp quy trình luyện tập Shadowing lặp lại hiệu quả dựa trên danh mục video tiếng Anh ngắn được chọn lọc sẵn.  
2. Cung cấp phản hồi phát âm tức thì, dễ hiểu dựa trên các tiêu chí phát âm cụ thể, thay vì đưa ra một điểm số “accent” trừu tượng và không rõ căn cứ.  
3. Biến việc luyện nói cá nhân nhàm chán thành trải nghiệm thi đấu nhẹ nhàng thông qua phòng đấu kín và chế độ 1v1.  
4. Xây dựng động lực học tập thông qua cơ chế tiến trình: Điểm kinh nghiệm (XP), Tiền thưởng (Coins), Chuỗi ngày học (Streak) và Nhiệm vụ hằng ngày.  
5. Cung cấp một bản demo hoàn chỉnh từ đầu đến cuối (end-to-end), có thể triển khai và hoàn thiện bởi 3 sinh viên trong khoảng thời gian 4 tuần.

### **2.2 Các mục tiêu ngoài phạm vi MVP (Non-Goals)**

1. Đàm thoại giọng nói hoặc video thời gian thực trực tiếp giữa người chơi (WebRTC Voice/Video Call).  
2. Hệ thống xếp hạng hoặc ghép trận quy mô lớn trên toàn cầu (Global Matchmaking/Rank system).  
3. Công cụ tự động phân tích và trích xuất URL YouTube bất kỳ thành bài học hoàn chỉnh.  
4. Trợ lý ảo AI / Chatbot hỗ trợ đàm thoại tự do.  
5. Hệ thống quản trị nội dung quy mô lớn hoặc cho phép nhà sáng tạo tự do tải video lên.  
6. Cung cấp chứng chỉ CEFR hay khẳng định điểm số AI là thước đo chuẩn mực, tuyệt đối về năng lực tiếng Anh tổng quát.

## **3\. Phạm vi và Thứ tự Ưu tiên (Scope & Priorities)**

| Mức ưu tiên | Các phân hệ / Tính năng | Quy tắc phát hành |
| :---- | :---- | :---- |
| **P0 — Bắt buộc phải có (Must Have)** | Xác thực/Hồ sơ, Danh mục clip, Nhúng video YouTube, Transcript mẫu, Ghi âm qua Microphone, Đánh giá giọng nói AI, Màn hình kết quả/phản hồi, XP, Streak, Phòng đấu riêng, Trận đấu 1v1, Cửa hàng vật phẩm. | Phải hoạt động thông suốt từ đầu đến cuối trước khi tối ưu giao diện. |
| **P1 — Nên có (Should Have)** | Nhiệm vụ hằng ngày, Tra cứu từ điển, Bảng xếp hạng, Phòng đấu 3–5 người, Điểm xếp hạng trận đấu (Battle Rating), Mời bạn bè qua mã phòng. | Chỉ triển khai sau khi tất cả tính năng P0 đã ổn định. |
| **P2 — Định hướng tương lai (Future)** | Chatbot AI, Ghép trận ngẫu nhiên toàn cầu, Đàm thoại trực tiếp thời gian thực, Tự động phân tích video YouTube theo yêu cầu, Thư viện bài học mở rộng. | Không triển khai trong bản MVP dự thi. |

**QUY TẮC ĐÓNG BĂNG PHẠM VI (SCOPE FREEZE):**

Đầu Tuần 3, nghiêm cấm bổ sung bất kỳ tính năng P2 nào. Nếu có tính năng P0 hoạt động không ổn định, phải dừng mọi công việc của P1 cho đến khi P0 được khắc phục hoàn toàn.

## **4\. Chân dung Người dùng Mục tiêu (User Personas)**

| Nhóm người dùng | Bối cảnh | Nỗi đau (Pain Point) | Nhu cầu thực tế |
| :---- | :---- | :---- | :---- |
| **Người học sinh viên (Student Learner)** | Sinh viên đọc hiểu tiếng Anh khá nhưng thiếu môi trường và phản xạ nói. | Luyện tập không đều đặn; nói một mình không có ai sửa lỗi phát âm tức thì. | Các bài luyện ngắn, điểm số minh bạch, lộ trình tiến bộ rõ ràng. |
| **Người học thích cạnh tranh (Competitive Learner)** | Người có động lực cao khi học cùng bạn bè, thích đua top hoặc vượt qua thử thách game. | Luyện một mình dễ chán và bỏ cuộc. | Các trận đấu 1v1 nhanh gọn và phần thưởng trực quan. |
| **Nhóm bạn bè (Friend Group)** | Nhóm 2–5 sinh viên muốn cùng nhau luyện tập. | Khó thống nhất thời gian và bài tập chung để cùng thực hành. | Phòng luyện tập riêng tư với mã chia sẻ nhanh. |

## **5\. Câu chuyện Người dùng (User Stories)**

| Mã số | Câu chuyện người dùng | Ưu tiên | Tiêu chí nghiệm thu tóm tắt |
| :---- | :---- | :---- | :---- |
| **US-01** | Là người học, tôi muốn duyệt danh mục clip theo chủ đề/độ khó để chọn thử thách phù hợp. | P0 | Danh mục hiển thị danh sách clip kèm đầy đủ metadata và có thể phát được. |
| **US-02** | Là người học, tôi muốn xem/nghe video clip và thấy văn bản transcript tham chiếu đi kèm. | P0 | Trình phát video, transcript mẫu và các nút điều khiển hiển thị sẵn sàng. |
| **US-03** | Là người học, tôi muốn ghi âm phần shadowing của mình trực tiếp bằng micro trên trình duyệt. | P0 | Yêu cầu cấp quyền mic, ghi âm, nghe lại, thu âm lại và gửi bài hoạt động bình thường. |
| **US-04** | Là người học, tôi muốn nhận điểm đánh giá phát âm chi tiết sau khi nộp bài thu âm. | P0 | Hệ thống trả về điểm số hợp lệ hoặc thông báo lỗi rõ ràng nếu phân tích thất bại. |
| **US-05** | Là người học, tôi muốn biết chính xác mình cần cải thiện ở tiêu chí nào (độ chính xác, độ lưu loát,...). | P0 | Kết quả hiển thị điểm thành phần và lỗi chi tiết ở cấp độ từ (nếu có). |
| **US-06** | Là người học, tôi muốn nhận XP/coins sau khi hoàn thành bài tập hoặc trận đấu hợp lệ. | P0 | Giao dịch nhận thưởng được xử lý an toàn tại backend, không thể bị gian lận/nhân bản. |
| **US-07** | Là người chơi, tôi có thể tạo phòng thi đấu riêng. | P0 | Tạo thành công mã phòng ngắn gọn để gửi cho đối thủ. |
| **US-08** | Là người chơi, tôi có thể vào phòng bằng mã và thực hiện cùng thử thách với đối thủ. | P0 | Cả hai người chơi nhìn thấy trạng thái phòng đồng bộ theo thời gian thực. |
| **US-09** | Là người chơi, tôi muốn so sánh điểm số cuối cùng với đối thủ để biết ai thắng hoặc hòa. | P0 | Máy chủ tự động tính toán kết quả từ dữ liệu chấm điểm đã lưu trữ. |
| **US-10** | Là người học, tôi muốn duy trì và khôi phục chuỗi ngày học (streak) bằng coins trong giới hạn cho phép. | P0 | Quy tắc khôi phục tuân thủ đúng cấu hình hệ thống (chi phí, chu kỳ). |
| **US-11** | Là người học, tôi muốn dùng coins để mua các vật phẩm ngoại trang (avatar, khung, danh hiệu). | P0 | Giao dịch nguyên tử (atomic), số dư không bị âm, không mua trùng lặp vật phẩm đã có. |
| **US-12** | Là người học, tôi muốn hoàn thành các nhiệm vụ học tập hằng ngày. | P1 | Tiến độ nhiệm vụ chỉ cập nhật từ các hoạt động học tập hợp lệ. |
| **US-13** | Là người học, tôi muốn nhấn vào từ bất kỳ trên transcript để tra nghĩa trong từ điển. | P1 | Hiển thị định nghĩa, phiên âm và câu ví dụ từ nguồn dữ liệu tích hợp. |
| **US-14** | Là một nhóm bạn, chúng tôi muốn tổ chức phòng thi đấu 3–5 người cùng lúc. | P1 | Trạng thái vòng đấu đồng bộ và hệ thống xếp hạng điểm số hoạt động chuẩn xác cho cả nhóm. |

## **6\. Luồng Người dùng Cốt lõi (Core User Flows)**

### **6.1 Luồng Luyện tập Shadowing Đơn (Solo Shadowing Flow)**

Trang chủ ![][image2] Chọn clip ![][image2] Chi tiết clip ![][image2] Nghe bản mẫu ![][image2] Shadowing / Ghi âm ![][image2] Nộp bài ![][image2] Máy chủ xử lý ![][image2] Hiển thị kết quả ![][image2] Luyện lại hoặc Hoàn thành ![][image2] Cập nhật XP/Coins.

### **6.2 Luồng Thi đấu Đối kháng (Battle Flow \- MVP)**

Menu Đấu trường ![][image2] Tạo phòng / Nhập mã vào phòng ![][image2] Phòng chờ ![][image2] Nhấn Sẵn sàng (Ready) ![][image2] Đếm ngược 3-2-1 ![][image2] Cùng nghe clip mẫu ![][image2] Mỗi người tự thu âm độc lập ![][image2] Gửi bài lên hệ thống ![][image2] Máy chủ gửi đi chấm điểm ![][image2] Cả hai có kết quả ![][image2] So sánh Battle Score ![][image2] Công bố Thắng/Thua/Hòa ![][image2] Trả thưởng.

**QUYẾT ĐỊNH THIẾT KẾ QUAN TRỌNG:**

Khái niệm "Live Battle" trong bản MVP chỉ **đồng bộ hóa trạng thái ván đấu theo thời gian thực**, hoàn toàn **không phải gọi thoại/video trực tiếp (WebRTC)**. Điều này giúp nhóm tránh gánh nặng kỹ thuật phức tạp của WebRTC trong dự án kéo dài 4 tuần.

## **7\. Yêu cầu Chức năng (Functional Requirements)**

| Mã số | Tính năng | Ưu tiên | Yêu cầu nghiệp vụ | Tiêu chí nghiệm thu |
| :---- | :---- | :---- | :---- | :---- |
| **FR-AUTH-01** | Đăng ký / Đăng nhập | P0 | Người dùng có thể tạo tài khoản và đăng nhập vào ứng dụng. | Tạo session/JWT an toàn; báo lỗi rõ ràng nếu sai thông tin đăng nhập. |
| **FR-AUTH-02** | Hồ sơ người dùng | P0 | Người dùng có thể đổi tên hiển thị và trang bị vật phẩm ngoại trang. | Dữ liệu lưu trữ ổn định, duy trì sau khi tải lại trang. |
| **FR-CONT-01** | Danh mục clip | P0 | Hệ thống hiển thị danh sách các clip được biên tập sẵn. | Mỗi clip gồm tiêu đề, chủ đề, độ khó, thời lượng và ảnh thu nhỏ (thumbnail). |
| **FR-CONT-02** | Phát clip | P0 | Hệ thống nhúng video từ YouTube. | Cho phép phát/tạm dừng/tua theo các API hỗ trợ của YouTube IFrame. |
| **FR-CONT-03** | Transcript chuẩn | P0 | Hệ thống hiển thị văn bản mẫu chuẩn xác của clip. | Dữ liệu gửi đi chấm điểm phải khớp 100% với transcript lưu trên hệ thống. |
| **FR-REC-01** | Quyền Microphone | P0 | Chỉ yêu cầu quyền truy cập mic khi người dùng nhấn bắt đầu ghi âm. | Nếu người dùng từ chối, cung cấp thông báo hướng dẫn mở lại quyền. |
| **FR-REC-02** | Ghi âm giọng nói | P0 | Người dùng ghi âm bài nói trong giới hạn thời lượng cho phép. | Bắt đầu / dừng / thu âm lại hoạt động mượt mà; xuất ra file audio hợp lệ. |
| **FR-REC-03** | Nộp bài ghi âm | P0 | Người dùng nộp file âm thanh cho clip tương ứng. | Máy chủ kiểm tra tính hợp lệ của clip ID, user ID và metadata file âm thanh. |
| **FR-AI-01** | Đánh giá giọng nói | P0 | Backend gửi audio \+ transcript chuẩn sang dịch vụ chấm điểm AI. | Dữ liệu trả về được chuẩn hóa thành các điểm thành phần trong thang 0–100. |
| **FR-AI-02** | Trả kết quả | P0 | Hiển thị điểm Độ chính xác, Lưu loát, Đầy đủ và Ngữ điệu (nếu hỗ trợ). | Không được tự ý bịa đặt hoặc làm giả điểm số đối với các tiêu chí thiếu dữ liệu. |
| **FR-AI-03** | Lỗi chi tiết (Miscues) | P0 | Hiển thị các lỗi sai ở cấp độ từ nếu nhà cung cấp trả về. | Chỉ rõ từ bị đọc thiếu (omission), đọc thừa (insertion), đọc sai (mispronunciation). |
| **FR-PROG-01** | Điểm XP | P0 | Hoàn thành bài tập hoặc trận đấu hợp lệ sẽ được cộng XP. | Tính toán tại backend; đảm bảo tính bất biến (idempotent), không trùng lặp. |
| **FR-PROG-02** | Điểm Coins | P0 | Người dùng nhận coins khi hoàn thành các mục tiêu hợp lệ. | Quản lý theo sổ cái giao dịch (ledger), tránh gian lận. |
| **FR-PROG-03** | Chuỗi ngày (Streak) | P0 | Hoàn thành ít nhất một lượt luyện tập hợp lệ trong ngày sẽ tăng streak thêm 1\. | Luyện nhiều lần trong cùng 1 ngày không được tăng thêm streak. |
| **FR-PROG-04** | Khôi phục Streak | P0 | Người dùng có thể trả coins để khôi phục streak bị đứt trong giới hạn quy định. | Máy chủ xác thực số dư, tính hợp lệ và tần suất khôi phục tối đa. |
| **FR-SHOP-01** | Cửa hàng ngoại trang | P0 | Người dùng xem và mua avatar, khung hình (frame), danh hiệu (title). | Trừ tiền chính xác; không bị trừ tiền hai lần cho vật phẩm đã sở hữu. |
| **FR-BAT-01** | Tạo phòng đấu | P0 | Người dùng tạo phòng kín với số lượng người chơi tùy chỉnh (mặc định 2). | Trả về một mã phòng ngẫu nhiên ngắn gọn và duy nhất. |
| **FR-BAT-02** | Tham gia phòng | P0 | Người dùng nhập mã để vào phòng chờ. | Máy chủ từ chối nếu mã sai, phòng đầy hoặc ván đấu đã kết thúc. |
| **FR-BAT-03** | Sẵn sàng / Đếm ngược | P0 | Các người chơi bấm Sẵn sàng trước khi ván đấu bắt đầu. | Máy chủ phát tín hiệu đồng bộ đếm ngược 3-2-1 khi đủ điều kiện. |
| **FR-BAT-04** | Đánh giá trận đấu | P0 | Tất cả người chơi trong phòng được chấm điểm dựa trên cùng 1 đoạn transcript. | Tuyệt đối không tin cậy bất kỳ điểm số nào do phía client gửi lên. |
| **FR-BAT-05** | Xác định kết quả | P0 | Máy chủ tính toán kết quả Thắng/Thua/Hòa dựa trên Battle Score. | Kết quả không thể bị can thiệp bởi dữ liệu client. |
| **FR-BAT-06** | Trả thưởng trận đấu | P0 | Tạo giao dịch cộng XP/Coins tương ứng sau ván đấu. | Luật cộng thưởng minh bạch, nhất quán và có tính tiền định. |
| **FR-QUEST-01** | Nhiệm vụ ngày | P1 | Hệ thống cung cấp danh sách cố định gồm 3 nhiệm vụ học tập mỗi ngày. | Tiến độ chỉ tăng khi phát sinh hành động học tập thực tế. |
| **FR-DICT-01** | Tra từ điển | P1 | Người dùng bấm vào từ trong transcript để xem nghĩa và cách phát âm. | Hiển thị thông tin phiên âm, từ loại, định nghĩa và ví dụ. |
| **FR-BAT-07** | Chế độ 3–5 người | P1 | Phòng đấu hỗ trợ nhiều hơn 2 người chơi cùng lúc. | Máy chủ theo dõi đầy đủ thành viên và xếp thứ hạng theo Battle Score. |

## **8\. Quy cách Đánh giá Giọng nói và Tính điểm (Scoring Spec)**

### **8.1 Các tiêu chí đánh giá thành phần**

| Tiêu chí | Định nghĩa trong sản phẩm | Vai trò |
| :---- | :---- | :---- |
| **Độ chính xác (Accuracy)** | Mức độ chuẩn xác của các âm/từ phát ra so với lời thoại gốc. | Thước đo phát âm cốt lõi. |
| **Độ lưu loát (Fluency)** | Tốc độ nói, sự liền mạch và nhịp thở so với đoạn mẫu. | Đánh giá chất lượng truyền tải lời nói. |
| **Độ đầy đủ (Completeness)** | Tỷ lệ số từ trong transcript mẫu được phát âm đầy đủ. | Ngăn chặn việc chỉ nói vài từ để ăn điểm chính xác cao. |
| **Ngữ điệu (Prosody)** | Trọng âm câu, giai điệu, ngữ điệu lên xuống tự nhiên. | Đánh giá mức độ tự nhiên tổng thể (phụ thuộc gói AI hỗ trợ). |

* **Nhà cung cấp dịch vụ:** Tích hợp bộ công cụ **Microsoft Azure Speech Pronunciation Assessment**. Dịch vụ này cung cấp sẵn các chỉ số Accuracy, Fluency, Completeness, Prosody cho bài đọc theo kịch bản sẵn (scripted), cùng danh sách lỗi chi tiết theo từng từ (Omission, Insertion, Mispronunciation). Chỉ số Prosody được tài liệu hỗ trợ chuẩn cho locale en-US.

**TUYỆT ĐỐI KHÔNG CHẤM ĐIỂM "ACCENT":**

Bản MVP không sử dụng điểm số chung chung gọi là "chất giọng bản xứ" (native accent score). Sản phẩm chỉ đánh giá các yếu tố đo lường được bám sát văn bản mẫu. Người học không bị trừ điểm chỉ vì không có giọng Anh hay giọng Mỹ chuẩn vùng miền.

### **8.2 Công thức tính Điểm Trận Đấu (Battle Score)**

![][image3]*Trọng số này được quy ước phục vụ tính chất trò chơi/thi đấu trong khuôn khổ cuộc thi và được cấu hình linh hoạt trong mã nguồn.*

| Đầu vào | Thang điểm | Quy tắc xử lý |
| :---- | :---- | :---- |
| **Accuracy** | 0–100 | Lấy từ kết quả chuẩn hóa của dịch vụ AI. |
| **Fluency** | 0–100 | Lấy từ kết quả chuẩn hóa của dịch vụ AI. |
| **Completeness** | 0–100 | Lấy từ kết quả chuẩn hóa của dịch vụ AI. |
| **Prosody** | 0–100 | Lấy điểm trả về từ hệ thống; nếu locale không hỗ trợ, phân bổ lại trọng số tự động. |
| **Battle Score** | 0–100 | Tổng điểm có trọng số, làm tròn đến số nguyên gần nhất. |

*Ví dụ:*

*![][image4]*, ![][image5], ![][image6], ![][image7]

### **![][image8]8.3 Quy định tính hợp lệ và xử lý sự cố chấm điểm**

1. Ván đấu chỉ dùng **duy nhất một transcript chuẩn**. Toàn bộ người chơi trong phòng đều được chấm dựa trên cùng một văn bản này.  
2. Máy chủ phải chủ động từ chối các file âm thanh rỗng, quá ngắn hoặc không đúng định dạng.  
3. Nếu dịch vụ AI gặp sự cố không thể chấm điểm, lượt thi được đánh dấu là assessment\_failed và không được nhận thưởng.  
4. Client có quyền hiển thị kết quả do backend gửi về, nhưng tuyệt đối không được tự ý gửi điểm Battle Score lên máy chủ.  
5. Cần hiển thị lưu ý về chất lượng âm thanh và khoảng cách micro trước lần thu âm đầu tiên.  
6. Mỗi lần nộp bài chỉ dành cho một người nói duy nhất (Single-speaker). Đấu nhóm là nhiều bài nộp độc lập, không dùng chung một luồng ghi âm.

## **9\. Hệ thống Cấp bậc và Phần thưởng (Progression & Rewards)**

| Cơ chế | Mục đích | Quy tắc áp dụng cho MVP |
| :---- | :---- | :---- |
| **XP** | Tăng cấp độ tài khoản | Hoàn thành bài shadowing hợp lệ: ![][image9]; Thắng trận: ![][image10]; Hòa: ![][image11]; Thua: ![][image12]. *(Có thể cấu hình lại)* |
| **Coins** | Tiền tệ mua sắm vật phẩm | Hoàn thành shadowing: ![][image13]; Thắng trận: ![][image14]; Hòa: ![][image13]; Nhiệm vụ hằng ngày: theo thiết lập. |
| **Streak** | Duy trì thói quen học tập | Tăng thêm 1 ngày khi người dùng hoàn thành ít nhất 1 bài shadowing đạt chuẩn trong ngày (tính theo ngày dương lịch). |
| **Streak Restore** | Cứu vãn chuỗi ngày lỡ quên | Tiêu tốn ![][image15], tối đa khôi phục 1 lần trong chu kỳ 7 ngày. |
| **Cosmetics** | Tùy biến thẩm mỹ cá nhân | Mua avatar, khung avatar, danh hiệu. Không có chỉ số tăng sức mạnh trong game. |
| **Daily Quests** | Hướng dẫn hành vi hằng ngày | 3 nhiệm vụ nhỏ mỗi ngày gắn liền với hoạt động học tập thực tế. |
| **Battle Rating** | Xếp hạng kỹ năng đấu | Tính năng P1 tùy chọn. Tách biệt với XP để phản ánh đúng trình độ thay vì chỉ tính theo độ cày cuốc. |

**QUY TẮC CHỐNG GIAN LẬN (ANTI-EXPLOIT RULE):**

Mọi phần thưởng đều phải sinh ra từ các bản ghi sự kiện ở backend (Ledger pattern). Các hành vi tải lại trang (F5), gửi lại gói tin (replay request) hoặc sửa mã nguồn client tuyệt đối không được làm tăng XP/Coins.

## **10\. Đặc tả Phòng Thi đấu (Battle Room Specification)**

### **10.1 Máy trạng thái ván đấu (State Machine)**

![][image16]

| Trạng thái | Nhiệm vụ của Server | Hành vi của Client |
| :---- | :---- | :---- |
| **WAITING** | Quản lý danh sách thành viên trong phòng, kiểm tra sĩ số. | Hiển thị danh sách người chơi và nút Sẵn sàng. |
| **READY** | Kiểm tra trạng thái sẵn sàng của toàn bộ người chơi. | Khóa nút Bắt đầu cho đến khi máy chủ xác nhận đủ điều kiện. |
| **COUNTDOWN** | Phát đồng bộ mốc thời gian bắt đầu ván đấu. | Chạy hiệu ứng đếm ngược 3–2–1 trên màn hình. |
| **RECORDING** | Ghi nhận thời điểm bắt đầu/kết thúc vòng thu âm. | Kích hoạt micro, người chơi nghe clip và thu âm bài nói. |
| **SUBMITTING** | Tiếp nhận file âm thanh từ các người chơi. | Hiển thị thanh tiến trình tải bài nộp lên. |
| **ASSESSING** | Gửi audio của từng người chơi đi chấm điểm độc lập. | Hiển thị màn hình chờ chấm điểm; không để lộ kết quả tạm thời. |
| **RESULT** | Lưu trữ điểm số chính thức và xác định người thắng. | Hiển thị bảng so sánh điểm chi tiết và phần thưởng nhận được. |
| **FINISHED** | Hủy phòng hoặc cho phép tái đấu ván mới. | Điều hướng quay lại trang chủ hoặc phòng đấu mới. |

### **10.2 Quy định thi đấu trong MVP**

1. Chế độ đấu mặc định của MVP là **phòng kín 1v1**. Chế độ 3–5 người thuộc nhóm P1.  
2. Cả hai người chơi nhận chung clip ID và văn bản transcript từ server.  
3. Người chơi thu âm độc lập, không dùng chung luồng audio.  
4. Trận đấu chỉ kết thúc khi tất cả người chơi đã nộp bài hoặc kích hoạt cơ chế quá thời gian (timeout).  
5. Người chiến thắng là người có **Battle Score dạng số nguyên cao hơn**. Điểm bằng nhau tính là Hòa (Draw).  
6. Nếu một người chơi mất kết nối, máy chủ sẽ kích hoạt quy trình timeout tiền định để xử lý ván đấu, không phụ thuộc vào quyết định của client.

## **11\. Mô hình Nội dung và Tích hợp YouTube**

### **11.1 Chiến lược nội dung**

Bản MVP sử dụng danh mục gồm **20–30 clip ngắn** được nhóm biên tập sẵn. Mỗi clip là một đoạn cắt từ một video nguồn, có transcript chuẩn đã được duyệt kỹ, gán chủ đề, độ khó và mã locale chấm điểm. Cách tiếp cận này loại bỏ rủi ro khi phải phân tích tự động các video ngẫu nhiên trên mạng.

| Thực thể dữ liệu | Các trường thông tin bắt buộc |
| :---- | :---- |
| **VideoSource** | youtubeVideoId, title, sourceUrl, thumbnailUrl, channelName, embeddableFlag |
| **Clip** | id, videoSourceId, startTimeSec, endTimeSec, referenceText, topic, difficulty, locale, durationSec |
| **VocabularyItem (P1)** | clipId, word, lemma, definition, pronunciation, example |

**RÀNG BUỘC PHÁP LÝ & BẢN QUYỀN NỘI DUNG:**

Hệ thống chỉ lưu trữ metadata và mốc thời gian (timestamp) để nhúng trực tiếp qua YouTube IFrame Player API. Tuyệt đối **không được tải về và lưu trữ lại file video của bên thứ ba** trên máy chủ của dự án.

## **12\. Mô hình Dữ liệu (Data Model)**

| Bảng dữ liệu | Các trường chính | Ghi chú |
| :---- | :---- | :---- |
| **users** | id, email, passwordHash/providerId, displayName, xp, coins, streak, lastPracticeDate, avatarId, frameId, titleId, createdAt | Mỗi tài khoản ứng với một bản ghi. |
| **videos** | id, youtubeVideoId, title, sourceUrl, channelName | Chỉ lưu trữ siêu dữ liệu nguồn. |
| **clips** | id, videoId, startTimeSec, endTimeSec, referenceText, topic, difficulty, locale | Cơ sở chuẩn để chấm điểm phát âm. |
| **attempts** | id, userId, clipId, accuracy, fluency, completeness, prosody, battleScore, status, createdAt | Lưu kết quả chấm điểm của từng lượt. |
| **rooms** | id, code, clipId, hostUserId, maxPlayers, status, createdAt, startedAt, finishedAt | Quản lý phiên phòng thi đấu kín. |
| **room\_participants** | roomId, userId, readyAt, submittedAt, battleScore, outcome | Khóa duy nhất: (roomId, userId). |
| **reward\_transactions** | id, userId, type, amount, referenceType, referenceId, createdAt | Sổ cái giao dịch bất biến (Immutable ledger). |
| **shop\_items** | id, type, name, assetUrl, price, active | Danh mục vật phẩm ngoại trang. |
| **user\_items** | userId, itemId, purchasedAt | Danh sách vật phẩm người dùng sở hữu. |
| **daily\_quests** | id, date, type, targetValue, rewardXp, rewardCoins | Danh mục nhiệm vụ theo từng ngày. |
| **quest\_progress** | questId, userId, currentValue, completedAt | Tiến độ nhiệm vụ của từng người dùng. |

**CHÍNH SÁCH LƯU TRỮ FILE ÂM THAMH (AUDIO RETENTION):**

Trong bản MVP, không lưu trữ vĩnh viễn các file ghi âm của người dùng. File âm thanh sau khi tải lên máy chủ sẽ được gửi sang dịch vụ AI để chấm điểm, lưu lại kết quả số liệu, sau đó **xóa file âm thanh tạm thời ngay lập tức** để tối ưu dung lượng và bảo mật quyền riêng tư.

## **13\. Đặc tả Giao diện Lập trình Ứng dụng (API Baseline)**

| Giao thức | Điểm cuối (Endpoint) | Mục đích | Xác thực |
| :---- | :---- | :---- | :---- |
| **POST** | /api/auth/register | Đăng ký tài khoản mới | Không |
| **POST** | /api/auth/login | Đăng nhập hệ thống | Không |
| **GET** | /api/me | Lấy thông tin cá nhân & tiến trình | Có |
| **GET** | /api/clips | Lấy danh sách clip được tuyển chọn | Có |
| **GET** | /api/clips/:id | Lấy chi tiết clip và transcript mẫu | Có |
| **POST** | /api/attempts | Nộp bài ghi âm để chấm điểm | Có |
| **GET** | /api/attempts/:id | Xem kết quả chi tiết của lượt làm bài | Có |
| **GET** | /api/progression | Lấy thông tin XP, Coins, Streak | Có |
| **GET** | /api/shop/items | Xem danh sách vật phẩm ngoại trang | Có |
| **POST** | /api/shop/purchase | Mua vật phẩm trong shop | Có |
| **POST** | /api/streak/restore | Khôi phục chuỗi ngày học | Có |
| **GET** | /api/quests/today | Lấy danh sách nhiệm vụ ngày hôm nay | Có |
| **POST** | /api/battles/rooms | Tạo phòng thi đấu mới | Có |
| **POST** | /api/battles/rooms/:code/join | Vào phòng thi đấu bằng mã | Có |
| **POST** | /api/battles/rooms/:code/ready | Cập nhật trạng thái Sẵn sàng | Có |
| **POST** | /api/battles/rooms/:code/submit | Nộp bài thu âm của trận đấu | Có |
| **GET** | /api/battles/rooms/:code | Lấy ảnh chụp trạng thái phòng | Có |
| **WS** | /ws/battles/:roomId | Kết nối WebSocket đồng bộ trạng thái phòng | Có |

## **14\. Kiến trúc Tham chiếu (Reference Architecture)**

Cấu trúc đề xuất cho nhóm 3 sinh viên chuyên sâu JavaScript/TypeScript:

* **Frontend:** React \+ Vite \+ Tailwind CSS.  
* **Backend:** Node.js \+ Express (hoặc Fastify).  
* **Cơ sở dữ liệu:** PostgreSQL (hoặc dịch vụ quản lý Supabase).  
* **Thời gian thực:** WebSocket (Socket.io hoặc thư viện ws).  
* **Dịch vụ AI:** Microsoft Azure Speech Pronunciation Assessment API.

\[Trình duyệt Người dùng\]   
      │ (Ghi âm qua MediaRecorder / YouTube IFrame API)  
      ▼  
\[Giao diện Frontend (React)\]  
      │ (REST API & WebSocket)  
      ▼  
\[Máy chủ Backend (Node.js/Express)\]  
      ├──────► \[Cơ sở dữ liệu (PostgreSQL / Supabase)\]  
      ├──────► \[Dịch vụ Chấm điểm Giọng nói (Azure Speech Service)\]  
      └──────► \[Quản lý Trạng thái Phòng đấu (WebSocket Server)\]

### **14.1 Ranh giới Bảo mật và Toàn vẹn Dữ liệu**

1. **Bảo mật khóa API:** Thông tin bí mật (API Key) của Azure Speech chỉ lưu trữ ở backend, tuyệt đối không lộ ra trình duyệt.  
2. **Kiểm soát phần thưởng:** Mọi biến động về XP, Coins và Streak đều được tính toán và kiểm tra tính hợp lệ độc quyền tại server.  
3. **Bảo vệ phòng đấu:** Trạng thái phòng, danh sách người chơi và kết quả chung cuộc đều do server phân quyền và quyết định.  
4. **Giới hạn đầu vào:** Giới hạn dung lượng và độ dài file âm thanh tải lên; xác thực và giới hạn tần suất gọi API (rate limit) đối với các thao tác tìm kiếm, tạo phòng.

## **15\. Yêu cầu Phi Chức năng (Non-Functional Requirements)**

| Mã số | Lĩnh vực | Mục tiêu trong MVP |
| :---- | :---- | :---- |
| **NFR-01** | Độ tương thích (Responsiveness) | Hoạt động tốt trên màn hình máy tính và thiết bị di động; các nút bấm có kích thước chạm ngón tay hợp lý. |
| **NFR-02** | Trải nghiệm chấm điểm (UX) | Hiển thị màn hình chờ xử lý sinh động kèm nút thử lại rõ ràng; không bao giờ để người dùng kẹt ở vòng quay vô tận. |
| **NFR-03** | Đồng bộ trận đấu | Trạng thái phòng do máy chủ làm chuẩn; có khả năng khôi phục trạng thái nếu người dùng tải lại trang trong ván đấu. |
| **NFR-04** | Hiệu năng hệ thống | Các thao tác API thông thường phản hồi tức thì; việc chấm điểm AI được xử lý bất đồng bộ để tránh treo ứng dụng. |
| **NFR-05** | Độ tin cậy dữ liệu | Mất mạng hoặc lỗi dịch vụ AI bất ngờ không được gây mất dữ liệu hoặc nhân bản phần thưởng. |
| **NFR-06** | Khả năng tiếp cận | Hỗ trợ điều hướng bàn phím cho các nút bấm chính; văn bản dễ đọc; trạng thái không chỉ phân biệt bằng màu sắc đơn thuần. |
| **NFR-07** | Quyền riêng tư | Giảm thiểu lưu trữ âm thanh thô; thông báo rõ cho người dùng việc âm thanh được gửi đến dịch vụ AI để đánh giá. |
| **NFR-08** | Khả năng giám sát | Ghi log máy chủ có mã định danh lỗi (request ID); không log file âm thanh thô hay mật khẩu người dùng. |
| **NFR-09** | Hỗ trợ trình duyệt | Hoạt động chuẩn xác trên Google Chrome, Microsoft Edge và kiểm thử cơ bản trên Safari/Firefox. |
| **NFR-10** | Khả năng bảo trì | Đóng gói bộ điều hợp (adapter) chấm điểm giọng nói thành module độc lập để có thể thay đổi nhà cung cấp mà không phải sửa logic ván đấu. |

## **16\. Kế hoạch Kiểm thử Chấp nhận (Acceptance Test Plan)**

| Mã kiểm thử | Tình huống kiểm thử | Mức ưu tiên | Kết quả kỳ vọng |
| :---- | :---- | :---- | :---- |
| **AT-01** | Đăng ký / Đăng nhập tài khoản mới | P0 | Tạo tài khoản thành công; duy trì phiên làm việc; từ chối khi nhập sai mật khẩu. |
| **AT-02** | Luồng luyện tập chuẩn (Happy path) | P0 | Chọn clip ![][image2] Nghe ![][image2] Thu âm ![][image2] Nộp ![][image2] Nhận điểm ![][image2] Cộng thưởng đúng 1 lần. |
| **AT-03** | Từ chối cấp quyền micro | P0 | Hiển thị hướng dẫn mở quyền; hệ thống không bị crash hay kẹt màn hình. |
| **AT-04** | Lỗi dịch vụ chấm điểm AI | P0 | Báo lỗi rõ ràng; cho phép thu âm lại; không cộng thưởng sai lệch. |
| **AT-05** | Luyện lại cùng một clip | P0 | Tạo bản ghi lượt làm bài mới; giữ nguyên kết quả cũ; cộng thưởng đúng quy định. |
| **AT-06** | Tạo và vào phòng 1v1 | P0 | Hai người dùng vào cùng mã phòng và thấy trạng thái đồng bộ tức thì. |
| **AT-07** | Xác định người thắng trận đấu | P0 | Server tính điểm từ kết quả AI; client không can thiệp được kết quả. |
| **AT-08** | Đối thủ mất kết nối | P0 | Kích hoạt cơ chế timeout định sẵn; kết thúc trận an toàn và không treo phòng. |
| **AT-09** | Thử nghiệm gian lận phần thưởng | P0 | Gửi request nhận thưởng liên tục không làm tăng thêm XP/Coins nhờ cơ chế kiểm tra trùng lặp (idempotency). |
| **AT-10** | Tích lũy chuỗi ngày (Streak) | P0 | Hoàn thành bài tập trong ngày chỉ tăng đúng 1 ngày streak dù làm nhiều lần. |
| **AT-11** | Mua đồ trong cửa hàng | P0 | Đủ tiền mua thành công; thiếu tiền báo lỗi giao dịch nguyên tử. |
| **AT-12** | Nhiệm vụ ngày | P1 | Tiến độ nhiệm vụ cập nhật chính xác sau khi hoàn thành hành động tương ứng. |
| **AT-13** | Tra từ điển trên transcript | P1 | Nhấn vào từ hiển thị đúng định nghĩa hoặc thông báo không tìm thấy từ. |
| **AT-14** | Trận đấu 3–5 người | P1 | Tất cả thành viên nộp bài độc lập và server xếp hạng đầy đủ từ cao xuống thấp. |

## **17\. Kế hoạch Triển khai 4 Tuần (Four-Week Plan)**

| Tuần | Mục tiêu chính | Nội dung công việc | Tiêu chí hoàn thành (Exit Criterion) |
| :---- | :---- | :---- | :---- |
| **Tuần 1** | Kiểm chứng kỹ thuật (PoC) | Thiết lập dự án, tạo Auth, cấu hình DB, nhập 3–5 clip mẫu, nhúng YouTube, tích hợp MediaRecorder và API Azure Speech. | Một bản ghi âm thực tế gửi đến dịch vụ AI và trả về kết quả điểm số chuẩn hóa thành công. |
| **Tuần 2** | Hoàn thiện luồng học cá nhân | Danh mục clip, hiển thị transcript, màn hình kết quả, tính năng luyện lại, XP/Coins, Streak, Cửa hàng cơ bản. | Một người dùng có thể hoàn thành trọn vẹn một bài luyện tập và thấy thông tin tiến trình được lưu trữ bền vững. |
| **Tuần 3** | Xây dựng đấu trường 1v1 | Tạo/vào phòng, đồng bộ WebSocket, đếm ngược, quy trình thi đấu 1v1, gửi bài thi, so điểm và phát thưởng. | Hai người dùng thực tế có thể hoàn thành một trận đấu từ lúc tạo phòng đến khi nhận thưởng mà không cần chỉnh sửa database thủ công. |
| **Tuần 4** | Tối ưu hóa & Hoàn thiện | Triển khai P1 nếu P0 đã ổn định, làm mượt giao diện, kiểm thử giao diện di động, nạp dữ liệu demo, đóng gói sản phẩm. | Không còn lỗi P0 nghiêm trọng nào; buổi demo chung kết có thể thực hiện lặp lại mượt mà từ tài khoản trắng. |

## **18\. Phân bổ Nhân sự Đề xuất (Team Allocation)**

| Thành viên | Trách nhiệm chính | Trách nhiệm bổ trợ |
| :---- | :---- | :---- |
| **Thành viên A (Frontend / UX)** | Điều hướng, giao diện duyệt clip, giao diện bộ ghi âm, màn hình kết quả, cửa hàng & hồ sơ cá nhân. | Kiểm thử hiển thị trên di động & khả năng tiếp cận (Accessibility). |
| **Thành viên B (Backend / Data)** | Hệ thống REST API, xác thực người dùng, thiết kế PostgreSQL, sổ cái phần thưởng, chuẩn bị dữ liệu clip mẫu. | Triển khai hệ thống (Deployment) & ghi log giám sát. |
| **Thành viên C (AI / Realtime)** | Bộ kết nối (adapter) Azure Speech, chuẩn hóa điểm số, quản lý trạng thái phòng đấu qua WebSocket. | Viết kiểm thử tích hợp (Integration Tests) & gỡ lỗi hiệu năng. |

**QUY TẮC PHỐI HỢP NHÓM:**

Cả ba thành viên đều phải có khả năng chạy toàn bộ dự án tại môi trường máy nội bộ (Localhost). Bộ kết nối AI và máy trạng thái phòng đấu cần được ghi chú rõ ràng để tránh trường hợp dự án bị tắc nghẽn khi một người vắng mặt.

## **19\. Rủi ro Chính và Giải pháp Giảm thiểu (Risks & Mitigations)**

| Rủi ro tiềm ẩn | Mức độ | Phương án phòng ngừa & khắc phục |
| :---- | :---- | :---- |
| **Dịch vụ AI trả kết quả không ổn định** | Trung bình / Cao | Hoàn thành tích hợp ngay từ Tuần 1; chuẩn hóa cấu hình thu âm (audio format); chỉ dùng duy nhất locale en-US; thử nghiệm trên nhiều micro khác nhau. |
| **Chấm điểm "Accent" gây tranh cãi** | Cao / Cao | Tuyệt đối không dùng chữ "Accent". Dùng 4 tiêu chí rõ ràng (Độ chính xác, Lưu loát, Đầy đủ, Ngữ điệu) với chú thích minh bạch. |
| **Video YouTube bị chặn nhúng hoặc gỡ** | Trung bình / Cao | Chỉ chọn các video cho phép nhúng (embeddable); kiểm tra kỹ quyền tác giả và trạng thái video trước khi nhập vào hệ thống. |
| **Đấu thời gian thực quá phức tạp** | Cao / Cao | Không làm WebRTC gọi thoại/video trong MVP. Chỉ dùng WebSocket đồng bộ trạng thái phòng và gửi nhận file ghi âm riêng lẻ. |
| **Chatbot AI làm phình to phạm vi dự án** | Cao / Trung bình | Đưa Chatbot về mức P2. Nghiêm cấm phát triển Chatbot nếu các chức năng cốt lõi P0 chưa xong. |
| **Lỗi nhân bản phần thưởng / Gian lận** | Trung bình / Cao | Dùng cấu trúc sổ cái bất biến (Ledger), kiểm tra mã yêu cầu (idempotency key) và mọi phép tính đều chạy ở server. |
| **Nhóm sa đà vào làm đẹp giao diện quá sớm** | Trung bình / Cao | Quy định rõ điều kiện kết thúc Tuần 1: phải chạy được chức năng chấm điểm phát âm thực tế trước khi tập trung làm đẹp UI. |

## **20\. Các Quyết định Kỹ thuật Cần Chốt Trước Khi Lập Trình**

| Vấn đề cần quyết định | Giá trị đề xuất cho MVP | Lý do lựa chọn |
| :---- | :---- | :---- |
| **Ngôn ngữ đánh giá giọng nói** | en-US | Đồng nhất một cấu hình duy nhất và hỗ trợ đầy đủ tính năng chấm Ngữ điệu (Prosody). |
| **Thời lượng một đoạn clip** | 8 – 20 giây | Đủ ngắn để người học dễ luyện lặp lại nhiều lần và phù hợp cho nhịp độ trận đấu đối kháng. |
| **Số lượng nội dung ban đầu** | 20 – 30 clip | Đủ phong phú cho buổi thuyết trình và chấm thi mà không tốn công sức xây dựng hệ thống CMS lớn. |
| **Chế độ thi đấu mặc định** | Phòng riêng 1v1 | Vòng lặp đối kháng nhỏ nhất và hoàn thiện nhất; dễ kiểm soát trạng thái mạng. |
| **Điều kiện bắt đầu trận đấu** | Tất cả người chơi bấm Sẵn sàng | Máy trạng thái đơn giản, chắc chắn, không phụ thuộc vào các điều kiện rườm rà. |
| **Thời gian nộp bài tối đa (Timeout)** | 60 – 90 giây | Ngăn chặn việc một người chơi bỏ dở làm phòng bị treo vô thời hạn. |
| **Lưu trữ file âm thanh** | Xóa file thô sau khi chấm xong | Giảm thiểu chi phí lưu trữ server và bảo vệ tối đa quyền riêng tư của thí sinh. |
| **Thuộc tính vật phẩm trong shop** | Chỉ mang tính thẩm mỹ (Cosmetic-only) | Tránh hiện tượng "Pay-to-win" và không làm phức tạp hóa logic tính điểm trong game. |
| **Tích hợp Chatbot AI** | Hoãn lại (P2) | Không bổ trợ trực tiếp cho vòng lặp Shadowing thi đấu, gây lãng phí tài nguyên phát triển trong 4 tuần. |

## **21\. Tài liệu Kỹ thuật Tham chiếu (Technical References)**

* **\[R1\] Microsoft Learn** — *How to use pronunciation assessment in the Microsoft Foundry portal*: Hướng dẫn chi tiết về các chỉ số đánh giá phát âm theo kịch bản (Scripted Assessment) bao gồm Accuracy, Fluency, Completeness, Prosody và phát hiện lỗi chi tiết cấp độ từ.  
  https://learn.microsoft.com/en-ca/azure/ai-services/speech-service/pronunciation-assessment-tool  
* **\[R2\] Microsoft Learn** — *Characteristics and limitations of Pronunciation Assessment*: Giới hạn kỹ thuật của hệ thống chấm điểm, yêu cầu chất lượng micro, khoảng cách thu âm và lưu ý không hỗ trợ chấm đồng thời nhiều người nói trong 1 file âm thanh.  
  https://learn.microsoft.com/vi-vn/azure/foundry/responsible-ai/speech-service/pronunciation-assessment/characteristics-and-limitations-pronunciation-assessment  
* **\[R3\] Google for Developers** — *YouTube IFrame Player API Reference*: Tài liệu nhúng trình phát YouTube và điều khiển luồng phát/dừng qua JavaScript.  
  https://developers.google.com/youtube/iframe\_api\_reference  
* **\[R4\] MDN Web Docs** — *MediaStream Recording API (MediaRecorder)*: Đặc tả chuẩn của trình duyệt phục vụ ghi âm luồng media từ microphone.  
  https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder

## **22\. Tiêu chuẩn Hoàn thành của Bản MVP (Definition of Done)**

1. Một người dùng mới có thể đăng ký, đăng nhập, chọn một clip trong danh mục, nghe bản mẫu, ghi âm bài shadowing và nhận được kết quả điểm số.  
2. Màn hình kết quả phân tách rõ ràng 4 chỉ số: Accuracy, Fluency, Completeness, Prosody; tuyệt đối không hiển thị điểm "Accent" chung chung.  
3. Người dùng có thể tạo phòng đấu 1v1 riêng tư, người khác có thể nhập mã tham gia và cả hai hoàn thành cùng một thử thách.  
4. Kết quả trận đấu do máy chủ tính toán độc lập từ số liệu chấm điểm chuẩn hóa.  
5. XP, Coins, Streak và các vật phẩm đã mua được lưu trữ bền vững qua các phiên đăng nhập, không thể nhân bản bằng cách spam request.  
6. Hệ thống xử lý mượt mà và thông báo rõ ràng cho các trường hợp: từ chối quyền microphone, lỗi tải file và lỗi từ chối dịch vụ của AI.  
7. Ứng dụng đã được kiểm thử thực tế trên ít nhất 2 tài khoản người dùng khác nhau và 2 loại micro/thiết bị khác nhau.  
8. Buổi trình diễn sản phẩm (Demo) có thể thực hiện lặp lại trơn tru mà không cần can thiệp chỉnh sửa cơ sở dữ liệu thủ công giữa các lượt chạy.

## **Phụ lục A. Bảng Thuật ngữ (Glossary)**

| Thuật ngữ | Định nghĩa |
| :---- | :---- |
| **Shadowing** | Kỹ thuật luyện nói tiếng Anh bằng cách nghe một đoạn âm thanh mẫu và nhại lại gần như đồng thời hoặc ngay sau người nói mẫu. |
| **Reference Text** | Văn bản kịch bản mẫu chuẩn xác dùng làm căn cứ để dịch vụ AI so sánh và chấm điểm phát âm. |
| **Attempt** | Một lượt nộp bài ghi âm hợp lệ của một người dùng cho một đoạn clip cụ thể. |
| **Battle Score** | Điểm số trong ván đấu của sản phẩm, được tính toán từ các tiêu chí chấm điểm phát âm theo công thức có trọng số định sẵn. |
| **XP** | Điểm kinh nghiệm tích lũy để thăng cấp hồ sơ người dùng, không thể dùng để mua sắm. |
| **Coins** | Đơn vị tiền tệ ảo nhận được qua việc học, dùng để mua vật phẩm ngoại trang hoặc khôi phục streak. |
| **Streak** | Số ngày dương lịch liên tiếp mà người dùng duy trì ít nhất một hoạt động học tập hợp lệ trên ứng dụng. |
| **P0 / P1 / P2** | Các cấp độ ưu tiên tính năng: P0 (Bắt buộc phải có), P1 (Nên có nếu kịp), P2 (Định hướng tương lai ngoài MVP). |

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAWCAYAAADNX8xBAAAAqUlEQVR4XmNgGAWjgHigrKwsKy8v362goMCBLkcSUFJS4gcatBmINdHlSAZycnLlIIwuTjIAek8M6KL9ioqKZigSoqKiPEAJSTJwMBAnycjIcIINAgZcBdCpj0jFQEOeAfEroP54FJeRAsTFxbmBBiyEu4ZMwAJ0yVSgq8rQJUgBLCCXALEHugRJAOgVaaBrNktJSYmgy5EEjI2NWYGGCQGZjOhyowA/AAACsiwBKu2c7wAAAABJRU5ErkJggg==>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAA0CAYAAAA312SWAAAS00lEQVR4Xu2de6hldRXHz6CB0Usr09HxrH2vUzJQZEwlYlFUQqL1h0YvDaIoexhRolF/lBFiDwIxS5sssTDNhlTMByp0KrFJQyqcJkzBkTQamURR8TVO67t/a+27zjp7n3vOvWfuzK3vB36c/Vu/3/691/o99t739nqEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYT8DyMia/36qKOOekkMW03Mz8+/TOtydZavFtatW/dyuCxfbRx++OHrtB9uzfJZo3l8X91ZWU5mi/XniVk+S1a77gLYUW2rVwTRfuGaBLStzlB3eZbPGtgI/VmT5WT2wEbAVmT5qkAn3hdqBU6oqupm/d3e7/ffZ+6T6t896cSMeBs3bnxBlmu6B/i15XOZ/g5ClEXR+Keo+7hdv0PdvUgnx1slrNHyb4kGU/0XaH1+Ye5bMXIXes/z0a/3fQDtqu7Hev27GDZrdGzcpPls1sv9c9hqROuyLctmBcau6sb6IEL/77R+ukddFcIaoEsa5yxt6wf0d7dGe5uHqew9KntQ3SbTp0fjvctkf03zg1WxB7vcHqC86naou0Drc7j+bkW58s17Gy3raXNzc5LlM2LJuot46h5R97jGuyOGrZDuouzPiNlRoNc/sPHVbIT3JJrPBnUPTThu1rTNJ3sD9Le209lZPisk2YhDDjnkRSp7DGNKf3dijo7xI2gjLds7MX6iXGVfUtm96japexC2JoYvB5QHNgL9qG5HsBHb1Z21N/pN8z0V5UG9c1gbGveqvVHOmWEdPGiRPR1lXWi82zT+xijTTj0Ak0uUIU7OZxwa/12SFie9MqmsygWb1uVCnVAOCf5j1Z0b/DDsx7q/DQ3/JQan+23Xf6f70WbaPue4f9Zo2n9F/urOyGGrEdTjiCOOeG2Wt6Fte83BBx/84izvQtN+JPm3aBoHBX8e2zUq/7e6n5gXk+1uXyhAp9T/PXXf1r44Jtw2M0z3t2e55ndzCJ9k4l1xcpt3gXacxo7IEnUX+qjuPEzE5seG52rYx5XQXU3zeM1jl47xt+YwzesOWaEFG0B7TzJuDjvssFfm+WRvImVTt+gJGGzDtOXO41XSnJv9DvKyBRvswSCGmX5iM/H13gTlXgrox5yvyXZG2UqBvFHvLG8Di07oYZavGqyDB1EmtmqNsi403n/yQMUkiMEUZYiT8xmHDcbdeTU8jaHdl9C63J/8MPKnul/rdbqESaANbZOLY7/AyEs58aqRspNtJoFI16NkTB5Z1gaMRFVOBKAcq3fAB9Bek06S/SkWbIinaV8fZVIWaM3JpPp39sMCLsh3xz629n4LrqETE5YBhnrEWEOXfPHQhdmDtgVbfQJk4RPZhpUGbZplbaAdp7EjskTdVdkXrf9qW6jXX1H3L/XPr4TuSjm9Q1+NnIhbP+5zCzaN927MFVm+t7C+nsvyzLQLtg4bMdQ+2Z/BuEIfJ9lEC5feMmwEypXzNdnY8u4pkO8U9Ub81oXwqsAUdxBE2NXvkrBj1Osb1f1IytFn8xhJylF73VHeWfr7eJYBDGYJ+ahivk39d6vbjmuXO/bI9jpLZ3Pc4Rr7SXnU8Hd1v1f3GQ/Q6xukPMppjpWRD9LScpynv/eruxHyUA7Ev9fTmDWa9mPJj8fQzaLWlG9rjBMRU27UwWUwgnHi0bC10nFyY+/5/L4XlFT9d2HiCNE6qcrCBmPjn7EMAe8PtONTYv2h91V6/bTmc43+PmrlqPtCbDzYda10Nk7wKPCb+nu5ul32mPDDUk4YcdT/TDIqI3mru0DTesDcRTp+Xo9rlf8h3Ie8/xX9XaD8Ey6WkCY2PCckWTbG6P+Rttd6HxDzwX3qNuAaY8QeS6INvt1rMbiOhl9lfVaDdlf/R3tj7gFmD+oFm01CeePVLNjEFgRiE79d53ri8UytW6ZrGKPo38t0Y/cm65NneqFcKvuELOj1UwgLffmApbsV19EuIE2Vzbu/C9Qp6s1iyDJ0F/3p11Im/604RUL+sQzWLjPVXbRzV5rIz8cZXmtR/0Moj/5e4a/D2P1PaD7HWT9hXsDC8jfmf950E2Wvdboqi1fYiF16fb7nZ2nHjQja4kl1v8a1yUbmEzA/P/8aS/9uTecDvWKH6rGnZX2d/t6ibkcVHk1buZA+bMavNOxQy+PP6j6r7qfq7jPZZq3P2fp7rrrnPA3QL/ZoZDGemXbBJslGiOlFirMbYyXKIjbuBklWL8TVbTryyCOPiGEZSY8HJ7URKFfM19oafX+ztdeI/e6VPjsB98FpvJNCenX76z33SGh/sXm8anntQOXb1N2GMOSHesMWYFza2HwI8YK/HmN2L+zbyCZmVWAd/AcpnbxWFeDV+rsrvpyn/odduU0h68rbLgEKnR+JwnBmQ98s2KQskJrjYDR4EzGBjkS4O08XZcRjBbs+Ud0VVp5BfMxl951p10+o22DHyZ/QAf2qVI5Tq5YTFxiF/sI7fq1unGJZuYZ2z9Ju9EdONoCW6Rh/LIb6BHmb0e9sS6D5/FZ/9oNy5LBxVPb+jbbte61NmwU9kOH+wKIdhh+L7ljeazX/4y0O+mLgYYjXt12StYVPbF/ulQn7Im8vyCWcprTlbdd4cfhC3G/+6/weJ5ZvHP0pFmw2/ocWDjkfSf3fhoafJuHjCCxw5hbe04IBHFt2eyfmErwnU5WJblHQB9YX9UIql9HD3Y96SDipSWF3uy5KOLXvF1vwSAjDydMXLQyP8baYHHr9uLc77pfSn2jjd+d3fFR2ei5vG4gT9WYcy9XdQN1fPkEi/1gG2QO6a+31RJYn9pewqEO7mr+e0GKb28KxiWtj4RL3Iy8/DYS90rTuUPcp+FFXrx9klqbr5Z3q5tx+Y3x4mmZDmjz1+llZ0O/tKG8I8/FVPwoOm/XNUjaNG9V9PsS/FXlW9rjfZE19gNmaQZS1Me2CDe3RDzZCWvoffsijLGLjbhBl6j852MKr0Q4xPKPhP0Odp7ERVi685wobgfdbH1y/fv1LPdzKNWS/pawTmiczuFbZG7raH/VK8zhs+Zkop/4+FDdqKA/GIq59vPi4EBu7EZVdL2PadZ/GlG4QZWgMNELPlBaGvyrvL/1Df3+HwQb5MhZsu9U9LOWkoHZVOt6HP0+QKjtG4z5r+Y4YN7FHEPE+KbusenJHWWOY1X2oHLIHvuqz91UGUSYTGn2VfcMGvfuXtWADYjvjLO/CxgMefUNB692zhBOFrv7oqhOQRRZssV4GFm2XohwYg7gfwq68jXqSlKLsG6KSO133al6fQ33dabzn1P0z+Ldqeq/P94Gq7PqGDELORxZZsMEwafjFWR7RNJ7EIi7LI6YzN2R5F6YTTZ/lMlr4pAs29OmlkvS8b7bAdRFpwtk9mLBbH29o2IWePuKl4LqsubxA437X+8367j9SFqONrF8WQyMsR3cjGv5wL3yVuRK6i/S60oQumF7j1KMpuy3KMM7r0zvc73W1Mg6NjVSHbF+bdkE8LwtkVfm4JY6Lo9sWbJbG0ynuNz0dlMnjhvQHuI73wFnYMxaGetWnPFIOEGqZuu94esDLFGUAup/GFOwiXsSPY+pz+T4n2whcI/8Yx8rTubCwthlkuaNhJyONxb6MnNZGWLk6x3seF7ZxHHpsKWWTdj3sgbS0P67jWIKdU9nOOI6clrRx+lYfxEjLgs3S6GzXfRpUVFKnq+wga4SD7BQq7qrqztDf4+KCDc4b2MIxmOpTO7svLtielzEdDroGo5Wl9XShbx8q5NW32OICZU0GBfHHlgNIedEb6XQ6pJXvc6yd6uN3R/2XaDudHvxYbDbHto61v59+YneB/NbqvQdKMbbNexAwItLxaMZAu9WnBVrei/IJRReSBn1Y0K8xUVd/oM+HHic5MuWCDeHedz7uYGhsghnJ2+mXnRx2XK1f4Y27N9Kf8oQtL+aQD4xT8D/WdSqr8Q6tyqOJoZ070lD3MY8Hf84ngjGphu6NermmCrvYcaAPZIxOWPikCzbo+YhhdFvQtmDrlwXe0CmHg/GK/kTbtH0sYmUbehTdRtv46mI5ugtUvkHz+2PwD9AmKKfsYd2tykkWHhuuz2FiHw6hfBJ01PqmfhJh4ctZsDVzC+IhLYt3vfd3JC7Y4MyP8rWeEqIsKFPwe/p43Dqi19oOrws6iPbchcUEHrl6HJXdF/XS6rzonwCKejoJXTZinD+D9kd7BX+tm5r22+EXO8CI82FGw/82rY1AmjLeRozol93T6LWNhwti+0vp67r9Jc3jVle8BuH2J74PPLRgg21Q2SOwE216omGDcW2yTxOVyqns5XILhwI3naPXZ6Cx+zaBydIWbAN0iKdZlePLob8JZPcPHefacef9uEZYbHT1b/Zj+Kg4qEdljzlR1mhQrPxD73jIwhd6M0XSu1Kos6QvzawdfEdyy0LsgpW3UWLUX9KXZtKyozBgoM7w3RZ26einxV4wBRrvr1mGcqT2b/rD+mmz/WYj9DP7jQs2PJZZdMHm11ZvLNh8nI3k7XGrhc/Qf+6yiHQsKDM+3rO8DdSjbx8KOJrPtv7oV6L1nzDQ6zO1nEdDbic69ZE9HL7ww6/d86A/7jA/JuMRgwQ07MTYb1L0tn6PZxwou4x5r8/CJ12wDXxMA7vez21Bx4INj7O2+T3Wn8e63/oT77mMvIOi8nPzJNhG2/gaR24P1AN5hfBO3ZXyHh4e7db9qfFuRr1XQndtbG3StK/MYWKLEH//yOXWvs2EiGu0l10vumCb5JGo/p6s997kYxe/2h5vbluw9cw2eB72Qds1lk7r2LPx9USwT2i/75l8LsTfjjxQZ5ehnP2gp3o9Lx0biMi0CzaM9/6ojchzUe23PtpSmY1w0P5oL/dL2QTs8BNYWVi4+sZ6CCk2oklTJrQRSBNtl+VOHhdAyinpIPi3qDu2q/0xdmJ7qv8cOF+MpblnaMHWK2PmCnXPBlmDyu9cTHf2OcSUzxo/u9t6oZPReOquVfkt2KUgjq3Kkc7tUo6Z6/dOgE062F3XhldCPt6RdjKCR2u3qXuH3+tYp+PT821VOT4eIH54HIAXzfH8HHnftS783TgpH0kg/mNuFGIZJOzYQjnwUvRE74YsBWn5MkVlt2s9PwknYRcnpW+G/saWGRsvf9OO+vst9Z9bFUO7I94T0bBNcbI30Ib1TrsN5BHyHEBmRmKkHL2F/rhV41zp/eHvvUj50OP+no0rKcblUSkTCj4EqdPTcfWFmL4sLFbOkoUX2M9U97Ded5GNh9a8HSh6S90xUeAF/q5Jcoj+FAs2TXNO0omLGd0n0U+mS/WYt0nqispObKzOQ87TML3Ci9fol0e7Hoei/nML77o1aB1OSoatwTcD0UWDCXLfQ6ZlOVqKbqFf8D6M31vno9dXiemWlL+lWD/6ifGi39L8kJheoz9jGSzNxtZEJIyvcaAeYdwuiixRd3Pd4GL7V3tQdyOa5/stf/QRHg/+PYZr/oeq7EmN90e9/qHrTyp37PuBlI+APMz7GpuwH0jJB4+c679hltqhtr3Wx9BZ2P8feVnMXgzNJ3g/SsorCVjMfaRXFmAog6cZr11fEGebuj+puwF17Bcbij+rUh846O+nXf/MD7263PMFKHvbaW5m2gWbtNgIq/u9NqagM/Xiycr4VGU2IvVF7dw2WRrYJOBji9v1nipk0bAUGyFJd+FyHGvjGMcX1OiPU6T82SK4+iQ8tr+UOaJpf1mYx+/W8K+5vFfGfj13YLxaPs3GAkBfqpb30YEs8l4fITBQn5pE8clsUKVci6N17MT6HX+GRONc2DIRtqL9d361yJ9RiEj5upHMCEwk+LWTqeaUJIAJoXUhl8Gppab31Szvgro7GZKeYPwvIBP+qRjYhvhodRJoI2YO3nN+Jy6qcuI9cgoP+9G1kCNkCFXQ+6o99AdPyTBQSm3vj+vvtW2LMn9clOWzArvXasKvrsjiYFcs5ZHNtTkMqKG+dNKX8ZcCdbcbbZcDq/JnHHar+2UOX62gv1WP35zls4I2YrbYE4h/SDnpb/14UMa/J0rIAlKOhP+S5WT22LtPm+Ln5gHsxM5uW8jNEjXG9+xJg///hD0m+kpXf8oUX7ktBepuN6ZrJ/TtTxzl8NUIFlPKXVk+a2AjsowsHSl/S++UXsv/ybUFXf0nvgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhBBCCCGEEEIIIYQQQgghhOwz/Be+f0Utd7fmRAAAAABJRU5ErkJggg==>

[image4]: <data:image/png;base64,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>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHcAAAAZCAYAAAALx7GgAAAFBklEQVR4Xu2YS4hcRRSGu5kIEZ8xjuM8q3tmcAi+bRQSs5IsIhgRoyFx404RIoKCgigYJGhwqYgEJbjQLBQVohhwMBMVE3XhJkFw5YQE0aCSkCzGmBm/v++pTnX1vd3tZGgTqB9+6tapU3XPPadOPW6plJCQkJCQkNATVCqV25xzOzsRvVfh1RMTE9dR/xr+CWf6+/svj8dM6B74cBCuVkm1L24X5OPR0dGbRMUgbi/EyMjI8NjY2EMMPgcX4LcMsFkykedtCiL8A65C/1LKe003Bfc8QLDuNN8qgX6Ev+Hz+0KdgYGBy5D/hfwI5Sn5fXx8/IZQpyPoNKuODPJc3CYg3ws3+Dq6p1NwF40yvtyF/96M5MuQfahSFXTWyc8KsFew5FqAH5N4yxs926FTcGl7PmxLwV085DP5TgGK2wjYuz6YtD9tMWkklckV3F+Rj4fyQuQFl+ca/ETG8NL1tL8Y6OcGV3tCLAN9Q0ND10ayui5jDFar1YFarXZJ3D48PLySoqxnzdIOM7VPY4kd9C4E1DNU/p6cnLzSC/W92P69r1vm/g1v9zLBgnsSv90ayguRF1z2hPuR7csJVktw7YV1+jHUHshPh/21b9g734GH4AnE5WBWq88My9DNlF/YnjPPx++IJkLZZWeAWc16yk/hWenR50n1C6nxNZnQOWBjHu7aSUsI8+1ZfTe2bsGWFTy/Bz8P9Qp8L98czkuYXMg51umUffTvVm/JTtNvyVwFVX3CCRIEqx5c2zP2wHmvI9BnLbLdJdtvXJaFCuZ6r0P9QbPpbetzI8/H4VFYlUyB4vkY/Mb3s1VnHv29XmYnz698vQhjdrDsll07HChrZZd9k+cLsV4ATeSX4c68la4QrjVztek/5ZY4uOb8ky47fdeXUeMd8Af6rrDxJTvKUjUSjL9B4ytDrV5/H/ys3VLMKnEVOgfhnJeh/5IYqPUUlewK+ovsVubyfMK+ZaFkEzwGbRvhGSVI3NYWrjW4TXtuqCu4RQbXB8hlV6/cu7SNr+DKJt3//PhNwVUZ1tsBva3S5bGs7GKs/creWK8XsH8Fh7Bhl5dpEiP7yHyzOtQXkK2Bx+nzbNzWEebIpsAwQ66hfncpZya5RQbXnbsjz3qdPLilD27V2fKN/mbK90s539UL2Pvn+J61UVMfsldofzwUstrdJdtpe7iUHTCXKS6KT6hXCHNk4VUohusyuFNTU1e47I+WD+4qly3JTQesGK6L4Pr3wenwLlgA7VdvaOZT7qkEe3k72Phdk/HXxWPEMLubtpygrRYHF9l34bgu840SpuGbtnDZIUQGfpC3DEeQo87AA3ZdqUMOc9kBYbvq2vQx6i2TzftDADORav2EvMb3tT8xG30dnVtkE+WUlzHWY97Giu2xlE+47HTcOBzZTN/n6x7BD4CtcVsvYWeAaWz+OZQrE5F/meMn2dzEblarcA/sqrM7l1EtujKK5x0uO+LrSnKQ+hY53nQbmWgnxX9cNqlmsOMI4vgq5Kn6I5FM+6egiXYP/EkzXLp6H6xYexP0Hmcn6/8TmHc9dkzD3fAZl12DdNB8zesEK1MLw9Wxp8Dw5RgwaDOwrOxWvUivWvAT4z9CQdYPjLY/1tF5vZTtWxcCytj7AHxUSSY/xAoJBdDqYE5zqtuy3HISTbgIUclOpdqPtxHkTXB/rJNw8UL/m3Xx1z16e97pNCEhISEhISHhfPEvyNYP6g9XwjoAAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,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>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHkAAAAZCAYAAAAVDoETAAAFW0lEQVR4Xu1YXYhVVRQ+lzFQtDJznJyfs++9MzpYkdqUUFC+aCipDyokjA/CUGoOCBkKElRELz1IjOFDjEQP0oOhhQmFkYKCoA/agw1IAymiqOBQaKA1jt93z9pz111z7p25Sd07sT9YnL3XWnuftffaa+11ThQFBAQEBAQE1AXiOF4GupxC3zjnPgf15XK51+y4ekU2m91C+2H3MJ6rrbye0NjYOAN2vtvS0tJqZWnA2mZC//nW1tZ5aE+18rLAgBZsxnoMvgoaAf3EPgkTbRBH30N7qR1bj4CtC2D7W1xLvTuZzoWdV2Tfb9hAA2+P14WfZsEHF8Hbj+e3eP4J3jQ937jAoBOyMbusDLwnxJCjVZ2gGmIyOJn2wc6zDCYGFSMU/bn5fD7G8xBUMtRra2tbg/4vZjjXeA3j8pZfFpWcLGmFTr5EI6y8HjFJnLwLDt5s+bB9B+iY71MP/RtahwDvD1ylCy2/LCo5ubOz81Fx8llGtbAbmpubZ3d1dT3CtjwtGtrb2+fIwSicSoOMyBegPQULzqbMk0Fae5J6aDcY2Sh4X2mdyeBk2NgDuxdpHpy2BPxTeDql1831gPecUs3QZwxAxauMSk6WNEIn72BfThb7d+Lk/vsZdA+01o8B/030r8v9wXv9AtLOi17OOx6886CvQNtAN0GDrpgpuIiVwqNtpKuYdxVlfh62MdcbkN0WHWabPqeczNMel951A6DF1NN8NWdNIAeegbRc8+Xups0joL0MNDx7sJ8vaL1xIRvESW6rzeDGkXc6MlGEjf1SZH0y/hPcJfOlvRb0WaScgY1ucomhA2I0D8h2ryPyH504WeTf6+KCbfIgG2Ifi3wF7bvkeR0P2uadTKj3D2Hcs+RxPvSPYC0riiPHoqmpaTr0Xo+lIJ0IQf9lO894wJhbFWxp4Fq5Lk/QfcoqVYQTJ9N5VpYG5eTR6BX+VPCOWr7c6/4gMf34qpK8t22aFtluzSP8e0WnX/Q+tnrkaycTGPsB+XyKzkugYzicj2u9GmEKbLmS9jlF+yA7SKdiTU/jeUbWXQgYq18W7h862W6kRMyg5UdJ+j0gxjGdMtqZ4tkn/R5LKpbISb06wN9NGesBV+GKEX6JDYxg8IdAA2In7ejVOrUCbM1zPSl3LK+jTyEb9AzJaDu5Rn9gJwS/YQ/rZPDmgi5ZPuHHgPrZZ0EFvY3ofy38u0zBvppPcx55lOEg8P6qyslREi2sAbjODXieAuWMTk3gkux2ICqtN8jPuSTrpWUrpu+Jf9b6DXtYJ/OFfDHoHc3X6Ro6m/Hcq41DexN4w654x484OQwa/r1oZvDuL0QvbQPG2EZg/ArI7sfJ3V5SN5QDdJ9xSWHId02UvrPzVAL0+9P2Hu/uguyOM9cf4ZL9rMrJ58S4gykpYwyoJ/rdkSnKeL/SsJz6HYr+R05V4GJ4vy+sYOgil1TPhcpS0hGd3hMljmC67wH97aTKl/ewch8WHYIFCvXo5PfTNgCyXsqr/mP0L8FfcWlOjpLDzL34i23F5zp57Yx+apUFTzsXbIknyOp6+JSpyeq4ZCOvg35j1GSTYmGxkvOz6zDlEp383NoaFRdCp64D/SrzkNheqXT0/XQStB90HvN86Iq2sUovWQt4ubgOPpk8pL64wH21MkIO83uyRtYke7gXWGfW6tYChR8ZLuUvGYsrPhlplNvqWgM6M0mWr8FoIPl5OGe5jCROHvPZVUvA9s6Ojo7HLF+DmRG2d2eTeoI/kAIUmNr43VrIAGj3ZqupSgPqH4xc0HFW7ojgH9BeZ3UC/gdwyTfxPqS8V6PSAiYgICAgICAg4D/BA1bT+9dhs4iMAAAAAElFTkSuQmCC>

[image8]: <data:image/png;base64,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>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAAAWCAYAAAB3/EQhAAADL0lEQVR4Xu1WO2gUURRNWEVFxe+yJLvO258uQVBhwUAKsTCghYhRiJAggo1VGtGQxsJgITaiESEgEsEm2KmFCBLQQmJl4QdBMCkslCgGIxgxes7Oe8vdm5nNbIKiMAcO8969593PzJt509QUI0aMGItANptdn8lktuK6UvscqDHGdOTzea9cLi/Xfg3P8/qgH5ZMp9ObQnxDiLvN+iY14X+N/CPUFgqFLbWZFgk0vBEBR8GP4E/wF3gllUqtDtC9A2+A98Ap8IDUaKDYdmiuirhPEWcVfRh3gPfBL9BdBA8xB31o9ijsZ8DvXMe5I+YnbaxLtdkEcIczra2tm7VdIplMrkHAB0g8gGnCNvjIBh92OhaM+d1isZi0pmasOQHbtNOEgTsEOW7amG+lDzG6c7mckTYHaFvACa4L8PGmzbNXgYT94EFtl6DGFjWDcZm2Uqm0FvPHInizLX5OLK3cONjGwDZpDwNi9DImrp1N/s27jPF1rXOo1zz7CrJXEbH5TuNvyVfcKbSJpirBodmA8TNwpnZ15cmNLJTDgTsAMUaxZhw8hvHzsKdO1Gsetq4gexVRmif4bsuPF18VBH7hgosiwprv1/YwQLudccE5bnntl1ig+aEgexVRm9dAUftZHPiec1zbjP9xW3LzhG1+BmvbtU+iTvMJrkfeycrMblWKJQchOB5gb6FeBazA+EfOLNjlbNiaOzGfZkKpJRptHkfZOsS5xljGvwmntcbB1hrUfC0gOM87IQnbV/CTtpMo+pSOATRb/T5pFEUstXl+5AZwYqxArEHb/GctcojcfBBYlNfAtkeSIyhul5vjeEvz6oV/8HizbhuxS+oBO2g3tC855o8Oco2zMXfua/y15o3/w/FE2XrscBnGd3QR7lTw7BFZD3a7P5Q7zrMnDa69Uuvwx5vnUYOC3jBBAH84nXtSbMLZMO+GZtbNQ5BADeeoA0fdr63zIcZem+uW8rG2HbB/oD/Kr3QNojRPjWpYckpqjf/V599fD3gB/Ib1Z6VGwognJzjh/CG5Kz9bAXZyLOxDPQ9Rmm8UeBp7jN/8Yf2k/inw/fLUlztGjBj/PX4DuH49TgHvB9IAAAAASUVORK5CYII=>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAAAWCAYAAAB3/EQhAAADWElEQVR4Xu1XTUhUURSeQaOiot9hUKd3ZxxJJKrFQIKLapFBi4gsUEgiaBMRbaKkTUTSIiIIMoIooiICaVetihCCiFq1KCIKUloFFYkGBTp937x7nndO741PRSh4H3zMu+d899xz7rs/b1KpBAkSJJgFMpnMUmNMQz6fX6R9AvhWQNPR3NzslUqlBdqv4XneMeivuWxqalod4RtA3HXWN6IJ/zuMf4vaYrG4tnqkWSKbzS5BwOvgJ/AZOAney+Vyq1wd21ZzA3wIfgV3uhoNJNsOzWVwAiyDLxBnMX147gAfgT+gOw/uljFR7D7YT4C/2I9tIdqHbKwL1aM5wAznGhsb12i7Qj0CXiXtm0wjaL8N/kBETJjtlpaWjDWlkexB2EZFEwXGRfybNuZH14cY3YVCwbg2AbQN4DD7hfg4aX/ZA2DAPnCXtrvg5CDIGwZCImdoYx+b6LiVpW3yk1M9g20yBLa59iggRi/j4rcz5U/eJU661glqFS85anuAOMUTdpAOPNbZ9lFb/Gu2EWMlnl+ZqckIwD0YZwyCKwAxBtHnJdjD+FFvnahVPGxdYfYAcYt3wcOIyRl/j+6lzUkiqvg+bY8CtOuZNDjJJa/9LqYpfiDMHmCGxdcjmW12sA943ioOtNuMf7jNuXjCFj+Ovu3a56JG8XXsj3FHKi25phT7ITgQYm+gXgUM4Nm9CT5hG0tzE55HOaDWzrR4XGXLEecKY9kxjmuNwOYaVnw1IDjLmXAJ2xj4TdtJJH1YxxDwlkC/zzKok8Rci+chdwo3xkIzdaN81yJB7OLDwKS8aZY9rzBoOvG7QWzOKV7mN4AXfeDxWrwLdil7KLCCNkP7ls/O2VKWe19j3otH4IsMbvw9XbmyWltblxn/Y6dst0c9nu/rJGSSMEbJtYfBLvfH7orjpMM2gd9eVyuY9+JtAmNIqgfNtLVV9jxs70Unb4pFiA3tbuh+SzsCdYh3mjpwUD5txZf3D9kyeFv5uFI2wv6F/jif0lWIU3zKX7pHwJ/G/2S9Y/xr7jkSy7tC45/6T8H94Dn2QfyTrsaFcd6cw2HxMz/lI3mKl0Ls5FCtg7oKMYuvgHsbM72DK8D+uaisAg1othi/+D36Tf1T4P5C8du1PUGCBP81/gBwOT9QlGqF+AAAAABJRU5ErkJggg==>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAAAWCAYAAAB3/EQhAAACyklEQVR4Xu2WPWhUQRSFE4J/KApqCNm/t7sJFhFsFhSChYWpVEQRFQw2NmIhiIjYpEgqsRGNCoKI2kiwsLHRJqXYCSIWWiSNoKgETGEwxu+YmWVynbe7iVEivAOH9+aeMzP37szOm7a2DBkyZFgikiTp7u3t3WjjoL1YLOZssKura72NhSiVSmcZ83bIfD6/JUUbrVar25w2aYn+plwu35O3p6enuHCmP4SSYuAZJjpgtc7Ozg1o42iPXaJ34Cv5rTcEye7Ccx3Owjn4vFAorJPGez98AqfwXYYH0TZLY54jxC/Ab+qntiftU26sKwtnC0AxhVwut9XGQ2jlGPAhA32F391EqcW7ST2n8O63XotarbYK313X512oUfCxSqWShDEPvN1wQv0imn603+J1MOHFWCFpcAWmFq9Vt/HFgP6DbvwBmu0UfpX3W9bn0ah45RiL17HSitcOYPwxin4Bj/P+Mm3VhUbFEzsci9fxN4pH3wdvwmuwH6nDehuBMbZrDvhDW97qIZoUPxqL17HcxZPsU7QhrRbPo3g/wgfW2wyu+GkdhlYL0aD4DvUnh8lfLZe4zCFHMJyMxLvlNwM2LD4GfDUlAStWSwOfsk34b7h+c/C89Xi4XGPFLwSGYf0SIZP5E/yzjYv86qftGEsovor/Pc+9VkuBDrlL3CPW0G/EFf/FmjxaLj6G0vJteyV9Du1TGPTJRfxR8HfZif+13nWn0MGn+fx332JFFB9+4/v6+lb7eMlte567Q38Mbrs/C3cc/QaIzfIcDL0e/7R4ViCviZSgPkuh5hId922tFu1HSj6wxdBB3yF8M3DMX229xlx7NCe8bzTtlB3EP0i3+TRFq8WX5+/LSsByOrC10z7jvLravk2a3PCSYOUCTnhd+RlN1E7SjrJxcTx2UEfRavGLAQkcgie0YnCt1VcMtH1LrZ/EGTJk+D/wE9t5IFRR0hJ+AAAAAElFTkSuQmCC>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAAAWCAYAAAB3/EQhAAAC1ElEQVR4Xu1WO2gUURTdJYqI4jfLsh/n7Q8hCFoMKKQQC1NYiBgEBYMINlY2osEmhcEi2AhGBEFEQZBgp1aCpBStbMRGMCkFFYMRDCZ6jvPecvfmvc3GXSTCHDjszLl37r1n5u2byWRSpEiR4i9hjCk0Go0tWneoVCrbkDNYq9WiOI7X67hGFEUXkH9HslQq7QzEJlF3t43NaiL+Dv3vM7der+9q7dQlOBQKL6DRUR0jyuXyDsQ/gHfBp+An8IjOk8CwB5BzE1wEf4EvUWcjYzgeBJ+BX5E3AR5jD8Ywwwnol8AfvI7njjg/Z2tdb+0mADPlYrHYr3WJfD6/CQUfodA38KdttMw8B0bsCVZFzkpZDHsW2pzM84ErBDXv2YHfyxhqnKxWq0ZqDsgtgDO8zhPjTVumN4GGoz4jIeRyuc0B81k7/JIUbf40OCD1EFBjxNYfyiQ37waOb+s8h3bmOaNPb6JX5nG+HfprcF7qBP+DOj8ErgDUmMI1r8BTOH4TeupEO/PQhn16E70yL4YImR/VegjI3cMe4BKXvI5LrGB+0qc30UPzAybZ3Lo2T1jz89wMdUyijfk+Xo++s3/O7OBMlhxHwhmPXmC+Khg0j6W5D/ocG0qdWK15vMq2os4t1mIv8KLOcbCz+sy3AglXeSckTbKDf9Y6iaHP6xoh82KIbs1zk7uCN8YG1Bq35r/oJIeOzfvAobSRdgiZj8IbXhbaQ3BY6V5gBe1H7lse85uCGx/7ufe+xpowD6yD/lgP4V51yI+l7oNd7s/lisN1Q9AW8Tsicx3+qXk8gRIbcUD96eqeFE04jbs18hdkngd9mGGMeeCU+7R1MdQ4xJ7gAxXjStkL/SPjep4V0al5/m/tAJoty9wku/4L8DR4DfyO+pdljoQRT05wxsU5n4qR3MVjj05O+zZqLzo1vxrgaRw0ifnj+kmtKXD5wvxhradIkeK/xm9vKyWhudUWLAAAAABJRU5ErkJggg==>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAAWCAYAAAC40nDiAAAD+UlEQVR4Xu1Xz0tUURh9wxgU/f5h4+jMu09nSKQgYiqopQTVIhD6YeGmP6AWtchNq8BFi8ooEIKQVhEJtYkSXEy1KBKKIAnKICU3SUlSLrS0c+beO965vadPm7TiHfiY+77z3e/ee9737r3jOBEiRIiwaIjV1NSsF0Ikbb+yfxvZbHZVJpNJ236NXC63pK6uzoUAu20uDFzX7UTfcdgU7DOsH74joOJoH6ysrFxh95kJ6LPf52UsHjzPO4YJDeD3hs0R8DeD/wTLw67j+RHMs+P8QPHR5yxFQ5cmPtOPikzBdwdCPsDvyFxERJ6l6mW8ZGXbfFmQSCSWY4BtziyfCGIuwr7CxjipIBHBTYA77qh8eO6BvaYQpZGloGAQqYO5U6nUugC+k/xfJyImloPdDTsxxLYGiQhuD7guNCu0D88NQlZmL/i1RngR3BrAv1WLbbN5AzEKGXauC4Yyi9hq+xGbhA3ARmtra7eanAa4FiXgJF+EzZtgrD1XPqtxkqw8kyNYxdXV1RvQjJt+9kP8Gt3G/BJ6C7HjkLvB9hdRThHps/2GiEECFapLiciKDZ6sIyvbMSrdk3gj5P57izmwHSwjpxbPvZm5OYfC4aLa9BXWIeRXMijkITbuGFsb+CpwD2FntO8XLKCIU+h7wOSIoIWGQTqd3o74YbN6UE1wifu4Hax2pq9J38zc2D42Yp6n1Jjv9R5M8V15eO1S6WJoX9UvpQCz7LUh2V507EZg1uZY3sXOCuUWEagA10Ue9mG2A0iDVY34Sdhjm1O5inuwGr/kBbF4hBS3pD/XR1OPnNtNWL/QezXIk7BB00B+hH3nAny4vun0En9AxGJO2Biqa4fNm+C+qm4Up1WfvB3DPMLYGtT4QSLmix2l3xRRVzbHmTLjSsBkbpk+Z3K2nxNXC/jGsUxOA8JtAT+iJnvC5k24cl/lPqqFz9sxHEsYB5kaf14iEohpxLoum74SlFNEIf8Z3POME5IL4YJgfeqE9EMMfdpV3mc2aYB71BU2KKaQn/M7O4h5zPHEPEVkxaPdYfK+mIeIl9Qkb/v1gf8HhGjWz648eYfxu9mM8wP6VSG2hy/IvhjzMwf3HC9lp/axDd8IF6t9HEdMHywFCLllDSFHRrn40vbBNwF7ouPUP6YLsHNs60OP54WO8UVYEXUF2mZXJJ7PC7kntaF9VMgFNJoxM4EnIeK/qPy9sGuwF7CnEGaTHU+fGo8n/CvYaMAVp2CcrzCuONrntz74DsO60R6iRvbYRYQVcS7gPxDkPITBW/wuryEQZ9VgcU3Mg1/PMe5uNjz51y7Jq4tjXah/E7H6+vqV+I2r3P7gm8Qk2jkRm4sQIUKE/xQ/AVvnjjUSq/gPAAAAAElFTkSuQmCC>

[image14]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFEAAAAWCAYAAAC40nDiAAAEUUlEQVR4Xu1XS2sUQRCeJQqKis8Yk2ymZxMxBAWRqGC8BUE9CIKPCF78AXpQwYB4UcjBg+ALDIJITiIE9CIayGHVg2JAERTBB6gYBEWDYjwYTfy+7epNbWd2nY3ii/2g2O6q6qrqmurq3iCooIIKKvhjSNXX1883xtT6fKF/Fw0NDctIURTN8WUOra2tUxsbG0MkoM2XJUEYhuex9gtoDPQe9BS87RBVYbylurp6pr+mFLBmY8zH+P2oqamZgUBOYjMv8fuJG0Qi7/h64HVA9g6UBZ3D/AYo8vXiwORjzSEmDUs2c04+KjIN3iX4vobfoXKSCDvTGCvoPivbl/8SSHJWBCWOCDeDDXQjoMOcp9Pp6RwzuEwms1rrgjcC2a5A7GHeD3rERGg9H+LjDG3C/rwi8vOU/3VJRGCtoMulAkMA+ySQMY9/EPQa6xs5x+86zHsxnKJ0WoytzAHI5+YXKzQ1NTVA/kR8dPlyhRQTWSrWP4IkSZTksEcNefxO8D6iGpe7Ob58j9aBvBb0Quv5gGynJHCUvny5BnX9WDkXP7WsPC0jWMV1dXULMKzSfK6LpLdzjPhqXAvx9WC7xefnkSSJhDgsCBCGT4IeSoA8Oj0lklgsQbnqkiSyYosHG9jKDlSlRxaPje2/F2mD7YYy2Tx7M20zhtzlImPy2Nd7jD0l7PW8xL4EqrVBvgiy66ADjjcBSZPoQx3B/Y73gySOwc8mLSOKbTQJ8EpYCf23unpQTWCZq3gdzA7Gn0nD2jZiX4g494rP564HM/mhvbzWiLkUxqfdR8lBl70jGFuPhX1QXOzLWN75xQqQbQGNYF235k8micAUyHopB7360QXkwKqG/ijopi8TW/keLP4LPhCLx9jkFqwHv5MkU8Z2AfTUuF4N4R6WrSYI34C+cgMxsofj5i3AawO9DW15F/SYSSbR9dYx0GdU1ypfrsG+Ki8Kd9llfR3aMao1iP9iSczmF1q+TqKrbPopuFQLQGNhGcfZ2GRvC6RvYLzWHQc6L5HEYfrSMgc+3iEfkmB3+3KN0PZV9lGX+KyvQ19GXWTif1JJJKDTjn2d0LwClJNEGGuRTWge+5lr2PxncCVSFxA3wg0ZdQHFIIU1x41t9BMe8ArsUac4YBzGHudnvhLtaH9mkklkxWN8RstjkSSJUtIPJLgCiqm8b+B1uHlob14e/6VaLw5Ytwi6/bTpP4x5zCG7m1GPe47BG+JmHY9+zPjFkoOxLWsQNpqExY+2AbwR0C2nJ/+YjoGOcOwuPd4XTicWSZLIL8OExZH7ag4I7qixPakL4x3GbqBd65QCb0LofxD7A6CzoHug20jMEl+fPPHHE8EP/bHIEydH/EBGPXEcL26P4G0D9WE8yBz5vvNIksRywecPbG6F851xj9cEqGLVYHObaQe/USA9OA6R/WtXy6dL4F12P4lUc3PzLPxWie148EsiiOMMxJdVUEEFFfyn+A7u5pyF7uWzjQAAAABJRU5ErkJggg==>

[image15]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEwAAAAWCAYAAABqgnq6AAAED0lEQVR4Xu1XTUhVQRS+Dw2KoowyU5/O8yfC/sMoot9FhS5sYa1KatEisFZJRe1bBREWFGZEi5AgiiihhQtrUZDQH8Rr4cKiHyxCCHRhpH3fu2ee507Xe0WFR/A+OMzMOd+ZOXNm7sxcz8sjjzzymBpSqdRcY0xpVVVViavX7ZyjpqamwtVpIOCiZDK5or6+fo5rs+BEIVvR1zI0E649Cuh7Hnw/QMYhfyBfIDfLy8uT1dXVi1DvcX3iAJ/G2traha5+RuBKouOLkFHXRiBRy2G7DxlE/SHKn5CTMBU4vF3Qv4Z0SPle26MAbh0kXVlZeU0vHHSH0O876J+iPq594oBEL6EP5MGs7E7uAuOv5IiU/wRkVxbSh5Uqpg71A5DfkDbLQ9I3oz3kSRK5C42fuI2WMxkqKio2gfeDMXghuxKT3QLbcFh8UZj1hFkUFxcvQKe9YQFB183kYIW3O/p2yzf+7uCu69OcsrKypdB9g2+11mvAdlYmFcerB2fY1ecEMQn7yEAZsNbbiUq9SSbdqznSL/WNWq8BW59wuqN2AcZYTK6rl11UKmdm4Igg2Cc5XnDnFnAx5SwuoC/PZ2XPQr7CuoAyJmH8FCZNGANSu6RXc2zCwDmu9RrSP33bXZuDQnBaVTuBdqPEzU+f5VfqaTT+5cPFzsTFWETPNoVz2gb5hPpn4x9Jz1X/9kzugpzQ+hkljL5xCaNd6zXEL5ITAiarzTiXlPHPVp6rTFpm56A9xrhswnATr0X7jfHP4FfCZXIayEW1kG25CNO27wBynDAGTt/zrm0yGDk/w3xEf0G1GX82YQSSc1t4zYpnd2SptKuMv/OYF72zc56wAfG944XckBrgdJSUlMw3/q0d2q/0lT0PGTvjCksY/JuUXyBhomuW/oJ5iUnYjA99HZgL2K+Kb9p92WswAeB06VgjEtbDxEp72gkjwGmB7p7WxSWMqzkGxz2OvtPyMdH1qP8yzkNVzgE+N4K3jAL6XW38Nxgn0OLaLfBWWwPOY9bNxCfZ6fJEn71AzDQTJmfdFWsPABODLfMyH3d/e/hbAn0agzzjI5a6lDwkUV62PExovwk+PBOwn0NQey0nAgnwjsB/FD4NnnoeyO/SJdivq9jIP+OOh/YxM3HoWx3PyBfytPDkk37EuUIOC485WIf2d5Qr2eYXxTlyfMvJfjJhorOPSWyArh/lS5SnIEOw37LbXsDgWiE3YDvIEjJCveJEAn6rZPwhjHXX+M+FQchpdyE9fzzeioPweyK8fuppNMFnRUYqJ85areNxEuBBerEBdqB8CxngjnTGjgcDRvZ3MhlRP+kMAAMcBXefk9ApgYsI/90ch5KKeMwSsBdhUqUsXdtMwPkyfo7P/l17Hnnkkcf/hL+gf6Xr0EKe3gAAAABJRU5ErkJggg==>

[image16]: <data:image/png;base64,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>