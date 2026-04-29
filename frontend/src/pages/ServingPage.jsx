import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useReadyItemsNotification } from '../hooks/useReadyItemsNotification.jsx';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

const getImageUrl = (image) => {
  if (!image) return '';
  if (image.startsWith('http')) return image;
  return `/images/products/${image}`;
};

const ZONE_LABELS = { indoor: 'Trong nhà', outdoor: 'Ngoài trời', vip: 'VIP', bar: 'Bar' };
const ZONE_ICONS  = { indoor: '🏠', outdoor: '🌿', vip: '👑', bar: '🍸' };

const STATUS = {
  available: { label: 'Trống',      dot: 'bg-green-500', card: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' },
  occupied:  { label: 'Đang dùng',  dot: 'bg-orange-500', card: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700' },
  reserved:  { label: 'Đặt trước',  dot: 'bg-yellow-500', card: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700' },
  cleaning:  { label: 'Đang dọn',   dot: 'bg-purple-500', card: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700' },
};

function ProductCard({ product, onAdd }) {
  const [imgErr, setImgErr] = useState(false);
  const hasImage = product.image && !imgErr;

  return (
    <div
      onClick={() => product.isAvailable ? onAdd(product) : toast.error('Món đang hết')}
      className={`bg-white rounded-3xl p-3 shadow-sm border flex flex-col group relative transition-all h-full
        ${product.isAvailable ? 'border-slate-200 cursor-pointer hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-100/50 hover:-translate-y-1' : 'border-red-200 bg-red-50/30 cursor-not-allowed opacity-75'}`}
    >
      <div className="w-full aspect-square rounded-2xl overflow-hidden mb-3 bg-slate-100 relative shrink-0">
        {hasImage ? (
          <img src={getImageUrl(product.image)} alt={product.name} className={`w-full h-full object-cover transition-transform duration-300 ${product.isAvailable ? 'group-hover:scale-105' : 'grayscale'}`} onError={() => setImgErr(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl opacity-20 bg-slate-50">{product.category?.icon || '☕'}</div>
        )}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-white/40 flex items-center justify-center backdrop-blur-[2px]">
            <span className="text-[10px] font-black text-red-600 bg-red-100 px-3 py-1.5 rounded-lg shadow-sm border border-red-200 uppercase tracking-wider">Hết hàng</span>
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col px-1">
        <p className="font-bold text-[14px] leading-tight text-slate-800 line-clamp-2">{product.name}</p>
        <div className="mt-auto pt-2 flex items-end justify-between">
          <p className="font-black text-indigo-600">{fmt(product.price)}</p>
        </div>
      </div>
    </div>
  );
}

function OrderLine({ item, onQty, onRemove, onEdit }) {
  return (
    <div 
      className="flex items-center gap-3 p-3 bg-white border-2 border-slate-100 rounded-xl mb-2 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group" 
      onClick={() => onEdit(item)}
    >
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
          {item.name}{item.size && item.size !== 'default' && <span className="text-slate-400 font-medium"> ({item.size})</span>}
        </p>
        <p className="text-xs font-medium text-slate-400 mt-0.5">{fmt(item.price)}</p>
        {item.note && <p className="text-[11px] text-amber-600 font-bold mt-1.5 bg-amber-50 rounded px-1.5 py-0.5 inline-block truncate max-w-full">📝 {item.note}</p>}
      </div>
      <div className="flex flex-col items-end gap-2 shrink-0" onClick={e => e.stopPropagation()}>
        <div className="flex items-center bg-slate-50 rounded-lg p-0.5 border border-slate-200 shadow-sm">
          <button onClick={() => onQty(item.key, -1)} className="w-8 h-8 rounded-md bg-white text-slate-600 hover:bg-slate-200 hover:text-slate-800 flex items-center justify-center font-bold transition-colors">−</button>
          <span className="w-7 text-center font-black text-sm text-slate-800">{item.quantity}</span>
          <button onClick={() => onQty(item.key, +1)} className="w-8 h-8 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 flex items-center justify-center font-bold transition-colors">+</button>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5 shrink-0 ml-1" onClick={e => e.stopPropagation()}>
        <span className="font-black text-sm text-orange-600">{fmt(item.price * item.quantity)}</span>
        <button onClick={() => onRemove(item.key)} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center text-sm transition-colors" title="Xóa món">✕</button>
      </div>
    </div>
  );
}

function InvoiceLine({ item }) {
  return (
    <div className="flex justify-between items-start p-3 bg-slate-50 border border-slate-100 rounded-xl mb-2">
      <div className="flex-1">
        <span className="text-sm text-slate-800 font-bold">{item.name}</span>
        {item.size && item.size !== 'default' && <span className="text-slate-500 text-xs font-medium ml-1">({item.size})</span>}
        {item.note && <p className="text-xs text-amber-600 font-bold mt-1 bg-amber-50 rounded px-1.5 py-0.5 inline-block">📝 {item.note}</p>}
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-3">
        <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200">×{item.quantity}</span>
        <span className="font-black text-sm text-orange-600 min-w-[70px] text-right">{fmt(item.price * item.quantity)}</span>
      </div>
    </div>
  );
}

function NoteModal({ item, onClose, onSave }) {
  const [note, setNote] = useState(item.note || '');
  const [size, setSize] = useState(item.size || 'default');
  
  if (!item) return null;
  
  return (
    <div className="fixed inset-0 z-[400] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/80">
          <h3 className="font-bold text-slate-800 text-lg">Tùy chỉnh món</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors">✕</button>
        </div>
        <div className="p-6">
          <p className="font-black text-indigo-600 mb-6 text-xl">{item.name}</p>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-3">Kích cỡ (Size)</label>
            <div className="flex gap-2">
              {['default', 'M', 'L'].map(sz => (
                <button key={sz} onClick={() => setSize(sz)} 
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all border-2
                    ${size === sz ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}>
                  {sz === 'default' ? 'Mặc định' : `Size ${sz}`}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">Ghi chú pha chế</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Nhập ghi chú: ít đá, nhiều đường..."
              className="w-full border-2 border-slate-200 rounded-xl p-4 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none h-24 text-slate-800 bg-slate-50 focus:bg-white"
            />
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {['Ít đá', 'Không đá', 'Nhiều đường', 'Ít đường', 'Mang về'].map(tag => (
              <button key={tag} onClick={() => setNote(prev => prev ? prev + ', ' + tag : tag)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold transition-colors">
                + {tag}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors">Hủy</button>
          <button onClick={() => onSave(item.key, { size, note })} className="px-8 py-3 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2">
            ✓ Lưu lại
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessOverlay({ order, onClose }) {
  return (
    <div className="fixed inset-0 z-[500] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-[2rem] p-8 text-center shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-300">
        <div className="w-24 h-24 rounded-full bg-emerald-50 border-4 border-emerald-500 flex items-center justify-center mx-auto mb-6 text-emerald-500 text-5xl">✓</div>
        <h2 className="text-emerald-500 font-black text-3xl mb-2">Thành công!</h2>
        <p className="text-slate-500 font-medium mb-6">Đơn hàng đã được tạo</p>
        <p className="text-indigo-600 font-black text-4xl font-mono mb-2">{order.orderCode}</p>
        <p className="text-slate-800 font-bold text-2xl mb-8">{fmt(order.total)}</p>
        <button onClick={onClose} className="w-full py-4 rounded-2xl bg-indigo-600 text-white font-bold text-lg shadow-xl shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
          Tiếp tục phục vụ
        </button>
      </div>
    </div>
  );
}

function CatBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap shrink-0 transition-all duration-200 border-2
      ${active ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-800'}`}>
      {children}
    </button>
  );
}

/* ─── MAIN ────────────────────────────────────────────────────────────────── */
export default function ServingPage() {
  const [tables, setTables]         = useState([]);
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [existingOrder, setExistingOrder] = useState(null);
  const [loadingOrder, setLoadingOrder]   = useState(false);
  const [mode, setMode]   = useState('map'); // 'map' | 'new-order' | 'view-invoice' | 'add-items'
  const [cart, setCart]   = useState([]);
  const [activeCat, setActiveCat]   = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);
  const [editingNoteItem, setEditingNoteItem] = useState(null); // Cho popup Note

  // Hook thông báo món sẵn sàng
  useReadyItemsNotification();

  /* fetch data */
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
        // Nếu đang xem hóa đơn — cập nhật lại existingOrder nếu bàn có đơn mới
        setSelectedTable(prev => {
          if (!prev) return prev;
          return res.data.data.find(t => t._id === prev._id) || prev;
        });
      } catch {}
    }, 8000);
    return () => clearInterval(iv);
  }, []);

  /* polling existingOrder mỗi 5s để cập nhật trạng thái món và đơn */
  useEffect(() => {
    if (!existingOrder) return;
    const iv = setInterval(async () => {
      try {
        const res = await api.get(`/orders/${existingOrder._id}`);
        setExistingOrder(res.data.data);
      } catch {}
    }, 5000);
    return () => clearInterval(iv);
  }, [existingOrder?._id]);

  /* chọn bàn */
  const handleSelectTable = async (table) => {
    if (selectedTable?._id === table._id && mode !== 'map') return;
    setSelectedTable(table);
    setCart([]);
    setActiveCat('');
    setSearchTerm('');
    setExistingOrder(null);

    if (table.status === 'available') {
      setMode('new-order');
    } else {
      setMode('view-invoice');
      if (table.currentOrder) {
        setLoadingOrder(true);
        try {
          const orderId = table.currentOrder._id || table.currentOrder;
          const res = await api.get(`/orders/${orderId}`);
          setExistingOrder(res.data.data);
        } catch { toast.error('Không tải được đơn hàng'); }
        finally { setLoadingOrder(false); }
      }
    }
  };

  /* cart */
  const addToCart = (product) => {
    const key = Date.now().toString() + Math.random().toString(36).substr(2, 5); // Tự tạo key độc lập cho mỗi item để dễ ghi chú riêng
    setCart(prev => {
      // Tìm xem có món nào CÙNG product, CÙNG size 'default' và KHÔNG có note không
      // Nếu có thì gộp lại, nếu không thì thêm dòng mới
      const exIdx = prev.findIndex(i => i.productId === product._id && i.size === 'default' && !i.note);
      if (exIdx !== -1) {
        const newCart = [...prev];
        newCart[exIdx] = { ...newCart[exIdx], quantity: newCart[exIdx].quantity + 1 };
        return newCart;
      }
      return [...prev, { key, productId: product._id, name: product.name, price: product.price, quantity: 1, size: 'default', note: '' }];
    });
  };
  const changeQty = (key, delta) =>
    setCart(prev => prev.map(i => i.key === key ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i).filter(i => i.quantity > 0));
  const removeItem = (key) => setCart(prev => prev.filter(i => i.key !== key));
  const saveNote = (key, data) => {
    setCart(prev => prev.map(i => i.key === key ? { ...i, ...data } : i));
    setEditingNoteItem(null);
  };
  const cartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  /* xác nhận đơn */
  const handleConfirm = async () => {
    if (cart.length === 0) { toast.error('Chưa chọn món nào'); return; }
    setSaving(true);
    try {
      if (mode === 'add-items' && existingOrder) {
        await api.patch(`/orders/${existingOrder._id}/add-items`, {
          items: cart.map(i => ({ product: i.productId, name: i.name, price: i.price, quantity: i.quantity, size: i.size, note: i.note })),
        });
        const oRes = await api.get(`/orders/${existingOrder._id}`);
        setExistingOrder(oRes.data.data);
        setCart([]);
        setMode('view-invoice');
        toast.success('✓ Đã thêm món');
      } else if (mode === 'new-order') {
        const res = await api.post('/orders', {
          table: selectedTable._id,
          orderType: 'dine-in',
          items: cart.map(i => ({ product: i.productId, name: i.name, price: i.price, quantity: i.quantity, size: i.size, note: i.note })),
          paymentMethod: 'cash',
        });
        setCart([]);
        setSuccess(res.data.data);
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
        setMode('view-invoice');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi xác nhận đơn');
    } finally { setSaving(false); }
  };

  const handlePayment = async () => {
    if (!existingOrder || !selectedTable || saving) return;
    setSaving(true);
    try {
      await api.patch(`/orders/${existingOrder._id}/status`, { status: 'paid' });
      toast.success(`✓ Đã thanh toán ${fmt(existingOrder.total)}`);
      setSelectedTable(null);
      setExistingOrder(null);
      setCart([]);
      setMode('map');
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi thanh toán');
    } finally {
      setSaving(false);
    }
  };

  /* menu filter */
  const menuItems = products.filter(p => {
    const matchCat  = !activeCat || p.category?._id === activeCat || p.category === activeCat;
    const matchSrch = !searchTerm || p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSrch;
  });

  const tablesByZone = tables.reduce((acc, t) => { (acc[t.zone] = acc[t.zone] || []).push(t); return acc; }, {});
  const showMenu    = mode === 'new-order' || mode === 'add-items';
  const showInvoice = mode === 'view-invoice';

  const leftTitle = () => {
    if (!selectedTable || mode === 'map') return 'Sơ đồ bàn';
    const n = selectedTable.name || `Bàn ${selectedTable.number}`;
    if (mode === 'new-order')    return `Chọn món — ${n}`;
    if (mode === 'add-items')    return `Thêm món — ${n}`;
    if (mode === 'view-invoice') return `Đang phục vụ — ${n}`;
    return 'Sơ đồ bàn';
  };

  return (
    <div className="flex flex-col lg:flex-row h-[100dvh] w-full bg-slate-50 font-sans text-slate-800 overflow-hidden">
      
      {/* ══ CỘT TRÁI 70% ══ */}
      <div className="flex flex-col flex-1 min-w-0 lg:w-[70%] lg:border-r border-slate-200">
        {/* Top bar */}
        <div className="bg-white px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-4 flex-wrap shadow-sm z-10 shrink-0">
          <div className="shrink-0 flex items-center gap-3">
            {!showMenu && !showInvoice && <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl">🍽</div>}
            {(showMenu || showInvoice) && selectedTable && (
              <button onClick={() => { setSelectedTable(null); setCart([]); setMode('map'); }}
                className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 flex items-center justify-center font-bold text-xl transition-colors">
                ←
              </button>
            )}
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">{leftTitle()}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                  {tables.filter(t => t.status === 'occupied').length} đang dùng
                </span>
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-md border border-green-100">
                  {tables.filter(t => t.status === 'available').length} trống
                </span>
              </div>
            </div>
          </div>
          
          {showMenu && (
            <div className="flex-1 flex gap-3 min-w-[300px]">
              <div className="relative flex-1 max-w-[280px]">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Tìm kiếm món..."
                  className="w-full py-3 pl-11 pr-4 bg-slate-100 border-2 border-slate-100 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-400/10 rounded-xl text-sm font-medium outline-none transition-all text-slate-700" />
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mb-1" style={{ scrollbarWidth: 'none' }}>
                <CatBtn active={!activeCat} onClick={() => setActiveCat('')}>Tất cả</CatBtn>
                {categories.map(c => <CatBtn key={c._id} active={activeCat === c._id} onClick={() => setActiveCat(activeCat === c._id ? '' : c._id)}>{c.icon} {c.name}</CatBtn>)}
              </div>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 pb-20 lg:pb-6">
          {!showMenu ? (
            loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                {[...Array(15)].map((_, i) => <div key={i} className="h-32 rounded-3xl bg-slate-200 animate-pulse" />)}
              </div>
            ) : (
              Object.entries(tablesByZone).map(([zone, zoneTables]) => (
                <div key={zone} className="mb-10">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-2xl bg-white w-10 h-10 rounded-full shadow-sm flex items-center justify-center">{ZONE_ICONS[zone] || '📍'}</span>
                    <h3 className="font-black text-slate-700 text-lg tracking-wide uppercase">{ZONE_LABELS[zone] || zone}</h3>
                    <div className="flex-1 h-0.5 bg-slate-200 rounded-full" />
                    <span className="text-sm font-bold text-slate-500 bg-slate-200 px-3 py-1 rounded-xl">{zoneTables.length} bàn</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                    {zoneTables.map(table => {
                      const st = STATUS[table.status] || STATUS.available;
                      const isSel = selectedTable?._id === table._id;
                      return (
                        <button key={table._id} onClick={() => handleSelectTable(table)}
                          className={`relative p-5 rounded-3xl cursor-pointer flex flex-col items-center gap-2.5 transition-all duration-200 border-2
                            ${isSel ? 'bg-indigo-50 border-indigo-500 shadow-xl shadow-indigo-200/50 -translate-y-1' : `${st.card} border-transparent hover:border-slate-300 hover:shadow-lg hover:-translate-y-1`}
                          `}>
                          <div className="flex items-center gap-2 w-full justify-center">
                            <span className={`w-2.5 h-2.5 rounded-full ${isSel ? 'bg-indigo-600 animate-pulse' : st.dot}`} />
                            <span className={`text-[11px] font-black uppercase tracking-wider ${isSel ? 'text-indigo-600' : st.text}`}>
                              {isSel ? 'Đang chọn' : st.label}
                            </span>
                          </div>
                          <span className={`font-black text-2xl leading-none ${isSel ? 'text-indigo-700' : 'text-slate-800'}`}>
                            {table.name || `Bàn ${table.number}`}
                          </span>
                          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-1">
                            <span className="opacity-60 text-sm">👥</span> {table.capacity}
                          </span>
                          {table.currentOrder?.total > 0 && (
                            <div className="mt-2 text-sm font-black text-orange-600 bg-orange-100 px-3 py-1.5 rounded-xl border border-orange-200 w-full text-center">
                              {fmt(table.currentOrder.total)}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )
          ) : (
            menuItems.length === 0
              ? <div className="text-center py-24 flex flex-col items-center justify-center"><div className="text-7xl opacity-20 mb-5 grayscale">☕</div><p className="text-slate-500 font-bold text-xl">Không tìm thấy món nào</p></div>
              : <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
                  {menuItems.map(p => <ProductCard key={p._id} product={p} onAdd={addToCart} />)}
                </div>
          )}
        </div>
      </div>

      {/* ══ CỘT PHẢI 30% ══ */}
      <div className="flex flex-col w-full lg:w-[380px] xl:w-[420px] bg-white lg:h-full border-t border-slate-200 shrink-0 z-20 shadow-[-10px_0_20px_-10px_rgba(0,0,0,0.05)]">
        {/* Header Right */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-200 shrink-0 flex items-center justify-between">
          <div>
            <h2 className="font-black text-xl text-slate-800">
              {!selectedTable ? 'Chi tiết đơn' : showMenu ? `🛒 ${mode === 'add-items' ? 'Thêm món mới' : 'Tạo đơn mới'}` : `🧾 Hóa đơn`}
            </h2>
            {selectedTable && (
              <p className="text-sm font-bold text-slate-500 mt-1 flex items-center gap-2">
                <span className="bg-slate-200 px-2 py-0.5 rounded-md text-[11px] uppercase tracking-wider text-slate-600">{ZONE_LABELS[selectedTable.zone]}</span>
                <span className="text-slate-800">{selectedTable.name || `Bàn ${selectedTable.number}`}</span>
              </p>
            )}
          </div>
          {showInvoice && existingOrder && (
             <span className="text-sm font-bold font-mono text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">#{existingOrder.orderCode}</span>
          )}
        </div>

        {/* List items */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50 relative">
          {!selectedTable && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center text-4xl mb-4 grayscale opacity-50 shadow-inner">🪑</div>
              <p className="font-bold text-slate-500 text-lg">Chưa chọn bàn</p>
              <p className="text-sm mt-2 max-w-[200px]">Vui lòng chọn bàn ở sơ đồ bên trái để bắt đầu phục vụ.</p>
            </div>
          )}
          {selectedTable && showMenu && (
            cart.length === 0
              ? <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-slate-400">
                  <div className="w-24 h-24 bg-slate-100 border-2 border-dashed border-slate-300 rounded-full flex items-center justify-center text-4xl mb-4 grayscale opacity-50">🍽</div>
                  <p className="font-bold text-slate-500 text-lg">Giỏ hàng trống</p>
                  <p className="text-sm mt-2 text-slate-400 max-w-[200px]">Chọn món ở menu để thêm vào đơn.</p>
                </div>
              : <div className="animate-in slide-in-from-bottom-2 duration-300">
                  {cart.map(item => <OrderLine key={item.key} item={item} onQty={changeQty} onRemove={removeItem} onEdit={setEditingNoteItem} />)}
                </div>
          )}
          {selectedTable && showInvoice && (
            loadingOrder
              ? <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
                  <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
                  <p className="font-bold">Đang tải hóa đơn...</p>
                </div>
              : existingOrder
                ? <div className="animate-in fade-in duration-300">
                    <div className="mb-5 flex justify-center">
                      <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border-2
                        ${existingOrder.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200 shadow-sm shadow-amber-100' : 
                          existingOrder.status === 'ready' ? 'bg-green-50 text-green-600 border-green-200 shadow-sm shadow-green-100' :
                          'bg-indigo-50 text-indigo-600 border-indigo-200 shadow-sm shadow-indigo-100'}`}>
                        <span className={`w-2 h-2 rounded-full ${existingOrder.status === 'pending' ? 'bg-amber-500 animate-pulse' : existingOrder.status === 'ready' ? 'bg-green-500 animate-pulse' : 'bg-indigo-500'}`} />
                        {{ pending:'Chờ nhà bếp xác nhận', confirmed:'Nhà bếp đã nhận', preparing:'Đang pha chế', ready:'Sẵn sàng phục vụ', served:'Đã phục vụ', paid:'Đã thanh toán' }[existingOrder.status] || existingOrder.status}
                      </span>
                    </div>
                    {existingOrder.items?.map((item, i) => <InvoiceLine key={i} item={item} />)}
                  </div>
                : <div className="text-center py-10 font-bold text-slate-400">Không tìm thấy đơn hàng</div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-slate-200 p-6 shrink-0 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
          <div className="flex justify-between items-end mb-5">
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">Tổng thanh toán</p>
              <p className="text-4xl font-black text-orange-600 leading-none tracking-tight">
                {!selectedTable ? '0đ' : showMenu ? fmt(cartTotal) : existingOrder ? fmt(existingOrder.total) : '0đ'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                {showMenu ? `${cart.reduce((s,i) => s+i.quantity, 0)} sản phẩm` : existingOrder ? `${existingOrder.items?.reduce((s,i) => s+i.quantity,0)||0} sản phẩm` : '0 sản phẩm'}
              </p>
            </div>
          </div>

          {!selectedTable && <div className="w-full py-5 text-center rounded-2xl bg-slate-50 text-slate-400 font-bold border-2 border-dashed border-slate-200">Chưa chọn bàn</div>}

          {selectedTable && showMenu && (
            <div className="flex flex-col gap-3">
              <button onClick={handleConfirm} disabled={cart.length === 0 || saving}
                className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all
                  ${cart.length > 0 && !saving ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/30 hover:-translate-y-1' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                {saving ? (
                  <><div className="w-6 h-6 border-4 border-white/50 border-t-white rounded-full animate-spin" /> Đang xử lý...</>
                ) : (
                  mode === 'add-items' ? '✓ Cập nhật đơn' : '✓ Gửi nhà bếp'
                )}
              </button>
              {mode === 'add-items' && (
                <button onClick={() => { setCart([]); setMode('view-invoice'); }}
                  className="w-full py-3.5 rounded-xl bg-white border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:border-slate-300 transition-colors">
                  Hủy thêm món
                </button>
              )}
            </div>
          )}

          {selectedTable && showInvoice && (
            <div className="flex flex-col gap-3">
              <button onClick={() => { setMode('add-items'); setCart([]); setActiveCat(''); setSearchTerm(''); }}
                className="w-full py-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black border-2 border-indigo-200 hover:border-indigo-300 transition-all shadow-sm flex items-center justify-center gap-2 text-lg">
                <span className="text-2xl leading-none mb-0.5">+</span> Thêm món
              </button>

              <button
                onClick={handlePayment}
                disabled={!existingOrder || saving}
                className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all
                  ${existingOrder && !saving ? 'bg-slate-800 hover:bg-slate-900 text-white shadow-xl shadow-slate-800/20 hover:-translate-y-1' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                {saving ? (
                   <><div className="w-5 h-5 border-4 border-white/50 border-t-white rounded-full animate-spin" /> Đang xử lý...</>
                ) : existingOrder ? (
                  `💰 Thanh toán`
                ) : (
                  'Thanh toán'
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {editingNoteItem && <NoteModal item={editingNoteItem} onClose={() => setEditingNoteItem(null)} onSave={saveNote} />}
      {success && <SuccessOverlay order={success} onClose={() => setSuccess(null)} />}
    </div>
  );
}