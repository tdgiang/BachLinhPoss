# 04 - Màn hình bán hàng (POS)

## Mô tả

Màn hình chính để nhân viên thao tác bán hàng: chọn sản phẩm, tùy chỉnh (size, topping, ghi chú), tạo đơn hàng, áp dụng khuyến mãi, và chuyển sang thanh toán. Đây là màn hình được sử dụng nhiều nhất, cần tối ưu tốc độ thao tác.

## Phân quyền

| Tính năng | Owner | Manager | Staff |
|-----------|:-----:|:-------:|:-----:|
| Tạo đơn hàng | x | x | x |
| Sửa đơn hàng (chưa thanh toán) | x | x | x |
| Hủy đơn hàng | x | x | x (cần lý do) |
| Áp dụng giảm giá thủ công | x | x | |
| Xem danh sách đơn hàng | x | x | x (chỉ ca mình) |
| Hoàn trả đơn hàng | x | x | |

## Tính năng chi tiết

### 1. Chọn sản phẩm
- Hiển thị menu theo danh mục (tab ngang phía trên)
- Grid sản phẩm với hình ảnh, tên, giá
- Tìm kiếm sản phẩm theo tên (thanh search)
- Sản phẩm tạm hết hiển thị mờ, không chọn được
- Tap 1 lần để thêm vào đơn (size mặc định), tap giữ để chọn size/topping

### 2. Tùy chỉnh sản phẩm
- Chọn size (S/M/L/XL) — giá tự cập nhật
- Chọn topping (multi-select) — giá cộng dồn
- Chọn mức đường: 100% / 70% / 50% / 30% / 0%
- Chọn mức đá: 100% / 70% / 50% / 30% / 0% (không đá)
- Ghi chú riêng cho từng món (ví dụ: "ít đá, thêm sữa")
- Số lượng (tăng/giảm hoặc nhập trực tiếp)

### 3. Giỏ hàng (đơn hàng đang tạo)
- Hiển thị bên phải màn hình (tablet) hoặc slide-up panel (phone)
- Mỗi dòng: tên sản phẩm, size, topping, số lượng, thành tiền
- Vuốt trái để xóa item
- Tap vào item để sửa tùy chỉnh
- Tổng tiền cập nhật realtime
- Hiển thị: tạm tính, giảm giá (nếu có), thuế, tổng cộng

### 4. Loại đơn hàng
- **Tại chỗ (Dine-in):** Chọn số bàn
- **Mang đi (Take-away):** Không cần bàn
- Mặc định là Mang đi, có thể chuyển bất cứ lúc nào trước thanh toán

### 5. Áp dụng ưu đãi
- Nhập mã voucher
- Quét thẻ thành viên (nhập SĐT khách hàng) → hiển thị hạng + điểm
- Hệ thống tự đề xuất khuyến mãi đang áp dụng được
- Cho phép chọn/bỏ chọn từng khuyến mãi
- Giảm giá thủ công (% hoặc số tiền cố định) — chỉ Manager/Owner, yêu cầu nhập lý do

### 6. Danh sách đơn hàng
- Tab: Chờ xử lý / Đang pha chế / Hoàn thành / Đã hủy
- Lọc theo: thời gian, loại đơn (tại chỗ/mang đi), trạng thái
- Xem chi tiết từng đơn
- In lại hóa đơn

### 7. Hoàn trả (Refund)
- Chỉ Manager/Owner thực hiện
- Chọn đơn hàng đã thanh toán → Chọn sản phẩm cần hoàn (toàn bộ hoặc từng phần)
- Bắt buộc nhập lý do hoàn trả
- Phương thức hoàn: tiền mặt hoặc ghi nhận công nợ
- Ghi nhận vào báo cáo ca và báo cáo doanh thu

## Luồng xử lý chính

### Tạo đơn hàng
```
Mở POS → Chọn loại đơn (tại chỗ/mang đi)
  → (Tại chỗ) Chọn bàn
  → Chọn sản phẩm → Tùy chỉnh size/topping/đường/đá
  → Thêm vào giỏ → Tiếp tục chọn hoặc xong
  → (Tùy chọn) Quét thẻ KH / nhập voucher
  → Xem tổng → Chuyển sang Thanh toán
```

### Hủy đơn hàng
```
Chọn đơn chưa thanh toán → Hủy đơn
  → Staff: bắt buộc nhập lý do
  → Xác nhận hủy → Đơn chuyển sang trạng thái "Đã hủy"
  → Ghi log hủy đơn (ai, lúc nào, lý do)
```

### Hoàn trả
```
Manager/Owner vào Danh sách đơn → Chọn đơn đã thanh toán → Hoàn trả
  → Chọn sản phẩm hoàn (toàn bộ hoặc từng item)
  → Nhập lý do → Chọn phương thức hoàn tiền
  → Xác nhận → Cập nhật kho + doanh thu + điểm loyalty (nếu có)
```

## Gợi ý UI/UX

- **Layout tablet:** 2 phần — trái là menu grid, phải là giỏ hàng. Tỷ lệ 60/40
- **Layout phone:** menu grid full screen, giỏ hàng slide-up từ dưới, badge số lượng
- Nút thanh toán lớn, nổi bật ở cuối giỏ hàng
- Danh mục: tab ngang, cuộn được, icon + text
- Sản phẩm: card vuông, ảnh chiếm 60%, tên + giá phía dưới
- Popup tùy chỉnh: bottom sheet với các option dạng chip
- Hiệu ứng khi thêm vào giỏ: animation nhẹ để feedback thao tác
- Tối ưu cho thao tác 1 tay (phone) và 2 tay (tablet)

## Quy tắc nghiệp vụ

1. Không thể tạo đơn hàng khi chưa mở ca làm việc
2. Không thể tạo đơn rỗng (phải có ít nhất 1 sản phẩm)
3. Đơn hàng chưa thanh toán có thể sửa thoải mái, đã thanh toán chỉ có thể hoàn trả
4. Hủy đơn đã thanh toán = hoàn trả, không phải hủy
5. Giảm giá thủ công luôn ghi log kèm lý do và người thực hiện
6. Đơn "Tại chỗ" bắt buộc chọn bàn, số bàn phải thuộc cửa hàng hiện tại
7. Mã đơn hàng tự sinh: `{MÃ_CỬA_HÀNG}-{YYYYMMDD}-{SỐ_THỨ_TỰ}` (ví dụ: POSS001-20261013-0042)
8. Hoàn trả trừ điểm loyalty tương ứng (nếu đơn gốc đã tích điểm)

## Trạng thái đơn hàng

```
[Tạo mới] → Chờ xử lý → Đang pha chế → Hoàn thành
               ↓                            ↓
           Đã hủy                    Hoàn trả (toàn bộ/một phần)
```
