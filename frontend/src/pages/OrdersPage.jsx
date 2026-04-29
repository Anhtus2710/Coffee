import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

export default function OrdersPage() {
  const auth = useAuth();
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');
  const [paying, setPaying]             = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.get('/orders?limit=200');
      setOrders(res.data.data || []);
    } catch {
      toast.error('Không tải được đơn hàng');
    } finally {
      setLoading(false);
    }
  }, []);

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
  const countOf = (s) => s === 'all' ? orders.length : orders.filter(o => o.status === s).length;
  const displayOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) return <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Đang tải...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '24px', background: '#fff', borderRadius: 12, boxShadow: '0 1px 6px rgba(0,0,0,.08)' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>📋 Đơn hàng</h2>
      
      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['all','pending','confirmed','preparing','ready','served','paid','cancelled'].map(s => {
          const cfg = STATUS_CFG[s];
          const isActive = filter === s;
          const count = countOf(s);
          return (
            <button key={s} onClick={() => setFilter(s)}
              style={{
                padding: '7px 14px', borderRadius: 8, fontSize: '.8125rem', fontWeight: 700,
                cursor: 'pointer', border: isActive ? 'none' : '1.5px solid #e2e8f0',
                background: isActive ? (cfg?.bg || '#6366f1') : '#fff',
                color:      isActive ? (cfg?.text || '#fff') : '#64748b',
                boxShadow:  isActive ? '0 2px 8px rgba(0,0,0,.10)' : 'none',
                transition: 'all .12s',
              }}>
              {s === 'all' ? 'Tất cả' : cfg?.label} ({count})
            </button>
          );
        })}
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
                    <React.Fragment key={order._id}>
                      <tr
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
                                {(order.items || []).map((item, i) => (
                                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '.875rem' }}>
                                    <span style={{ color: '#1e293b' }}>
                                      {item.name}
                                      {item.size && item.size !== 'default' && <span style={{ color: '#94a3b8' }}> ({item.size})</span>}
                                      <span style={{ color: '#94a3b8' }}> × {item.quantity}</span>
                                    </span>
                                    <span style={{ fontWeight: 700, color: '#1e293b' }}>{fmt(item.price * item.quantity)}</span>
                                  </div>
                                ))}
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

                              {/* Action buttons */}
                              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                                {order.status !== 'paid' && order.status !== 'cancelled' && (
                                  <button
                                    onClick={() => handlePayment(order._id)}
                                    disabled={paying === order._id}
                                    style={{
                                      flex: 1, padding: '12px 0', borderRadius: 10, border: 'none',
                                      background: paying === order._id ? '#e2e8f0' : '#10b981',
                                      color: paying === order._id ? '#9ca3af' : '#fff',
                                      fontWeight: 800, fontSize: '1rem',
                                      cursor: paying === order._id ? 'not-allowed' : 'pointer',
                                      boxShadow: paying === order._id ? 'none' : '0 4px 12px rgba(16,185,129,.30)',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    }}>
                                    {paying === order._id
                                      ? <><span style={{ width: 16, height: 16, border: '2px solid #94a3b8', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} /> Đang xử lý...</>
                                      : `💰 Thanh toán ${fmt(order.total || 0)}`
                                    }
                                  </button>
                                )}
                                <button onClick={() => handlePrint(order)}
                                  style={{ padding: '12px 20px', borderRadius: 10, background: '#f1f5f9', color: '#64748b', fontWeight: 700, fontSize: '.875rem', border: '1.5px solid #e2e8f0', cursor: 'pointer' }}>
                                  🖨 In
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
