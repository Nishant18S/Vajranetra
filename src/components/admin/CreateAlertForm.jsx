import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, AlertTriangle } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useAuth } from '../../hooks/useAuth';

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu',
  'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const SEVERITIES = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];

export default function CreateAlertForm() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: '',
    description: '',
    action_advice: '',
    severity: 'HIGH',
    state: '',
    district: '',
    valid_until: new Date(Date.now() + 6 * 3600 * 1000).toISOString().slice(0, 16),
    horizon_hours: '',
    probability: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (ev) => {
    ev.preventDefault();
    setBusy(true); setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        action_advice: form.action_advice.trim(),
        severity: form.severity,
        region: {
          state: form.state || null,
          district: form.district.trim() || null,
        },
        valid_until: new Date(form.valid_until).toISOString(),
        horizon_hours: form.horizon_hours ? Number(form.horizon_hours) : null,
        probability: form.probability ? Number(form.probability) : null,
        created_by: user?.email || 'authority',
      };
      await adminService.createAlert(payload);
      navigate('/admin/alerts', { replace: true });
    } catch (e) {
      setError(e.message || 'Could not create alert');
    } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && (
        <div
          className="flex items-start gap-2 rounded p-3"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)' }}
        >
          <AlertTriangle size={14} style={{ color: 'var(--a-red)' }} className="mt-0.5 shrink-0" />
          <p className="text-xs" style={{ color: 'var(--a-red)' }}>{error}</p>
        </div>
      )}

      <Field label="Title" required>
        <input
          type="text"
          required
          value={form.title}
          onChange={set('title')}
          placeholder="e.g. Heavy Rainfall Warning for Ranchi"
          style={inputStyle}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Severity" required>
          <select
            value={form.severity}
            onChange={set('severity')}
            style={inputStyle}
          >
            {SEVERITIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>

        <Field label="Valid until" required>
          <input
            type="datetime-local"
            required
            value={form.valid_until}
            onChange={set('valid_until')}
            style={{ ...inputStyle, colorScheme: 'dark' }}
          />
        </Field>
      </div>

      <Field label="Public description" required hint="Plain language. Citizens see this verbatim.">
        <textarea
          required
          minLength={10}
          value={form.description}
          onChange={set('description')}
          rows={4}
          placeholder="What is expected, where, and when."
          style={inputStyle}
        />
      </Field>

      <Field label="Action advice" required hint="What should citizens do?">
        <textarea
          required
          minLength={4}
          value={form.action_advice}
          onChange={set('action_advice')}
          rows={3}
          placeholder="e.g. Avoid low-lying areas. Do not cross flooded roads."
          style={inputStyle}
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="State" required>
          <select
            required
            value={form.state}
            onChange={set('state')}
            style={inputStyle}
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
            style={inputStyle}
          />
        </Field>
      </div>

      <details className="vn-adm-panel p-4">
        <summary
          className="text-xs cursor-pointer"
          style={{ color: 'var(--a-text-dim)' }}
        >
          Optional — link to model metadata
        </summary>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Field label="Horizon (hours)">
            <input
              type="number"
              min={2}
              max={24}
              value={form.horizon_hours}
              onChange={set('horizon_hours')}
              placeholder="2–6"
              style={inputStyle}
            />
          </Field>
          <Field label="Probability (0–1)">
            <input
              type="number"
              step="0.0001"
              min={0}
              max={1}
              value={form.probability}
              onChange={set('probability')}
              placeholder="0.90"
              style={inputStyle}
            />
          </Field>
        </div>
      </details>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={busy} className="vn-adm-btn vn-adm-btn--primary">
          <Send size={13} /> {busy ? 'Publishing…' : 'Publish alert'}
        </button>
        <button
          type="button"
          className="vn-adm-btn vn-adm-btn--outline"
          onClick={() => navigate('/admin/alerts')}
        >
          Cancel
        </button>
      </div>

      <p className="text-[11px]" style={{ color: 'var(--a-text-faint)' }}>
        Manual alerts are public immediately and appear to citizens whose
        registered district or state matches. They are recorded in the audit log.
      </p>
    </form>
  );
}

const inputStyle = {
  width: '100%',
  background: 'var(--a-bg)',
  border: '1px solid var(--a-border)',
  borderRadius: 6,
  padding: '8px 12px',
  color: 'var(--a-text)',
  fontSize: 13,
  outline: 'none',
};

function Field({ label, hint, required, children }) {
  return (
    <label className="block">
      <span className="kpi-label">
        {label} {required && <span style={{ color: 'var(--a-red)' }}>*</span>}
      </span>
      <div className="mt-1">{children}</div>
      {hint && (
        <p className="text-[10px] mt-1" style={{ color: 'var(--a-text-faint)' }}>
          {hint}
        </p>
      )}
    </label>
  );
}