import React, { useState } from 'react';
import { PencilLine } from 'lucide-react';
import { ROLES } from '../../../data/mockData';
import { SALARY_TYPES, formatVnd, getProfile } from '../../../utils/hr';
import { EmployeeCell, FormError, ModalShell } from './shared';
import { LABEL_STYLE, ROW_STYLE, TD_STYLE, THEAD_ROW_STYLE, TH_STYLE } from './styles';

export function ProfilesTab({ ctx }) {
  const { visibleEmployees, isOwner, hrData, setHrData, onAuditLog } = ctx;
  const [editingUser, setEditingUser] = useState(null);

  return (
    <div>
      {!isOwner && (
        <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '10px' }}>
          Chỉ Owner được thay đổi mức lương, loại lương và phụ cấp (Spec 13).
        </div>
      )}
      <div className="table-responsive">
        <table style={{ fontSize: '13px', minWidth: '900px' }}>
          <thead>
            <tr style={THEAD_ROW_STYLE}>
              <th style={TH_STYLE}>Nhân viên</th>
              <th style={TH_STYLE}>Vai trò</th>
              <th style={TH_STYLE}>Vị trí</th>
              <th style={TH_STYLE}>Loại lương</th>
              <th style={{ ...TH_STYLE, textAlign: 'right' }}>Mức lương</th>
              <th style={{ ...TH_STYLE, textAlign: 'right' }}>Phụ cấp / ca</th>
              <th style={TH_STYLE}>Ngày vào làm</th>
              <th style={TH_STYLE}>Tài khoản</th>
              {isOwner && <th style={{ ...TH_STYLE, textAlign: 'right' }}>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {visibleEmployees.map((user) => {
              const hasProfile = Boolean(hrData.profiles[user.id]);
              const profile = getProfile(hrData.profiles, user.id);
              const role = ROLES[user.role];
              return (
                <tr key={user.id} style={ROW_STYLE}>
                  <td style={TD_STYLE}><EmployeeCell user={user} subtitle={user.phone} /></td>
                  <td style={TD_STYLE}>
                    <span className={`badge ${user.role === 'MANAGER' ? 'badge-manager' : 'badge-staff'}`}>{role?.name}</span>
                  </td>
                  <td style={TD_STYLE}>
                    {profile.position}
                    {!hasProfile && <div style={{ fontSize: '11px', color: '#fbbf24' }}>Đang dùng mức lương mặc định</div>}
                  </td>
                  <td style={TD_STYLE}>{SALARY_TYPES[profile.salaryType]}</td>
                  <td style={{ ...TD_STYLE, textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                    {formatVnd(profile.rate)}<span style={{ color: 'var(--text-dim)', fontWeight: '500' }}>/{profile.salaryType === 'MONTHLY' ? 'tháng' : 'giờ'}</span>
                  </td>
                  <td style={{ ...TD_STYLE, textAlign: 'right', fontFamily: 'var(--font-mono)' }}>{formatVnd(profile.allowancePerShift)}</td>
                  <td style={{ ...TD_STYLE, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    {profile.startDate ? profile.startDate.split('-').reverse().join('/') : '—'}
                  </td>
                  <td style={TD_STYLE}>
                    <span className={`badge ${user.status === 'LOCKED' ? 'badge-owner' : 'badge-staff'}`}>
                      {user.status === 'LOCKED' ? 'Đang khóa' : 'Hoạt động'}
                    </span>
                  </td>
                  {isOwner && (
                    <td style={{ ...TD_STYLE, textAlign: 'right' }}>
                      <button className="btn-secondary" style={{ fontSize: '12px', padding: '6px 10px' }} onClick={() => setEditingUser(user)}>
                        <PencilLine size={14} /> <span>Sửa</span>
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
            {visibleEmployees.length === 0 && (
              <tr><td colSpan={9} style={{ padding: '28px', textAlign: 'center', color: 'var(--text-dim)' }}>Cửa hàng chưa có nhân viên.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editingUser && (
        <EditProfileModal
          user={editingUser}
          profile={getProfile(hrData.profiles, editingUser.id)}
          onClose={() => setEditingUser(null)}
          onSave={(next) => {
            const prevProfile = getProfile(hrData.profiles, editingUser.id);
            setHrData((prev) => ({ ...prev, profiles: { ...prev.profiles, [editingUser.id]: next } }));
            onAuditLog(
              'SỬA HỒ SƠ LƯƠNG',
              `${editingUser.name}: ${SALARY_TYPES[prevProfile.salaryType]} ${formatVnd(prevProfile.rate)} → ${SALARY_TYPES[next.salaryType]} ${formatVnd(next.rate)}, phụ cấp ${formatVnd(next.allowancePerShift)}/ca.`,
            );
            setEditingUser(null);
          }}
        />
      )}
    </div>
  );
}

function EditProfileModal({ user, profile, onClose, onSave }) {
  const [position, setPosition] = useState(profile.position === 'Chưa thiết lập' ? '' : profile.position);
  const [salaryType, setSalaryType] = useState(profile.salaryType);
  const [rate, setRate] = useState(String(profile.rate));
  const [allowance, setAllowance] = useState(String(profile.allowancePerShift));
  const [startDate, setStartDate] = useState(profile.startDate || user.createdAt || '');
  const [error, setError] = useState('');

  const handleSave = () => {
    const rateValue = Number(rate);
    const allowanceValue = Number(allowance || 0);
    if (!position.trim()) return setError('Vui lòng nhập vị trí công việc.');
    if (!Number.isFinite(rateValue) || rateValue <= 0) return setError('Mức lương phải lớn hơn 0.');
    if (!Number.isFinite(allowanceValue) || allowanceValue < 0) return setError('Phụ cấp không hợp lệ.');
    onSave({
      position: position.trim(),
      salaryType,
      rate: Math.round(rateValue),
      allowancePerShift: Math.round(allowanceValue),
      startDate: startDate || null,
    });
  };

  return (
    <ModalShell title="Sửa hồ sơ lương" subtitle={user.name} onClose={onClose}>
      <FormError message={error} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
        <div>
          <label style={LABEL_STYLE}>Vị trí công việc</label>
          <input className="input-dark" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="VD: Pha chế (Barista)" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label style={LABEL_STYLE}>Loại lương</label>
            <select className="input-dark" value={salaryType} onChange={(e) => setSalaryType(e.target.value)}>
              {Object.entries(SALARY_TYPES).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </div>
          <div>
            <label style={LABEL_STYLE}>Mức lương (đ/{salaryType === 'MONTHLY' ? 'tháng' : 'giờ'})</label>
            <input type="number" min="0" className="input-dark" value={rate} onChange={(e) => setRate(e.target.value)} />
          </div>
          <div>
            <label style={LABEL_STYLE}>Phụ cấp mỗi ca (đ)</label>
            <input type="number" min="0" className="input-dark" value={allowance} onChange={(e) => setAllowance(e.target.value)} />
          </div>
          <div>
            <label style={LABEL_STYLE}>Ngày vào làm</label>
            <input type="date" className="input-dark" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button className="btn-secondary" style={{ fontSize: '13px' }} onClick={onClose}>Hủy bỏ</button>
        <button className="btn-primary" style={{ fontSize: '13px' }} onClick={handleSave}>Lưu hồ sơ</button>
      </div>
    </ModalShell>
  );
}
