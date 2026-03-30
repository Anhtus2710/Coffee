import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_LABELS = {
  admin: 'Quản trị viên', manager: 'Quản lý',
  cashier: 'Thu ngân', barista: 'Pha chế', waiter: 'Phục vụ'
};

const navItems = [
  { to: '/',        icon: '▦',  label: 'Tổng Quan',     end: true },
  { to: '/orders',  icon: '📋', label: 'Đơn Hàng' },
  { to: '/tables',  icon: '🪑', label: 'Quản Lý Bàn' },
  { to: '/menu',    icon: '☕', label: 'Menu & Sản Phẩm' },
  { to: '/staff',   icon: '👥', label: 'Nhân Viên',     roles: ['admin', 'manager'] },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-surface-800 border-r border-surface-600 flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-surface-600">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-lg">
              ☕
            </div>
            <div>
              <h1 className="font-display font-semibold text-stone-100 text-base leading-tight">Coffee Shop</h1>
              <p className="text-stone-500 text-xs">Management System</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(item => {
            if (item.roles && !item.roles.includes(user?.role)) return null;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <span className="text-base w-5 text-center">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-surface-600">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-700 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-sm font-semibold text-brand-400">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-stone-200 text-sm font-medium truncate">{user?.name}</p>
              <p className="text-stone-500 text-xs">{ROLE_LABELS[user?.role]}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full text-left nav-link text-red-400 hover:text-red-300 hover:bg-red-900/20">
            <span>→</span> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-surface-900">
        <Outlet />
      </main>
    </div>
  );
}
