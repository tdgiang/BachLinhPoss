import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Smartphone, 
  CheckCircle2, 
  Printer, 
  Send, 
  ArrowLeft,
  Divide,
  AlertCircle,
  Wallet
} from 'lucide-react';
import { INITIAL_WALLETS } from '../../data/mockData';

export function PaymentModal({ orderData, onClose, onCompletePayment, currentStore }) {
  const { 
    cart, 
    orderType, 
    selectedTable, 
    attachedCustomer, 
    subtotal, 
    totalDiscount, 
    loyaltyDiscount, 
    voucherDiscount, 
    manualDiscount, 
    vat, 
    grandTotal 
  } = orderData;

  // Selected method: 'CASH' | 'VIETQR' | 'EWALLET' | 'CARD' | 'SPLIT'
  const [method, setMethod] = useState('CASH');

  // Cash state
  const [receivedCash, setReceivedCash] = useState(grandTotal);
  const changeAmount = Math.max(0, receivedCash - grandTotal);

  // VietQR countdown
  const [countdown, setCountdown] = useState(300); // 5 minutes
  useEffect(() => {
    if (method === 'VIETQR' && countdown > 0) {
      const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [method, countdown]);

  // E-Wallet selection
  const [selectedWallet, setSelectedWallet] = useState('MOMO'); // MOMO | ZALOPAY | VNPAY

  // Card details
  const [cardLast4, setCardLast4] = useState('4829');
  const [cardBrand, setCardBrand] = useState('VISA');

  // Split payment state
  const [splitParts, setSplitParts] = useState([]);
  const [currentSplitAmount, setCurrentSplitAmount] = useState(Math.round(grandTotal / 2));
  const [currentSplitMethod, setCurrentSplitMethod] = useState('CASH');

  // Receipt modal state after payment succeeds
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [completedOrderNumber, setCompletedOrderNumber] = useState('');

  const quickDenominations = [50000, 100000, 200000, 500000];

  const handleFinishPayment = () => {
    const orderNum = `${currentStore?.id || 'POSS001'}-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 900) + 100)}`;
    setCompletedOrderNumber(orderNum);
    setPaymentSuccess(true);
    if (onCompletePayment) onCompletePayment(orderNum);
  };

  // Add split part
  const handleAddSplitPart = () => {
    const newPart = {
      method: currentSplitMethod,
      amount: Number(currentSplitAmount)
    };
    const updated = [...splitParts, newPart];
    setSplitParts(updated);

    const paidTotal = updated.reduce((a, b) => a + b.amount, 0);
    const remaining = grandTotal - paidTotal;
    setCurrentSplitAmount(remaining > 0 ? remaining : 0);
  };

  const totalSplitPaid = splitParts.reduce((a, b) => a + b.amount, 0);
  const remainingSplit = Math.max(0, grandTotal - totalSplitPaid);

  return (
    <div className="modal-overlay">
      <div className="modal-card" style={{ width: '100%', maxWidth: paymentSuccess ? '760px' : '680px', margin: '8px', padding: '0', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-medium)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-secondary)'
        }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800' }}>
              {paymentSuccess ? 'Thanh Toán Thành Công' : 'Thanh Toán Đơn Hàng (Spec 05)'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {orderType === 'DINE_IN' ? `Tại chỗ (${selectedTable})` : 'Mang đi'} • {cart.reduce((a, b) => a + b.qty, 0)} sản phẩm
            </div>
          </div>

          <button onClick={onClose} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {!paymentSuccess ? (
          /* Payment Processing Screen */
          <div className="payment-modal-body" style={{ display: 'flex', minHeight: '400px' }}>
            {/* Left Method Nav */}
            <div className="payment-method-nav" style={{
              width: '200px',
              borderRight: '1px solid var(--border-subtle)',
              background: 'var(--bg-secondary)',
              padding: '12px 10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              {[
                { id: 'CASH', label: 'Tiền Mặt', icon: Banknote, note: 'Khách đưa & thối' },
                { id: 'WALLET', label: 'Ví POSS (Spec 12)', icon: Wallet, note: 'Số dư tích lũy KH' },
                { id: 'VIETQR', label: 'VietQR Ngân Hàng', icon: QrCode, note: 'Mã QR tự động' },
                { id: 'EWALLET', label: 'Ví Điện Tử', icon: Smartphone, note: 'MoMo, ZaloPay...' },
                { id: 'CARD', label: 'Thẻ / POS POSS', icon: CreditCard, note: 'Visa, Master, Napas' },
                { id: 'SPLIT', label: 'Chia Thanh Toán', icon: Divide, note: 'Nhiều phương thức' },
              ].map(item => {
                const Icon = item.icon;
                const isSelected = method === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setMethod(item.id)}
                    style={{
                      padding: '12px 10px',
                      borderRadius: '8px',
                      textAlign: 'left',
                      background: isSelected ? 'var(--bg-card-hover)' : 'transparent',
                      border: isSelected ? '1px solid var(--accent-amber)' : '1px solid transparent',
                      color: isSelected ? 'var(--accent-amber)' : 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <Icon size={18} />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '700' }}>{item.label}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{item.note}</div>
                    </div>
                  </button>
                );
              })}

              <div style={{ marginTop: 'auto', padding: '10px', background: 'var(--bg-card)', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cần thanh toán:</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                  {grandTotal.toLocaleString('vi-VN')} đ
                </div>
              </div>
            </div>

            {/* Right Method Details Pane */}
            <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
              
              {/* 1. CASH */}
              {method === 'CASH' && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-dim)' }}>
                    TIỀN KHÁCH ĐƯA (VNĐ)
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                    <input 
                      type="number"
                      inputMode="numeric"
                      value={receivedCash}
                      onChange={(e) => setReceivedCash(Number(e.target.value))}
                      className="input-dark"
                      style={{ fontSize: '18px', fontWeight: '700', height: '44px', fontFamily: 'var(--font-mono)' }}
                    />
                    <button 
                      onClick={() => setReceivedCash(grandTotal)}
                      className="btn-secondary"
                      style={{ fontSize: '12px', whiteSpace: 'nowrap' }}
                    >
                      Tiền Đúng
                    </button>
                  </div>

                  {/* Quick Chips */}
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
                    {quickDenominations.map(den => (
                      <button
                        key={den}
                        onClick={() => setReceivedCash(den)}
                        style={{
                          flex: 1,
                          padding: '8px 4px',
                          borderRadius: '6px',
                          background: 'var(--bg-tertiary)',
                          border: '1px solid var(--border-medium)',
                          color: 'var(--text-main)',
                          fontSize: '11px',
                          fontWeight: '700'
                        }}
                      >
                        {(den / 1000).toLocaleString()}k
                      </button>
                    ))}
                  </div>

                  {/* Change calculation */}
                  <div style={{
                    padding: '16px',
                    borderRadius: '10px',
                    background: changeAmount >= 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: changeAmount >= 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                    marginBottom: '20px'
                  }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tiền thừa trả khách:</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: changeAmount >= 0 ? '#10b981' : '#f87171', fontFamily: 'var(--font-mono)' }}>
                      {changeAmount >= 0 ? `${changeAmount.toLocaleString('vi-VN')} đ` : `Còn thiếu ${Math.abs(changeAmount).toLocaleString('vi-VN')} đ`}
                    </div>
                  </div>

                  <button
                    onClick={handleFinishPayment}
                    disabled={receivedCash < grandTotal}
                    className="btn-primary"
                    style={{ width: '100%', height: '46px', opacity: receivedCash < grandTotal ? 0.5 : 1 }}
                  >
                    Xác Nhận Đã Nhận Tiền & In Hóa Đơn
                  </button>
                </div>
              )}

              {/* 1b. WALLET (SPEC 12) */}
              {method === 'WALLET' && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    Thanh Toán Bằng Ví Khách Hàng (Spec 12)
                  </div>

                  {attachedCustomer ? (
                    (() => {
                      const customerWallet = INITIAL_WALLETS.find(w => w.customerPhone === attachedCustomer.phone) || {
                        balance: 650000,
                        status: 'ACTIVE',
                        id: 'WAL-001'
                      };
                      const isLocked = customerWallet.status === 'LOCKED';
                      const isSufficient = customerWallet.balance >= grandTotal;
                      const remainingNeed = grandTotal - customerWallet.balance;

                      return (
                        <div>
                          {/* Wallet Card */}
                          <div style={{
                            padding: '16px',
                            borderRadius: '12px',
                            background: isLocked ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-tertiary)',
                            border: isLocked ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border-medium)',
                            marginBottom: '16px'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                              <div>
                                <div style={{ fontSize: '14px', fontWeight: '800', color: '#fff' }}>{attachedCustomer.name}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>SĐT: {attachedCustomer.phone}</div>
                              </div>
                              <span className={`badge ${isLocked ? 'badge-owner' : 'badge-staff'}`}>
                                {isLocked ? 'Ví Đang Bị Khóa' : 'Ví Hoạt Động'}
                              </span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Số dư ví hiện tại:</span>
                              <span style={{ fontSize: '20px', fontWeight: '900', color: isLocked ? 'var(--text-muted)' : 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                                {customerWallet.balance.toLocaleString('vi-VN')} đ
                              </span>
                            </div>
                          </div>

                          {isLocked ? (
                            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef444450', color: '#f87171', fontSize: '12px', marginBottom: '16px' }}>
                              ⚠️ Ví của khách hàng đang bị khóa theo Spec 12! Vui lòng liên hệ Quản lý/Owner hoặc dùng phương thức khác.
                            </div>
                          ) : isSufficient ? (
                            <div>
                              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', marginBottom: '16px', fontSize: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                  <span style={{ color: 'var(--text-dim)' }}>Tổng tiền đơn:</span>
                                  <span style={{ fontWeight: '700' }}>{grandTotal.toLocaleString('vi-VN')} đ</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                  <span style={{ color: 'var(--text-dim)' }}>Trích từ ví:</span>
                                  <span style={{ fontWeight: '700', color: '#10b981' }}>-{grandTotal.toLocaleString('vi-VN')} đ</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '6px', borderTop: '1px dashed var(--border-medium)', fontWeight: '800' }}>
                                  <span>Số dư ví còn lại sau thanh toán:</span>
                                  <span style={{ color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                                    {(customerWallet.balance - grandTotal).toLocaleString('vi-VN')} đ
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={handleFinishPayment}
                                className="btn-primary"
                                style={{ width: '100%', height: '44px', fontSize: '13px' }}
                              >
                                <CheckCircle2 size={16} />
                                <span>Xác Nhận Trừ Ví & In Hóa Đơn</span>
                              </button>
                            </div>
                          ) : (
                            <div>
                              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', marginBottom: '16px', fontSize: '12px' }}>
                                <div style={{ fontWeight: '700', color: '#fbbf24', marginBottom: '4px' }}>
                                  ⚠️ Số dư ví không đủ thanh toán trọn gói (Spec 12)
                                </div>
                                <div style={{ color: 'var(--text-muted)', marginBottom: '6px' }}>
                                  Theo quy tắc Spec 12: Phải dùng toàn bộ số dư ví ({customerWallet.balance.toLocaleString('vi-VN')}đ) và thanh toán phần còn lại ({remainingNeed.toLocaleString('vi-VN')}đ) bằng phương thức khác.
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', paddingTop: '4px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                                  <span>Còn thiếu cần bù:</span>
                                  <span style={{ color: '#f87171', fontFamily: 'var(--font-mono)', fontSize: '14px' }}>
                                    {remainingNeed.toLocaleString('vi-VN')} đ
                                  </span>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  // Auto-fill split payment parts
                                  setMethod('SPLIT');
                                  setSplitParts([
                                    { method: 'Ví POSS', amount: customerWallet.balance }
                                  ]);
                                  setCurrentSplitAmount(remainingNeed);
                                  setCurrentSplitMethod('CASH');
                                }}
                                className="btn-primary"
                                style={{ width: '100%', height: '44px', fontSize: '13px' }}
                              >
                                <Divide size={16} />
                                <span>Chuyển Sang Chia Thanh Toán (Split Payment)</span>
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : (
                    <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg-tertiary)', borderRadius: '12px' }}>
                      <AlertCircle size={32} color="var(--accent-amber)" style={{ margin: '0 auto 8px auto' }} />
                      <div style={{ fontSize: '14px', fontWeight: '800', marginBottom: '4px' }}>Đơn Hàng Chưa Gán Khách Hàng</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Ví điện tử được liên kết với số điện thoại khách hàng. Vui lòng quay lại giỏ hàng và nhập SĐT khách để sử dụng ví.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 2. VIETQR */}
              {method === 'VIETQR' && (
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Quét mã VietQR trên ứng dụng ngân hàng bất kỳ để thanh toán chính xác
                  </div>

                  {/* QR Box with simulated VietQR frame */}
                  <div style={{
                    background: '#fff',
                    padding: '16px',
                    borderRadius: '12px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                    display: 'inline-block',
                    marginBottom: '12px'
                  }}>
                    {/* Simulated SVG VietQR Code */}
                    <div style={{ width: '180px', height: '180px', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '2px solid #0284c7', borderRadius: '8px', padding: '6px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '900', color: '#0284c7', marginBottom: '4px' }}>VIETQR • NAPAS 247</div>
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=247POSS${grandTotal}`} 
                        alt="VietQR Code" 
                        style={{ width: '120px', height: '120px' }}
                      />
                      <div style={{ fontSize: '10px', fontWeight: '700', color: '#0f172a' }}>MB BANK - 0988123456</div>
                    </div>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    Thời gian hiệu lực mã: <strong style={{ color: 'var(--accent-amber)' }}>{Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, '0')}</strong>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                    Nội dung: <strong>POSS001-{Date.now().toString().slice(-4)}</strong> • Số tiền: <strong>{grandTotal.toLocaleString('vi-VN')} đ</strong>
                  </div>

                  <button
                    onClick={handleFinishPayment}
                    className="btn-primary"
                    style={{ width: '100%', height: '44px' }}
                  >
                    <CheckCircle2 size={18} />
                    <span>Xác Nhận Thủ Công Đã Nhận Tiền Chuyển Khoản</span>
                  </button>
                </div>
              )}

              {/* 3. EWALLET */}
              {method === 'EWALLET' && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-dim)' }}>
                    CHỌN CỔNG VÍ ĐIỆN TỬ
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
                    {[
                      { id: 'MOMO', name: 'MoMo', color: '#d82d8b' },
                      { id: 'ZALOPAY', name: 'ZaloPay', color: '#008fe5' },
                      { id: 'VNPAY', name: 'VNPay QR', color: '#005baa' },
                    ].map(w => (
                      <button
                        key={w.id}
                        onClick={() => setSelectedWallet(w.id)}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: selectedWallet === w.id ? `2px solid ${w.color}` : '1px solid var(--border-medium)',
                          background: selectedWallet === w.id ? 'rgba(255,255,255,0.05)' : 'var(--bg-tertiary)',
                          color: '#fff',
                          fontWeight: '700',
                          fontSize: '13px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: w.color }} />
                        {w.name}
                      </button>
                    ))}
                  </div>

                  <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-card)', borderRadius: '10px', marginBottom: '20px' }}>
                    <Smartphone size={32} color="var(--accent-amber)" style={{ margin: '0 auto 8px auto' }} />
                    <div style={{ fontSize: '13px', fontWeight: '700' }}>Chờ quét mã trên ứng dụng {selectedWallet}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cổng thanh toán tự động lắng nghe webhook (Spec 05).</div>
                  </div>

                  <button onClick={handleFinishPayment} className="btn-primary" style={{ width: '100%', height: '44px' }}>
                    Xác Nhận Giao Dịch Thành Công
                  </button>
                </div>
              )}

              {/* 4. CARD */}
              {method === 'CARD' && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '10px', color: 'var(--text-dim)' }}>
                    MÁY QUẸT THẺ POS TERMINAL (Spec 05)
                  </div>

                  <div style={{ padding: '16px', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border-medium)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '12px', fontWeight: '700', marginBottom: '12px' }}>
                      <CheckCircle2 size={16} /> Máy POS Sunmi P2 kết nối Bluetooth thành công
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Loại thẻ</label>
                        <select 
                          value={cardBrand} 
                          onChange={(e) => setCardBrand(e.target.value)}
                          className="input-dark" 
                          style={{ marginTop: '4px', height: '36px' }}
                        >
                          <option>VISA</option>
                          <option>MasterCard</option>
                          <option>Napas Nội Địa</option>
                          <option>JCB</option>
                        </select>
                      </div>

                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)' }}>4 số cuối thẻ (Tuân thủ bảo mật)</label>
                        <input 
                          type="text" 
                          maxLength={4}
                          value={cardLast4} 
                          onChange={(e) => setCardLast4(e.target.value)}
                          className="input-dark" 
                          style={{ marginTop: '4px', height: '36px', fontFamily: 'var(--font-mono)' }}
                        />
                      </div>
                    </div>
                  </div>

                  <button onClick={handleFinishPayment} className="btn-primary" style={{ width: '100%', height: '44px' }}>
                    Xác Nhận Quẹt Thẻ Hoàn Tất
                  </button>
                </div>
              )}

              {/* 5. SPLIT PAYMENT */}
              {method === 'SPLIT' && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-dim)' }}>
                    THANH TOÁN KẾT HỢP (SPLIT PAYMENT)
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    Chia đơn hàng thành nhiều phần với các phương thức khác nhau.
                  </div>

                  {/* Progress */}
                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                      <span>Đã chia: {totalSplitPaid.toLocaleString('vi-VN')} đ</span>
                      <span style={{ color: remainingSplit === 0 ? '#10b981' : '#f59e0b' }}>
                        Còn lại: {remainingSplit.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                    <div style={{ height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, (totalSplitPaid / grandTotal) * 100)}%`,
                        background: remainingSplit === 0 ? '#10b981' : 'var(--accent-amber)'
                      }} />
                    </div>
                  </div>

                  {/* Add Part Form */}
                  {remainingSplit > 0 && (
                    <div style={{ padding: '12px', background: 'var(--bg-tertiary)', borderRadius: '8px', marginBottom: '14px', display: 'flex', gap: '8px' }}>
                      <input 
                        type="number"
                        inputMode="numeric"
                        value={currentSplitAmount}
                        onChange={(e) => setCurrentSplitAmount(Number(e.target.value))}
                        className="input-dark"
                        style={{ flex: 1, height: '36px' }}
                      />
                      <select 
                        value={currentSplitMethod} 
                        onChange={(e) => setCurrentSplitMethod(e.target.value)}
                        className="input-dark" 
                        style={{ width: '120px', height: '36px' }}
                      >
                        <option value="CASH">Tiền mặt</option>
                        <option value="VIETQR">VietQR</option>
                        <option value="MOMO">MoMo</option>
                        <option value="CARD">Thẻ</option>
                        <option value="WALLET">Ví POSS</option>
                      </select>
                      <button onClick={handleAddSplitPart} className="btn-secondary" style={{ height: '36px', fontSize: '11px', whiteSpace: 'nowrap' }}>
                        + Thêm phần
                      </button>
                    </div>
                  )}

                  {/* Parts List */}
                  <div style={{ maxHeight: '120px', overflowY: 'auto', marginBottom: '14px' }}>
                    {splitParts.map((p, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)', fontSize: '12px' }}>
                        <span>Phần {idx + 1}: {p.method}</span>
                        <span style={{ fontWeight: '700' }}>{p.amount.toLocaleString('vi-VN')} đ</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleFinishPayment}
                    disabled={remainingSplit > 0}
                    className="btn-primary"
                    style={{ width: '100%', height: '44px', opacity: remainingSplit > 0 ? 0.5 : 1 }}
                  >
                    Hoàn Tất Toàn Bộ Đơn Hàng
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Success Screen with Simulated 80mm POS Thermal Receipt */
          <div className="receipt-success-layout" style={{ display: 'flex', padding: '20px', gap: '20px', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* Thermal Receipt Paper (80mm) */}
            <div className="receipt-paper">
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '16px', fontWeight: '800' }}>POSS COFFEE & TEA</div>
                <div style={{ fontSize: '10px' }}>{currentStore?.address || '128 Xuân Thủy, Cầu Giấy, Hà Nội'}</div>
                <div style={{ fontSize: '10px' }}>Hotline: {currentStore?.phone || '024 3838 9999'} • MST: 0109988776</div>
              </div>

              <div className="receipt-divider" />

              <div style={{ textAlign: 'center', fontWeight: '700', fontSize: '13px' }}>HÓA ĐƠN THANH TOÁN</div>
              <div style={{ fontSize: '11px', textAlign: 'center', color: '#4b5563' }}>Mã: {completedOrderNumber}</div>
              <div style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                <span>Ngày: {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN')}</span>
                <span>Thu ngân: Nam</span>
              </div>
              <div style={{ fontSize: '10px' }}>
                Loại: {orderType === 'DINE_IN' ? `Tại chỗ (${selectedTable})` : 'Mang đi'}
              </div>

              <div className="receipt-divider" />

              {/* Items Table */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '10px', marginBottom: '4px' }}>
                <span>Món</span>
                <span>SL</span>
                <span>Đơn giá</span>
                <span>T.Tiền</span>
              </div>

              {cart.map((it, idx) => (
                <div key={idx} style={{ marginBottom: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span style={{ fontWeight: '600' }}>{it.name} ({it.size})</span>
                    <span>{it.qty}</span>
                    <span>{it.price.toLocaleString()}</span>
                    <span style={{ fontWeight: '700' }}>{(it.price * it.qty).toLocaleString()}</span>
                  </div>
                  {it.toppings.length > 0 && (
                    <div style={{ fontSize: '9px', color: '#6b7280' }}>
                      + {it.toppings.map(t => t.name).join(', ')}
                    </div>
                  )}
                </div>
              ))}

              <div className="receipt-divider" />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span>Tạm tính:</span>
                <span>{subtotal.toLocaleString()} đ</span>
              </div>
              {totalDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#dc2626' }}>
                  <span>Giảm giá:</span>
                  <span>-{totalDiscount.toLocaleString()} đ</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                <span>VAT (8%):</span>
                <span>{vat.toLocaleString()} đ</span>
              </div>

              <div className="receipt-divider" />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '800' }}>
                <span>TỔNG CỘNG:</span>
                <span>{grandTotal.toLocaleString()} đ</span>
              </div>

              <div style={{ fontSize: '10px', marginTop: '6px' }}>
                Hình thức: <strong>{method}</strong>
              </div>

              {attachedCustomer && (
                <div style={{ fontSize: '10px', marginTop: '4px', background: '#f3f4f6', padding: '4px', borderRadius: '4px' }}>
                  KH: {attachedCustomer.name} • Điểm tích lũy: +{Math.round(grandTotal / 10000)} điểm
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '10px', color: '#6b7280' }}>
                Cảm ơn quý khách và hẹn gặp lại!
                <br />
                poss.vn • WiFi: POSS_Guest
              </div>
            </div>

            {/* Actions Panel */}
            <div className="receipt-actions-panel" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '220px' }}>
              <button 
                onClick={() => alert('Đã gửi lệnh in hóa đơn đến máy in nhiệt 80mm qua mạng LAN!')}
                className="btn-primary" 
                style={{ width: '100%', height: '42px', fontSize: '13px' }}
              >
                <Printer size={16} /> In Hóa Đơn Nhiệt
              </button>

              <button 
                onClick={() => alert(`Đã gửi hóa đơn điện tử đến SĐT: ${attachedCustomer?.phone || 'khách hàng'}!`)}
                className="btn-secondary" 
                style={{ width: '100%', height: '42px', fontSize: '13px' }}
              >
                <Send size={16} /> Gửi E-Invoice SMS/Zalo
              </button>

              <button 
                onClick={onClose}
                className="btn-secondary" 
                style={{ width: '100%', height: '42px', fontSize: '13px', background: 'var(--bg-tertiary)' }}
              >
                Hoàn Tất & Tạo Đơn Mới
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
