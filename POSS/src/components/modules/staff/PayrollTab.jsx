import React, { useMemo, useState } from 'react';
import { Lock, Unlock, BadgeCheck, PlusCircle, Trash2, FileText, AlertTriangle } from 'lucide-react';
import {
  HR_CONFIG,
  PAYROLL_STATUS_META,
  SALARY_TYPES,
  computePayroll,
  formatHours,
  formatMonthVi,
  formatVnd,
  payrollKey,
  toMonthKey,
} from '../../../utils/hr';
import { ConfirmModal, EmployeeCell, FormError, ModalShell } from './shared';
import { LABEL_STYLE, ROW_STYLE, TD_STYLE, THEAD_ROW_STYLE, TH_STYLE } from './styles';

const moneyCell = { ...TD_STYLE, fontFamily: 'var(--font-mono)', textAlign: 'right' };
const moneyHead = { ...TH_STYLE, textAlign: 'right' };

export function PayrollTab({ ctx }) {
  const { visibleEmployees, currentUser, canManage, isOwner, selectedStore, hrData, setHrData, onAuditLog, now } = ctx;

  const currentMonth = toMonthKey(now);
  const monthOptions = Array.from({ length: 3 }, (_, i) => toMonthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)));
  const [monthKey, setMonthKey] = useState(currentMonth);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [payslipRow, setPayslipRow] = useState(null);

  const key = payrollKey(selectedStore.id, monthKey);
  const status = hrData.payrollStatus[key] || 'DRAFT';
  const isDraft = status === 'DRAFT';

  const rows = useMemo(() => computePayroll({
    userIds: visibleEmployees.map((u) => u.id),
    profiles: hrData.profiles,
    schedule: hrData.schedule.filter((e) => e.storeId === selectedStore.id),
    attendance: hrData.attendance,
    adjustments: hrData.adjustments,
    monthKey,
    now,
  }), [visibleEmployees, hrData, selectedStore.id, monthKey, now]);

  const userById = new Map(visibleEmployees.map((u) => [u.id, u]));
  const totals = rows.reduce((acc, r) => ({
    basePay: acc.basePay + r.basePay,
    allowance: acc.allowance + r.allowance,
    bonus: acc.bonus + r.bonus,
    penalty: acc.penalty + r.penalty,
    net: acc.net + r.net,
    workedMinutes: acc.workedMinutes + r.workedMinutes,
    missingOut: acc.missingOut + r.missingOutCount,
  }), { basePay: 0, allowance: 0, bonus: 0, penalty: 0, net: 0, workedMinutes: 0, missingOut: 0 });

  const monthAdjustments = hrData.adjustments.filter((a) => a.month === monthKey && userById.has(a.userId));

  const setStatus = (next, action) => {
    setHrData((prev) => ({ ...prev, payrollStatus: { ...prev.payrollStatus, [key]: next } }));
    onAuditLog(action, `${formatMonthVi(monthKey)} — ${selectedStore.name}. Tổng thực lĩnh ${formatVnd(totals.net)} cho ${rows.length} nhân viên.`);
  };

  const removeAdjustment = (adj) => {
    setHrData((prev) => ({ ...prev, adjustments: prev.adjustments.filter((a) => a.id !== adj.id) }));
    onAuditLog('XÓA THƯỞNG PHẠT', `Xóa khoản ${adj.type === 'BONUS' ? 'thưởng' : 'phạt'} ${formatVnd(adj.amount)} của ${userById.get(adj.userId)?.name} (${adj.reason}).`);
  };

  const statusMeta = PAYROLL_STATUS_META[status];

  return (
    <div>
      {/* Thanh công cụ */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-end', marginBottom: '14px' }}>
        <div>
          <label style={LABEL_STYLE}>Kỳ lương</label>
          <select className="input-dark" value={monthKey} onChange={(e) => setMonthKey(e.target.value)} style={{ width: '170px' }}>
            {monthOptions.map((m) => <option key={m} value={m}>{formatMonthVi(m)}</option>)}
          </select>
        </div>
        <span className={`badge ${statusMeta.className}`} style={{ marginBottom: '6px' }}>{statusMeta.label}</span>
        {monthKey === currentMonth && isDraft && (
          <span style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '8px' }}>Tạm tính đến hôm nay</span>
        )}

        <div className="module-header-actions" style={{ marginLeft: 'auto' }}>
          {canManage && isDraft && (
            <>
              <button className="btn-secondary" style={{ fontSize: '13px' }} onClick={() => setShowAdjustmentModal(true)}>
                <PlusCircle size={15} /> <span>Thêm thưởng / phạt</span>
              </button>
              <button
                className="btn-primary"
                style={{ fontSize: '13px' }}
                onClick={() => setConfirmAction({
                  title: `Chốt bảng lương ${formatMonthVi(monthKey)}?`,
                  message: `Sau khi chốt, lịch ca, chấm công và thưởng/phạt của tháng này sẽ bị khóa. Tổng thực lĩnh: ${formatVnd(totals.net)}.${totals.missingOut ? ` Lưu ý: còn ${totals.missingOut} ca "Quên ra ca" chưa được xử lý (đang tính 0 công).` : ''}`,
                  confirmLabel: 'Chốt bảng lương',
                  run: () => setStatus('LOCKED', 'CHỐT BẢNG LƯƠNG'),
                })}
              >
                <Lock size={15} /> <span>Chốt bảng lương</span>
              </button>
            </>
          )}
          {isOwner && status === 'LOCKED' && (
            <>
              <button
                className="btn-secondary"
                style={{ fontSize: '13px' }}
                onClick={() => setConfirmAction({
                  title: 'Mở lại bảng lương?',
                  message: 'Bảng lương trở về trạng thái Nháp để Manager tiếp tục chỉnh sửa chấm công và thưởng/phạt.',
                  confirmLabel: 'Mở lại',
                  danger: true,
                  run: () => setStatus('DRAFT', 'MỞ LẠI BẢNG LƯƠNG'),
                })}
              >
                <Unlock size={15} /> <span>Mở lại</span>
              </button>
              <button
                className="btn-primary"
                style={{ fontSize: '13px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff' }}
                onClick={() => setConfirmAction({
                  title: 'Xác nhận đã trả lương?',
                  message: `Đánh dấu đã chi trả ${formatVnd(totals.net)} cho ${rows.length} nhân viên ${formatMonthVi(monthKey)}. Thao tác này không thể hoàn tác.`,
                  confirmLabel: 'Đã trả lương',
                  run: () => setStatus('PAID', 'TRẢ LƯƠNG'),
                })}
              >
                <BadgeCheck size={15} /> <span>Đánh dấu đã trả</span>
              </button>
            </>
          )}
        </div>
      </div>

      {canManage && (
        <div className="kpi-grid-4">
          {[
            { label: 'Tổng thực lĩnh', value: formatVnd(totals.net), color: 'var(--accent-amber)' },
            { label: 'Tổng giờ công', value: formatHours(totals.workedMinutes), color: 'var(--text-main)' },
            { label: 'Tổng thưởng', value: formatVnd(totals.bonus), color: '#34d399' },
            { label: 'Tổng phạt', value: formatVnd(totals.penalty), color: '#f87171' },
          ].map((k) => (
            <div key={k.label} className="card-glass" style={{ padding: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>{k.label}</div>
              <div style={{ fontSize: '19px', fontWeight: '800', marginTop: '6px', fontFamily: 'var(--font-mono)', color: k.color }}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      {canManage && isDraft && totals.missingOut > 0 && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 12px', borderRadius: '8px', background: 'rgba(236, 72, 153, 0.1)', border: '1px solid rgba(236, 72, 153, 0.3)', color: '#f472b6', fontSize: '12px', marginBottom: '14px' }}>
          <AlertTriangle size={16} />
          Có {totals.missingOut} ca "Quên ra ca" đang tính 0 công. Vào tab Chấm công để sửa trước khi chốt lương.
        </div>
      )}

      <div className="table-responsive">
        <table style={{ fontSize: '13px', minWidth: '1080px' }}>
          <thead>
            <tr style={THEAD_ROW_STYLE}>
              <th style={TH_STYLE}>Nhân viên</th>
              <th style={TH_STYLE}>Loại lương</th>
              <th style={moneyHead}>Ca / Ngày công</th>
              <th style={moneyHead}>Giờ công</th>
              <th style={moneyHead}>Lương cơ bản</th>
              <th style={moneyHead}>Phụ cấp</th>
              <th style={moneyHead}>Thưởng</th>
              <th style={moneyHead}>Phạt</th>
              <th style={moneyHead}>Thực lĩnh</th>
              <th style={{ ...TH_STYLE, textAlign: 'right' }} />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const user = userById.get(r.userId);
              return (
                <tr key={r.userId} style={ROW_STYLE}>
                  <td style={TD_STYLE}><EmployeeCell user={user} subtitle={r.profile.position} /></td>
                  <td style={TD_STYLE}>
                    {SALARY_TYPES[r.profile.salaryType]}
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      {formatVnd(r.profile.rate)}/{r.profile.salaryType === 'MONTHLY' ? 'tháng' : 'giờ'}
                    </div>
                  </td>
                  <td style={moneyCell}>
                    {r.shiftsWorked}/{r.shiftsScheduled} ca
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{r.daysWorked} ngày</div>
                  </td>
                  <td style={moneyCell}>{formatHours(r.workedMinutes)}</td>
                  <td style={moneyCell}>{formatVnd(r.basePay)}</td>
                  <td style={moneyCell}>{formatVnd(r.allowance)}</td>
                  <td style={{ ...moneyCell, color: r.bonus ? '#34d399' : undefined }}>{r.bonus ? `+${formatVnd(r.bonus)}` : '—'}</td>
                  <td style={{ ...moneyCell, color: r.penalty ? '#f87171' : undefined }}>
                    {r.penalty ? `−${formatVnd(r.penalty)}` : '—'}
                    {r.lateCount > 0 && <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{r.lateCount} lần đi muộn</div>}
                  </td>
                  <td style={{ ...moneyCell, fontWeight: '800', color: 'var(--accent-amber)' }}>{formatVnd(r.net)}</td>
                  <td style={{ ...TD_STYLE, textAlign: 'right' }}>
                    <button className="btn-secondary" style={{ fontSize: '12px', padding: '6px 10px' }} onClick={() => setPayslipRow(r)}>
                      <FileText size={14} /> <span>Phiếu lương</span>
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={10} style={{ padding: '28px', textAlign: 'center', color: 'var(--text-dim)' }}>Không có nhân viên trong bảng lương.</td></tr>
            )}
            {canManage && rows.length > 1 && (
              <tr style={{ background: 'var(--bg-tertiary)', fontWeight: '800' }}>
                <td style={TD_STYLE} colSpan={3}>Tổng cộng ({rows.length} nhân viên)</td>
                <td style={moneyCell}>{formatHours(totals.workedMinutes)}</td>
                <td style={moneyCell}>{formatVnd(totals.basePay)}</td>
                <td style={moneyCell}>{formatVnd(totals.allowance)}</td>
                <td style={moneyCell}>{formatVnd(totals.bonus)}</td>
                <td style={moneyCell}>{formatVnd(totals.penalty)}</td>
                <td style={{ ...moneyCell, color: 'var(--accent-amber)' }}>{formatVnd(totals.net)}</td>
                <td />
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Danh sách thưởng / phạt thủ công */}
      <div className="card-glass" style={{ padding: '18px' }}>
        <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>Thưởng / phạt thủ công — {formatMonthVi(monthKey)}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px' }}>
          Phạt đi muộn được tính tự động {formatVnd(HR_CONFIG.latePenalty)}/lần (ân hạn {HR_CONFIG.lateGraceMinutes} phút), không nằm trong danh sách này.
        </div>
        {monthAdjustments.length === 0 ? (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Chưa có khoản thưởng / phạt nào.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {monthAdjustments.map((a) => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', background: 'var(--bg-tertiary)', flexWrap: 'wrap' }}>
                <span className={`badge ${a.type === 'BONUS' ? 'badge-staff' : 'badge-owner'}`}>{a.type === 'BONUS' ? 'Thưởng' : 'Phạt'}</span>
                <span style={{ fontWeight: '700', fontSize: '13px' }}>{userById.get(a.userId)?.name}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', flex: 1, minWidth: '160px' }}>{a.reason} · bởi {a.by}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '800', color: a.type === 'BONUS' ? '#34d399' : '#f87171' }}>
                  {a.type === 'BONUS' ? '+' : '−'}{formatVnd(a.amount)}
                </span>
                {canManage && isDraft && (
                  <button onClick={() => removeAdjustment(a)} style={{ background: 'transparent', color: 'var(--text-dim)', padding: '4px' }} title="Xóa khoản này" aria-label="Xóa">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdjustmentModal && (
        <AdjustmentModal
          employees={visibleEmployees}
          monthKey={monthKey}
          onClose={() => setShowAdjustmentModal(false)}
          onSave={(adj) => {
            const full = { ...adj, id: `ADJ-${Date.now()}`, month: monthKey, by: currentUser.name };
            setHrData((prev) => ({ ...prev, adjustments: [...prev.adjustments, full] }));
            onAuditLog(
              adj.type === 'BONUS' ? 'THÊM THƯỞNG' : 'THÊM PHẠT',
              `${adj.type === 'BONUS' ? 'Thưởng' : 'Phạt'} ${formatVnd(adj.amount)} cho ${userById.get(adj.userId)?.name} (${formatMonthVi(monthKey)}). Lý do: ${adj.reason}`,
            );
            setShowAdjustmentModal(false);
          }}
        />
      )}

      {confirmAction && (
        <ConfirmModal
          title={confirmAction.title}
          message={confirmAction.message}
          confirmLabel={confirmAction.confirmLabel}
          danger={confirmAction.danger}
          onConfirm={confirmAction.run}
          onClose={() => setConfirmAction(null)}
        />
      )}

      {payslipRow && (
        <PayslipModal
          row={payslipRow}
          user={userById.get(payslipRow.userId)}
          store={selectedStore}
          monthKey={monthKey}
          statusLabel={statusMeta.label}
          onClose={() => setPayslipRow(null)}
        />
      )}
    </div>
  );
}

function AdjustmentModal({ employees, monthKey, onClose, onSave }) {
  const [userId, setUserId] = useState(employees[0]?.id || '');
  const [type, setType] = useState('BONUS');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    const value = Number(amount);
    if (!userId) return setError('Vui lòng chọn nhân viên.');
    if (!Number.isFinite(value) || value <= 0) return setError('Số tiền phải lớn hơn 0.');
    if (!reason.trim()) return setError('Bắt buộc nhập lý do thưởng / phạt (Spec 13).');
    onSave({ userId, type, amount: Math.round(value), reason: reason.trim() });
  };

  return (
    <ModalShell title="Thêm thưởng / phạt" subtitle={formatMonthVi(monthKey)} onClose={onClose}>
      <FormError message={error} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
        <div>
          <label style={LABEL_STYLE}>Nhân viên</label>
          <select className="input-dark" value={userId} onChange={(e) => setUserId(e.target.value)}>
            {employees.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[{ id: 'BONUS', label: 'Thưởng', color: '#10b981' }, { id: 'PENALTY', label: 'Phạt', color: '#ef4444' }].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setType(opt.id)}
              style={{
                padding: '10px',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '13px',
                border: `1px solid ${type === opt.id ? opt.color : 'var(--border-medium)'}`,
                background: type === opt.id ? `${opt.color}26` : 'transparent',
                color: type === opt.id ? opt.color : 'var(--text-muted)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div>
          <label style={LABEL_STYLE}>Số tiền (đ)</label>
          <input type="number" min="0" step="10000" className="input-dark" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="VD: 200000" />
        </div>
        <div>
          <label style={LABEL_STYLE}>Lý do (bắt buộc)</label>
          <textarea className="input-dark" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="VD: Đạt KPI upsell size L" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button className="btn-secondary" style={{ fontSize: '13px' }} onClick={onClose}>Hủy bỏ</button>
        <button className="btn-primary" style={{ fontSize: '13px' }} onClick={handleSave}>Lưu</button>
      </div>
    </ModalShell>
  );
}

function PayslipModal({ row, user, store, monthKey, statusLabel, onClose }) {
  const line = (label, value, strong = false, key = label) => (
    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', fontSize: '12px', fontWeight: strong ? '800' : '500', padding: '3px 0' }}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
  const isMonthly = row.profile.salaryType === 'MONTHLY';

  return (
    <ModalShell title="Phiếu lương" subtitle={`${user?.name} · ${formatMonthVi(monthKey)}`} onClose={onClose} maxWidth="400px">
      <div className="receipt-paper">
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <div style={{ fontWeight: '800', fontSize: '14px' }}>{store.name}</div>
          <div style={{ fontSize: '11px' }}>PHIẾU LƯƠNG {formatMonthVi(monthKey).toUpperCase()}</div>
          <div style={{ fontSize: '11px' }}>Trạng thái: {statusLabel}</div>
        </div>
        <div className="receipt-divider" />
        {line('Nhân viên', user?.name)}
        {line('Vị trí', row.profile.position)}
        {line('Loại lương', SALARY_TYPES[row.profile.salaryType])}
        {line('Mức lương', `${formatVnd(row.profile.rate)}/${isMonthly ? 'tháng' : 'giờ'}`)}
        <div className="receipt-divider" />
        {line('Ca đã làm / đã xếp', `${row.shiftsWorked}/${row.shiftsScheduled}`)}
        {line('Ngày công', `${row.daysWorked}${isMonthly ? `/${HR_CONFIG.standardWorkDays}` : ''}`)}
        {line('Giờ công', formatHours(row.workedMinutes))}
        {line('Đi muộn', `${row.lateCount} lần`)}
        {line('Vắng / Nghỉ phép', `${row.absentCount} / ${row.excusedCount}`)}
        <div className="receipt-divider" />
        {line('Lương cơ bản', formatVnd(row.basePay))}
        {line(`Phụ cấp (${row.shiftsWorked} ca × ${formatVnd(row.profile.allowancePerShift)})`, formatVnd(row.allowance))}
        {row.adjustments.filter((a) => a.type === 'BONUS').map((a) => line(`Thưởng: ${a.reason}`, `+${formatVnd(a.amount)}`, false, a.id))}
        {row.latePenalty > 0 && line(`Phạt đi muộn (${row.lateCount} lần)`, `−${formatVnd(row.latePenalty)}`)}
        {row.adjustments.filter((a) => a.type === 'PENALTY').map((a) => line(`Phạt: ${a.reason}`, `−${formatVnd(a.amount)}`, false, a.id))}
        <div className="receipt-divider" />
        {line('THỰC LĨNH', formatVnd(row.net), true)}
      </div>
    </ModalShell>
  );
}
