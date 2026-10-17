import React, { useState } from 'react';
import { 
  Store, 
  User, 
  Bell, 
  Clock, 
  ShieldCheck, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Maximize,
  Search,
  Coffee,
  Menu,
  LogOut,
  KeyRound
} from 'lucide-react';
import { ROLES, INITIAL_USERS } from '../data/mockData';

export function Navbar({ 
  stores, 
  selectedStore, 
  setSelectedStore, 
  users = INITIAL_USERS,
  currentUser = INITIAL_USERS[0],
  currentUserRole = 'OWNER', 
  onSwitchUser,
  onOpenLogoutModal,
  activeShift,
  notifications,
  onNavigate,
  onOpenShiftModal,
  onToggleSidebar,
  onToggleMobileMenu
}) {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showStoreDropdown, setShowStoreDropdown] = useState(false);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);

  const unreadCount = notifications.filter(n => n.unread).length;
  const activeUser = currentUser || INITIAL_USERS.find(u => u.role === currentUserRole) || INITIAL_USERS[0];

  const handleToggle = onToggleSidebar || onToggleMobileMenu;

  return (
    <header className="navbar-header">
      {/* Click-away backdrop for open dropdowns */}
      {(showStoreDropdown || showRoleDropdown || showNotiDropdown) && (
        <div 
          onClick={() => {
            setShowStoreDropdown(false);
            setShowRoleDropdown(false);
            setShowNotiDropdown(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 90,
            background: 'transparent'
          }}
        />
      )}
      {/* Brand & Store Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flexShrink: 1 }}>
        {/* Toggle Sidebar Button (both desktop & mobile) */}
        <button 
          onClick={handleToggle}
          className="navbar-btn-icon"
          title="Đóng / mở menu điều hướng (Áp dụng máy tính & mobile)"
        >
          <Menu size={18} color="var(--accent-amber)" />
        </button>

        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }} onClick={() => onNavigate('pos')}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(245, 158, 11, 0.35)',
            flexShrink: 0
          }}>
            <Coffee size={18} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span className="navbar-brand-name" style={{ fontFamily: 'var(--font-heading)', fontSize: '17px', fontWeight: '800', letterSpacing: '-0.5px', color: '#fff' }}>POSS</span>
            </div>
          </div>
        </div>

        {/* Store Selector dropdown */}
        <div style={{ position: 'relative', flexShrink: 1, minWidth: 0 }}>
          <button 
            onClick={() => setShowStoreDropdown(!showStoreDropdown)}
            className="navbar-store-btn"
            style={{
              background: 'var(--bg-tertiary)',
              border: '1px solid var(--border-medium)',
              borderRadius: '8px',
              padding: '5px 8px',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              fontWeight: '600',
              maxWidth: '110px',
              cursor: 'pointer'
            }}
          >
            <Store size={13} color="var(--accent-amber)" style={{ flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedStore?.name?.replace('POSS ', '')}
            </span>
            <ChevronDown size={11} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          </button>

          {showStoreDropdown && (
            <div style={{
              position: 'absolute',
              top: '110%',
              left: 0,
              width: '260px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              borderRadius: '10px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 100,
              overflow: 'hidden',
              padding: '6px'
            }}>
              <div style={{ padding: '6px 8px', fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Chọn chi nhánh chuỗi
              </div>
              {stores.map(st => (
                <div 
                  key={st.id}
                  onClick={() => {
                    setSelectedStore(st);
                    setShowStoreDropdown(false);
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    background: st.id === selectedStore.id ? 'var(--bg-tertiary)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '2px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: st.id === selectedStore.id ? 'var(--accent-amber)' : 'var(--text-main)' }}>{st.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{st.id} • {st.status === 'OPEN' ? 'Đang mở' : 'Tạm đóng'}</div>
                  </div>
                  {st.id === selectedStore.id && <CheckCircle2 size={14} color="var(--accent-amber)" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls: Role Simulator + Notifications + Shift + User Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        
        {/* Shift Badge (compact on mobile) */}
        <div 
          onClick={onOpenShiftModal}
          style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-full)',
            padding: '4px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
          }}
          title="Nhấn để xem / đóng ca làm việc"
        >
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', flexShrink: 0 }} />
          <Clock size={12} color="#34d399" style={{ flexShrink: 0 }} />
          <span className="navbar-shift-text" style={{ fontSize: '11px', fontWeight: '600', color: '#34d399', whiteSpace: 'nowrap' }}>
            {activeShift?.ordersCount || 42} đơn
          </span>
        </div>

        {/* Quick Switch & Profile Simulator (Spec 01) */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            style={{
              background: ROLES[currentUserRole]?.bg || 'rgba(255,255,255,0.05)',
              border: `1px solid ${ROLES[currentUserRole]?.color || 'var(--border-medium)'}50`,
              color: ROLES[currentUserRole]?.color || 'var(--text-main)',
              padding: '5px 8px',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer'
            }}
            title="Nhấn để Chuyển đổi nhanh người dùng (Quick Switch - Spec 01)"
          >
            <ShieldCheck size={13} />
            <span>{activeUser.name ? activeUser.name.split(' ').slice(-1)[0] : ROLES[currentUserRole]?.name.split(' ')[0]} ({ROLES[currentUserRole]?.name.split(' ')[0]})</span>
            <ChevronDown size={10} />
          </button>

          {showRoleDropdown && (
            <div style={{
              position: 'absolute',
              top: '110%',
              right: 0,
              width: '280px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 200,
              padding: '8px',
              animation: 'fadeIn 150ms ease'
            }}>
              {/* Current Active Profile Header */}
              <div style={{
                padding: '8px 10px',
                borderRadius: '8px',
                background: 'var(--bg-tertiary)',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <img 
                  src={activeUser.avatar} 
                  alt={activeUser.name} 
                  style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${ROLES[currentUserRole]?.color}` }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {activeUser.name}
                  </div>
                  <div style={{ fontSize: '10px', color: ROLES[currentUserRole]?.color, fontWeight: '700' }}>
                    {ROLES[currentUserRole]?.name}
                  </div>
                </div>
              </div>

              {/* Quick Switch List per Spec 01 */}
              <div style={{ padding: '4px 6px 6px 6px', fontSize: '10px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                Chuyển đổi người dùng nhanh (Quick Switch)
              </div>
              <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                {users.map(u => {
                  const isCurrent = u.id === activeUser.id;
                  const isLocked = u.status === 'LOCKED';
                  const uRole = ROLES[u.role] || ROLES.STAFF;
                  return (
                    <div 
                      key={u.id}
                      onClick={() => {
                        if (isLocked) {
                          alert(`Tài khoản ${u.name} đang bị tạm khóa (Spec 01)! Vui lòng liên hệ Quản lý/Chủ chuỗi.`);
                          return;
                        }
                        if (onSwitchUser) {
                          const res = onSwitchUser(u.id, u.pin || '1234', true);
                          if (res?.success) {
                            setShowRoleDropdown(false);
                          } else {
                            alert(res?.message || 'Không thể chuyển tài khoản');
                          }
                        }
                      }}
                      style={{
                        padding: '7px 8px',
                        borderRadius: '6px',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        background: isCurrent ? 'rgba(245, 158, 11, 0.12)' : 'transparent',
                        opacity: isLocked ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '3px',
                        border: isCurrent ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <img 
                          src={u.avatar} 
                          alt={u.name} 
                          style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '12px', fontWeight: isCurrent ? '800' : '600', color: isCurrent ? 'var(--accent-amber)' : 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {u.name}
                          </div>
                          <div style={{ fontSize: '10px', color: uRole.color }}>
                            {uRole.name} • {u.assignedStores?.[0] || 'Tất cả'}
                          </div>
                        </div>
                      </div>
                      <div>
                        {isLocked ? (
                          <span style={{ fontSize: '9px', padding: '2px 5px', borderRadius: '3px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontWeight: '700' }}>
                            Khóa
                          </span>
                        ) : isCurrent ? (
                          <CheckCircle2 size={13} color="var(--accent-amber)" />
                        ) : (
                          <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                            PIN: {u.pin || '1234'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Menu Actions */}
              <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <button
                  onClick={() => {
                    onNavigate('accounts');
                    setShowRoleDropdown(false);
                  }}
                  style={{
                    padding: '7px 8px',
                    borderRadius: '6px',
                    background: 'transparent',
                    color: 'var(--text-muted)',
                    fontSize: '11px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'left',
                    width: '100%',
                    cursor: 'pointer'
                  }}
                >
                  <KeyRound size={13} color="var(--accent-amber)" />
                  <span>Quản lý Tài Khoản & PIN (Spec 01)</span>
                </button>

                {onOpenLogoutModal && (
                  <button
                    onClick={() => {
                      setShowRoleDropdown(false);
                      onOpenLogoutModal();
                    }}
                    style={{
                      padding: '7px 8px',
                      borderRadius: '6px',
                      background: 'rgba(239, 68, 68, 0.08)',
                      color: '#f87171',
                      fontSize: '11px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      textAlign: 'left',
                      width: '100%',
                      cursor: 'pointer'
                    }}
                  >
                    <LogOut size={13} color="#f87171" />
                    <span>Đăng xuất tài khoản</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon with Dropdown */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowNotiDropdown(!showNotiDropdown)}
            className="navbar-btn-icon"
            style={{ position: 'relative', width: '32px', height: '32px' }}
            title="Trung tâm thông báo (Spec 11)"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: '#ef4444',
                color: '#fff',
                borderRadius: '50%',
                fontSize: '9px',
                fontWeight: '800',
                width: '15px',
                height: '15px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid var(--bg-secondary)'
              }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotiDropdown && (
            <div style={{
              position: 'absolute',
              top: '115%',
              right: 0,
              width: '300px',
              maxWidth: '90vw',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-lg)',
              zIndex: 100,
              padding: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', paddingBottom: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '13px', fontWeight: '700' }}>Thông báo mới ({unreadCount})</span>
                <span 
                  onClick={() => { onNavigate('notifications'); setShowNotiDropdown(false); }}
                  style={{ fontSize: '11px', color: 'var(--accent-amber)', cursor: 'pointer' }}
                >
                  Xem tất cả
                </span>
              </div>
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {notifications.slice(0, 4).map(n => (
                  <div 
                    key={n.id}
                    onClick={() => {
                      if (n.deepLink) onNavigate(n.deepLink);
                      setShowNotiDropdown(false);
                    }}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: n.unread ? 'rgba(245, 158, 11, 0.08)' : 'transparent',
                      marginBottom: '6px',
                      cursor: 'pointer',
                      borderLeft: n.unread ? '3px solid var(--accent-amber)' : '3px solid transparent'
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '2px' }}>{n.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.3' }}>{n.content}</div>
                    <div style={{ fontSize: '9px', color: 'var(--text-dim)', marginTop: '4px' }}>{n.time}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Avatar - NEVER REMOVED, Clicks to navigate to 'accounts' (Spec 01 Login & Accounts) */}
        <div 
          onClick={() => onNavigate('accounts')}
          className="navbar-user-avatar"
          style={{
            borderColor: ROLES[currentUserRole]?.color || 'var(--accent-amber)',
            width: '32px',
            height: '32px'
          }}
          title={`Tài khoản: ${activeUser.name} (${currentUserRole}) - Bấm để chuyển tới chức năng đăng nhập & phân quyền`}
        >
          <img 
            src={activeUser.avatar} 
            alt={activeUser.name} 
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
            }}
          />
        </div>

      </div>
    </header>
  );
}
