import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (ev) => {
    ev.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = await login({ email: form.email.trim(), password: form.password });
      if (user?.role !== 'AUTHORITY' && user?.role !== 'ADMIN') {
        setError('This portal is for authority accounts only.');
        return;
      }
      const target = location.state?.from || '/admin';
      navigate(target, { replace: true });
    } catch (e) {
      setError(e.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
            <Shield size={18} className="text-cyan-400" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">VAJRANETRA</div>
            <div className="text-[11px] uppercase tracking-widest text-slate-500">
              Authority Portal
            </div>
          </div>
        </div>

        <h1 className="text-lg font-semibold text-white mb-1">Sign in</h1>
        <p className="text-xs text-slate-400 mb-5">
          Access restricted to authorised disaster-management personnel.
        </p>

        {error && (
          <div className="flex items-start gap-2 rounded border border-red-500/40 bg-red-500/10 p-3 mb-4">
            <AlertTriangle size={14} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-xs text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="text-[11px] uppercase tracking-widest text-slate-400">
              Email
            </span>
            <input
              type="email"
              required
              value={form.email}
              onChange={set('email')}
              placeholder="officer@vajranetra.gov.in"
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/60"
            />
          </label>

          <label className="block">
            <span className="text-[11px] uppercase tracking-widest text-slate-400">
              Password
            </span>
            <input
              type="password"
              required
              value={form.password}
              onChange={set('password')}
              placeholder="Your password"
              className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/60"
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="w-full inline-flex items-center justify-center gap-2 rounded bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-cyan-400 disabled:opacity-50"
          >
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-[11px] text-slate-500 mt-6 text-center">
          <Link to="/" className="hover:text-slate-300">← Back to public site</Link>
        </p>
      </div>
    </div>
  );
}