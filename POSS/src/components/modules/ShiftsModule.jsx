import React, { useState } from 'react';
import { 
  Clock, 
  DollarSign, 
  PlusCircle, 
  MinusCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Printer, 
  Calendar, 
  User, 
  Receipt,
  FileSpreadsheet,
  Lock
} from 'lucide-react';
import { INITIAL_SHIFT } from '../../data/mockData';

export function ShiftsModule({ currentUserRole, activeShift, setActiveShift }) {
  const [shift, setShift] = useState(activeShift || INITIAL_SHIFT);
  
  // Petty cash expense form modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseReason, setExpenseReason] = useState('');

  // Close shift modal
  const [showCloseShiftModal, setShowCloseShiftModal] = useState(false);
  const [actualCash, setActualCash] = useState(shift.initialCash + shift.cashSales - shift.pettyCashOut);
  const [discrepancyNote, setDiscrepancyNote] = useState('');
  const [closedSummary, setClosedSummary] = useState(null);

  // Open new shift modal (when no active shift)
  const [showOpenShiftModal, setShowOpenShiftModal] = useState(false);
  const [newShiftInitialCash, setNewShiftInitialCash] = useState(1500000);

  // Expected Cash calculation
  // Đầu ca + Thu tiền mặt - Chi tiền mặt
  const expectedCash = (shift?.initialCash || 0) + (shift?.cashSales || 0) + (shift?.pettyCashIn || 0) - (shift?.pettyCashOut || 0);
  const discrepancy = actualCash - expectedCash;

  // Record petty cash expense
  const handleAddExpense = () => {
    if (!expenseAmount || !expenseReason.trim()) {
      alert('Vui lòng nhập đầy đủ số tiền và lý do chi ngoài ca!');
      return;
    }
    const newExpense = {
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      amount: Number(expenseAmount),
      reason: expenseReason,
      by: 'Lê Hoàng Nam (Staff)'
    };
    const updated = {
      ...shift,
      pettyCashOut: shift.pettyCashOut + Number(expenseAmount),
      expensesList: [...shift.expensesList, newExpense]
    };
    setShift(updated);
    if (setActiveShift) setActiveShift(updated);
    setShowExpenseModal(false);
    setExpenseAmount('');
    setExpenseReason('');
  };

  // Close Shift Handler
  const handleConfirmCloseShift = () => {
    if (discrepancy !== 0 && !discrepancyNote.trim()) {
      alert('Chênh lệch tiền mặt khác 0! Bắt buộc phải nhập ghi chú giải trình theo Spec 06!');
      return;
    }

    const summary = {
      ...shift,
      status: 'CLOSED',
      closedAt: new Date().toLocaleTimeString('vi-VN') + ' - ' + new Date().toLocaleDateString('vi-VN'),
      closedBy: 'Lê Hoàng Nam (Staff)',
      actualCashCounted: actualCash,
      expectedCash,
      discrepancy,
      discrepancyNote
    };

    setClosedSummary(summary);
    setShift(summary);
    if (setActiveShift) setActiveShift(summary);
    setShowCloseShiftModal(false);
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div className="module-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
            Quản Lý Ca Làm Việc (Spec 06)
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Theo dõi dòng tiền, thu chi phát sinh và đối soát két tiền mặt kết ca
          </p>
        </div>

        <div className="module-header-actions">
          {shift.status === 'ACTIVE' ? (
            <>
              <button 
                onClick={() => setShowExpenseModal(true)}
                className="btn-secondary"
                style={{ fontSize: '13px' }}
              >
                <MinusCircle size={16} color="#f87171" />
                <span>Chi Tiền Ngoài Ca</span>
              </button>

              <button 
                onClick={() => setShowCloseShiftModal(true)}
                className="btn-primary"
                style={{ fontSize: '13px', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff' }}
              >
                <Lock size={16} />
                <span>Đóng Ca & Đối Soát Tiền</span>
              </button>
            </>
          ) : (
            <button 
              onClick={() => setShowOpenShiftModal(true)}
              className="btn-primary"
              style={{ fontSize: '13px' }}
            >
              <Clock size={16} />
              <span>Mở Ca Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Shift Status Cards */}
      <div className="kpi-grid-4">
        <div className="card-glass" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Trạng Thái Ca</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <span className={`badge ${shift.status === 'ACTIVE' ? 'badge-staff' : 'badge-amber'}`}>
              {shift.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã đóng ca'}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '8px' }}>Mã ca: {shift.id}</div>
        </div>

        <div className="card-glass" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Tiền Đầu Ca (Két)</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            {Number(shift.initialCash).toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>Mở lúc {shift.openedAt}</div>
        </div>

        <div className="card-glass" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Doanh Thu Trong Ca</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent-amber)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            {Number(shift.totalSales).toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>{shift.ordersCount} đơn hoàn thành</div>
        </div>

        <div className="card-glass" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Tiền Mặt Kỳ Vọng</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#10b981', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
            {expectedCash.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '6px' }}>Đầu ca + Thu mặt - Chi mặt</div>
        </div>
      </div>

      {/* Sales by Payment Method Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px' }}>
        
        {/* Payment Breakdown Card */}
        <div className="card-glass" style={{ padding: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '14px' }}>
            Chi Tiết Doanh Thu Theo Phương Thức Thanh Toán
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Tiền mặt tại quầy', amount: shift.cashSales, color: '#10b981' },
              { label: 'Chuyển khoản VietQR', amount: shift.vietQrSales, color: '#3b82f6' },
              { label: 'Ví điện tử (MoMo / ZaloPay)', amount: shift.eWalletSales, color: '#d946ef' },
              { label: 'Thẻ ngân hàng / POS terminal', amount: shift.cardSales, color: '#f59e0b' },
            ].map((pm, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{pm.label}</span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                    {pm.amount.toLocaleString('vi-VN')} đ ({Math.round((pm.amount / shift.totalSales) * 100)}%)
                  </span>
                </div>
                <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(pm.amount / shift.totalSales) * 100}%`, background: pm.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shift Info Details */}
        <div className="card-glass" style={{ padding: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px' }}>Thông Tin Nhân Sự Ca</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Nhân viên mở ca:</span>
              <div style={{ fontWeight: '700', marginTop: '2px' }}>{shift.openedBy}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Cửa hàng:</span>
              <div style={{ fontWeight: '700', marginTop: '2px' }}>POSS Cầu Giấy (POSS-001)</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Thời gian mở:</span>
              <div style={{ fontWeight: '700', marginTop: '2px' }}>{shift.openedAt}</div>
            </div>
            {currentUserRole === 'OWNER' || currentUserRole === 'MANAGER' ? (
              <div style={{ marginTop: '10px', padding: '8px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '6px', fontSize: '11px', color: '#60a5fa' }}>
                * Quản lý có quyền đóng ca hộ nếu nhân viên quên đóng ca sau 24h.
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Petty Cash Expenses History (Thu / Chi Ngoài Ca) */}
      <div className="card-glass" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '700' }}>Các Khoản Chi/Thu Ngoài Ca Làm Việc</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ghi nhận mua đồ gấp, chi phí vận hành nhỏ trong ca</div>
          </div>

          <button onClick={() => setShowExpenseModal(true)} className="btn-secondary" style={{ fontSize: '12px' }}>
            + Thêm phiếu chi
          </button>
        </div>

        {shift.expensesList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)', fontSize: '12px' }}>
            Chưa có khoản thu/chi phát sinh nào ngoài ca
          </div>
        ) : (
          <div className="table-responsive" style={{ marginBottom: 0 }}>
            <table style={{ minWidth: '550px', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-dim)', textAlign: 'left' }}>
                  <th style={{ padding: '8px', whiteSpace: 'nowrap' }}>Thời gian</th>
                  <th style={{ padding: '8px', whiteSpace: 'nowrap' }}>Loại</th>
                  <th style={{ padding: '8px', whiteSpace: 'nowrap' }}>Lý do chi</th>
                  <th style={{ padding: '8px', whiteSpace: 'nowrap' }}>Người thực hiện</th>
                  <th style={{ padding: '8px', textAlign: 'right', whiteSpace: 'nowrap' }}>Số tiền</th>
                </tr>
              </thead>
              <tbody>
                {shift.expensesList.map((exp, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 8px' }}>{exp.time}</td>
                    <td style={{ padding: '10px 8px' }}>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', fontWeight: '700', fontSize: '11px' }}>
                        Chi tiền mặt
                      </span>
                    </td>
                    <td style={{ padding: '10px 8px', fontWeight: '600' }}>{exp.reason}</td>
                    <td style={{ padding: '10px 8px', color: 'var(--text-muted)' }}>{exp.by}</td>
                    <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '700', color: '#f87171', fontFamily: 'var(--font-mono)' }}>
                      -{exp.amount.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showExpenseModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '420px', padding: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>Ghi Nhận Chi Tiền Ngoài Ca</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Quy tắc Spec 06: Tiền chi sẽ được trừ trực tiếp khỏi kỳ vọng tiền mặt trong két.
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Số tiền chi (VNĐ)</label>
              <input 
                type="number"
                inputMode="numeric"
                placeholder="VD: 150000"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                className="input-dark"
                style={{ marginTop: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Lý do chi tiền (Bắt buộc)</label>
              <input 
                type="text"
                placeholder="VD: Mua thêm đá bi, mua túi nylon gấp..."
                value={expenseReason}
                onChange={(e) => setExpenseReason(e.target.value)}
                className="input-dark"
                style={{ marginTop: '4px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowExpenseModal(false)} className="btn-secondary" style={{ flex: 1 }}>Hủy</button>
              <button onClick={handleAddExpense} className="btn-primary" style={{ flex: 1 }}>Lưu Phiếu Chi</button>
            </div>
          </div>
        </div>
      )}

      {/* Close Shift & Cash Counting Modal (Spec 06 Core) */}
      {showCloseShiftModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '520px', padding: '22px' }}>
            <div style={{ fontSize: '18px', fontWeight: '800', marginBottom: '6px' }}>Đóng Ca Làm Việc & Kiểm Kê Két Tiền</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Nhân viên kiểm đếm chính xác số tiền mặt thực tế trong két để hệ thống đối soát tự động.
            </div>

            {/* Calculations Box */}
            <div style={{ padding: '14px', background: 'var(--bg-tertiary)', borderRadius: '10px', marginBottom: '16px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Tiền mặt đầu ca:</span>
                <span style={{ fontWeight: '700' }}>{shift.initialCash.toLocaleString('vi-VN')} đ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Doanh thu tiền mặt trong ca (+):</span>
                <span style={{ fontWeight: '700', color: '#10b981' }}>+{shift.cashSales.toLocaleString('vi-VN')} đ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Chi tiền ngoài ca (-):</span>
                <span style={{ fontWeight: '700', color: '#f87171' }}>-{shift.pettyCashOut.toLocaleString('vi-VN')} đ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px dashed var(--border-medium)', fontSize: '13px', fontWeight: '800' }}>
                <span>TIỀN MẶT KỲ VỌNG:</span>
                <span style={{ color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>{expectedCash.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>

            {/* Actual cash input */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>
                SỐ TIỀN MẶT THỰC TẾ ĐẾM ĐƯỢC TRONG KÉT (VNĐ)
              </label>
              <input 
                type="number"
                inputMode="numeric"
                value={actualCash}
                onChange={(e) => setActualCash(Number(e.target.value))}
                className="input-dark"
                style={{ height: '42px', fontSize: '18px', fontWeight: '800', marginTop: '6px', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            {/* Discrepancy Display */}
            <div style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: discrepancy === 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: discrepancy === 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
              marginBottom: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Chênh lệch (Thực tế - Kỳ vọng):</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: discrepancy === 0 ? '#10b981' : discrepancy > 0 ? '#38bdf8' : '#f87171' }}>
                  {discrepancy === 0 ? 'Khớp 100% (Không lệch)' : discrepancy > 0 ? `Thừa +${discrepancy.toLocaleString('vi-VN')} đ` : `Thiếu ${discrepancy.toLocaleString('vi-VN')} đ`}
                </div>
              </div>
              {discrepancy !== 0 && <AlertTriangle size={20} color="#f87171" />}
            </div>

            {/* Note if discrepancy */}
            {discrepancy !== 0 && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#f87171' }}>
                  Lý do giải trình chênh lệch (Bắt buộc theo Spec 06)
                </label>
                <textarea 
                  rows={2}
                  placeholder="VD: Khách trả nhầm tờ 50k thay vì 20k, thối thừa tiền cho khách bàn 02..."
                  value={discrepancyNote}
                  onChange={(e) => setDiscrepancyNote(e.target.value)}
                  className="input-dark"
                  style={{ marginTop: '4px', resize: 'none' }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowCloseShiftModal(false)} className="btn-secondary" style={{ flex: 1 }}>Hủy</button>
              <button onClick={handleConfirmCloseShift} className="btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff' }}>
                Xác Nhận Đóng Ca
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Closed Summary Receipt Preview */}
      {closedSummary && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '420px', padding: '24px', textAlign: 'center' }}>
            <CheckCircle2 size={44} color="#10b981" style={{ margin: '0 auto 10px auto' }} />
            <div style={{ fontSize: '18px', fontWeight: '800' }}>Ca Làm Việc Đã Đóng Thành Công</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Báo cáo ca đã được tự động lưu trữ và gửi thông báo tới Quản lý.
            </div>

            <div style={{ textAlign: 'left', background: 'var(--bg-tertiary)', padding: '14px', borderRadius: '8px', fontSize: '12px', marginBottom: '16px' }}>
              <div><strong>Đóng bởi:</strong> {closedSummary.closedBy}</div>
              <div><strong>Thời gian:</strong> {closedSummary.closedAt}</div>
              <div><strong>Tổng đơn:</strong> {closedSummary.ordersCount} đơn</div>
              <div><strong>Tổng doanh thu:</strong> {closedSummary.totalSales.toLocaleString('vi-VN')} đ</div>
              <div><strong>Tiền mặt thực tế:</strong> {closedSummary.actualCashCounted.toLocaleString('vi-VN')} đ</div>
              <div><strong>Chênh lệch:</strong> {closedSummary.discrepancy.toLocaleString('vi-VN')} đ</div>
              {closedSummary.discrepancyNote && <div><strong>Ghi chú:</strong> {closedSummary.discrepancyNote}</div>}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => alert('Đã gửi lệnh in báo cáo kết ca ra máy in bill nhiệt!')} className="btn-secondary" style={{ flex: 1 }}>
                <Printer size={15} /> In Báo Cáo Ca
              </button>
              <button onClick={() => setClosedSummary(null)} className="btn-primary" style={{ flex: 1 }}>
                Hoàn Tất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
