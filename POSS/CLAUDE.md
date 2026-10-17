# CLAUDE.md

File này cung cấp hướng dẫn cho Claude Code (claude.ai/code) khi làm việc với code trong repository này.

## Dự án

POSS — bản UI prototype (`poss-ui-prototype`) của hệ thống POS tiếng Việt dành cho chuỗi quán café/nhà hàng nhiều cửa hàng. React 19 + Vite 8, JavaScript thuần (JSX, không dùng TypeScript), icon dùng `lucide-react`. Không có backend, không router, không thư viện quản lý state: mọi thứ chạy trên mock data trong bộ nhớ và bị reset khi tải lại trang. Toàn bộ text giao diện là tiếng Việt. Tên thương hiệu hiển thị là **Ba.li Poss** (tên cửa hàng dạng `Ba.li Poss Cầu Giấy`); các mã kỹ thuật vẫn giữ tiền tố `POSS` (store id `POSS-001`, mã đơn `POSS001-…`, voucher `POSS10K`).

Thư mục gốc git repo là thư mục cha (`POSS_CAFE/`); ứng dụng nằm trong `POSS/`. File `package-lock.json` ở thư mục gốc repo chỉ là file rỗng — hãy chạy các lệnh npm bên trong `POSS/`.

## Lệnh

```bash
npm install
npm run dev       # Vite dev server (cổng 5173)
npm run build     # build production ra dist/
npm run preview   # chạy thử bản build
npm run lint      # oxlint (config: .oxlintrc.json — plugin react + oxc, rules-of-hooks là error)
```

Chưa cấu hình test runner. Kiểm tra thay đổi bằng `npm run lint`, `npm run build`, và thao tác trực tiếp màn hình trên trình duyệt.

## Kiến trúc

**Spec quyết định mọi thứ.** `docs/specs/01-…13-*.md` (tiếng Việt) định nghĩa bảng phân quyền, quy tắc nghiệp vụ và các màn hình của từng tính năng. Tên module, nhãn sidebar (`'04. Màn hình bán hàng'`), nội dung audit log và comment trong code đều tham chiếu số spec (`// Spec 01: …`). Đọc spec tương ứng trước khi sửa một module, và giữ quy ước đánh số spec trong nhãn UI và comment.

| Spec | Module id | Component |
|------|-----------|-----------|
| 01 Đăng nhập & phân quyền | `accounts` | `AccountsModule.jsx` (+ logic đăng nhập/khóa trong `App.jsx`) |
| 02 Chuỗi cửa hàng | `stores` | `StoresModule.jsx` |
| 03 Menu | `menu` | `MenuModule.jsx` |
| 04 Màn hình bán hàng | `pos` | `PosSale.jsx` |
| 05 Thanh toán | `payments` | `PaymentModal.jsx` (mở từ POS; màn hình `payments` chỉ là trang dẫn quay lại POS) |
| 06 Ca làm việc | `shifts` | `ShiftsModule.jsx` |
| 07 Kho | `inventory` | `InventoryModule.jsx` |
| 08 Khách hàng/loyalty | `customers` | `CustomersModule.jsx` |
| 09 Khuyến mãi | `promotions` | `PromotionsModule.jsx` |
| 10 Báo cáo | `reports` | `ReportsModule.jsx` |
| 11 Thông báo | `notifications` | `NotificationsModule.jsx` |
| 12 Ví khách hàng | `wallet` | `WalletModule.jsx` (+ thanh toán bằng ví trong `PaymentModal.jsx`) |
| 13 Nhân sự, chấm công & lương | `staff` | `StaffModule.jsx` + các tab trong `staff/`; logic tính công/lương thuần ở `src/utils/hr.js` |

**Điều hướng.** `App.jsx` giữ `currentModule` và render một module qua chuỗi các khối `currentModule === '<id>' && <Module …/>`. Để thêm màn hình: thêm item (gồm `id`, `roles`, icon) vào các section trong `Sidebar.jsx`, rồi thêm khối render tương ứng trong `App.jsx`. Các module chuyển màn hình qua prop `onNavigate(moduleId)`.

**State chia giữa App và các module.** `App.jsx` chỉ giữ state dùng chung: stores/selectedStore, users/currentUser/currentUserRole, auditLogs (ghi qua helper `addAuditLog(action, detail)`), activeShift, notifications, `hrData` (lịch ca, chấm công, thưởng/phạt, trạng thái bảng lương của Spec 13), đơn hàng đang chờ thanh toán, và state UI của sidebar/modal đăng xuất. Phần lớn module tự khởi tạo `useState` *riêng* trực tiếp từ `src/data/mockData.js` (khách hàng, đơn hàng, ví, khuyến mãi/giao dịch ví, menu, khuyến mãi…). Hệ quả:
- Dữ liệu không được chia sẻ giữa các module — ví dụ `PosSale`, `PaymentModal` và `WalletModule` mỗi cái import `INITIAL_WALLETS` riêng, nên nạp tiền ví ở một nơi sẽ không hiển thị ở nơi khác.
- Chuyển màn hình sẽ unmount module và mất state local của nó.
- Nếu thay đổi cần hiển thị trên nhiều màn hình, hãy lift state đó lên `App.jsx` và truyền xuống qua props (đây là hướng mà plan ví trong `docs/superpowers/plans/` dự định).

**Luồng thanh toán.** `PosSale` gọi `onOpenPayment(orderData)`; App lưu vào `pendingPaymentOrder` và render `PaymentModal` toàn cục; khi hoàn tất, App tăng `activeShift.ordersCount` / `totalSales` theo `orderData.grandTotal`.

**Vai trò.** `OWNER` / `MANAGER` / `STAFF` (`ROLES` trong mockData). Mỗi module nhận `currentUserRole` và tự ẩn/hiện UI theo bảng phân quyền trong spec; `Sidebar` ẩn các item có `roles` không chứa vai trò hiện tại. Người dùng chuyển tài khoản bằng mã PIN (`handleSwitchUser` trong App): chấp nhận `pin` riêng của user hoặc PIN demo chung `1234`; sai 5 lần sẽ đặt `status: 'LOCKED'`; user không phải Owner sẽ tự động chuyển sang cửa hàng đầu tiên trong `assignedStores`.

**Audit log.** Các thao tác nhạy cảm thêm một entry `{ id: 'LOG-<timestamp>', time, user, action, detail }` vào đầu `auditLogs` trong App (hiển thị ở AccountsModule). Khi thêm thao tác cần audit, giữ đúng cấu trúc này và nhãn `action` tiếng Việt viết hoa (ví dụ `'KHÓA TÀI KHOẢN'`).

## Styling

Giao diện tối (dark theme). Design token là các CSS custom property trên `:root` trong `src/index.css` (`--text-primary`, `--text-muted`, `--bg-surface`, …), cùng với các class dùng chung (`btn-primary`, `btn-secondary`, `modal-overlay`, `modal-card`, các class layout). `src/App.css` chỉ là phần thừa không dùng từ template Vite (`.counter`, `.hero`) — style thật hãy đặt trong `index.css`. Component dùng các class trên kết hợp nhiều object `style={{…}}` inline — hãy theo pattern này thay vì đưa thêm CSS framework. Sidebar là drawer khi màn hình ≤1024px và có thể thu gọn trên desktop.

## Công cụ trong repo

`docs/superpowers/plans/` chứa các implementation plan viết cho bộ skill superpowers. Skill thiết kế `ui-ux-pro-max` được đặt sẵn trong `.claude/skills/` (và bản sao trong `.agents/skills/`); truy vấn bằng:

```bash
python .claude/skills/ui-ux-pro-max/scripts/search.py "POS point of sale dashboard" --design-system -p "POSS System"
```
