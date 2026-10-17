import React, { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  Sparkles, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Receipt, 
  Printer, 
  QrCode, 
  Banknote, 
  CreditCard, 
  Smartphone, 
  CheckCircle2, 
  X, 
  Percent, 
  TrendingUp, 
  BarChart3, 
  Gift, 
  AlertCircle, 
  Calendar, 
  Users,
  Coins,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { 
  INITIAL_WALLETS, 
  INITIAL_WALLET_PROMOTIONS, 
  INITIAL_WALLET_TRANSACTIONS,
  INITIAL_CUSTOMERS,
  ROLES
} from '../../data/mockData';

export function WalletModule({ currentUserRole = 'OWNER', currentStore, currentUser }) {
  const [wallets, setWallets] = useState(INITIAL_WALLETS);
  const [promotions, setPromotions] = useState(INITIAL_WALLET_PROMOTIONS);
  const [transactions, setTransactions] = useState(INITIAL_WALLET_TRANSACTIONS);

  const [activeTab, setActiveTab] = useState('wallets'); // 'wallets' | 'promotions' | 'transactions' | 'reports'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // for transactions: 'ALL' | 'TOPUP' | 'PAYMENT' | 'ADJUSTMENT'

  // Top-up Modal State
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupTargetWallet, setTopupTargetWallet] = useState(INITIAL_WALLETS[0]);
  const [topupAmount, setTopupAmount] = useState(500000);
  const [topupMethod, setTopupMethod] = useState('VIETQR'); // 'CASH' | 'VIETQR' | 'CARD' | 'EWALLET'
  const [topupSuccessReceipt, setTopupSuccessReceipt] = useState(null);

  // Manual Adjust Modal State
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustTargetWallet, setAdjustTargetWallet] = useState(null);
  const [adjustType, setAdjustType] = useState('ADD'); // 'ADD' | 'SUBTRACT'
  const [adjustAmount, setAdjustAmount] = useState(50000);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustNote, setAdjustNote] = useState('');

  // Create Promo Modal State
  const [showCreatePromoModal, setShowCreatePromoModal] = useState(false);
  const [newPromoName, setNewPromoName] = useState('');
  const [newPromoType, setNewPromoType] = useState('TIERED');
  const [newPromoFixedPercent, setNewPromoFixedPercent] = useState(20);
  const [newPromoDesc, setNewPromoDesc] = useState('');

  // Quick denomination presets
  const quickTopupPresets = [100000, 200000, 500000, 1000000, 2000000];

  // Helper: Calculate best bonus based on promotions (Spec 12)
  const calculateBonus = (amount) => {
    let bestBonusPercent = 0;
    let appliedPromo = null;

    promotions.filter(p => p.status === 'ACTIVE').forEach(promo => {
      if (promo.type === 'TIERED' && promo.tiers) {
        const matchedTier = promo.tiers.find(t => amount >= t.min && amount <= t.max);
        if (matchedTier && matchedTier.bonus > bestBonusPercent) {
          bestBonusPercent = matchedTier.bonus;
          appliedPromo = promo;
        }
      } else if (promo.type === 'FIXED_PERCENT') {
        if (!promo.minDeposit || amount >= promo.minDeposit) {
          if (promo.bonusPercent > bestBonusPercent) {
            bestBonusPercent = promo.bonusPercent;
            appliedPromo = promo;
          }
        }
      }
    });

    const bonusAmount = Math.round((amount * bestBonusPercent) / 100);
    const totalCredited = amount + bonusAmount;
    return { bestBonusPercent, bonusAmount, totalCredited, appliedPromo };
  };

  const currentBonusInfo = calculateBonus(Number(topupAmount) || 0);

  // Execute Top-up
  const handleExecuteTopup = () => {
    if (!topupAmount || Number(topupAmount) < 10000) {
      alert('Số tiền nạp tối thiểu là 10.000đ!');
      return;
    }

    const { bestBonusPercent, bonusAmount, totalCredited, appliedPromo } = currentBonusInfo;
    const newTxId = `WTX-${Date.now().toString().slice(-4)}`;

    const newTx = {
      id: newTxId,
      type: 'TOPUP',
      walletId: topupTargetWallet.id,
      customerName: topupTargetWallet.customerName,
      customerPhone: topupTargetWallet.customerPhone,
      amount: Number(topupAmount),
      bonusPercent: bestBonusPercent,
      bonusAmount: bonusAmount,
      totalCredited: totalCredited,
      balanceAfter: topupTargetWallet.balance + totalCredited,
      method: topupMethod === 'CASH' ? 'Tiền mặt' : topupMethod === 'VIETQR' ? 'VietQR' : topupMethod === 'CARD' ? 'Thẻ POS' : 'Ví MoMo/ZaloPay',
      promoId: appliedPromo?.id || null,
      promoName: appliedPromo?.name || 'Nạp tiêu chuẩn (Không KM)',
      staff: currentUser?.name ? `${currentUser.name} (${currentUserRole})` : 'Lê Hoàng Nam (Staff)',
      store: currentStore?.name || 'POSS Cầu Giấy',
      time: new Date().toLocaleString('vi-VN'),
      notes: `Khách nạp ${Number(topupAmount).toLocaleString('vi-VN')}đ, nhận ${totalCredited.toLocaleString('vi-VN')}đ vào ví`,
    };

    // Update wallet balance
    const updatedWallets = wallets.map(w => {
      if (w.id === topupTargetWallet.id) {
        return {
          ...w,
          balance: w.balance + totalCredited,
          totalToppedUp: w.totalToppedUp + Number(topupAmount),
          totalBonus: w.totalBonus + bonusAmount,
          lastUpdated: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN').slice(0, 5)
        };
      }
      return w;
    });

    setWallets(updatedWallets);
    setTransactions([newTx, ...transactions]);
    setTopupSuccessReceipt(newTx);
  };

  // Toggle Wallet Lock/Unlock (Spec 12)
  const handleToggleLockWallet = (walletId) => {
    if (currentUserRole !== 'OWNER' && currentUserRole !== 'MANAGER') {
      alert('Chỉ Owner hoặc Manager mới có quyền Khóa hoặc Mở khóa ví theo Spec 12!');
      return;
    }

    let targetName = '';
    let nextStatus = 'ACTIVE';

    const updated = wallets.map(w => {
      if (w.id === walletId) {
        nextStatus = w.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
        targetName = w.customerName;
        return { ...w, status: nextStatus };
      }
      return w;
    });

    setWallets(updated);
    alert(`Đã ${nextStatus === 'LOCKED' ? 'TẠM KHÓA' : 'MỞ KHÓA'} ví của khách hàng ${targetName}!`);
  };

  // Execute Manual Adjustment (Spec 12)
  const handleExecuteAdjustment = () => {
    if (!adjustReason.trim()) {
      alert('Bắt buộc phải nhập lý do điều chỉnh số dư theo Spec 12 (để phục vụ kiểm toán audit)!');
      return;
    }
    if (!adjustAmount || Number(adjustAmount) <= 0) {
      alert('Vui lòng nhập số tiền điều chỉnh hợp lệ!');
      return;
    }

    const delta = adjustType === 'ADD' ? Number(adjustAmount) : -Number(adjustAmount);
    if (adjustType === 'SUBTRACT' && adjustTargetWallet.balance < Number(adjustAmount)) {
      alert('Số dư ví hiện tại không đủ để trừ số tiền này!');
      return;
    }

    const newTxId = `WTX-${Date.now().toString().slice(-4)}`;
    const newTx = {
      id: newTxId,
      type: 'ADJUSTMENT',
      walletId: adjustTargetWallet.id,
      customerName: adjustTargetWallet.customerName,
      customerPhone: adjustTargetWallet.customerPhone,
      amount: delta,
      bonusPercent: 0,
      bonusAmount: 0,
      totalCredited: delta,
      balanceAfter: adjustTargetWallet.balance + delta,
      method: 'Điều chỉnh hệ thống',
      reason: adjustReason,
      staff: currentUser?.name ? `${currentUser.name} (${currentUserRole})` : 'Quản lý POSS',
      store: currentStore?.name || 'POSS Toàn Chuỗi',
      time: new Date().toLocaleString('vi-VN'),
      notes: adjustNote || 'Điều chỉnh số dư ví thủ công có kiểm toán',
    };

    const updatedWallets = wallets.map(w => {
      if (w.id === adjustTargetWallet.id) {
        return {
          ...w,
          balance: w.balance + delta,
          lastUpdated: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN').slice(0, 5)
        };
      }
      return w;
    });

    setWallets(updatedWallets);
    setTransactions([newTx, ...transactions]);
    setShowAdjustModal(false);
    setAdjustReason('');
    setAdjustNote('');
    alert(`Đã điều chỉnh ${delta > 0 ? '+' : ''}${delta.toLocaleString('vi-VN')}đ vào ví của ${adjustTargetWallet.customerName}!`);
  };

  // Toggle Promo Status (Active / Paused)
  const handleTogglePromoStatus = (promoId) => {
    if (currentUserRole !== 'OWNER' && currentUserRole !== 'MANAGER') {
      alert('Chỉ Owner hoặc Manager mới có quyền thay đổi trạng thái khuyến mãi nạp ví!');
      return;
    }

    const updated = promotions.map(p => {
      if (p.id === promoId) {
        return { ...p, status: p.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE' };
      }
      return p;
    });
    setPromotions(updated);
  };

  // Filtered wallets
  const filteredWallets = wallets.filter(w => 
    w.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.customerPhone.includes(searchQuery) ||
    w.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered transactions
  const filteredTransactions = transactions.filter(tx => {
    const matchType = filterType === 'ALL' || tx.type === filterType;
    const matchSearch = tx.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        tx.customerPhone.includes(searchQuery) ||
                        tx.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  // KPI aggregates
  const totalBalanceInCirculation = wallets.reduce((acc, w) => acc + w.balance, 0);
  const totalDepositedAllTime = wallets.reduce((acc, w) => acc + w.totalToppedUp, 0);
  const totalBonusGivenAllTime = wallets.reduce((acc, w) => acc + w.totalBonus, 0);
  const activeWalletsCount = wallets.filter(w => w.status === 'ACTIVE').length;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* 1. Module Tabs Bar (Primary Navigation at top) */}
      <div className="module-tabs-bar">
        <button
          onClick={() => setActiveTab('wallets')}
          style={{
            fontWeight: activeTab === 'wallets' ? '700' : '500',
            background: activeTab === 'wallets' ? 'var(--accent-amber)' : 'var(--bg-tertiary)',
            color: activeTab === 'wallets' ? '#000' : 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Wallet size={14} />
          <span>Danh Sách Ví Khách Hàng ({wallets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('promotions')}
          style={{
            fontWeight: activeTab === 'promotions' ? '700' : '500',
            background: activeTab === 'promotions' ? 'var(--accent-amber)' : 'var(--bg-tertiary)',
            color: activeTab === 'promotions' ? '#000' : 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Gift size={14} />
          <span>Chương Trình Khuyến Mãi Nạp ({promotions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          style={{
            fontWeight: activeTab === 'transactions' ? '700' : '500',
            background: activeTab === 'transactions' ? 'var(--accent-amber)' : 'var(--bg-tertiary)',
            color: activeTab === 'transactions' ? '#000' : 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Receipt size={14} />
          <span>Lịch Sử Giao Dịch Ví ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          style={{
            fontWeight: activeTab === 'reports' ? '700' : '500',
            background: activeTab === 'reports' ? 'var(--accent-amber)' : 'var(--bg-tertiary)',
            color: activeTab === 'reports' ? '#000' : 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <BarChart3 size={14} />
          <span>Báo Cáo & Hiệu Quả Ví</span>
        </button>
      </div>

      {/* 2. Module Header */}
      <div className="module-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
              12. Ví Khách Hàng (Customer Wallet)
            </h2>
            <span style={{ fontSize: '10px', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--accent-amber)', padding: '2px 8px', borderRadius: '4px', fontWeight: '800' }}>
              Spec 12
            </span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Nạp tiền tích lũy hưởng ưu đãi bonus, thanh toán 1-chạm hoặc chia thanh toán (split payment) tại quầy
          </p>
        </div>

        <div className="module-header-actions">
          <button 
            onClick={() => {
              setTopupTargetWallet(wallets[0]);
              setTopupAmount(500000);
              setTopupSuccessReceipt(null);
              setShowTopupModal(true);
            }} 
            className="btn-primary" 
            style={{ fontSize: '13px' }}
          >
            <Coins size={16} />
            <span>+ Nạp Tiền Vào Ví</span>
          </button>

          {(currentUserRole === 'OWNER' || currentUserRole === 'MANAGER') && (
            <button 
              onClick={() => setShowCreatePromoModal(true)} 
              className="btn-secondary" 
              style={{ fontSize: '13px' }}
            >
              <Sparkles size={16} color="var(--accent-amber)" />
              <span>+ Tạo KM Nạp Thưởng</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. High-level KPI Grid */}
      <div className="kpi-grid-4">
        <div className="card-glass" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
            <span>SỐ DƯ ĐANG LƯU HÀNH</span>
            <Wallet size={16} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent-amber)', marginTop: '4px', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
            {totalBalanceInCirculation.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', whiteSpace: 'nowrap' }}>
            Khách nạp trước dùng vĩnh viễn
          </div>
        </div>

        <div className="card-glass" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
            <span>TỔNG TIỀN NẠP THỰC TẾ</span>
            <TrendingUp size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#10b981', marginTop: '4px', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
            {totalDepositedAllTime.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '11px', color: '#10b981', marginTop: '4px', whiteSpace: 'nowrap' }}>
            +24.5% doanh thu giữ chân
          </div>
        </div>

        <div className="card-glass" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
            <span>TIỀN THƯỞNG BONUS CẤP</span>
            <Gift size={16} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#8b5cf6', marginTop: '4px', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
            {totalBonusGivenAllTime.toLocaleString('vi-VN')} đ
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', whiteSpace: 'nowrap' }}>
            Tỷ lệ thưởng TB: ~21.4%
          </div>
        </div>

        <div className="card-glass" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
            <span>TỔNG VÍ HOẠT ĐỘNG</span>
            <Users size={16} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: '#3b82f6', marginTop: '4px', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
            {activeWalletsCount} / {wallets.length} ví
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px', whiteSpace: 'nowrap' }}>
            Gắn với SĐT khách hàng
          </div>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: DANH SÁCH VÍ KHÁCH HÀNG
          ========================================================================= */}
      {activeTab === 'wallets' && (
        <div>
          {/* Search bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '360px' }}>
              <Search size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Tìm ví theo SĐT, tên khách hoặc mã..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-dark"
                style={{ paddingLeft: '32px', height: '36px', fontSize: '12px' }}
              />
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Quy tắc Spec 12: Ví tạo tự động khi khách nạp lần đầu • Không giới hạn số dư • Dùng vĩnh viễn
            </div>
          </div>

          {/* Wallets Cards Grid (Sleek Digital Wallet Passbooks) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {filteredWallets.map(wallet => {
              const isLocked = wallet.status === 'LOCKED';
              return (
                <div 
                  key={wallet.id}
                  className="card-glass"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    border: isLocked ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-subtle)',
                    background: isLocked ? 'rgba(239, 68, 68, 0.04)' : 'var(--bg-card)'
                  }}
                >
                  {/* Subtle top metallic glow */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: isLocked 
                      ? '#ef4444' 
                      : wallet.tier === 'PLATINUM' 
                      ? 'linear-gradient(90deg, #7c3aed, #4f46e5)' 
                      : 'linear-gradient(90deg, #f59e0b, #d97706)'
                  }} />

                  <div>
                    {/* Header line */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>{wallet.customerName}</span>
                          <span style={{
                            fontSize: '9px',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: wallet.tier === 'PLATINUM' ? '#8b5cf6' : wallet.tier === 'GOLD' ? '#f59e0b' : '#64748b',
                            color: '#fff',
                            fontWeight: '800'
                          }}>
                            {wallet.tier}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                          SĐT: {wallet.customerPhone} • {wallet.id}
                        </div>
                      </div>

                      <span className={`badge ${isLocked ? 'badge-owner' : 'badge-staff'}`}>
                        {isLocked ? 'Đang Bị Khóa' : 'Đang Hoạt Động'}
                      </span>
                    </div>

                    {/* Big Balance Display */}
                    <div style={{
                      padding: '14px',
                      borderRadius: '10px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-subtle)',
                      marginBottom: '14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline'
                    }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                          Số Dư Khả Dụng
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: '900', color: isLocked ? 'var(--text-muted)' : 'var(--accent-amber)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                          {wallet.balance.toLocaleString('vi-VN')} đ
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>Tổng tiền nạp</div>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>
                          {wallet.totalToppedUp.toLocaleString('vi-VN')} đ
                        </div>
                      </div>
                    </div>

                    {/* Breakdown stats */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)', marginBottom: '14px' }}>
                      <span>Thưởng bonus nhận: <strong style={{ color: '#8b5cf6' }}>+{wallet.totalBonus.toLocaleString('vi-VN')}đ</strong></span>
                      <span>Đã tiêu: <strong style={{ color: 'var(--text-main)' }}>{wallet.totalSpent.toLocaleString('vi-VN')}đ</strong></span>
                    </div>

                    {wallet.notes && (
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic', marginBottom: '14px', lineHeight: '1.4' }}>
                        "{wallet.notes}"
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                    <button
                      onClick={() => {
                        setTopupTargetWallet(wallet);
                        setTopupAmount(500000);
                        setTopupSuccessReceipt(null);
                        setShowTopupModal(true);
                      }}
                      className="btn-primary"
                      style={{ flex: 1, padding: '7px 10px', fontSize: '12px' }}
                    >
                      <Coins size={14} /> Nạp Ví
                    </button>

                    {(currentUserRole === 'OWNER' || currentUserRole === 'MANAGER') && (
                      <>
                        <button
                          onClick={() => {
                            setAdjustTargetWallet(wallet);
                            setAdjustAmount(50000);
                            setAdjustType('ADD');
                            setShowAdjustModal(true);
                          }}
                          className="btn-secondary"
                          style={{ padding: '7px 10px', fontSize: '12px' }}
                          title="Điều chỉnh số dư ví thủ công (Ghi log kiểm toán)"
                        >
                          ± Sửa Số Dư
                        </button>

                        <button
                          onClick={() => handleToggleLockWallet(wallet.id)}
                          className={isLocked ? 'btn-secondary' : 'btn-danger'}
                          style={{ padding: '7px 10px', fontSize: '12px' }}
                          title={isLocked ? 'Mở khóa ví' : 'Tạm khóa ví'}
                        >
                          {isLocked ? <Unlock size={14} color="#10b981" /> : <Lock size={14} />}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: CHƯƠNG TRÌNH KHUYẾN MÃI NẠP VÍ (SPEC 12 CORE)
          ========================================================================= */}
      {activeTab === 'promotions' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Cấu Hình Thưởng Nạp Ví Khách Hàng (Spec 12)</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Tương tự mô hình tài khoản hội viên quán net: Hệ thống tự động so khớp và chọn mức % thưởng cao nhất khi nạp
              </p>
            </div>

            {(currentUserRole === 'OWNER' || currentUserRole === 'MANAGER') && (
              <button 
                onClick={() => setShowCreatePromoModal(true)} 
                className="btn-primary" 
                style={{ fontSize: '13px' }}
              >
                <Plus size={16} /> Thêm Chương Trình Mới
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
            {promotions.map(promo => {
              const isActive = promo.status === 'ACTIVE';

              return (
                <div 
                  key={promo.id}
                  className="card-glass"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    opacity: isActive ? 1 : 0.65,
                    border: isActive ? '1px solid var(--border-medium)' : '1px dashed var(--border-subtle)'
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <span style={{
                        fontSize: '11px',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        background: promo.type === 'TIERED' ? '#8b5cf6' : '#f59e0b',
                        color: '#fff',
                        fontWeight: '800'
                      }}>
                        {promo.type === 'TIERED' ? 'THƯỞNG THEO BẬC THANG' : `% CỐ ĐỊNH (+${promo.bonusPercent}%)`}
                      </span>

                      <button
                        onClick={() => handleTogglePromoStatus(promo.id)}
                        style={{
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '10px',
                          fontWeight: '800',
                          background: isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isActive ? '#34d399' : '#f87171',
                          border: `1px solid ${isActive ? '#10b98150' : '#ef444450'}`,
                          cursor: (currentUserRole === 'OWNER' || currentUserRole === 'MANAGER') ? 'pointer' : 'default'
                        }}
                        title="Bấm để bật / tắt chương trình"
                      >
                        {isActive ? 'ĐANG BẬT' : 'TẠM DỪNG'}
                      </button>
                    </div>

                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff', marginBottom: '6px' }}>
                      {promo.name}
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: '1.4' }}>
                      {promo.description}
                    </div>

                    {/* Tier Rules breakdown */}
                    {promo.type === 'TIERED' && promo.tiers && (
                      <div style={{ background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '700', textTransform: 'uppercase' }}>
                          Mức thưởng áp dụng theo số tiền nạp:
                        </div>
                        {promo.tiers.map((t, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                            <span style={{ color: 'var(--text-main)' }}>{t.label.split(':')[0]}</span>
                            <span style={{ fontWeight: '800', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                              +{t.bonus}% bonus
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {promo.type === 'FIXED_PERCENT' && (
                      <div style={{ background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px', fontSize: '12px' }}>
                        <span style={{ color: 'var(--text-dim)' }}>Mức nạp tối thiểu: </span>
                        <strong style={{ color: 'var(--accent-amber)' }}>{promo.minDeposit ? promo.minDeposit.toLocaleString('vi-VN') + 'đ' : 'Không giới hạn'}</strong>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-dim)' }}>
                      <div>Hiệu lực: {promo.validFrom} → {promo.validTo}</div>
                      <div>Đã sử dụng: <strong style={{ color: '#fff' }}>{promo.usageCount}</strong> / {promo.maxUsage} lượt</div>
                      {promo.maxBonusPerDay && <div>Hạn mức thưởng tối đa: {promo.maxBonusPerDay.toLocaleString('vi-VN')} đ/khách/ngày</div>}
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mã: {promo.id}</span>
                    {(currentUserRole === 'OWNER' || currentUserRole === 'MANAGER') && (
                      <button 
                        onClick={() => handleTogglePromoStatus(promo.id)}
                        style={{ background: 'transparent', color: isActive ? '#f87171' : '#34d399', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                      >
                        {isActive ? 'Tạm Dừng KM' : 'Kích Hoạt Lại'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: LỊCH SỬ GIAO DỊCH VÍ (TRANSACTIONS - SPEC 12)
          ========================================================================= */}
      {activeTab === 'transactions' && (
        <div className="card-glass" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800' }}>Nhật Ký Giao Dịch Ví Khách Hàng (Spec 12)</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Dữ liệu bất biến ghi nhận chi tiết lượt nạp kèm bonus, thanh toán đơn hàng và điều chỉnh số dư
              </p>
            </div>

            {/* Filter buttons */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'ALL', label: 'Tất cả' },
                { id: 'TOPUP', label: 'Nạp tiền (+)' },
                { id: 'PAYMENT', label: 'Thanh toán (-)' },
                { id: 'ADJUSTMENT', label: 'Điều chỉnh' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setFilterType(f.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: filterType === f.id ? '700' : '500',
                    background: filterType === f.id ? 'var(--accent-amber)' : 'var(--bg-tertiary)',
                    color: filterType === f.id ? '#000' : 'var(--text-main)',
                    border: '1px solid var(--border-medium)',
                    cursor: 'pointer'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="table-responsive" style={{ marginBottom: 0 }}>
            <table style={{ minWidth: '700px', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-dim)', textAlign: 'left', background: 'var(--bg-tertiary)' }}>
                  <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Mã GD / Thời gian</th>
                  <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Khách hàng</th>
                  <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Loại giao dịch</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>Số tiền</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>Thưởng bonus</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right', whiteSpace: 'nowrap' }}>Số dư sau GD</th>
                  <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Phương thức / Chi tiết</th>
                  <th style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>Nhân viên</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map(tx => {
                  const isTopup = tx.type === 'TOPUP';
                  const isPayment = tx.type === 'PAYMENT';
                  const isAdjust = tx.type === 'ADJUSTMENT';

                  return (
                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--accent-amber)' }}>{tx.id}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{tx.time}</div>
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: '700', color: '#fff' }}>{tx.customerName}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{tx.customerPhone}</div>
                      </td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '800',
                          background: isTopup ? 'rgba(16, 185, 129, 0.15)' : isPayment ? 'rgba(59, 130, 246, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: isTopup ? '#34d399' : isPayment ? '#60a5fa' : '#fbbf24',
                        }}>
                          {isTopup ? 'NẠP VÍ' : isPayment ? 'THANH TOÁN' : 'ĐIỀU CHỈNH'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800', fontFamily: 'var(--font-mono)', color: isTopup ? '#10b981' : isPayment ? '#f87171' : 'var(--accent-amber)', whiteSpace: 'nowrap' }}>
                        {tx.amount > 0 ? `+${tx.amount.toLocaleString('vi-VN')}` : tx.amount.toLocaleString('vi-VN')} đ
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '700', fontFamily: 'var(--font-mono)', color: tx.bonusAmount > 0 ? '#8b5cf6' : 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                        {tx.bonusAmount > 0 ? `+${tx.bonusAmount.toLocaleString('vi-VN')} đ (${tx.bonusPercent}%)` : '—'}
                      </td>
                      <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: '800', fontFamily: 'var(--font-mono)', color: '#fff', whiteSpace: 'nowrap' }}>
                        {tx.balanceAfter.toLocaleString('vi-VN')} đ
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{tx.method}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>{tx.notes}</div>
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                        {tx.staff}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: BÁO CÁO & THỐNG KÊ VÍ (SPEC 12 ANALYTICS)
          ========================================================================= */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Top Performance Analytics */}
          <div className="layout-two-col">
            
            {/* Top Customers with Highest Wallet Deposits */}
            <div className="card-glass" style={{ padding: '20px' }}>
              <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={16} color="var(--accent-amber)" />
                <span>Top Khách Hàng Nạp Tiền Nhiều Nhất</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Khách hàng thân thiết trung thành nạp tiền giữ chỗ sử dụng dịch vụ lâu dài
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {wallets.map((w, idx) => (
                  <div 
                    key={w.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: 'var(--bg-tertiary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: idx === 0 ? 'var(--accent-amber)' : 'rgba(255,255,255,0.1)',
                        color: idx === 0 ? '#000' : '#fff',
                        fontWeight: '900',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}>
                        {idx + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700', color: '#fff', fontSize: '13px' }}>{w.customerName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{w.customerPhone} • Hạng {w.tier}</div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                        {w.totalToppedUp.toLocaleString('vi-VN')} đ
                      </div>
                      <div style={{ fontSize: '10px', color: '#8b5cf6' }}>
                        Nhận bonus: +{w.totalBonus.toLocaleString('vi-VN')}đ
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wallet Promotion Effectiveness Breakdown */}
            <div className="card-glass" style={{ padding: '20px' }}>
              <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Percent size={16} color="var(--accent-amber)" />
                <span>Hiệu Quả Chương Trình Khuyến Mãi Nạp Ví</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                Tỷ lệ quy đổi dòng tiền thực tế so với chi phí bonus cấp cho khách hàng
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {promotions.map(p => (
                  <div key={p.id} style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-tertiary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontWeight: '700', fontSize: '13px' }}>{p.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--accent-amber)', fontWeight: '800' }}>
                        {p.usageCount} lượt dùng
                      </span>
                    </div>

                    {/* Progress visualizer */}
                    <div style={{ height: '6px', background: 'var(--bg-card)', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                      <div style={{
                        height: '100%',
                        width: `${Math.min(100, (p.usageCount / p.maxUsage) * 100)}%`,
                        background: 'linear-gradient(90deg, #f59e0b, #10b981)'
                      }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)' }}>
                      <span>Loại: {p.type === 'TIERED' ? 'Bậc thang 15-25%' : `Cố định +${p.bonusPercent}%`}</span>
                      <span>Chỉ tiêu: {p.usageCount}/{p.maxUsage} ({Math.round((p.usageCount / p.maxUsage) * 100)}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: NẠP TIỀN VÀO VÍ KHÁCH HÀNG (FAST TOP-UP DIALOG)
          ========================================================================= */}
      {showTopupModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '100%', maxWidth: topupSuccessReceipt ? '480px' : '520px', padding: '0', overflow: 'hidden' }}>
            
            {/* Modal Header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-medium)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '17px', fontWeight: '800', color: '#fff' }}>
                  {topupSuccessReceipt ? 'Phiếu Nạp Tiền Vào Ví' : 'Nạp Tiền Vào Ví Khách Hàng (Spec 12)'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {topupSuccessReceipt ? `Mã giao dịch: ${topupSuccessReceipt.id}` : 'Nạp tiền nhận thưởng bonus ngay tại quầy thu ngân'}
                </div>
              </div>
              <button onClick={() => setShowTopupModal(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {!topupSuccessReceipt ? (
              <div style={{ padding: '20px' }}>
                
                {/* 1. Target Customer Picker */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    Chọn Khách Hàng Nạp Ví:
                  </label>
                  <select
                    value={topupTargetWallet.id}
                    onChange={(e) => {
                      const selected = wallets.find(w => w.id === e.target.value);
                      if (selected) setTopupTargetWallet(selected);
                    }}
                    className="input-dark"
                    style={{ marginTop: '6px', height: '40px' }}
                  >
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.customerName} - {w.customerPhone} (Số dư hiện tại: {w.balance.toLocaleString('vi-VN')}đ)
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Amount Input & Quick Chips */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                    Số Tiền Nạp (VNĐ):
                  </label>
                  <input 
                    type="number"
                    inputMode="numeric"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(Number(e.target.value))}
                    className="input-dark"
                    style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-mono)', height: '44px', marginTop: '6px' }}
                  />

                  {/* Preset chips */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {quickTopupPresets.map(val => (
                      <button
                        key={val}
                        onClick={() => setTopupAmount(val)}
                        className="btn-secondary"
                        style={{
                          flex: '1 1 auto',
                          padding: '6px 8px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background: topupAmount === val ? 'var(--accent-amber)' : 'var(--bg-tertiary)',
                          color: topupAmount === val ? '#000' : 'var(--text-main)',
                          borderColor: topupAmount === val ? 'var(--accent-amber)' : 'var(--border-medium)'
                        }}
                      >
                        {(val / 1000).toLocaleString()}k
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Automatic Bonus Preview Box (Spec 12 core rule) */}
                <div style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: currentBonusInfo.bestBonusPercent > 0 ? 'rgba(139, 92, 246, 0.12)' : 'var(--bg-tertiary)',
                  border: currentBonusInfo.bestBonusPercent > 0 ? '1px solid rgba(139, 92, 246, 0.35)' : '1px solid var(--border-medium)',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Ưu đãi khuyến mãi:</span>
                    <span style={{ fontSize: '12px', fontWeight: '800', color: currentBonusInfo.bestBonusPercent > 0 ? '#8b5cf6' : 'var(--text-dim)' }}>
                      {currentBonusInfo.bestBonusPercent > 0 ? `+${currentBonusInfo.bestBonusPercent}% Bonus Thưởng` : 'Không có KM'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tiền thưởng nhận thêm:</span>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#8b5cf6', fontFamily: 'var(--font-mono)' }}>
                      +{currentBonusInfo.bonusAmount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '8px', borderTop: '1px dashed var(--border-medium)' }}>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>TỔNG CỘNG VÀO VÍ:</span>
                    <span style={{ fontSize: '22px', fontWeight: '900', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                      {currentBonusInfo.totalCredited.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

                {/* 4. Payment Method Selection */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
                    Phương thức thanh toán nạp:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {[
                      { id: 'CASH', label: 'Tiền mặt', icon: Banknote },
                      { id: 'VIETQR', label: 'VietQR', icon: QrCode },
                      { id: 'CARD', label: 'Thẻ POS', icon: CreditCard },
                      { id: 'EWALLET', label: 'Ví MoMo', icon: Smartphone },
                    ].map(m => {
                      const Icon = m.icon;
                      const isSel = topupMethod === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setTopupMethod(m.id)}
                          style={{
                            padding: '10px 4px',
                            borderRadius: '8px',
                            background: isSel ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-tertiary)',
                            border: isSel ? '2px solid var(--accent-amber)' : '1px solid var(--border-medium)',
                            color: isSel ? 'var(--accent-amber)' : 'var(--text-muted)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          <Icon size={18} />
                          <span style={{ fontSize: '11px', fontWeight: '700' }}>{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  onClick={handleExecuteTopup}
                  className="btn-primary"
                  style={{ width: '100%', height: '44px', fontSize: '14px', borderRadius: '8px' }}
                >
                  <CheckCircle2 size={18} />
                  <span>Xác Nhận Nạp {currentBonusInfo.totalCredited.toLocaleString('vi-VN')}đ Vào Ví</span>
                </button>
              </div>
            ) : (
              /* Success Receipt (Simulated 80mm POS Thermal Receipt) */
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="receipt-paper" style={{ width: '100%', maxWidth: '340px' }}>
                  <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '16px', fontWeight: '800' }}>POSS COFFEE & TEA</div>
                    <div style={{ fontSize: '10px' }}>{currentStore?.address || '128 Xuân Thủy, Cầu Giấy, Hà Nội'}</div>
                    <div style={{ fontSize: '10px' }}>Hotline: 024 3838 9999</div>
                  </div>

                  <div className="receipt-divider" />

                  <div style={{ textAlign: 'center', fontWeight: '800', fontSize: '13px' }}>
                    PHIẾU NẠP TIỀN VÀO VÍ
                  </div>
                  <div style={{ fontSize: '11px', textAlign: 'center', color: '#4b5563' }}>
                    Mã GD: {topupSuccessReceipt.id}
                  </div>
                  <div style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span>Thời gian: {topupSuccessReceipt.time}</span>
                    <span>Thu ngân: {topupSuccessReceipt.staff.split(' ')[0]}</span>
                  </div>

                  <div className="receipt-divider" />

                  <div style={{ fontSize: '11px', marginBottom: '4px' }}>
                    Khách hàng: <strong>{topupSuccessReceipt.customerName}</strong>
                  </div>
                  <div style={{ fontSize: '11px', marginBottom: '8px' }}>
                    Số điện thoại ví: <strong>{topupSuccessReceipt.customerPhone}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span>Số tiền nạp thực tế:</span>
                    <span>{topupSuccessReceipt.amount.toLocaleString('vi-VN')} đ</span>
                  </div>

                  {topupSuccessReceipt.bonusAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8b5cf6', marginBottom: '4px' }}>
                      <span>Thưởng khuyến mãi (+{topupSuccessReceipt.bonusPercent}%):</span>
                      <span>+{topupSuccessReceipt.bonusAmount.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                    <span>Phương thức nạp:</span>
                    <span>{topupSuccessReceipt.method}</span>
                  </div>

                  <div className="receipt-divider" />

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '800' }}>
                    <span>TỔNG TIỀN VÀO VÍ:</span>
                    <span>{topupSuccessReceipt.totalCredited.toLocaleString('vi-VN')} đ</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '900', color: '#059669', marginTop: '6px', paddingTop: '4px', borderTop: '1px dashed #6b7280' }}>
                    <span>SỐ DƯ VÍ MỚI:</span>
                    <span>{topupSuccessReceipt.balanceAfter.toLocaleString('vi-VN')} đ</span>
                  </div>

                  <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '10px', color: '#6b7280' }}>
                    Số dư ví sử dụng thanh toán vĩnh viễn trên toàn chuỗi POSS.
                    <br />
                    Cảm ơn quý khách!
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', width: '100%', maxWidth: '340px', marginTop: '14px' }}>
                  <button 
                    onClick={() => alert('Đã gửi lệnh in phiếu nạp ra máy in nhiệt 80mm!')}
                    className="btn-primary" 
                    style={{ flex: 1, fontSize: '12px' }}
                  >
                    <Printer size={15} /> In Phiếu Nạp
                  </button>
                  <button 
                    onClick={() => setShowTopupModal(false)}
                    className="btn-secondary" 
                    style={{ flex: 1, fontSize: '12px' }}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ĐIỀU CHỈNH SỐ DƯ THỦ CÔNG (SPEC 12 AUDIT REQUIREMENT)
          ========================================================================= */}
      {showAdjustModal && adjustTargetWallet && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '100%', maxWidth: '420px', padding: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '6px' }}>
              Điều Chỉnh Số Dư Ví Thủ Công (Spec 12)
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Khách hàng: <strong>{adjustTargetWallet.customerName}</strong> ({adjustTargetWallet.customerPhone}) • Số dư hiện tại: <strong style={{ color: 'var(--accent-amber)' }}>{adjustTargetWallet.balance.toLocaleString('vi-VN')}đ</strong>
            </div>

            <div style={{ display: 'flex', background: 'var(--bg-tertiary)', borderRadius: '8px', padding: '3px', marginBottom: '14px' }}>
              <button
                onClick={() => setAdjustType('ADD')}
                style={{
                  flex: 1,
                  padding: '7px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  background: adjustType === 'ADD' ? '#10b981' : 'transparent',
                  color: adjustType === 'ADD' ? '#fff' : 'var(--text-muted)'
                }}
              >
                + Cộng Thêm Tiền
              </button>
              <button
                onClick={() => setAdjustType('SUBTRACT')}
                style={{
                  flex: 1,
                  padding: '7px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  background: adjustType === 'SUBTRACT' ? '#ef4444' : 'transparent',
                  color: adjustType === 'SUBTRACT' ? '#fff' : 'var(--text-muted)'
                }}
              >
                - Trừ Bớt Tiền
              </button>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)' }}>Số tiền điều chỉnh (VNĐ)</label>
              <input 
                type="number"
                inputMode="numeric"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(Number(e.target.value))}
                className="input-dark"
                style={{ marginTop: '4px', fontSize: '16px', fontWeight: '700', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)' }}>
                Lý do điều chỉnh (Bắt buộc theo Spec 12 - Kiểm toán):
              </label>
              <input 
                type="text"
                placeholder="VD: Đền bù phục vụ nhầm món, điều chỉnh kiểm toán..."
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="input-dark"
                style={{ marginTop: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)' }}>Ghi chú thêm (Tùy chọn)</label>
              <input 
                type="text"
                placeholder="Ghi chú đối soát nội bộ..."
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                className="input-dark"
                style={{ marginTop: '4px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowAdjustModal(false)} className="btn-secondary" style={{ flex: 1 }}>Hủy</button>
              <button onClick={handleExecuteAdjustment} className="btn-primary" style={{ flex: 1 }}>Xác Nhận Sửa</button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: TẠO CHƯƠNG TRÌNH KHUYẾN MÃI NẠP MỚI
          ========================================================================= */}
      {showCreatePromoModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '100%', maxWidth: '440px', padding: '20px' }}>
            <div style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px' }}>
              Tạo Chương Trình Khuyến Mãi Nạp Ví Mới
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
              Áp dụng tự động cho khách hàng khi nạp tiền tại quầy POS chuỗi
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)' }}>Tên chương trình KM</label>
              <input 
                type="text"
                placeholder="VD: Tri Ân Khách Hàng Nạp Ví Tặng 25%"
                value={newPromoName}
                onChange={(e) => setNewPromoName(e.target.value)}
                className="input-dark"
                style={{ marginTop: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)' }}>Hình thức thưởng</label>
              <select
                value={newPromoType}
                onChange={(e) => setNewPromoType(e.target.value)}
                className="input-dark"
                style={{ marginTop: '4px' }}
              >
                <option value="TIERED">Thưởng theo bậc thang (Nạp càng nhiều thưởng càng cao)</option>
                <option value="FIXED_PERCENT">Cố định % cho mọi mức nạp</option>
              </select>
            </div>

            {newPromoType === 'FIXED_PERCENT' ? (
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)' }}>% Thưởng thêm</label>
                <input 
                  type="number"
                  value={newPromoFixedPercent}
                  onChange={(e) => setNewPromoFixedPercent(Number(e.target.value))}
                  className="input-dark"
                  style={{ marginTop: '4px' }}
                />
              </div>
            ) : (
              <div style={{ padding: '10px', background: 'var(--bg-tertiary)', borderRadius: '8px', marginBottom: '12px', fontSize: '11px' }}>
                <div style={{ fontWeight: '700', color: 'var(--accent-amber)', marginBottom: '4px' }}>Cấu hình bậc thang mặc định:</div>
                <div>• 50k - 99k: +15% bonus</div>
                <div>• 100k - 499k: +20% bonus</div>
                <div>• Từ 500k trở lên: +25% bonus</div>
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)' }}>Mô tả chương trình</label>
              <input 
                type="text"
                placeholder="Mô tả quyền lợi hiển thị cho thu ngân..."
                value={newPromoDesc}
                onChange={(e) => setNewPromoDesc(e.target.value)}
                className="input-dark"
                style={{ marginTop: '4px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowCreatePromoModal(false)} className="btn-secondary" style={{ flex: 1 }}>Hủy</button>
              <button 
                onClick={() => {
                  if (!newPromoName.trim()) {
                    alert('Vui lòng nhập tên chương trình KM!');
                    return;
                  }
                  const newPromo = {
                    id: `WKM-00${promotions.length + 1}`,
                    name: newPromoName,
                    type: newPromoType,
                    bonusPercent: newPromoFixedPercent,
                    tiers: [
                      { min: 50000, max: 99000, bonus: 15, label: '50k - 99k: +15%' },
                      { min: 100000, max: 499000, bonus: 20, label: '100k - 499k: +20%' },
                      { min: 500000, max: 10000000, bonus: 25, label: 'Từ 500k: +25%' },
                    ],
                    validFrom: '2026-10-15',
                    validTo: '2026-12-31',
                    status: 'ACTIVE',
                    usageCount: 0,
                    maxUsage: 500,
                    description: newPromoDesc || 'Chương trình khuyến mãi nạp ví mới tạo.'
                  };
                  setPromotions([newPromo, ...promotions]);
                  setShowCreatePromoModal(false);
                  setNewPromoName('');
                  alert(`Đã khởi tạo thành công chương trình "${newPromo.name}"!`);
                }} 
                className="btn-primary" 
                style={{ flex: 1 }}
              >
                Kích Hoạt KM
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
