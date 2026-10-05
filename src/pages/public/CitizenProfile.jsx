import { useState } from 'react';
import { UserCircle2, KeyRound, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { userService } from '../../services/userService';

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu',
  'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

export default function CitizenProfile() {
  const { user, refreshMe } = useAuth();

  return (
    <div className="space-y-6">
      <section className="vn-panel p-6">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--vn-primary)' }}>
          Profile & Settings
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Update your contact details and location. Your location determines
          which weather alerts you receive.
        </p>
      </section>

      <ProfileForm user={user} onSaved={refreshMe} />
      <PasswordForm />
    </div>
  );
}

function ProfileForm({ user, onSaved }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    state: user?.state || '',
    district: user?.district || '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (ev) => {
    ev.preventDefault();
    setBusy(true); setError(null); setSaved(false);
    try {
      await userService.updateProfile(user.user_id, {
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        state: form.state || null,
        district: form.district.trim() || null,
      });
      await onSaved?.();
      setSaved(true);
    } catch (e) {
      setError(e.message || 'Could not save');
    } finally { setBusy(false); }
  };

  return (
    <section className="vn-panel p-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-4">
        <UserCircle2 size={16} style={{ color: 'var(--vn-primary)' }} />
        <h2 className="text-base font-semibold text-slate-800">Personal Details</h2>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded border border-green-200 bg-green-50 p-3 mb-4">
          <CheckCircle2 size={15} className="text-green-700" />
          <p className="text-sm text-green-800">Profile updated.</p>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 rounded border border-red-200 bg-red-50 p-3 mb-4">
          <AlertTriangle size={15} className="text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Email</span>
          <input
            type="email"
            disabled
            value={user?.email || ''}
            className="mt-1 w-full rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
          />
          <p className="text-[11px] text-slate-500 mt-1">Email cannot be changed here.</p>
        </label>

        <label className="block">
          <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Full name</span>
          <input
            type="text"
            required
            value={form.name}
            onChange={set('name')}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
        </label>

        <label className="block">
          <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Mobile number</span>
          <input
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">State</span>
            <select
              value={form.state}
              onChange={set('state')}
              className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            >
              <option value="">Select state</option>
              {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">District</span>
            <input
              type="text"
              value={form.district}
              onChange={set('district')}
              className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
          </label>
        </div>

        <div className="pt-2">
          <button type="submit" disabled={busy} className="vn-btn vn-btn--primary">
            {busy ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </section>
  );
}

function PasswordForm() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (ev) => {
    ev.preventDefault();
    setError(null); setSaved(false);
    if (form.next !== form.confirm) { setError('New passwords do not match'); return; }
    if (form.next.length < 8) { setError('New password must be at least 8 characters'); return; }
    setBusy(true);
    try {
      await userService.changePassword({
        current_password: form.current,
        new_password: form.next,
      });
      setSaved(true);
      setForm({ current: '', next: '', confirm: '' });
    } catch (e) {
      setError(e.message || 'Could not change password');
    } finally { setBusy(false); }
  };

  return (
    <section className="vn-panel p-6 max-w-2xl">
      <div className="flex items-center gap-2 mb-4">
        <KeyRound size={16} style={{ color: 'var(--vn-primary)' }} />
        <h2 className="text-base font-semibold text-slate-800">Change Password</h2>
      </div>

      {saved && (
        <div className="flex items-center gap-2 rounded border border-green-200 bg-green-50 p-3 mb-4">
          <CheckCircle2 size={15} className="text-green-700" />
          <p className="text-sm text-green-800">Password changed.</p>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2 rounded border border-red-200 bg-red-50 p-3 mb-4">
          <AlertTriangle size={15} className="text-red-600 mt-0.5 shrink-0" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <label className="block">
          <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Current password</span>
          <input
            type="password"
            required
            value={form.current}
            onChange={set('current')}
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">New password</span>
            <input
              type="password"
              required
              minLength={8}
              value={form.next}
              onChange={set('next')}
              className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Confirm new password</span>
            <input
              type="password"
              required
              minLength={8}
              value={form.confirm}
              onChange={set('confirm')}
              className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
          </label>
        </div>

        <div className="pt-2">
          <button type="submit" disabled={busy} className="vn-btn vn-btn--primary">
            {busy ? 'Updating…' : 'Change password'}
          </button>
        </div>
      </form>
    </section>
  );
}