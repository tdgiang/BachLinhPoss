# 10 - Báo cáo & Thống kê

## Mô tả

Cung cấp báo cáo doanh thu, phân tích sản phẩm, hiệu suất cửa hàng, và các chỉ số kinh doanh quan trọng. Hỗ trợ lọc theo thời gian, cửa hàng, và xuất báo cáo.

## Phân quyền

| Tính năng | Owner | Manager | Staff |
|-----------|:-----:|:-------:|:-----:|
| Báo cáo toàn chuỗi | x | | |
| Báo cáo cửa hàng | x | x (cửa hàng mình) | |
| Báo cáo ca làm việc | x | x | x (chỉ ca mình) |
| So sánh giữa cửa hàng | x | | |
| Xuất báo cáo (PDF/Excel) | x | x | |
| Cấu hình báo cáo tự động | x | | |

## Tính năng chi tiết

### 1. Báo cáo doanh thu

#### Tổng quan
- Doanh thu theo: hôm nay, tuần này, tháng này, tùy chọn khoảng thời gian
- Biểu đồ doanh thu theo ngày/tuần/tháng (dạng line chart)
- So sánh với kỳ trước (ví dụ: tháng này vs tháng trước)
- Tổng doanh thu, số đơn hàng, giá trị trung bình/đơn

#### Chi tiết theo phương thức thanh toán
- Bảng: tiền mặt, chuyển khoản, ví điện tử, thẻ — số tiền + tỷ lệ %
- Biểu đồ tròn tỷ lệ phương thức thanh toán

#### Chi tiết theo khung giờ
- Doanh thu theo từng giờ trong ngày → xác định giờ cao điểm
- Biểu đồ cột doanh thu theo giờ

### 2. Báo cáo sản phẩm
- **Top sản phẩm bán chạy:** xếp hạng theo số lượng bán hoặc doanh thu
- **Sản phẩm bán chậm:** dưới ngưỡng trong khoảng thời gian
- **Phân tích danh mục:** doanh thu + tỷ lệ % từng danh mục (biểu đồ tròn)
- **Topping phổ biến:** top topping được chọn nhiều nhất
- **Size phổ biến:** tỷ lệ S/M/L/XL

### 3. Báo cáo cửa hàng (Owner)
- **So sánh cửa hàng:** bảng xếp hạng theo doanh thu, số đơn, giá trị TB/đơn
- **Biểu đồ so sánh:** bar chart doanh thu từng cửa hàng
- **Xu hướng:** tăng trưởng/sụt giảm từng cửa hàng theo thời gian
- **Hiệu suất nhân viên:** doanh thu/đơn hàng theo từng nhân viên tại cửa hàng

### 4. Báo cáo khách hàng & Loyalty
- Số KH mới theo thời gian
- Phân bố hạng thành viên (biểu đồ tròn Silver/Gold/Platinum)
- Tỷ lệ khách quay lại (returning customer rate)
- Top KH chi tiêu nhiều nhất
- Điểm tích/tiêu tổng hợp

### 5. Báo cáo khuyến mãi
- Danh sách KM đã chạy + số lần sử dụng + tổng giá trị giảm
- Doanh thu có KM vs không KM
- Hiệu quả từng KM: số đơn kéo thêm, doanh thu tăng thêm ước tính

### 6. Báo cáo tồn kho
- Sản phẩm sắp hết / đã hết
- Lịch sử nhập/xuất theo thời gian
- Giá trị tồn kho hiện tại (số lượng × giá bán)

### 7. Xuất báo cáo
- Xuất PDF (để in hoặc gửi email)
- Xuất Excel (để phân tích thêm)
- Báo cáo tự động: Owner cấu hình gửi email hàng ngày/tuần/tháng

## Luồng xử lý chính

### Xem báo cáo
```
Vào Báo cáo → Chọn loại báo cáo
  → Chọn khoảng thời gian (nhanh: hôm nay/tuần/tháng, hoặc tùy chọn)
  → (Owner) Chọn cửa hàng hoặc toàn chuỗi
  → Hiển thị dashboard với biểu đồ + bảng số liệu
  → (Tùy chọn) Xuất PDF/Excel
```

### Cấu hình báo cáo tự động
```
Owner vào Cài đặt báo cáo → Bật báo cáo tự động
  → Chọn tần suất: hàng ngày (cuối ngày), hàng tuần (thứ 2), hàng tháng (ngày 1)
  → Chọn loại báo cáo gửi
  → Nhập email nhận
  → Lưu → Hệ thống tự gửi theo lịch
```

## Gợi ý UI/UX

- Dashboard: layout dạng grid, mỗi ô là 1 metric card (tổng DT, số đơn, TB/đơn, KH mới)
- Biểu đồ: interactive — tap vào điểm dữ liệu để xem chi tiết
- Bộ lọc thời gian: chip buttons (Hôm nay / 7 ngày / 30 ngày / Tùy chọn) ở đầu trang
- Tab cho từng loại báo cáo: Doanh thu / Sản phẩm / Cửa hàng / KH / KM / Kho
- So sánh kỳ trước: hiển thị bằng arrow + % tăng/giảm (xanh lên, đỏ xuống)
- Responsive: trên phone hiển thị metric cards dạng scroll ngang, biểu đồ full width

## Quy tắc nghiệp vụ

1. Dữ liệu báo cáo là read-only — không thể chỉnh sửa từ màn hình báo cáo
2. Báo cáo doanh thu tính theo thời gian thanh toán, không phải thời gian tạo đơn
3. Đơn hủy không tính vào doanh thu. Đơn hoàn trả hiển thị riêng (trừ khỏi doanh thu ròng)
4. Manager chỉ xem được báo cáo cửa hàng được gán, không xem cửa hàng khác
5. Báo cáo tự động gửi vào thời điểm cố định (ví dụ: 23:59 cho báo cáo ngày)
6. Dữ liệu realtime cho báo cáo trong ngày, dữ liệu tổng hợp (aggregated) cho kỳ dài hơn
7. Xuất Excel giới hạn tối đa 10.000 dòng / lần xuất
