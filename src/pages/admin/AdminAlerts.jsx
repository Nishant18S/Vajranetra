import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, RefreshCw, Filter } from 'lucide-react';
import AlertQueueTable from '../../components/admin/AlertQueueTable';
import AlertDetailDrawer from '../../components/admin/AlertDetailDrawer';
import { alertService } from '../../services/alertService';
import { useAuth } from '../../hooks/useAuth';

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'ACKNOWLEDGED', 'DISPATCHED', 'RESOLVED'];
const SEV_FILTERS = ['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'];

export default function AdminAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sevFilter, setSevFilter] = useState('ALL');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (sevFilter !== 'ALL') params.severity = sevFilter;
      const data = await alertService.list({ ...params, page: 1, limit: 200 });
      setAlerts(data?.items || []);
    } catch (e) {
      setError(e);
    } finally { setLoading(false); }
  }, [statusFilter, sevFilter]);

  useEffect(() => { load(); }, [load]);

  const onChanged = () => {
    setSelected(null);
    load();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--a-text)' }}>
            Alert Queue
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--a-text-dim)' }}>
            Review, acknowledge, dispatch, and resolve alerts.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="vn-adm-btn vn-adm-btn--outline" disabled={loading}>
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <Link to="/admin/alerts/new" className="vn-adm-btn vn-adm-btn--primary">
            <PlusCircle size={13} /> Create Alert
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="vn-adm-panel p-3 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter size={12} style={{ color: 'var(--a-text-faint)' }} />
          <span className="kpi-label">Status</span>
          <div className="flex gap-1">
            {STATUS_FILTERS.map((s) => (
              <FilterChip
                key={s}
                label={s}
                active={statusFilter === s}
                onClick={() => setStatusFilter(s)}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="kpi-label">Severity</span>
          <div className="flex gap-1">
            {SEV_FILTERS.map((s) => (
              <FilterChip
                key={s}
                label={s}
                active={sevFilter === s}
                onClick={() => setSevFilter(s)}
              />
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div
          className="rounded p-4 text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', color: 'var(--a-red)' }}
        >
          Could not load alerts: {error.message}
        </div>
      )}

      <div className="vn-adm-panel overflow-hidden">
        <AlertQueueTable alerts={alerts} loading={loading} onSelect={setSelected} />
      </div>

      {selected && (
        <AlertDetailDrawer
          alert={selected}
          user={user}
          onClose={() => setSelected(null)}
          onChanged={onChanged}
        />
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors"
      style={{
        background: active ? 'var(--a-accent-soft)' : 'transparent',
        color: active ? 'var(--a-accent)' : 'var(--a-text-dim)',
        border: `1px solid ${active ? 'rgba(34,211,238,0.4)' : 'var(--a-border)'}`,
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}