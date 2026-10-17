import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Copy } from 'lucide-react';
import {
  SHIFT_TEMPLATES,
  WEEKDAY_LABELS,
  addDays,
  getProfile,
  pad,
  parseDateKey,
  scheduleId,
  startOfWeek,
  toDateKey,
} from '../../../utils/hr';
import { EmployeeCell } from './shared';
import { ROW_STYLE, THEAD_ROW_STYLE } from './styles';

const formatDayMonth = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;

export function ScheduleTab({ ctx }) {
  const { employees, canManage, selectedStore, hrData, setHrData, onAuditLog, now, isMonthLocked } = ctx;
  const todayKey = toDateKey(now);
  const [weekStart, setWeekStart] = useState(() => startOfWeek(now));
  const [notice, setNotice] = useState('');

  const days = Array.from({ length: 7 }, (_, i) => toDateKey(addDays(weekStart, i)));
  const scheduledIds = useMemo(() => new Set(hrData.schedule.map((e) => e.id)), [hrData.schedule]);
  const attendanceIds = useMemo(() => new Set(hrData.attendance.map((r) => r.id)), [hrData.attendance]);

  // Lý do không được sửa ô (chuỗi rỗng = sửa được)
  const lockReason = (userId, date, shiftCode) => {
    if (!canManage) return 'Chỉ Owner/Manager được xếp ca';
    if (date < todayKey) return 'Không sửa lịch ngày đã qua';
    if (isMonthLocked(date.slice(0, 7))) return 'Tháng đã chốt lương';
    if (attendanceIds.has(scheduleId(userId, date, shiftCode))) return 'Ca đã có chấm công';
    return '';
  };

  const toggleShift = (userId, date, shiftCode) => {
    if (lockReason(userId, date, shiftCode)) return;
    const id = scheduleId(userId, date, shiftCode);
    setHrData((prev) => ({
      ...prev,
      schedule: prev.schedule.some((e) => e.id === id)
        ? prev.schedule.filter((e) => e.id !== id)
        : [...prev.schedule, { id, userId, date, shiftCode, storeId: selectedStore.id }],
    }));
  };

  const copyPreviousWeek = () => {
    const employeeIds = new Set(employees.map((u) => u.id));
    const additions = hrData.schedule
      .filter((e) => e.storeId === selectedStore.id && employeeIds.has(e.userId))
      .map((e) => ({ ...e, date: toDateKey(addDays(parseDateKey(e.date), 7)) }))
      .filter((e) => days.includes(e.date) && e.date >= todayKey && !isMonthLocked(e.date.slice(0, 7)))
      .map((e) => ({ ...e, id: scheduleId(e.userId, e.date, e.shiftCode) }))
      .filter((e) => !scheduledIds.has(e.id));

    if (additions.length === 0) {
      setNotice('Không có ca nào mới để sao chép (tuần trước trống hoặc đã có đủ lịch).');
      return;
    }
    setHrData((prev) => ({ ...prev, schedule: [...prev.schedule, ...additions] }));
    onAuditLog('SAO CHÉP LỊCH CA', `Sao chép ${additions.length} ca từ tuần trước sang tuần ${formatDayMonth(weekStart)} tại ${selectedStore.name}.`);
    setNotice(`Đã thêm ${additions.length} ca từ tuần trước.`);
  };

  const headcount = (date, shiftCode) => employees.filter((u) => scheduledIds.has(scheduleId(u.id, date, shiftCode))).length;

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button className="btn-secondary" style={{ padding: '6px 10px' }} onClick={() => { setWeekStart(addDays(weekStart, -7)); setNotice(''); }} aria-label="Tuần trước">
            <ChevronLeft size={16} />
          </button>
          <div style={{ fontWeight: '800', fontSize: '14px', minWidth: '150px', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
            {formatDayMonth(weekStart)} – {formatDayMonth(addDays(weekStart, 6))}
          </div>
          <button className="btn-secondary" style={{ padding: '6px 10px' }} onClick={() => { setWeekStart(addDays(weekStart, 7)); setNotice(''); }} aria-label="Tuần sau">
            <ChevronRight size={16} />
          </button>
          <button className="btn-secondary" style={{ fontSize: '12px', padding: '6px 10px' }} onClick={() => { setWeekStart(startOfWeek(now)); setNotice(''); }}>
            Tuần này
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '12px', color: 'var(--text-muted)' }}>
          {SHIFT_TEMPLATES.map((t) => (
            <span key={t.code} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '18px', height: '18px', borderRadius: '5px', background: t.color, color: '#000', fontSize: '10px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{t.short}</span>
              {t.name} {t.start}–{t.end}
            </span>
          ))}
        </div>

        {canManage && (
          <button className="btn-primary" style={{ fontSize: '13px', marginLeft: 'auto' }} onClick={copyPreviousWeek}>
            <Copy size={15} /> <span>Sao chép tuần trước</span>
          </button>
        )}
      </div>

      {notice && <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>{notice}</div>}
      {canManage && (
        <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '10px' }}>
          Bấm vào ô S / C / T để bật hoặc tắt phân công ca. Ô mờ là ô không được sửa (rê chuột để xem lý do).
        </div>
      )}

      <div className="table-responsive">
        <table style={{ fontSize: '13px', minWidth: '900px' }}>
          <thead>
            <tr style={THEAD_ROW_STYLE}>
              <th style={{ padding: '12px 16px', textAlign: 'left', whiteSpace: 'nowrap' }}>Nhân viên</th>
              {days.map((date, i) => (
                <th key={date} style={{ padding: '10px 6px', textAlign: 'center', whiteSpace: 'nowrap', color: date === todayKey ? 'var(--accent-amber)' : undefined }}>
                  {WEEKDAY_LABELS[i]}
                  <div style={{ fontSize: '11px', fontWeight: '500', fontFamily: 'var(--font-mono)' }}>{formatDayMonth(parseDateKey(date))}</div>
                </th>
              ))}
              <th style={{ padding: '12px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>Số ca</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 && (
              <tr><td colSpan={9} style={{ padding: '28px', textAlign: 'center', color: 'var(--text-dim)' }}>Cửa hàng chưa có nhân viên.</td></tr>
            )}
            {employees.map((user) => {
              const weekCount = days.reduce((s, date) => s + SHIFT_TEMPLATES.filter((t) => scheduledIds.has(scheduleId(user.id, date, t.code))).length, 0);
              return (
                <tr key={user.id} style={ROW_STYLE}>
                  <td style={{ padding: '10px 16px' }}>
                    <EmployeeCell user={user} subtitle={getProfile(hrData.profiles, user.id).position} />
                  </td>
                  {days.map((date) => (
                    <td key={date} style={{ padding: '8px 4px', textAlign: 'center', background: date === todayKey ? 'rgba(245, 158, 11, 0.06)' : undefined }}>
                      <div style={{ display: 'inline-flex', gap: '3px' }}>
                        {SHIFT_TEMPLATES.map((t) => {
                          const active = scheduledIds.has(scheduleId(user.id, date, t.code));
                          const reason = lockReason(user.id, date, t.code);
                          if (!canManage && !active) {
                            return <span key={t.code} style={{ width: '24px', height: '24px' }} />;
                          }
                          return (
                            <button
                              key={t.code}
                              title={reason || `${active ? 'Bỏ' : 'Xếp'} ${t.name}`}
                              onClick={() => toggleShift(user.id, date, t.code)}
                              style={{
                                width: '24px',
                                height: '24px',
                                padding: 0,
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: '800',
                                background: active ? t.color : 'transparent',
                                color: active ? '#000' : 'var(--text-dim)',
                                border: active ? 'none' : '1px dashed var(--border-medium)',
                                opacity: reason && canManage ? (active ? 0.55 : 0.25) : 1,
                                cursor: reason ? 'not-allowed' : 'pointer',
                              }}
                            >
                              {t.short}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  ))}
                  <td style={{ padding: '10px', textAlign: 'center', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>{weekCount}</td>
                </tr>
              );
            })}
            {employees.length > 0 && (
              <tr style={{ background: 'var(--bg-tertiary)' }}>
                <td style={{ padding: '10px 16px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>Số người / ca</td>
                {days.map((date) => (
                  <td key={date} style={{ padding: '8px 4px', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '3px' }}>
                      {SHIFT_TEMPLATES.map((t) => {
                        const n = headcount(date, t.code);
                        return (
                          <span key={t.code} title={t.name} style={{ width: '24px', fontSize: '11px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: n === 0 ? '#f87171' : t.color }}>
                            {n}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                ))}
                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
