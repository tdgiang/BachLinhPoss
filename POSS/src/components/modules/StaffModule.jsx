import React, { useEffect, useMemo, useState } from 'react';
import { Fingerprint, CalendarRange, Banknote, IdCard } from 'lucide-react';
import { evaluateShift, payrollKey, toDateKey } from '../../utils/hr';
import { AttendanceTab } from './staff/AttendanceTab';
import { ScheduleTab } from './staff/ScheduleTab';
import { PayrollTab } from './staff/PayrollTab';
import { ProfilesTab } from './staff/ProfilesTab';

const TABS = [
  { id: 'attendance', label: 'Chấm công', icon: Fingerprint },
  { id: 'schedule', label: 'Lịch ca tuần', icon: CalendarRange },
  { id: 'payroll', label: 'Lương & thưởng', icon: Banknote },
  { id: 'profiles', label: 'Hồ sơ nhân viên', icon: IdCard },
];

// Spec 13: Nhân sự, ca kíp, chấm công & lương thưởng
export function StaffModule({ users, currentUser, currentUserRole, selectedStore, hrData, setHrData, onAuditLog }) {
  const [activeTab, setActiveTab] = useState('attendance');
  const [now, setNow] = useState(() => new Date());

  // Cập nhật đồng hồ để trạng thái ca (sắp tới / đang làm / vắng) tự chuyển
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const isOwner = currentUserRole === 'OWNER';
  const canManage = isOwner || currentUserRole === 'MANAGER';

  // Owner không nằm trong bảng lương; nhân viên theo cửa hàng đang chọn
  const employees = useMemo(
    () => users.filter((u) => u.role !== 'OWNER' && u.assignedStores?.includes(selectedStore.id)),
    [users, selectedStore.id],
  );
  const visibleEmployees = useMemo(
    () => (canManage ? employees : employees.filter((u) => u.id === currentUser.id)),
    [canManage, employees, currentUser.id],
  );

  const isMonthLocked = (monthKey) => (hrData.payrollStatus[payrollKey(selectedStore.id, monthKey)] || 'DRAFT') !== 'DRAFT';

  const ctx = {
    employees, visibleEmployees, currentUser, currentUserRole, canManage, isOwner,
    selectedStore, hrData, setHrData, onAuditLog, now, isMonthLocked,
  };

  // KPI hôm nay cho Owner/Manager
  const todayKey = toDateKey(now);
  const employeeIds = new Set(employees.map((u) => u.id));
  const recordById = new Map(hrData.attendance.map((r) => [r.id, r]));
  const todayResults = hrData.schedule
    .filter((e) => e.date === todayKey && e.storeId === selectedStore.id && employeeIds.has(e.userId))
    .map((e) => evaluateShift(e, recordById.get(e.id), now));
  const kpis = [
    { label: 'Nhân viên cửa hàng', value: employees.length, hint: `${employees.filter((u) => u.status === 'ACTIVE').length} đang hoạt động`, color: 'var(--text-main)' },
    { label: 'Ca hôm nay', value: todayResults.length, hint: `${todayResults.filter((r) => r.status === 'UPCOMING').length} sắp tới · ${todayResults.filter((r) => r.status === 'NOT_IN').length} chưa vào ca`, color: 'var(--accent-amber)' },
    { label: 'Đang làm', value: todayResults.filter((r) => r.status === 'WORKING').length, hint: 'Đã vào ca, chưa ra', color: '#60a5fa' },
    { label: 'Đi muộn / vắng', value: `${todayResults.filter((r) => r.isLate).length} / ${todayResults.filter((r) => r.status === 'ABSENT').length}`, hint: 'Trong ngày hôm nay', color: '#f87171' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div className="module-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
            Nhân Sự, Ca Kíp & Lương Thưởng (Spec 13)
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Xếp ca, chấm công vào/ra và tính lương, thưởng, phạt hàng tháng — {selectedStore.name}
          </p>
        </div>
      </div>

      {canManage && (
        <div className="kpi-grid-4">
          {kpis.map((k) => (
            <div key={k.label} className="card-glass" style={{ padding: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>{k.label}</div>
              <div style={{ fontSize: '22px', fontWeight: '800', marginTop: '6px', fontFamily: 'var(--font-mono)', color: k.color }}>{k.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>{k.hint}</div>
            </div>
          ))}
        </div>
      )}

      <div className="module-tabs-bar">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                fontWeight: active ? '700' : '500',
                background: active ? 'var(--accent-amber)' : 'var(--bg-tertiary)',
                color: active ? '#000' : 'var(--text-main)',
              }}
            >
              <Icon size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: '-2px' }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'attendance' && <AttendanceTab ctx={ctx} />}
      {activeTab === 'schedule' && <ScheduleTab ctx={ctx} />}
      {activeTab === 'payroll' && <PayrollTab ctx={ctx} />}
      {activeTab === 'profiles' && <ProfilesTab ctx={ctx} />}
    </div>
  );
}
