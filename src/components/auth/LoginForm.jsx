import { useState } from 'react';
import { LogIn, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function LoginForm({ onSuccess }) {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (ev) => {
    ev.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = await login({
        email: form.email.trim(),
        password: form.password,
      });
      onSuccess?.(user);
    } catch (e) {
      setError(e.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
          <AlertTriangle size={16} className="text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <label className="block">
        <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
          Email
        </span>
        <input
          type="email"
          required
          value={form.email}
          onChange={set('email')}
          placeholder="you@example.com"
          className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
        />
      </label>

      <label className="block">
        <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
          Password
        </span>
        <input
          type="password"
          required
          value={form.password}
          onChange={set('password')}
          placeholder="Your password"
          className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
        />
      </label>

      <button
        type="submit"
        disabled={busy}
        className="vn-btn vn-btn--primary w-full justify-center"
      >
        {busy ? 'Signing in…' : (
          <>
            <LogIn size={16} /> Sign in
          </>
        )}
      </button>
    </form>
  );
}