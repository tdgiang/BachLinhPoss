// Comprehensive Mock Data for POSS F&B System (All 11 Modules)
import {
  SHIFT_TEMPLATES,
  addDays,
  isShiftOver,
  minutesNow,
  pad,
  payrollKey,
  scheduleId,
  startOfWeek,
  timeToMinutes,
  toDateKey,
  toMonthKey,
} from '../utils/hr';

export const ROLES = {
  OWNER: { id: 'OWNER', name: 'Owner (Chủ chuỗi)', color: '#ef4444', bg: '#fef2f2' },
  MANAGER: { id: 'MANAGER', name: 'Manager (Quản lý)', color: '#3b82f6', bg: '#eff6ff' },
  STAFF: { id: 'STAFF', name: 'Staff (Thu ngân)', color: '#10b981', bg: '#ecfdf5' },
};

export const INITIAL_USERS = [
  {
    id: 'USR-001',
    name: 'Nguyễn Văn Tuấn',
    phone: '0988123456',
    email: 'tuan.owner@poss.vn',
    role: 'OWNER',
    assignedStores: ['POSS-001', 'POSS-002', 'POSS-003', 'POSS-004'],
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-01-10',
  },
  {
    id: 'USR-002',
    name: 'Trần Thùy Linh',
    phone: '0977888999',
    email: 'linh.manager@poss.vn',
    role: 'MANAGER',
    assignedStores: ['POSS-001'],
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-02-15',
  },
  {
    id: 'USR-003',
    name: 'Lê Hoàng Nam',
    phone: '0912345678',
    email: 'nam.staff@poss.vn',
    role: 'STAFF',
    pin: '1234',
    assignedStores: ['POSS-001'],
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-03-01',
  },
  {
    id: 'USR-004',
    name: 'Đặng Mai Phương',
    phone: '0933221144',
    email: 'phuong.staff@poss.vn',
    role: 'STAFF',
    pin: '5678',
    assignedStores: ['POSS-002'],
    status: 'LOCKED',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-04-12',
  },
  {
    id: 'USR-005',
    name: 'Phạm Quốc Bảo',
    phone: '0905667788',
    email: 'bao.staff@poss.vn',
    role: 'STAFF',
    pin: '1111',
    assignedStores: ['POSS-001'],
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-05-04',
  },
  {
    id: 'USR-006',
    name: 'Vũ Ngọc Hân',
    phone: '0868123987',
    email: 'han.staff@poss.vn',
    role: 'STAFF',
    pin: '2222',
    assignedStores: ['POSS-001'],
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-07-20',
  },
  {
    id: 'USR-007',
    name: 'Bùi Thanh Tâm',
    phone: '0944556677',
    email: 'tam.staff@poss.vn',
    role: 'STAFF',
    pin: '3333',
    assignedStores: ['POSS-002'],
    status: 'ACTIVE',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-06-01',
  },
];

export const INITIAL_STORES = [
  {
    id: 'POSS-001',
    name: 'Ba.li Poss Cầu Giấy (Flagship)',
    address: '128 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    phone: '024 3838 9999',
    email: 'caugiay@poss.vn',
    status: 'OPEN', // OPEN | PAUSED | CLOSED
    tables: 24,
    allowDineIn: true,
    openingHours: '07:00 - 23:00 (Hàng ngày)',
    vatRate: 8,
    serviceCharge: 0,
    printerType: '80mm',
    printerConnection: 'LAN/Wi-Fi (192.168.1.180)',
    hasCashDrawer: true,
    todayRevenue: 18450000,
    todayOrders: 142,
    activeStaffCount: 4,
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'POSS-002',
    name: 'Ba.li Poss Hoàn Kiếm',
    address: '45 Đinh Tiên Hoàng, Hàng Bạc, Hoàn Kiếm, Hà Nội',
    phone: '024 3939 8888',
    email: 'hoankiem@poss.vn',
    status: 'OPEN',
    tables: 18,
    allowDineIn: true,
    openingHours: '06:30 - 23:30 (Hàng ngày)',
    vatRate: 8,
    serviceCharge: 5,
    printerType: '80mm',
    printerConnection: 'Bluetooth (POSS-BT-02)',
    hasCashDrawer: true,
    todayRevenue: 24200000,
    todayOrders: 189,
    activeStaffCount: 5,
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'POSS-003',
    name: 'Ba.li Poss Quận 1',
    address: '88 Nguyễn Huệ, Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    phone: '028 3822 7777',
    email: 'quan1@poss.vn',
    status: 'OPEN',
    tables: 30,
    allowDineIn: true,
    openingHours: '07:00 - 00:00 (Hàng ngày)',
    vatRate: 8,
    serviceCharge: 0,
    printerType: '80mm',
    printerConnection: 'LAN/Wi-Fi (192.168.1.192)',
    hasCashDrawer: true,
    todayRevenue: 31500000,
    todayOrders: 230,
    activeStaffCount: 6,
    image: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=500&auto=format&fit=crop&q=80',
  },
  {
    id: 'POSS-004',
    name: 'Ba.li Poss Thảo Điền',
    address: '15 Xuân Thủy, Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh',
    phone: '028 3744 6666',
    email: 'thaodien@poss.vn',
    status: 'PAUSED', // Tạm đóng bảo trì quầy pha chế
    tables: 16,
    allowDineIn: true,
    openingHours: '07:30 - 22:30',
    vatRate: 8,
    serviceCharge: 0,
    printerType: '58mm',
    printerConnection: 'USB',
    hasCashDrawer: true,
    todayRevenue: 0,
    todayOrders: 0,
    activeStaffCount: 0,
    image: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=500&auto=format&fit=crop&q=80',
  },
];

export const CATEGORIES = [
  { id: 'cat-all', name: 'Tất cả', icon: 'Grid' },
  { id: 'cat-coffee', name: 'Cà phê Việt', icon: 'Coffee' },
  { id: 'cat-espresso', name: 'Espresso & Latte', icon: 'CupSoda' },
  { id: 'cat-tea', name: 'Trà trái cây', icon: 'Citrus' },
  { id: 'cat-milktea', name: 'Trà sữa & Macchiato', icon: 'Milk' },
  { id: 'cat-cake', name: 'Bánh ngọt & Snack', icon: 'Cake' },
];

export const TOPPINGS = [
  { id: 'top-1', name: 'Trân châu hoàng kim', price: 10000 },
  { id: 'top-2', name: 'Thạch củ năng giòn', price: 10000 },
  { id: 'top-3', name: 'Kem Cheese béo ngậy', price: 15000 },
  { id: 'top-4', name: 'Trân châu trắng 3Q', price: 10000 },
  { id: 'top-5', name: 'Thêm 1 Shot Espresso', price: 15000 },
  { id: 'top-6', name: 'Sốt Caramel mặn', price: 8000 },
];

export const PRODUCTS = [
  {
    id: 'PRD-001',
    sku: 'CF-DEN',
    name: 'Cà phê Đen Pha Phin Đậm Đà',
    category: 'cat-coffee',
    basePrice: 29000,
    sizes: [
      { size: 'S', price: 29000 },
      { size: 'M', price: 35000 },
      { size: 'L', price: 42000 },
    ],
    status: 'AVAILABLE', // AVAILABLE | OUT_OF_STOCK | DISCONTINUED
    stock: 85,
    minStock: 20,
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
    description: 'Hạt Robusta Buôn Ma Thuột rang mộc, hương thơm nồng, hậu vị đắng thanh đậm sâu.',
  },
  {
    id: 'PRD-002',
    sku: 'CF-SUA',
    name: 'Cà phê Sữa Đá Sài Gòn',
    category: 'cat-coffee',
    basePrice: 35000,
    sizes: [
      { size: 'S', price: 35000 },
      { size: 'M', price: 42000 },
      { size: 'L', price: 49000 },
    ],
    status: 'AVAILABLE',
    stock: 120,
    minStock: 25,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&auto=format&fit=crop&q=80',
    description: 'Sự kết hợp hoàn hảo giữa cà phê phin đậm đà và sữa đặc ngọt béo thơm lừng.',
  },
  {
    id: 'PRD-003',
    sku: 'CF-MUOI',
    name: 'Cà phê Muối Cố Đô Kem Béo',
    category: 'cat-coffee',
    basePrice: 42000,
    sizes: [
      { size: 'M', price: 42000 },
      { size: 'L', price: 49000 },
    ],
    status: 'AVAILABLE',
    stock: 45,
    minStock: 15,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&auto=format&fit=crop&q=80',
    description: 'Vị đắng nhẹ quyện lớp kem sữa muối mằn mặn béo ngậy đặc trưng xứ Huế.',
  },
  {
    id: 'PRD-004',
    sku: 'ESP-LATTE',
    name: 'Vanilla Oat Milk Latte',
    category: 'cat-espresso',
    basePrice: 55000,
    sizes: [
      { size: 'M', price: 55000 },
      { size: 'L', price: 65000 },
    ],
    status: 'AVAILABLE',
    stock: 38,
    minStock: 10,
    image: 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=400&auto=format&fit=crop&q=80',
    description: 'Espresso Arabica thơm dịu hòa cùng sữa yến mạch béo bùi và hương vanilla tự nhiên.',
  },
  {
    id: 'PRD-005',
    sku: 'ESP-CAPPU',
    name: 'Cappuccino Bọt Mịn Nghệ Thuật',
    category: 'cat-espresso',
    basePrice: 52000,
    sizes: [
      { size: 'S', price: 52000 },
      { size: 'M', price: 59000 },
    ],
    status: 'AVAILABLE',
    stock: 50,
    minStock: 15,
    image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400&auto=format&fit=crop&q=80',
    description: 'Espresso chuẩn Ý kết hợp lớp bọt sữa dày mịn rắc bột cacao thơm phức.',
  },
  {
    id: 'PRD-006',
    sku: 'TEA-DAO',
    name: 'Trà Đào Cam Sả Tươi Mát',
    category: 'cat-tea',
    basePrice: 48000,
    sizes: [
      { size: 'M', price: 48000 },
      { size: 'L', price: 55000 },
    ],
    status: 'AVAILABLE',
    stock: 62,
    minStock: 20,
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&auto=format&fit=crop&q=80',
    description: 'Trà đen thơm dịu quyện nước cam vàng mọng nước, hương sả nồng ấm và đào giòn.',
  },
  {
    id: 'PRD-007',
    sku: 'TEA-MANGCAU',
    name: 'Trà Mãng Cầu Đắk Lắk Chua Ngọt',
    category: 'cat-tea',
    basePrice: 49000,
    sizes: [
      { size: 'M', price: 49000 },
      { size: 'L', price: 56000 },
    ],
    status: 'AVAILABLE',
    stock: 12, // Low stock alert
    minStock: 15,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&auto=format&fit=crop&q=80',
    description: 'Thịt mãng cầu xiêm tươi dầm chua ngọt thơm lừng, giải nhiệt cực đã ngày nắng.',
  },
  {
    id: 'PRD-008',
    sku: 'MT-NUONG',
    name: 'Trà Sữa Ô Long Nướng Trân Châu',
    category: 'cat-milktea',
    basePrice: 45000,
    sizes: [
      { size: 'M', price: 45000 },
      { size: 'L', price: 52000 },
    ],
    status: 'AVAILABLE',
    stock: 90,
    minStock: 25,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&auto=format&fit=crop&q=80',
    description: 'Lá trà Ô long sao vàng nhiệt độ cao cho hương khói đậm đà, kết hợp sữa thơm béo.',
  },
  {
    id: 'PRD-009',
    sku: 'MT-MATCHA',
    name: 'Matcha Latte Kem Cheese Uji',
    category: 'cat-milktea',
    basePrice: 56000,
    sizes: [
      { size: 'M', price: 56000 },
      { size: 'L', price: 65000 },
    ],
    status: 'OUT_OF_STOCK', // Tạm hết hàng tại quầy
    stock: 0,
    minStock: 15,
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&auto=format&fit=crop&q=80',
    description: 'Bột matcha thượng hạng nhập khẩu Kyoto hòa quyện lớp kem phô mai sánh mịn.',
  },
  {
    id: 'PRD-010',
    sku: 'CAKE-CROISSANT',
    name: 'Croissant Bơ Pháp Nướng Giòn',
    category: 'cat-cake',
    basePrice: 38000,
    sizes: [{ size: 'Tiêu chuẩn', price: 38000 }],
    status: 'AVAILABLE',
    stock: 22,
    minStock: 10,
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&auto=format&fit=crop&q=80',
    description: 'Bánh sừng bò ngàn lớp thơm bơ lừng, vỏ giòn rụm bên ngoài ruột mềm xốp bên trong.',
  },
  {
    id: 'PRD-011',
    sku: 'CAKE-TIRAMISU',
    name: 'Tiramisu Cacao Rượu Kahlúa',
    category: 'cat-cake',
    basePrice: 55000,
    sizes: [{ size: 'Tiêu chuẩn', price: 55000 }],
    status: 'AVAILABLE',
    stock: 14,
    minStock: 8,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&auto=format&fit=crop&q=80',
    description: 'Bánh truyền thống Ý với lớp phô mai Mascarpone béo thơm quyện vị cà phê đậm.',
  },
];

export const INITIAL_CUSTOMERS = [
  {
    id: 'CUS-001',
    phone: '0901234567',
    name: 'Nguyễn Thanh Tùng',
    email: 'tung.nguyen@gmail.com',
    tier: 'PLATINUM', // SILVER | GOLD | PLATINUM
    points: 1250,
    totalSpent: 14850000,
    orderCount: 38,
    dob: '1992-05-18',
    joinDate: '2025-11-20',
    notes: 'Khách VIP, thích ngồi bàn 04 gần cửa sổ, uống cà phê không đường.',
  },
  {
    id: 'CUS-002',
    phone: '0988776655',
    name: 'Hoàng Bích Thủy',
    email: 'thuy.hb@gmail.com',
    tier: 'GOLD',
    points: 460,
    totalSpent: 5200000,
    orderCount: 16,
    dob: '1998-10-12',
    joinDate: '2026-01-05',
    notes: 'Hay đi cùng bạn bè vào giờ trưa.',
  },
  {
    id: 'CUS-003',
    phone: '0912334455',
    name: 'Đoàn Quang Khải',
    email: 'khai.dq@outlook.com',
    tier: 'SILVER',
    points: 120,
    totalSpent: 1350000,
    orderCount: 4,
    dob: '2001-03-24',
    joinDate: '2026-03-10',
    notes: 'Khách hàng mới văn phòng tòa nhà kế bên.',
  },
];

export const PROMOTIONS = [
  {
    id: 'KM-001',
    name: 'Happy Hour Giờ Vàng 14h - 17h',
    type: 'DIRECT_DISCOUNT', // DIRECT_DISCOUNT | VOUCHER | COMBO | BUY_X_GET_Y
    discountType: 'PERCENT', // PERCENT | FIXED
    value: 20, // 20%
    code: 'HAPPYHOUR20',
    validFrom: '2026-10-01',
    validTo: '2026-10-31',
    timeSlot: '14:00 - 17:00',
    minOrderValue: 80000,
    applicableStores: ['POSS-001', 'POSS-002', 'POSS-003'],
    status: 'ACTIVE', // ACTIVE | SCHEDULED | PAUSED | EXPIRED
    usageCount: 248,
    maxUsage: 1000,
    description: 'Giảm 20% toàn bộ đồ uống khung giờ 14:00 - 17:00 từ Thứ 2 đến Thứ 6.',
  },
  {
    id: 'KM-002',
    name: 'Combo Bữa Sáng Tỉnh Táo (Cà phê + Bánh)',
    type: 'COMBO',
    comboPrice: 59000,
    originalPrice: 73000,
    validFrom: '2026-10-01',
    validTo: '2026-12-31',
    timeSlot: '07:00 - 10:30',
    applicableStores: ['POSS-001', 'POSS-002'],
    status: 'ACTIVE',
    usageCount: 412,
    description: 'Chọn 1 Cà phê Sữa Đá + 1 Croissant bơ Pháp chỉ 59.000đ (tiết kiệm 14.000đ).',
  },
  {
    id: 'KM-003',
    name: 'Mua 2 Tặng 1 Trà Trái Cây Cuối Tuần',
    type: 'BUY_X_GET_Y',
    buyQty: 2,
    getQty: 1,
    validFrom: '2026-10-01',
    validTo: '2026-10-31',
    daysOfWeek: ['Saturday', 'Sunday'],
    applicableStores: ['POSS-001'],
    status: 'ACTIVE',
    usageCount: 96,
    description: 'Mua 2 ly trà trái cây bất kỳ tặng ngay 1 ly Trà Đào Cam Sả size M.',
  },
];

export const VOUCHERS = [
  { code: 'CHAOMUNG50K', discount: 50000, type: 'FIXED', minSpend: 150000, status: 'AVAILABLE', expire: '2026-11-30' },
  { code: 'POSS10K', discount: 10000, type: 'FIXED', minSpend: 50000, status: 'AVAILABLE', expire: '2026-10-31' },
  { code: 'VIPGIFT30', discount: 30, type: 'PERCENT', minSpend: 100000, status: 'AVAILABLE', expire: '2026-12-15' },
  { code: 'SUMMER2026', discount: 20000, type: 'FIXED', minSpend: 80000, status: 'USED', expire: '2026-09-30' },
];

export const INITIAL_SHIFT = {
  id: 'SHIFT-20261013-01',
  storeId: 'POSS-001',
  openedBy: 'Lê Hoàng Nam (Staff)',
  openedAt: '2026-10-13 07:00:00',
  initialCash: 1500000, // 1.5 triệu đồng tiền thối đầu ca
  status: 'ACTIVE', // ACTIVE | CLOSED
  ordersCount: 42,
  totalSales: 4850000,
  cashSales: 1980000,
  vietQrSales: 1620000,
  eWalletSales: 850000,
  cardSales: 400000,
  pettyCashIn: 0,
  pettyCashOut: 150000, // Chi tiền mua đá viên khẩn cấp
  expensesList: [
    { time: '09:30', amount: 150000, reason: 'Mua thêm 3 túi đá bi khẩn cấp từ tiệm tạp hóa', by: 'Nam (Staff)' },
  ],
};

export const INITIAL_ORDERS = [
  {
    id: 'POSS001-20261013-0042',
    storeId: 'POSS-001',
    createdAt: '10:15 - Hôm nay',
    type: 'DINE_IN', // DINE_IN | TAKE_AWAY
    table: 'Bàn 04',
    customer: 'Nguyễn Thanh Tùng (0901234567 - Platinum)',
    status: 'COMPLETED', // PENDING | BREWING | COMPLETED | CANCELLED | REFUNDED
    items: [
      { name: 'Vanilla Oat Milk Latte (L)', qty: 2, price: 65000, toppings: ['Trân châu trắng 3Q'] },
      { name: 'Croissant Bơ Pháp Nướng Giòn', qty: 1, price: 38000, toppings: [] },
    ],
    subtotal: 178000,
    discount: 17800, // 10% Platinum discount
    vat: 12816,
    total: 173016,
    paymentMethod: 'VietQR',
    staff: 'Lê Hoàng Nam',
  },
  {
    id: 'POSS001-20261013-0041',
    storeId: 'POSS-001',
    createdAt: '09:50 - Hôm nay',
    type: 'TAKE_AWAY',
    table: null,
    customer: 'Khách vãng lai',
    status: 'COMPLETED',
    items: [
      { name: 'Cà phê Sữa Đá Sài Gòn (M)', qty: 2, price: 42000, toppings: [] },
      { name: 'Trà Đào Cam Sả Tươi Mát (L)', qty: 1, price: 55000, toppings: ['Thạch củ năng giòn'] },
    ],
    subtotal: 149000,
    discount: 0,
    vat: 11920,
    total: 160920,
    paymentMethod: 'Tiền mặt',
    staff: 'Lê Hoàng Nam',
  },
  {
    id: 'POSS001-20261013-0040',
    storeId: 'POSS-001',
    createdAt: '09:32 - Hôm nay',
    type: 'DINE_IN',
    table: 'Bàn 02',
    customer: 'Hoàng Bích Thủy (Gold)',
    status: 'BREWING', // Đang pha chế
    items: [
      { name: 'Trà Sữa Ô Long Nướng Trân Châu (L)', qty: 2, price: 52000, toppings: ['Kem Cheese béo ngậy'] },
    ],
    subtotal: 134000,
    discount: 6700,
    vat: 10184,
    total: 137484,
    paymentMethod: 'MoMo',
    staff: 'Lê Hoàng Nam',
  },
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTI-01',
    title: 'Cảnh báo sắp hết hàng: Trà Mãng Cầu Đắk Lắk',
    content: 'Tồn kho tại Ba.li Poss Cầu Giấy chỉ còn 12 ly, dưới ngưỡng tối thiểu 15 ly. Vui lòng tạo phiếu nhập kho.',
    type: 'INVENTORY',
    unread: true,
    time: '15 phút trước',
    deepLink: 'inventory',
  },
  {
    id: 'NOTI-02',
    title: 'Khách hàng thăng hạng Platinum: Nguyễn Thanh Tùng',
    content: 'Khách hàng 0901234567 vừa tích lũy đủ 1.200 điểm và thăng hạng Platinum. Ưu đãi chiết khấu 10% đã kích hoạt.',
    type: 'LOYALTY',
    unread: true,
    time: '45 phút trước',
    deepLink: 'customers',
  },
  {
    id: 'NOTI-03',
    title: 'Thông báo nội bộ từ Chủ chuỗi (Owner)',
    content: 'Tuần này triển khai chiến dịch Menu Mùa Thu 2026. Các quản lý kiểm tra máy in và quầy POS trước 17:00.',
    type: 'INTERNAL',
    unread: false,
    time: '2 giờ trước',
    deepLink: 'notifications',
  },
  {
    id: 'NOTI-04',
    title: 'Đơn hàng hoàn tiền #POSS001-20261012-0198',
    content: 'Quản lý Trần Thùy Linh đã duyệt hoàn tiền 85.000đ cho khách hàng do sự cố vỡ ly giao hàng.',
    type: 'ORDER',
    unread: false,
    time: 'Hôm qua 21:30',
    deepLink: 'orders',
  },
];

export const AUDIT_LOGS = [
  { id: 'LOG-001', time: '10:15:32', user: 'Lê Hoàng Nam (Staff)', action: 'Tạo & Thanh toán đơn', detail: 'Đơn #POSS001-20261013-0042 (173.016đ - VietQR)' },
  { id: 'LOG-002', time: '09:30:14', user: 'Lê Hoàng Nam (Staff)', action: 'Chi tiền ngoài ca', detail: 'Chi 150.000đ mua đá bi gấp' },
  { id: 'LOG-003', time: '08:45:00', user: 'Trần Thùy Linh (Manager)', action: 'Đổi trạng thái món', detail: 'Đặt Matcha Latte sang "Tạm hết hàng"' },
  { id: 'LOG-004', time: '07:00:22', user: 'Lê Hoàng Nam (Staff)', action: 'Mở ca làm việc', detail: 'Mở ca sáng với 1.500.000đ tiền mặt đầu ca' },
  { id: 'LOG-005', time: '06:55:10', user: 'Lê Hoàng Nam (Staff)', action: 'Đăng nhập hệ thống', detail: 'Đăng nhập thành công bằng mã PIN tại Ba.li Poss Cầu Giấy' },
];

export const INITIAL_WALLETS = [
  {
    id: 'WAL-001',
    customerId: 'CUS-001',
    customerName: 'Nguyễn Thanh Tùng',
    customerPhone: '0901234567',
    balance: 650000,
    totalToppedUp: 1500000,
    totalBonus: 250000,
    totalSpent: 1100000,
    status: 'ACTIVE',
    tier: 'PLATINUM',
    createdDate: '20/11/2025',
    lastUpdated: '15/10/2026 14:30',
  },
  {
    id: 'WAL-002',
    customerId: 'CUS-002',
    customerName: 'Hoàng Bích Thủy',
    customerPhone: '0988776655',
    balance: 320000,
    totalToppedUp: 800000,
    totalBonus: 120000,
    totalSpent: 600000,
    status: 'ACTIVE',
    tier: 'GOLD',
    createdDate: '05/01/2026',
    lastUpdated: '14/10/2026 11:15',
  },
  {
    id: 'WAL-003',
    customerId: 'CUS-003',
    customerName: 'Đoàn Quang Khải',
    customerPhone: '0912334455',
    balance: 50000,
    totalToppedUp: 200000,
    totalBonus: 30000,
    totalSpent: 180000,
    status: 'LOCKED',
    tier: 'SILVER',
    createdDate: '10/03/2026',
    lastUpdated: '12/10/2026 09:20',
  },
];

export const INITIAL_WALLET_PROMOTIONS = [
  {
    id: 'WPROM-001',
    name: 'Nạp Càng Nhiều - Thưởng Càng Lớn (Bậc Thang)',
    type: 'TIERED',
    description: 'Thưởng nạp trực tiếp vào số dư ví theo giá trị nạp: từ 100k thưởng 15%, từ 500k thưởng 20%, từ 1tr thưởng 25%.',
    status: 'ACTIVE',
    validFrom: '2026-10-01',
    validTo: '2026-12-31',
    usageCount: 142,
    maxUsage: 500,
    maxBonusPerDay: 500000,
    tiers: [
      { min: 100000, max: 499999, bonus: 15, label: 'Từ 100.000đ - 499.000đ: +15%' },
      { min: 500000, max: 999999, bonus: 20, label: 'Từ 500.000đ - 999.000đ: +20%' },
      { min: 1000000, max: Infinity, bonus: 25, label: 'Từ 1.000.000đ trở lên: +25%' },
    ],
  },
  {
    id: 'WPROM-002',
    name: 'Ưu Đãi Nạp Giờ Vàng (+20% cố định)',
    type: 'FIXED_PERCENT',
    bonusPercent: 20,
    minDeposit: 200000,
    description: 'Tặng ngay 20% giá trị nạp ví cho tất cả giao dịch nạp tối thiểu 200.000đ.',
    status: 'ACTIVE',
    validFrom: '2026-10-01',
    validTo: '2026-10-31',
    usageCount: 68,
    maxUsage: 200,
    maxBonusPerDay: 200000,
  },
];

export const INITIAL_WALLET_TRANSACTIONS = [
  {
    id: 'WTX-001',
    type: 'TOPUP',
    walletId: 'WAL-001',
    customerName: 'Nguyễn Thanh Tùng',
    customerPhone: '0901234567',
    amount: 500000,
    bonusPercent: 20,
    bonusAmount: 100000,
    totalCredited: 600000,
    balanceAfter: 650000,
    method: 'VietQR',
    promoId: 'WPROM-001',
    promoName: 'Nạp Càng Nhiều - Thưởng Càng Lớn (Bậc Thang)',
    staff: 'Lê Hoàng Nam (Staff)',
    store: 'Ba.li Poss Cầu Giấy',
    time: '15/10/2026 14:30:15',
    notes: 'Khách nạp 500.000đ qua VietQR, nhận 600.000đ vào ví (+20% bonus)',
  },
  {
    id: 'WTX-002',
    type: 'PAYMENT',
    walletId: 'WAL-001',
    customerName: 'Nguyễn Thanh Tùng',
    customerPhone: '0901234567',
    amount: -137484,
    bonusPercent: 0,
    bonusAmount: 0,
    totalCredited: -137484,
    balanceAfter: 50000,
    method: 'Thanh toán đơn #POSS001-20261014-0012',
    promoId: null,
    promoName: 'Không áp dụng',
    staff: 'Lê Hoàng Nam (Staff)',
    store: 'Ba.li Poss Cầu Giấy',
    time: '14/10/2026 18:22:40',
    notes: 'Thanh toán đơn hàng 3 sản phẩm tại bàn 04',
  },
  {
    id: 'WTX-003',
    type: 'TOPUP',
    walletId: 'WAL-002',
    customerName: 'Hoàng Bích Thủy',
    customerPhone: '0988776655',
    amount: 200000,
    bonusPercent: 15,
    bonusAmount: 30000,
    totalCredited: 230000,
    balanceAfter: 320000,
    method: 'Tiền mặt',
    promoId: 'WPROM-001',
    promoName: 'Nạp Càng Nhiều - Thưởng Càng Lớn (Bậc Thang)',
    staff: 'Trần Thùy Linh (Manager)',
    store: 'Ba.li Poss Hoàn Kiếm',
    time: '14/10/2026 11:15:00',
    notes: 'Khách nạp 200.000đ tiền mặt tại quầy',
  },
  {
    id: 'WTX-004',
    type: 'ADJUSTMENT',
    walletId: 'WAL-003',
    customerName: 'Đoàn Quang Khải',
    customerPhone: '0912334455',
    amount: 50000,
    bonusPercent: 0,
    bonusAmount: 0,
    totalCredited: 50000,
    balanceAfter: 50000,
    method: 'Điều chỉnh hệ thống',
    reason: 'Đền bù sự cố giao hàng trễ',
    staff: 'Nguyễn Quốc Tuấn (Owner)',
    store: 'Ba.li Poss Toàn Chuỗi',
    time: '12/10/2026 09:20:10',
    notes: 'Cộng tiền đền bù theo khiếu nại CSKH #TK-891',
  },
];


// ---------- Spec 13: Nhân sự, ca kíp, chấm công & lương thưởng ----------

export const INITIAL_EMPLOYEE_PROFILES = {
  'USR-002': { position: 'Quản lý cửa hàng', salaryType: 'MONTHLY', rate: 12000000, allowancePerShift: 15000, startDate: '2026-02-15' },
  'USR-003': { position: 'Thu ngân', salaryType: 'HOURLY', rate: 28000, allowancePerShift: 25000, startDate: '2026-03-01' },
  'USR-004': { position: 'Thu ngân', salaryType: 'HOURLY', rate: 26000, allowancePerShift: 25000, startDate: '2026-04-12' },
  'USR-005': { position: 'Pha chế (Barista)', salaryType: 'HOURLY', rate: 32000, allowancePerShift: 25000, startDate: '2026-05-04' },
  'USR-006': { position: 'Phục vụ (Part-time)', salaryType: 'HOURLY', rate: 25000, allowancePerShift: 20000, startDate: '2026-07-20' },
  'USR-007': { position: 'Pha chế (Barista)', salaryType: 'HOURLY', rate: 30000, allowancePerShift: 25000, startDate: '2026-06-01' },
};

// Lịch ca cố định theo tuần (Thứ 2 → Chủ nhật) dùng để sinh dữ liệu mẫu
const HR_WEEKLY_PATTERNS = {
  'USR-002': [['SANG', 'CHIEU'], ['SANG', 'CHIEU'], ['SANG', 'CHIEU'], ['SANG', 'CHIEU'], ['SANG', 'CHIEU'], ['SANG'], []],
  'USR-003': [['SANG'], ['SANG'], ['CHIEU'], ['SANG'], ['TOI'], ['CHIEU', 'TOI'], []],
  'USR-005': [['CHIEU'], ['TOI'], ['TOI'], ['CHIEU'], ['CHIEU'], ['SANG'], ['SANG', 'CHIEU']],
  'USR-006': [[], ['TOI'], [], ['TOI'], [], ['TOI'], ['CHIEU', 'TOI']],
  'USR-004': [['SANG'], ['SANG'], ['SANG'], [], ['CHIEU'], ['CHIEU'], ['SANG']],
  'USR-007': [['CHIEU'], ['CHIEU'], [], ['TOI'], ['TOI'], ['SANG', 'CHIEU'], ['CHIEU']],
};

const hrHash = (str) => {
  let h = 0;
  for (const c of str) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
};
const hrTime = (minutes) => `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;

// Sinh lịch ca + chấm công từ đầu tháng trước đến hết tuần sau, tương đối theo ngày hiện tại
function buildHrMock() {
  const now = new Date();
  const today = toDateKey(now);
  const nowM = minutesNow(now);
  const storeOf = Object.fromEntries(INITIAL_USERS.map((u) => [u.id, u.assignedStores[0]]));

  // Hôm nay Linh (Manager) và Nam (Staff) luôn có ca đang diễn ra để demo chấm công
  const liveShift = (
    SHIFT_TEMPLATES.find((t) => nowM >= timeToMinutes(t.start) - 30 && nowM < timeToMinutes(t.end))
    || (nowM < timeToMinutes('07:00') ? SHIFT_TEMPLATES[0] : SHIFT_TEMPLATES[2])
  ).code;

  const schedule = [];
  const attendance = [];
  const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDay = addDays(startOfWeek(now), 13);

  for (let d = firstDay; d <= lastDay; d = addDays(d, 1)) {
    const date = toDateKey(d);
    const weekday = (d.getDay() + 6) % 7;

    Object.entries(HR_WEEKLY_PATTERNS).forEach(([userId, pattern]) => {
      let codes = pattern[weekday];
      if (date === today && (userId === 'USR-002' || userId === 'USR-003') && !codes.includes(liveShift)) {
        codes = [...codes, liveShift];
      }

      codes.forEach((shiftCode) => {
        const entry = { id: scheduleId(userId, date, shiftCode), userId, date, shiftCode, storeId: storeOf[userId] };
        schedule.push(entry);

        const tpl = SHIFT_TEMPLATES.find((t) => t.code === shiftCode);
        const start = timeToMinutes(tpl.start);
        const end = timeToMinutes(tpl.end);
        const record = { id: entry.id, userId, date, shiftCode };

        if (isShiftOver(entry, now)) {
          const r = hrHash(entry.id) % 100;
          if (r < 4) return; // Vắng không phép
          if (r < 7) {
            attendance.push({ ...record, checkIn: null, checkOut: null, excused: true, editedBy: 'Trần Thùy Linh', editReason: 'Nghỉ ốm có giấy xác nhận' });
          } else if (r < 19) {
            attendance.push({ ...record, checkIn: hrTime(start + 7 + (r % 18)), checkOut: hrTime(end + (r % 4)) });
          } else if (r < 25) {
            attendance.push({ ...record, checkIn: hrTime(start - (r % 6)), checkOut: hrTime(end - 10 - (r % 20)) });
          } else if (r < 27 && date !== today) {
            attendance.push({ ...record, checkIn: hrTime(start - 3), checkOut: null });
          } else {
            attendance.push({ ...record, checkIn: hrTime(start - (r % 9)), checkOut: hrTime(end + (r % 7)) });
          }
        } else if (date === today && userId === 'USR-002' && nowM >= start) {
          attendance.push({ ...record, checkIn: hrTime(start - 4), checkOut: null });
        }
      });
    });
  }

  const thisMonth = toMonthKey(now);
  const lastMonth = toMonthKey(firstDay);

  return {
    profiles: INITIAL_EMPLOYEE_PROFILES,
    schedule,
    attendance,
    adjustments: [
      { id: 'ADJ-001', userId: 'USR-005', month: lastMonth, type: 'BONUS', amount: 300000, reason: 'Nhân viên xuất sắc tháng', by: 'Trần Thùy Linh' },
      { id: 'ADJ-002', userId: 'USR-003', month: lastMonth, type: 'PENALTY', amount: 50000, reason: 'Làm vỡ 2 ly thủy tinh', by: 'Trần Thùy Linh' },
      { id: 'ADJ-003', userId: 'USR-007', month: lastMonth, type: 'BONUS', amount: 200000, reason: 'Hỗ trợ khai trương menu mùa thu', by: 'Nguyễn Văn Tuấn' },
      { id: 'ADJ-004', userId: 'USR-002', month: thisMonth, type: 'BONUS', amount: 500000, reason: 'Cửa hàng đạt 120% doanh thu tuần', by: 'Nguyễn Văn Tuấn' },
    ],
    payrollStatus: {
      [payrollKey('POSS-001', lastMonth)]: 'LOCKED',
      [payrollKey('POSS-002', lastMonth)]: 'PAID',
    },
  };
}

export const INITIAL_HR_DATA = buildHrMock();
