import React, { useState } from 'react';
import { 
  Boxes, 
  AlertTriangle, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  ArrowLeftRight, 
  ClipboardCheck, 
  Plus, 
  Search, 
  CheckCircle2, 
  X,
  RefreshCw
} from 'lucide-react';
import { PRODUCTS, INITIAL_STORES } from '../../data/mockData';

export function InventoryModule({ currentUserRole, currentStore }) {
  const [stockItems, setStockItems] = useState(PRODUCTS);
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' | 'stockin' | 'stockout' | 'transfer' | 'audit'
  const [search, setSearch] = useState('');

  // Stock In Modal
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [stockInProduct, setStockInProduct] = useState(PRODUCTS[0].id);
  const [stockInQty, setStockInQty] = useState(50);
  const [stockInNote, setStockInNote] = useState('Nhập từ kho tổng / Nhà cung cấp');

  // Physical Audit Sheet State
  const [auditCounts, setAuditCounts] = useState(
    PRODUCTS.reduce((acc, p) => ({ ...acc, [p.id]: p.stock }), {})
  );
  const [auditSubmitted, setAuditSubmitted] = useState(false);

  // Transfer stock modal (Owner only)
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferTargetStore, setTransferTargetStore] = useState('POSS-002');
  const [transferQty, setTransferQty] = useState(20);

  const lowStockCount = stockItems.filter(p => p.stock <= p.minStock && p.stock > 0).length;
  const outOfStockCount = stockItems.filter(p => p.stock === 0).length;

  const handleStockIn = () => {
    setStockItems(stockItems.map(p => {
      if (p.id === stockInProduct) {
        return { ...p, stock: p.stock + Number(stockInQty) };
      }
      return p;
    }));
    alert(`Đã tạo phiếu nhập kho thành công cho sản phẩm! Cập nhật tồn kho.`);
    setShowStockInModal(false);
  };

  const handleApplyAudit = () => {
    setStockItems(stockItems.map(p => ({
      ...p,
      stock: auditCounts[p.id] !== undefined ? Number(auditCounts[p.id]) : p.stock
    })));
    setAuditSubmitted(true);
    setTimeout(() => setAuditSubmitted(false), 3000);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Module Tabs Bar (Primary Navigation, always placed at top, never buried under header layout) */}
      <div className="module-tabs-bar">
        <button
          onClick={() => setActiveTab('stock')}
          style={{
            fontWeight: activeTab === 'stock' ? '700' : '500',
            background: activeTab === 'stock' ? 'var(--accent-amber)' : 'var(--bg-tertiary)',
            color: activeTab === 'stock' ? '#000' : 'var(--text-main)',
          }}
        >
          Danh Sách Tồn Kho ({stockItems.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          style={{
            fontWeight: activeTab === 'audit' ? '700' : '500',
            background: activeTab === 'audit' ? 'var(--accent-amber)' : 'var(--bg-tertiary)',
            color: activeTab === 'audit' ? '#000' : 'var(--text-main)',
          }}
        >
          Phiếu Kiểm Kê Định Kỳ (Audit)
        </button>
      </div>

      {/* Header */}
      <div className="module-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
            Quản Lý Tồn Kho (Spec 07)
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Theo dõi tồn kho thành phẩm, cảnh báo ngưỡng tối thiểu, phiếu nhập/xuất và kiểm kê
          </p>
        </div>

        <div className="module-header-actions">
          {(currentUserRole === 'OWNER' || currentUserRole === 'MANAGER') && (
            <>
              <button onClick={() => setShowStockInModal(true)} className="btn-primary" style={{ fontSize: '13px' }}>
                <ArrowDownToLine size={16} /> Phiếu Nhập Kho
              </button>
              {currentUserRole === 'OWNER' && (
                <button onClick={() => setShowTransferModal(true)} className="btn-secondary" style={{ fontSize: '13px' }}>
                  <ArrowLeftRight size={16} /> Chuyển Kho Chuỗi
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="kpi-grid-4">
        <div className="card-glass" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '700', whiteSpace: 'nowrap' }}>TỔNG MÃ SẢN PHẨM</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px', whiteSpace: 'nowrap' }}>
            {stockItems.length} SKU
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentStore?.name?.replace('Ba.li Poss ', '')}</div>
        </div>

        <div className="card-glass" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#10b981', fontWeight: '700', whiteSpace: 'nowrap' }}>ĐỦ HÀNG AN TOÀN</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#10b981', marginTop: '4px', whiteSpace: 'nowrap' }}>
            {stockItems.filter(p => p.stock > p.minStock).length} món
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', whiteSpace: 'nowrap' }}>Đảm bảo bán trong ca</div>
        </div>

        <div className="card-glass" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '700', whiteSpace: 'nowrap' }}>CẢNH BÁO SẮP HẾT</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#f59e0b', marginTop: '4px', whiteSpace: 'nowrap' }}>
            {lowStockCount} món
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', whiteSpace: 'nowrap' }}>Dưới ngưỡng tối thiểu</div>
        </div>

        <div className="card-glass" style={{ padding: '16px' }}>
          <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: '700', whiteSpace: 'nowrap' }}>HẾT HÀNG TẠI QUẦY</div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#ef4444', marginTop: '4px', whiteSpace: 'nowrap' }}>
            {outOfStockCount} món
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', whiteSpace: 'nowrap' }}>Tự động ẩn trên POS</div>
        </div>
      </div>

      {activeTab === 'stock' ? (
        /* Stock List with progress bar */
        <div className="table-responsive">
          <table style={{ minWidth: '650px', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-dim)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Sản phẩm / SKU</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Tồn hiện tại</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Ngưỡng tối thiểu</th>
                <th style={{ padding: '12px 16px', width: '200px', whiteSpace: 'nowrap' }}>Thanh mức tồn</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Trạng thái kho</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>Giá trị tồn</th>
              </tr>
            </thead>
            <tbody>
              {stockItems.map(p => {
                const isOutOfStock = p.stock === 0;
                const isLow = p.stock <= p.minStock && p.stock > 0;
                const percent = Math.min(100, Math.round((p.stock / (p.minStock * 3)) * 100));

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{p.name}</div>
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{p.sku}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: '16px', fontWeight: '800', fontFamily: 'var(--font-mono)' }}>
                      {p.stock} ly/phần
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                      {p.minStock} ly/phần
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${percent}%`,
                          background: isOutOfStock ? '#ef4444' : isLow ? '#f59e0b' : '#10b981'
                        }} />
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span className={`badge ${isOutOfStock ? 'badge-owner' : isLow ? 'badge-amber' : 'badge-staff'}`}>
                        {isOutOfStock ? 'Hết hàng (Tạm dừng)' : isLow ? 'Sắp hết hàng' : 'Đủ hàng'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                      {(p.stock * p.basePrice).toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Physical Audit Sheet (Spec 07) */
        <div className="card-glass" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800' }}>Bảng Kiểm Kê Kho Thực Tế (Physical Count)</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Quy tắc Spec 07: Nhân viên nhập số thực tế đếm được. Hệ thống tự tính chênh lệch và tạo phiếu điều chỉnh.
              </div>
            </div>

            <button onClick={handleApplyAudit} className="btn-primary" style={{ fontSize: '13px' }}>
              <CheckCircle2 size={16} /> Lưu & Cập Nhật Tồn Kho Mới
            </button>
          </div>

          {auditSubmitted && (
            <div style={{ padding: '10px 14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', borderRadius: '8px', color: '#34d399', fontSize: '13px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18} /> Đã cập nhật thành công kết quả kiểm kê vào hệ thống kho!
            </div>
          )}

          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-dim)', textAlign: 'left' }}>
                  <th style={{ padding: '10px', whiteSpace: 'nowrap' }}>Sản phẩm</th>
                  <th style={{ padding: '10px', whiteSpace: 'nowrap' }}>Hệ thống ghi nhận</th>
                  <th style={{ padding: '10px', whiteSpace: 'nowrap' }}>Số thực tế đếm</th>
                  <th style={{ padding: '10px', whiteSpace: 'nowrap' }}>Chênh lệch (Lệch)</th>
                  <th style={{ padding: '10px', whiteSpace: 'nowrap' }}>Tự động điều chỉnh</th>
                </tr>
              </thead>
            <tbody>
              {stockItems.map(p => {
                const currentCount = auditCounts[p.id] !== undefined ? auditCounts[p.id] : p.stock;
                const diff = currentCount - p.stock;

                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px', fontWeight: '600' }}>{p.name}</td>
                    <td style={{ padding: '10px', fontFamily: 'var(--font-mono)' }}>{p.stock}</td>
                    <td style={{ padding: '10px' }}>
                      <input 
                        type="number"
                        value={currentCount}
                        onChange={(e) => setAuditCounts({ ...auditCounts, [p.id]: Number(e.target.value) })}
                        className="input-dark"
                        style={{ width: '90px', height: '32px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: '700' }}
                      />
                    </td>
                    <td style={{ padding: '10px', fontWeight: '800', color: diff === 0 ? '#10b981' : diff > 0 ? '#38bdf8' : '#f87171' }}>
                      {diff === 0 ? 'Khớp (0)' : diff > 0 ? `+${diff} (Thừa)` : `${diff} (Thiếu)`}
                    </td>
                    <td style={{ padding: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      {diff === 0 ? 'Không cần chỉnh' : diff > 0 ? 'Tự tạo Phiếu Nhập thừa' : 'Tự tạo Phiếu Xuất hao hụt'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Stock In Modal */}
      {showStockInModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '440px', padding: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>Tạo Phiếu Nhập Kho (Stock-In)</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Nhập hàng từ kho tổng hoặc nhà cung cấp nguyên liệu hoàn chỉnh.
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Chọn sản phẩm</label>
              <select 
                value={stockInProduct}
                onChange={(e) => setStockInProduct(e.target.value)}
                className="input-dark"
                style={{ marginTop: '4px' }}
              >
                {stockItems.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Tồn hiện tại: {p.stock})</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Số lượng nhập (ly / phần)</label>
              <input 
                type="number"
                value={stockInQty}
                onChange={(e) => setStockInQty(Number(e.target.value))}
                className="input-dark"
                style={{ marginTop: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Ghi chú phiếu nhập</label>
              <input 
                type="text"
                value={stockInNote}
                onChange={(e) => setStockInNote(e.target.value)}
                className="input-dark"
                style={{ marginTop: '4px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowStockInModal(false)} className="btn-secondary" style={{ flex: 1 }}>Hủy</button>
              <button onClick={handleStockIn} className="btn-primary" style={{ flex: 1 }}>Xác Nhận Nhập</button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal (Owner only) */}
      {showTransferModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '440px', padding: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>Chuyển Kho Giữa Các Chi Nhánh (Owner)</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Quy tắc Spec 07: Cửa hàng nguồn trừ tồn kho ngay khi tạo, cửa hàng đích cộng tồn khi xác nhận nhận hàng.
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Từ cửa hàng nguồn</label>
              <input 
                type="text" 
                disabled 
                value={currentStore?.name || 'Ba.li Poss Cầu Giấy'} 
                className="input-dark" 
                style={{ marginTop: '4px', opacity: 0.7 }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Đến chi nhánh đích</label>
              <select 
                value={transferTargetStore}
                onChange={(e) => setTransferTargetStore(e.target.value)}
                className="input-dark"
                style={{ marginTop: '4px' }}
              >
                {INITIAL_STORES.filter(s => s.id !== currentStore?.id).map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Số lượng điều chuyển</label>
              <input 
                type="number"
                value={transferQty}
                onChange={(e) => setTransferQty(Number(e.target.value))}
                className="input-dark"
                style={{ marginTop: '4px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowTransferModal(false)} className="btn-secondary" style={{ flex: 1 }}>Đóng</button>
              <button 
                onClick={() => {
                  alert(`Đã tạo phiếu điều chuyển ${transferQty} sản phẩm tới ${transferTargetStore}! Trạng thái: Chờ nhận.`);
                  setShowTransferModal(false);
                }} 
                className="btn-primary" 
                style={{ flex: 1 }}
              >
                Tạo Phiếu Chuyển
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
