# 08 - Quản lý khách hàng & Loyalty

## Mô tả

Lưu trữ thông tin khách hàng, theo dõi lịch sử mua hàng, và vận hành chương trình khách hàng thân thiết: tích điểm theo hóa đơn, phân hạng thành viên (Silver/Gold/Platinum), đổi điểm lấy ưu đãi.

## Phân quyền

| Tính năng | Owner | Manager | Staff |
|-----------|:-----:|:-------:|:-----:|
| Thêm khách hàng mới | x | x | x |
| Sửa thông tin khách hàng | x | x | |
| Xem danh sách khách hàng | x | x | |
| Xem lịch sử mua hàng KH | x | x | |
| Tra cứu KH (khi bán hàng) | x | x | x |
| Cấu hình chương trình loyalty | x | | |
| Cấu hình hạng thành viên | x | | |
| Điều chỉnh điểm thủ công | x | x | |
| Xem báo cáo loyalty | x | x | |

## Tính năng chi tiết

### 1. Thông tin khách hàng
- Họ tên
- Số điện thoại (định danh chính — duy nhất)
- Email (tùy chọn)
- Ngày sinh (tùy chọn — dùng cho ưu đãi sinh nhật)
- Giới tính (tùy chọn)
- Ghi chú (ví dụ: dị ứng, sở thích)
- Ngày đăng ký
- Cửa hàng đăng ký

### 2. Chương trình tích điểm
- **Quy tắc tích điểm:** X điểm cho mỗi Y đồng chi tiêu (ví dụ: 1 điểm / 10.000 VND)
- Điểm tích sau khi thanh toán thành công
- Điểm bị trừ khi hoàn trả
- Điểm có thời hạn sử dụng (do Owner cấu hình, ví dụ: 12 tháng kể từ ngày tích)
- Lịch sử tích/tiêu điểm chi tiết

### 3. Hạng thành viên
- **Silver (Bạc):** Hạng mặc định khi đăng ký. Tích điểm tiêu chuẩn.
- **Gold (Vàng):** Đạt khi tích lũy >= X điểm hoặc >= Y đơn hàng trong khoảng thời gian. Ưu đãi: tích điểm x1.5, giảm giá 5% tất cả đơn.
- **Platinum (Bạch kim):** Đạt khi tích lũy >= X' điểm hoặc >= Y' đơn hàng. Ưu đãi: tích điểm x2, giảm giá 10%, ưu tiên khuyến mãi đặc biệt.
- Ngưỡng thăng hạng do Owner cấu hình
- Đánh giá hạng theo chu kỳ (hàng tháng/quý/năm — Owner cấu hình)
- Hạ hạng nếu không đạt điều kiện duy trì trong chu kỳ
- Không hạ dưới Silver

### 4. Đổi điểm
- Danh sách phần thưởng có thể đổi: giảm giá cố định, giảm %, sản phẩm miễn phí
- Mỗi phần thưởng có: tên, điểm cần, điều kiện (hạng tối thiểu, thời hạn), số lượng có sẵn
- Đổi điểm tại quầy (Staff nhập) hoặc KH tự đổi (nếu có app KH — tương lai)
- Trừ điểm ngay khi đổi

### 5. Tra cứu khách hàng khi bán hàng
- Trên màn hình POS: nhập SĐT khách hàng
- Hiển thị nhanh: tên, hạng, điểm hiện có, ưu đãi đang áp dụng
- Nếu KH chưa có → gợi ý tạo mới (chỉ cần SĐT + tên)
- Tự động áp dụng ưu đãi theo hạng

## Luồng xử lý chính

### Tích điểm khi mua hàng
```
Khách mua hàng → Staff nhập SĐT KH trên POS
  → Hiển thị thông tin KH + hạng + ưu đãi
  → Áp dụng ưu đãi theo hạng (nếu có)
  → Thanh toán thành công
  → Tính điểm = Tổng tiền sau giảm giá / Mức quy đổi × Hệ số hạng
  → Cộng điểm vào tài khoản KH
  → Kiểm tra điều kiện thăng hạng → Thăng hạng nếu đủ
  → In trên hóa đơn: điểm tích được, tổng điểm hiện có, hạng
```

### Đổi điểm
```
KH yêu cầu đổi điểm → Staff vào trang KH hoặc trên POS
  → Xem danh sách phần thưởng khả dụng (đủ điểm + đúng hạng)
  → Chọn phần thưởng → Xác nhận đổi
  → Trừ điểm → Tạo voucher/giảm giá tương ứng
  → Áp dụng ngay vào đơn hiện tại hoặc lưu cho lần sau
```

### Đánh giá hạng
```
Cuối chu kỳ (tự động) → Hệ thống kiểm tra từng KH:
  → Tổng chi tiêu / điểm tích lũy trong chu kỳ
  → So với ngưỡng duy trì hạng hiện tại
    → Đủ → Giữ hạng
    → Không đủ → Hạ 1 bậc (không hạ dưới Silver)
  → So với ngưỡng thăng hạng tiếp
    → Đủ → Thăng hạng
  → Gửi thông báo cho KH (nếu có thay đổi hạng)
```

## Gợi ý UI/UX

- Tra cứu KH trên POS: thanh nhập SĐT nhỏ gọn, kết quả hiện popup nhanh
- Thẻ thông tin KH: card hiển thị hạng (màu tương ứng: xám/vàng/tím), điểm, thông tin cơ bản
- Lịch sử mua hàng KH: timeline dọc, mỗi đơn là 1 entry
- Danh sách KH: bảng với cột hạng (badge màu), điểm, tổng chi tiêu, đơn gần nhất
- Cấu hình loyalty: form trực quan, preview quy tắc bằng ví dụ cụ thể
- Màu sắc hạng: Silver (#C0C0C0), Gold (#FFD700), Platinum (#E5E4E2)

## Quy tắc nghiệp vụ

1. SĐT là định danh duy nhất — không thể 2 KH trùng SĐT
2. Tích điểm chỉ áp dụng khi KH được gắn vào đơn hàng trước khi thanh toán
3. Hoàn trả → trừ điểm tương ứng. Nếu điểm đã tiêu (âm điểm), ghi nhận nợ điểm
4. Điểm hết hạn tự động trừ vào cuối tháng chứa ngày hết hạn
5. Thăng hạng có hiệu lực ngay lập tức, hạ hạng chỉ xảy ra vào cuối chu kỳ đánh giá
6. Owner có thể điều chỉnh điểm thủ công (cộng/trừ) kèm lý do — ghi log
7. KH bị xóa = soft delete, dữ liệu lịch sử giữ nguyên cho báo cáo
8. Ưu đãi theo hạng áp dụng cho tất cả cửa hàng trong chuỗi

## Trạng thái khách hàng

```
[Đăng ký] → Hoạt động ←→ Tạm khóa (bởi Owner/Manager)
                ↓
            Đã xóa (soft delete)
```

## Trạng thái hạng thành viên

```
Silver → Gold → Platinum
   ↑       ↓       ↓
   ← ← ← ←  ← ← ←
   (Hạ hạng cuối chu kỳ, không hạ dưới Silver)
```
