import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
const shortFmt = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'tr';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
  return n;
};

/* ══════════════════════════════════════════
   TAB: Dashboard
══════════════════════════════════════════ */
function DashboardTab() {
  const [stats, setStats] = useState({
    totalRevenue: 0, totalOrders: 0,
    dateRevenue: 0, dateOrders: 0,
    avgOrderValue: 0, occupiedTables: 0, availableTables: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'chart_day' | 'chart_week'
  const [chartDataDay, setChartDataDay] = useState([]);
  const [chartDataWeek, setChartDataWeek] = useState([]);

  const fetchStats = useCallback(async () => {
    try {
      const [allRes, dateRes, tablesRes] = await Promise.all([
        api.get('/orders?limit=1000&status=paid'),
        api.get(`/orders?limit=500&status=paid&date=${selectedDate}`),
        api.get('/tables'),
      ]);

      const allPaid   = allRes.data.data   || [];
      const datePaid  = dateRes.data.data  || [];
      const tables    = tablesRes.data.data || [];

      const totalRevenue = allPaid.reduce((s, o) => s + (o.total || 0), 0);
      const dateRevenue = datePaid.reduce((s, o) => s + (o.total || 0), 0);

      setStats({
        totalRevenue,
        totalOrders: allPaid.length,
        dateRevenue,
        dateOrders: datePaid.length,
        avgOrderValue: allPaid.length > 0 ? Math.round(totalRevenue / allPaid.length) : 0,
        occupiedTables:  tables.filter(t => t.status === 'occupied').length,
        availableTables: tables.filter(t => t.status === 'available').length,
      });

      // 1. Dữ liệu biểu đồ trong ngày (00:00 -> 23:59)
      const dayData = Array.from({ length: 24 }, (_, i) => ({
        name: `${i}h`,
        revenue: 0,
      }));
      datePaid.forEach(o => {
        const h = new Date(o.createdAt).getHours();
        if (h >= 0 && h < 24) dayData[h].revenue += (o.total || 0);
      });
      setChartDataDay(dayData);

      // 2. Dữ liệu biểu đồ trong tuần (T2 -> CN chứa selectedDate)
      const dateObj = new Date(selectedDate);
      const dayOfWeek = dateObj.getDay(); // 0 is Sunday
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(dateObj);
      monday.setDate(dateObj.getDate() + diffToMonday);
      
      const weekData = [];
      const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const dateStr = d.toISOString().split('T')[0];
        weekData.push({ date: dateStr, name: dayNames[i], revenue: 0 });
      }
      
      allPaid.forEach(o => {
        const oDate = new Date(o.createdAt).toISOString().split('T')[0];
        const wDay = weekData.find(d => d.date === oDate);
        if (wDay) wDay.revenue += (o.total || 0);
      });
      setChartDataWeek(weekData);

    } catch {
      toast.error('Không tải được thống kê');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchStats();
    const iv = setInterval(fetchStats, 10000);
    return () => clearInterval(iv);
  }, [fetchStats]);

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Đang tải...</div>;

  const cards = [
    { label: 'Doanh thu trong ngày', value: fmt(stats.dateRevenue),   icon: '💰', bg: '#f0fdf4', border: '#86efac', color: '#15803d' },
    { label: 'Đơn trong ngày',       value: stats.dateOrders,          icon: '📋', bg: '#eff6ff', border: '#93c5fd', color: '#1e40af' },
    { label: 'Doanh thu tổng',       value: fmt(stats.totalRevenue),    icon: '📊', bg: '#faf5ff', border: '#d8b4fe', color: '#6b21a8' },
    { label: 'Trung bình/đơn',       value: fmt(stats.avgOrderValue),   icon: '📈', bg: '#fff7ed', border: '#fdba74', color: '#c2410c' },
    { label: 'Bàn đang dùng',        value: stats.occupiedTables,        icon: '🪑', bg: '#fef2f2', border: '#fca5a5', color: '#be123c' },
    { label: 'Bàn trống',            value: stats.availableTables,       icon: '✓',  bg: '#f0fdf4', border: '#86efac', color: '#15803d' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setViewMode('cards')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: viewMode === 'cards' ? '#6366f1' : '#f1f5f9', color: viewMode === 'cards' ? '#fff' : '#64748b', fontWeight: 600, cursor: 'pointer' }}>Số liệu</button>
          <button onClick={() => setViewMode('chart_day')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: viewMode === 'chart_day' ? '#6366f1' : '#f1f5f9', color: viewMode === 'chart_day' ? '#fff' : '#64748b', fontWeight: 600, cursor: 'pointer' }}>Biểu đồ Ngày</button>
          <button onClick={() => setViewMode('chart_week')} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: viewMode === 'chart_week' ? '#6366f1' : '#f1f5f9', color: viewMode === 'chart_week' ? '#fff' : '#64748b', fontWeight: 600, cursor: 'pointer' }}>Biểu đồ Tuần</button>
        </div>
        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)} 
          style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '.875rem', fontWeight: 600, color: '#475569', outline: 'none' }}
        />
      </div>

      {viewMode === 'cards' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))', gap: 20 }}>
          {cards.map((c, i) => (
            <div key={i} style={{ background: c.bg, border: `2px solid ${c.border}`, borderRadius: 12, padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: '.8125rem', color: c.color, opacity: .75, fontWeight: 600, margin: 0 }}>{c.label}</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: c.color, marginTop: 8, marginBottom: 0 }}>{c.value}</p>
                </div>
                <span style={{ fontSize: '2rem', opacity: .25 }}>{c.icon}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ height: 400, width: '100%', background: '#fff', padding: '30px 20px', borderRadius: 12, border: '2px solid #e2e8f0' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={viewMode === 'chart_day' ? chartDataDay : chartDataWeek} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
              <YAxis hide />
              <Tooltip formatter={(value) => [fmt(value), 'Doanh thu']} cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={60}>
                <LabelList dataKey="revenue" position="top" formatter={(val) => val > 0 ? shortFmt(val) : ''} style={{ fill: '#6366f1', fontSize: 12, fontWeight: 700 }} dy={-5} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   TAB: Orders
══════════════════════════════════════════ */
function OrdersTab() {
  const auth = useAuth();
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [paying, setPaying]             = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get(`/orders?limit=200&date=${selectedDate}`);
      setOrders(res.data.data || []);
    } catch {
      toast.error('Không tải được đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchOrders();
    const iv = setInterval(fetchOrders, 8000);
    return () => clearInterval(iv);
  }, [fetchOrders]);

  /* ── Thanh toán ─────────────────────────────────────────────── */
  const handlePayment = async (orderId) => {
    if (paying) return;
    setPaying(orderId);
    try {
      const order = orders.find(o => o._id === orderId);
      if (!order) {
        toast.error('Không tìm thấy đơn hàng');
        return;
      }
      if (order.status === 'paid') {
        toast.error('Đơn hàng này đã thanh toán rồi');
        return;
      }
      if (order.status === 'cancelled') {
        toast.error('Không thể thanh toán đơn hàng đã bị hủy');
        return;
      }
      
      console.log('🔵 Thanh toán:', { orderId, orderStatus: order.status, user: auth.user });
      
      const response = await api.patch(`/orders/${orderId}/status`, { status: 'paid' });
      if (!response.data.success) {
        toast.error(response.data.message || 'Lỗi thanh toán');
        console.error('Payment error:', response.data);
        return;
      }
      
      toast.success('✓ Thanh toán thành công');
      // Cập nhật local state ngay — không chờ refetch
      setOrders(prev => prev.map(o =>
        o._id === orderId ? { ...o, status: 'paid', paymentStatus: 'paid', paidAt: new Date().toISOString() } : o
      ));
      // Nếu đang xem chi tiết đơn này thì đóng lại
      if (selectedOrder?._id === orderId) setSelectedOrder(null);
      // Refetch để đồng bộ với server
      fetchOrders();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Lỗi thanh toán';
      console.error('Payment error details:', {
        status: err.response?.status,
        message: errorMsg,
        fullError: err.response?.data,
        userRole: auth.user?.role
      });
      toast.error(errorMsg);
    } finally {
      setPaying(null);
    }
  };

  const handlePrint = (order) => {
    const win = window.open('', '', 'width=400,height=600');
    win.document.write(`<pre style="font-family:monospace;padding:20px">
====================================
        HÓA ĐƠN BÁN HÀNG
====================================
Mã đơn : ${order.orderCode}
Bàn    : ${order.table?.name || (order.table?.number ? `Bàn ${order.table.number}` : 'N/A')}
Ngày   : ${new Date(order.createdAt).toLocaleString('vi-VN')}
Phục vụ: ${order.servedBy?.name || 'N/A'}
────────────────────────────────────
${(order.items || []).map(i =>
  `${i.name}${i.size && i.size !== 'default' ? ` (${i.size})` : ''} × ${i.quantity}\n  → ${fmt(i.price * i.quantity)}`
).join('\n')}
────────────────────────────────────
Tạm tính : ${fmt(order.subtotal || order.total || 0)}
${order.discount > 0 ? `Giảm giá : -${fmt(order.discount)}\n` : ''}TỔNG CỘNG: ${fmt(order.total || 0)}
====================================
    </pre>`);
    win.document.close();
    win.print();
  };

  const STATUS_CFG = {
    pending:   { label: 'Chờ xác nhận', bg: '#fef3c7', text: '#92400e' },
    confirmed: { label: 'Đã xác nhận',  bg: '#dbeafe', text: '#1e40af' },
    preparing: { label: 'Đang pha chế', bg: '#fce7f3', text: '#831843' },
    ready:     { label: 'Sẵn sàng',     bg: '#dcfce7', text: '#15803d' },
    served:    { label: 'Đã phục vụ',   bg: '#e0e7ff', text: '#3f0f64' },
    paid:      { label: 'Đã thanh toán',bg: '#d1fae5', text: '#065f46' },
    cancelled: { label: 'Đã hủy',       bg: '#fee2e2', text: '#7f1d1d' },
  };

  // FIX: tính count đúng — filter buttons dùng đúng orders gốc
  const countOf = (s) => {
    if (s === 'all') return orders.length;
    if (s === 'unpaid') return orders.filter(o => o.status !== 'paid' && o.status !== 'cancelled').length;
    return orders.filter(o => o.status === s).length;
  };
  const displayOrders = orders.filter(o => {
    if (filter === 'all') return true;
    if (filter === 'unpaid') return o.status !== 'paid' && o.status !== 'cancelled';
    return o.status === filter;
  });

  const FILTER_OPTIONS = [
    { key: 'all', label: 'Tất cả', bg: '#6366f1', text: '#fff' },
    { key: 'unpaid', label: 'Chưa thanh toán', bg: '#fef3c7', text: '#92400e' },
    { key: 'paid', label: 'Đã thanh toán', bg: '#d1fae5', text: '#065f46' },
    { key: 'cancelled', label: 'Đã hủy', bg: '#fee2e2', text: '#7f1d1d' },
  ];

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Đang tải...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Top Bar: Filters & Date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        {/* Filter buttons */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {FILTER_OPTIONS.map(opt => {
            const isActive = filter === opt.key;
            const count = countOf(opt.key);
            return (
              <button key={opt.key} onClick={() => setFilter(opt.key)}
                style={{
                  padding: '7px 14px', borderRadius: 8, fontSize: '.8125rem', fontWeight: 700,
                  cursor: 'pointer', border: isActive ? 'none' : '1.5px solid #e2e8f0',
                  background: isActive ? opt.bg : '#fff',
                  color:      isActive ? opt.text : '#64748b',
                  boxShadow:  isActive ? '0 2px 8px rgba(0,0,0,.10)' : 'none',
                  transition: 'all .12s',
                }}>
                {opt.label} ({count})
              </button>
            );
          })}
        </div>

        <input 
          type="date" 
          value={selectedDate} 
          onChange={(e) => setSelectedDate(e.target.value)} 
          style={{ padding: '8px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: '.875rem', fontWeight: 600, color: '#475569', outline: 'none' }}
        />
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #f1f5f9', overflow: 'hidden' }}>
        {displayOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: '2.5rem', opacity: .25 }}>📋</div>
            <p style={{ marginTop: 12, fontWeight: 500 }}>Không có đơn hàng</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8fafc', borderBottom: '2px solid #f1f5f9' }}>
                <tr>
                  {['Mã đơn','Bàn','Trạng thái','Tổng tiền','Giờ tạo','Thao tác'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: h === 'Tổng tiền' ? 'right' : h === 'Thao tác' ? 'center' : 'left', fontSize: '.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayOrders.map(order => {
                  const st = STATUS_CFG[order.status] || STATUS_CFG.pending;
                  const isSel = selectedOrder?._id === order._id;
                  return (
                    <>
                      <tr key={order._id}
                        style={{ borderBottom: '1px solid #f1f5f9', background: isSel ? '#f8f9ff' : '#fff', transition: 'background .1s' }}
                        onMouseEnter={e => { if (!isSel) e.currentTarget.style.background = '#fafafa'; }}
                        onMouseLeave={e => { if (!isSel) e.currentTarget.style.background = '#fff'; }}>

                        <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 700, color: '#6366f1', fontSize: '.8125rem' }}>
                          {order.orderCode}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: '#f1f5f9', padding: '3px 10px', borderRadius: 20, fontSize: '.75rem', fontWeight: 600, color: '#475569' }}>
                            {order.table?.name || (order.table?.number ? `Bàn ${order.table.number}` : '🥤 Mang về')}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ background: st.bg, color: st.text, padding: '4px 10px', borderRadius: 20, fontSize: '.75rem', fontWeight: 700 }}>
                            {st.label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 800, color: '#ea580c', fontFamily: 'monospace' }}>
                          {fmt(order.total || 0)}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: '.75rem', color: '#94a3b8', whiteSpace: 'nowrap' }}>
                          {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', alignItems: 'center' }}>
                            {/* Xem / Thu gọn */}
                            <button onClick={() => setSelectedOrder(isSel ? null : order)}
                              style={{ padding: '5px 10px', borderRadius: 6, background: isSel ? '#eef2ff' : '#f1f5f9', color: isSel ? '#6366f1' : '#64748b', fontWeight: 600, fontSize: '.75rem', border: 'none', cursor: 'pointer' }}>
                              {isSel ? '▼ Gọn' : '▶ Xem'}
                            </button>

                            {/* Thanh toán */}
                            {order.status !== 'paid' && order.status !== 'cancelled' && (
                              <button
                                onClick={() => handlePayment(order._id)}
                                disabled={paying === order._id}
                                style={{
                                  padding: '5px 12px', borderRadius: 6, border: 'none',
                                  background: paying === order._id ? '#e2e8f0' : '#10b981',
                                  color: paying === order._id ? '#9ca3af' : '#fff',
                                  fontWeight: 700, fontSize: '.75rem',
                                  cursor: paying === order._id ? 'not-allowed' : 'pointer',
                                  display: 'flex', alignItems: 'center', gap: 4,
                                  boxShadow: paying === order._id ? 'none' : '0 2px 6px rgba(16,185,129,.25)',
                                }}>
                                {paying === order._id
                                  ? <span style={{ width: 12, height: 12, border: '2px solid #94a3b8', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                                  : '💰 Thanh toán'
                                }
                              </button>
                            )}

                            {/* In */}
                            <button onClick={() => handlePrint(order)}
                              style={{ padding: '5px 10px', borderRadius: 6, background: '#f1f5f9', color: '#64748b', fontWeight: 600, fontSize: '.75rem', border: 'none', cursor: 'pointer' }}>
                              🖨
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded detail row */}
                      {isSel && (
                        <tr key={`${order._id}-detail`}>
                          <td colSpan={6} style={{ padding: '0 16px 16px', background: '#f8f9ff' }}>
                            <div style={{ background: '#fff', border: '1.5px solid #c7d2fe', borderRadius: 12, padding: '20px 24px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div>
                                  <h3 style={{ fontFamily: 'monospace', fontWeight: 800, color: '#6366f1', fontSize: '1rem', margin: 0 }}>{order.orderCode}</h3>
                                  <p style={{ fontSize: '.8125rem', color: '#64748b', marginTop: 4 }}>
                                    {order.table?.name || (order.table?.number ? `Bàn ${order.table.number}` : '🥤 Mang về')}
                                    {order.servedBy?.name && <span style={{ marginLeft: 8 }}>· Phục vụ: {order.servedBy.name}</span>}
                                  </p>
                                </div>
                                <button onClick={() => setSelectedOrder(null)}
                                  style={{ width: 28, height: 28, borderRadius: 8, background: '#f1f5f9', border: 'none', cursor: 'pointer', fontSize: '.875rem', color: '#94a3b8' }}>✕</button>
                              </div>

                              {/* Items */}
                              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, marginBottom: 12 }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem' }}>
                                  <thead>
                                    <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                                      <th style={{ padding: '8px 0', textAlign: 'center', width: '50px', fontWeight: 600 }}>STT</th>
                                      <th style={{ padding: '8px 0', textAlign: 'left', fontWeight: 600 }}>Tên món</th>
                                      <th style={{ padding: '8px 0', textAlign: 'center', width: '60px', fontWeight: 600 }}>SL</th>
                                      <th style={{ padding: '8px 0', textAlign: 'right', width: '100px', fontWeight: 600 }}>Thành tiền</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(order.items || []).map((item, i) => (
                                      <tr key={i} style={{ borderBottom: '1px dashed #f1f5f9' }}>
                                        <td style={{ padding: '8px 0', textAlign: 'center', color: '#64748b' }}>{i + 1}</td>
                                        <td style={{ padding: '8px 0', color: '#1e293b', fontWeight: 600 }}>
                                          {item.name}
                                          {item.size && item.size !== 'default' && <span style={{ color: '#94a3b8', fontWeight: 400, marginLeft: 4 }}>({item.size})</span>}
                                        </td>
                                        <td style={{ padding: '8px 0', textAlign: 'center', color: '#1e293b', fontWeight: 600 }}>{item.quantity}</td>
                                        <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 700, color: '#1e293b' }}>{fmt(item.price * item.quantity)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Totals */}
                              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {order.discount > 0 && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.875rem', color: '#64748b' }}>
                                    <span>Giảm giá</span><span style={{ color: '#ef4444' }}>-{fmt(order.discount)}</span>
                                  </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.125rem' }}>
                                  <span style={{ color: '#1e293b' }}>TỔNG CỘNG</span>
                                  <span style={{ color: '#ea580c', fontFamily: 'monospace' }}>{fmt(order.total || 0)}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN AdminPage
══════════════════════════════════════════ */
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { key: 'dashboard', label: '📊 Tổng quan',  Component: DashboardTab },
    { key: 'orders',    label: '📋 Đơn hàng',   Component: OrdersTab },
  ];

  const active = tabs.find(t => t.key === activeTab);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 4, fontFamily: 'DM Sans, system-ui, sans-serif' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 6, background: '#fff', borderRadius: 12, padding: 6, boxShadow: '0 1px 6px rgba(0,0,0,.08)', flexWrap: 'wrap' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{
              padding: '8px 20px', borderRadius: 8, fontSize: '.875rem', fontWeight: 700,
              cursor: 'pointer', border: 'none', transition: 'all .12s',
              background: activeTab === t.key ? '#6366f1' : 'transparent',
              color:      activeTab === t.key ? '#fff' : '#64748b',
              boxShadow:  activeTab === t.key ? '0 2px 8px rgba(99,102,241,.30)' : 'none',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '24px', boxShadow: '0 1px 6px rgba(0,0,0,.08)' }}>
        {active && <active.Component />}
      </div>
    </div>
  );
}