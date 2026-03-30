import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Modal from '../components/common/Modal';
import StatusBadge from '../components/common/StatusBadge';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
const fmtTime = (d) => new Date(d).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
const fmtDate = (d) => new Date(d).toLocaleDateString('vi-VN');

const ORDER_STATUSES = ['pending','confirmed','preparing','ready','served','paid','cancelled'];
const NEXT_STATUS = { pending: 'confirmed', confirmed: 'preparing', preparing: 'ready', ready: 'served', served: 'paid' };
const NEXT_LABEL = { pending: 'Xác nhận', confirmed: 'Bắt đầu pha', preparing: 'Sẵn sàng', ready: 'Đã phục vụ', served: 'Thanh toán ✓' };
const PAYMENT_METHODS = { cash: 'Tiền mặt', card: 'Thẻ', transfer: 'Chuyển khoản', momo: 'MoMo' };

// ── Create Order Flow ──────────────────────────────────────────────────────────
function CreateOrderModal({ onClose, onCreated }) {
  const [step, setStep] = useState(1); // 1: select table, 2: select items, 3: confirm
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [orderType, setOrderType] = useState('dine-in');
  const [cart, setCart] = useState([]);
  const [activeCat, setActiveCat] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/tables?status=available'),
      api.get('/categories'),
      api.get('/menu?available=true&limit=100'),
    ]).then(([t, c, p]) => {
      setTables(t.data.data);
      setCategories(c.data.data);
      setProducts(p.data.data);
    });
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product === product._id);
      if (existing) return prev.map(i => i.product === product._id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product: product._id, name: product.name, price: product.price, quantity: 1, note: '', size: 'default' }];
    });
  };

  const updateQty = (productId, delta) => {
    setCart(prev => prev.map(i => i.product === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const filteredProducts = activeCat ? products.filter(p => p.category?._id === activeCat || p.category === activeCat) : products;

  const handleSubmit = async () => {
    if (cart.length === 0) { toast.error('Vui lòng chọn ít nhất 1 món'); return; }
    setSaving(true);
    try {
      const payload = {
        table: selectedTable?._id || undefined,
        orderType,
        items: cart,
        note,
        paymentMethod,
      };
      const res = await api.post('/orders', payload);
      toast.success(`Đã tạo đơn ${res.data.data.orderCode}`);
      onCreated(res.data.data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi tạo đơn');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex gap-2 mb-4">
        {['Chọn bàn', 'Chọn món', 'Xác nhận'].map((label, i) => (
          <div key={i} className={`flex-1 text-center text-xs py-1.5 rounded-lg transition-all ${step === i + 1 ? 'bg-brand-500 text-white font-medium' : step > i + 1 ? 'bg-brand-500/20 text-brand-400' : 'bg-surface-700 text-stone-500'}`}>
            {i + 1}. {label}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <div className="flex gap-3">
            {['dine-in', 'takeaway'].map(t => (
              <button key={t} onClick={() => setOrderType(t)} className={`flex-1 py-2 rounded-lg text-sm transition-all border ${orderType === t ? 'bg-brand-500/20 border-brand-500/40 text-brand-400' : 'bg-surface-700 border-surface-500 text-stone-400'}`}>
                {t === 'dine-in' ? '🪑 Tại bàn' : '🥤 Mang về'}
              </button>
            ))}
          </div>
          {orderType === 'dine-in' && (
            <>
              <p className="text-stone-400 text-sm">Chọn bàn:</p>
              {tables.length === 0 ? (
                <p className="text-stone-500 text-sm text-center py-4">Không có bàn trống</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                  {tables.map(t => (
                    <button key={t._id} onClick={() => setSelectedTable(t)}
                      className={`py-3 rounded-lg text-sm font-medium border transition-all ${selectedTable?._id === t._id ? 'bg-brand-500/20 border-brand-500/40 text-brand-400' : 'bg-surface-700 border-surface-500 text-stone-300 hover:border-stone-400'}`}>
                      {t.name || `Bàn ${t.number}`}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
          <button onClick={() => setStep(2)} disabled={orderType === 'dine-in' && !selectedTable} className="btn-primary w-full justify-center">
            Tiếp theo →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          {/* Category tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            <button onClick={() => setActiveCat('')} className={`px-3 py-1 rounded-md text-xs whitespace-nowrap ${!activeCat ? 'bg-brand-500 text-white' : 'bg-surface-700 text-stone-400'}`}>Tất cả</button>
            {categories.map(c => (
              <button key={c._id} onClick={() => setActiveCat(c._id)} className={`px-3 py-1 rounded-md text-xs whitespace-nowrap ${activeCat === c._id ? 'bg-brand-500 text-white' : 'bg-surface-700 text-stone-400'}`}>
                {c.icon} {c.name}
              </button>
            ))}
          </div>

          {/* Products */}
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
            {filteredProducts.map(p => {
              const inCart = cart.find(i => i.product === p._id);
              return (
                <div key={p._id} onClick={() => addToCart(p)}
                  className="bg-surface-700 hover:bg-surface-600 border border-surface-500 rounded-lg p-3 cursor-pointer transition-all relative">
                  {inCart && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-500 text-white text-xs flex items-center justify-center font-bold">
                      {inCart.quantity}
                    </span>
                  )}
                  <p className="text-stone-200 text-sm font-medium pr-6">{p.name}</p>
                  <p className="text-brand-400 text-xs font-semibold mt-1">{fmt(p.price)}</p>
                </div>
              );
            })}
          </div>

          {/* Cart summary */}
          {cart.length > 0 && (
            <div className="bg-surface-700 rounded-lg p-3 space-y-1 max-h-28 overflow-y-auto">
              {cart.map(item => (
                <div key={item.product} className="flex items-center justify-between text-sm">
                  <span className="text-stone-300 flex-1 truncate">{item.name}</span>
                  <div className="flex items-center gap-1.5 ml-2">
                    <button onClick={(e) => { e.stopPropagation(); updateQty(item.product, -1); }} className="w-5 h-5 rounded bg-surface-500 text-stone-300 flex items-center justify-center text-xs hover:bg-surface-400">-</button>
                    <span className="text-stone-200 w-4 text-center font-medium">{item.quantity}</span>
                    <button onClick={(e) => { e.stopPropagation(); updateQty(item.product, 1); }} className="w-5 h-5 rounded bg-surface-500 text-stone-300 flex items-center justify-center text-xs hover:bg-surface-400">+</button>
                    <span className="text-brand-400 text-xs w-16 text-right">{fmt(item.price * item.quantity)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary">← Quay lại</button>
            <button onClick={() => setStep(3)} disabled={cart.length === 0} className="btn-primary flex-1 justify-center">
              Xem lại ({cart.length} món) →
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-surface-700 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-stone-400">Loại đơn:</span>
              <span className="text-stone-200">{orderType === 'dine-in' ? `🪑 Bàn ${selectedTable?.number || '—'}` : '🥤 Mang về'}</span>
            </div>
            <div className="border-t border-surface-500 pt-2 space-y-1">
              {cart.map(i => (
                <div key={i.product} className="flex justify-between text-sm">
                  <span className="text-stone-300">{i.name} × {i.quantity}</span>
                  <span className="text-stone-400">{fmt(i.price * i.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-surface-500 pt-2 flex justify-between font-semibold">
              <span className="text-stone-200">Tổng cộng</span>
              <span className="text-brand-400">{fmt(subtotal)}</span>
            </div>
          </div>

          <div>
            <label className="label">Phương thức thanh toán</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PAYMENT_METHODS).map(([k, v]) => (
                <button key={k} onClick={() => setPaymentMethod(k)} className={`py-2 rounded-lg text-sm transition-all border ${paymentMethod === k ? 'bg-brand-500/20 border-brand-500/40 text-brand-400' : 'bg-surface-700 border-surface-500 text-stone-400 hover:border-stone-400'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Ghi chú</label>
            <textarea className="input resize-none text-sm" rows={2} value={note} onChange={e => setNote(e.target.value)} placeholder="Ghi chú cho đơn hàng..." />
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary">← Quay lại</button>
            <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? '...' : '✓ Tạo đơn hàng'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (filterStatus) params.set('status', filterStatus);
      if (dateFilter) params.set('date', dateFilter);
      const res = await api.get(`/orders?${params}`);
      setOrders(res.data.data);
    } finally { setLoading(false); }
  }, [filterStatus, dateFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status });
      setOrders(p => p.map(o => o._id === orderId ? res.data.data : o));
      if (selectedOrder?._id === orderId) setSelectedOrder(res.data.data);
      toast.success('Đã cập nhật trạng thái');
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const handleCancel = async (orderId) => {
    if (!confirm('Hủy đơn hàng này?')) return;
    try {
      await api.delete(`/orders/${orderId}`);
      setOrders(p => p.map(o => o._id === orderId ? { ...o, status: 'cancelled' } : o));
      setSelectedOrder(null);
      toast.success('Đã hủy đơn hàng');
    } catch { toast.error('Không thể hủy đơn hàng'); }
  };

  const activeCount = orders.filter(o => !['paid', 'cancelled'].includes(o.status)).length;

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-stone-100">Đơn Hàng</h1>
          <p className="text-stone-500 text-sm mt-0.5">{activeCount} đơn đang xử lý • {orders.length} tổng</p>
        </div>
        <button onClick={() => setCreateModal(true)} className="btn-primary text-sm">+ Tạo đơn mới</button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <input type="date" className="input w-auto text-sm" value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilterStatus('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!filterStatus ? 'bg-brand-500 text-white' : 'bg-surface-700 text-stone-400 hover:text-stone-200'}`}>
            Tất cả
          </button>
          {['pending', 'preparing', 'ready', 'paid', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === s ? 'bg-brand-500 text-white' : 'bg-surface-700 text-stone-400 hover:text-stone-200'}`}>
              <StatusBadge status={s} />
            </button>
          ))}
        </div>
      </div>

      {/* Orders table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-stone-500">⟳ Đang tải...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-stone-500">
            <div className="text-4xl mb-3">📋</div>
            <p>Không có đơn hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-700/50">
                <tr>
                  <th className="th">Mã đơn</th>
                  <th className="th">Bàn</th>
                  <th className="th">Món</th>
                  <th className="th">Tổng tiền</th>
                  <th className="th">Trạng thái</th>
                  <th className="th">Thời gian</th>
                  <th className="th">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className="table-row cursor-pointer" onClick={() => setSelectedOrder(order)}>
                    <td className="td font-mono text-brand-400 text-xs">{order.orderCode}</td>
                    <td className="td">{order.orderType === 'takeaway' ? '🥤 Mang về' : `Bàn ${order.tableNumber || '—'}`}</td>
                    <td className="td text-stone-400">{order.items.length} món</td>
                    <td className="td font-semibold font-display">{fmt(order.total)}</td>
                    <td className="td"><StatusBadge status={order.status} /></td>
                    <td className="td text-stone-500 text-xs">{fmtTime(order.createdAt)}</td>
                    <td className="td" onClick={e => e.stopPropagation()}>
                      {NEXT_STATUS[order.status] && (
                        <button
                          onClick={() => handleStatusUpdate(order._id, NEXT_STATUS[order.status])}
                          className="text-xs px-2.5 py-1 rounded-md bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 border border-brand-500/20 transition-colors"
                        >
                          {NEXT_LABEL[order.status]}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order detail modal */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Đơn ${selectedOrder?.orderCode || ''}`} size="md">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-surface-700 rounded-lg p-3">
                <p className="text-stone-500 text-xs mb-1">Bàn</p>
                <p className="text-stone-200">{selectedOrder.orderType === 'takeaway' ? '🥤 Mang về' : `Bàn ${selectedOrder.tableNumber}`}</p>
              </div>
              <div className="bg-surface-700 rounded-lg p-3">
                <p className="text-stone-500 text-xs mb-1">Thời gian</p>
                <p className="text-stone-200">{fmtDate(selectedOrder.createdAt)} {fmtTime(selectedOrder.createdAt)}</p>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="label mb-2">Danh sách món</p>
              <div className="space-y-1.5">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-surface-700 rounded-lg px-3 py-2 text-sm">
                    <span className="text-stone-200">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-stone-500">× {item.quantity}</span>
                      <span className="text-brand-400 font-medium w-24 text-right">{fmt(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-surface-700 rounded-lg p-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Tạm tính</span>
                <span className="text-stone-300">{fmt(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-stone-400">Giảm giá</span>
                  <span className="text-green-400">- {fmt(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold border-t border-surface-500 pt-1.5">
                <span className="text-stone-100">Tổng cộng</span>
                <span className="text-brand-400 font-display text-lg">{fmt(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-wrap">
              {NEXT_STATUS[selectedOrder.status] && (
                <button onClick={() => handleStatusUpdate(selectedOrder._id, NEXT_STATUS[selectedOrder.status])} className="btn-primary flex-1 justify-center text-sm">
                  {NEXT_LABEL[selectedOrder.status]}
                </button>
              )}
              {!['paid', 'cancelled'].includes(selectedOrder.status) && (
                <button onClick={() => handleCancel(selectedOrder._id)} className="btn-danger text-sm">Hủy đơn</button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create order modal */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Tạo đơn hàng mới" size="lg">
        <CreateOrderModal onClose={() => setCreateModal(false)} onCreated={(o) => setOrders(p => [o, ...p])} />
      </Modal>
    </div>
  );
}
