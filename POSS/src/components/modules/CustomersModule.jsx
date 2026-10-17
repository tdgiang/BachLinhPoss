import React, { useState } from 'react';
import { 
  Users, 
  Award, 
  Gift, 
  Search, 
  Plus, 
  Phone, 
  Calendar, 
  CreditCard, 
  Sparkles, 
  CheckCircle2, 
  X,
  History
} from 'lucide-react';
import { INITIAL_CUSTOMERS } from '../../data/mockData';

export function CustomersModule({ currentUserRole }) {
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [selectedCustomer, setSelectedCustomer] = useState(INITIAL_CUSTOMERS[0]);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New customer form
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDob, setNewDob] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Rewards catalog
  const rewardsList = [
    { id: 'rew-1', title: 'Voucher Giảm 50.000đ Toàn Đơn', pointsNeeded: 300, minTier: 'SILVER' },
    { id: 'rew-2', title: 'Tặng 01 Ly Trà Trái Cây Size L Bất Kỳ', pointsNeeded: 250, minTier: 'SILVER' },
    { id: 'rew-3', title: 'Tặng 01 Bánh Croissant Bơ Pháp Nướng', pointsNeeded: 200, minTier: 'GOLD' },
    { id: 'rew-4', title: 'Voucher Giảm 100.000đ Sinh Nhật VIP', pointsNeeded: 500, minTier: 'PLATINUM' },
  ];

  const filtered = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  );

  const handleAddCustomer = () => {
    if (!newName.trim() || !newPhone.trim()) {
      alert('Vui lòng nhập họ tên và số điện thoại khách hàng!');
      return;
    }

    if (customers.some(c => c.phone === newPhone)) {
      alert('Số điện thoại này đã được đăng ký trước đó!');
      return;
    }

    const newCus = {
      id: `CUS-00${customers.length + 1}`,
      name: newName,
      phone: newPhone,
      email: newEmail || 'khachhang@gmail.com',
      tier: 'SILVER',
      points: 50, // Welcome points
      totalSpent: 0,
      orderCount: 0,
      dob: newDob || '1995-01-01',
      joinDate: new Date().toISOString().slice(0, 10),
      notes: newNotes,
    };

    setCustomers([newCus, ...customers]);
    setSelectedCustomer(newCus);
    setShowAddModal(false);
    alert(`Đã thêm thành công khách hàng ${newCus.name} với hạng Bạc và tặng 50 điểm chào mừng!`);
  };

  const handleRedeemReward = (reward) => {
    if (selectedCustomer.points < reward.pointsNeeded) {
      alert(`Khách hàng không đủ điểm để đổi phần thưởng này (Cần ${reward.pointsNeeded} điểm, hiện có ${selectedCustomer.points} điểm)!`);
      return;
    }

    const updated = {
      ...selectedCustomer,
      points: selectedCustomer.points - reward.pointsNeeded
    };

    setSelectedCustomer(updated);
    setCustomers(customers.map(c => c.id === updated.id ? updated : c));
    alert(`Đổi thành công phần thưởng "${reward.title}"! Đã trừ ${reward.pointsNeeded} điểm loyalty.`);
  };

  const getTierColor = (tier) => {
    if (tier === 'PLATINUM') return { bg: 'linear-gradient(135deg, #7c3aed, #4f46e5)', name: 'Bạch Kim (Platinum)', discount: '10%' };
    if (tier === 'GOLD') return { bg: 'linear-gradient(135deg, #d97706, #b45309)', name: 'Vàng (Gold)', discount: '5%' };
    return { bg: 'linear-gradient(135deg, #64748b, #475569)', name: 'Bạc (Silver)', discount: 'Tích lũy' };
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="module-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
            Khách Hàng & Loyalty Thân Thiết (Spec 08)
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Hệ thống phân hạng Bạc / Vàng / Bạch Kim, quy tắc tích điểm 10.000đ = 1 điểm và đổi quà
          </p>
        </div>

        <div className="module-header-actions">
          <button onClick={() => setShowAddModal(true)} className="btn-primary" style={{ fontSize: '13px' }}>
            <Plus size={16} /> Thêm Khách Hàng Mới
          </button>
        </div>
      </div>

      <div className="layout-two-col">
        
        {/* Left: Customer List */}
        <div className="card-glass" style={{ padding: '16px', display: 'flex', flexDirection: 'column', minHeight: '360px', maxHeight: '580px' }}>
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Tìm theo SĐT hoặc tên khách..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-dark"
              style={{ paddingLeft: '32px', height: '36px', fontSize: '12px' }}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map(cus => {
              const isSelected = selectedCustomer.id === cus.id;
              const tierInfo = getTierColor(cus.tier);

              return (
                <div
                  key={cus.id}
                  onClick={() => setSelectedCustomer(cus)}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-tertiary)',
                    border: isSelected ? '1px solid var(--accent-amber)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-main)' }}>{cus.name}</span>
                      <span style={{
                        fontSize: '9px',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: cus.tier === 'PLATINUM' ? '#8b5cf6' : cus.tier === 'GOLD' ? '#f59e0b' : '#64748b',
                        color: '#fff',
                        fontWeight: '800'
                      }}>
                        {cus.tier}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>
                      {cus.phone} • {cus.orderCount} đơn hàng
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                      {cus.points} pts
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                      Chi: {(cus.totalSpent / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Customer Profile & Digital Membership Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Digital Membership Card Preview (Metallic VIP Card Style) */}
          {selectedCustomer && (
            <div style={{
              background: getTierColor(selectedCustomer.tier).bg,
              borderRadius: '16px',
              padding: '24px',
              color: '#fff',
              boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.15 }}>
                <Sparkles size={160} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
                <div>
                  <div style={{ fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.85 }}>Thẻ Thành Viên POSS</div>
                  <div style={{ fontSize: '18px', fontWeight: '900', letterSpacing: '-0.3px', marginTop: '2px' }}>
                    {getTierColor(selectedCustomer.tier).name}
                  </div>
                </div>
                <div style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                  Giảm {getTierColor(selectedCustomer.tier).discount}
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '0.5px' }}>{selectedCustomer.name}</div>
                <div style={{ fontSize: '13px', opacity: 0.85, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>{selectedCustomer.phone}</div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '14px' }}>
                <div>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.8 }}>Điểm Thưởng Tích Lũy</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', fontFamily: 'var(--font-mono)' }}>{selectedCustomer.points} pts</div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '11px', opacity: 0.85 }}>
                  Tham gia: {selectedCustomer.joinDate}
                </div>
              </div>
            </div>
          )}

          {/* Point Redemption Catalog (Đổi Điểm Lấy Quà) */}
          <div className="card-glass" style={{ padding: '20px', flex: 1 }}>
            <div style={{ fontSize: '14px', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Gift size={16} color="var(--accent-amber)" />
              <span>Đổi Điểm Nhận Ưu Đãi (Spec 08)</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Áp dụng trừ điểm trực tiếp vào tài khoản khách hàng tại quầy thu ngân
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rewardsList.map(rew => (
                <div 
                  key={rew.id}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'var(--bg-tertiary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-main)' }}>{rew.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                      Yêu cầu hạng: {rew.minTier} • Tiêu tốn {rew.pointsNeeded} điểm
                    </div>
                  </div>

                  <button
                    onClick={() => handleRedeemReward(rew)}
                    className="btn-secondary"
                    style={{ fontSize: '11px', padding: '6px 12px' }}
                  >
                    Đổi Quà
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '440px', padding: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>Thêm Khách Hàng Mới</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Đăng ký hội viên nhanh tại quầy để tích điểm theo hóa đơn.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Họ và tên</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  className="input-dark" 
                  style={{ marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Số điện thoại (Định danh duy nhất)</label>
                <input 
                  type="text" 
                  value={newPhone} 
                  onChange={(e) => setNewPhone(e.target.value)} 
                  className="input-dark" 
                  style={{ marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Ngày sinh (Ưu đãi sinh nhật)</label>
                <input 
                  type="date" 
                  value={newDob} 
                  onChange={(e) => setNewDob(e.target.value)} 
                  className="input-dark" 
                  style={{ marginTop: '4px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Ghi chú khẩu vị / sở thích</label>
                <input 
                  type="text" 
                  placeholder="VD: Không uống ngọt, thích ngồi góc yên tĩnh..." 
                  value={newNotes} 
                  onChange={(e) => setNewNotes(e.target.value)} 
                  className="input-dark" 
                  style={{ marginTop: '4px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowAddModal(false)} className="btn-secondary" style={{ flex: 1 }}>Hủy</button>
              <button onClick={handleAddCustomer} className="btn-primary" style={{ flex: 1 }}>Tạo Hội Viên</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
