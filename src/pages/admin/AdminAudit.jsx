import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Filter, ScrollText } from 'lucide-react';
import AuditRow from '../../components/admin/AuditRow';
import { adminService } from '../../services/adminService';

const COMMON_ACTIONS = [
  'ALL',
  'alert.created',
  'alert.created_manual',
  'alert.acknowledged',
  'alert.dispatched',
  'alert.resolved',
  'incident.created',
  'incident.updated',
];

export default function AdminAudit() {
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [action, setAction] = useState('ALL');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await adminService.auditLog({
        page,
        limit,
        action: action === 'ALL' ? undefined : action,
      });
      setData(res);
    } catch (e) { setError(e); }
    finally { setLoading(false); }
  }, [page, limit, action]);

  useEffect(() => { load(); }, [load]);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--a-text)' }}>Audit Log</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--a-text-dim)' }}>
            Every state change on the platform, newest first.
          </p>
        </div>
        <button onClick={load} className="vn-adm-btn vn-adm-btn--outline" disabled={loading}>
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="vn-adm-panel p-3 flex flex-wrap items-center gap-2">
        <Filter size={12} style={{ color: 'var(--a-text-faint)' }} />
        <span className="kpi-label">Action</span>
        <select
          value={action}
          onChange={(e) => { setAction(e.target.value); setPage(1); }}
          className="rounded px-2 py-1 text-xs"
          style={{ background: 'var(--a-bg)', border: '1px solid var(--a-border)', color: 'var(--a-text)' }}
        >
          {COMMON_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>

        <span className="ml-auto text-[11px]" style={{ color: 'var(--a-text-dim)' }}>
          {total} entries
        </span>
      </div>

      {error && (
        <div className="rounded p-3 text-xs"
             style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', color: 'var(--a-red)' }}>
          {error.message}
        </div>
      )}

      <div className="vn-adm-panel overflow-hidden">
        {loading && (
          <p className="p-6 text-xs" style={{ color: 'var(--a-text-dim)' }}>Loading…</p>
        )}

        {!loading && !data?.items?.length && (
          <div className="p-8 text-center">
            <ScrollText size={24} style={{ color: 'var(--a-text-faint)' }} className="mx-auto" />
            <p className="text-sm mt-2" style={{ color: 'var(--a-text-mid)' }}>No audit entries.</p>
            <p className="text-xs mt-1" style={{ color: 'var(--a-text-faint)' }}>
              Actions performed on alerts and incidents will appear here.
            </p>
          </div>
        )}

        {!loading && data?.items?.length > 0 && (
          <div className="overflow-x-auto">
            <table className="vn-adm-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>Target</th>
                  <th>Notes</th>
                  <th>Changes</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((e) => <AuditRow key={e.id} entry={e} />)}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            className="vn-adm-btn vn-adm-btn--outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Prev
          </button>
          <span className="text-xs" style={{ color: 'var(--a-text-dim)' }}>
            Page {page} of {totalPages}
          </span>
          <button
            className="vn-adm-btn vn-adm-btn--outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}