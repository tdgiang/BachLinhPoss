# 01 - Đăng nhập & Phân quyền

## Mô tả

Chức năng xác thực người dùng và phân quyền truy cập theo 3 cấp: Owner (chủ chuỗi), Manager (quản lý cửa hàng), Staff (nhân viên bán hàng). Đảm bảo mỗi người chỉ thấy và thao tác được những gì thuộc quyền hạn của mình.

## Phân quyền

| Tính năng | Owner | Manager | Staff |
|-----------|:-----:|:-------:|:-----:|
| Đăng nhập | x | x | x |
| Đăng xuất | x | x | x |
| Chuyển đổi nhanh (Quick Switch) | x | x | x |
| Tạo tài khoản Manager | x | | |
| Tạo tài khoản Staff | x | x | |
| Khóa/mở khóa tài khoản | x | x (chỉ Staff) | |
| Đổi mật khẩu bản thân | x | x | x |
| Reset mật khẩu người khác | x | x (chỉ Staff) | |
| Phân công cửa hàng | x | | |
| Xem log hoạt động | x | x (cửa hàng mình) | |

## Tính năng chi tiết

### 1. Đăng nhập
- Đăng nhập bằng số điện thoại + mật khẩu
- Hỗ trợ đăng nhập bằng mã PIN nhanh (4-6 số) cho Staff tại POS
- Ghi nhớ đăng nhập trên thiết bị (tùy chọn)
- Khóa tài khoản sau 5 lần nhập sai liên tiếp (tự mở sau 15 phút)

### 2. Đăng xuất
- Nút đăng xuất rõ ràng trong menu profile/sidebar
- Khi đăng xuất, hệ thống kiểm tra:
  - Có ca làm việc đang mở? → Hiển thị cảnh báo + 2 lựa chọn:
    - **Đóng ca rồi đăng xuất:** chuyển đến luồng đóng ca (kiểm tiền, xác nhận) → đăng xuất
    - **Đăng xuất không đóng ca:** ca vẫn mở, chờ Manager đóng hộ hoặc người đó đăng nhập lại đóng sau
  - Có đơn hàng chưa thanh toán? → Cảnh báo "Bạn có X đơn chưa thanh toán", yêu cầu xử lý hoặc xác nhận bỏ qua
- Sau đăng xuất → quay về màn hình đăng nhập
- Tự động đăng xuất sau 8 giờ không hoạt động

### 3. Chuyển đổi người dùng nhanh (Quick Switch)
- Dùng cho tình huống nhiều Staff chia sẻ chung 1 thiết bị POS tại cửa hàng
- Tap vào avatar/tên người dùng ở header → hiển thị danh sách Staff cùng cửa hàng đã từng đăng nhập trên thiết bị này
- Chọn Staff khác → nhập PIN (không cần nhập SĐT + mật khẩu đầy đủ)
- Xác thực PIN thành công → chuyển sang phiên của người mới ngay lập tức
- Ca làm việc của người cũ: **tạm rời** (không đóng ca), dữ liệu ca vẫn giữ nguyên
- Người mới đăng nhập:
  - Nếu đã có ca mở → tiếp tục ca đó
  - Nếu chưa có ca → bắt buộc mở ca mới
- Nút "Đăng nhập tài khoản khác" ở cuối danh sách → chuyển về màn hình đăng nhập đầy đủ (SĐT + mật khẩu) cho trường hợp Staff chưa từng đăng nhập trên thiết bị

### 4. Quản lý tài khoản
- Thông tin tài khoản: họ tên, số điện thoại, email, avatar, vai trò, cửa hàng được phân công
- Owner tạo Manager → gán vào 1 hoặc nhiều cửa hàng
- Owner/Manager tạo Staff → gán vào cửa hàng cụ thể
- Trạng thái tài khoản: Hoạt động / Tạm khóa / Đã xóa (soft delete)

### 5. Phân quyền theo vai trò
- **Owner:** Toàn quyền trên tất cả cửa hàng. Xem báo cáo tổng hợp toàn chuỗi. Quản lý tài khoản mọi cấp.
- **Manager:** Quản lý hoạt động trong cửa hàng được gán. Tạo/quản lý Staff. Xem báo cáo cửa hàng mình. Không truy cập cửa hàng khác.
- **Staff:** Thao tác bán hàng tại cửa hàng được gán. Xem ca làm việc của mình. Không truy cập quản lý hay báo cáo.

### 6. Nhật ký hoạt động
- Ghi lại mọi hành động quan trọng: đăng nhập, tạo/sửa/xóa đơn hàng, hủy giao dịch, thay đổi giá, mở/đóng ca
- Hiển thị: thời gian, người thực hiện, hành động, chi tiết thay đổi
- Lọc theo: khoảng thời gian, người dùng, loại hành động

## Luồng xử lý chính

### Đăng nhập
```
Mở app → Nhập SĐT + mật khẩu (hoặc PIN) → Xác thực
  → Thành công → Chuyển đến màn hình tương ứng với vai trò
  → Thất bại → Hiển thị lỗi, tăng bộ đếm sai
    → Đủ 5 lần → Khóa tài khoản 15 phút
```

### Đăng xuất
```
Staff bấm "Đăng xuất" → Hệ thống kiểm tra:
  → Có ca đang mở?
    → Có → Hiển thị cảnh báo:
      → "Đóng ca rồi đăng xuất" → Luồng đóng ca → Đăng xuất
      → "Đăng xuất không đóng ca" → Ca vẫn mở (chờ đóng hộ/đăng nhập lại)
    → Không → Tiếp tục
  → Có đơn chưa thanh toán?
    → Có → Cảnh báo → Xác nhận bỏ qua hoặc quay lại xử lý
    → Không → Tiếp tục
  → Đăng xuất → Quay về màn hình đăng nhập
```

### Chuyển đổi nhanh (Quick Switch)
```
Tap avatar/tên ở header → Hiển thị danh sách Staff cùng cửa hàng
  → Chọn Staff khác → Nhập PIN
  → Xác thực thành công:
    → Ca người cũ: tạm rời (không đóng)
    → Người mới có ca mở? 
      → Có → Tiếp tục ca đó → Vào POS
      → Không → Bắt buộc mở ca mới → Vào POS
  → Xác thực thất bại → Thử lại hoặc hủy
  → (Cuối danh sách) "Đăng nhập tài khoản khác" → Màn hình đăng nhập đầy đủ
```

### Tạo tài khoản mới
```
Vào Quản lý nhân sự → Thêm mới → Nhập thông tin + chọn vai trò
  → Chọn cửa hàng phân công → Tạo mật khẩu tạm
  → Gửi thông tin đăng nhập cho người dùng mới (SMS/hiển thị)
  → Yêu cầu đổi mật khẩu lần đăng nhập đầu
```

## Gợi ý UI/UX

- Màn hình đăng nhập: tối giản, logo POSS, 2 trường nhập + nút đăng nhập
- Đăng nhập PIN: bàn phím số lớn, dễ bấm nhanh cho Staff đổi ca
- Quick Switch: popup dropdown từ header, danh sách avatar + tên Staff, tap để chọn → hiện bàn phím PIN
- Nút đăng xuất: trong menu profile/sidebar, màu đỏ nhạt, vị trí cuối menu
- Danh sách tài khoản: dạng list với avatar, tên, vai trò, trạng thái. Hỗ trợ tìm kiếm và lọc
- Chuyển đổi vai trò bằng màu sắc: Owner (đỏ/cam), Manager (xanh dương), Staff (xanh lá)

## Quy tắc nghiệp vụ

1. Mỗi số điện thoại chỉ liên kết 1 tài khoản duy nhất
2. Không thể xóa tài khoản Owner cuối cùng trong hệ thống
3. Tài khoản bị khóa không thể đăng nhập nhưng dữ liệu lịch sử vẫn giữ nguyên
4. Manager bị xóa → Staff thuộc quyền Manager đó vẫn hoạt động, được chuyển về Owner quản lý trực tiếp
5. Mật khẩu tối thiểu 6 ký tự, PIN đúng 4-6 số
6. Một Staff chỉ thuộc 1 cửa hàng tại một thời điểm, Manager có thể quản lý nhiều cửa hàng
7. Quick Switch chỉ hiển thị danh sách Staff/Manager cùng cửa hàng đã từng đăng nhập trên thiết bị này
8. Quick Switch không đóng ca người cũ — ca ở trạng thái "tạm rời", dữ liệu giữ nguyên
9. Đăng xuất khi có đơn chưa thanh toán: đơn vẫn giữ trong hệ thống, người khác có thể tiếp nhận
10. Mỗi lần chuyển đổi / đăng xuất đều ghi nhật ký hoạt động

## Trạng thái tài khoản

```
[Tạo mới] → Hoạt động ←→ Tạm khóa
                ↓
            Đã xóa (soft delete)
```
