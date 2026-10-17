# 07 - Quản lý kho

## Mô tả

Quản lý tồn kho ở mức sản phẩm hoàn chỉnh (ly cafe, phần bánh...) — không quản lý nguyên liệu thô. Theo dõi nhập/xuất kho, cảnh báo hết hàng, và hỗ trợ kiểm kê định kỳ. Mỗi cửa hàng có kho riêng.

## Phân quyền

| Tính năng | Owner | Manager | Staff |
|-----------|:-----:|:-------:|:-----:|
| Xem tồn kho | x | x | x (cửa hàng mình) |
| Nhập kho | x | x | |
| Xuất kho (điều chỉnh) | x | x | |
| Chuyển kho giữa cửa hàng | x | | |
| Tạo phiếu kiểm kê | x | x | |
| Thực hiện kiểm kê | x | x | x |
| Cấu hình cảnh báo tồn kho | x | x | |
| Xem lịch sử kho | x | x | |

## Tính năng chi tiết

### 1. Tồn kho sản phẩm
- Mỗi sản phẩm có số lượng tồn kho tại mỗi cửa hàng
- Hiển thị: tên sản phẩm, SKU, tồn hiện tại, ngưỡng cảnh báo, trạng thái (đủ/sắp hết/hết)
- Tìm kiếm, lọc theo danh mục, trạng thái tồn kho
- Tự động trừ kho khi đơn hàng hoàn thành
- Tự động cộng lại kho khi hoàn trả

### 2. Nhập kho
- Tạo phiếu nhập kho: ngày nhập, người nhập, ghi chú
- Chi tiết phiếu: danh sách sản phẩm + số lượng nhập
- Nhập từ nhà cung cấp hoặc nhập điều chỉnh (kiểm kê phát hiện thừa)
- Sau khi xác nhận → cập nhật số lượng tồn

### 3. Xuất kho
- Tạo phiếu xuất kho: ngày xuất, người xuất, lý do, ghi chú
- Lý do xuất: hỏng/hết hạn, sử dụng nội bộ, mất mát, điều chỉnh giảm
- Chi tiết phiếu: danh sách sản phẩm + số lượng xuất
- Sau khi xác nhận → trừ số lượng tồn

### 4. Chuyển kho giữa cửa hàng
- Chỉ Owner thực hiện
- Tạo phiếu chuyển: cửa hàng nguồn → cửa hàng đích
- Danh sách sản phẩm + số lượng chuyển
- Trạng thái: Chờ xác nhận → Đang chuyển → Đã nhận
- Cửa hàng đích xác nhận nhận hàng → cập nhật tồn kho cả 2 bên

### 5. Kiểm kê
- Tạo phiếu kiểm kê cho 1 cửa hàng (toàn bộ hoặc theo danh mục)
- Staff/Manager nhập số lượng thực tế đếm được
- Hệ thống so sánh: thực tế vs hệ thống → hiển thị chênh lệch
- Xác nhận kiểm kê → tự động tạo phiếu nhập/xuất điều chỉnh

### 6. Cảnh báo tồn kho
- Đặt ngưỡng tối thiểu cho từng sản phẩm tại mỗi cửa hàng
- Khi tồn kho <= ngưỡng → cảnh báo "Sắp hết"
- Khi tồn kho = 0 → cảnh báo "Hết hàng" + tự động đánh dấu sản phẩm "Tạm hết" trên POS
- Thông báo push cho Manager khi có sản phẩm đạt ngưỡng cảnh báo

## Luồng xử lý chính

### Nhập kho
```
Manager vào Quản lý kho → Nhập kho → Tạo phiếu mới
  → Chọn sản phẩm + nhập số lượng (có thể thêm nhiều dòng)
  → Nhập ghi chú (nhà cung cấp, lô hàng...)
  → Xác nhận → Cập nhật tồn kho → Cập nhật trạng thái sản phẩm trên POS
```

### Tự động trừ kho khi bán
```
Đơn hàng thanh toán thành công
  → Với mỗi sản phẩm trong đơn: tồn kho -= số lượng
  → Kiểm tra ngưỡng cảnh báo
    → Đạt ngưỡng → Push thông báo cho Manager
    → Hết hàng → Đánh dấu "Tạm hết" trên POS
```

### Kiểm kê
```
Manager tạo phiếu kiểm kê → Chọn phạm vi (toàn bộ/danh mục)
  → Hệ thống tạo danh sách sản phẩm cần đếm
  → Staff/Manager nhập số lượng thực tế từng sản phẩm
  → Xem bảng chênh lệch → Xác nhận
  → Tự động tạo phiếu điều chỉnh (nhập thừa / xuất thiếu)
  → Cập nhật tồn kho theo số thực tế
```

## Gợi ý UI/UX

- Danh sách tồn kho: bảng với thanh progress bar cho mức tồn (đỏ/vàng/xanh)
- Nhập/xuất kho: form với bảng sản phẩm, tìm kiếm nhanh, scan barcode (nếu có)
- Kiểm kê: danh sách sản phẩm với ô nhập số bên cạnh, highlight chênh lệch
- Dashboard kho: biểu đồ tồn kho theo danh mục, danh sách sắp hết hàng
- Badge cảnh báo đỏ trên icon Kho khi có sản phẩm đạt ngưỡng

## Quy tắc nghiệp vụ

1. Tồn kho không được âm — nếu bán vượt tồn, cảnh báo nhưng vẫn cho bán (ghi nhận tồn âm để điều chỉnh sau)
2. Mọi thay đổi tồn kho đều có phiếu (nhập/xuất/chuyển/điều chỉnh) và ghi log
3. Phiếu đã xác nhận không thể sửa — phải tạo phiếu điều chỉnh mới
4. Chuyển kho: kho nguồn trừ ngay khi tạo phiếu, kho đích cộng khi xác nhận nhận
5. Sản phẩm không theo dõi tồn kho (ví dụ: dịch vụ) có thể tắt quản lý kho riêng
6. Kiểm kê không ảnh hưởng đến hoạt động bán hàng — POS vẫn hoạt động bình thường trong lúc kiểm kê

## Trạng thái phiếu kho

```
Phiếu nhập/xuất:
  [Tạo] → Đã xác nhận (không thể sửa/xóa)

Phiếu chuyển kho:
  [Tạo] → Chờ xác nhận → Đang chuyển → Đã nhận
                                          ↓
                                      Từ chối (trả lại kho nguồn)

Phiếu kiểm kê:
  [Tạo] → Đang kiểm → Đã hoàn thành (tạo phiếu điều chỉnh tự động)
```
