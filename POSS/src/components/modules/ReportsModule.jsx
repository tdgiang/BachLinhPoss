import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Download, 
  Calendar, 
  Store, 
  ArrowUpRight,
  PieChart
} from 'lucide-react';
import { INITIAL_STORES } from '../../data/mockData';

export function ReportsModule({ currentUserRole }) {
  const [timeFilter, setTimeFilter] = useState('TODAY'); // 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM'

  // Hourly Peak Sales data (07:00 - 22:00)
  const hourlyData = [
    { hour: '07h', sales: 1200000, height: 35 },
    { hour: '08h', sales: 2800000, height: 75 }, // Morning rush
    { hour: '09h', sales: 3400000, height: 90 }, // Peak morning
    { hour: '10h', sales: 2100000, height: 55 },
    { hour: '11h', sales: 1800000, height: 48 },
    { hour: '12h', sales: 3600000, height: 95 }, // Lunch rush
    { hour: '13h', sales: 2900000, height: 78 },
    { hour: '14h', sales: 2200000, height: 58 },
    { hour: '15h', sales: 2500000, height: 65 },
    { hour: '16h', sales: 1900000, height: 50 },
    { hour: '17h', sales: 1700000, height: 45 },
    { hour: '18h', sales: 2100000, height: 55 },
    { hour: '19h', sales: 3800000, height: 100 }, // Evening peak
    { hour: '20h', sales: 3200000, height: 85 },
    { hour: '21h', sales: 2400000, height: 62 },
    { hour: '22h', sales: 1100000, height: 30 },
  ];

  // Top selling products
  const topProducts = [
    { rank: 1, name: 'Cà phê Sữa Đá Sài Gòn', qty: 186, rev: 6510000, growth: '+18%' },
    { rank: 2, name: 'Vanilla Oat Milk Latte', qty: 142, rev: 7810000, growth: '+24%' },
    { rank: 3, name: 'Trà Đào Cam Sả Tươi Mát', qty: 124, rev: 5952000, growth: '+12%' },
    { rank: 4, name: 'Trà Sữa Ô Long Nướng Trân Châu', qty: 115, rev: 5175000, growth: '+9%' },
    { rank: 5, name: 'Croissant Bơ Pháp Nướng Giòn', qty: 98, rev: 3724000, growth: '+15%' },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Time filters Tab Bar (Primary Navigation, always placed at top) */}
      <div className="module-tabs-bar">
        {[
          { id: 'TODAY', label: 'Hôm nay' },
          { id: 'WEEK', label: '7 ngày qua' },
          { id: 'MONTH', label: 'Tháng này' },
          { id: 'CUSTOM', label: 'Tùy chọn khoảng ngày' },
        ].map(tf => (
          <button
            key={tf.id}
            onClick={() => setTimeFilter(tf.id)}
            style={{
              fontWeight: timeFilter === tf.id ? '700' : '500',
              background: timeFilter === tf.id ? 'var(--accent-amber)' : 'var(--bg-tertiary)',
              color: timeFilter === tf.id ? '#000' : 'var(--text-muted)',
              border: '1px solid var(--border-medium)'
            }}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Header */}
      <div className="module-header">
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', fontFamily: 'var(--font-heading)' }}>
            Báo Cáo Doanh Thu & Thống Kê (Spec 10)
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Phân tích số liệu kinh doanh, giờ cao điểm (Peak Hours), hiệu suất món và so sánh chuỗi
          </p>
        </div>

        <div className="module-header-actions">
          <button onClick={() => alert('Đang xuất báo cáo dạng file Excel (.xlsx) theo tiêu chuẩn Spec 10!')} className="btn-secondary" style={{ fontSize: '12px' }}>
            <Download size={14} /> Xuất Excel (.xlsx)
          </button>
          <button onClick={() => alert('Đang tạo file PDF báo cáo tài chính định kỳ!')} className="btn-secondary" style={{ fontSize: '12px' }}>
            <Download size={14} /> Xuất PDF
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="kpi-grid-4">
        <div className="card-glass" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
            <span>TỔNG DOANH THU RÒNG</span>
            <DollarSign size={16} color="var(--accent-amber)" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginTop: '6px', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
            74.150.000 đ
          </div>
          <div style={{ fontSize: '11px', color: '#10b981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', whiteSpace: 'nowrap' }}>
            <TrendingUp size={14} /> +14.8% so với kỳ trước
          </div>
        </div>

        <div className="card-glass" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
            <span>TỔNG SỐ ĐƠN HÀNG</span>
            <ShoppingBag size={16} color="#3b82f6" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginTop: '6px', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
            561 đơn
          </div>
          <div style={{ fontSize: '11px', color: '#10b981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', whiteSpace: 'nowrap' }}>
            <TrendingUp size={14} /> +8.2% đơn hoàn thành
          </div>
        </div>

        <div className="card-glass" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
            <span>GIÁ TRỊ TB/ĐƠN (AOV)</span>
            <ArrowUpRight size={16} color="#8b5cf6" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginTop: '6px', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
            132.170 đ
          </div>
          <div style={{ fontSize: '11px', color: '#10b981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', whiteSpace: 'nowrap' }}>
            <TrendingUp size={14} /> +5.4% nhờ combo bánh
          </div>
        </div>

        <div className="card-glass" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dim)', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
            <span>KHÁCH HÀNG MỚI</span>
            <Users size={16} color="#10b981" />
          </div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-main)', marginTop: '6px', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
            48 khách
          </div>
          <div style={{ fontSize: '11px', color: '#10b981', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600', whiteSpace: 'nowrap' }}>
            <TrendingUp size={14} /> Tích điểm thành công
          </div>
        </div>
      </div>

      {/* Hourly Sales Bar Chart (Peak Hours - Spec 10) */}
      <div className="card-glass" style={{ padding: '20px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '800' }}>Biểu Đồ Doanh Thu Theo Giờ (Xác Định Giờ Cao Điểm)</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Giúp quản lý bố trí nhân sự pha chế và phục vụ hợp lý</div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--accent-amber)', fontWeight: '700' }}>
            Khung giờ đông nhất: 12:00 - 13:00 & 19:00 - 20:00
          </div>
        </div>

        {/* CSS Bar Chart Simulation */}
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '180px', gap: '10px', minWidth: '520px', paddingTop: '20px', borderBottom: '1px solid var(--border-medium)' }}>
            {hourlyData.map(h => (
              <div key={h.hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                <div 
                  style={{
                    width: '100%',
                    height: `${h.height}%`,
                    background: h.height >= 80 ? 'linear-gradient(180deg, #f59e0b, #d97706)' : 'var(--bg-card-hover)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 300ms ease',
                    position: 'relative'
                  }}
                  title={`${h.hour}: ${(h.sales / 1000000).toFixed(1)} triệu đồng`}
                />
                <span style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '6px' }}>{h.hour}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top Selling Items & Stores Ranking */}
      <div className="layout-two-col">
        
        {/* Top Selling Products */}
        <div className="card-glass" style={{ padding: '16px' }}>
          <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '14px' }}>Top 5 Sản Phẩm Bán Chạy Nhất</div>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: '420px', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-dim)', textAlign: 'left' }}>
                  <th style={{ padding: '8px', whiteSpace: 'nowrap' }}>#</th>
                  <th style={{ padding: '8px', whiteSpace: 'nowrap' }}>Món</th>
                  <th style={{ padding: '8px', textAlign: 'center', whiteSpace: 'nowrap' }}>Số lượng</th>
                  <th style={{ padding: '8px', textAlign: 'right', whiteSpace: 'nowrap' }}>Doanh thu</th>
                  <th style={{ padding: '8px', textAlign: 'right', whiteSpace: 'nowrap' }}>Tăng trưởng</th>
                </tr>
              </thead>
            <tbody>
              {topProducts.map(p => (
                <tr key={p.rank} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 8px', fontWeight: '800', color: p.rank === 1 ? 'var(--accent-amber)' : 'var(--text-dim)' }}>
                    0{p.rank}
                  </td>
                  <td style={{ padding: '10px 8px', fontWeight: '700' }}>{p.name}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>{p.qty} ly</td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: '700', fontFamily: 'var(--font-mono)' }}>
                    {p.rev.toLocaleString('vi-VN')} đ
                  </td>
                  <td style={{ padding: '10px 8px', textAlign: 'right', color: '#10b981', fontWeight: '700' }}>
                    {p.growth}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* Chain Stores Performance Comparison (Owner only) */}
        <div className="card-glass" style={{ padding: '20px' }}>
          <div style={{ fontSize: '15px', fontWeight: '800', marginBottom: '14px' }}>
            So Sánh Hiệu Suất Chuỗi Chi Nhánh (Owner)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {INITIAL_STORES.map((st, idx) => (
              <div key={st.id} style={{ padding: '10px 14px', borderRadius: '8px', background: 'var(--bg-tertiary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontWeight: '700', fontSize: '13px' }}>{st.name}</span>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                    {st.todayRevenue.toLocaleString('vi-VN')} đ
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-dim)' }}>
                  <span>{st.todayOrders} đơn hàng</span>
                  <span>{st.status === 'OPEN' ? 'Đang mở' : 'Tạm đóng'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
