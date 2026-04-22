import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
const IMG_BASE = 'http://localhost:5000';

const ZONE_LABELS = { indoor:'Trong nhà', outdoor:'Ngoài trời', vip:'VIP', bar:'Bar' };
const ZONE_ICONS  = { indoor:'🏠', outdoor:'🌿', vip:'👑', bar:'🍸' };

const STATUS = {
  available:{ label:'Trống',          dot:'#22c55e', card:'#f0fdf4', border:'#86efac', text:'#15803d' },
  occupied: { label:'Đang dùng',      dot:'#f97316', card:'#fff7ed', border:'#fdba74', text:'#c2410c' },
  reserved: { label:'Đặt trước',      dot:'#eab308', card:'#fefce8', border:'#fde047', text:'#a16207' },
  cleaning: { label:'Đang dọn',       dot:'#a855f7', card:'#faf5ff', border:'#d8b4fe', text:'#7e22ce' },
};

/* ─── ProductCard (trong menu chọn món) ───────────────────────────────────── */
function ProductCard({ product, onAdd }) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div
      onClick={() => product.isAvailable ? onAdd(product) : toast.error('Món đang hết')}
      style={{
        borderRadius: 12, overflow: 'hidden', cursor: product.isAvailable ? 'pointer' : 'not-allowed',
        border: '1.5px solid #e2e8f0', background: '#fff',
        opacity: product.isAvailable ? 1 : 0.45,
        transition: 'all .15s', boxShadow: '0 1px 4px rgba(0,0,0,.06)',
      }}
      onMouseEnter={e => { if (product.isAvailable) e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,.18)'; e.currentTarget.style.borderColor = '#a5b4fc'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,.06)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
    >
      {/* Image */}
      <div style={{ height: 80, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {product.image && !imgErr
          ? <img src={getProductImageUrl(product)} alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={() => setImgErr(true)} />
          : <span style={{ fontSize: '1.75rem', color: '#cbd5e1' }}>{product.category?.icon || '☕'}</span>
        }
      </div>
      <div style={{ padding: '8px 10px' }}>
        <p style={{ fontWeight: 600, fontSize: '.75rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</p>
        <p style={{ fontWeight: 700, fontSize: '.8125rem', color: '#6366f1', marginTop: 2 }}>{fmt(product.price)}</p>
      </div>
    </div>
  );
}

/* ─── OrderLine (bên panel phải) ──────────────────────────────────────────── */
function OrderLine({ item, onQty, onRemove }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', background: '#fff', border: '1px solid #f1f5f9', borderRadius: 10, marginBottom: 6 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: '.8125rem', color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.name}
          {item.size && item.size !== 'default' && <span style={{ color: '#94a3b8', fontWeight: 400 }}> ({item.size})</span>}
        </p>
        <p style={{ fontSize: '.6875rem', color: '#94a3b8', marginTop: 1 }}>{fmt(item.price)} / cái</p>
      </div>
      {/* qty controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button onClick={() => onQty(item.key, -1)}
          style={{ width: 22, height: 22, borderRadius: 6, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', fontSize: '.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
        <span style={{ width: 20, textAlign: 'center', fontWeight: 700, fontSize: '.8125rem', color: '#1e293b' }}>{item.quantity}</span>
        <button onClick={() => onQty(item.key, +1)}
          style={{ width: 22, height: 22, borderRadius: 6, background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer', fontSize: '.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
      </div>
      <span style={{ minWidth: 68, textAlign: 'right', fontWeight: 700, fontSize: '.8125rem', color: '#ea580c' }}>{fmt(item.price * item.quantity)}</span>
      <button onClick={() => onRemove(item.key)}
        style={{ width: 22, height: 22, borderRadius: 6, background: '#fee2e2', border: '1px solid #fecaca', color: '#ef4444', cursor: 'pointer', fontSize: '.6875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
    </div>
  );
}

/* ─── InvoiceLine (bàn đã có đơn) ─────────────────────────────────────────── */
function InvoiceLine({ item }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#fafafa', border: '1px solid #f1f5f9', borderRadius: 8, marginBottom: 5 }}>
      <div style={{ flex: 1 }}>
        <span style={{ fontSize: '.8125rem', color: '#1e293b', fontWeight: 500 }}>{item.name}</span>
        {item.size && item.size !== 'default' && <span style={{ color: '#94a3b8', fontSize: '.75rem' }}> ({item.size})</span>}
        {item.note && <p style={{ fontSize: '.6875rem', color: '#d97706', marginTop: 1 }}>📝 {item.note}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, marginLeft: 8 }}>
        <span style={{ fontSize: '.75rem', color: '#94a3b8' }}>×{item.quantity}</span>
        <span style={{ fontWeight: 700, fontSize: '.8125rem', color: '#ea580c', minWidth: 70, textAlign: 'right' }}>{fmt(item.price * item.quantity)}</span>
      </div>
    </div>
  );
}

/* ─── SUCCESS overlay ─────────────────────────────────────────────────────── */
function SuccessOverlay({ order, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 24, padding: '44px 52px', textAlign: 'center', boxShadow: '0 25px 60px rgba(0,0,0,.22)', maxWidth: 380, width: '100%' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#ecfdf5', border: '2.5px solid #10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '2rem' }}>✓</div>
        <h2 style={{ color: '#10b981', fontWeight: 800, fontSize: '1.5rem', marginBottom: 8 }}>Đặt món thành công!</h2>
        <p style={{ color: '#6366f1', fontWeight: 800, fontSize: '1.375rem', fontFamily: 'monospace' }}>{order.orderCode}</p>
        <p style={{ color: '#6366f1', fontWeight: 700, fontSize: '1.125rem', margin: '6px 0 28px' }}>{fmt(order.total)}</p>
        <button onClick={onClose} style={{ padding: '12px 36px', borderRadius: 12, background: '#6366f1', color: '#fff', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px rgba(99,102,241,.30)' }}>
          Tiếp tục
        </button>
      </div>
    </div>
  );
}

/* ─── MAIN ────────────────────────────────────────────────────────────────── */
export default function WaiterPage() {
  const [tables, setTables]         = useState([]);
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);

  const [selectedTable, setSelectedTable]   = useState(null);  // bàn đang chọn
  const [existingOrder, setExistingOrder]   = useState(null);  // đơn hiện có của bàn
  const [loadingOrder, setLoadingOrder]     = useState(false);

  // cart — chỉ dùng khi bàn trống
  const [cart, setCart]       = useState([]);
  const [activeCat, setActiveCat] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [saving, setSaving]         = useState(false);
  const [success, setSuccess]       = useState(null);

  /* fetch all data */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, pRes, cRes] = await Promise.all([
        api.get('/tables'),
        api.get('/menu?available=true&limit=200'),
        api.get('/categories'),
      ]);
      setTables(tRes.data.data);
      setProducts(pRes.data.data);
      setCategories(cRes.data.data);
    } catch { toast.error('Không tải được dữ liệu'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  /* polling bàn mỗi 8s */
  useEffect(() => {
    const iv = setInterval(async () => {
      try {
        const res = await api.get('/tables');
        setTables(res.data.data);
      } catch {}
    }, 8000);
    return () => clearInterval(iv);
  }, []);

  /* khi chọn bàn — load đơn hiện tại nếu có */
  const handleSelectTable = async (table) => {
    if (selectedTable?._id === table._id) return;
    setSelectedTable(table);
    setCart([]);
    setActiveCat('');
    setSearchTerm('');
    setExistingOrder(null);

    if (table.status !== 'available' && table.currentOrder) {
      setLoadingOrder(true);
      try {
        const res = await api.get(`/orders/${table.currentOrder._id || table.currentOrder}`);
        setExistingOrder(res.data.data);
      } catch { toast.error('Không tải được đơn hàng'); }
      finally { setLoadingOrder(false); }
    }
  };

  /* cart helpers */
  const addToCart = (product) => {
    const key = product._id;
    setCart(prev => {
      const ex = prev.find(i => i.key === key);
      if (ex) return prev.map(i => i.key === key ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { key, productId: product._id, name: product.name, price: product.price, quantity: 1, size: 'default', note: '' }];
    });
  };
  const changeQty = (key, delta) =>
    setCart(prev => prev.map(i => i.key === key ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  const removeItem = (key) => setCart(prev => prev.filter(i => i.key !== key));

  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  /* confirm new order */
  const handleConfirm = async () => {
    if (cart.length === 0) { toast.error('Chưa chọn món nào'); return; }
    setSaving(true);
    try {
      const res = await api.post('/orders', {
        table: selectedTable._id,
        orderType: 'dine-in',
        items: cart.map(i => ({ product: i.productId, name: i.name, price: i.price, quantity: i.quantity, size: i.size, note: i.note })),
        paymentMethod: 'cash',
      });
      setCart([]);
      setSuccess(res.data.data);
      await fetchData();
      // reload order cho bàn vừa tạo
      const tRes = await api.get('/tables');
      setTables(tRes.data.data);
      const updatedTable = tRes.data.data.find(t => t._id === selectedTable._id);
      if (updatedTable) {
        setSelectedTable(updatedTable);
        if (updatedTable.currentOrder) {
          const oRes = await api.get(`/orders/${updatedTable.currentOrder._id || updatedTable.currentOrder}`);
          setExistingOrder(oRes.data.data);
        }
      }
      toast.success(`✓ Đã tạo đơn ${res.data.data.orderCode}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi tạo đơn');
    } finally { setSaving(false); }
  };

  /* filtered menu */
  const menuItems = products.filter(p => {
    const matchCat  = !activeCat || p.category?._id === activeCat || p.category === activeCat;
    const matchSrch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSrch;
  });

  /* group tables by zone */
  const tablesByZone = tables.reduce((acc, t) => {
    (acc[t.zone] = acc[t.zone] || []).push(t);
    return acc;
  }, {});

  const isAvailable = selectedTable?.status === 'available';

  /* ────────────────── RENDER ────────────────── */
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc', fontFamily: 'DM Sans, system-ui, sans-serif' }}>

      {/* ══════════════════════════════════════
          CỘT TRÁI — 80% — Danh sách bàn
          khi bàn trống → hiện menu chọn món
      ══════════════════════════════════════ */}
      <div style={{ flex: 8, minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1.5px solid #e2e8f0' }}>

        {/* Top bar */}
        <div style={{ padding: '14px 20px 12px', background: '#fff', borderBottom: '1.5px solid #f1f5f9', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div>
            <h1 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>
              {selectedTable
                ? (isAvailable ? `📋 Chọn món cho ${selectedTable.name || `Bàn ${selectedTable.number}`}` : `🪑 ${selectedTable.name || `Bàn ${selectedTable.number}`} — đang có khách`)
                : '🍽 Sơ đồ bàn'
              }
            </h1>
            <p style={{ fontSize: '.6875rem', color: '#94a3b8', margin: '2px 0 0' }}>
              {tables.filter(t=>t.status==='occupied').length} đang dùng &nbsp;·&nbsp; {tables.filter(t=>t.status==='available').length} trống &nbsp;·&nbsp; Cập nhật mỗi 8s
            </p>
          </div>

          {/* search + cat filter — chỉ hiện khi bàn trống */}
          {selectedTable && isAvailable && (
            <div style={{ display: 'flex', gap: 8, flex: 1, marginLeft: 8 }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: 240 }}>
                <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '.875rem' }}>🔍</span>
                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Tìm món..."
                  style={{ width: '100%', padding: '7px 10px 7px 30px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '.8125rem', color: '#1e293b', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', gap: 5, overflowX: 'auto' }}>
                <button onClick={() => setActiveCat('')}
                  style={{ padding: '6px 12px', borderRadius: 8, fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, background: !activeCat ? '#6366f1' : '#f1f5f9', color: !activeCat ? '#fff' : '#64748b', border: 'none' }}>
                  Tất cả
                </button>
                {categories.map(c => (
                  <button key={c._id} onClick={() => setActiveCat(activeCat === c._id ? '' : c._id)}
                    style={{ padding: '6px 12px', borderRadius: 8, fontSize: '.75rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, background: activeCat === c._id ? '#6366f1' : '#f1f5f9', color: activeCat === c._id ? '#fff' : '#64748b', border: 'none' }}>
                    {c.icon} {c.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Body — 2 trạng thái */}
        <div style={{ flex: 1, overflow: 'auto', padding: 20 }}>
          {!selectedTable || !isAvailable ? (
            /* ── SƠ ĐỒ BÀN ── */
            loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
                {[...Array(15)].map((_,i) => <div key={i} style={{ height: 96, borderRadius: 12, background: '#e2e8f0', animation: 'pulse 1.5s infinite' }} />)}
              </div>
            ) : (
              Object.entries(tablesByZone).map(([zone, zoneTables]) => (
                <div key={zone} style={{ marginBottom: 24 }}>
                  {/* Zone header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: '1rem' }}>{ZONE_ICONS[zone] || '📍'}</span>
                    <span style={{ fontWeight: 700, fontSize: '.8125rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                      {ZONE_LABELS[zone] || zone}
                    </span>
                    <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                    <span style={{ fontSize: '.6875rem', color: '#94a3b8' }}>{zoneTables.length} bàn</span>
                  </div>

                  {/* Table cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
                    {zoneTables.map(table => {
                      const st = STATUS[table.status] || STATUS.available;
                      const isSel = selectedTable?._id === table._id;
                      return (
                        <button key={table._id} onClick={() => handleSelectTable(table)}
                          style={{
                            padding: '14px 8px 12px', borderRadius: 14, cursor: 'pointer',
                            background: isSel ? '#eef2ff' : st.card,
                            border: isSel ? '2.5px solid #6366f1' : `1.5px solid ${st.border}`,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                            transition: 'all .15s',
                            boxShadow: isSel ? '0 0 0 3px rgba(99,102,241,.15)' : '0 1px 3px rgba(0,0,0,.05)',
                          }}>
                          {/* status dot */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: isSel ? '#6366f1' : st.dot, display: 'inline-block', flexShrink: 0,
                              ...(table.status==='occupied' ? { animation: 'pulse 1.5s infinite' } : {}) }} />
                            <span style={{ fontSize: '.5625rem', fontWeight: 700, color: isSel ? '#6366f1' : st.text, textTransform: 'uppercase', letterSpacing: '.04em' }}>
                              {isSel ? 'Đang chọn' : st.label}
                            </span>
                          </div>
                          {/* table number */}
                          <span style={{ fontWeight: 800, fontSize: '1.0625rem', color: isSel ? '#6366f1' : '#1e293b', lineHeight: 1 }}>
                            {table.name || `Bàn ${table.number}`}
                          </span>
                          {/* capacity */}
                          <span style={{ fontSize: '.5625rem', color: '#94a3b8' }}>👤 {table.capacity}</span>
                          {/* order amount if occupied */}
                          {table.currentOrder?.total > 0 && (
                            <span style={{ fontSize: '.625rem', fontWeight: 700, color: '#ea580c', background: '#fff7ed', padding: '2px 6px', borderRadius: 6 }}>
                              {fmt(table.currentOrder.total)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )
          ) : (
            /* ── MENU CHỌN MÓN (bàn trống) ── */
            <div>
              {menuItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
                  <div style={{ fontSize: '3rem', opacity: .3 }}>☕</div>
                  <p style={{ marginTop: 12 }}>Không tìm thấy món</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
                  {menuItems.map(p => <ProductCard key={p._id} product={p} onAdd={addToCart} />)}
                </div>
              )}

              {/* back to map button */}
              <div style={{ textAlign: 'center', marginTop: 20 }}>
                <button onClick={() => { setSelectedTable(null); setCart([]); }}
                  style={{ padding: '8px 20px', borderRadius: 8, background: '#f1f5f9', color: '#64748b', fontWeight: 600, fontSize: '.8125rem', border: '1.5px solid #e2e8f0', cursor: 'pointer' }}>
                  ← Quay về sơ đồ bàn
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          CỘT PHẢI — 20% — Hóa đơn / Đơn hàng
      ══════════════════════════════════════ */}
      <div style={{ flex: 2, minWidth: 220, maxWidth: 320, display: 'flex', flexDirection: 'column', background: '#fff', overflow: 'hidden' }}>

        {/* Panel header */}
        <div style={{ padding: '14px 16px 12px', borderBottom: '1.5px solid #f1f5f9', flexShrink: 0 }}>
          <h2 style={{ fontWeight: 700, fontSize: '.9375rem', color: '#1e293b', margin: 0 }}>
            {!selectedTable
              ? '🧾 Hóa đơn'
              : isAvailable
                ? `🛒 Đặt món — ${selectedTable.name || `Bàn ${selectedTable.number}`}`
                : `🧾 ${selectedTable.name || `Bàn ${selectedTable.number}`}`
            }
          </h2>
          {selectedTable && (
            <p style={{ fontSize: '.6875rem', color: '#94a3b8', marginTop: 3 }}>
              {ZONE_ICONS[selectedTable.zone]} {ZONE_LABELS[selectedTable.zone]}
              {!isAvailable && existingOrder && <span style={{ marginLeft: 6, fontFamily: 'monospace', color: '#6366f1' }}>{existingOrder.orderCode}</span>}
            </p>
          )}
        </div>

        {/* Items list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px' }}>
          {!selectedTable && (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <div style={{ fontSize: '2.5rem', opacity: .2 }}>🪑</div>
              <p style={{ marginTop: 12, fontSize: '.8125rem', color: '#94a3b8', fontWeight: 500 }}>Chọn bàn để xem</p>
            </div>
          )}

          {/* Bàn trống → hiện cart */}
          {selectedTable && isAvailable && (
            cart.length === 0
              ? <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <div style={{ fontSize: '2.5rem', opacity: .2 }}>🍽</div>
                  <p style={{ marginTop: 10, fontSize: '.8125rem', color: '#94a3b8', fontWeight: 500 }}>Chưa chọn món nào</p>
                  <p style={{ fontSize: '.6875rem', color: '#94a3b8', marginTop: 4 }}>Chọn từ menu bên trái</p>
                </div>
              : cart.map(item => (
                  <OrderLine key={item.key} item={item} onQty={changeQty} onRemove={removeItem} />
                ))
          )}

          {/* Bàn có khách → hiện hóa đơn */}
          {selectedTable && !isAvailable && (
            loadingOrder
              ? <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '.875rem' }}>⟳ Đang tải...</div>
              : existingOrder
                ? <>
                    {/* status badge */}
                    <div style={{ marginBottom: 10 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '4px 10px', borderRadius: 20,
                        background: '#eef2ff', color: '#6366f1', fontSize: '.6875rem', fontWeight: 700,
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', animation: 'pulse 1.5s infinite' }} />
                        {existingOrder.status === 'pending' ? 'Chờ xác nhận' :
                         existingOrder.status === 'confirmed' ? 'Đã xác nhận' :
                         existingOrder.status === 'preparing' ? 'Đang pha chế' :
                         existingOrder.status === 'ready' ? 'Sẵn sàng' :
                         existingOrder.status === 'served' ? 'Đã phục vụ' : existingOrder.status}
                      </span>
                    </div>
                    {existingOrder.items?.map((item, i) => <InvoiceLine key={i} item={item} />)}
                  </>
                : <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8', fontSize: '.8125rem' }}>
                    Không tìm thấy đơn hàng
                  </div>
          )}
        </div>

        {/* ── FOOTER: Tổng + Nút xác nhận ── */}
        <div style={{ padding: '12px 14px 16px', borderTop: '2px solid #f1f5f9', flexShrink: 0, background: '#fafafa' }}>
          {/* Tổng tiền */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: '.6875rem', color: '#94a3b8', fontWeight: 600, margin: 0 }}>TỔNG CỘNG</p>
              <p style={{ fontSize: '1.375rem', fontWeight: 800, color: '#ea580c', fontFamily: 'monospace', margin: '2px 0 0', lineHeight: 1 }}>
                {!selectedTable
                  ? '—'
                  : isAvailable
                    ? fmt(cartTotal)
                    : existingOrder ? fmt(existingOrder.total) : '—'
                }
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '.6875rem', color: '#94a3b8', margin: 0 }}>
                {isAvailable
                  ? `${cart.reduce((s,i) => s+i.quantity, 0)} món`
                  : existingOrder ? `${existingOrder.items?.reduce((s,i) => s+i.quantity, 0)} món` : ''
                }
              </p>
            </div>
          </div>

          {/* Nút hành động */}
          {!selectedTable && (
            <div style={{ textAlign: 'center', padding: '8px 0', fontSize: '.75rem', color: '#94a3b8' }}>Chọn bàn để thao tác</div>
          )}

          {/* Bàn trống — nút Xác nhận đơn */}
          {selectedTable && isAvailable && (
            <button
              onClick={handleConfirm}
              disabled={cart.length === 0 || saving}
              style={{
                width: '100%', padding: '13px 0', borderRadius: 12, border: 'none', cursor: cart.length > 0 && !saving ? 'pointer' : 'not-allowed',
                background: cart.length > 0 ? '#10b981' : '#e2e8f0',
                color: cart.length > 0 ? '#fff' : '#9ca3af',
                fontWeight: 800, fontSize: '1rem',
                boxShadow: cart.length > 0 ? '0 4px 14px rgba(16,185,129,.30)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all .15s',
              }}>
              {saving ? '⟳ Đang lưu...' : '✓ Xác nhận đơn hàng'}
            </button>
          )}

          {/* Bàn có khách — nút Thêm món + Thanh toán */}
          {selectedTable && !isAvailable && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => { setSelectedTable({ ...selectedTable, status: 'available', _forceMenu: true }); setCart([]); }}
                style={{ width: '100%', padding: '10px 0', borderRadius: 10, background: '#fff', color: '#6366f1', fontWeight: 700, fontSize: '.875rem', border: '1.5px solid #c7d2fe', cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,.12)' }}>
                + Thêm món
              </button>
              <button
                onClick={async () => {
                  if (!existingOrder || !selectedTable) return;
                  setSaving(true);
                  try {
                    await api.patch(`/orders/${existingOrder._id}/status`, { status: 'paid' });
                    // Reset table status to available
                    await api.patch(`/tables/${selectedTable._id}`, { status: 'available', currentOrder: null });
                    toast.success('✓ Đã thanh toán');
                    setSelectedTable(null);
                    setExistingOrder(null);
                    await fetchData();
                  } catch { toast.error('Lỗi thanh toán'); }
                  finally { setSaving(false); }
                }}
                disabled={!existingOrder || saving}
                style={{
                  width: '100%', padding: '12px 0', borderRadius: 10, border: 'none', cursor: existingOrder ? 'pointer' : 'not-allowed',
                  background: existingOrder ? '#6366f1' : '#e2e8f0',
                  color: existingOrder ? '#fff' : '#9ca3af',
                  fontWeight: 800, fontSize: '1rem',
                  boxShadow: existingOrder ? '0 4px 14px rgba(99,102,241,.28)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                {saving ? '⟳ Đang xử lý...' : existingOrder ? `💰 Thanh toán ${fmt(existingOrder.total)}` : 'Thanh toán'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success overlay */}
      {success && <SuccessOverlay order={success} onClose={() => setSuccess(null)} />}
    </div>
  );
}