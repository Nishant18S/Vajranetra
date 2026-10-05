import { useCallback, useEffect, useState } from 'react';
import { PlusCircle, AlertTriangle, X } from 'lucide-react';
import KPITile from '../../components/admin/KPITile';
import { incidentService } from '../../services/incidentService';
import { useAuth } from '../../hooks/useAuth';
import { fmtDateTime } from '../../utils/formatters';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const SEVERITIES = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];

export default function AdminIncidents() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [list, c] = await Promise.all([
        incidentService.list({ page: 1, limit: 100 }),
        incidentService.counts(),
      ]);
      setIncidents(list?.items || []);
      setCounts(c || null);
    } catch (e) {
      setError(e);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    try {
      await incidentService.update(id, { status, actor: user?.email || 'authority' });
      load();
    } catch (e) {
      alert(`Could not update: ${e.message}`);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--a-text)' }}>Incidents</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--a-text-dim)' }}>
            Track operational response cases linked to alerts.
          </p>
        </div>
        <button
          className="vn-adm-btn vn-adm-btn--primary"
          onClick={() => setShowCreate(true)}
        >
          <PlusCircle size={13} /> New Incident
        </button>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPITile label="Open"        tone="critical" value={counts?.OPEN ?? '—'} />
        <KPITile label="In Progress" tone="warning"  value={counts?.IN_PROGRESS ?? '—'} />
        <KPITile label="Resolved"    tone="normal"   value={counts?.RESOLVED ?? '—'} />
        <KPITile label="Closed"      tone="default"  value={counts?.CLOSED ?? '—'} />
      </section>

      {error && (
        <div className="rounded p-3 text-xs"
             style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', color: 'var(--a-red)' }}>
          {error.message}
        </div>
      )}

      <div className="vn-adm-panel overflow-hidden">
        {loading ? (
          <p className="p-6 text-xs" style={{ color: 'var(--a-text-dim)' }}>Loading…</p>
        ) : incidents.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm" style={{ color: 'var(--a-text-mid)' }}>No incidents yet.</p>
            <p className="text-xs mt-1" style={{ color: 'var(--a-text-faint)' }}>
              Create one from an alert or manually.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="vn-adm-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Region</th>
                  <th>Assigned</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {incidents.map((i) => (
                  <tr key={i.incident_id}>
                    <td className="mono" style={{ color: 'var(--a-text-faint)' }}>
                      {String(i.incident_id).slice(-8)}
                    </td>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {i.title}
                    </td>
                    <td>
                      <span className={`vn-adm-badge vn-adm-badge--${(i.severity || '').toLowerCase()}`}>
                        {i.severity}
                      </span>
                    </td>
                    <td>
                      <select
                        value={i.status}
                        onChange={(e) => updateStatus(i.incident_id, e.target.value)}
                        className="rounded text-[11px] py-1 px-2"
                        style={{ background: 'var(--a-bg)', border: '1px solid var(--a-border)', color: 'var(--a-text)' }}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="mono" style={{ color: 'var(--a-text-dim)' }}>
                      {i.region?.district ? `${i.region.district}, ${i.region.state || ''}` : '—'}
                    </td>
                    <td style={{ color: 'var(--a-text-dim)' }}>{i.assigned_to || '—'}</td>
                    <td className="mono" style={{ color: 'var(--a-text-dim)' }}>
                      {fmtDateTime(i.created_at)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <a
                        href={`#`}
                        onClick={(e) => { e.preventDefault(); }}
                        className="text-[11px]"
                        style={{ color: 'var(--a-accent)' }}
                      >
                        Details
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateIncidentModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); }}
        />
      )}
    </div>
  );
}

function CreateIncidentModal({ onClose, onCreated }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '',
    description: '',
    severity: 'HIGH',
    state: '',
    district: '',
    assigned_to: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      await incidentService.create({
        title: form.title.trim(),
        description: form.description.trim(),
        severity: form.severity,
        region: { state: form.state || null, district: form.district.trim() || null },
        assigned_to: form.assigned_to.trim() || null,
        created_by: user?.email || 'authority',
      });
      onCreated?.();
    } catch (err) {
      setError(err.message || 'Could not create');
    } finally { setBusy(false); }
  };

  return (
    <>
      <div className="fixed inset-0 z-30" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={onClose} />
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 pointer-events-none">
        <form
          onSubmit={submit}
          className="pointer-events-auto w-full max-w-lg rounded-lg p-6 space-y-4"
          style={{ background: 'var(--a-surface)', border: '1px solid var(--a-border)' }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold" style={{ color: 'var(--a-text)' }}>New Incident</h2>
            <button type="button" onClick={onClose} className="vn-admin__hamburger" aria-label="Close">
              <X size={14} />
            </button>
          </div>

          {error && (
            <div className="rounded p-3 text-xs"
                 style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', color: 'var(--a-red)' }}>
              <AlertTriangle size={12} className="inline mr-1" /> {error}
            </div>
          )}

          <Field label="Title" required>
            <input required value={form.title} onChange={set('title')} style={input} />
          </Field>
          <Field label="Description">
            <textarea rows={3} value={form.description} onChange={set('description')} style={input} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Severity" required>
              <select value={form.severity} onChange={set('severity')} style={input}>
                {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Assigned to">
              <input value={form.assigned_to} onChange={set('assigned_to')} placeholder="Team or officer" style={input} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="State">
              <input value={form.state} onChange={set('state')} style={input} />
            </Field>
            <Field label="District">
              <input value={form.district} onChange={set('district')} style={input} />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" className="vn-adm-btn vn-adm-btn--outline" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={busy} className="vn-adm-btn vn-adm-btn--primary">
              {busy ? 'Creating…' : 'Create incident'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

const input = {
  width: '100%',
  background: 'var(--a-bg)',
  border: '1px solid var(--a-border)',
  borderRadius: 6,
  padding: '8px 12px',
  color: 'var(--a-text)',
  fontSize: 13,
  outline: 'none',
};

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="kpi-label">{label} {required && <span style={{ color: 'var(--a-red)' }}>*</span>}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}