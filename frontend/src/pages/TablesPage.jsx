import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Modal from '../components/common/Modal';
import { useAuth } from '../context/AuthContext';

const ZONES = { indoor: { label: 'Trong nhà', icon: '🏠' }, outdoor: { label: 'Ngoài trời', icon: '🌿' }, vip: { label: 'VIP', icon: '👑' }, bar: { label: 'Quầy Bar', icon: '🍸' } };
const STATUS_STYLES = {
  available: 'border-green-500/40 bg-green-500/5 hover:bg-green-500/10',
  occupied:  'border-red-500/40 bg-red-500/8 hover:bg-red-500/12',
  reserved:  'border-yellow-500/40 bg-yellow-500/5 hover:bg-yellow-500/10',
  cleaning:  'border-purple-500/40 bg-purple-500/5 hover:bg-purple-500/10',
};
const STATUS_DOT = {
  available: 'bg-green-400', occupied: 'bg-red-400', reserved: 'bg-yellow-400', cleaning: 'bg-purple-400'
};
const STATUS_LABELS = { available: 'Trống', occupied: 'Đang dùng', reserved: 'Đặt trước', cleaning: 'Đang dọn' };
const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

function TableCard({ table, onStatusChange, onSelect }) {
  return (
    <div
      onClick={() => onSelect(table)}
      className={`relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${STATUS_STYLES[table.status]}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="font-display font-semibold text-stone-100 text-lg">
          {table.name || `Bàn ${table.number}`}
        </span>
        <div className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[table.status]} ${table.status === 'occupied' ? 'animate-pulse' : ''}`} />
      </div>
      <div className="space-y-1">
        <p className="text-xs text-stone-500">{ZONES[table.zone]?.icon} {ZONES[table.zone]?.label}</p>
        <p className="text-xs text-stone-500">👤 {table.capacity} người</p>
      </div>
      <div className="mt-3">
        <span className={`badge border text-xs ${
          table.status === 'available' ? 'bg-green-500/15 text-green-400 border-green-500/20' :
          table.status === 'occupied'  ? 'bg-red-500/15 text-red-400 border-red-500/20' :
          table.status === 'reserved' ? 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20' :
          'bg-purple-500/15 text-purple-400 border-purple-500/20'
        }`}>
          {STATUS_LABELS[table.status]}
        </span>
      </div>
      {table.currentOrder && (
        <div className="mt-2 pt-2 border-t border-surface-500">
          <p className="text-xs text-stone-400 font-mono">{table.currentOrder.orderCode}</p>
          <p className="text-xs font-medium text-brand-400">{fmt(table.currentOrder.total)}</p>
        </div>
      )}
    </div>
  );
}

export default function TablesPage() {
  const { isManager } = useAuth();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [newTable, setNewTable] = useState({ number: '', capacity: 4, zone: 'indoor', name: '' });
  const [filterZone, setFilterZone] = useState('');

  const fetchTables = async () => {
    try {
      const res = await api.get('/tables');
      setTables(res.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchTables(); }, []);

  const handleStatusChange = async (tableId, status) => {
    try {
      const res = await api.patch(`/tables/${tableId}/status`, { status });
      setTables(p => p.map(t => t._id === tableId ? res.data.data : t));
      setSelectedTable(res.data.data);
      toast.success('Đã cập nhật trạng thái bàn');
    } catch { toast.error('Có lỗi xảy ra'); }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/tables', { ...newTable, number: Number(newTable.number), capacity: Number(newTable.capacity) });
      setTables(p => [...p, res.data.data].sort((a, b) => a.number - b.number));
      setAddModal(false);
      setNewTable({ number: '', capacity: 4, zone: 'indoor', name: '' });
      toast.success('Đã thêm bàn mới');
    } catch (err) { toast.error(err.response?.data?.message || 'Có lỗi xảy ra'); }
  };

  const handleDeleteTable = async (id) => {
    if (!confirm('Xóa bàn này?')) return;
    try {
      await api.delete(`/tables/${id}`);
      setTables(p => p.filter(t => t._id !== id));
      setSelectedTable(null);
      toast.success('Đã xóa bàn');
    } catch { toast.error('Không thể xóa bàn'); }
  };

  const filtered = filterZone ? tables.filter(t => t.zone === filterZone) : tables;
  const stats = {
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
  };

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-stone-100">Quản Lý Bàn</h1>
          <p className="text-stone-500 text-sm mt-0.5">{tables.length} bàn • {stats.occupied} đang có khách</p>
        </div>
        {isManager && (
          <button onClick={() => setAddModal(true)} className="btn-primary text-sm">+ Thêm bàn</button>
        )}
      </div>

      {/* Quick stats */}
      <div className="flex gap-3 flex-wrap">
        {[
          { label: 'Trống', count: stats.available, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
          { label: 'Đang dùng', count: stats.occupied, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
          { label: 'Đặt trước', count: stats.reserved, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${s.color}`}>
            <span className="font-semibold">{s.count}</span>
            <span className="opacity-80">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Zone filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterZone('')} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!filterZone ? 'bg-brand-500 text-white' : 'bg-surface-700 text-stone-400 hover:text-stone-200'}`}>
          Tất cả
        </button>
        {Object.entries(ZONES).map(([key, z]) => (
          <button key={key} onClick={() => setFilterZone(key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterZone === key ? 'bg-brand-500 text-white' : 'bg-surface-700 text-stone-400 hover:text-stone-200'}`}>
            {z.icon} {z.label}
          </button>
        ))}
      </div>

      {/* Tables grid */}
      {loading ? (
        <div className="text-center py-12 text-stone-500">⟳ Đang tải...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map(table => (
            <TableCard key={table._id} table={table} onStatusChange={handleStatusChange} onSelect={setSelectedTable} />
          ))}
        </div>
      )}

      {/* Table detail modal */}
      <Modal isOpen={!!selectedTable} onClose={() => setSelectedTable(null)} title={selectedTable ? (selectedTable.name || `Bàn ${selectedTable.number}`) : ''} size="sm">
        {selectedTable && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-surface-700 rounded-lg p-3">
                <p className="text-stone-500 text-xs mb-1">Khu vực</p>
                <p className="text-stone-200">{ZONES[selectedTable.zone]?.icon} {ZONES[selectedTable.zone]?.label}</p>
              </div>
              <div className="bg-surface-700 rounded-lg p-3">
                <p className="text-stone-500 text-xs mb-1">Sức chứa</p>
                <p className="text-stone-200">👤 {selectedTable.capacity} người</p>
              </div>
            </div>

            {selectedTable.currentOrder && (
              <div className="bg-surface-700 rounded-lg p-3 space-y-1">
                <p className="text-stone-500 text-xs mb-1">Đơn hàng hiện tại</p>
                <p className="text-xs font-mono text-brand-400">{selectedTable.currentOrder.orderCode}</p>
                <p className="text-sm font-semibold text-stone-100">{fmt(selectedTable.currentOrder.total)}</p>
              </div>
            )}

            <div>
              <p className="label">Đổi trạng thái bàn</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(STATUS_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => handleStatusChange(selectedTable._id, key)}
                    disabled={selectedTable.status === key}
                    className={`py-2 px-3 rounded-lg text-xs font-medium transition-all border ${
                      selectedTable.status === key
                        ? 'bg-brand-500/20 border-brand-500/40 text-brand-400'
                        : 'bg-surface-700 border-surface-500 text-stone-400 hover:text-stone-200 hover:bg-surface-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {isManager && (
              <button onClick={() => handleDeleteTable(selectedTable._id)} className="btn-danger w-full justify-center text-sm">
                Xóa bàn
              </button>
            )}
          </div>
        )}
      </Modal>

      {/* Add table modal */}
      <Modal isOpen={addModal} onClose={() => setAddModal(false)} title="Thêm bàn mới" size="sm">
        <form onSubmit={handleAddTable} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Số bàn *</label>
              <input className="input" type="number" value={newTable.number} onChange={e => setNewTable(p => ({ ...p, number: e.target.value }))} required min="1" />
            </div>
            <div>
              <label className="label">Sức chứa</label>
              <input className="input" type="number" value={newTable.capacity} onChange={e => setNewTable(p => ({ ...p, capacity: e.target.value }))} min="1" max="20" />
            </div>
            <div className="col-span-2">
              <label className="label">Tên bàn (tuỳ chọn)</label>
              <input className="input" value={newTable.name} onChange={e => setNewTable(p => ({ ...p, name: e.target.value }))} placeholder="VD: Bàn VIP 1" />
            </div>
            <div className="col-span-2">
              <label className="label">Khu vực</label>
              <select className="input" value={newTable.zone} onChange={e => setNewTable(p => ({ ...p, zone: e.target.value }))}>
                {Object.entries(ZONES).map(([k, z]) => <option key={k} value={k}>{z.icon} {z.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setAddModal(false)} className="btn-secondary flex-1 justify-center">Hủy</button>
            <button type="submit" className="btn-primary flex-1 justify-center">Thêm bàn</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
