import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Tag, 
  Layers, 
  Eye, 
  EyeOff, 
  Coffee,
  X
} from 'lucide-react';
import { CATEGORIES, PRODUCTS, TOPPINGS } from '../../data/mockData';

export function MenuModule({ currentUserRole }) {
  const [productList, setProductList] = useState(PRODUCTS);
  const [selectedCat, setSelectedCat] = useState('cat-all');
  const [search, setSearch] = useState('');

  // Add/Edit Product Modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formCategory, setFormCategory] = useState('cat-coffee');
  const [formBasePrice, setFormBasePrice] = useState(35000);
  const [formDesc, setFormDesc] = useState('');

  const filtered = productList.filter(p => {
    const matchCat = selectedCat === 'cat-all' || p.category === selectedCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleStatus = (id) => {
    setProductList(productList.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === 'AVAILABLE' ? 'OUT_OF_STOCK' : 'AVAILABLE';
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormSku('NEW-' + Math.floor(Math.random() * 1000));
    setFormCategory('cat-coffee');
    setFormBasePrice(35000);
    setFormDesc('');
    setShowProductModal(true);
  };

  const handleSaveProduct = () => {
    if (!formName.trim() || !formSku.trim()) {
      alert('Vui lòng nhập tên món và mã SKU!');
      return;
    }

    if (editingProduct) {
      setProductList(productList.map(p => p.id === editingProduct.id ? {
        ...p,
        name: formName,
        sku: formSku,
        category: formCategory,
        basePrice: Number(formBasePrice),
        description: formDesc
      } : p));
    } else {
      const newProd = {
        id: 'PRD-' + Date.now(),
        sku: formSku,
        name: formName,
        category: formCategory,
        basePrice: Number(formBasePrice),
        sizes: [
          { size: 'M', price: Number(formBasePrice) },
          { size: 'L', price: Number(formBasePrice) + 7000 }
        ],
        status: 'AVAILABLE',
        stock: 50,
        minStock: 15,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80',
        description: formDesc
      };
      setProductList([newProd, ...productList]);
    }
    setShowProductModal(false);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div className="module-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
            Quản Lý Menu & Sản Phẩm (Spec 03)
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Định nghĩa món ăn, kích cỡ (size), topping và trạng thái còn hàng / tạm hết tại quầy
          </p>
        </div>

        {(currentUserRole === 'OWNER' || currentUserRole === 'MANAGER') && (
          <div className="module-header-actions">
            <button onClick={openCreateModal} className="btn-primary" style={{ fontSize: '13px' }}>
              <Plus size={16} /> Thêm Món Mới
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div className="module-tabs-bar" style={{ marginBottom: 0, flex: 1, minWidth: '240px' }}>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCat(c.id)}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: selectedCat === c.id ? '700' : '500',
                background: selectedCat === c.id ? 'var(--bg-card-hover)' : 'var(--bg-tertiary)',
                color: selectedCat === c.id ? 'var(--accent-amber)' : 'var(--text-main)',
                border: selectedCat === c.id ? '1px solid var(--accent-amber)' : '1px solid var(--border-medium)',
                whiteSpace: 'nowrap'
              }}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: '280px' }}>
          <Search size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Tìm theo tên món hoặc SKU..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-dark"
            style={{ paddingLeft: '32px', height: '36px', fontSize: '12px', width: '100%' }}
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="table-responsive">
        <table style={{ minWidth: '600px', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-medium)', color: 'var(--text-dim)', textAlign: 'left' }}>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Sản phẩm</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Mã SKU</th>
              <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>Danh mục</th>
              <th style={{ padding: '12px 16px' }}>Giá mặc định</th>
              <th style={{ padding: '12px 16px' }}>Kích cỡ (Size)</th>
              <th style={{ padding: '12px 16px' }}>Trạng thái quầy</th>
              <th style={{ padding: '12px 16px', textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => {
              const isAvailable = p.status === 'AVAILABLE';
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{p.description?.slice(0, 40)}...</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-mono)', fontWeight: '600', color: 'var(--text-muted)' }}>
                    {p.sku}
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                    {CATEGORIES.find(c => c.id === p.category)?.name || 'Khác'}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: '700', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                    {p.basePrice.toLocaleString('vi-VN')} đ
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {p.sizes.map(s => (
                        <span key={s.size} style={{ padding: '2px 6px', background: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '11px' }}>
                          {s.size}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => toggleStatus(p.id)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: isAvailable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: isAvailable ? '#34d399' : '#f87171',
                        border: isAvailable ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                      title="Nhấn để đổi trạng thái Đang bán / Tạm hết (Spec 03)"
                    >
                      {isAvailable ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                      <span>{isAvailable ? 'Đang bán' : 'Tạm hết'}</span>
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    {(currentUserRole === 'OWNER' || currentUserRole === 'MANAGER') && (
                      <button 
                        onClick={() => {
                          setEditingProduct(p);
                          setFormName(p.name);
                          setFormSku(p.sku);
                          setFormCategory(p.category);
                          setFormBasePrice(p.basePrice);
                          setFormDesc(p.description || '');
                          setShowProductModal(true);
                        }}
                        style={{ background: 'transparent', color: 'var(--text-muted)', padding: '6px' }}
                        title="Chỉnh sửa món"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ width: '480px', padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '16px', fontWeight: '800' }}>
                {editingProduct ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
              </div>
              <button onClick={() => setShowProductModal(false)} style={{ background: 'transparent', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Tên sản phẩm</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="input-dark"
                  style={{ marginTop: '4px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Mã SKU</label>
                  <input 
                    type="text" 
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="input-dark"
                    style={{ marginTop: '4px' }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Giá cơ bản (VNĐ)</label>
                  <input 
                    type="number" 
                    value={formBasePrice}
                    onChange={(e) => setFormBasePrice(e.target.value)}
                    className="input-dark"
                    style={{ marginTop: '4px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Danh mục</label>
                <select 
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="input-dark"
                  style={{ marginTop: '4px' }}
                >
                  {CATEGORIES.filter(c => c.id !== 'cat-all').map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-dim)' }}>Mô tả món</label>
                <textarea 
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="input-dark"
                  style={{ marginTop: '4px', resize: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowProductModal(false)} className="btn-secondary" style={{ flex: 1 }}>Hủy</button>
              <button onClick={handleSaveProduct} className="btn-primary" style={{ flex: 1 }}>Lưu Sản Phẩm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
