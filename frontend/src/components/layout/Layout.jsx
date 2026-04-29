import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_LABELS = { admin: 'Quản trị viên', barista: 'Pha chế', waiter: 'Phục vụ' };

const NAV_ITEMS = [
  {
    to: '/',
    end: true,
    label: 'Tổng quan',
    roles: ['admin'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    to: '/orders',
    label: 'Đơn hàng',
    roles: ['admin'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    ),
  },
  {
    to: '/menu',
    label: 'Thực đơn',
    roles: ['admin'],
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F1F5F9' }}>
      {/* ── Sidebar ── */}
      <aside
        className={`flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out relative ${isCollapsed ? 'w-20' : 'w-56'}`}
        style={{
          background: '#FFFFFF',
          borderRight: '1px solid rgba(148,163,184,0.18)',
          boxShadow: '2px 0 12px rgba(0,0,0,0.04)',
        }}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-colors z-50"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }}>
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {/* Logo */}
        <div
          className={`py-5 flex flex-col items-center justify-center transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-5'}`}
          style={{ borderBottom: '1px solid rgba(148,163,184,0.14)', minHeight: '76px' }}
        >
          <div className="flex items-center gap-3 w-full" style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
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
            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap transition-all duration-300">
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
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
          {NAV_ITEMS.map(item => {
            if (item.roles && !item.roles.includes(user?.role)) return null;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={isCollapsed ? item.label : undefined}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''} ${item.highlight ? 'nav-highlight' : ''}`}
                style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '10px' : '10px 12px' }}
              >
                <span style={{ opacity: 0.70, flexShrink: 0 }}>{item.icon}</span>
                {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User info */}
        <div className={`pb-4 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-3'}`} style={{ borderTop: '1px solid rgba(148,163,184,0.14)' }}>
          <div
            className={`flex items-center gap-3 mb-2 transition-all duration-300 ${isCollapsed ? 'p-2 justify-center' : 'p-3'}`}
            style={{
              background: '#F8FAFC',
              border: '1px solid rgba(148,163,184,0.14)',
              borderRadius: 12,
              marginTop: '12px'
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
              title={isCollapsed ? user?.name : undefined}
            >
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0 whitespace-nowrap">
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
            )}
          </div>
          <button
            onClick={logout}
            className="nav-item w-full flex items-center justify-center"
            title={isCollapsed ? "Đăng xuất" : undefined}
            style={{ color: '#94A3B8', fontSize: '0.8125rem', padding: '9px 12px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.60, marginRight: isCollapsed ? 0 : '8px' }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {!isCollapsed && <span className="whitespace-nowrap">Đăng xuất</span>}
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
