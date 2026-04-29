import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

const getImageUrl = (image) => {
  if (!image) return '';
  if (image.startsWith('http')) return image;
  return `/images/products/${image}`;
};

export default function MenuPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        api.get('/menu?limit=500'),
        api.get('/categories')
      ]);
      setProducts(pRes.data.data || []);
      setCategories(cRes.data.data || []);
    } catch (err) {
      toast.error('Không thể tải dữ liệu thực đơn');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingId(product._id);
      setFormData({
        name: product.name || '',
        category: product.category?._id || product.category || '',
        price: product.price || '',
        description: product.description || '',
      });
      setPreviewUrl(getImageUrl(product.image));
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        category: categories.length > 0 ? categories[0]._id : '',
        price: '',
        description: '',
      });
      setPreviewUrl('');
    }
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || !formData.price) {
      toast.error('Vui lòng điền đủ tên, danh mục và giá');
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('category', formData.category);
      fd.append('price', formData.price);
      fd.append('description', formData.description);
      
      if (selectedFile) {
        fd.append('image', selectedFile);
      }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (editingId) {
        await api.put(`/menu/${editingId}`, fd, config);
        toast.success('Đã cập nhật sản phẩm');
      } else {
        await api.post('/menu', fd, config);
        toast.success('Đã thêm sản phẩm mới');
      }
      
      closeModal();
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này không?')) return;
    try {
      await api.delete(`/menu/${id}`);
      toast.success('Đã xóa sản phẩm');
      fetchData();
    } catch (err) {
      toast.error('Lỗi khi xóa sản phẩm');
    }
  };

  const toggleAvailability = async (id) => {
    try {
      await api.patch(`/menu/${id}/toggle`);
      fetchData();
    } catch (err) {
      toast.error('Lỗi khi cập nhật trạng thái');
    }
  };

  const [activeCat, setActiveCat] = useState('');

  const displayProducts = activeCat 
    ? products.filter(p => (p.category?._id || p.category) === activeCat) 
    : products;

  const CatBtn = ({ active, children, onClick }) => (
    <button onClick={onClick} className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all border-2 ${active ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}>
      {children}
    </button>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto font-sans text-slate-800">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Thực đơn</h1>
          <p className="text-slate-500 font-medium mt-1">Quản lý sản phẩm và hình ảnh</p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
        >
          <span className="text-xl leading-none">+</span>
          Thêm sản phẩm
        </button>
      </div>

      {/* Bộ lọc danh mục */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
        <CatBtn active={!activeCat} onClick={() => setActiveCat('')}>Tất cả</CatBtn>
        {categories.map(c => (
          <CatBtn key={c._id} active={activeCat === c._id} onClick={() => setActiveCat(activeCat === c._id ? '' : c._id)}>
            {c.icon} {c.name}
          </CatBtn>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 h-64 animate-pulse">
              <div className="w-full h-32 bg-slate-200 rounded-2xl mb-4" />
              <div className="h-4 bg-slate-200 rounded-full w-3/4 mb-2" />
              <div className="h-4 bg-slate-200 rounded-full w-1/2" />
            </div>
          ))}
        </div>
      ) : displayProducts.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl opacity-20 mb-4">☕</div>
          <p className="text-slate-500 font-bold text-lg">Không có sản phẩm nào trong danh mục này</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {displayProducts.map(product => (
            <div key={product._id} className={`bg-white rounded-3xl p-4 shadow-sm border ${product.isAvailable ? 'border-slate-200' : 'border-red-200 bg-red-50/30'} flex flex-col group relative transition-all hover:shadow-md hover:-translate-y-1`}>
              {/* Image */}
              <div className="w-full aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-100 relative">
                {product.image ? (
                  <img src={getImageUrl(product.image)} alt={product.name} className={`w-full h-full object-cover ${!product.isAvailable && 'grayscale'}`} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl opacity-20">☕</div>
                )}
                
                {/* Actions overlay on hover */}
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => openModal(product)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600 hover:scale-110 transition-transform shadow-lg" title="Sửa">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(product._id)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-600 hover:scale-110 transition-transform shadow-lg" title="Xóa">
                    🗑️
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3 className="font-bold text-slate-800 leading-tight line-clamp-2">{product.name}</h3>
                  <button 
                    onClick={() => toggleAvailability(product._id)}
                    className={`shrink-0 w-8 h-4 rounded-full transition-colors relative ${product.isAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}
                    title={product.isAvailable ? 'Đang bán' : 'Hết hàng'}
                  >
                    <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${product.isAvailable ? 'left-4.5 right-0.5' : 'left-0.5'}`} />
                  </button>
                </div>
                <p className="text-xs font-bold text-slate-400 mb-2">{product.category?.name}</p>
                <div className="mt-auto pt-2 flex items-end justify-between border-t border-slate-100">
                  <span className="font-black text-indigo-600">{fmt(product.price)}</span>
                  {!product.isAvailable && <span className="text-[10px] font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-md">Hết hàng</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Thêm/Sửa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-xl font-black text-slate-800">{editingId ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              <button onClick={closeModal} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 font-bold">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
              <div className="flex gap-6">
                {/* Cột ảnh */}
                <div className="w-1/3 shrink-0">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Hình ảnh</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-square border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 transition-colors flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group"
                  >
                    {previewUrl ? (
                      <>
                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-white text-xs font-bold bg-black/60 px-3 py-1.5 rounded-full">Đổi ảnh</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <span className="text-3xl block mb-2 opacity-30">📷</span>
                        <span className="text-xs font-bold text-slate-400">Nhấn để chọn ảnh</span>
                      </div>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange}
                  />
                </div>

                {/* Cột thông tin */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên món <span className="text-red-500">*</span></label>
                    <input 
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="VD: Cà Phê Sữa Đá"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Danh mục <span className="text-red-500">*</span></label>
                    <select
                      required
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                    >
                      <option value="" disabled>Chọn danh mục</option>
                      {categories.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Giá bán (VNĐ) <span className="text-red-500">*</span></label>
                    <input 
                      required
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                      placeholder="VD: 35000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Mô tả (tùy chọn)</label>
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none h-20"
                      placeholder="Thông tin thêm về món nước..."
                    />
                  </div>
                </div>
              </div>
            </form>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={closeModal} 
                className="px-6 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors"
                disabled={saving}
              >
                Hủy
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={saving}
                className="px-8 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center min-w-[120px]"
              >
                {saving ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  'Lưu lại'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
