import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_LABELS = { admin: 'Quản trị viên', barista: 'Pha chế', waiter: 'Phục vụ' };

const NAV_ITEMS = [
  {
    to: '/',
    end: true,
    label: 'Quản trị',
    roles: ['admin'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: '/serving',
    label: 'Phục vụ',
    roles: ['admin', 'waiter'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
  {
    to: '/preparing',
    label: 'Pha chế',
    roles: ['barista', 'admin'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
        <polyline points="17 2 12 7 7 2" />
      </svg>
    ),
  },
];

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F1F5F9' }}>
      {/* ── Sidebar ── */}
      <aside
        className="w-56 flex-shrink-0 flex flex-col"
        style={{
          background: '#FFFFFF',
          borderRight: '1px solid rgba(148,163,184,0.18)',
          boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
        }}
      >
        {/* Logo */}
        <div
          className="px-5 py-5"
          style={{ borderBottom: '1px solid rgba(148,163,184,0.14)' }}
        >
          <div className="flex items-center gap-3">
            {/* Logo icon */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: '#6366F1',
                boxShadow: '0 4px 12px rgba(99,102,241,0.30)',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" />
              </svg>
            </div>
            <div>
              <h1
                className="font-semibold leading-tight"
                style={{ fontSize: '0.9375rem', color: '#1E293B', letterSpacing: '-0.01em' }}
              >
                Coffee Manager
              </h1>
              <p style={{ fontSize: '0.625rem', color: '#94A3B8', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>
                Hệ thống quản lý
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            if (item.roles && !item.roles.includes(user?.role)) return null;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${item.highlight ? 'nav-highlight' : ''}`}
              >
                <span style={{ opacity: 0.70, flexShrink: 0 }}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User info */}
        <div className="px-3 pb-4" style={{ borderTop: '1px solid rgba(148,163,184,0.14)' }}>
          <div
            className="flex items-center gap-3 p-3 mb-2"
            style={{
              background: '#F8FAFC',
              border: '1px solid rgba(148,163,184,0.14)',
              borderRadius: 12,
            }}
          >
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                background: 'rgba(99,102,241,0.10)',
                border: '1px solid rgba(99,102,241,0.15)',
                color: '#6366F1',
                fontWeight: 700,
              }}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="truncate font-semibold"
                style={{ fontSize: '0.8125rem', color: '#334155', letterSpacing: '-0.01em' }}
              >
                {user?.name}
              </p>
              <p style={{ fontSize: '0.625rem', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                {ROLE_LABELS[user?.role]}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="nav-item w-full"
            style={{ color: '#94A3B8', fontSize: '0.8125rem', padding: '9px 12px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.60 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ background: '#F1F5F9' }}
      >
        <Outlet />
      </main>
    </div>
  );
}
