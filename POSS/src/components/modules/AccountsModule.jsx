import React, { useState } from 'react';
import { 
  UserCheck, 
  Plus, 
  Lock, 
  Unlock, 
  Shield, 
  KeyRound, 
  History, 
  CheckCircle2, 
  X, 
  Phone, 
  Store,
  LogIn,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  User,
  ShoppingBag
} from 'lucide-react';
import { INITIAL_USERS, ROLES, AUDIT_LOGS, INITIAL_STORES } from '../../data/mockData';

export function AccountsModule({ 
  users: propUsers,
  currentUser,
  currentUserRole = 'OWNER',
  onSwitchUser,
  onToggleLockUser,
  onAddUser,
  auditLogs: propAuditLogs,
  stores = INITIAL_STORES,
  selectedStore,
  onNavigate
}) {
  const users = propUsers || INITIAL_USERS;
  const auditLogs = propAuditLogs || AUDIT_LOGS;

  const [activeTab, setActiveTab] = useState('pinLogin'); // Default to pinLogin to test user switching immediately!
  const [loginMethod, setLoginMethod] = useState('pin'); // 'pin' | 'password'

  // Selected Target User for PIN login
  const [targetUserId, setTargetUserId] = useState(users[2]?.id || users[0]?.id); // Default to Staff Nam

  // PIN keypad state
  const [pinInput, setPinInput] = useState('');
  const [authFeedback, setAuthFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  // Phone + Password Login state
  const [loginPhone, setLoginPhone] = useState('0912345678');
  const [loginPassword, setLoginPassword] = useState('123456');

  // Add User modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('STAFF');
  const [formStore, setFormStore] = useState('POSS-001');

  const selectedTargetUser = users.find(u => u.id === targetUserId) || users[0];

  // Handle PIN input
  const handlePinPress = (val) => {
    if (pinInput.length < 4) {
      const nextPin = pinInput + val;
      setPinInput(nextPin);
      
      if (nextPin.length === 4) {
        // Execute login attempt per Spec 01
        if (onSwitchUser) {
          const result = onSwitchUser(selectedTargetUser.id, nextPin);
          if (result.success) {
            setAuthFeedback({
              type: 'success',
              message: `Xác thực PIN thành công: ${selectedTargetUser.name} (${selectedTargetUser.role})!`
            });
          } else {
            setAuthFeedback({
              type: 'error',
              message: result.message
            });
            // Clear PIN for retry after brief delay
            setTimeout(() => setPinInput(''), 600);
          }
        }
      }
    }
  };

  const clearPin = () => {
    setPinInput('');
    setAuthFeedback(null);
  };

  // Handle Phone + Password Login
  const handlePhonePasswordLogin = (e) => {
    e?.preventDefault();
    const matchedUser = users.find(u => u.phone === loginPhone.trim());
    if (!matchedUser) {
      setAuthFeedback({
        type: 'error',
        message: 'Số điện thoại không tồn tại trong hệ thống POSS!'
      });
      return;
    }

    if (matchedUser.status === 'LOCKED') {
      setAuthFeedback({
        type: 'error',
        message: `Tài khoản của ${matchedUser.name} đang bị tạm khóa theo quy định Spec 01!`
      });
      return;
    }

    if (onSwitchUser) {
      const res = onSwitchUser(matchedUser.id, '1234', true);
      if (res.success) {
        setAuthFeedback({
          type: 'success',
          message: `Đăng nhập mật khẩu thành công: ${matchedUser.name} (${matchedUser.role})!`
        });
      } else {
        setAuthFeedback({
          type: 'error',
          message: res.message
        });
      }
    }
  };

  // Handle Create User
  const handleCreateUser = () => {
    if (!formName.trim() || !formPhone.trim()) {
      alert('Vui lòng nhập tên và số điện thoại!');
      return;
    }

    const newUser = {
      id: `USR-00${users.length + 1}`,
      name: formName,
      phone: formPhone,
      email: formEmail || `${formPhone}@poss.vn`,
      role: formRole,
      assignedStores: [formStore],
      status: 'ACTIVE',
      pin: '1234',
      avatar: formRole === 'MANAGER' 
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    if (onAddUser) {
      onAddUser(newUser);
    }
    setShowAddModal(false);
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    alert(`Đã tạo tài khoản cho ${newUser.name} (${newUser.role}) thành công theo Spec 01!`);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Module Tabs Bar (Primary Navigation, always placed at top) */}
      <div className="module-tabs-bar">
        <button
          onClick={() => { setActiveTab('pinLogin'); setAuthFeedback(null); }}
          style={{
            fontWeight: activeTab === 'pinLogin' ? '700' : '500',
            background: activeTab === 'pinLogin' ? 'var(--accent-amber)' : 'var(--bg-tertiary)',
            color: activeTab === 'pinLogin' ? '#000' : 'var(--text-main)',
          }}
        >
          <KeyRound size={14} style={{ display: 'inline', marginRight: '6px' }} />
          Mô Phỏng Đăng Nhập PIN Nhanh & Chuyển Đổi User (Spec 01)
        </button>

        <button
          onClick={() => { setActiveTab('accounts'); setAuthFeedback(null); }}
          style={{
            fontWeight: activeTab === 'accounts' ? '700' : '500',
            background: activeTab === 'accounts' ? 'var(--accent-amber)' : 'var(--bg-tertiary)',
            color: activeTab === 'accounts' ? '#000' : 'var(--text-main)',
          }}
        >
          <UserCheck size={14} style={{ display: 'inline', marginRight: '6px' }} />
          Danh Sách Tài Khoản & Quyền ({users.length})
        </button>

        <button
          onClick={() => { setActiveTab('audit'); setAuthFeedback(null); }}
          style={{
            fontWeight: activeTab === 'audit' ? '700' : '500',
            background: activeTab === 'audit' ? 'var(--accent-amber)' : 'var(--bg-tertiary)',
            color: activeTab === 'audit' ? '#000' : 'var(--text-main)',
          }}
        >
          <History size={14} style={{ display: 'inline', marginRight: '6px' }} />
          Nhật Ký Hoạt Động (Audit Log)
        </button>
      </div>

      {/* Header */}
      <div className="module-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
            Đăng Nhập & Phân Quyền (Spec 01)
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Quản lý tài khoản 3 cấp (Owner, Manager, Staff), đăng nhập PIN nhanh quầy POS và nhật ký Audit Log
          </p>
        </div>

        {activeTab === 'accounts' && (currentUserRole === 'OWNER' || currentUserRole === 'MANAGER') && (
          <div className="module-header-actions">
            <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ fontSize: '13px' }}>
              <Plus size={16} /> Tạo Tài Khoản Mới
            </button>
          </div>
        )}
      </div>

      {/* =========================================================================
          Tab 2: PIN Keypad & Quick Switch (Spec 01 Core Logic)
          ========================================================================= */}
      {activeTab === 'pinLogin' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Step 1: User Selection Carousel/Grid */}
          <div className="card-glass" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#fff' }}>
                  1. Chọn nhân sự đổi ca / đăng nhập vào thiết bị:
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', marginLeft: '8px' }}>
                  (Mô phỏng trường hợp nhân viên chia sẻ chung máy POS tại cửa hàng)
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--accent-amber)', fontWeight: '700' }}>
                Đang phiên: {currentUser?.name} ({currentUserRole})
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
              {users.map(u => {
                const isSelected = u.id === targetUserId;
                const isCurrentSession = u.id === currentUser?.id;
                const isLocked = u.status === 'LOCKED';
                const roleObj = ROLES[u.role] || ROLES.STAFF;

                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      setTargetUserId(u.id);
                      clearPin();
                    }}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid var(--accent-amber)' : '1px solid var(--border-medium)',
                      background: isSelected ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-tertiary)',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                      position: 'relative',
                      opacity: isLocked ? 0.65 : 1
                    }}
                  >
                    {isCurrentSession && (
                      <span style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        fontSize: '9px',
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#34d399',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: '800'
                      }}>
                        ĐANG ĐĂNG NHẬP
                      </span>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img 
                        src={u.avatar} 
                        alt={u.name} 
                        style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${roleObj.color}` }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {u.name}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                          <span style={{ fontSize: '10px', color: roleObj.color, fontWeight: '700' }}>
                            {roleObj.name}
                          </span>
                          <span style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                            • {u.assignedStores?.[0] || 'Tất cả'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px' }}>
                      <span style={{ color: 'var(--text-dim)' }}>Mã PIN: <strong style={{ color: '#fff' }}>{u.pin || '1234'}</strong></span>
                      {isLocked ? (
                        <span style={{ color: '#f87171', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Lock size={11} /> Tạm khóa
                        </span>
                      ) : (
                        <span style={{ color: '#34d399', fontWeight: '600' }}>Sẵn sàng</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Auth Pad (PIN vs SĐT & Password) */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="card-glass" style={{ width: '100%', maxWidth: '420px', padding: '24px', textAlign: 'center' }}>
              
              {/* Method Switcher */}
              <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '3px', marginBottom: '20px' }}>
                <button
                  onClick={() => { setLoginMethod('pin'); setAuthFeedback(null); }}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: loginMethod === 'pin' ? '700' : '500',
                    background: loginMethod === 'pin' ? 'var(--accent-amber)' : 'transparent',
                    color: loginMethod === 'pin' ? '#000' : 'var(--text-muted)'
                  }}
                >
                  Đăng Nhập Mã PIN Nhanh
                </button>
                <button
                  onClick={() => { setLoginMethod('password'); setAuthFeedback(null); }}
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: loginMethod === 'password' ? '700' : '500',
                    background: loginMethod === 'password' ? 'var(--accent-amber)' : 'transparent',
                    color: loginMethod === 'password' ? '#000' : 'var(--text-muted)'
                  }}
                >
                  SĐT & Mật Khẩu
                </button>
              </div>

              {/* Sub-method A: PIN Numpad */}
              {loginMethod === 'pin' ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '14px' }}>
                    <img 
                      src={selectedTargetUser.avatar} 
                      alt={selectedTargetUser.name} 
                      style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-amber)' }}
                    />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>{selectedTargetUser.name}</div>
                      <div style={{ fontSize: '11px', color: ROLES[selectedTargetUser.role]?.color, fontWeight: '700' }}>
                        {ROLES[selectedTargetUser.role]?.name} • PIN test: {selectedTargetUser.pin || '1234'}
                      </div>
                    </div>
                  </div>

                  {selectedTargetUser.status === 'LOCKED' ? (
                    <div style={{
                      padding: '16px',
                      borderRadius: '10px',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#f87171',
                      fontSize: '12px',
                      marginBottom: '16px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontWeight: '800', fontSize: '13px', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <Lock size={16} /> Tài Khoản Đang Bị Tạm Khóa!
                      </div>
                      <div>Tài khoản này bị tạm khóa do nhập sai PIN quá 5 lần hoặc do Quản lý khóa.</div>
                      
                      {(currentUserRole === 'OWNER' || currentUserRole === 'MANAGER') && onToggleLockUser && (
                        <button
                          onClick={() => {
                            onToggleLockUser(selectedTargetUser.id);
                            setAuthFeedback({ type: 'success', message: `Đã mở khóa tài khoản cho ${selectedTargetUser.name}!` });
                          }}
                          className="btn-primary"
                          style={{ marginTop: '12px', fontSize: '12px', width: '100%', justifyContent: 'center' }}
                        >
                          <Unlock size={14} /> Mở Khóa Tài Khoản Này Ngay
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* PIN Dots */}
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginBottom: '20px' }}>
                        {[0, 1, 2, 3].map(idx => (
                          <div
                            key={idx}
                            style={{
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                              background: pinInput.length > idx ? 'var(--accent-amber)' : 'var(--bg-tertiary)',
                              border: '2px solid var(--border-medium)',
                              transition: 'all 150ms ease'
                            }}
                          />
                        ))}
                      </div>

                      {/* Numpad */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(btn => (
                          <button
                            key={btn}
                            onClick={() => {
                              if (btn === 'C') clearPin();
                              else if (btn === '⌫') setPinInput(pinInput.slice(0, -1));
                              else handlePinPress(btn);
                            }}
                            style={{
                              height: '50px',
                              borderRadius: '10px',
                              background: 'var(--bg-tertiary)',
                              border: '1px solid var(--border-medium)',
                              color: 'var(--text-main)',
                              fontSize: '18px',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}
                          >
                            {btn}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                /* Sub-method B: SĐT & Password Form */
                <form onSubmit={handlePhonePasswordLogin} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Số điện thoại</label>
                    <input 
                      type="text" 
                      inputMode="tel"
                      value={loginPhone} 
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className="input-dark" 
                      placeholder="VD: 0912345678"
                      style={{ marginTop: '4px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Mật khẩu</label>
                    <input 
                      type="password" 
                      value={loginPassword} 
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="input-dark" 
                      placeholder="Nhập mật khẩu..."
                      style={{ marginTop: '4px' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', margin: '4px 0' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Tài khoản test nhanh:</span>
                    {users.slice(0, 3).map(u => (
                      <span 
                        key={u.id}
                        onClick={() => {
                          setLoginPhone(u.phone);
                          setLoginPassword('123456');
                        }}
                        style={{ fontSize: '10px', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', cursor: 'pointer', color: 'var(--accent-amber)' }}
                      >
                        {u.name.split(' ').slice(-1)[0]}
                      </span>
                    ))}
                  </div>

                  <button type="submit" className="btn-primary" style={{ marginTop: '8px', justifyContent: 'center' }}>
                    <LogIn size={16} /> Đăng Nhập
                  </button>
                </form>
              )}

              {/* Feedback Alert */}
              {authFeedback && (
                <div style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: authFeedback.type === 'success' ? '#10b981' : '#f87171',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: authFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  border: `1px solid ${authFeedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  marginTop: '14px',
                  textAlign: 'center'
                }}>
                  <div>{authFeedback.message}</div>
                  {authFeedback.type === 'success' && onNavigate && (
                    <button
                      onClick={() => onNavigate('pos')}
                      className="btn-primary"
                      style={{ marginTop: '10px', fontSize: '12px', width: '100%', justifyContent: 'center' }}
                    >
                      <ShoppingBag size={14} /> Chuyển Đến Màn Hình Bán Hàng (POS)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          Tab 1: Accounts List & Permissions (Spec 01)
          ========================================================================= */}
      {activeTab === 'accounts' && (
        <div className="table-responsive">
          <table style={{ minWidth: '660px', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-dim)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Nhân sự</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Số điện thoại</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Mã PIN</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Vai trò phân quyền</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Chi nhánh gán</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Trạng thái</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const roleObj = ROLES[u.role] || ROLES.STAFF;
                const isLocked = u.status === 'LOCKED';
                const isCurrent = u.id === currentUser?.id;

                // Spec 01 Permission Rules:
                // Owner can lock/unlock Manager & Staff.
                // Manager can only lock/unlock Staff.
                // Cannot lock the last Owner.
                const canToggleLock = (
                  (currentUserRole === 'OWNER' && u.role !== 'OWNER') ||
                  (currentUserRole === 'MANAGER' && u.role === 'STAFF')
                );

                return (
                  <tr 
                    key={u.id} 
                    style={{ 
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isCurrent ? 'rgba(245, 158, 11, 0.04)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img 
                          src={u.avatar} 
                          alt={u.name} 
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: isCurrent ? '2px solid var(--accent-amber)' : 'none' }}
                        />
                        <div>
                          <div style={{ fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{u.name}</span>
                            {isCurrent && (
                              <span style={{ fontSize: '9px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '1px 6px', borderRadius: '3px', fontWeight: '800' }}>
                                HIỆN TẠI
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{u.phone}</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', fontWeight: '700', whiteSpace: 'nowrap' }}>
                      {u.pin || '1234'}
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '11px',
                        fontWeight: '800',
                        background: roleObj.bg,
                        color: roleObj.color,
                        border: `1px solid ${roleObj.color}40`,
                        whiteSpace: 'nowrap'
                      }}>
                        {roleObj.name}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {u.assignedStores?.join(', ') || 'Tất cả chi nhánh'}
                    </td>
                    <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                      <span className={`badge ${isLocked ? 'badge-owner' : 'badge-staff'}`}>
                        {isLocked ? 'Tạm khóa' : 'Đang hoạt động'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {canToggleLock ? (
                        <button
                          onClick={() => {
                            if (onToggleLockUser) onToggleLockUser(u.id);
                          }}
                          style={{
                            background: 'transparent',
                            color: isLocked ? '#10b981' : '#f87171',
                            padding: '4px 8px',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          {isLocked ? 'Mở khóa' : 'Khóa tài khoản'}
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* =========================================================================
          Tab 3: Audit Trail Log (Spec 01)
          ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="card-glass" style={{ padding: '20px' }}>
          <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '14px' }}>
            Nhật Ký Hoạt Động Hệ Thống (Audit Trail - Spec 01)
          </div>
          <div className="table-responsive" style={{ marginBottom: 0 }}>
            <table style={{ minWidth: '550px', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-dim)', textAlign: 'left' }}>
                  <th style={{ padding: '8px', whiteSpace: 'nowrap' }}>Thời gian</th>
                  <th style={{ padding: '8px', whiteSpace: 'nowrap' }}>Người thực hiện</th>
                  <th style={{ padding: '8px', whiteSpace: 'nowrap' }}>Loại hành động</th>
                  <th style={{ padding: '8px', whiteSpace: 'nowrap' }}>Chi tiết thay đổi</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 8px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{log.time}</td>
                    <td style={{ padding: '10px 8px', fontWeight: '700', whiteSpace: 'nowrap' }}>{log.user}</td>
                    <td style={{ padding: '10px 8px', whiteSpace: 'nowrap' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', fontWeight: '600', fontSize: '11px' }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>{log.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '440px', padding: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px' }}>Thêm Tài Khoản Nhân Sự Mới</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Họ và tên</label>
                <input 
                  type="text" 
                  value={formName} 
                  onChange={(e) => setFormName(e.target.value)} 
                  className="input-dark" 
                  placeholder="VD: Hoàng Minh Nhật"
                  style={{ marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Số điện thoại đăng nhập</label>
                <input 
                  type="text" 
                  inputMode="tel"
                  value={formPhone} 
                  onChange={(e) => setFormPhone(e.target.value)} 
                  className="input-dark" 
                  placeholder="VD: 0987654321"
                  style={{ marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Vai trò phân quyền</label>
                <select 
                  value={formRole} 
                  onChange={(e) => setFormRole(e.target.value)} 
                  className="input-dark" 
                  style={{ marginTop: '4px' }}
                >
                  {currentUserRole === 'OWNER' && <option value="MANAGER">Manager (Quản lý cửa hàng)</option>}
                  <option value="STAFF">Staff (Nhân viên thu ngân / quầy POS)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Cửa hàng phân công</label>
                <select 
                  value={formStore} 
                  onChange={(e) => setFormStore(e.target.value)} 
                  className="input-dark" 
                  style={{ marginTop: '4px' }}
                >
                  {stores.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ flex: 1 }}>Hủy</button>
              <button onClick={handleCreateUser} className="btn-primary" style={{ flex: 1 }}>Tạo Tài Khoản</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
