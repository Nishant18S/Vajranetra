import { useCallback, useEffect, useState } from 'react';
import {
  RefreshCw,
  Search,
  MapPin,
  User,
  Clock,
  Activity,
  Filter,
} from 'lucide-react';
import KPITile from '../../components/admin/KPITile';
import { regionService } from '../../services/regionService';
import { fmtDateTime, fmtRelative, fmtNumber } from '../../utils/formatters';

const RISK_BADGE = {
  CRITICAL: 'vn-adm-badge vn-adm-badge--critical',
  HIGH: 'vn-adm-badge vn-adm-badge--high',
  MODERATE: 'vn-adm-badge vn-adm-badge--moderate',
  LOW: 'vn-adm-badge vn-adm-badge--low',
};

export default function AdminInspections() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [userFilter, setUserFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await regionService.listInspections({
        page,
        limit,
        userEmail: userFilter.trim() || undefined,
      });
      setData(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [page, limit, userFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const items = data?.items || [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  // Simple summary — count by user in current page
  const usersInPage = Array.from(
    new Set(items.map((i) => i.user_email).filter(Boolean))
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--a-text)' }}>
            Region Inspections
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--a-text-dim)' }}>
            Every region searched by an officer — with location, weather,
            and forecast summary from the moment of inspection.
          </p>
        </div>
        <button
          onClick={load}
          className="vn-adm-btn vn-adm-btn--outline"
          disabled={loading}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Summary tiles */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPITile
          label="Total Inspections"
          icon={Search}
          tone="accent"
          value={total}
          hint="all time"
        />
        <KPITile
          label="Unique Officers"
          icon={User}
          tone="default"
          value={usersInPage.length}
          hint="on this page"
        />
        <KPITile
          label="Critical Detected"
          icon={Activity}
          tone="critical"
          value={items.filter((i) => i.highest_risk === 'CRITICAL').length}
          hint="on this page"
        />
        <KPITile
          label="Last Inspection"
          icon={Clock}
          tone="default"
          value={items[0] ? fmtRelative(items[0].timestamp) : '—'}
        />
      </section>

      {/* Filters */}
      <div className="vn-adm-panel p-3 flex flex-wrap items-center gap-3">
        <Filter size={12} style={{ color: 'var(--a-text-faint)' }} />
        <label className="flex items-center gap-2 text-xs flex-1 min-w-[240px]">
          <span className="kpi-label whitespace-nowrap">Officer email</span>
          <input
            type="text"
            value={userFilter}
            onChange={(e) => {
              setUserFilter(e.target.value);
              setPage(1);
            }}
            placeholder="filter by user (e.g. officer@vajranetra.gov.in)"
            className="flex-1 rounded px-3 py-1.5 text-xs"
            style={{
              background: 'var(--a-bg)',
              border: '1px solid var(--a-border)',
              color: 'var(--a-text)',
            }}
          />
        </label>
      </div>

      {/* Error */}
      {error && (
        <div
          className="vn-adm-panel p-4 text-xs"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.35)',
            color: 'var(--a-red)',
          }}
        >
          Could not load inspections: {error.message}
        </div>
      )}

      {/* Table */}
      <div className="vn-adm-panel overflow-hidden">
        {loading && (
          <p className="p-6 text-xs" style={{ color: 'var(--a-text-dim)' }}>
            Loading inspections…
          </p>
        )}

        {!loading && items.length === 0 && (
          <div className="p-8 text-center">
            <Search
              size={24}
              className="mx-auto"
              style={{ color: 'var(--a-text-faint)' }}
            />
            <p className="text-sm mt-2" style={{ color: 'var(--a-text-mid)' }}>
              No inspections recorded yet.
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--a-text-faint)' }}>
              Every region an officer searches on the Region Inspector page will
              appear here.
            </p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="vn-adm-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Officer</th>
                  <th>Query</th>
                  <th>Location</th>
                  <th>Grid</th>
                  <th>Highest Risk</th>
                  <th>Max Prob (Cloudburst)</th>
                  <th>Weather</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => {
                  const cloudburst = i.task_summary?.cloudburst;
                  return (
                    <tr key={i.inspection_id}>
                      <td className="mono" style={{ color: 'var(--a-text-dim)' }}>
                        {fmtDateTime(i.timestamp)}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <User
                            size={12}
                            style={{ color: 'var(--a-text-faint)' }}
                          />
                          <span style={{ color: 'var(--a-text)' }}>
                            {i.user_email || '—'}
                          </span>
                        </div>
                        {i.user_role && (
                          <div
                            className="text-[10px] uppercase tracking-widest mt-0.5"
                            style={{ color: 'var(--a-text-faint)' }}
                          >
                            {i.user_role}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          className="text-[11px] font-medium"
                          style={{ color: 'var(--a-text)' }}
                        >
                          {i.query || '—'}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1.5">
                          <MapPin
                            size={11}
                            style={{ color: 'var(--a-text-faint)' }}
                          />
                          <span
                            className="mono text-[10px]"
                            style={{ color: 'var(--a-text-dim)' }}
                          >
                            {i.latitude?.toFixed(4)}, {i.longitude?.toFixed(4)}
                          </span>
                        </div>
                      </td>
                      <td className="mono" style={{ color: 'var(--a-text-dim)' }}>
                        {i.grid_cell
                          ? `Y${i.grid_cell.y} · X${i.grid_cell.x}`
                          : '—'}
                      </td>
                      <td>
                        {i.highest_risk ? (
                          <span
                            className={
                              RISK_BADGE[i.highest_risk] || 'vn-adm-badge'
                            }
                          >
                            {i.highest_risk}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="mono">
                        {cloudburst?.max_probability != null
                          ? fmtNumber(cloudburst.max_probability, 4)
                          : '—'}
                      </td>
                      <td>
                        {i.live_weather?.status === 'ok' ? (
                          <div className="text-[11px]">
                            <div style={{ color: 'var(--a-text)' }}>
                              {i.live_weather.temperature_c}°C ·{' '}
                              {i.live_weather.humidity_pct}%
                            </div>
                            <div
                              className="text-[10px] capitalize"
                              style={{ color: 'var(--a-text-faint)' }}
                            >
                              {i.live_weather.condition}
                            </div>
                          </div>
                        ) : (
                          <span
                            className="text-[10px]"
                            style={{ color: 'var(--a-text-faint)' }}
                          >
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
            Page {page} of {totalPages} · {total} total
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