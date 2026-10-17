# 09 - Quản lý khuyến mãi

## Mô tả

Tạo và quản lý các chương trình khuyến mãi: giảm giá trực tiếp, voucher, combo, mua X tặng Y. Hỗ trợ cấu hình điều kiện áp dụng chi tiết và giới hạn sử dụng.

## Phân quyền

| Tính năng | Owner | Manager | Staff |
|-----------|:-----:|:-------:|:-----:|
| Tạo khuyến mãi | x | | |
| Sửa/xóa khuyến mãi | x | | |
| Bật/tắt khuyến mãi | x | x (cửa hàng mình) | |
| Áp dụng KM vào đơn hàng | x | x | x (tự động + nhập mã) |
| Xem danh sách KM | x | x | x (chỉ KM đang hoạt động) |
| Xem báo cáo KM | x | x | |
| Tạo/phát voucher | x | x | |

## Tính năng chi tiết

### 1. Loại khuyến mãi

#### Giảm giá trực tiếp
- Giảm % trên tổng đơn (ví dụ: giảm 10% toàn đơn)
- Giảm số tiền cố định (ví dụ: giảm 20.000đ)
- Giảm % trên sản phẩm cụ thể hoặc danh mục cụ thể

#### Voucher / Mã giảm giá
- Mã voucher (do hệ thống sinh hoặc Owner tự nhập)
- Giá trị: giảm % hoặc giảm số tiền cố định
- Số lượng voucher phát hành
- Mỗi voucher dùng 1 lần hoặc nhiều lần (cấu hình)

#### Combo
- Gộp nhiều sản phẩm thành 1 combo với giá đặc biệt
- Ví dụ: Cafe + Bánh = 55.000đ (thay vì 65.000đ)
- Combo hiển thị như 1 sản phẩm trên POS

#### Mua X tặng Y
- Ví dụ: Mua 2 tặng 1 (cùng loại hoặc khác loại)
- Sản phẩm tặng tự động thêm vào đơn khi đủ điều kiện

### 2. Điều kiện áp dụng
- **Thời gian:** Ngày bắt đầu → ngày kết thúc, khung giờ (ví dụ: 14:00-17:00 happy hour)
- **Đơn hàng tối thiểu:** Tổng đơn >= X đồng
- **Sản phẩm/danh mục:** Chỉ áp dụng cho sản phẩm hoặc danh mục cụ thể
- **Cửa hàng:** Áp dụng toàn chuỗi hoặc chỉ cửa hàng cụ thể
- **Khách hàng:** Tất cả KH, chỉ thành viên, chỉ hạng cụ thể (Gold/Platinum)
- **Số lần sử dụng:** Giới hạn tổng (ví dụ: 100 lần) và giới hạn mỗi KH (ví dụ: 1 lần/KH)
- **Ngày trong tuần:** Chỉ thứ 2-6, chỉ cuối tuần, hoặc ngày cụ thể

### 3. Giới hạn kết hợp
- Cấu hình KM nào có thể dùng cùng nhau, KM nào loại trừ nhau
- Mặc định: chỉ áp dụng 1 KM/đơn (Owner có thể cho phép kết hợp)
- Ưu đãi loyalty (giảm giá theo hạng) được phép cộng dồn với KM khác

### 4. Quản lý voucher
- Sinh hàng loạt voucher (batch) với prefix tùy chỉnh
- Xuất danh sách voucher (CSV) để phát cho KH
- Theo dõi trạng thái từng voucher: Chưa dùng / Đã dùng / Hết hạn
- Vô hiệu hóa voucher cụ thể

## Luồng xử lý chính

### Tạo khuyến mãi
```
Owner vào Quản lý KM → Tạo mới → Chọn loại KM
  → Nhập thông tin: tên, mô tả, giá trị giảm
  → Cấu hình điều kiện áp dụng
  → Cấu hình giới hạn sử dụng
  → Chọn cửa hàng áp dụng
  → Đặt trạng thái (Bật ngay / Lên lịch)
  → Xác nhận → KM xuất hiện trên hệ thống
```

### Áp dụng KM khi bán hàng
```
Staff tạo đơn hàng trên POS
  → Hệ thống kiểm tra tự động: đơn thỏa điều kiện KM nào?
  → Hiển thị danh sách KM khả dụng → Staff chọn áp dụng
  → HOẶC: KH cung cấp mã voucher → Staff nhập mã
    → Hợp lệ → Áp dụng giảm giá → Cập nhật tổng đơn
    → Không hợp lệ → Thông báo lý do (hết hạn/đã dùng/không đủ điều kiện)
  → Hóa đơn ghi rõ KM đã áp dụng + số tiền giảm
```

## Gợi ý UI/UX

- Danh sách KM: card với banner hình ảnh, tên KM, thời gian, trạng thái (badge màu)
- Tạo KM: wizard nhiều bước (Loại → Chi tiết → Điều kiện → Xác nhận)
- Trên POS: KM tự động đề xuất hiện dạng banner nhỏ phía trên giỏ hàng, tap để áp dụng
- Nhập voucher: input + nút "Áp dụng", feedback ngay lập tức (check xanh / X đỏ)
- Báo cáo KM: biểu đồ số lần sử dụng theo thời gian, doanh thu có/không KM

## Quy tắc nghiệp vụ

1. KM hết hạn tự động chuyển sang trạng thái "Đã kết thúc", không áp dụng được nữa
2. Không thể sửa KM đang hoạt động nếu đã có lượt sử dụng — phải tạo KM mới
3. Voucher đã dùng không thể dùng lại (nếu cấu hình 1 lần)
4. Giảm giá không được vượt quá tổng đơn hàng (tối thiểu thanh toán = 0đ)
5. Hoàn trả đơn có KM → hoàn theo giá đã giảm (không hoàn giá gốc)
6. Voucher của đơn hoàn trả: Owner quyết định có phát lại voucher không
7. Combo bán = 1 đơn vị trên POS, kho trừ từng sản phẩm thành phần
8. Một đơn hàng áp dụng tối đa 1 voucher + 1 KM tự động (trừ khi Owner cho phép kết hợp)

## Trạng thái khuyến mãi

```
[Tạo mới] → Lên lịch (chờ ngày bắt đầu) → Đang hoạt động → Đã kết thúc
                                                ↓
                                          Tạm dừng (Manager/Owner tắt)
                                                ↓
                                          Đang hoạt động (bật lại)
```

## Trạng thái voucher

```
[Phát hành] → Chưa dùng → Đã dùng
                  ↓
              Hết hạn
                  ↓
            Vô hiệu hóa (Owner hủy)
```
