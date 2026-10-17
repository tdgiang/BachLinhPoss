# 12 - Ví khách hàng (Customer Wallet)

## Mô tả

Hệ thống ví điện tử cho khách hàng, cho phép nạp tiền với nhiều phương thức thanh toán và áp dụng chương trình khuyến mãi nạp (khách hàng nhận thêm tiền bonus). Khách hàng có thể sử dụng ví để thanh toán giao dịch (toàn bộ hoặc từng phần), tương tự cấu trúc tài khoản quán net. Hệ thống ghi nhận đầy đủ lịch sử nạp/dùng, hỗ trợ kiểm toán và phân tích.

## Phân quyền

| Tính năng | Owner | Manager | Staff |
|-----------|:-----:|:-------:|:-----:|
| Tạo chương trình khuyến mãi nạp ví | x | x | |
| Sửa/xóa chương trình khuyến mãi nạp ví | x | x | |
| Bật/tắt chương trình khuyến mãi nạp ví | x | x | |
| Nạp tiền vào ví (trên POS) | x | x | x |
| Thanh toán đơn hàng bằng ví | x | x | x |
| Xem số dư ví khách hàng | x | x | x |
| Xem lịch sử nạp/dùng ví KH | x | x | x (chỉ ca mình) |
| Điều chỉnh số dư thủ công | x | x | |
| Xem báo cáo ví | x | x | |
| Cấu hình ngưỡng/hạn mức ví | x | | |

## Tính năng chi tiết

### 1. Ví khách hàng

#### Thông tin ví
- Số dư hiện tại (VND)
- Trạng thái ví: Hoạt động / Bị khóa (do Owner/Manager) / Đã xóa (soft delete)
- Ngày tạo ví
- Ngày cập nhật lần cuối
- Ghi chú (tùy chọn)

#### Quy tắc ví
- Mỗi khách hàng có **1 ví duy nhất** (liên kết với số điện thoại KH)
- Ví được tạo tự động khi KH lần đầu nạp tiền
- Ví lưu trữ tất cả cửa hàng trong chuỗi (chung số dư)
- Không có giới hạn số tiền tối đa trong ví
- Không có ngày hết hạn số dư (số dư lưu vĩnh viễn)

### 2. Nạp tiền vào ví

#### Phương thức nạp
- **Tiền mặt:** Staff nhập số tiền nạp, khách đưa tiền mặt
- **Chuyển khoản:** Sinh QR code với số tiền, khách chuyển khoản từ ứng dụng ngân hàng của mình
- **Thẻ / Ví điện tử:** Thanh toán qua thẻ tín dụng, MoMo, ZaloPay, VNPay (nếu kết nối API)

#### Quy trình nạp tiền
- Staff trên POS: chọn khách hàng (tìm kiếm theo SĐT) → chọn "Nạp ví"
- Nhập số tiền cần nạp
- Hệ thống tự động kiểm tra: chương trình khuyến mãi nào áp dụng được?
  - Nếu có: hiển thị % bonus, số tiền sẽ nhận, tổng cộng
  - Nếu không: hiển thị "Không có chương trình khuyến mãi"
- Khách hàng chọn phương thức thanh toán nạp (tiền mặt / QR / thẻ)
- Thanh toán thành công → cộng vào ví (bao gồm cả bonus nếu có)
- Ghi nhận lịch sử nạp chi tiết (số tiền nạp, % bonus, tổng nhận, phương thức, chương trình áp dụng)

### 3. Sử dụng ví thanh toán

#### Thanh toán bằng ví
- Khi thanh toán giao dịch trên POS, Staff có tùy chọn "Thanh toán bằng ví"
- Hai trường hợp:
  1. **Ví đủ tiền:** Dùng toàn bộ ví để thanh toán giao dịch, ví còn lại = số dư cũ - tổng giao dịch
  2. **Ví không đủ tiền:** Dùng toàn bộ ví + nhập thêm phương thức thanh toán khác cho phần còn lại
     - Ví dụ: Giao dịch 300k, ví có 200k → dùng ví 200k + tiền mặt 100k
     - Ví còn lại = 0

#### Split payment (Thanh toán chia)
- Có thể kết hợp ví + các phương thức khác trong 1 giao dịch
- Hiển thị số tiền còn lại cần thanh toán sau khi dùng ví
- Tất cả phần phải đủ tổng giao dịch mới hoàn tất

#### Điều kiện thanh toán
- Không thể thanh toán bằng ví nếu ví bị khóa
- Không thể thanh toán với KH bị xóa (soft delete)
- Nếu ví còn 0đ, Staff vẫn có thể nạp tiền cho KH (reset ví)

### 4. Chương trình khuyến mãi nạp ví

#### Loại chương trình
- **Khuyến mãi % cố định:** Tất cả nạp đều cộng thêm X% (ví dụ: nạp được +20%)
- **Khuyến mãi theo tầng:**
  - Nạp 50k-99k → +15%
  - Nạp 100k-499k → +20%
  - Nạp ≥500k → +25%
  - (Các tầng do Owner/Manager cấu hình)

#### Cấu hình chương trình
- Tên chương trình
- Mô tả (tùy chọn)
- Loại KM: % cố định / theo tầng
- Quy tắc tính %, chi tiết tầng (nếu theo tầng)
- Điều kiện áp dụng:
  - Thời gian: ngày bắt đầu → ngày kết thúc
  - Khung giờ (tùy chọn): từ giờ → đến giờ
  - Cửa hàng: toàn chuỗi / cửa hàng cụ thể
  - Phương thức nạp: tất cả / chỉ tiền mặt / chỉ chuyển khoản / chỉ thẻ
  - KH tương ưu: tất cả / chỉ thành viên / chỉ hạng cụ thể
- Giới hạn sử dụng:
  - Số lần dùng tối đa (tổng toàn hệ thống, ví dụ: 1000 lần)
  - Số lần tối đa mỗi KH (ví dụ: 5 lần/KH)
  - Giới hạn tiền bonus 1 ngày/KH (tùy chọn, ví dụ: max 200k bonus/ngày)
- Trạng thái: Bật ngay / Lên lịch / Tạm dừng

#### Áp dụng chương trình
- Hệ thống tự động kiểm tra tất cả chương trình khuyến mãi đang hoạt động khi KH nạp tiền
- Nếu có nhiều chương trình áp dụng được → chọn chương trình cho % bonus cao nhất
- Ghi nhận chương trình được áp dụng trong lịch sử nạp

### 5. Lịch sử ví

#### Ghi nhận lịch sử
- Mỗi nạp/dùng ví đều được ghi nhận chi tiết:
  - **Nạp tiền:** Số tiền nạp, % bonus, tiền bonus nhận, tổng cộng, phương thức thanh toán, chương trình KM (nếu có), nhân viên xử lý, thời gian, cửa hàng
  - **Thanh toán:** Tổng giao dịch, số tiền từ ví, phương thức thanh toán khác (nếu split), nhân viên xử lý, mã đơn, thời gian, cửa hàng

#### Xem lịch sử
- Owner/Manager: xem lịch sử tất cả khách hàng
- Staff: xem lịch sử khách hàng (chỉ ca làm việc của mình)
- Lọc: theo khoảng thời gian, phương thức, loại giao dịch (nạp/dùng), KH
- Tìm kiếm: theo SĐT khách hàng, mã đơn

#### Điều chỉnh số dư thủ công
- Owner/Manager: có thể cộng/trừ số dư ví KH thủ công
- Bắt buộc: nhập lý do, ghi chú
- Tất cả điều chỉnh ghi log audit đầy đủ

### 6. Báo cáo ví

#### Báo cáo chủ yếu
- **Tổng doanh thu nạp ví:** tính theo ngày/tuần/tháng/năm
- **Tổng tiền bonus:** tiền thực tế cộng thêm (tính % so với doanh thu nạp)
- **Danh sách nạp ví:** bảng chi tiết từng lượt nạp (KH, số tiền, bonus, phương thức, chương trình, thời gian)
- **Danh sách thanh toán từ ví:** bảng chi tiết từng giao dịch thanh toán bằng ví
- **Thống kê chương trình KM nạp ví:** số lần dùng, tổng tiền nạp, tổng tiền bonus, % hiệu quả
- **Khách hàng nạp nhiều nhất:** Top N KH theo tổng tiền nạp, tần suất nạp
- **Số dư ví tại ngày X:** snapshot tất cả KH, số dư từng người

## Luồng xử lý chính

### Nạp tiền vào ví
```
Staff / POS → Tìm kiếm khách hàng (SĐT)
  → Chọn "Nạp ví" → Nhập số tiền nạp
  → Hệ thống kiểm tra: có chương trình KM nào áp dụng?
    → Có: hiển thị % bonus, tiền nhận, tổng cộng
    → Không: hiển thị "Không có KM"
  → Chọn phương thức thanh toán nạp (tiền mặt / QR / thẻ)
  → (Tiền mặt) Khách đưa tiền → Xác nhận
  → (QR/Thẻ) Chờ xác nhận từ cổng thanh toán
  → Thanh toán thành công
  → Cộng vào ví: số tiền nạp + tiền bonus (nếu có)
  → Ghi lịch sử nạp chi tiết
  → In phiếu nạp (tùy chọn)
```

### Thanh toán giao dịch bằng ví
```
Staff tạo đơn hàng trên POS → Bấm "Thanh toán"
  → Chọn phương thức thanh toán → Chọn "Ví khách hàng"
  → Hệ thống kiểm tra: ví có đủ số dư không?
    → Đủ: dùng toàn bộ ví, ví còn lại = số dư cũ - tổng giao dịch
      → Thanh toán hoàn tất
    → Không đủ: dùng toàn bộ ví + yêu cầu nhập thêm phương thức khác
      → Hiển thị: số tiền từ ví, số tiền còn phải trả
      → Chọn phương thức thanh toán cho phần còn lại
      → (Split payment: lặp lại nếu cần nhiều phương thức)
      → Thanh toán hoàn tất
  → Ghi lịch sử: số tiền từ ví, phương thức khác, tổng giao dịch, ví còn lại
  → In hóa đơn (ghi rõ: số tiền từ ví + phương thức khác nếu có)
```

### Tạo chương trình khuyến mãi nạp ví
```
Owner / Manager → Quản lý ví → Chương trình KM nạp ví → Tạo mới
  → Chọn loại: % cố định / theo tầng
  → Nhập thông tin: tên, mô tả, quy tắc %
  → Cấu hình điều kiện: thời gian, cửa hàng, phương thức nạp, KH tương ưu
  → Cấu hình giới hạn sử dụng: số lần, limit/KH, limit/ngày
  → Đặt trạng thái: Bật ngay / Lên lịch
  → Xác nhận → KM xuất hiện trên hệ thống
```

### Điều chỉnh số dư ví thủ công
```
Owner / Manager → Quản lý ví → Chọn khách hàng
  → Bấm "Điều chỉnh số dư"
  → Chọn: cộng / trừ
  → Nhập số tiền
  → Nhập lý do (bắt buộc)
  → Nhập ghi chú (tùy chọn)
  → Xác nhận
  → Ghi log audit: người điều chỉnh, thời gian, lý do, số tiền, số dư trước/sau
```

## Gợi ý UI/UX

- **Thanh tìm kiếm KH trên POS:** nhỏ gọn, tìm kiếm nhanh theo SĐT
- **Thẻ thông tin ví:** card hiển thị SĐT KH, tên, số dư hiện tại (chữ to), trạng thái ví (badge), ngày cập nhật
- **Màn hình nạp ví:** form đơn giản, nhập số tiền → hiển thị ngay % bonus (nếu có) + tổng cộng
- **Chọn phương thức nạp:** button/card lớn (tiền mặt / QR / thẻ)
- **QR nạp:** QR to giữa màn hình, kèm hướng dẫn, có countdown timeout
- **Màn hình thanh toán:** hiển thị rõ "Thanh toán bằng ví", số tiền từ ví, số dư sau khi thanh toán
- **Split payment ví:** progress bar hiển thị: [Ví: 200k] → [Còn phải: 100k] → [Tiền mặt: 100k]
- **Lịch sử ví:** timeline dọc hoặc bảng, mỗi entry ghi: loại (nạp/dùng), số tiền, thời gian, phương thức, chương trình KM (nếu có)
- **Báo cáo ví:** biểu đồ doanh thu nạp theo thời gian, số lần dùng, tiền bonus
- **Chương trình KM:** card với tên, % bonus, thời gian, trạng thái (badge), giới hạn sử dụng còn

## Quy tắc nghiệp vụ

1. Mỗi khách hàng có **1 ví duy nhất**, liên kết với số điện thoại (định danh chính)
2. Ví được tạo tự động khi KH lần đầu nạp tiền (không cần tạo thủ công trước)
3. Số dư ví **không có hạn mức tối đa** — khách hàng có thể nạp bao nhiêu tùy ý
4. Số dư ví **lưu trữ vĩnh viễn** — không có ngày hết hạn, không bị xóa tự động
5. Khi thanh toán bằng ví, **phải dùng toàn bộ số dư hiện có** trong giao dịch đó
6. Split payment: khi ví không đủ, khách phải thanh toán phần còn lại bằng phương thức khác (ví: ví 200k + tiền mặt 100k)
7. Hoàn trả giao dịch: số tiền hoàn **cộng lại vào ví** của khách hàng
8. Chương trình KM nạp ví được áp dụng **tự động** nếu đủ điều kiện (hệ thống kiểm tra tất cả chương trình đang hoạt động)
9. Nếu có nhiều chương trình KM áp dụng được → chọn chương trình cho **% bonus cao nhất**
10. Voucher / Mã giảm giá (Spec 09) **không áp dụng cho nạp ví** — chỉ dùng cho thanh toán giao dịch
11. Thanh toán bằng ví của hạng thành viên (Gold/Platinum) **không được cộng bonus loyalty** khi thanh toán — chỉ khi nạp ví
12. Nạp ví là giao dịch riêng, **không sinh điểm loyalty** (nạp ví ≠ mua hàng)
13. Lịch sử nạp/dùng ví là **bất biến**, không thể xóa hoặc sửa (chỉ có ghi log điều chỉnh thủ công)
14. Khi ví KH bị khóa, không thể thanh toán bằng ví, nhưng vẫn có thể nạp tiền (do Owner/Manager tạo)
15. Mỗi giao dịch nạp/thanh toán bằng ví **ghi nhận vào ca làm việc** của nhân viên xử lý (liên kết với Spec 06)
16. Audit log: ghi đầy đủ tất cả nạp/dùng ví, điều chỉnh thủ công, bật/tắt chương trình KM (liên kết với Spec 01)

## Trạng thái ví

```
[Tạo mới] → Hoạt động ←→ Bị khóa (Owner/Manager khóa)
              ↓
           Đã xóa (soft delete)
```

## Trạng thái chương trình khuyến mãi nạp ví

```
[Tạo mới] → Lên lịch (chờ ngày bắt đầu) → Đang hoạt động → Đã kết thúc
                                               ↓
                                          Tạm dừng (Owner/Manager tắt)
                                               ↓
                                          Đang hoạt động (bật lại)
```

## Liên kết với các Spec khác

- **Spec 01 (Đăng nhập & Phân quyền):** Ghi log audit tất cả nạp/dùng ví, điều chỉnh thủ công
- **Spec 05 (Thanh toán):** Ví là phương thức thanh toán bổ sung; hỗ trợ split payment
- **Spec 06 (Ca làm việc):** Nạp/thanh toán ví ghi nhận vào ca làm việc hiện tại
- **Spec 08 (Khách hàng & Loyalty):** Ví là tính năng bổ sung cho KH; không sinh điểm loyalty
- **Spec 09 (Khuyến mãi):** Chương trình KM nạp ví là loại KM riêng biệt; không kết hợp với voucher

## Mở rộng trong tương lai

- Ứng dụng mobile KH xem số dư ví, lịch sử nạp/dùng
- Tích hợp thanh toán ví từ NFC / QR code khách quét
- Chuyển tiền ví giữa các KH (ví dụ: quà tặng ví)
- Ví tích hợp CQRS/event sourcing cho transaction history toàn cầu
- Thăng hạng ví dựa trên tổng tiền nạp (ví silver/gold/platinum tương tự loyalty)
