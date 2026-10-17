# 03 - Quản lý menu & sản phẩm

## Mô tả

Quản lý toàn bộ danh mục và sản phẩm bán tại cửa hàng: cafe, trà sữa, nước ép, bánh ngọt, topping... Hỗ trợ nhiều kích cỡ (size), topping tùy chọn, và giá bán riêng theo từng cửa hàng nếu cần.

## Phân quyền

| Tính năng | Owner | Manager | Staff |
|-----------|:-----:|:-------:|:-----:|
| Tạo/sửa/xóa danh mục | x | x (cửa hàng mình) | |
| Tạo/sửa/xóa sản phẩm | x | x (cửa hàng mình) | |
| Quản lý topping | x | x (cửa hàng mình) | |
| Quản lý size | x | x (cửa hàng mình) | |
| Đặt giá toàn chuỗi | x | | |
| Đặt giá riêng cửa hàng | x | x (cửa hàng mình) | |
| Bật/tắt sản phẩm | x | x | x (tạm hết hàng) |
| Xem menu | x | x | x |

## Tính năng chi tiết

### 1. Danh mục sản phẩm
- Tên danh mục (ví dụ: Cafe, Trà sữa, Nước ép, Bánh ngọt, Khác)
- Hình ảnh đại diện
- Thứ tự hiển thị (kéo thả sắp xếp)
- Trạng thái: Hiển thị / Ẩn

### 2. Sản phẩm
- Tên sản phẩm
- Mã sản phẩm (SKU — tự sinh hoặc nhập tay)
- Hình ảnh (tối đa 3 ảnh)
- Mô tả ngắn
- Danh mục thuộc về
- Giá bán mặc định
- Giá bán theo size (nếu có nhiều size)
- Đơn vị tính (ly, phần, cái...)
- Trạng thái: Đang bán / Tạm hết / Ngừng bán

### 3. Quản lý Size
- Định nghĩa các size cho từng sản phẩm hoặc theo danh mục
- Ví dụ: Size S (nhỏ), M (vừa), L (lớn), XL (extra)
- Mỗi size có giá riêng
- Có thể đặt size mặc định khi hiển thị trên POS

### 4. Quản lý Topping
- Danh sách topping dùng chung (trân châu, thạch, kem cheese, shot espresso...)
- Mỗi topping có: tên, giá bán, hình ảnh (tùy chọn), trạng thái
- Gán topping khả dụng cho từng sản phẩm hoặc danh mục
- Giới hạn số topping tối đa mỗi đơn (tùy chọn)

### 5. Menu theo cửa hàng
- Mặc định: tất cả cửa hàng dùng chung menu chuỗi
- Cho phép cửa hàng ẩn sản phẩm không bán tại điểm đó
- Cho phép đặt giá riêng cho sản phẩm tại cửa hàng cụ thể (ghi đè giá chuỗi)
- Staff có thể đánh dấu "Tạm hết" cho sản phẩm tại cửa hàng mình trong ca

## Luồng xử lý chính

### Thêm sản phẩm mới
```
Vào Quản lý menu → Chọn danh mục → Thêm sản phẩm
  → Nhập tên, mô tả, ảnh → Đặt size + giá từng size
  → Chọn topping khả dụng → Chọn trạng thái ban đầu
  → Lưu → Sản phẩm xuất hiện trên POS tất cả cửa hàng (hoặc cửa hàng được chọn)
```

### Staff đánh dấu tạm hết
```
Trên màn hình POS → Nhấn giữ sản phẩm → Chọn "Tạm hết hàng"
  → Sản phẩm bị mờ trên POS cửa hàng đó
  → Tự động khôi phục khi mở ca mới (hoặc Manager bật lại thủ công)
```

## Gợi ý UI/UX

- Quản lý menu: grid view với ảnh sản phẩm, kéo thả sắp xếp
- Thêm/sửa sản phẩm: form dạng cuộn, preview sản phẩm bên cạnh
- Size: hiển thị dạng chip/tag có thể chọn, kèm giá bên cạnh
- Topping: checkbox list với giá, có thể tìm kiếm
- Sản phẩm tạm hết: overlay mờ + badge "Hết hàng" trên POS

## Quy tắc nghiệp vụ

1. Mã sản phẩm (SKU) là duy nhất trong toàn hệ thống
2. Không thể xóa sản phẩm đã có trong đơn hàng — chỉ có thể chuyển sang "Ngừng bán"
3. Sản phẩm "Ngừng bán" không hiển thị trên POS nhưng vẫn xuất hiện trong báo cáo lịch sử
4. Thay đổi giá không ảnh hưởng đến các đơn hàng đã tạo trước đó
5. "Tạm hết" chỉ áp dụng cho cửa hàng hiện tại, không ảnh hưởng cửa hàng khác
6. Khi Owner thay đổi giá chuỗi, cửa hàng có giá riêng sẽ không bị ghi đè (giữ giá riêng)

## Trạng thái sản phẩm

```
[Tạo mới] → Đang bán ←→ Tạm hết (tự động reset đầu ca mới)
               ↓
           Ngừng bán (soft delete, không hiện trên POS)
```
