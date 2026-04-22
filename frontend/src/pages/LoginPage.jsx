import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [form, setForm] = useState({ email: 'admin@coffee.com', password: '123456' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
      toast.success('Đăng nhập thành công! ☕');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#EEF2FF' }}
    >
      {/* Subtle grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo + Title */}
        <div className="text-center mb-8">
          <div
            className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-4"
            style={{
              background: '#6366F1',
              boxShadow: '0 4px 16px rgba(99,102,241,0.35)',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
              <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="2" x2="6" y2="4" />
              <line x1="10" y1="2" x2="10" y2="4" />
              <line x1="14" y1="2" x2="14" y2="4" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.625rem', color: '#1E293B', letterSpacing: '-0.025em', fontWeight: 700 }}>
            Coffee Manager
          </h1>
          <p style={{ fontSize: '0.8125rem', color: '#64748B', marginTop: 6 }}>
            Đăng nhập vào hệ thống quản lý
          </p>
        </div>

        {/* Form card */}
        <div
          className="p-8"
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(148,163,184,0.20)',
            borderRadius: 20,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="nhanvien@coffee.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Mật khẩu</label>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center"
              style={{ padding: '12px 18px', fontSize: '0.9375rem' }}
            >
              {loading ? (
                <span className="animate-spin">⟳</span>
              ) : (
                <>
                  Đăng nhập
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Demo accounts */}
        <div
          className="mt-4 p-4"
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(148,163,184,0.20)',
            borderRadius: 14,
            boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
          }}
        >
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#94A3B8', marginBottom: 10 }}>
            Tài khoản demo
          </p>
          <div className="space-y-1.5">
            {[
              { email: 'admin@coffee.com', role: 'Quản trị', color: '#C084FC', bg: 'rgba(192,132,252,0.08)' },
              { email: 'barista@coffee.com', role: 'Pha chế', color: '#FB923C', bg: 'rgba(251,146,60,0.08)' },
              { email: 'waiter@coffee.com', role: 'Phục vụ', color: '#60A5FA', bg: 'rgba(96,165,250,0.08)' },
            ].map(({ email, role, color, bg }) => (
              <button
                key={email}
                onClick={() => setForm({ email, password: '123456' })}
                className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg transition-all"
                style={{
                  background: form.email === email ? bg : 'transparent',
                  border: `1px solid ${form.email === email ? color + '30' : 'transparent'}`,
                  fontSize: '0.75rem',
                }}
              >
                <span style={{ color: '#475569', fontFamily: 'monospace' }}>{email}</span>
                <span style={{ color, fontWeight: 600, fontSize: '0.6875rem' }}>{role}</span>
              </button>
            ))}
          </div>
          <p style={{ fontSize: '0.625rem', color: '#94A3B8', marginTop: 8, textAlign: 'center' }}>
            Mật khẩu: 123456 · Click để điền nhanh
          </p>
        </div>
      </div>
    </div>
  );
}
