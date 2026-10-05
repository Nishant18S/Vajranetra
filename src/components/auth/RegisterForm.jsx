import { useState } from 'react';
import { UserPlus, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu',
  'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

export default function RegisterForm({ onSuccess }) {
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirm: '',
    phone: '',
    state: '',
    district: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (ev) => {
    ev.preventDefault();
    setError(null);

    if (form.password !== form.confirm) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setBusy(true);
    try {
      const created = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || null,
        state: form.state || null,
        district: form.district.trim() || null,
      });
      onSuccess?.(created);
    } catch (e) {
      setError(e.message || 'Registration failed');
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

      <Field label="Full name" required>
        <input
          type="text"
          required
          value={form.name}
          onChange={set('name')}
          placeholder="e.g. Ramesh Kumar"
          className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
        />
      </Field>

      <Field label="Email" required>
        <input
          type="email"
          required
          value={form.email}
          onChange={set('email')}
          placeholder="you@example.com"
          className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Password" required>
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={set('password')}
            placeholder="At least 8 characters"
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
        </Field>
        <Field label="Confirm password" required>
          <input
            type="password"
            required
            minLength={8}
            value={form.confirm}
            onChange={set('confirm')}
            placeholder="Repeat password"
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
        </Field>
      </div>

      <Field label="Mobile number" hint="Used for SMS alerts (optional)">
        <input
          type="tel"
          value={form.phone}
          onChange={set('phone')}
          placeholder="+91 98765 43210"
          className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="State" required>
          <select
            required
            value={form.state}
            onChange={set('state')}
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          >
            <option value="">Select state</option>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="District" required>
          <input
            type="text"
            required
            value={form.district}
            onChange={set('district')}
            placeholder="e.g. Ranchi"
            className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
        </Field>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={busy}
          className="vn-btn vn-btn--primary w-full justify-center"
        >
          {busy ? 'Creating account…' : (
            <>
              <UserPlus size={16} /> Create account
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Your location (state and district) determines which weather alerts you
        will see. We do not share your personal data with third parties.
      </p>
    </form>
  );
}

function Field({ label, hint, required, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <div className="mt-1">{children}</div>
      {hint && <p className="text-[11px] text-slate-500 mt-1">{hint}</p>}
    </label>
  );
}