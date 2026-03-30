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
      toast.success('Chào mừng trở lại! ☕');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-brand-700/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-brand-500/15 border border-brand-500/25 items-center justify-center text-3xl mb-4 shadow-glow">
            ☕
          </div>
          <h1 className="font-display text-2xl font-semibold text-stone-100">Coffee Shop</h1>
          <p className="text-stone-500 text-sm mt-1">Hệ thống quản lý quán cà phê</p>
        </div>

        {/* Form */}
        <div className="card p-6">
          <h2 className="text-stone-300 text-sm font-medium mb-5">Đăng nhập vào hệ thống</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="admin@coffee.com"
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
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-6">
              {loading ? (
                <><span className="animate-spin">⟳</span> Đang đăng nhập...</>
              ) : (
                'Đăng Nhập →'
              )}
            </button>
          </form>
        </div>

        {/* Demo accounts */}
        <div className="mt-4 p-3 rounded-lg bg-surface-700/50 border border-surface-500 text-xs text-stone-500">
          <p className="font-medium text-stone-400 mb-1">Tài khoản demo:</p>
          <p>admin@coffee.com / 123456 (Admin)</p>
          <p>barista@coffee.com / 123456 (Pha chế)</p>
        </div>
      </div>
    </div>
  );
}
