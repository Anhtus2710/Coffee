import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
const fmtNum = (n) => new Intl.NumberFormat('vi-VN').format(n);

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className={`card p-5 relative overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -translate-y-8 translate-x-8 ${accent} opacity-10 blur-2xl`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-stone-500 text-xs font-medium uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-display font-semibold text-stone-100 mt-1">{value}</p>
          {sub && <p className="text-xs text-stone-500 mt-1">{sub}</p>}
        </div>
        <span className="text-2xl opacity-80">{icon}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [todayOrders, setTodayOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    Promise.all([
      api.get(`/orders?date=${today}&limit=5`),
      api.get('/tables'),
      api.get('/staff'),
    ]).then(([ordersRes, tablesRes, staffRes]) => {
      const orders = ordersRes.data.data;
      const tables = tablesRes.data.data;
      setTodayOrders(orders);
      const todayRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);
      setStats({
        totalOrders: ordersRes.data.total,
        revenue: todayRevenue,
        occupied: tables.filter(t => t.status === 'occupied').length,
        totalTables: tables.length,
        totalStaff: staffRes.data.total,
        activeOrders: orders.filter(o => !['paid','cancelled'].includes(o.status)).length,
      });
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-8 flex justify-center">
      <div className="animate-spin text-3xl">⟳</div>
    </div>
  );

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-stone-100">
          {greeting}, {user?.name?.split(' ').slice(-1)[0]} ☕
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="💰" label="Doanh Thu Hôm Nay" value={fmt(stats?.revenue || 0)} sub="Đã thanh toán" accent="bg-brand-500" />
        <StatCard icon="📋" label="Đơn Đang Xử Lý" value={fmtNum(stats?.activeOrders || 0)} sub={`Tổng hôm nay: ${stats?.totalOrders || 0}`} accent="bg-blue-500" />
        <StatCard icon="🪑" label="Bàn Đang Dùng" value={`${stats?.occupied || 0}/${stats?.totalTables || 0}`} sub="bàn đang có khách" accent="bg-orange-500" />
        <StatCard icon="👥" label="Nhân Viên" value={fmtNum(stats?.totalStaff || 0)} sub="đang trong hệ thống" accent="bg-purple-500" />
      </div>

      {/* Recent orders */}
      <div className="card">
        <div className="p-5 border-b border-surface-600 flex items-center justify-between">
          <h2 className="font-display font-semibold text-stone-100">Đơn Hàng Hôm Nay</h2>
          <span className="badge bg-brand-500/15 text-brand-400 border border-brand-500/20">{todayOrders.length} đơn</span>
        </div>
        <div className="overflow-x-auto">
          {todayOrders.length === 0 ? (
            <div className="p-8 text-center text-stone-500">
              <div className="text-3xl mb-2">📋</div>
              <p>Chưa có đơn hàng hôm nay</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-surface-700/50">
                <tr>
                  <th className="th">Mã đơn</th>
                  <th className="th">Bàn</th>
                  <th className="th">Món</th>
                  <th className="th">Tổng tiền</th>
                  <th className="th">Trạng thái</th>
                  <th className="th">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {todayOrders.map(order => (
                  <tr key={order._id} className="table-row">
                    <td className="td font-mono text-brand-400 text-xs">{order.orderCode}</td>
                    <td className="td">Bàn {order.tableNumber || '—'}</td>
                    <td className="td text-stone-400">{order.items.length} món</td>
                    <td className="td font-medium">{fmt(order.total)}</td>
                    <td className="td">
                      <span className={`badge border text-xs ${
                        order.status === 'paid' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20' :
                        order.status === 'cancelled' ? 'bg-red-500/15 text-red-400 border-red-500/20' :
                        order.status === 'preparing' ? 'bg-orange-500/15 text-orange-400 border-orange-500/20' :
                        'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
                      }`}>
                        {order.status === 'paid' ? 'Đã thanh toán' :
                         order.status === 'cancelled' ? 'Đã hủy' :
                         order.status === 'preparing' ? 'Đang pha chế' :
                         order.status === 'pending' ? 'Chờ xác nhận' : order.status}
                      </span>
                    </td>
                    <td className="td text-stone-500 text-xs">
                      {new Date(order.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
