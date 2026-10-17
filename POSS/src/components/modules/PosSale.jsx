import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  User, 
  Tag, 
  Percent, 
  Clock, 
  ArrowRight, 
  Coffee, 
  AlertCircle,
  X,
  Check,
  RotateCcw,
  Printer,
  ChevronRight,
  Sparkles,
  ShoppingBag,
  Wallet
} from 'lucide-react';
import { CATEGORIES, PRODUCTS, TOPPINGS, INITIAL_CUSTOMERS, INITIAL_ORDERS, INITIAL_WALLETS } from '../../data/mockData';

export function PosSale({ onOpenPayment, activeShift, currentUserRole }) {
  // Category & search state
  const [activeCategory, setActiveCategory] = useState('cat-all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart state
  const [cart, setCart] = useState([
    {
      id: 'cart-1',
      productId: 'PRD-004',
      name: 'Vanilla Oat Milk Latte',
      size: 'L',
      price: 65000,
      sugar: '70%',
      ice: '70%',
      toppings: [{ id: 'top-4', name: 'Trân châu trắng 3Q', price: 10000 }],
      notes: 'Ít ngọt, đá riêng',
      qty: 2,
    },
    {
      id: 'cart-2',
      productId: 'PRD-010',
      name: 'Croissant Bơ Pháp Nướng Giòn',
      size: 'Tiêu chuẩn',
      price: 38000,
      sugar: null,
      ice: null,
      toppings: [],
      notes: 'Hâm nóng giòn',
      qty: 1,
    }
  ]);

  // Mobile Bottom Sheet Cart state
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Order type: DINE_IN | TAKE_AWAY
  const [orderType, setOrderType] = useState('DINE_IN');
  const [selectedTable, setSelectedTable] = useState('Bàn 04');
  const [showTablePicker, setShowTablePicker] = useState(false);

  // Customer Loyalty
  const [customerPhone, setCustomerPhone] = useState('0901234567');
  const [attachedCustomer, setAttachedCustomer] = useState(INITIAL_CUSTOMERS[0]); // Nguyễn Thanh Tùng (Platinum)
  const [showCustomerSearch, setShowCustomerSearch] = useState(false);

  // Voucher
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');

  // Manual Discount Modal
  const [showManualDiscountModal, setShowManualDiscountModal] = useState(false);
  const [manualDiscount, setManualDiscount] = useState(0);
  const [manualDiscountReason, setManualDiscountReason] = useState('');

  // Item Customize Modal
  const [customizingProduct, setCustomizingProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedSugar, setSelectedSugar] = useState('100%');
  const [selectedIce, setSelectedIce] = useState('100%');
  const [selectedToppings, setSelectedToppings] = useState([]);
  const [itemNote, setItemNote] = useState('');

  // Orders list view tab
  const [viewTab, setViewTab] = useState('pos'); // 'pos' | 'orders'
  const [ordersList, setOrdersList] = useState(INITIAL_ORDERS);
  const [orderFilter, setOrderFilter] = useState('ALL');
  const [refundOrder, setRefundOrder] = useState(null);
  const [refundReason, setRefundReason] = useState('');

  // Tables list (1 - 24)
  const tables = Array.from({ length: 24 }, (_, i) => `Bàn ${String(i + 1).padStart(2, '0')}`);

  // Filter products
  const filteredProducts = PRODUCTS.filter(p => {
    const matchCat = activeCategory === 'cat-all' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Open customize modal for product
  const handleOpenCustomize = (product) => {
    if (product.status === 'OUT_OF_STOCK') return;
    setCustomizingProduct(product);
    setSelectedSize(product.sizes[0]?.size || 'M');
    setSelectedSugar('100%');
    setSelectedIce('100%');
    setSelectedToppings([]);
    setItemNote('');
  };

  // Add customized item to cart
  const handleAddToCart = () => {
    if (!customizingProduct) return;
    const sizeObj = customizingProduct.sizes.find(s => s.size === selectedSize) || customizingProduct.sizes[0];
    const toppingTotal = selectedToppings.reduce((acc, t) => acc + t.price, 0);
    const itemPrice = (sizeObj ? sizeObj.price : customizingProduct.basePrice) + toppingTotal;

    const newItem = {
      id: 'cart-' + Date.now(),
      productId: customizingProduct.id,
      name: customizingProduct.name,
      size: selectedSize,
      price: itemPrice,
      sugar: selectedSugar,
      ice: selectedIce,
      toppings: selectedToppings,
      notes: itemNote,
      qty: 1,
    };

    setCart([...cart, newItem]);
    setCustomizingProduct(null);
  };

  // Cart actions
  const updateQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeCartItem = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  
  // Loyalty tier discount: Platinum = 10%, Gold = 5%
  let loyaltyDiscount = 0;
  if (attachedCustomer?.tier === 'PLATINUM') {
    loyaltyDiscount = subtotal * 0.1;
  } else if (attachedCustomer?.tier === 'GOLD') {
    loyaltyDiscount = subtotal * 0.05;
  }

  const voucherDiscount = appliedVoucher ? appliedVoucher.discount : 0;
  const totalDiscount = loyaltyDiscount + voucherDiscount + manualDiscount;
  const taxableAmount = Math.max(0, subtotal - totalDiscount);
  const vat = Math.round(taxableAmount * 0.08); // 8% VAT
  const grandTotal = taxableAmount + vat;

  // Apply Voucher
  const handleApplyVoucher = () => {
    if (voucherCode.toUpperCase() === 'CHAOMUNG50K') {
      if (subtotal < 150000) {
        setVoucherError('Đơn hàng tối thiểu 150.000đ để áp dụng voucher này!');
        return;
      }
      setAppliedVoucher({ code: 'CHAOMUNG50K', discount: 50000 });
      setVoucherError('');
    } else if (voucherCode.toUpperCase() === 'POSS10K') {
      setAppliedVoucher({ code: 'POSS10K', discount: 10000 });
      setVoucherError('');
    } else {
      setVoucherError('Mã voucher không hợp lệ hoặc đã hết hạn.');
    }
  };

  // Search Customer
  const handleSearchCustomer = () => {
    const found = INITIAL_CUSTOMERS.find(c => c.phone === customerPhone);
    if (found) {
      setAttachedCustomer(found);
      setShowCustomerSearch(false);
    } else {
      alert('Không tìm thấy khách hàng với SĐT này! Bạn có thể tạo mới trong mục 08. Khách hàng.');
    }
  };

  // Proceed to payment
  const handleProceedPayment = () => {
    if (cart.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm vào giỏ hàng.');
      return;
    }
    setIsMobileCartOpen(false);
    onOpenPayment({
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
      grandTotal,
    });
  };

  // Reusable Cart Content Renderer (Used by both Desktop Sidebar & Mobile Bottom Sheet)
  const renderCartContent = (isDrawer = false) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Order Type Toggle (Dine-in vs Take-away) */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
        <div style={{ display: 'flex', background: 'var(--bg-primary)', borderRadius: '8px', padding: '3px', marginBottom: '8px' }}>
          <button
            onClick={() => setOrderType('DINE_IN')}
            style={{
              flex: 1,
              padding: '6px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              background: orderType === 'DINE_IN' ? 'var(--accent-amber)' : 'transparent',
              color: orderType === 'DINE_IN' ? '#000' : 'var(--text-muted)'
            }}
          >
            Tại Chỗ (Dine-in)
          </button>
          <button
            onClick={() => setOrderType('TAKE_AWAY')}
            style={{
              flex: 1,
              padding: '6px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '700',
              background: orderType === 'TAKE_AWAY' ? 'var(--accent-amber)' : 'transparent',
              color: orderType === 'TAKE_AWAY' ? '#000' : 'var(--text-muted)'
            }}
          >
            Mang Đi (Take-away)
          </button>
        </div>

        {orderType === 'DINE_IN' && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Vị trí bàn phục vụ:</span>
            <button
              onClick={() => setShowTablePicker(!showTablePicker)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-medium)',
                borderRadius: '6px',
                padding: '4px 10px',
                fontSize: '12px',
                fontWeight: '700',
                color: 'var(--accent-amber)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {selectedTable}
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* Table Picker Popup */}
        {showTablePicker && orderType === 'DINE_IN' && (
          <div style={{
            marginTop: '8px',
            padding: '8px',
            background: 'var(--bg-card)',
            borderRadius: '8px',
            border: '1px solid var(--border-medium)',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '6px',
            maxHeight: '120px',
            overflowY: 'auto'
          }}>
            {tables.map(tbl => (
              <button
                key={tbl}
                onClick={() => { setSelectedTable(tbl); setShowTablePicker(false); }}
                style={{
                  padding: '6px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: tbl === selectedTable ? '700' : '500',
                  background: tbl === selectedTable ? 'var(--accent-amber)' : 'var(--bg-tertiary)',
                  color: tbl === selectedTable ? '#000' : 'var(--text-main)',
                }}
              >
                {tbl}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Customer Membership Bar */}
      <div style={{ padding: '8px 14px', background: 'rgba(245, 158, 11, 0.05)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {attachedCustomer ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: '800',
              background: attachedCustomer.tier === 'PLATINUM' ? '#8b5cf6' : '#f59e0b',
              color: '#fff'
            }}>
              {attachedCustomer.tier} (-10%)
            </div>
            <span style={{ fontSize: '11px', fontWeight: '600' }}>{attachedCustomer.name}</span>
            {(() => {
              const customerWallet = INITIAL_WALLETS.find(w => w.customerPhone === attachedCustomer.phone || w.customerId === attachedCustomer.id);
              if (customerWallet) {
                return (
                  <span 
                    title={`Số dư ví: ${customerWallet.balance.toLocaleString('vi-VN')} đ`}
                    style={{ 
                      fontSize: '11px', 
                      fontWeight: '700', 
                      color: '#10b981', 
                      background: 'rgba(16, 185, 129, 0.12)', 
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      padding: '1px 7px', 
                      borderRadius: '10px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Wallet size={11} /> {customerWallet.balance.toLocaleString('vi-VN')} đ
                  </span>
                );
              }
              return (
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(Chưa mở ví)</span>
              );
            })()}
          </div>
        ) : (
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Chưa gán khách hàng hội viên</span>
        )}
        <button 
          onClick={() => setShowCustomerSearch(!showCustomerSearch)}
          style={{ fontSize: '11px', color: 'var(--accent-amber)', background: 'transparent', fontWeight: '700' }}
        >
          {attachedCustomer ? 'Đổi' : '+ SĐT'}
        </button>
      </div>

      {showCustomerSearch && (
        <div style={{ padding: '8px 14px', background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: '6px' }}>
          <input 
            type="text" 
            inputMode="tel"
            placeholder="Nhập SĐT khách (VD: 0901234567)" 
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="input-dark"
            style={{ height: '32px', fontSize: '12px' }}
          />
          <button onClick={handleSearchCustomer} className="btn-primary" style={{ padding: '0 10px', fontSize: '12px', height: '32px' }}>
            Tìm
          </button>
        </div>
      )}

      {/* Cart Items List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', minHeight: isDrawer ? '160px' : 'auto' }}>
        {cart.length === 0 ? (
          <div style={{ height: '100%', minHeight: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
            <Coffee size={32} strokeWidth={1.5} style={{ marginBottom: '8px' }} />
            <div style={{ fontSize: '12px' }}>Chưa có món nào trong đơn</div>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} style={{
              padding: '8px 0',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, paddingRight: '6px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-main)' }}>{item.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                    Size {item.size} {item.sugar && `• ${item.sugar} đường • ${item.ice} đá`}
                  </div>
                  {item.toppings.length > 0 && (
                    <div style={{ fontSize: '10px', color: 'var(--accent-amber)' }}>
                      + {item.toppings.map(t => t.name).join(', ')}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>
                    {Number(item.price * item.qty).toLocaleString('vi-VN')} đ
                  </div>
                </div>
              </div>

              {/* Qty & Delete controls */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                <button 
                  onClick={() => removeCartItem(item.id)}
                  style={{ background: 'transparent', color: '#ef4444', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
                >
                  <Trash2 size={12} /> Xóa
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button 
                    onClick={() => updateQty(item.id, -1)}
                    aria-label="Giảm số lượng"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-medium)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Minus size={13} />
                  </button>
                  <span style={{ fontSize: '13px', fontWeight: '700', minWidth: '18px', textAlign: 'center' }}>{item.qty}</span>
                  <button 
                    onClick={() => updateQty(item.id, 1)}
                    aria-label="Tăng số lượng"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-medium)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Voucher and Manual Discount */}
      <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-tertiary)' }}>
        <div style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
          <input 
            type="text" 
            autoCapitalize="characters"
            placeholder="Nhập mã voucher (POSS10K)" 
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
            className="input-dark"
            style={{ height: '30px', fontSize: '11px' }}
          />
          <button onClick={handleApplyVoucher} className="btn-secondary" style={{ padding: '0 8px', fontSize: '11px', height: '30px' }}>
            Áp dụng
          </button>
        </div>
        {appliedVoucher && (
          <div style={{ fontSize: '10px', color: '#10b981', display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>Voucher {appliedVoucher.code}</span>
            <span>-{appliedVoucher.discount.toLocaleString('vi-VN')} đ</span>
          </div>
        )}

        {(currentUserRole === 'OWNER' || currentUserRole === 'MANAGER') && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Giảm thủ công (Manager):</span>
            <button 
              onClick={() => setShowManualDiscountModal(true)}
              style={{ fontSize: '10px', color: 'var(--accent-amber)', background: 'transparent', fontWeight: '700' }}
            >
              {manualDiscount > 0 ? `-${manualDiscount.toLocaleString('vi-VN')} đ` : '+ Thêm'}
            </button>
          </div>
        )}
      </div>

      {/* Price Summary Breakdown */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '3px' }}>
          <span>Tạm tính ({cart.reduce((a, c) => a + c.qty, 0)} món):</span>
          <span>{subtotal.toLocaleString('vi-VN')} đ</span>
        </div>

        {loyaltyDiscount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#8b5cf6', marginBottom: '3px' }}>
            <span>Ưu đãi hội viên ({attachedCustomer.tier}):</span>
            <span>-{loyaltyDiscount.toLocaleString('vi-VN')} đ</span>
          </div>
        )}

        {appliedVoucher && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#10b981', marginBottom: '3px' }}>
            <span>Voucher:</span>
            <span>-{appliedVoucher.discount.toLocaleString('vi-VN')} đ</span>
          </div>
        )}

        {manualDiscount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#f59e0b', marginBottom: '3px' }}>
            <span>Giảm đặc biệt:</span>
            <span>-{manualDiscount.toLocaleString('vi-VN')} đ</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
          <span>Thuế VAT (8%):</span>
          <span>+{vat.toLocaleString('vi-VN')} đ</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '6px', borderTop: '1px dashed var(--border-medium)', marginBottom: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700' }}>TỔNG CỘNG:</span>
          <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
            {grandTotal.toLocaleString('vi-VN')} đ
          </span>
        </div>

        {/* Big CTA Payment Button */}
        <button
          onClick={handleProceedPayment}
          className="btn-primary"
          style={{ width: '100%', height: '44px', fontSize: '14px', borderRadius: '8px' }}
        >
          <span>Thanh Toán Đơn Hàng</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100%', gap: '16px', position: 'relative' }}>
      {/* View Switcher: POS vs Orders List */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Top Header Tabs */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px',
          paddingBottom: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
            <button
              onClick={() => setViewTab('pos')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '12px',
                background: viewTab === 'pos' ? 'var(--accent-amber)' : 'var(--bg-tertiary)',
                color: viewTab === 'pos' ? '#000' : 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Coffee size={14} />
              <span>Gọi Món</span>
            </button>
            <button
              onClick={() => setViewTab('orders')}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '12px',
                background: viewTab === 'orders' ? 'var(--accent-amber)' : 'var(--bg-tertiary)',
                color: viewTab === 'orders' ? '#000' : 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Clock size={14} />
              <span>Đơn Hàng ({ordersList.length})</span>
            </button>
          </div>

          {/* Quick Search */}
          {viewTab === 'pos' && (
            <div style={{ position: 'relative', flex: 1, minWidth: '130px', maxWidth: '240px' }}>
              <Search size={14} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder="Tìm món, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-dark"
                style={{ paddingLeft: '32px', height: '32px', borderRadius: '8px', fontSize: '12px', width: '100%' }}
              />
            </div>
          )}
        </div>

        {viewTab === 'pos' ? (
          <>
            {/* Category horizontal scroll bar */}
            <div style={{
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              paddingBottom: '8px',
              marginBottom: '10px',
            }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: activeCategory === cat.id ? '700' : '500',
                    background: activeCategory === cat.id ? 'var(--bg-card-hover)' : 'var(--bg-tertiary)',
                    color: activeCategory === cat.id ? 'var(--accent-amber)' : 'var(--text-main)',
                    border: activeCategory === cat.id ? '1px solid var(--accent-amber)' : '1px solid var(--border-medium)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Products Grid (Balanced 2-col on mobile, 3-4 col on desktop, never squished) */}
            <div className="pos-products-grid">
              {filteredProducts.map(prod => {
                const isOutOfStock = prod.status === 'OUT_OF_STOCK';
                return (
                  <div
                    key={prod.id}
                    onClick={() => handleOpenCustomize(prod)}
                    className="pos-product-card"
                    style={{
                      cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                      opacity: isOutOfStock ? 0.6 : 1,
                    }}
                  >
                    <div className="pos-product-card-img-wrap">
                      <img 
                        src={prod.image} 
                        alt={prod.name} 
                        className="pos-product-card-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80';
                        }}
                      />
                      {isOutOfStock && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.72)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#f87171',
                          fontWeight: '800',
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Hết Hàng
                        </div>
                      )}
                      {prod.stock <= prod.minStock && !isOutOfStock && (
                        <div style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          background: 'rgba(239, 68, 68, 0.92)',
                          color: '#fff',
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: '700'
                        }}>
                          Còn {prod.stock}
                        </div>
                      )}
                    </div>

                    <div className="pos-product-card-body">
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontWeight: '600' }}>{prod.sku}</div>
                        <div className="pos-product-title" style={{ marginTop: '2px' }}>
                          {prod.name}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                          {Number(prod.basePrice).toLocaleString('vi-VN')} đ
                        </span>
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: 'var(--bg-tertiary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-main)',
                          border: '1px solid var(--border-medium)',
                          flexShrink: 0
                        }}>
                          <Plus size={14} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* Orders Management View */
          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '70px' }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', overflowX: 'auto' }}>
              {['ALL', 'BREWING', 'COMPLETED', 'CANCELLED'].map(status => (
                <button
                  key={status}
                  onClick={() => setOrderFilter(status)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: orderFilter === status ? '700' : '500',
                    background: orderFilter === status ? 'var(--bg-card-hover)' : 'var(--bg-tertiary)',
                    color: orderFilter === status ? 'var(--accent-amber)' : 'var(--text-muted)',
                    border: '1px solid var(--border-medium)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {status === 'ALL' ? 'Tất cả' : status === 'BREWING' ? 'Đang pha chế' : status === 'COMPLETED' ? 'Hoàn thành' : 'Đã hủy'}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {ordersList
                .filter(o => orderFilter === 'ALL' || o.status === orderFilter)
                .map(ord => (
                  <div key={ord.id} className="card-glass" style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--accent-amber)', fontSize: '13px' }}>{ord.id}</span>
                          <span className={`badge ${ord.status === 'COMPLETED' ? 'badge-staff' : ord.status === 'BREWING' ? 'badge-amber' : 'badge-owner'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                            {ord.status === 'COMPLETED' ? 'Đã thu tiền' : ord.status === 'BREWING' ? 'Đang làm' : 'Đã hủy'}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>
                          {ord.createdAt} • {ord.type === 'DINE_IN' ? ord.table : 'Mang đi'}
                        </div>
                      </div>

                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>
                        {Number(ord.total).toLocaleString('vi-VN')} đ
                      </div>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {ord.items.map(it => `${it.name} (x${it.qty})`).join(', ')}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                      <button 
                        onClick={() => alert(`In lại hóa đơn #${ord.id} thành công!`)}
                        className="btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                      >
                        <Printer size={12} /> In bill
                      </button>
                      {ord.status === 'COMPLETED' && (currentUserRole === 'OWNER' || currentUserRole === 'MANAGER') && (
                        <button 
                          onClick={() => setRefundOrder(ord)}
                          className="btn-danger" 
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                        >
                          <RotateCcw size={12} /> Hoàn tiền
                        </button>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Desktop Cart Panel (Hidden on Mobile via CSS) */}
      <div 
        className="desktop-cart-panel"
        style={{
          width: '380px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden'
        }}
      >
        {renderCartContent(false)}
      </div>

      {/* Mobile Sticky Floating Cart Bar */}
      {viewTab === 'pos' && (
        <div className="mobile-pos-floating-bar">
          <div onClick={() => setIsMobileCartOpen(true)} style={{ cursor: 'pointer' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Giỏ hàng ({cart.reduce((a, c) => a + c.qty, 0)} món)
            </div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
              {grandTotal.toLocaleString('vi-VN')} đ
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={() => setIsMobileCartOpen(true)}
              className="btn-secondary"
              style={{ fontSize: '12px', padding: '6px 10px' }}
            >
              Xem giỏ
            </button>
            <button 
              onClick={handleProceedPayment}
              className="btn-primary"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              Thanh toán
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Sheet Cart Drawer */}
      {isMobileCartOpen && (
        <>
          <div className="mobile-cart-backdrop" onClick={() => setIsMobileCartOpen(false)} />
          <div className="mobile-cart-drawer">
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-medium)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'var(--bg-card)'
            }}>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>
                Giỏ Hàng Đang Tạo ({cart.reduce((a, c) => a + c.qty, 0)} món)
              </div>
              <button onClick={() => setIsMobileCartOpen(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {renderCartContent(true)}
            </div>
          </div>
        </>
      )}

      {/* Item Customize Modal */}
      {customizingProduct && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '100%', maxWidth: '440px', margin: '8px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '800' }}>{customizingProduct.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tùy chỉnh món (Spec 04)</div>
              </div>
              <button onClick={() => setCustomizingProduct(null)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            {/* Sizes */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '6px' }}>CHỌN KÍCH CỠ (SIZE)</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {customizingProduct.sizes.map(s => (
                  <button
                    key={s.size}
                    onClick={() => setSelectedSize(s.size)}
                    style={{
                      flex: 1,
                      padding: '8px 4px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      background: selectedSize === s.size ? 'var(--accent-amber)' : 'var(--bg-tertiary)',
                      color: selectedSize === s.size ? '#000' : 'var(--text-main)',
                      border: '1px solid var(--border-medium)',
                      textAlign: 'center'
                    }}
                  >
                    <div>{s.size}</div>
                    <div style={{ fontSize: '10px', opacity: 0.85 }}>{s.price.toLocaleString('vi-VN')}đ</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sugar % */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '4px' }}>MỨC ĐƯỜNG</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['100%', '70%', '50%', '30%', '0%'].map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSugar(s)}
                    style={{
                      flex: 1,
                      padding: '5px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: selectedSugar === s ? '700' : '500',
                      background: selectedSugar === s ? 'var(--bg-card-hover)' : 'var(--bg-tertiary)',
                      color: selectedSugar === s ? 'var(--accent-amber)' : 'var(--text-main)',
                      border: selectedSugar === s ? '1px solid var(--accent-amber)' : '1px solid var(--border-medium)',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Ice % */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '4px' }}>MỨC ĐÁ</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {['100%', '70%', '50%', '30%', '0%'].map(i => (
                  <button
                    key={i}
                    onClick={() => setSelectedIce(i)}
                    style={{
                      flex: 1,
                      padding: '5px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      fontWeight: selectedIce === i ? '700' : '500',
                      background: selectedIce === i ? 'var(--bg-card-hover)' : 'var(--bg-tertiary)',
                      color: selectedIce === i ? 'var(--accent-amber)' : 'var(--text-main)',
                      border: selectedIce === i ? '1px solid var(--accent-amber)' : '1px solid var(--border-medium)',
                    }}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {/* Toppings Multi-select */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '4px' }}>TOPPING THÊM</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {TOPPINGS.slice(0, 4).map(top => {
                  const isSelected = selectedToppings.some(t => t.id === top.id);
                  return (
                    <button
                      key={top.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedToppings(selectedToppings.filter(t => t.id !== top.id));
                        } else {
                          setSelectedToppings([...selectedToppings, top]);
                        }
                      }}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: '600',
                        background: isSelected ? 'rgba(245, 158, 11, 0.15)' : 'var(--bg-tertiary)',
                        color: isSelected ? 'var(--accent-amber)' : 'var(--text-main)',
                        border: isSelected ? '1px solid var(--accent-amber)' : '1px solid var(--border-medium)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>{top.name}</span>
                      <span>+{top.price.toLocaleString('vi-VN')}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Note input */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)', marginBottom: '4px' }}>GHI CHÚ RIÊNG</div>
              <input
                type="text"
                placeholder="Ví dụ: ít ngọt, nhiều sữa..."
                value={itemNote}
                onChange={(e) => setItemNote(e.target.value)}
                className="input-dark"
                style={{ height: '34px', fontSize: '12px' }}
              />
            </div>

            {/* Modal Submit */}
            <button
              onClick={handleAddToCart}
              className="btn-primary"
              style={{ width: '100%', height: '40px', fontSize: '13px' }}
            >
              Thêm Vào Giỏ Hàng
            </button>
          </div>
        </div>
      )}

      {/* Manual Discount Reason Modal */}
      {showManualDiscountModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '100%', maxWidth: '380px', margin: '8px', padding: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '8px' }}>Giảm Giá Thủ Công (Manager)</div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)' }}>Số tiền giảm (VNĐ)</label>
              <input 
                type="number"
                value={manualDiscount}
                onChange={(e) => setManualDiscount(Number(e.target.value))}
                className="input-dark"
                style={{ marginTop: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)' }}>Lý do giảm giá</label>
              <input 
                type="text"
                placeholder="VD: Khách quen của chủ quán..."
                value={manualDiscountReason}
                onChange={(e) => setManualDiscountReason(e.target.value)}
                className="input-dark"
                style={{ marginTop: '4px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setShowManualDiscountModal(false)} className="btn-secondary" style={{ flex: 1 }}>Hủy</button>
              <button 
                onClick={() => {
                  if (!manualDiscountReason.trim()) {
                    alert('Bắt buộc phải nhập lý do giảm giá!');
                    return;
                  }
                  setShowManualDiscountModal(false);
                }} 
                className="btn-primary" 
                style={{ flex: 1 }}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundOrder && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '100%', maxWidth: '380px', margin: '8px', padding: '16px' }}>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#f87171', marginBottom: '8px' }}>
              Hoàn Trả Đơn Hàng (Refund)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px' }}>
              Mã: {refundOrder.id} • Tổng hoàn: {Number(refundOrder.total).toLocaleString('vi-VN')} đ
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-dim)' }}>Lý do hoàn trả</label>
              <textarea 
                rows={2}
                placeholder="VD: Khách đổi ý, sản phẩm pha nhầm..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="input-dark"
                style={{ marginTop: '4px', resize: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setRefundOrder(null)} className="btn-secondary" style={{ flex: 1 }}>Đóng</button>
              <button 
                onClick={() => {
                  if (!refundReason.trim()) {
                    alert('Bắt buộc nhập lý do hoàn trả!');
                    return;
                  }
                  setOrdersList(ordersList.map(o => o.id === refundOrder.id ? { ...o, status: 'REFUNDED' } : o));
                  alert(`Đã hoàn trả thành công đơn ${refundOrder.id}!`);
                  setRefundOrder(null);
                }}
                className="btn-danger" 
                style={{ flex: 1 }}
              >
                Hoàn Tiền
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
