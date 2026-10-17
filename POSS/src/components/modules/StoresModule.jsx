import React, { useState } from 'react';
import { 
  Store, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Printer, 
  Receipt, 
  Percent, 
  CheckCircle2, 
  AlertTriangle, 
  Edit, 
  ShieldCheck,
  X,
  Power
} from 'lucide-react';
import { INITIAL_STORES } from '../../data/mockData';

export function StoresModule({ currentUserRole, stores, setStores, selectedStore, setSelectedStore }) {
  const [storeList, setStoreList] = useState(stores || INITIAL_STORES);
  const [activeStoreDetail, setActiveStoreDetail] = useState(selectedStore || INITIAL_STORES[0]);
  const [activeTab, setActiveTab] = useState('info'); // 'info' | 'hours' | 'finance' | 'devices'

  // Add store modal
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newTables, setNewTables] = useState(20);
  const [newPrinter, setNewPrinter] = useState('80mm');

  // Toggle Pause/Open store
  const toggleStoreStatus = (id) => {
    if (currentUserRole !== 'OWNER') {
      alert('Chỉ Owner mới có quyền Tạm đóng hoặc Mở lại cửa hàng theo Spec 02!');
      return;
    }

    const updated = storeList.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'OPEN' ? 'PAUSED' : 'OPEN';
        return { ...s, status: nextStatus };
      }
      return s;
    });
    setStoreList(updated);
    if (setStores) setStores(updated);
    if (activeStoreDetail.id === id) {
      setActiveStoreDetail({ ...activeStoreDetail, status: activeStoreDetail.status === 'OPEN' ? 'PAUSED' : 'OPEN' });
    }
  };

  const handleAddStore = () => {
    if (!newName.trim() || !newAddress.trim()) {
      alert('Vui lòng nhập tên và địa chỉ cửa hàng!');
      return;
    }

    const newStoreObj = {
      id: `POSS-00${storeList.length + 1}`,
      name: newName,
      address: newAddress,
      phone: newPhone || '024 3999 8888',
      email: 'contact@poss.vn',
      status: 'OPEN',
      tables: Number(newTables),
      allowDineIn: true,
      openingHours: '07:00 - 23:00 (Hàng ngày)',
      vatRate: 8,
      serviceCharge: 0,
      printerType: newPrinter,
      printerConnection: 'LAN/Wi-Fi (192.168.1.185)',
      hasCashDrawer: true,
      todayRevenue: 0,
      todayOrders: 0,
      activeStaffCount: 1,
      image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=500&auto=format&fit=crop&q=80',
    };

    const updated = [...storeList, newStoreObj];
    setStoreList(updated);
    if (setStores) setStores(updated);
    setShowAddStoreModal(false);
    alert(`Đã tạo thành công chi nhánh mới ${newStoreObj.id} - ${newStoreObj.name}! Tự động sao chép menu chuỗi.`);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="module-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
            Quản Lý Chuỗi Cửa Hàng (Spec 02)
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Tổng quan mạng lưới chi nhánh, cấu hình VAT, giờ hoạt động và thiết bị in ấn
          </p>
        </div>

        {currentUserRole === 'OWNER' && (
          <div className="module-header-actions">
            <button onClick={() => setShowAddStoreModal(true)} className="btn-primary" style={{ fontSize: '13px' }}>
              <Plus size={16} /> Thêm Cửa Hàng Mới
            </button>
          </div>
        )}
      </div>

      {/* Stores Grid Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {storeList.map(st => {
          const isOpen = st.status === 'OPEN';
          const isSelected = activeStoreDetail.id === st.id;

          return (
            <div 
              key={st.id}
              onClick={() => setActiveStoreDetail(st)}
              className="card-glass"
              style={{
                overflow: 'hidden',
                cursor: 'pointer',
                border: isSelected ? '2px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
                position: 'relative'
              }}
            >
              <div style={{ height: '120px', position: 'relative' }}>
                <img 
                  src={st.image} 
                  alt={st.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                }}>
                  <span className={`badge ${isOpen ? 'badge-staff' : 'badge-amber'}`}>
                    {isOpen ? 'Đang hoạt động' : 'Tạm đóng'}
                  </span>
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  left: '8px',
                  background: 'rgba(0,0,0,0.7)',
                  color: '#fff',
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontWeight: '700'
                }}>
                  {st.id}
                </div>
              </div>

              <div style={{ padding: '14px' }}>
                <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '4px' }}>
                  {st.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <MapPin size={13} /> {st.address.slice(0, 32)}...
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px', fontSize: '12px' }}>
                  <div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '10px' }}>DOANH THU HÔM NAY</div>
                    <div style={{ fontWeight: '800', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                      {Number(st.todayRevenue).toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-dim)', fontSize: '10px' }}>ĐƠN HÀNG</div>
                    <div style={{ fontWeight: '800', color: 'var(--text-main)' }}>
                      {st.todayOrders} đơn
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Store Detailed Configuration Tabs */}
      <div className="card-glass" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Chi Tiết Chi Nhánh: {activeStoreDetail.name} ({activeStoreDetail.id})</span>
              <span className={`badge ${activeStoreDetail.status === 'OPEN' ? 'badge-staff' : 'badge-amber'}`}>
                {activeStoreDetail.status === 'OPEN' ? 'Mở cửa' : 'Tạm đóng'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cấu hình chi tiết cửa hàng theo tài liệu đặc tả Spec 02</div>
          </div>

          {currentUserRole === 'OWNER' && (
            <button 
              onClick={() => toggleStoreStatus(activeStoreDetail.id)}
              className={activeStoreDetail.status === 'OPEN' ? 'btn-danger' : 'btn-primary'}
              style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Power size={14} />
              <span>{activeStoreDetail.status === 'OPEN' ? 'Tạm Đóng Cửa Hàng' : 'Mở Lại Cửa Hàng'}</span>
            </button>
          )}
        </div>

        {/* Tab Buttons */}
        <div className="module-tabs-bar">
          {[
            { id: 'info', label: '1. Thông tin chung' },
            { id: 'hours', label: '2. Giờ hoạt động' },
            { id: 'finance', label: '3. Thuế VAT & Tài chính' },
            { id: 'devices', label: '4. Máy in & Thiết bị POS' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: activeTab === t.id ? '700' : '500',
                background: activeTab === t.id ? 'var(--bg-tertiary)' : 'transparent',
                color: activeTab === t.id ? 'var(--accent-amber)' : 'var(--text-muted)',
                border: activeTab === t.id ? '1px solid var(--border-medium)' : '1px solid transparent'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Info */}
        {activeTab === 'info' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '13px' }}>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Địa chỉ:</span>
              <div style={{ fontWeight: '600', marginTop: '4px' }}>{activeStoreDetail.address}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Số điện thoại liên hệ:</span>
              <div style={{ fontWeight: '600', marginTop: '4px' }}>{activeStoreDetail.phone}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Email:</span>
              <div style={{ fontWeight: '600', marginTop: '4px' }}>{activeStoreDetail.email}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Quy mô bàn phục vụ tại chỗ:</span>
              <div style={{ fontWeight: '600', marginTop: '4px' }}>{activeStoreDetail.tables} bàn (Hỗ trợ Dine-in)</div>
            </div>
          </div>
        )}

        {/* Tab 2: Hours */}
        {activeTab === 'hours' && (
          <div style={{ fontSize: '13px' }}>
            <div style={{ marginBottom: '14px' }}>
              <span style={{ color: 'var(--text-dim)' }}>Khung giờ bán hàng hiện tại:</span>
              <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--accent-amber)', marginTop: '4px' }}>
                {activeStoreDetail.openingHours}
              </div>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              * Khi ngoài khung giờ bán hàng, hệ thống nhắc nhở nhân viên đóng ca để bảo toàn két tiền.
            </div>
          </div>
        )}

        {/* Tab 3: Finance */}
        {activeTab === 'finance' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', fontSize: '13px' }}>
            <div style={{ padding: '14px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-dim)' }}>Thuế Giá Trị Gia Tăng (VAT):</span>
              <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent-amber)', marginTop: '4px' }}>
                {activeStoreDetail.vatRate}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mặc định theo chuẩn thuế F&B</div>
            </div>
            <div style={{ padding: '14px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-dim)' }}>Phí dịch vụ (Service Charge):</span>
              <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginTop: '4px' }}>
                {activeStoreDetail.serviceCharge}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Áp dụng bàn phòng lạnh VIP</div>
            </div>
            <div style={{ padding: '14px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-dim)' }}>Tiền tệ giao dịch:</span>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#10b981', marginTop: '4px' }}>
                VND (₫)
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Đồng Việt Nam</div>
            </div>
          </div>
        )}

        {/* Tab 4: Devices */}
        {activeTab === 'devices' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', fontSize: '13px' }}>
            <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '8px' }}>
                <Printer size={18} color="var(--accent-amber)" /> Máy In Hóa Đơn Nhiệt
              </div>
              <div>Khổ giấy in: <strong>{activeStoreDetail.printerType}</strong> (Chuẩn bill 80mm)</div>
              <div style={{ marginTop: '4px' }}>Kết nối: <strong>{activeStoreDetail.printerConnection}</strong></div>
              <div style={{ fontSize: '11px', color: '#10b981', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> Sẵn sàng nhận lệnh in
              </div>
            </div>

            <div style={{ padding: '16px', background: 'var(--bg-tertiary)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', marginBottom: '8px' }}>
                <Receipt size={18} color="var(--accent-amber)" /> Ngăn Kéo Đựng Tiền (Cash Drawer)
              </div>
              <div>Tự động bật mở khi in bill: <strong>Có kết nối RJ11</strong></div>
              <div style={{ fontSize: '11px', color: '#10b981', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> Hoạt động bình thường
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Store Modal */}
      {showAddStoreModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '480px', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '16px', fontWeight: '800' }}>Thêm Cửa Hàng Mới Trong Chuỗi</div>
              <button onClick={() => setShowAddStoreModal(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Tên cửa hàng</label>
                <input 
                  type="text" 
                  placeholder="VD: Ba.li Poss Ba Đình"
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)}
                  className="input-dark" 
                  style={{ marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Địa chỉ đầy đủ</label>
                <input 
                  type="text" 
                  placeholder="Số nhà, đường, phường, quận..."
                  value={newAddress} 
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="input-dark" 
                  style={{ marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Hotline</label>
                  <input 
                    type="text" 
                    placeholder="024 3838 xxxx"
                    value={newPhone} 
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="input-dark" 
                    style={{ marginTop: '4px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Số lượng bàn</label>
                  <input 
                    type="number" 
                    value={newTables} 
                    onChange={(e) => setNewTables(e.target.value)}
                    className="input-dark" 
                    style={{ marginTop: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Khổ giấy máy in hóa đơn</label>
                <select 
                  value={newPrinter} 
                  onChange={(e) => setNewPrinter(e.target.value)}
                  className="input-dark" 
                  style={{ marginTop: '4px' }}
                >
                  <option value="80mm">Khổ giấy tiêu chuẩn 80mm</option>
                  <option value="58mm">Khổ giấy nhỏ 58mm</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowAddStoreModal(false)} className="btn-secondary" style={{ flex: 1 }}>Hủy</button>
              <button onClick={handleAddStore} className="btn-primary" style={{ flex: 1 }}>Xác Nhận Tạo Cửa Hàng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
