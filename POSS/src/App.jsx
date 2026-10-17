import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PosSale } from './components/modules/PosSale';
import { PaymentModal } from './components/modules/PaymentModal';
import { ShiftsModule } from './components/modules/ShiftsModule';
import { MenuModule } from './components/modules/MenuModule';
import { InventoryModule } from './components/modules/InventoryModule';
import { StoresModule } from './components/modules/StoresModule';
import { CustomersModule } from './components/modules/CustomersModule';
import { PromotionsModule } from './components/modules/PromotionsModule';
import { ReportsModule } from './components/modules/ReportsModule';
import { AccountsModule } from './components/modules/AccountsModule';
import { NotificationsModule } from './components/modules/NotificationsModule';
import { WalletModule } from './components/modules/WalletModule';
import { StaffModule } from './components/modules/StaffModule';

import { 
  INITIAL_STORES, 
  INITIAL_SHIFT, 
  INITIAL_NOTIFICATIONS,
  INITIAL_USERS,
  AUDIT_LOGS,
  INITIAL_HR_DATA
} from './data/mockData';

export default function App() {
  const [stores, setStores] = useState(INITIAL_STORES);
  const [selectedStore, setSelectedStore] = useState(INITIAL_STORES[0]); // POSS Cầu Giấy
  
  // Spec 01: Centralized User & Role Management
  const [users, setUsers] = useState(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState(INITIAL_USERS[0]); // Default Nguyễn Văn Tuấn (Owner)
  const [currentUserRole, setCurrentUserRole] = useState(INITIAL_USERS[0].role);
  const [auditLogs, setAuditLogs] = useState(AUDIT_LOGS);

  // Spec 13: Nhân sự, ca kíp, chấm công & lương (giữ ở App để không mất khi chuyển màn hình)
  const [hrData, setHrData] = useState(INITIAL_HR_DATA);

  const [currentModule, setCurrentModule] = useState('pos'); // Current active screen
  const [activeShift, setActiveShift] = useState(INITIAL_SHIFT);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

  // Logout Confirmation Modal state per Spec 01
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Sidebar state: Mobile Drawer & Desktop Collapse
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsedDesktop, setIsSidebarCollapsedDesktop] = useState(false);

  // Toggle Sidebar for both Desktop & Mobile
  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
      setIsMobileMenuOpen(prev => !prev);
    } else {
      setIsSidebarCollapsedDesktop(prev => !prev);
    }
  };

  // Spec 01: Login & Quick Switch Logic between users
  const handleSwitchUser = (targetUserId, pin, isDirect = false) => {
    const targetUser = users.find(u => u.id === targetUserId);
    if (!targetUser) {
      return { success: false, message: 'Không tìm thấy tài khoản người dùng!' };
    }

    // 1. Check account lock status (Spec 01: Locked accounts cannot log in)
    if (targetUser.status === 'LOCKED') {
      return {
        success: false,
        reason: 'LOCKED',
        message: `Tài khoản ${targetUser.name} đang bị tạm khóa theo Spec 01 (Vui lòng liên hệ Quản lý/Chủ chuỗi để mở khóa)!`
      };
    }

    // 2. PIN verification (Support specific user PIN or default 1234)
    const expectedPin = targetUser.pin || '1234';
    if (!isDirect && pin !== expectedPin && pin !== '1234') {
      const currentFailures = (targetUser.failedAttempts || 0) + 1;
      const updatedUsers = users.map(u => {
        if (u.id === targetUserId) {
          return {
            ...u,
            failedAttempts: currentFailures,
            status: currentFailures >= 5 ? 'LOCKED' : u.status
          };
        }
        return u;
      });
      setUsers(updatedUsers);

      if (currentFailures >= 5) {
        // Auto-lock account after 5 failed consecutive attempts per Spec 01
        setAuditLogs(prev => [{
          id: `LOG-${Date.now()}`,
          time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          user: targetUser.name,
          action: 'KHÓA TÀI KHOẢN',
          detail: `Tài khoản tự động bị tạm khóa 15 phút do nhập sai mã PIN 5 lần liên tiếp (Spec 01).`
        }, ...prev]);

        return {
          success: false,
          reason: 'MAX_ATTEMPTS_LOCKED',
          message: `Nhập sai mã PIN 5 lần! Tài khoản của ${targetUser.name} đã tự động bị tạm khóa theo Spec 01.`
        };
      }

      return {
        success: false,
        reason: 'WRONG_PIN',
        attemptsLeft: 5 - currentFailures,
        message: `Mã PIN không đúng! Còn ${5 - currentFailures} lần thử trước khi bị khóa tài khoản.`
      };
    }

    // 3. Successful Login / Switch
    const resetUsers = users.map(u => u.id === targetUserId ? { ...u, failedAttempts: 0 } : u);
    setUsers(resetUsers);
    setCurrentUser(targetUser);
    setCurrentUserRole(targetUser.role);

    // Auto-switch to assigned store if Manager or Staff
    if (targetUser.role !== 'OWNER' && targetUser.assignedStores?.length > 0) {
      const storeMatch = stores.find(s => s.id === targetUser.assignedStores[0]);
      if (storeMatch) setSelectedStore(storeMatch);
    }

    // Record login into Audit Trail
    setAuditLogs(prev => [{
      id: `LOG-${Date.now()}`,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      user: targetUser.name,
      action: 'ĐĂNG NHẬP NHANH',
      detail: `Chuyển phiên làm việc sang ${targetUser.name} (${targetUser.role}) qua mã PIN tại quầy.`
    }, ...prev]);

    return {
      success: true,
      user: targetUser,
      message: `Đăng nhập thành công: ${targetUser.name} (${targetUser.role})!`
    };
  };

  // Toggle Lock/Unlock User
  const handleToggleLockUser = (userId) => {
    let nextStatus = 'ACTIVE';
    let targetName = '';
    const updatedUsers = users.map(u => {
      if (u.id === userId) {
        nextStatus = u.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
        targetName = u.name;
        return { ...u, status: nextStatus, failedAttempts: 0 };
      }
      return u;
    });
    setUsers(updatedUsers);

    setAuditLogs(prev => [{
      id: `LOG-${Date.now()}`,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      user: currentUser.name,
      action: nextStatus === 'LOCKED' ? 'KHÓA TÀI KHOẢN' : 'MỞ KHÓA TÀI KHOẢN',
      detail: `${nextStatus === 'LOCKED' ? 'Khóa' : 'Mở khóa'} tài khoản nhân sự ${targetName} theo quy tắc Spec 01.`
    }, ...prev]);
  };

  // Ghi audit log cho thao tác của user hiện tại
  const addAuditLog = (action, detail) => {
    setAuditLogs(prev => [{
      id: `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      user: currentUser.name,
      action,
      detail
    }, ...prev]);
  };

  // Add new User
  const handleAddUser = (newUser) => {
    setUsers(prev => [...prev, newUser]);
    setAuditLogs(prev => [{
      id: `LOG-${Date.now()}`,
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      user: currentUser.name,
      action: 'TẠO TÀI KHOẢN',
      detail: `Khởi tạo tài khoản mới cho ${newUser.name} (${newUser.role}), gán cửa hàng ${newUser.assignedStores.join(', ')}.`
    }, ...prev]);
  };

  // Handle Confirm Logout flow per Spec 01
  const handleConfirmLogout = (option) => {
    setShowLogoutModal(false);
    if (option === 'CLOSE_SHIFT') {
      setCurrentModule('shifts');
    } else {
      // Leave shift open / temporary logout, navigate to accounts login tab
      setCurrentModule('accounts');
      setAuditLogs(prev => [{
        id: `LOG-${Date.now()}`,
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        user: currentUser.name,
        action: 'ĐĂNG XUẤT',
        detail: `Đăng xuất tài khoản ${currentUser.name} (${option === 'LEAVE_OPEN' ? 'Ca làm việc vẫn giữ mở - tạm rời' : 'Đăng xuất tài khoản'}).`
      }, ...prev]);
    }
  };

  // Active Payment Modal State
  const [pendingPaymentOrder, setPendingPaymentOrder] = useState(null);

  // Handle open payment modal from POS
  const handleOpenPayment = (orderData) => {
    setPendingPaymentOrder(orderData);
  };

  const handleClosePayment = () => {
    setPendingPaymentOrder(null);
  };

  // Switch to specific screen
  const handleNavigate = (moduleId) => {
    setCurrentModule(moduleId);
    setIsMobileMenuOpen(false); // Đóng menu mobile khi điều hướng
  };

  return (
    <div className="app-container">
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-drawer-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation (with Desktop collapse & Mobile drawer) */}
      <Sidebar 
        currentModule={currentModule}
        onSelectModule={handleNavigate}
        currentUserRole={currentUserRole}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        isCollapsedDesktop={isSidebarCollapsedDesktop}
        onToggleDesktop={() => setIsSidebarCollapsedDesktop(prev => !prev)}
      />

      {/* Main View Area */}
      <div className="main-content">
        {/* Top Navbar */}
        <Navbar 
          stores={stores}
          selectedStore={selectedStore}
          setSelectedStore={setSelectedStore}
          users={users}
          currentUser={currentUser}
          currentUserRole={currentUserRole}
          onSwitchUser={handleSwitchUser}
          onOpenLogoutModal={() => setShowLogoutModal(true)}
          activeShift={activeShift}
          notifications={notifications}
          onNavigate={handleNavigate}
          onOpenShiftModal={() => {
            setCurrentModule('shifts');
            setIsMobileMenuOpen(false);
          }}
          onToggleSidebar={handleToggleSidebar}
          onToggleMobileMenu={handleToggleSidebar}
          isSidebarCollapsedDesktop={isSidebarCollapsedDesktop}
        />

        {/* Viewport for active module */}
        <main className="module-viewport">
          {currentModule === 'pos' && (
            <PosSale 
              onOpenPayment={handleOpenPayment}
              activeShift={activeShift}
              currentUserRole={currentUserRole}
            />
          )}

          {currentModule === 'payments' && (
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <div style={{ marginBottom: '16px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800' }}>05. Thanh Toán & Giao Dịch</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Để thanh toán trực tiếp một đơn hàng, vui lòng vào mục <strong>04. Màn hình bán hàng</strong> và bấm <strong>Thanh Toán Đơn Hàng</strong>.
                </p>
              </div>
              <button 
                onClick={() => setCurrentModule('pos')} 
                className="btn-primary" 
                style={{ fontSize: '13px' }}
              >
                Đến Màn Hình Bán Hàng Gọi Món
              </button>
            </div>
          )}

          {currentModule === 'shifts' && (
            <ShiftsModule 
              currentUserRole={currentUserRole}
              activeShift={activeShift}
              setActiveShift={setActiveShift}
            />
          )}

          {currentModule === 'menu' && (
            <MenuModule 
              currentUserRole={currentUserRole}
            />
          )}

          {currentModule === 'inventory' && (
            <InventoryModule 
              currentUserRole={currentUserRole}
              currentStore={selectedStore}
            />
          )}

          {currentModule === 'stores' && (
            <StoresModule 
              currentUserRole={currentUserRole}
              stores={stores}
              setStores={setStores}
              selectedStore={selectedStore}
              setSelectedStore={setSelectedStore}
            />
          )}

          {currentModule === 'customers' && (
            <CustomersModule 
              currentUserRole={currentUserRole}
            />
          )}

          {currentModule === 'wallet' && (
            <WalletModule 
              currentUserRole={currentUserRole}
              currentStore={selectedStore}
              currentUser={currentUser}
              onNavigate={handleNavigate}
            />
          )}

          {currentModule === 'staff' && (
            <StaffModule 
              users={users}
              currentUser={currentUser}
              currentUserRole={currentUserRole}
              selectedStore={selectedStore}
              hrData={hrData}
              setHrData={setHrData}
              onAuditLog={addAuditLog}
            />
          )}

          {currentModule === 'promotions' && (
            <PromotionsModule 
              currentUserRole={currentUserRole}
            />
          )}

          {currentModule === 'reports' && (
            <ReportsModule 
              currentUserRole={currentUserRole}
            />
          )}

          {currentModule === 'accounts' && (
            <AccountsModule 
              users={users}
              currentUser={currentUser}
              currentUserRole={currentUserRole}
              onSwitchUser={handleSwitchUser}
              onToggleLockUser={handleToggleLockUser}
              onAddUser={handleAddUser}
              auditLogs={auditLogs}
              stores={stores}
              selectedStore={selectedStore}
              onNavigate={handleNavigate}
            />
          )}

          {currentModule === 'notifications' && (
            <NotificationsModule 
              notifications={notifications}
              setNotifications={setNotifications}
              onNavigate={handleNavigate}
              currentUserRole={currentUserRole}
            />
          )}
        </main>
      </div>

      {/* Global Payment Processing Modal */}
      {pendingPaymentOrder && (
        <PaymentModal 
          orderData={pendingPaymentOrder}
          currentStore={selectedStore}
          onClose={handleClosePayment}
          onCompletePayment={(orderId) => {
            // Update active shift sales count
            if (activeShift) {
              setActiveShift({
                ...activeShift,
                ordersCount: activeShift.ordersCount + 1,
                totalSales: activeShift.totalSales + pendingPaymentOrder.grandTotal
              });
            }
          }}
        />
      )}

      {/* Spec 01: Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '440px', padding: '24px' }}>
            <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: '#f87171' }}>
              Xác Nhận Đăng Xuất (Spec 01)
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.5' }}>
              Bạn đang yêu cầu đăng xuất khỏi tài khoản <strong>{currentUser.name}</strong> ({currentUserRole}).
              {activeShift && (
                <div style={{ marginTop: '10px', padding: '10px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24' }}>
                  ⚠️ <strong>Cảnh báo ca làm việc:</strong> Hiện có ca làm việc đang mở ({activeShift.ordersCount} đơn hàng).
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button 
                onClick={() => handleConfirmLogout('CLOSE_SHIFT')}
                className="btn-primary" 
                style={{ justifyContent: 'center', fontSize: '13px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' }}
              >
                Đóng Ca Rồi Đăng Xuất (Kiểm tiền kết ca)
              </button>
              <button 
                onClick={() => handleConfirmLogout('LEAVE_OPEN')}
                className="btn-secondary" 
                style={{ justifyContent: 'center', fontSize: '13px', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                Đăng Xuất Không Đóng Ca (Tạm rời POS)
              </button>
              <button 
                onClick={() => setShowLogoutModal(false)}
                style={{ padding: '8px', background: 'transparent', color: 'var(--text-dim)', fontSize: '12px' }}
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
