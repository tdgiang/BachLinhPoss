# 11 - Thông báo

## Mô tả

Hệ thống thông báo đẩy (push notification) và thông báo trong app để cập nhật thông tin quan trọng cho từng vai trò: cảnh báo hệ thống, thông báo kinh doanh, và giao tiếp nội bộ trong chuỗi.

## Phân quyền

| Tính năng | Owner | Manager | Staff |
|-----------|:-----:|:-------:|:-----:|
| Nhận thông báo | x | x | x |
| Gửi thông báo nội bộ | x | x (đến Staff cửa hàng mình) | |
| Cấu hình thông báo tự động | x | | |
| Đánh dấu đã đọc | x | x | x |
| Xem lịch sử thông báo | x | x | x (của mình) |

## Tính năng chi tiết

### 1. Thông báo tự động (hệ thống)

#### Cho Staff
- Ca làm việc: nhắc mở ca, ca đã mở quá 24h
- Đơn hàng: đơn mới cần pha chế (nếu dùng màn hình bếp)

#### Cho Manager
- Tồn kho: sản phẩm đạt ngưỡng cảnh báo, sản phẩm hết hàng
- Ca làm việc: Staff mở ca, Staff đóng ca có chênh lệch tiền
- Doanh thu: tổng kết cuối ngày
- Đơn hàng: đơn bị hủy, đơn hoàn trả
- Nhân sự: Staff mới được tạo, Staff không đăng nhập nhiều ngày

#### Cho Owner
- Tất cả thông báo của Manager (toàn chuỗi)
- Báo cáo: báo cáo định kỳ đã gửi
- Cửa hàng: cửa hàng mở/đóng bất thường
- Tài chính: doanh thu vượt mốc, doanh thu giảm bất thường
- Khuyến mãi: KM sắp hết hạn, KM đã hết lượt sử dụng
- Loyalty: KH thăng hạng, điểm sắp hết hạn (tổng hợp)

### 2. Thông báo thủ công (nội bộ)
- Owner gửi thông báo đến: toàn chuỗi, cửa hàng cụ thể, vai trò cụ thể, hoặc cá nhân
- Manager gửi thông báo đến: Staff trong cửa hàng mình
- Nội dung: tiêu đề + nội dung text
- Đính kèm hình ảnh (tùy chọn, tối đa 3 ảnh)

### 3. Trung tâm thông báo
- Danh sách thông báo theo thời gian (mới nhất trước)
- Phân loại: Tất cả / Hệ thống / Nội bộ / Chưa đọc
- Badge số thông báo chưa đọc trên icon chuông
- Tap vào thông báo → đi đến màn hình liên quan (deep link)
  - Ví dụ: thông báo "Sản phẩm X hết hàng" → mở Quản lý kho tại sản phẩm X
- Đánh dấu đã đọc (từng cái hoặc tất cả)
- Xóa thông báo cũ (tự động sau 30 ngày hoặc thủ công)

### 4. Cấu hình thông báo
- Owner bật/tắt từng loại thông báo tự động
- Mỗi người dùng tùy chỉnh: bật/tắt push notification, bật/tắt âm thanh
- Chế độ "Không làm phiền": tắt push trong khung giờ cụ thể (ví dụ: 22:00-7:00)

## Luồng xử lý chính

### Thông báo tự động
```
Sự kiện xảy ra (ví dụ: tồn kho đạt ngưỡng)
  → Hệ thống tạo thông báo → Xác định người nhận (theo vai trò + cửa hàng)
  → Lưu vào trung tâm thông báo
  → Gửi push notification (nếu người nhận bật push)
  → Người nhận mở app → Thấy badge → Tap vào → Đọc + đi đến màn hình liên quan
```

### Gửi thông báo nội bộ
```
Owner/Manager vào Thông báo → Gửi mới
  → Chọn người nhận (toàn chuỗi / cửa hàng / vai trò / cá nhân)
  → Nhập tiêu đề + nội dung + ảnh (tùy chọn)
  → Gửi → Tất cả người nhận được push + thấy trong trung tâm TB
```

## Gợi ý UI/UX

- Icon chuông ở header, badge đỏ với số thông báo chưa đọc
- Trung tâm thông báo: full screen list, mỗi item có icon loại TB + tiêu đề + thời gian + trạng thái đọc
- Thông báo chưa đọc: nền highlight nhẹ, đã đọc: nền trắng
- Vuốt trái để xóa, tap để mở chi tiết
- Gửi TB nội bộ: form đơn giản, chọn người nhận dạng chip multi-select
- Push notification: hiển thị ngắn gọn (tiêu đề + 1 dòng nội dung), tap để mở app

## Quy tắc nghiệp vụ

1. Thông báo tự động không gửi trùng lặp — mỗi sự kiện chỉ tạo 1 thông báo
2. Thông báo push chỉ gửi khi người dùng bật push và ngoài giờ "Không làm phiền"
3. Thông báo cũ hơn 30 ngày tự động xóa khỏi trung tâm thông báo
4. Thông báo nội bộ từ Owner/Manager không thể bị Staff xóa — chỉ đánh dấu đã đọc
5. Khi tài khoản bị khóa, không nhận thông báo push nhưng TB vẫn lưu (xem lại khi mở khóa)
6. Deep link trong thông báo: nếu người nhận không có quyền xem màn hình đích, hiển thị nội dung TB thay vì chuyển hướng
7. Giới hạn gửi TB nội bộ: tối đa 10 lần/ngày (Manager), không giới hạn (Owner)
