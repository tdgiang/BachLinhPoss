# 05 - Thanh toán

## Mô tả

Xử lý thanh toán cho đơn hàng với đầy đủ phương thức: tiền mặt, chuyển khoản ngân hàng (QR), ví điện tử (MoMo, ZaloPay, VNPay), thẻ tín dụng/ghi nợ, và thanh toán kết hợp (split payment). Hỗ trợ in/gửi hóa đơn.

## Phân quyền

| Tính năng | Owner | Manager | Staff |
|-----------|:-----:|:-------:|:-----:|
| Thanh toán đơn hàng | x | x | x |
| Thanh toán split payment | x | x | x |
| In/gửi hóa đơn | x | x | x |
| Xem lịch sử thanh toán | x | x | x (chỉ ca mình) |
| Cấu hình phương thức thanh toán | x | | |
| Kết nối cổng thanh toán | x | | |

## Tính năng chi tiết

### 1. Phương thức thanh toán

#### Tiền mặt
- Nhập số tiền khách đưa
- Tự tính tiền thừa
- Hỗ trợ gợi ý mệnh giá phổ biến (50k, 100k, 200k, 500k)
- Nút "Tiền đúng" (khách đưa đúng tổng)

#### Chuyển khoản ngân hàng
- Sinh QR code thanh toán (VietQR) với số tiền chính xác
- Thông tin: tên ngân hàng, số tài khoản, tên chủ TK, số tiền, nội dung chuyển khoản (mã đơn)
- Xác nhận thủ công khi nhận được tiền (Staff bấm "Đã nhận")

#### Ví điện tử
- Hỗ trợ: MoMo, ZaloPay, VNPay
- Sinh QR/deep link thanh toán
- Nhận callback xác nhận tự động từ cổng thanh toán (nếu tích hợp API)
- Fallback: xác nhận thủ công nếu callback không hoạt động

#### Thẻ tín dụng / ghi nợ
- Kết nối máy POS terminal (nếu có)
- Hoặc thanh toán qua cổng online (VNPay, Stripe...)
- Ghi nhận loại thẻ + 4 số cuối (không lưu toàn bộ số thẻ)

### 2. Split Payment (thanh toán kết hợp)
- Cho phép chia thanh toán thành nhiều phần bằng các phương thức khác nhau
- Ví dụ: 100k tiền mặt + 50k MoMo
- Hiển thị số tiền còn lại cần thanh toán sau mỗi phần
- Tất cả phần phải đủ tổng đơn hàng mới hoàn tất

### 3. Hóa đơn
- In hóa đơn nhiệt qua máy in Bluetooth/Wi-Fi (58mm hoặc 80mm)
- Nội dung hóa đơn: logo, tên cửa hàng, địa chỉ, SĐT, mã đơn, danh sách sản phẩm (tên, SL, đơn giá, thành tiền), tạm tính, giảm giá, thuế, tổng cộng, phương thức thanh toán, thời gian, nhân viên thu ngân, mã QR tra cứu đơn
- Gửi hóa đơn điện tử qua SMS hoặc email (nếu có SĐT/email KH)
- In lại hóa đơn bất kỳ lúc nào từ danh sách đơn hàng

### 4. Lịch sử thanh toán
- Danh sách giao dịch với: mã đơn, thời gian, số tiền, phương thức, trạng thái
- Lọc theo: khoảng thời gian, phương thức thanh toán, trạng thái
- Tìm kiếm theo mã đơn

## Luồng xử lý chính

### Thanh toán đơn giản (1 phương thức)
```
Từ màn hình POS → Bấm "Thanh toán" → Hiển thị tổng tiền
  → Chọn phương thức thanh toán
  → (Tiền mặt) Nhập số tiền khách đưa → Hiển thị tiền thừa → Xác nhận
  → (QR/Ví) Hiển thị QR → Chờ xác nhận (tự động hoặc thủ công)
  → (Thẻ) Chờ quẹt thẻ trên terminal → Nhận kết quả
  → Thanh toán thành công → In/gửi hóa đơn → Đơn chuyển "Hoàn thành"
```

### Split payment
```
Bấm "Thanh toán" → Chọn "Chia thanh toán"
  → Nhập số tiền phần 1 + chọn phương thức → Xác nhận phần 1
  → Hiển thị số tiền còn lại
  → Nhập số tiền phần 2 + chọn phương thức → Xác nhận phần 2
  → (Lặp lại nếu cần)
  → Đủ tổng → Hoàn tất → In hóa đơn (ghi rõ từng phần thanh toán)
```

## Gợi ý UI/UX

- Màn hình thanh toán: full screen, tổng tiền lớn ở trên, các phương thức dạng button/card lớn phía dưới
- Tiền mặt: bàn phím số lớn + các nút mệnh giá nhanh + nút "Tiền đúng"
- QR: hiển thị QR to giữa màn hình, kèm hướng dẫn, có countdown timeout
- Split: progress bar hiển thị phần đã thanh toán / còn lại
- Hóa đơn: preview trước khi in, nút "In" và "Gửi" rõ ràng
- Animation/sound feedback khi thanh toán thành công

## Quy tắc nghiệp vụ

1. Không thể thanh toán đơn hàng rỗng hoặc đơn đã hủy
2. Split payment: tổng các phần phải bằng chính xác tổng đơn hàng
3. Khi thanh toán QR/ví điện tử: nếu không nhận callback trong 5 phút, cho phép xác nhận thủ công hoặc hủy
4. Hóa đơn ghi rõ tất cả phương thức thanh toán đã dùng (trong trường hợp split)
5. Không lưu trữ toàn bộ số thẻ tín dụng/ghi nợ — chỉ lưu loại thẻ + 4 số cuối
6. Mỗi giao dịch thanh toán ghi nhận vào ca làm việc đang mở
7. Thanh toán thành công mới cập nhật trạng thái đơn hàng, tồn kho, và điểm loyalty
8. Thông tin tài khoản ngân hàng nhận chuyển khoản do Owner cấu hình cho từng cửa hàng

## Trạng thái thanh toán

```
[Chờ thanh toán] → Đang xử lý → Thành công
                                     ↓
                                 Đã hoàn trả (liên kết với chức năng hoàn trả ở 04)
                       ↓
                   Thất bại (timeout/lỗi cổng) → Cho phép thử lại
```
