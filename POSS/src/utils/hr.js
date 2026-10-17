// Spec 13: Nhân sự, ca kíp, chấm công & lương thưởng — hằng số và hàm tính toán thuần

export const SHIFT_TEMPLATES = [
  { code: 'SANG', name: 'Ca sáng', short: 'S', start: '07:00', end: '12:00', color: '#f59e0b' },
  { code: 'CHIEU', name: 'Ca chiều', short: 'C', start: '12:00', end: '17:30', color: '#3b82f6' },
  { code: 'TOI', name: 'Ca tối', short: 'T', start: '17:30', end: '23:00', color: '#8b5cf6' },
];

export const HR_CONFIG = {
  lateGraceMinutes: 5,       // Vào trễ <= 5 phút vẫn tính đúng giờ
  earlyLeaveGraceMinutes: 5, // Ra sớm <= 5 phút không tính về sớm
  checkInOpenMinutes: 30,    // Được chấm công vào ca trước giờ bắt đầu 30 phút
  latePenalty: 20000,        // Phạt mỗi lần đi muộn
  standardWorkDays: 26,      // Ngày công chuẩn cho lương tháng
};

export const SALARY_TYPES = {
  HOURLY: 'Theo giờ',
  MONTHLY: 'Theo tháng',
};

export const DEFAULT_PROFILE = {
  position: 'Chưa thiết lập',
  salaryType: 'HOURLY',
  rate: 25000,
  allowancePerShift: 0,
  startDate: null,
};

export const PAYROLL_STATUS_META = {
  DRAFT: { label: 'Nháp', className: 'badge-amber' },
  LOCKED: { label: 'Đã chốt', className: 'badge-manager' },
  PAID: { label: 'Đã trả lương', className: 'badge-staff' },
};

export const SHIFT_STATUS_META = {
  UPCOMING: { label: 'Sắp tới', color: 'var(--text-dim)', bg: 'var(--bg-tertiary)' },
  NOT_IN: { label: 'Chưa vào ca', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.1)' },
  WORKING: { label: 'Đang làm', color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)' },
  ON_TIME: { label: 'Đúng giờ', color: '#34d399', bg: 'rgba(16, 185, 129, 0.15)' },
  LATE: { label: 'Đi muộn', color: '#fbbf24', bg: 'rgba(245, 158, 11, 0.15)' },
  EARLY: { label: 'Về sớm', color: '#fb923c', bg: 'rgba(234, 88, 12, 0.15)' },
  MISSING_OUT: { label: 'Quên ra ca', color: '#f472b6', bg: 'rgba(236, 72, 153, 0.15)' },
  ABSENT: { label: 'Vắng', color: '#f87171', bg: 'rgba(239, 68, 68, 0.15)' },
  EXCUSED: { label: 'Nghỉ có phép', color: '#a78bfa', bg: 'rgba(139, 92, 246, 0.15)' },
};

export const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

// ---------- Ngày giờ (luôn dùng giờ local, không dùng UTC) ----------

export const pad = (n) => String(n).padStart(2, '0');
export const toDateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const toMonthKey = (d) => toDateKey(d).slice(0, 7);
export const parseDateKey = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (d, n) => {
  const r = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  r.setDate(r.getDate() + n);
  return r;
};
export const startOfWeek = (d) => addDays(d, -((d.getDay() + 6) % 7)); // Thứ 2
export const timeToMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
export const minutesNow = (d = new Date()) => d.getHours() * 60 + d.getMinutes();
export const timeNow = (d = new Date()) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const formatVnd = (n) => `${Math.round(n || 0).toLocaleString('vi-VN')} đ`;
export const formatHours = (minutes) => `${(minutes / 60).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}h`;
export const formatDateVi = (key) => {
  const d = parseDateKey(key);
  return `${WEEKDAY_LABELS[(d.getDay() + 6) % 7]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
};
export const formatMonthVi = (monthKey) => {
  const [y, m] = monthKey.split('-');
  return `Tháng ${Number(m)}/${y}`;
};

// ---------- Ca & chấm công ----------

export const getShiftTemplate = (code) => SHIFT_TEMPLATES.find((s) => s.code === code);
export const scheduleId = (userId, date, shiftCode) => `${userId}|${date}|${shiftCode}`;
export const payrollKey = (storeId, monthKey) => `${storeId}|${monthKey}`;
export const getProfile = (profiles, userId) => ({ ...DEFAULT_PROFILE, ...(profiles[userId] || {}) });

// Ca đã kết thúc hay chưa (so với thời điểm now)
export function isShiftOver(entry, now = new Date()) {
  const todayKey = toDateKey(now);
  if (entry.date !== todayKey) return entry.date < todayKey;
  return minutesNow(now) >= timeToMinutes(getShiftTemplate(entry.shiftCode).end);
}

// Đang trong khung giờ được chấm công vào ca
export function isCheckInOpen(entry, now = new Date()) {
  if (entry.date !== toDateKey(now)) return false;
  const tpl = getShiftTemplate(entry.shiftCode);
  const m = minutesNow(now);
  return m >= timeToMinutes(tpl.start) - HR_CONFIG.checkInOpenMinutes && m < timeToMinutes(tpl.end);
}

// Đánh giá một ca đã xếp dựa trên bản ghi chấm công (record có thể undefined)
export function evaluateShift(entry, record, now = new Date()) {
  const tpl = getShiftTemplate(entry.shiftCode);
  const start = timeToMinutes(tpl.start);
  const end = timeToMinutes(tpl.end);
  const base = { isLate: false, isEarly: false, lateMinutes: 0, earlyMinutes: 0, workedMinutes: 0 };

  if (record?.excused) return { ...base, status: 'EXCUSED' };
  if (!record?.checkIn) {
    if (isShiftOver(entry, now)) return { ...base, status: 'ABSENT' };
    const started = entry.date === toDateKey(now) && minutesNow(now) >= start;
    return { ...base, status: started ? 'NOT_IN' : 'UPCOMING' };
  }

  const inM = timeToMinutes(record.checkIn);
  const lateMinutes = Math.max(0, inM - start);
  const isLate = lateMinutes > HR_CONFIG.lateGraceMinutes;

  if (!record.checkOut) {
    return { ...base, lateMinutes, isLate, status: isShiftOver(entry, now) ? 'MISSING_OUT' : 'WORKING' };
  }

  const outM = timeToMinutes(record.checkOut);
  const earlyMinutes = Math.max(0, end - outM);
  const isEarly = earlyMinutes > HR_CONFIG.earlyLeaveGraceMinutes;
  // Giờ công chỉ tính trong khung ca (đến sớm / ở lại muộn không cộng thêm)
  const workedMinutes = Math.max(0, Math.min(outM, end) - Math.max(inM, start));

  return {
    status: isLate ? 'LATE' : isEarly ? 'EARLY' : 'ON_TIME',
    isLate,
    isEarly,
    lateMinutes,
    earlyMinutes,
    workedMinutes,
  };
}

// Bảng lương tháng cho danh sách nhân viên
export function computePayroll({ userIds, profiles, schedule, attendance, adjustments, monthKey, now = new Date() }) {
  const recordById = new Map(attendance.map((r) => [r.id, r]));

  return userIds.map((userId) => {
    const profile = getProfile(profiles, userId);
    const entries = schedule.filter((e) => e.userId === userId && e.date.startsWith(monthKey));

    let shiftsWorked = 0;
    let workedMinutes = 0;
    let lateCount = 0;
    let absentCount = 0;
    let excusedCount = 0;
    let missingOutCount = 0;
    const workedDates = new Set();

    entries.forEach((entry) => {
      const result = evaluateShift(entry, recordById.get(entry.id), now);
      if (result.status === 'ABSENT') absentCount += 1;
      if (result.status === 'EXCUSED') excusedCount += 1;
      if (result.status === 'MISSING_OUT') missingOutCount += 1;
      if (result.isLate) lateCount += 1;
      if (result.workedMinutes > 0) {
        shiftsWorked += 1;
        workedMinutes += result.workedMinutes;
        workedDates.add(entry.date);
      }
    });

    const daysWorked = workedDates.size;
    const basePay = profile.salaryType === 'MONTHLY'
      ? Math.round((profile.rate / HR_CONFIG.standardWorkDays) * daysWorked)
      : Math.round((workedMinutes / 60) * profile.rate);
    const allowance = shiftsWorked * profile.allowancePerShift;
    const latePenalty = lateCount * HR_CONFIG.latePenalty;

    const userAdjustments = adjustments.filter((a) => a.userId === userId && a.month === monthKey);
    const bonus = userAdjustments.filter((a) => a.type === 'BONUS').reduce((s, a) => s + a.amount, 0);
    const manualPenalty = userAdjustments.filter((a) => a.type === 'PENALTY').reduce((s, a) => s + a.amount, 0);
    const penalty = latePenalty + manualPenalty;

    return {
      userId,
      profile,
      shiftsScheduled: entries.length,
      shiftsWorked,
      workedMinutes,
      daysWorked,
      lateCount,
      absentCount,
      excusedCount,
      missingOutCount,
      basePay,
      allowance,
      bonus,
      latePenalty,
      manualPenalty,
      penalty,
      adjustments: userAdjustments,
      net: Math.max(0, basePay + allowance + bonus - penalty),
    };
  });
}
