import { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

const fmt = (n) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';
const shortFmt = (n) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'tr';
  if (n >= 1000) return (n / 1000).toFixed(0) + 'k';
  return n;
};

// Hàm xử lý dữ liệu cho biểu đồ
const processChartData = (allPaid, datePaid, selectedDate, view) => {
  let data = [];

  if (view === 'day') {
    // Từ 00:00 đến 23:59
    const hours = Array.from({length: 24}, (_, i) => ({ label: `${i}h`, total: 0 }));
    datePaid.forEach(o => {
      const h = new Date(o.createdAt).getHours();
      if (h >= 0 && h < 24) hours[h].total += o.total;
    });
    data = hours;
  } 
  else if (view === 'week') {
    // T2-CN
    const dateObj = new Date(selectedDate);
    const dayOfWeek = dateObj.getDay(); // 0 is Sunday
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(dateObj);
    monday.setDate(dateObj.getDate() + diffToMonday);
    
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const weekData = Array.from({length: 7}, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return { 
        dateString: d.toISOString().split('T')[0], 
        label: days[i], 
        total: 0 
      };
    });
    
    allPaid.forEach(o => {
      const d = new Date(o.createdAt).toISOString().split('T')[0];
      const match = weekData.find(day => day.dateString === d);
      if (match) match.total += o.total;
    });
    data = weekData.map(({label, total}) => ({label, total}));
  }
  else if (view === 'month') {
    // Các ngày trong tháng
    const dateObj = new Date(selectedDate);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const monthData = Array.from({length: daysInMonth}, (_, i) => {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(i + 1).padStart(2, '0');
      return { 
        dateString: `${year}-${mStr}-${dStr}`, 
        label: `${i + 1}`, 
        total: 0 
      };
    });
    
    allPaid.forEach(o => {
      const d = new Date(o.createdAt).toISOString().split('T')[0];
      const match = monthData.find(day => day.dateString === d);
      if (match) match.total += o.total;
    });
    data = monthData.map(({label, total}) => ({label, total}));
  }
  else if (view === 'year') {
    // 12 tháng trong năm
    const dateObj = new Date(selectedDate);
    const year = dateObj.getFullYear();
    
    const yearData = Array.from({length: 12}, (_, i) => ({ 
      monthNum: i, 
      label: `T${i + 1}`, 
      total: 0 
    }));
    
    allPaid.forEach(o => {
      const d = new Date(o.createdAt);
      if (d.getFullYear() === year) {
        yearData[d.getMonth()].total += o.total;
      }
    });
    data = yearData.map(({label, total}) => ({label, total}));
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
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [allOrders, setAllOrders] = useState([]);
  const [dateOrders, setDateOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState('day');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [allRes, dateRes, tablesRes] = await Promise.all([
          api.get('/orders?limit=1000&status=paid'),
          api.get(`/orders?limit=500&status=paid&date=${selectedDate}`),
          api.get('/tables'),
        ]);

        const allPaid   = allRes.data.data   || [];
        const datePaid  = dateRes.data.data  || [];
        const tables    = tablesRes.data.data || [];

        const totalRevenue = allPaid.reduce((s, o) => s + (o.total || 0), 0);
        const dateRevenue = datePaid.reduce((s, o) => s + (o.total || 0), 0);

        setAllOrders(allPaid);
        setDateOrders(datePaid);

        setStats({
          totalRevenue,
          totalOrders: allPaid.length,
          todayRevenue: dateRevenue,
          todayOrders: datePaid.length,
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
  }, [selectedDate]);

  const chartData = useMemo(() => processChartData(allOrders, dateOrders, selectedDate, chartView), [allOrders, dateOrders, selectedDate, chartView]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
      <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
      <p className="font-bold">Đang tải dữ liệu...</p>
    </div>
  );

  const cards = [
    { label: 'Doanh thu trong ngày', value: fmt(stats.todayRevenue),   icon: '💰', bg: 'bg-emerald-50', border: 'border-emerald-100', color: 'text-emerald-700' },
    { label: 'Đơn trong ngày',       value: stats.todayOrders,          icon: '📋', bg: 'bg-blue-50', border: 'border-blue-100', color: 'text-blue-700' },
    { label: 'Doanh thu tổng',    value: fmt(stats.totalRevenue),    icon: '📊', bg: 'bg-purple-50', border: 'border-purple-100', color: 'text-purple-700' },
    { label: 'Trung bình/đơn',   value: fmt(stats.avgOrderValue),   icon: '📈', bg: 'bg-orange-50', border: 'border-orange-100', color: 'text-orange-700' },
    { label: 'Bàn đang dùng',    value: stats.occupiedTables,        icon: '🪑', bg: 'bg-rose-50', border: 'border-rose-100', color: 'text-rose-700' },
    { label: 'Bàn trống',         value: stats.availableTables,       icon: '✓',  bg: 'bg-green-50', border: 'border-green-100', color: 'text-green-700' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-8">
      
      {/* Header & Stats Cards */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <span className="text-3xl">📊</span> Tổng quan
          </h2>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            className="px-4 py-2 rounded-xl border-2 border-slate-200 font-bold text-slate-700 outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
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
              { id: 'day', label: 'Biểu đồ trong ngày' },
              { id: 'week', label: 'Biểu đồ trong tuần' },
              { id: 'month', label: 'Biểu đồ trong tháng' },
              { id: 'year', label: 'Biểu đồ trong năm' },
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

        {/* Recharts BarChart */}
        <div className="h-[400px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                dy={10}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar 
                dataKey="total" 
                fill="#6366f1" 
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              >
                <LabelList dataKey="total" position="top" formatter={(val) => val > 0 ? shortFmt(val) : ''} style={{ fill: '#6366f1', fontSize: 12, fontWeight: 700 }} dy={-5} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
