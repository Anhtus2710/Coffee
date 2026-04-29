import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

// Hàm xử lý dữ liệu cho biểu đồ
const processChartData = (orders, view) => {
  const now = new Date();
  let data = [];

  if (view === 'day') {
    // Từ 6h sáng đến 23h hôm nay
    const hours = Array.from({length: 24}, (_, i) => ({ label: `${i}h`, total: 0 }));
    orders.forEach(o => {
      const d = new Date(o.createdAt);
      if (d.toDateString() === now.toDateString()) {
        hours[d.getHours()].total += o.total;
      }
    });
    data = hours.slice(6, 24);
  } 
  else if (view === 'week') {
    // 7 ngày gần nhất
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (6 - i));
      return { 
        dateString: d.toDateString(), 
        label: days[d.getDay()], 
        total: 0 
      };
    });
    
    orders.forEach(o => {
      const d = new Date(o.createdAt).toDateString();
      const match = last7Days.find(day => day.dateString === d);
      if (match) match.total += o.total;
    });
    data = last7Days.map(({label, total}) => ({label, total}));
  }
  else if (view === 'month') {
    // 30 ngày gần nhất
    const last30Days = Array.from({length: 30}, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (29 - i));
      return { 
        dateString: d.toDateString(), 
        label: `${d.getDate()}/${d.getMonth()+1}`, 
        total: 0 
      };
    });
    orders.forEach(o => {
      const d = new Date(o.createdAt).toDateString();
      const match = last30Days.find(day => day.dateString === d);
      if (match) match.total += o.total;
    });
    data = last30Days.map(({label, total}) => ({label, total}));
  }
  else if (view === 'year') {
    // 12 tháng năm nay
    const months = Array.from({length: 12}, (_, i) => ({ 
      monthNum: i, 
      label: `Tháng ${i + 1}`, 
      total: 0 
    }));
    orders.forEach(o => {
      const d = new Date(o.createdAt);
      if (d.getFullYear() === now.getFullYear()) {
        months[d.getMonth()].total += o.total;
      }
    });
    data = months.map(({label, total}) => ({label, total}));
  }

  return data;
};

// Custom Tooltip cho Recharts
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl shadow-slate-900/20 text-sm border border-slate-700">
        <p className="font-bold mb-1 opacity-70 uppercase tracking-wider text-[10px]">{label}</p>
        <p className="font-black text-indigo-400 text-lg">{fmt(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0, totalOrders: 0,
    todayRevenue: 0, todayOrders: 0,
    avgOrderValue: 0, occupiedTables: 0, availableTables: 0,
  });
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState('week');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [allRes, todayRes, tablesRes] = await Promise.all([
          api.get('/orders?limit=1000&status=paid'),
          api.get(`/orders?limit=500&status=paid&date=${today}`),
          api.get('/tables'),
        ]);

        const allPaid   = allRes.data.data   || [];
        const todayPaid = todayRes.data.data || [];
        const tables    = tablesRes.data.data || [];

        const totalRevenue = allPaid.reduce((s, o) => s + (o.total || 0), 0);
        const todayRevenue = todayPaid.reduce((s, o) => s + (o.total || 0), 0);

        setAllOrders(allPaid);

        setStats({
          totalRevenue,
          totalOrders: allPaid.length,
          todayRevenue,
          todayOrders: todayPaid.length,
          avgOrderValue: allPaid.length > 0 ? Math.round(totalRevenue / allPaid.length) : 0,
          occupiedTables:  tables.filter(t => t.status === 'occupied').length,
          availableTables: tables.filter(t => t.status === 'available').length,
        });
      } catch {
        toast.error('Không tải được thống kê');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const iv = setInterval(fetchStats, 15000);
    return () => clearInterval(iv);
  }, []);

  const chartData = useMemo(() => processChartData(allOrders, chartView), [allOrders, chartView]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
      <p className="font-bold">Đang tải dữ liệu...</p>
    </div>
  );

  const cards = [
    { label: 'Doanh thu hôm nay', value: fmt(stats.todayRevenue),   icon: '💰', bg: 'bg-emerald-50', border: 'border-emerald-100', color: 'text-emerald-700' },
    { label: 'Đơn hôm nay',       value: stats.todayOrders,          icon: '📋', bg: 'bg-blue-50', border: 'border-blue-100', color: 'text-blue-700' },
    { label: 'Doanh thu tổng',    value: fmt(stats.totalRevenue),    icon: '📊', bg: 'bg-purple-50', border: 'border-purple-100', color: 'text-purple-700' },
    { label: 'Trung bình/đơn',   value: fmt(stats.avgOrderValue),   icon: '📈', bg: 'bg-orange-50', border: 'border-orange-100', color: 'text-orange-700' },
    { label: 'Bàn đang dùng',    value: stats.occupiedTables,        icon: '🪑', bg: 'bg-rose-50', border: 'border-rose-100', color: 'text-rose-700' },
    { label: 'Bàn trống',         value: stats.availableTables,       icon: '✓',  bg: 'bg-green-50', border: 'border-green-100', color: 'text-green-700' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-8">
      
      {/* Header & Stats Cards */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-2xl font-black text-slate-800 mb-6 flex items-center gap-2">
          <span className="text-3xl">📊</span> Tổng quan
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {cards.map((c, i) => (
            <div key={i} className={`${c.bg} border ${c.border} rounded-2xl p-5 relative overflow-hidden transition-all hover:scale-105 hover:shadow-lg`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-2 opacity-80 ${c.color}`}>{c.label}</p>
              <p className={`text-2xl font-black ${c.color}`}>{c.value}</p>
              <span className="absolute -bottom-2 -right-2 text-6xl opacity-10 grayscale">{c.icon}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-800">Biểu đồ doanh thu</h3>
            <p className="text-sm font-medium text-slate-400 mt-1">Xu hướng bán hàng theo thời gian</p>
          </div>
          
          {/* Chart View Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl">
            {[
              { id: 'day', label: 'Hôm nay' },
              { id: 'week', label: 'Tuần này' },
              { id: 'month', label: 'Tháng này' },
              { id: 'year', label: 'Năm nay' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setChartView(tab.id)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  chartView === tab.id 
                    ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recharts AreaChart */}
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                tickFormatter={(value) => value >= 1000000 ? `${value / 1000000}M` : value >= 1000 ? `${value / 1000}k` : value}
                dx={-10}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#6366f1" 
                strokeWidth={4}
                fillOpacity={1} 
                fill="url(#colorTotal)" 
                activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 3, shadow: '0 0 10px rgba(99,102,241,0.5)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
