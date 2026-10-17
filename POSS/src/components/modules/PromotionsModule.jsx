import React, { useState } from 'react';
import { 
  TicketPercent, 
  Plus, 
  Sparkles, 
  Calendar, 
  Clock, 
  Store, 
  CheckCircle2, 
  X, 
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { PROMOTIONS, VOUCHERS } from '../../data/mockData';

export function PromotionsModule({ currentUserRole }) {
  const [promotions, setPromotions] = useState(PROMOTIONS);
  const [vouchers, setVouchers] = useState(VOUCHERS);
  const [activeTab, setActiveTab] = useState('promos'); // 'promos' | 'vouchers'

  // Create promo modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [promoName, setPromoName] = useState('');
  const [promoType, setPromoType] = useState('DIRECT_DISCOUNT');
  const [promoValue, setPromoValue] = useState(15);
  const [promoMinOrder, setPromoMinOrder] = useState(50000);
  const [promoDesc, setPromoDesc] = useState('');

  // Batch Voucher Generate Modal
  const [showBatchVoucherModal, setShowBatchVoucherModal] = useState(false);
  const [batchPrefix, setBatchPrefix] = useState('AUTUMN26');
  const [batchCount, setBatchCount] = useState(5);
  const [batchDiscount, setBatchDiscount] = useState(25000);

  const handleCreatePromo = () => {
    if (!promoName.trim()) {
      alert('Vui lòng nhập tên chương trình khuyến mãi!');
      return;
    }

    const newKM = {
      id: `KM-00${promotions.length + 1}`,
      name: promoName,
      type: promoType,
      value: Number(promoValue),
      validFrom: '2026-10-15',
      validTo: '2026-11-15',
      timeSlot: 'Toàn bộ thời gian',
      minOrderValue: Number(promoMinOrder),
      applicableStores: ['POSS-001', 'POSS-002', 'POSS-003'],
      status: 'ACTIVE',
      usageCount: 0,
      description: promoDesc || 'Chương trình khuyến mãi áp dụng toàn chuỗi.'
    };

    setPromotions([newKM, ...promotions]);
    setShowCreateModal(false);
    alert(`Đã khởi tạo thành công chương trình "${newKM.name}"!`);
  };

  const handleGenerateBatchVouchers = () => {
    const newBatch = Array.from({ length: Number(batchCount) }, (_, i) => ({
      code: `${batchPrefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      discount: Number(batchDiscount),
      type: 'FIXED',
      minSpend: 80000,
      status: 'AVAILABLE',
      expire: '2026-12-31'
    }));

    setVouchers([...newBatch, ...vouchers]);
    setShowBatchVoucherModal(false);
    alert(`Đã sinh tự động ${batchCount} mã voucher mới với tiền tố ${batchPrefix}!`);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Module Tabs Bar (Primary Navigation, always placed at top) */}
      <div className="module-tabs-bar">
        <button
          onClick={() => setActiveTab('promos')}
          style={{
            fontWeight: activeTab === 'promos' ? '700' : '500',
            background: activeTab === 'promos' ? 'var(--accent-amber)' : 'var(--bg-tertiary)',
            color: activeTab === 'promos' ? '#000' : 'var(--text-main)',
          }}
        >
          Chương Trình Khuyến Mãi ({promotions.length})
        </button>
        <button
          onClick={() => setActiveTab('vouchers')}
          style={{
            fontWeight: activeTab === 'vouchers' ? '700' : '500',
            background: activeTab === 'vouchers' ? 'var(--accent-amber)' : 'var(--bg-tertiary)',
            color: activeTab === 'vouchers' ? '#000' : 'var(--text-main)',
          }}
        >
          Kho Mã Voucher ({vouchers.length})
        </button>
      </div>

      {/* Header */}
      <div className="module-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
            Quản Lý Khuyến Mãi & Voucher (Spec 09)
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Cấu hình giảm giá trực tiếp, Happy Hour, Combo bữa sáng, Mua X tặng Y và kho mã voucher
          </p>
        </div>

        {currentUserRole === 'OWNER' && (
          <div className="module-header-actions">
            <button onClick={() => setShowCreateModal(true)} className="btn-primary" style={{ fontSize: '13px' }}>
              <Plus size={16} /> Tạo Khuyến Mãi Mới
            </button>
            <button onClick={() => setShowBatchVoucherModal(true)} className="btn-secondary" style={{ fontSize: '13px' }}>
              <Sparkles size={16} /> Phát Hành Voucher
            </button>
          </div>
        )}
      </div>

      {activeTab === 'promos' ? (
        /* Promotions Cards */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {promotions.map(km => (
            <div key={km.id} className="card-glass" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                  <span style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: km.type === 'COMBO' ? '#8b5cf6' : km.type === 'BUY_X_GET_Y' ? '#3b82f6' : '#f59e0b',
                    color: '#fff',
                    fontWeight: '800'
                  }}>
                    {km.type === 'COMBO' ? 'COMBO ĐẶC BIỆT' : km.type === 'BUY_X_GET_Y' ? 'MUA X TẶNG Y' : 'GIẢM GIÁ TRỰC TIẾP'}
                  </span>
                  <span className="badge badge-staff">Đang hoạt động</span>
                </div>

                <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '8px' }}>
                  {km.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.4' }}>
                  {km.description}
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', fontSize: '11px', color: 'var(--text-dim)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div>Áp dụng: {km.timeSlot}</div>
                  <div>Hạn: {km.validTo}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div>Đã dùng: <strong>{km.usageCount} lượt</strong></div>
                  <div style={{ color: 'var(--accent-amber)' }}>Tự động áp dụng trên POS</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Vouchers Batch Table */
        <div className="table-responsive">
          <table style={{ minWidth: '580px', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-dim)', textAlign: 'left' }}>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Mã Voucher</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Mức giảm</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Đơn tối thiểu</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Hạn sử dụng</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.map((v, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '800', fontFamily: 'var(--font-mono)', color: 'var(--accent-amber)', whiteSpace: 'nowrap' }}>
                    {v.code}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                    {v.type === 'PERCENT' ? `-${v.discount}%` : `-${Number(v.discount).toLocaleString('vi-VN')} đ`}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {Number(v.minSpend).toLocaleString('vi-VN')} đ
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                    {v.expire}
                  </td>
                  <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                    <span className={`badge ${v.status === 'AVAILABLE' ? 'badge-staff' : 'badge-owner'}`} style={{ whiteSpace: 'nowrap' }}>
                      {v.status === 'AVAILABLE' ? 'Chưa sử dụng' : 'Đã sử dụng'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Promo Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '480px', padding: '22px' }}>
            <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px' }}>Tạo Chương Trình Khuyến Mãi Mới</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Tên chương trình</label>
                <input 
                  type="text" 
                  placeholder="VD: Tri Ân Khách Hàng Cuối Tuần" 
                  value={promoName} 
                  onChange={(e) => setPromoName(e.target.value)} 
                  className="input-dark" 
                  style={{ marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Loại khuyến mãi</label>
                <select 
                  value={promoType} 
                  onChange={(e) => setPromoType(e.target.value)} 
                  className="input-dark" 
                  style={{ marginTop: '4px' }}
                >
                  <option value="DIRECT_DISCOUNT">Giảm giá trực tiếp (%)</option>
                  <option value="COMBO">Combo sản phẩm ghép đôi</option>
                  <option value="BUY_X_GET_Y">Mua X Tặng Y</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Mức giảm (% hoặc VNĐ)</label>
                  <input 
                    type="number" 
                    value={promoValue} 
                    onChange={(e) => setPromoValue(e.target.value)} 
                    className="input-dark" 
                    style={{ marginTop: '4px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Đơn tối thiểu (VNĐ)</label>
                  <input 
                    type="number" 
                    value={promoMinOrder} 
                    onChange={(e) => setPromoMinOrder(e.target.value)} 
                    className="input-dark" 
                    style={{ marginTop: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Mô tả chi tiết</label>
                <textarea 
                  rows={2} 
                  value={promoDesc} 
                  onChange={(e) => setPromoDesc(e.target.value)} 
                  className="input-dark" 
                  style={{ marginTop: '4px', resize: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowCreateModal(false)} className="btn-secondary" style={{ flex: 1 }}>Hủy</button>
              <button onClick={handleCreatePromo} className="btn-primary" style={{ flex: 1 }}>Lưu Khuyến Mãi</button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Voucher Modal */}
      {showBatchVoucherModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '420px', padding: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px' }}>Phát Hành Batch Mã Voucher</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Tiền tố mã (Prefix)</label>
                <input 
                  type="text" 
                  value={batchPrefix} 
                  onChange={(e) => setBatchPrefix(e.target.value)} 
                  className="input-dark" 
                  style={{ marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Số lượng mã sinh</label>
                  <input 
                    type="number" 
                    value={batchCount} 
                    onChange={(e) => setBatchCount(e.target.value)} 
                    className="input-dark" 
                    style={{ marginTop: '4px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Giá trị giảm (VNĐ)</label>
                  <input 
                    type="number" 
                    value={batchDiscount} 
                    onChange={(e) => setBatchDiscount(e.target.value)} 
                    className="input-dark" 
                    style={{ marginTop: '4px' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowBatchVoucherModal(false)} className="btn-secondary" style={{ flex: 1 }}>Hủy</button>
              <button onClick={handleGenerateBatchVouchers} className="btn-primary" style={{ flex: 1 }}>Tạo Hàng Loạt</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
