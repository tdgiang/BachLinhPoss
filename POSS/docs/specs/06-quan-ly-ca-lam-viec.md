# 06 - Quản lý ca làm việc

## Mô tả

Quản lý ca làm việc của nhân viên tại cửa hàng: mở ca, đóng ca, kiểm tiền đầu ca/cuối ca, và báo cáo tổng hợp ca. Đảm bảo mọi giao dịch đều thuộc về một ca cụ thể để dễ đối soát.

## Phân quyền

| Tính năng | Owner | Manager | Staff |
|-----------|:-----:|:-------:|:-----:|
| Mở ca | x | x | x |
| Đóng ca | x | x | x (chỉ ca mình) |
| Xem báo cáo ca | x | x | x (chỉ ca mình) |
| Xem tất cả ca trong cửa hàng | x | x | |
| Đóng ca hộ (khi Staff quên) | x | x | |
| Cấu hình số tiền mở ca mặc định | x | x | |

## Tính năng chi tiết

### 1. Mở ca
- Bắt buộc mở ca trước khi bán hàng
- Nhập số tiền đầu ca (tiền mặt trong ngăn kéo)
- Ghi nhận: người mở ca, thời gian mở, cửa hàng, số tiền đầu ca
- Một cửa hàng có thể có nhiều ca mở đồng thời (nhiều nhân viên cùng ca)
- Mỗi nhân viên chỉ có tối đa 1 ca mở tại một thời điểm

### 2. Hoạt động trong ca
- Tất cả đơn hàng gắn với ca đang mở của nhân viên
- Theo dõi realtime: số đơn, tổng doanh thu, tổng tiền mặt, tổng chuyển khoản/ví/thẻ
- Ghi nhận các khoản thu/chi ngoài đơn hàng:
  - **Thu khác:** nhận tiền từ nguồn khác (ví dụ: khách trả nợ)
  - **Chi khác:** chi tiền mặt cho mục đích khác (ví dụ: mua vật tư nhỏ)
  - Mỗi khoản thu/chi ngoài yêu cầu: số tiền, lý do, ghi chú

### 3. Đóng ca
- Nhập số tiền mặt thực tế đếm được trong ngăn kéo
- Hệ thống tính số tiền mặt kỳ vọng = Đầu ca + Thu tiền mặt - Chi tiền mặt - Hoàn trả tiền mặt
- Hiển thị chênh lệch (thừa/thiếu)
- Bắt buộc nhập ghi chú nếu chênh lệch > 0
- Báo cáo đóng ca tự động tạo

### 4. Báo cáo ca
- **Tổng quan:** thời gian mở/đóng, thời lượng ca
- **Doanh thu:** tổng doanh thu, chi tiết theo phương thức thanh toán
- **Đơn hàng:** tổng số đơn, đơn hoàn thành, đơn hủy, đơn hoàn trả
- **Tiền mặt:** đầu ca + thu - chi - hoàn = kỳ vọng vs thực tế → chênh lệch
- **Thu/chi ngoài:** danh sách chi tiết
- **Sản phẩm:** top sản phẩm bán được trong ca

## Luồng xử lý chính

### Mở ca
```
Staff đăng nhập → Hệ thống kiểm tra: có ca đang mở?
  → Có → Vào thẳng màn hình POS
  → Không → Bắt buộc mở ca mới
    → Nhập số tiền đầu ca (gợi ý số tiền mặc định)
    → Xác nhận → Ca được mở → Vào màn hình POS
```

### Đóng ca
```
Staff bấm "Đóng ca" → Hiển thị tổng hợp ca
  → Nhập số tiền mặt thực tế đếm được
  → Hệ thống so sánh: thực tế vs kỳ vọng
  → Chênh lệch > 0 → Bắt buộc nhập ghi chú giải thích
  → Xác nhận đóng ca → Tạo báo cáo ca
  → (Tùy chọn) In báo cáo ca → Đăng xuất hoặc mở ca mới
```

### Đóng ca hộ
```
Manager vào Quản lý ca → Thấy ca còn mở quá lâu
  → Chọn "Đóng ca hộ" → Nhập ghi chú lý do
  → Ca được đóng với ghi chú "Đóng bởi Manager" + thời gian
  → Tiền mặt cuối ca ghi nhận = "Chưa kiểm đếm"
```

## Gợi ý UI/UX

- Mở ca: dialog đơn giản, 1 trường nhập tiền + nút xác nhận
- Trong ca: badge nhỏ góc trên hiển thị thời gian ca đã chạy
- Đóng ca: full screen, hiển thị bảng tổng hợp rõ ràng, bàn phím số lớn cho nhập tiền
- Chênh lệch: highlight đỏ nếu thiếu, xanh nếu thừa, xám nếu khớp
- Báo cáo ca: dạng receipt, có thể cuộn, nút in/chia sẻ

## Quy tắc nghiệp vụ

1. Không thể bán hàng (tạo đơn) khi chưa mở ca
2. Mỗi nhân viên chỉ có 1 ca mở tại một thời điểm
3. Ca không tự động đóng — phải đóng thủ công (hoặc Manager đóng hộ)
4. Ca mở quá 24 giờ: hệ thống cảnh báo Manager
5. Đóng ca không ảnh hưởng đến đơn hàng đang xử lý — đơn đó chuyển sang ca người tiếp nhận
6. Thu/chi ngoài luôn yêu cầu lý do và được ghi log
7. Báo cáo ca không thể chỉnh sửa sau khi đóng — chỉ Manager/Owner xem được ghi chú bổ sung

## Trạng thái ca làm việc

```
[Mở ca] → Đang hoạt động → Đã đóng
                              ↓
                     (Không thể mở lại — phải tạo ca mới)
```
