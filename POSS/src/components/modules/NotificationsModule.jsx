import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  CheckCheck, 
  ShieldAlert, 
  Boxes, 
  Clock, 
  Users, 
  Filter, 
  X,
  Volume2,
  Moon,
  BellOff
} from 'lucide-react';
import { INITIAL_NOTIFICATIONS, INITIAL_STORES } from '../../data/mockData';

export function NotificationsModule({ notifications, setNotifications, onNavigate, currentUserRole }) {
  const [list, setList] = useState(notifications || INITIAL_NOTIFICATIONS);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD' | 'INVENTORY' | 'INTERNAL'
  const [dndMode, setDndMode] = useState(false);

  // Send internal notification modal
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendTitle, setSendTitle] = useState('');
  const [sendContent, setSendContent] = useState('');
  const [sendTarget, setSendTarget] = useState('ALL_CHAIN');

  const filtered = list.filter(n => {
    if (filter === 'UNREAD') return n.unread;
    if (filter === 'INVENTORY') return n.type === 'INVENTORY';
    if (filter === 'INTERNAL') return n.type === 'INTERNAL';
    return true;
  });

  const markAllRead = () => {
    const updated = list.map(n => ({ ...n, unread: false }));
    setList(updated);
    if (setNotifications) setNotifications(updated);
  };

  const handleSendInternal = () => {
    if (!sendTitle.trim() || !sendContent.trim()) {
      alert('Vui lòng nhập tiêu đề và nội dung thông báo!');
      return;
    }

    const newNoti = {
      id: `NOTI-${Date.now().toString().slice(-4)}`,
      title: sendTitle,
      content: sendContent,
      type: 'INTERNAL',
      unread: true,
      time: 'Vừa xong',
      deepLink: 'notifications'
    };

    const updated = [newNoti, ...list];
    setList(updated);
    if (setNotifications) setNotifications(updated);
    setShowSendModal(false);
    alert('Đã phát thông báo nội bộ đến toàn bộ nhân viên mục tiêu!');
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Filter Tabs (Primary Navigation, always placed at top) */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div className="module-tabs-bar" style={{ marginBottom: 0 }}>
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'UNREAD', label: 'Chưa đọc' },
            { id: 'INVENTORY', label: 'Cảnh báo kho' },
            { id: 'INTERNAL', label: 'Thông báo nội bộ' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: filter === f.id ? '700' : '500',
                background: filter === f.id ? 'var(--accent-amber)' : 'var(--bg-tertiary)',
                color: filter === f.id ? '#000' : 'var(--text-main)',
                border: '1px solid var(--border-medium)',
                cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setDndMode(!dndMode)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            background: dndMode ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-tertiary)',
            color: dndMode ? '#ef4444' : 'var(--text-muted)',
            border: `1px solid ${dndMode ? '#ef444450' : 'var(--border-medium)'}`,
            fontSize: '11px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          {dndMode ? <BellOff size={13} color="#ef4444" /> : <Volume2 size={13} />}
          <span>{dndMode ? 'Đang bật Không làm phiền' : 'Bật Không làm phiền (DND)'}</span>
        </button>
      </div>

      {/* Header */}
      <div className="module-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
            Trung Tâm Thông Báo (Spec 11)
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Cảnh báo tồn kho, nhắc việc ca bán hàng, giao tiếp nội bộ chuỗi và chế độ Không Làm Phiền
          </p>
        </div>

        <div className="module-header-actions">
          <button onClick={markAllRead} className="btn-secondary" style={{ fontSize: '12px' }}>
            <CheckCheck size={15} /> Đánh dấu đã đọc
          </button>
          {(currentUserRole === 'OWNER' || currentUserRole === 'MANAGER') && (
            <button onClick={() => setShowSendModal(true)} className="btn-primary" style={{ fontSize: '12px' }}>
              <Send size={15} /> Gửi Thông Báo
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filtered.map(item => (
          <div
            key={item.id}
            onClick={() => {
              if (item.deepLink) onNavigate(item.deepLink);
            }}
            className="card-glass"
            style={{
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              borderLeft: item.unread ? '4px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
              background: item.unread ? 'rgba(245, 158, 11, 0.04)' : 'var(--bg-card)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: item.type === 'INVENTORY' ? 'rgba(239, 68, 68, 0.15)' : item.type === 'LOYALTY' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: item.type === 'INVENTORY' ? '#f87171' : item.type === 'LOYALTY' ? '#a78bfa' : '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {item.type === 'INVENTORY' ? <Boxes size={18} /> : item.type === 'LOYALTY' ? <Users size={18} /> : <Bell size={18} />}
              </div>

              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  {item.content}
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginBottom: '4px' }}>{item.time}</div>
              {item.unread && (
                <span style={{ fontSize: '10px', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                  Mới
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Send Internal Message Modal */}
      {showSendModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '460px', padding: '22px' }}>
            <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px' }}>Soạn Thông Báo Nội Bộ Chuỗi</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Gửi đến đối tượng</label>
                <select 
                  value={sendTarget} 
                  onChange={(e) => setSendTarget(e.target.value)} 
                  className="input-dark" 
                  style={{ marginTop: '4px' }}
                >
                  <option value="ALL_CHAIN">Toàn bộ nhân sự toàn chuỗi</option>
                  <option value="MANAGERS">Chỉ Quản lý các cửa hàng</option>
                  <option value="CAUGIAY">Chỉ nhân viên Ba.li Poss Cầu Giấy</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Tiêu đề thông báo</label>
                <input 
                  type="text" 
                  placeholder="VD: Nhắc nhở vệ sinh quầy pha chế trước 23:00" 
                  value={sendTitle} 
                  onChange={(e) => setSendTitle(e.target.value)} 
                  className="input-dark" 
                  style={{ marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Nội dung thông báo</label>
                <textarea 
                  rows={4} 
                  placeholder="Nhập nội dung chi tiết..." 
                  value={sendContent} 
                  onChange={(e) => setSendContent(e.target.value)} 
                  className="input-dark" 
                  style={{ marginTop: '4px', resize: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowSendModal(false)} className="btn-secondary" style={{ flex: 1 }}>Hủy</button>
              <button onClick={handleSendInternal} className="btn-primary" style={{ flex: 1 }}>Gửi Thông Báo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
