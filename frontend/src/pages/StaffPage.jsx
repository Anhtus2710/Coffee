import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

const ROLES = { admin: 'Quản trị viên', manager: 'Quản lý', cashier: 'Thu ngân', barista: 'Pha chế', waiter: 'Phục vụ' };
const ROLE_COLORS = {
  admin:   'bg-purple-500/15 text-purple-400 border-purple-500/20',
  manager: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  cashier: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  barista: 'bg-brand-500/15 text-brand-400 border-brand-500/20',
  waiter:  'bg-teal-500/15 text-teal-400 border-teal-500/20',
};
const SHIFTS = { morning: '🌅 Ca sáng', afternoon: '☀️ Ca chiều', evening: '🌙 Ca tối', full: '🕐 Toàn thời gian' };

const EMPTY_STAFF = { name: '', email: '', password: '', role: 'waiter', phone: '', salary: '', shift: 'full' };

function StaffForm({ staff, onSave, onClose, isAdmin }) {
  const [form, setForm] = useState(staff ? { ...staff, password: '' } : EMPTY_STAFF);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, salary: Number(form.salary) };
      if (!payload.password) delete payload.password;
      let res;
      if (staff?._id) {
        res = await api.put(`/staff/${staff._id}`, payload);
        toast.success('Đã cập nhật nhân viên');
      } else {
        res = await api.post('/staff', payload);
        toast.success('Đã thêm nhân viên mới');
      }
      onSave(res.data.data, staff ? 'update' : 'create');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra');
    } finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Họ tên *</label>
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Nguyễn Văn A" />
        </div>
        <div>
          <label className="label">Email *</label>
          <input className="input" type="email" value={form.email} onChange={e => set('email', e.target.value)} required placeholder="nhanvien@coffee.com" />
        </div>
        <div>
          <label className="label">Số điện thoại</label>
          <input className="input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0901234567" />
        </div>
        <div>
          <label className="label">{staff ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}</label>
          <input className="input" type="password" value={form.password} onChange={e => set('password', e.target.value)} required={!staff} placeholder="••••••" minLength={6} />
        </div>
        <div>
          <label className="label">Lương (VNĐ)</label>
          <input className="input" type="number" value={form.salary} onChange={e => set('salary', e.target.value)} placeholder="8000000" />
        </div>
        {isAdmin && (
          <div>
            <label className="label">Vai trò</label>
            <select className="input" value={form.role} onChange={e => set('role', e.target.value)}>
              {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
        )}
        <div>
          <label className="label">Ca làm việc</label>
          <select className="input" value={form.shift} onChange={e => set('shift', e.target.value)}>
            {Object.entries(SHIFTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Hủy</button>
        <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
          {saving ? '...' : staff ? 'Cập nhật' : 'Thêm nhân viên'}
        </button>
      </div>
    </form>
  );
}

export default function StaffPage() {
  const { isAdmin } = useAuth();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [modal, setModal] = useState(null);
  const [editStaff, setEditStaff] = useState(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterRole) params.set('role', filterRole);
      const res = await api.get(`/staff?${params}`);
      setStaff(res.data.data);
    } finally { setLoading(false); }
  }, [search, filterRole]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const handleSave = (member, type) => {
    if (type === 'create') setStaff(p => [member, ...p]);
    else setStaff(p => p.map(s => s._id === member._id ? member : s));
  };

  const handleToggle = async (id) => {
    try {
      const res = await api.patch(`/staff/${id}/toggle`);
      setStaff(p => p.map(s => s._id === id ? res.data.data : s));
      toast.success('Đã cập nhật trạng thái');
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa nhân viên này khỏi hệ thống?')) return;
    try {
      await api.delete(`/staff/${id}`);
      setStaff(p => p.filter(s => s._id !== id));
      toast.success('Đã xóa nhân viên');
    } catch { toast.error('Không thể xóa nhân viên này'); }
  };

  const activeStaff = staff.filter(s => s.isActive);

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-stone-100">Quản Lý Nhân Viên</h1>
          <p className="text-stone-500 text-sm mt-0.5">{staff.length} nhân viên • {activeStaff.length} đang làm việc</p>
        </div>
        {isAdmin && (
          <button onClick={() => { setEditStaff(null); setModal('add'); }} className="btn-primary text-sm">
            + Thêm nhân viên
          </button>
        )}
      </div>

      {/* Role summary cards */}
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(ROLES).map(([role, label]) => {
          const count = staff.filter(s => s.role === role && s.isActive).length;
          return (
            <div key={role} className="card p-3 text-center">
              <p className={`badge border text-xs mx-auto mb-1 ${ROLE_COLORS[role]}`}>{label}</p>
              <p className="font-display text-xl font-semibold text-stone-100">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3 items-center flex-wrap">
        <input
          className="input w-56 text-sm"
          placeholder="🔍 Tìm nhân viên..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-1.5 flex-wrap">
          <button onClick={() => setFilterRole('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!filterRole ? 'bg-brand-500 text-white' : 'bg-surface-700 text-stone-400 hover:text-stone-200'}`}>
            Tất cả
          </button>
          {Object.entries(ROLES).map(([k, v]) => (
            <button key={k} onClick={() => setFilterRole(k)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterRole === k ? 'bg-brand-500 text-white' : 'bg-surface-700 text-stone-400 hover:text-stone-200'}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Staff table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-stone-500">⟳ Đang tải...</div>
        ) : staff.length === 0 ? (
          <div className="text-center py-12 text-stone-500">
            <div className="text-4xl mb-3">👥</div>
            <p>Không có nhân viên nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-700/50">
                <tr>
                  <th className="th">Nhân viên</th>
                  <th className="th">Vai trò</th>
                  <th className="th">Ca làm</th>
                  <th className="th">Lương</th>
                  <th className="th">Trạng thái</th>
                  <th className="th">Ngày vào</th>
                  {isAdmin && <th className="th">Thao tác</th>}
                </tr>
              </thead>
              <tbody>
                {staff.map(member => (
                  <tr key={member._id} className="table-row">
                    <td className="td">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-sm font-semibold text-brand-400 flex-shrink-0">
                          {member.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-stone-100 text-sm">{member.name}</p>
                          <p className="text-xs text-stone-500">{member.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="td">
                      <span className={`badge border text-xs ${ROLE_COLORS[member.role]}`}>{ROLES[member.role]}</span>
                    </td>
                    <td className="td text-stone-400 text-xs">{SHIFTS[member.shift]}</td>
                    <td className="td font-medium text-stone-200">{member.salary ? fmt(member.salary) : '—'}</td>
                    <td className="td">
                      <span className={`badge border text-xs ${member.isActive ? 'bg-green-500/15 text-green-400 border-green-500/20' : 'bg-stone-500/15 text-stone-400 border-stone-500/20'}`}>
                        {member.isActive ? 'Đang làm' : 'Nghỉ việc'}
                      </span>
                    </td>
                    <td className="td text-stone-500 text-xs">
                      {new Date(member.startDate || member.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    {isAdmin && (
                      <td className="td">
                        <div className="flex gap-1.5">
                          <button onClick={() => { setEditStaff(member); setModal('edit'); }}
                            className="text-xs px-2.5 py-1 rounded-md bg-surface-700 hover:bg-surface-600 text-stone-400 hover:text-stone-200 border border-surface-500 transition-colors">
                            Sửa
                          </button>
                          <button onClick={() => handleToggle(member._id)}
                            className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${member.isActive ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/20 hover:bg-yellow-900/50' : 'bg-green-900/30 text-green-400 border-green-500/20 hover:bg-green-900/50'}`}>
                            {member.isActive ? 'Vô hiệu' : 'Kích hoạt'}
                          </button>
                          <button onClick={() => handleDelete(member._id)}
                            className="text-xs px-2.5 py-1 rounded-md bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-500/20 transition-colors">
                            Xóa
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Staff form modal */}
      <Modal
        isOpen={!!modal}
        onClose={() => setModal(null)}
        title={modal === 'edit' ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
        size="md"
      >
        <StaffForm
          staff={editStaff}
          onSave={handleSave}
          onClose={() => setModal(null)}
          isAdmin={isAdmin}
        />
      </Modal>
    </div>
  );
}
