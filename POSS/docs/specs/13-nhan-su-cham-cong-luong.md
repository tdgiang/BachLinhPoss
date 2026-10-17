# 13 - Nhân sự, ca kíp, chấm công & lương thưởng

## Mô tả

Quản lý nhân viên theo cửa hàng: xếp lịch ca kíp theo tuần, chấm công vào/ra ca, tổng hợp bảng công và tính lương, thưởng, phạt hàng tháng. Khác với Spec 06 (ca thu ngân — két tiền), module này quản lý **ca làm việc của con người** và tiền lương.

Đối tượng tính lương: tài khoản Manager và Staff (Owner không nằm trong bảng lương).

## Phân quyền

| Tính năng | Owner | Manager | Staff |
|-----------|:-----:|:-------:|:-----:|
| Xem hồ sơ & mức lương nhân viên | x | x | x (chỉ mình) |
| Sửa mức lương, loại lương, phụ cấp | x | | |
| Xếp ca / sao chép lịch tuần | x | x | |
| Xem lịch ca cửa hàng | x | x | x |
| Chấm công vào/ra ca của bản thân | | x | x |
| Sửa chấm công / bù công (bắt buộc lý do) | x | x (không sửa của chính mình) | |
| Thêm/xóa thưởng, phạt | x | x | |
| Xem bảng lương | x | x | x (chỉ phiếu lương của mình) |
| Chốt bảng lương tháng | x | x | |
| Đánh dấu đã trả lương / mở lại bảng lương | x | | |

## Tính năng chi tiết

### 1. Ca mẫu
| Mã | Tên | Giờ |
|----|-----|-----|
| SANG | Ca sáng | 07:00 – 12:00 |
| CHIEU | Ca chiều | 12:00 – 17:30 |
| TOI | Ca tối | 17:30 – 23:00 |

Một nhân viên có thể làm nhiều ca trong ngày (các ca không chồng giờ).

### 2. Xếp ca
- Lưới tuần (Thứ 2 → Chủ nhật) × nhân viên của cửa hàng đang chọn
- Bấm vào ô ca để bật/tắt phân công
- Không sửa lịch của ngày đã qua, không sửa lịch thuộc tháng đã chốt lương
- "Sao chép tuần trước": chép phân công của tuần trước sang các ngày chưa qua của tuần đang xem
- Hiển thị tổng số người mỗi ca mỗi ngày

### 3. Chấm công
- Nhân viên chấm công **vào ca** từ 30 phút trước giờ bắt đầu đến khi ca kết thúc; chỉ chấm được ca có trong lịch hôm nay
- Chấm công **ra ca** sau khi đã vào ca
- Trạng thái mỗi ca đã xếp:
  - **Đúng giờ:** vào trễ ≤ 5 phút (thời gian ân hạn)
  - **Đi muộn:** vào trễ > 5 phút
  - **Về sớm:** ra sớm > 5 phút so với giờ kết thúc
  - **Đang làm:** đã vào, chưa ra
  - **Vắng:** ca đã kết thúc mà không có chấm công
  - **Nghỉ có phép:** Manager/Owner ghi nhận — không tính công, không phạt
- Sửa chấm công / bù công: Manager/Owner nhập giờ vào, giờ ra và **lý do bắt buộc**; bản ghi lưu người sửa + lý do và ghi audit log

### 4. Hồ sơ lương
- Loại lương:
  - **Theo giờ:** lương = tổng giờ làm thực tế × đơn giá giờ
  - **Theo tháng:** lương = lương tháng ÷ 26 ngày công chuẩn × số ngày có đi làm
- Phụ cấp theo ca (ăn ca, gửi xe): cộng cho mỗi ca có chấm công

### 5. Thưởng / phạt
- **Phạt đi muộn tự động:** 20.000đ / lần đi muộn
- **Thưởng / phạt thủ công:** số tiền + lý do bắt buộc, gắn với nhân viên và tháng
- Chỉ thêm/xóa khi bảng lương tháng chưa chốt

### 6. Bảng lương tháng
- Mỗi nhân viên: số ca, giờ công, ngày công, lương cơ bản, phụ cấp, thưởng, phạt, **thực lĩnh** = lương cơ bản + phụ cấp + thưởng − phạt (tối thiểu 0)
- Trạng thái bảng lương theo cửa hàng × tháng: **Nháp → Đã chốt → Đã trả**
  - Đã chốt: khóa xếp ca, chấm công, thưởng/phạt của tháng đó
  - Owner có thể mở lại bảng lương đã chốt (chưa trả)
- Phiếu lương chi tiết từng nhân viên

### 7. Audit log
Ghi nhận: chấm công vào/ra, sửa chấm công, ghi nhận nghỉ phép, thêm/xóa thưởng phạt, sửa hồ sơ lương, chốt/mở lại/trả lương.

## Luồng xử lý chính

### Chấm công
```
Nhân viên đăng nhập PIN → 13. Nhân sự & Lương → tab Chấm công
  → Thấy các ca hôm nay của mình
  → Bấm "Vào ca" (trong khung giờ cho phép) → ghi giờ vào, tính đúng giờ / đi muộn
  → Cuối ca bấm "Ra ca" → ghi giờ ra, tính giờ công
```

### Chốt lương
```
Manager vào tab Lương & Thưởng → chọn tháng
  → Kiểm tra bảng công, thêm thưởng/phạt
  → "Chốt bảng lương" → khóa dữ liệu tháng
  → Owner "Đánh dấu đã trả" → bảng lương hoàn tất
```
