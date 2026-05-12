import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';

/* ─── constants ───────────────────────────────────────────────────────────── */
const POLL_INTERVAL = 3000; // 3 giây

const ITEM_STATUS_LABEL = {
  pending:   'Chờ pha',
  preparing: 'Đang pha',
  ready:     'Xong',
  served:    'Đã phục vụ',
};

const ITEM_STATUS_STYLE = {
  pending:   { bg: '#fefce8', color: '#a16207', border: '#fde047', dot: '#eab308' },
  preparing: { bg: '#fff7ed', color: '#c2410c', border: '#fdba74', dot: '#f97316' },
  ready:     { bg: '#f0fdf4', color: '#15803d', border: '#86efac', dot: '#22c55e' },
  served:    { bg: '#f8fafc', color: '#64748b', border: '#e2e8f0', dot: '#94a3b8' },
};

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const elapsed = (dateStr) => {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)  return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}ph`;
  return `${Math.floor(diff / 3600)}h`;
};

/* ─── ItemRow ─────────────────────────────────────────────────────────────── */
function ItemRow({ item, idx, onMarkReady, updating }) {
  const st = ITEM_STATUS_STYLE[item.status] || ITEM_STATUS_STYLE.pending;
  const isUpdating = updating === `${item.orderId}-${item._id}`;
  const isReady    = item.status === 'ready' || item.status === 'served';

  return (
    <tr style={{
      background: isReady ? '#f8fafc' : '#fff',
      transition: 'background .2s',
      opacity: isReady ? 0.65 : 1,
    }}>
      {/* STT */}
      <td style={{ padding: '14px 16px', fontWeight: 700, color: '#94a3b8', fontSize: '.8125rem', width: 48 }}>
        {idx + 1}
      </td>

      {/* Tên món */}
      <td style={{ padding: '14px 16px' }}>
        <div style={{ fontWeight: 700, fontSize: '.9375rem', color: isReady ? '#10b981' : '#1e293b' }}>
          {item.name}
          {item.size && item.size !== 'default' && (
            <span style={{ fontWeight: 500, color: '#94a3b8', fontSize: '.8125rem', marginLeft: 6 }}>({item.size})</span>
          )}
        </div>
        {item.note && (
          <div style={{ marginTop: 3, fontSize: '.75rem', color: '#d97706', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span>📝</span> {item.note}
          </div>
        )}
      </td>

      {/* SL */}
      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '50%', background: '#eef2ff', color: '#6366f1', fontWeight: 800, fontSize: '1rem' }}>
          {item.quantity}
        </span>
      </td>

      {/* Bàn */}
      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
        <span style={{ fontWeight: 700, fontSize: '1rem', color: '#1e293b' }}>
          {item.tableNumber ? `Bàn ${item.tableNumber}` : '🥤 Mang về'}
        </span>
      </td>

      {/* Mã đơn + thời gian */}
      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
        <div style={{ fontFamily: 'monospace', fontSize: '.75rem', color: '#6366f1', fontWeight: 700 }}>{item.orderCode}</div>
        <div style={{ fontSize: '.6875rem', color: '#94a3b8', marginTop: 2 }}>⏱ {elapsed(item.createdAt)}</div>
      </td>

      {/* Trạng thái */}
      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '5px 10px', borderRadius: 20,
          background: st.bg, color: st.color,
          border: `1px solid ${st.border}`,
          fontWeight: 700, fontSize: '.75rem',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: st.dot, flexShrink: 0,
            ...(item.status === 'preparing' ? { animation: 'blink 1s infinite' } : {}) }} />
          {ITEM_STATUS_LABEL[item.status] || item.status}
        </span>
      </td>

      {/* Action */}
      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
        {!isReady && (
          <button
            onClick={() => onMarkReady(item.orderId, item._id)}
            disabled={isUpdating}
            style={{
              padding: '8px 16px', borderRadius: 8, border: 'none',
              background: isUpdating ? '#e2e8f0' : '#10b981',
              color: isUpdating ? '#9ca3af' : '#fff',
              fontWeight: 700, fontSize: '.875rem',
              cursor: isUpdating ? 'not-allowed' : 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 6,
              boxShadow: isUpdating ? 'none' : '0 2px 8px rgba(16,185,129,.30)',
              transition: 'all .15s',
            }}>
            {isUpdating
              ? <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #94a3b8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              : '✓ Xong'
            }
          </button>
        )}
        {isReady && (
          <span style={{ color: '#22c55e', fontWeight: 700, fontSize: '.875rem' }}>✓ Đã xong</span>
        )}
      </td>
    </tr>
  );
}

/* ─── MAIN PreparingPage ──────────────────────────────────────────────────── */
export default function PreparingPage() {
  const [allOrders, setAllOrders]   = useState([]); // raw orders từ server
  const [filter, setFilter]         = useState('preparing'); // 'preparing' | 'ready'
  const [updating, setUpdating]     = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [newItemCount, setNewItemCount] = useState(0); // đếm món mới để nhấp nháy
  const [blinking, setBlinking]     = useState(false);
  const prevTotalRef                = useRef(0);
  const [loadingInit, setLoadingInit] = useState(true);

  /* ── fetch orders từ đúng endpoint ── */
  const fetchOrders = useCallback(async () => {
    try {
      // Fetch cả đơn đang làm và đơn đã xong gần đây
      const [activeRes, historyRes] = await Promise.all([
        api.get('/orders/barista'),
        api.get('/orders/barista/history')
      ]);
      
      if (activeRes.data?.success) {
        // Merge active orders and history orders
        const activeOrders = activeRes.data.data || [];
        const historyOrders = historyRes.data?.data || [];
        
        // Remove duplicates if any (just in case)
        const orderMap = new Map();
        [...activeOrders, ...historyOrders].forEach(o => orderMap.set(o._id, o));
        const orders = Array.from(orderMap.values());
        
        setAllOrders(orders);

        // Tổng số item chưa xong
        const total = orders.reduce((s, o) =>
          s + o.items.filter(i => !['ready','served'].includes(i.status)).length, 0
        );

        // Phát hiện item mới → nhấp nháy
        if (total > prevTotalRef.current && prevTotalRef.current !== 0) {
          setBlinking(true);
          setTimeout(() => setBlinking(false), 3000);
        }
        prevTotalRef.current = total;
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('Lỗi fetch đơn hàng barista:', err);
    } finally {
      setLoadingInit(false);
    }
  }, []);

  /* ── polling 3 giây ── */
  useEffect(() => {
    fetchOrders(); // lần đầu
    const iv = setInterval(fetchOrders, POLL_INTERVAL);
    return () => clearInterval(iv);
  }, [fetchOrders]);

  /* ── đánh dấu món xong ── */
  const handleMarkReady = async (orderId, itemId) => {
    const key = `${orderId}-${itemId}`;
    setUpdating(key);
    try {
      // FIX: dùng đúng endpoint PUT /orders/item/:orderId/:itemId
      await api.put(`/orders/item/${orderId}/${itemId}`, { status: 'ready' });
      await fetchOrders(); // refresh ngay
    } catch (err) {
      console.error('Lỗi cập nhật món:', err);
      alert('Cập nhật thất bại, vui lòng thử lại');
    } finally {
      setUpdating(null);
    }
  };

  /* ── flatten items từ orders ── */
  const flatItems = allOrders.flatMap(order =>
    order.items.map(item => ({ ...item, orderId: order._id, orderCode: order.orderCode, tableNumber: order.tableNumber, createdAt: order.createdAt }))
  ).sort((a, b) => {
    // So sánh theo ObjectId (mới nhất lên trên) vì ObjectId chứa thời gian tạo thực tế của từng món
    if (a._id && b._id) {
      return b._id.toString().localeCompare(a._id.toString());
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const itemsPreparing = flatItems.filter(i => ['pending','preparing'].includes(i.status));
  const itemsReady     = flatItems.filter(i => i.status === 'ready');
  const displayItems   = filter === 'preparing' ? itemsPreparing : itemsReady;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #fff7ed 0%, #fef3c7 100%)', fontFamily: 'DM Sans, system-ui, sans-serif' }}>
      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:.3; } }
        @keyframes fadeIn{ from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 20px' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              ☕ Màn Hình Pha Chế
              {blinking && (
                <span style={{ fontSize: '1.25rem', animation: 'blink 0.6s infinite' }}>🔔</span>
              )}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'blink 2s infinite' }} />
              <span style={{ fontSize: '.8125rem', color: '#64748b' }}>
                Tự động cập nhật mỗi {POLL_INTERVAL/1000}s
                {lastUpdate && (
                  <span style={{ marginLeft: 8, color: '#94a3b8' }}>
                    — cập nhật lúc {lastUpdate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Summary badges */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ padding: '10px 18px', borderRadius: 12, background: '#fff7ed', border: '1.5px solid #fdba74', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c2410c', lineHeight: 1 }}>{itemsPreparing.length}</div>
              <div style={{ fontSize: '.6875rem', color: '#c2410c', fontWeight: 600, marginTop: 2 }}>Cần pha</div>
            </div>
            <div style={{ padding: '10px 18px', borderRadius: 12, background: '#f0fdf4', border: '1.5px solid #86efac', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#15803d', lineHeight: 1 }}>{itemsReady.length}</div>
              <div style={{ fontSize: '.6875rem', color: '#15803d', fontWeight: 600, marginTop: 2 }}>Đã xong</div>
            </div>
          </div>
        </div>

        {/* ── Filter tabs ── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {[
            { key: 'preparing', label: `Cần pha (${itemsPreparing.length})`, activeColor: '#ea580c', activeBg: '#fff7ed', activeBorder: '#fdba74' },
            { key: 'ready',     label: `Đã xong (${itemsReady.length})`,     activeColor: '#15803d', activeBg: '#f0fdf4', activeBorder: '#86efac' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              style={{
                padding: '10px 22px', borderRadius: 10, fontWeight: 700, fontSize: '.9375rem',
                cursor: 'pointer', transition: 'all .15s', border: '2px solid',
                background:   filter === tab.key ? tab.activeBg     : '#fff',
                color:        filter === tab.key ? tab.activeColor   : '#64748b',
                borderColor:  filter === tab.key ? tab.activeBorder  : '#e2e8f0',
                boxShadow:    filter === tab.key ? '0 2px 8px rgba(0,0,0,.08)' : 'none',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Table ── */}
        <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,.08)', overflow: 'hidden', animation: 'fadeIn .25s ease' }}>
          {loadingInit ? (
            /* Skeleton loading */
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <div style={{ width: 40, height: 40, border: '4px solid #fed7aa', borderTopColor: '#ea580c', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 14px' }} />
              <p style={{ color: '#94a3b8', fontSize: '.875rem' }}>Đang tải dữ liệu...</p>
            </div>

          ) : displayItems.length === 0 ? (
            /* Empty state */
            <div style={{ padding: '70px 0', textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', opacity: .25 }}>{filter === 'preparing' ? '☕' : '🎉'}</div>
              <p style={{ marginTop: 14, fontSize: '1rem', fontWeight: 600, color: '#94a3b8' }}>
                {filter === 'preparing' ? 'Không có món nào cần pha chế' : 'Chưa có món nào hoàn thành'}
              </p>
              <p style={{ fontSize: '.8125rem', color: '#94a3b8', marginTop: 4 }}>Hệ thống đang chờ đơn mới...</p>
            </div>

          ) : (
            <>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'linear-gradient(90deg, #ea580c, #dc2626)', color: '#fff' }}>
                      {['#', 'Tên món', 'SL', 'Bàn', 'Mã đơn', 'Tình trạng', 'Thao tác'].map(h => (
                        <th key={h} style={{ padding: '14px 16px', textAlign: h === '#' || h === 'SL' || h === 'Bàn' || h === 'Mã đơn' || h === 'Tình trạng' || h === 'Thao tác' ? 'center' : 'left', fontWeight: 700, fontSize: '.875rem', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody style={{ borderTop: '2px solid #f1f5f9' }}>
                    {displayItems.map((item, idx) => (
                      <ItemRow
                        key={`${item.orderId}-${item._id}-${idx}`}
                        item={item}
                        idx={idx}
                        onMarkReady={handleMarkReady}
                        updating={updating}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1.5px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '.8125rem', color: '#64748b' }}>
                <span>Tổng: <strong style={{ color: '#1e293b' }}>{displayItems.length}</strong> món</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'blink 2s infinite' }} />
                  Polling mỗi {POLL_INTERVAL/1000}s
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}