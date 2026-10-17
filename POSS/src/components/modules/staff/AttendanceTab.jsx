import React, { useMemo, useState } from 'react';
import { LogIn, LogOut, PencilLine, CalendarDays, Info } from 'lucide-react';
import {
  HR_CONFIG,
  SHIFT_TEMPLATES,
  SHIFT_STATUS_META,
  evaluateShift,
  formatDateVi,
  formatHours,
  getShiftTemplate,
  isCheckInOpen,
  isShiftOver,
  timeNow,
  timeToMinutes,
  toDateKey,
} from '../../../utils/hr';
import { EmployeeCell, FormError, ModalShell, StatusPill } from './shared';
import { LABEL_STYLE, ROW_STYLE, TD_STYLE, THEAD_ROW_STYLE, TH_STYLE } from './styles';

const shiftOrder = (code) => SHIFT_TEMPLATES.findIndex((t) => t.code === code);
const openTime = (tpl) => {
  const m = timeToMinutes(tpl.start) - HR_CONFIG.checkInOpenMinutes;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
};

export function AttendanceTab({ ctx }) {
  const {
    employees, visibleEmployees, currentUser, currentUserRole, canManage,
    selectedStore, hrData, setHrData, onAuditLog, now, isMonthLocked,
  } = ctx;

  const todayKey = toDateKey(now);
  const [viewDate, setViewDate] = useState(todayKey);
  const [employeeFilter, setEmployeeFilter] = useState('ALL');
  const [feedback, setFeedback] = useState(null);
  const [editingEntry, setEditingEntry] = useState(null);

  const recordById = useMemo(() => new Map(hrData.attendance.map((r) => [r.id, r])), [hrData.attendance]);
  const userById = useMemo(() => new Map(employees.map((u) => [u.id, u])), [employees]);

  const isSelfEmployee = userById.has(currentUser.id);
  const effectiveFilter = !canManage
    ? currentUser.id
    : (employeeFilter !== 'ALL' && userById.has(employeeFilter) ? employeeFilter : 'ALL');

  const upsertRecord = (record) => {
    setHrData((prev) => ({
      ...prev,
      attendance: [...prev.attendance.filter((r) => r.id !== record.id), record],
    }));
  };

  // ---------- Ca của tôi hôm nay ----------
  const myTodayEntries = hrData.schedule
    .filter((e) => e.userId === currentUser.id && e.date === todayKey && e.storeId === selectedStore.id)
    .sort((a, b) => shiftOrder(a.shiftCode) - shiftOrder(b.shiftCode));

  const handleCheckIn = (entry) => {
    const tpl = getShiftTemplate(entry.shiftCode);
    const at = new Date();
    if (isMonthLocked(entry.date.slice(0, 7))) {
      setFeedback({ type: 'error', message: 'Bảng lương tháng này đã chốt, không thể chấm công.' });
      return;
    }
    if (!isCheckInOpen(entry, at)) {
      setFeedback({ type: 'error', message: `${tpl.name} chỉ được chấm công vào từ ${openTime(tpl)} đến ${tpl.end}.` });
      return;
    }
    const checkIn = timeNow(at);
    upsertRecord({ id: entry.id, userId: entry.userId, date: entry.date, shiftCode: entry.shiftCode, checkIn, checkOut: null });

    const result = evaluateShift(entry, { checkIn }, at);
    const lateNote = result.isLate ? ` (đi muộn ${result.lateMinutes} phút)` : '';
    onAuditLog('CHẤM CÔNG VÀO CA', `${currentUser.name} vào ${tpl.name} ${formatDateVi(entry.date)} lúc ${checkIn}${lateNote}.`);
    setFeedback({
      type: result.isLate ? 'warn' : 'success',
      message: result.isLate
        ? `Đã vào ca lúc ${checkIn} — đi muộn ${result.lateMinutes} phút, phạt ${HR_CONFIG.latePenalty.toLocaleString('vi-VN')}đ theo Spec 13.`
        : `Đã vào ${tpl.name} lúc ${checkIn}. Chúc ca làm việc vui vẻ!`,
    });
  };

  const handleCheckOut = (entry) => {
    const record = recordById.get(entry.id);
    const tpl = getShiftTemplate(entry.shiftCode);
    const checkOut = timeNow();
    upsertRecord({ ...record, checkOut });
    onAuditLog('CHẤM CÔNG RA CA', `${currentUser.name} ra ${tpl.name} ${formatDateVi(entry.date)} lúc ${checkOut}.`);
    setFeedback({ type: 'success', message: `Đã ra ca lúc ${checkOut}.` });
  };

  // ---------- Bảng chấm công ----------
  const visibleIds = new Set(visibleEmployees.map((u) => u.id));
  const monthOfView = viewDate.slice(0, 7);
  const rows = hrData.schedule
    .filter((e) => e.storeId === selectedStore.id && visibleIds.has(e.userId))
    .filter((e) => (effectiveFilter === 'ALL'
      ? e.date === viewDate
      : e.userId === effectiveFilter && e.date.startsWith(monthOfView)))
    .sort((a, b) => a.date.localeCompare(b.date)
      || shiftOrder(a.shiftCode) - shiftOrder(b.shiftCode)
      || (userById.get(a.userId)?.name || '').localeCompare(userById.get(b.userId)?.name || ''))
    .map((entry) => {
      const record = recordById.get(entry.id);
      return { entry, record, result: evaluateShift(entry, record, now) };
    });

  const statusCounts = rows.reduce((acc, r) => ({ ...acc, [r.result.status]: (acc[r.result.status] || 0) + 1 }), {});
  const totalWorked = rows.reduce((s, r) => s + r.result.workedMinutes, 0);

  const canEdit = (entry) => canManage
    && entry.date <= todayKey
    && !isMonthLocked(entry.date.slice(0, 7))
    && !(currentUserRole === 'MANAGER' && entry.userId === currentUser.id);

  const feedbackColors = {
    success: { color: '#34d399', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' },
    warn: { color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
    error: { color: '#f87171', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' },
  };

  return (
    <div>
      {/* Ca của tôi hôm nay */}
      <div className="card-glass" style={{ padding: '18px', marginBottom: '20px' }}>
        <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>
          Ca của tôi hôm nay — {formatDateVi(todayKey)}
        </div>

        {feedback && (
          <div style={{
            padding: '10px 12px', borderRadius: '8px', fontSize: '12px', marginBottom: '12px',
            color: feedbackColors[feedback.type].color,
            background: feedbackColors[feedback.type].bg,
            border: `1px solid ${feedbackColors[feedback.type].border}`,
          }}>
            {feedback.message}
          </div>
        )}

        {!isSelfEmployee ? (
          <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            <Info size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>
              {currentUserRole === 'OWNER'
                ? 'Owner không chấm công. Để thử chấm công, đăng nhập PIN bằng tài khoản nhân viên (ví dụ Lê Hoàng Nam — PIN 1234) trên thanh điều hướng.'
                : `Bạn không thuộc ${selectedStore.name}. Chọn đúng cửa hàng được phân công để chấm công.`}
            </span>
          </div>
        ) : myTodayEntries.length === 0 ? (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Hôm nay bạn không có ca nào trong lịch.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {myTodayEntries.map((entry) => {
              const tpl = getShiftTemplate(entry.shiftCode);
              const record = recordById.get(entry.id);
              const result = evaluateShift(entry, record, now);
              const open = isCheckInOpen(entry, now);
              const over = isShiftOver(entry, now);

              return (
                <div key={entry.id} style={{ padding: '14px', borderRadius: '12px', background: 'var(--bg-tertiary)', borderLeft: `4px solid ${tpl.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '14px' }}>{tpl.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{tpl.start} – {tpl.end}</div>
                    </div>
                    <StatusPill status={result.status} />
                  </div>

                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px', margin: '10px 0', color: 'var(--text-muted)' }}>
                    <span>Vào: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>{record?.checkIn || '--:--'}</strong></span>
                    <span>Ra: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>{record?.checkOut || '--:--'}</strong></span>
                  </div>

                  {!record?.checkIn && !record?.excused && (
                    open ? (
                      <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '13px' }} onClick={() => handleCheckIn(entry)}>
                        <LogIn size={16} /> <span>Chấm công vào ca</span>
                      </button>
                    ) : (
                      <button className="btn-secondary" disabled style={{ width: '100%', justifyContent: 'center', fontSize: '12px', opacity: 0.6, cursor: 'not-allowed' }}>
                        {over ? 'Ca đã kết thúc' : `Mở chấm công lúc ${openTime(tpl)}`}
                      </button>
                    )
                  )}

                  {record?.checkIn && !record.checkOut && (
                    <button
                      className="btn-primary"
                      style={{ width: '100%', justifyContent: 'center', fontSize: '13px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff' }}
                      onClick={() => handleCheckOut(entry)}
                    >
                      <LogOut size={16} /> <span>Chấm công ra ca</span>
                    </button>
                  )}

                  {record?.checkOut && (
                    <div style={{ fontSize: '12px', color: '#34d399', fontWeight: '600' }}>
                      Hoàn thành ca · {formatHours(result.workedMinutes)} công
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bộ lọc bảng chấm công */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end', marginBottom: '12px' }}>
        <div>
          <label style={LABEL_STYLE}>{effectiveFilter === 'ALL' ? 'Ngày' : 'Tháng của ngày'}</label>
          <input type="date" className="input-dark" value={viewDate} onChange={(e) => e.target.value && setViewDate(e.target.value)} style={{ width: '170px' }} />
        </div>
        {canManage && (
          <div>
            <label style={LABEL_STYLE}>Nhân viên</label>
            <select className="input-dark" value={effectiveFilter} onChange={(e) => setEmployeeFilter(e.target.value)} style={{ width: '220px' }}>
              <option value="ALL">Tất cả nhân viên (theo ngày)</option>
              {visibleEmployees.map((u) => <option key={u.id} value={u.id}>{u.name} (cả tháng)</option>)}
            </select>
          </div>
        )}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginLeft: 'auto' }}>
          {Object.entries(statusCounts).map(([status, count]) => (
            <span key={status} style={{ fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '9999px', color: SHIFT_STATUS_META[status].color, background: SHIFT_STATUS_META[status].bg }}>
              {SHIFT_STATUS_META[status].label}: {count}
            </span>
          ))}
          <span style={{ fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '9999px', background: 'var(--bg-tertiary)' }}>
            Tổng công: {formatHours(totalWorked)}
          </span>
        </div>
      </div>

      <div className="table-responsive">
        <table style={{ fontSize: '13px', minWidth: '860px' }}>
          <thead>
            <tr style={THEAD_ROW_STYLE}>
              <th style={TH_STYLE}>Ngày</th>
              <th style={TH_STYLE}>Nhân viên</th>
              <th style={TH_STYLE}>Ca</th>
              <th style={TH_STYLE}>Vào</th>
              <th style={TH_STYLE}>Ra</th>
              <th style={TH_STYLE}>Trạng thái</th>
              <th style={TH_STYLE}>Giờ công</th>
              <th style={TH_STYLE}>Ghi chú</th>
              {canManage && <th style={{ ...TH_STYLE, textAlign: 'right' }}>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={canManage ? 9 : 8} style={{ padding: '28px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  <CalendarDays size={20} style={{ display: 'block', margin: '0 auto 6px' }} />
                  Không có ca nào được xếp.
                </td>
              </tr>
            )}
            {rows.map(({ entry, record, result }) => {
              const user = userById.get(entry.userId);
              const tpl = getShiftTemplate(entry.shiftCode);
              return (
                <tr key={entry.id} style={ROW_STYLE}>
                  <td style={{ ...TD_STYLE, fontFamily: 'var(--font-mono)', color: entry.date === todayKey ? 'var(--accent-amber)' : 'var(--text-muted)' }}>{formatDateVi(entry.date)}</td>
                  <td style={TD_STYLE}>{user && <EmployeeCell user={user} />}</td>
                  <td style={TD_STYLE}>
                    <span style={{ color: tpl.color, fontWeight: '700' }}>{tpl.name}</span>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{tpl.start}–{tpl.end}</div>
                  </td>
                  <td style={{ ...TD_STYLE, fontFamily: 'var(--font-mono)' }}>{record?.checkIn || '--:--'}</td>
                  <td style={{ ...TD_STYLE, fontFamily: 'var(--font-mono)' }}>{record?.checkOut || '--:--'}</td>
                  <td style={TD_STYLE}>
                    <StatusPill status={result.status} />
                    {result.isLate && result.status !== 'LATE' && (
                      <div style={{ fontSize: '11px', color: '#fbbf24', marginTop: '2px' }}>+ đi muộn {result.lateMinutes}p</div>
                    )}
                    {result.status === 'LATE' && <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>trễ {result.lateMinutes} phút</div>}
                    {result.status === 'EARLY' && <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>sớm {result.earlyMinutes} phút</div>}
                  </td>
                  <td style={{ ...TD_STYLE, fontFamily: 'var(--font-mono)', fontWeight: '700' }}>{result.workedMinutes ? formatHours(result.workedMinutes) : '—'}</td>
                  <td style={{ ...TD_STYLE, whiteSpace: 'normal', fontSize: '12px', color: 'var(--text-muted)', maxWidth: '220px' }}>
                    {record?.editReason ? <>{record.editReason}<div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Sửa bởi {record.editedBy}</div></> : '—'}
                  </td>
                  {canManage && (
                    <td style={{ ...TD_STYLE, textAlign: 'right' }}>
                      {canEdit(entry) ? (
                        <button className="btn-secondary" style={{ fontSize: '12px', padding: '6px 10px' }} onClick={() => setEditingEntry(entry)}>
                          <PencilLine size={14} /> <span>Sửa</span>
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                          {isMonthLocked(entry.date.slice(0, 7)) ? 'Đã chốt lương' : entry.date > todayKey ? 'Chưa diễn ra' : 'Không có quyền'}
                        </span>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editingEntry && (
        <EditAttendanceModal
          entry={editingEntry}
          record={recordById.get(editingEntry.id)}
          user={userById.get(editingEntry.userId)}
          onClose={() => setEditingEntry(null)}
          onSave={(record, isExcused) => {
            const tpl = getShiftTemplate(editingEntry.shiftCode);
            const userName = userById.get(editingEntry.userId)?.name;
            upsertRecord({ ...record, editedBy: currentUser.name });
            onAuditLog(
              isExcused ? 'GHI NHẬN NGHỈ PHÉP' : 'SỬA CHẤM CÔNG',
              isExcused
                ? `${userName} nghỉ có phép ${tpl.name} ${formatDateVi(editingEntry.date)}. Lý do: ${record.editReason}`
                : `${userName} — ${tpl.name} ${formatDateVi(editingEntry.date)}: vào ${record.checkIn} / ra ${record.checkOut || '--:--'}. Lý do: ${record.editReason}`,
            );
            setEditingEntry(null);
          }}
        />
      )}
    </div>
  );
}

function EditAttendanceModal({ entry, record, user, onClose, onSave }) {
  const tpl = getShiftTemplate(entry.shiftCode);
  const [excused, setExcused] = useState(Boolean(record?.excused));
  const [checkIn, setCheckIn] = useState(record?.checkIn || tpl.start);
  const [checkOut, setCheckOut] = useState(record?.checkOut || tpl.end);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!reason.trim()) return setError('Bắt buộc nhập lý do sửa chấm công (Spec 13).');
    if (!excused) {
      if (!checkIn) return setError('Vui lòng nhập giờ vào ca.');
      if (checkOut && timeToMinutes(checkOut) <= timeToMinutes(checkIn)) return setError('Giờ ra phải sau giờ vào.');
    }
    onSave({
      id: entry.id,
      userId: entry.userId,
      date: entry.date,
      shiftCode: entry.shiftCode,
      checkIn: excused ? null : checkIn,
      checkOut: excused ? null : (checkOut || null),
      excused,
      editReason: reason.trim(),
    }, excused);
  };

  return (
    <ModalShell title="Sửa chấm công / bù công" subtitle={`${user?.name} · ${tpl.name} (${tpl.start}–${tpl.end}) · ${formatDateVi(entry.date)}`} onClose={onClose}>
      <FormError message={error} />

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '14px', cursor: 'pointer' }}>
        <input type="checkbox" checked={excused} onChange={(e) => setExcused(e.target.checked)} />
        Ghi nhận <strong>nghỉ có phép</strong> (không tính công, không phạt)
      </label>

      {!excused && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
          <div>
            <label style={LABEL_STYLE}>Giờ vào</label>
            <input type="time" className="input-dark" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          </div>
          <div>
            <label style={LABEL_STYLE}>Giờ ra (bỏ trống nếu chưa ra)</label>
            <input type="time" className="input-dark" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          </div>
        </div>
      )}

      <div style={{ marginBottom: '18px' }}>
        <label style={LABEL_STYLE}>Lý do (bắt buộc)</label>
        <textarea className="input-dark" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="VD: Nhân viên quên chấm công ra ca, xác nhận qua camera" />
      </div>

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button className="btn-secondary" style={{ fontSize: '13px' }} onClick={onClose}>Hủy bỏ</button>
        <button className="btn-primary" style={{ fontSize: '13px' }} onClick={handleSave}>Lưu chấm công</button>
      </div>
    </ModalShell>
  );
}
