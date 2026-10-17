import React from 'react';
import { X } from 'lucide-react';
import { SHIFT_STATUS_META } from '../../../utils/hr';

export function EmployeeCell({ user, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <img
        src={user.avatar}
        alt={user.name}
        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, background: 'var(--bg-tertiary)' }}
      />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: '700', fontSize: '13px', whiteSpace: 'nowrap' }}>{user.name}</div>
        {subtitle && <div style={{ fontSize: '11px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{subtitle}</div>}
      </div>
    </div>
  );
}

export function StatusPill({ status }) {
  const meta = SHIFT_STATUS_META[status];
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', color: meta.color, background: meta.bg, whiteSpace: 'nowrap' }}>
      {meta.label}
    </span>
  );
}

export function ModalShell({ title, subtitle, onClose, children, maxWidth = '460px' }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ width: '100%', maxWidth, padding: '24px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '17px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>{title}</div>
            {subtitle && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitle}</div>}
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-dim)', padding: '4px' }} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function FormError({ message }) {
  if (!message) return null;
  return (
    <div style={{ padding: '10px 12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '12px', marginBottom: '12px' }}>
      {message}
    </div>
  );
}

export function ConfirmModal({ title, message, confirmLabel, onConfirm, onClose, danger = false }) {
  return (
    <ModalShell title={title} onClose={onClose} maxWidth="420px">
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '18px' }}>{message}</div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button className="btn-secondary" style={{ fontSize: '13px' }} onClick={onClose}>Hủy bỏ</button>
        <button
          className={danger ? 'btn-danger' : 'btn-primary'}
          style={{ fontSize: '13px' }}
          onClick={() => { onConfirm(); onClose(); }}
        >
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}
