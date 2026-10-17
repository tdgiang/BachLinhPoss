import React from 'react';
import { 
  ShoppingCart, 
  CreditCard, 
  Clock, 
  UtensilsCrossed, 
  Boxes, 
  Store, 
  Users, 
  TicketPercent, 
  BarChart3, 
  UserCheck, 
  Bell, 
  ChevronRight,
  ShieldAlert,
  X,
  Coffee,
  Wallet
} from 'lucide-react';

export function Sidebar({ 
  currentModule, 
  onSelectModule, 
  currentUserRole, 
  isOpen, 
  onClose,
  isCollapsedDesktop,
  onToggleDesktop
}) {
  const navSections = [
    {
      title: 'BÁN HÀNG & THU NGÂN',
      items: [
        { id: 'pos', name: '04. Màn hình bán hàng', icon: ShoppingCart, roles: ['OWNER', 'MANAGER', 'STAFF'], badge: 'Chính' },
        { id: 'payments', name: '05. Thanh toán & Bill', icon: CreditCard, roles: ['OWNER', 'MANAGER', 'STAFF'] },
        { id: 'shifts', name: '06. Quản lý ca làm việc', icon: Clock, roles: ['OWNER', 'MANAGER', 'STAFF'] },
      ]
    },
    {
      title: 'VẬN HÀNH & SẢN PHẨM',
      items: [
        { id: 'menu', name: '03. Menu & Sản phẩm', icon: UtensilsCrossed, roles: ['OWNER', 'MANAGER', 'STAFF'] },
        { id: 'inventory', name: '07. Quản lý kho', icon: Boxes, roles: ['OWNER', 'MANAGER', 'STAFF'], alertBadge: 'Cảnh báo tồn' },
        { id: 'stores', name: '02. Chuỗi cửa hàng', icon: Store, roles: ['OWNER', 'MANAGER'] },
      ]
    },
    {
      title: 'KHÁCH HÀNG & TIẾP THỊ',
      items: [
        { id: 'customers', name: '08. Khách hàng & Loyalty', icon: Users, roles: ['OWNER', 'MANAGER', 'STAFF'] },
        { id: 'wallet', name: '12. Ví khách hàng', icon: Wallet, roles: ['OWNER', 'MANAGER', 'STAFF'], badge: 'Mới' },
        { id: 'promotions', name: '09. Khuyến mãi & Voucher', icon: TicketPercent, roles: ['OWNER', 'MANAGER', 'STAFF'] },
      ]
    },
    {
      title: 'QUẢN TRỊ & HỆ THỐNG',
      items: [
        { id: 'reports', name: '10. Báo cáo & Thống kê', icon: BarChart3, roles: ['OWNER', 'MANAGER', 'STAFF'] },
        { id: 'accounts', name: '01. Đăng nhập & Tài khoản', icon: UserCheck, roles: ['OWNER', 'MANAGER', 'STAFF'] },
        { id: 'notifications', name: '11. Trung tâm thông báo', icon: Bell, roles: ['OWNER', 'MANAGER', 'STAFF'] },
      ]
    }
  ];

  const handleItemClick = (item, hasPermission) => {
    if (hasPermission) {
      onSelectModule(item.id);
      if (onClose) onClose(); // Tự động đóng thanh tab trên mobile khi chọn chức năng
    }
  };

  return (
    <aside 
      className={`sidebar-container ${isOpen ? 'open' : ''} ${isCollapsedDesktop ? 'desktop-collapsed' : ''}`}
    >
      {/* Mobile Drawer Header with Close Button */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 4px 14px 4px',
        marginBottom: '10px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Coffee size={18} />
          </div>
          <span style={{ fontSize: '16px', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-heading)' }}>
            Menu POSS
          </span>
        </div>

        {onClose && (
          <button 
            onClick={onClose}
            className="sidebar-close-btn"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-main)',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-medium)'
            }}
            title="Đóng menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div style={{ flex: 1 }}>
        {navSections.map((sec, secIdx) => (
          <div key={secIdx} style={{ marginBottom: '18px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: '700',
              color: 'var(--text-dim)',
              letterSpacing: '0.6px',
              padding: '4px 10px 8px 10px',
              textTransform: 'uppercase'
            }}>
              {sec.title}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {sec.items.map(item => {
                const Icon = item.icon;
                const isActive = currentModule === item.id;
                const hasPermission = item.roles.includes(currentUserRole);

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item, hasPermission)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: isActive 
                        ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.18), rgba(245, 158, 11, 0.05))' 
                        : 'transparent',
                      border: isActive ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
                      color: isActive ? 'var(--accent-amber)' : hasPermission ? 'var(--text-main)' : 'var(--text-dim)',
                      opacity: hasPermission ? 1 : 0.45,
                      cursor: hasPermission ? 'pointer' : 'not-allowed',
                      textAlign: 'left',
                      position: 'relative'
                    }}
                    title={!hasPermission ? `Chức năng yêu cầu quyền Owner hoặc Manager (Vai trò hiện tại: ${currentUserRole})` : ''}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={18} color={isActive ? 'var(--accent-amber)' : hasPermission ? 'var(--text-muted)' : 'var(--text-dim)'} />
                      <span style={{ fontSize: '13px', fontWeight: isActive ? '700' : '500' }}>{item.name}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {item.badge && (
                        <span style={{
                          fontSize: '10px',
                          background: 'rgba(245, 158, 11, 0.2)',
                          color: '#fbbf24',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: '700'
                        }}>
                          {item.badge}
                        </span>
                      )}
                      {item.alertBadge && (
                        <span style={{
                          fontSize: '10px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#f87171',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: '700'
                        }}>
                          !
                        </span>
                      )}
                      {!hasPermission && (
                        <ShieldAlert size={13} color="#f87171" title="Không có quyền truy cập" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Spec Quick Info Box */}
      <div style={{
        padding: '12px',
        borderRadius: '10px',
        background: 'var(--bg-tertiary)',
        border: '1px solid var(--border-medium)',
        fontSize: '11px',
        color: 'var(--text-muted)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: 'var(--accent-amber)', marginBottom: '4px' }}>
          <span>12 Specs Đầy Đủ (Kèm Ví KH)</span>
          <span style={{ fontSize: '10px', padding: '1px 5px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderRadius: '3px' }}>Mock UI</span>
        </div>
        <div>Tất cả màn hình được thiết kế dựa trên tài liệu đặc tả `docs/specs/*.md` cho F&B POS.</div>
      </div>
    </aside>
  );
}
