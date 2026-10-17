# 02 - Quản lý chuỗi cửa hàng

## Mô tả

Quản lý thông tin và cấu hình cho từng cửa hàng trong chuỗi. Cho phép Owner tổng quan toàn bộ hệ thống, Manager quản lý chi tiết cửa hàng được gán.

## Phân quyền

| Tính năng | Owner | Manager | Staff |
|-----------|:-----:|:-------:|:-----:|
| Thêm cửa hàng mới | x | | |
| Sửa thông tin cửa hàng | x | x (cửa hàng mình) | |
| Tạm đóng/mở lại cửa hàng | x | | |
| Xóa cửa hàng | x | | |
| Xem danh sách tất cả cửa hàng | x | | |
| Xem chi tiết cửa hàng được gán | x | x | x (chỉ xem) |
| Cấu hình giờ hoạt động | x | x (cửa hàng mình) | |
| Cấu hình thuế/phí dịch vụ | x | | |

## Tính năng chi tiết

### 1. Thông tin cửa hàng
- Tên cửa hàng
- Mã cửa hàng (tự sinh, duy nhất, ví dụ: POSS-001)
- Địa chỉ đầy đủ (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)
- Số điện thoại liên hệ
- Email
- Logo riêng (tùy chọn, mặc định dùng logo chuỗi)
- Ảnh cửa hàng (tối đa 5 ảnh)

### 2. Cấu hình hoạt động
- Giờ mở cửa / đóng cửa (theo từng ngày trong tuần)
- Ngày nghỉ đặc biệt
- Trạng thái: Đang hoạt động / Tạm đóng / Đã đóng vĩnh viễn
- Số bàn phục vụ (nếu có phục vụ tại chỗ)
- Cho phép bật/tắt phục vụ tại chỗ hoặc chỉ mang đi

### 3. Cấu hình tài chính
- Thuế VAT (%, mặc định 8%)
- Phí dịch vụ (%, tùy chọn)
- Đơn vị tiền tệ (mặc định VND)
- Thông tin xuất hóa đơn: tên công ty, mã số thuế, địa chỉ

### 4. Cấu hình thiết bị
- Máy in hóa đơn (kết nối Bluetooth/Wi-Fi, khổ giấy 58mm hoặc 80mm)
- Ngăn kéo tiền (kết nối qua máy in)
- Mẫu hóa đơn: header (logo + tên cửa hàng), footer (lời cảm ơn, thông tin liên hệ)

### 5. Tổng quan chuỗi (chỉ Owner)
- Dashboard hiển thị tất cả cửa hàng trên bản đồ
- Trạng thái nhanh từng cửa hàng: đang mở/đóng, doanh thu hôm nay, số đơn hôm nay
- So sánh hiệu suất giữa các cửa hàng

## Luồng xử lý chính

### Thêm cửa hàng mới
```
Owner vào Quản lý chuỗi → Thêm cửa hàng → Nhập thông tin cơ bản
  → Cấu hình giờ hoạt động → Cấu hình tài chính
  → Gán Manager (tùy chọn) → Xác nhận tạo
  → Hệ thống sinh mã cửa hàng tự động
  → Sao chép menu mặc định từ chuỗi (nếu có)
```

### Tạm đóng cửa hàng
```
Owner chọn cửa hàng → Tạm đóng → Xác nhận
  → Kiểm tra: còn ca đang mở? → Cảnh báo nếu có
  → Đóng tất cả ca → Cập nhật trạng thái → Thông báo cho Manager/Staff
```

## Gợi ý UI/UX

- Danh sách cửa hàng: card view với ảnh, tên, trạng thái (badge màu), doanh thu nhanh
- Chi tiết cửa hàng: tab-based (Thông tin / Cấu hình / Nhân sự / Thiết bị)
- Bản đồ chuỗi: pin marker cho mỗi cửa hàng, tap để xem thông tin nhanh
- Trạng thái cửa hàng: xanh lá (hoạt động), vàng (tạm đóng), xám (đã đóng)

## Quy tắc nghiệp vụ

1. Mã cửa hàng không thể thay đổi sau khi tạo
2. Không thể xóa cửa hàng có dữ liệu giao dịch — chỉ có thể đánh dấu "Đã đóng vĩnh viễn"
3. Tạm đóng cửa hàng: Staff không thể đăng nhập POS, dữ liệu vẫn giữ, báo cáo vẫn truy cập được
4. Khi tạo cửa hàng mới, menu có thể sao chép từ cửa hàng khác hoặc tạo trống
5. Cấu hình thuế/phí áp dụng cho toàn chuỗi (Owner đặt), Manager không thể thay đổi

## Trạng thái cửa hàng

```
[Tạo mới] → Đang hoạt động ←→ Tạm đóng
                  ↓
          Đã đóng vĩnh viễn
```
