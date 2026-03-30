import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

const EMPTY_PRODUCT = {
  name: '', category: '', price: '', description: '',
  isAvailable: true, isFeatured: false, preparationTime: 5, tags: ''
};

function ProductForm({ product, categories, onSave, onClose }) {
  const [form, setForm] = useState(product || EMPTY_PRODUCT);
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), preparationTime: Number(form.preparationTime) };
      if (form._id) {
        const res = await api.put(`/menu/${form._id}`, payload);
        onSave(res.data.data, 'update');
      } else {
        const res = await api.post('/menu', payload);
        onSave(res.data.data, 'create');
      }
      toast.success(form._id ? 'Đã cập nhật sản phẩm' : 'Đã thêm sản phẩm mới');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Tên sản phẩm *</label>
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="VD: Cà Phê Đen" />
        </div>
        <div>
          <label className="label">Danh mục *</label>
          <select className="input" value={form.category?._id || form.category} onChange={e => set('category', e.target.value)} required>
            <option value="">-- Chọn danh mục --</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Giá (VNĐ) *</label>
          <input className="input" type="number" value={form.price} onChange={e => set('price', e.target.value)} required min="0" placeholder="25000" />
        </div>
        <div className="col-span-2">
          <label className="label">Mô tả</label>
          <textarea className="input resize-none" rows={2} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Mô tả ngắn về sản phẩm..." />
        </div>
        <div>
          <label className="label">Thời gian pha chế (phút)</label>
          <input className="input" type="number" value={form.preparationTime} onChange={e => set('preparationTime', e.target.value)} min="1" max="60" />
        </div>
        <div className="flex flex-col gap-3 justify-center pt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className={`w-9 h-5 rounded-full transition-colors relative ${form.isAvailable ? 'bg-brand-500' : 'bg-surface-500'}`}
              onClick={() => set('isAvailable', !form.isAvailable)}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isAvailable ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-stone-300 text-sm">Đang bán</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <div className={`w-9 h-5 rounded-full transition-colors relative ${form.isFeatured ? 'bg-brand-500' : 'bg-surface-500'}`}
              onClick={() => set('isFeatured', !form.isFeatured)}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.isFeatured ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-stone-300 text-sm">Nổi bật</span>
          </label>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Hủy</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
          {saving ? '...' : form._id ? 'Cập nhật' : 'Thêm sản phẩm'}
        </button>
      </div>
    </form>
  );
}

export default function MenuPage() {
  const { isManager } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [editProduct, setEditProduct] = useState(null);
  const [catModal, setCatModal] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', icon: '☕' });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        api.get(`/menu?${activeCat ? `category=${activeCat}&` : ''}${search ? `search=${search}&` : ''}limit=50`),
        api.get('/categories')
      ]);
      setProducts(pRes.data.data);
      setCategories(cRes.data.data);
    } finally {
      setLoading(false);
    }
  }, [activeCat, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = (product, type) => {
    if (type === 'create') setProducts(p => [product, ...p]);
    else setProducts(p => p.map(x => x._id === product._id ? product : x));
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    try {
      await api.delete(`/menu/${id}`);
      setProducts(p => p.filter(x => x._id !== id));
      toast.success('Đã xóa sản phẩm');
    } catch { toast.error('Không thể xóa sản phẩm'); }
  };

  const handleToggle = async (id) => {
    try {
      const res = await api.patch(`/menu/${id}/toggle`);
      setProducts(p => p.map(x => x._id === id ? res.data.data : x));
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/categories', newCat);
      setCategories(p => [...p, res.data.data]);
      setNewCat({ name: '', icon: '☕' });
      setCatModal(false);
      toast.success('Đã thêm danh mục');
    } catch (err) { toast.error(err.response?.data?.message || 'Lỗi'); }
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-stone-100">Menu & Sản Phẩm</h1>
          <p className="text-stone-500 text-sm mt-0.5">{products.length} sản phẩm</p>
        </div>
        {isManager && (
          <div className="flex gap-2">
            <button onClick={() => setCatModal(true)} className="btn-secondary text-sm">
              + Danh mục
            </button>
            <button onClick={() => { setEditProduct(null); setModal('add'); }} className="btn-primary text-sm">
              + Thêm sản phẩm
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <input
          className="input w-56 text-sm"
          placeholder="🔍 Tìm sản phẩm..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveCat('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!activeCat ? 'bg-brand-500 text-white' : 'bg-surface-700 text-stone-400 hover:text-stone-200'}`}
          >
            Tất cả
          </button>
          {categories.map(c => (
            <button
              key={c._id}
              onClick={() => setActiveCat(c._id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeCat === c._id ? 'bg-brand-500 text-white' : 'bg-surface-700 text-stone-400 hover:text-stone-200'}`}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="text-center py-12 text-stone-500">⟳ Đang tải...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-stone-500">
          <div className="text-4xl mb-3">☕</div>
          <p>Không có sản phẩm nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(p => (
            <div key={p._id} className={`card p-4 flex flex-col gap-3 transition-all ${!p.isAvailable ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-stone-100 text-sm truncate">{p.name}</h3>
                    {p.isFeatured && <span className="text-xs">⭐</span>}
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">{p.category?.icon} {p.category?.name}</p>
                </div>
                <span className={`badge border text-xs ml-2 ${p.isAvailable ? 'bg-green-500/15 text-green-400 border-green-500/20' : 'bg-stone-500/15 text-stone-400 border-stone-500/20'}`}>
                  {p.isAvailable ? 'Đang bán' : 'Hết'}
                </span>
              </div>

              {p.description && <p className="text-xs text-stone-500 line-clamp-2">{p.description}</p>}

              <div className="flex items-center justify-between mt-auto">
                <span className="font-display font-semibold text-brand-400">{fmt(p.price)}</span>
                <span className="text-xs text-stone-600">⏱ {p.preparationTime} phút</span>
              </div>

              {isManager && (
                <div className="flex gap-1.5 pt-2 border-t border-surface-600">
                  <button
                    onClick={() => handleToggle(p._id)}
                    className="flex-1 text-xs py-1.5 rounded-md bg-surface-700 hover:bg-surface-600 text-stone-400 hover:text-stone-200 transition-colors"
                  >
                    {p.isAvailable ? 'Tạm hết' : 'Mở bán'}
                  </button>
                  <button
                    onClick={() => { setEditProduct(p); setModal('edit'); }}
                    className="flex-1 text-xs py-1.5 rounded-md bg-surface-700 hover:bg-surface-600 text-stone-400 hover:text-stone-200 transition-colors"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="px-3 text-xs py-1.5 rounded-md bg-red-900/30 hover:bg-red-900/50 text-red-400 transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Product modal */}
      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'edit' ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
        size="md"
      >
        <ProductForm
          product={editProduct}
          categories={categories}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      </Modal>

      {/* Category modal */}
      <Modal isOpen={catModal} onClose={() => setCatModal(false)} title="Thêm danh mục mới" size="sm">
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div>
            <label className="label">Tên danh mục</label>
            <input className="input" value={newCat.name} onChange={e => setNewCat(p => ({ ...p, name: e.target.value }))} required placeholder="VD: Cà Phê" />
          </div>
          <div>
            <label className="label">Icon (emoji)</label>
            <input className="input" value={newCat.icon} onChange={e => setNewCat(p => ({ ...p, icon: e.target.value }))} placeholder="☕" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setCatModal(false)} className="btn-secondary flex-1 justify-center">Hủy</button>
            <button type="submit" className="btn-primary flex-1 justify-center">Thêm</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
