import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, MapPin, Filter, Users as UsersIcon } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { fmtDateTime } from '../../utils/formatters';

/**
 * Fetches every CITIZEN account (paginated) and groups them by state
 * and district. Renders a filterable table with name, email, district,
 * state, status, and registered date.
 */
export default function CitizensByRegionPanel() {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stateFilter, setStateFilter] = useState('ALL');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const PAGE_LIMIT = 200; // backend cap: Query(..., le=200)
      let page = 1;
      let all = [];
      let total = Infinity;

      while (all.length < total && page <= 100) {
        const data = await adminService.listUsers({
          role: 'CITIZEN',
          page,
          limit: PAGE_LIMIT,
        });
        const items = data?.items || [];
        total = data?.total ?? items.length;
        all = all.concat(items);
        if (items.length === 0) break;
        page += 1;
      }

      setCitizens(all);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const { states, grouped, totalStates, totalDistricts } = useMemo(() => {
    const byState = new Map();
    citizens.forEach((c) => {
      const st = c.state || 'Unknown';
      if (!byState.has(st)) byState.set(st, []);
      byState.get(st).push(c);
    });

    const stateNames = Array.from(byState.keys()).sort();
    const districtSet = new Set(citizens.map((c) => c.district || 'Unknown'));

    return {
      states: stateNames,
      grouped: byState,
      totalStates: stateNames.length,
      totalDistricts: districtSet.size,
    };
  }, [citizens]);

  const visibleStates = stateFilter === 'ALL' ? states : [stateFilter];

  return (
    <div className="vn-adm-panel">
      <div className="vn-adm-panel__hd">
        <span className="vn-adm-panel__title">
          <MapPin size={12} className="inline mr-1.5 -mt-0.5" />
          Registered Citizens by Region
        </span>
        <button
          onClick={load}
          className="vn-adm-btn vn-adm-btn--outline text-[11px]"
          disabled={loading}
        >
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3 p-3">
        <SummaryCard icon={UsersIcon} label="Total citizens" value={citizens.length} />
        <SummaryCard icon={MapPin} label="States" value={totalStates} />
        <SummaryCard icon={MapPin} label="Districts" value={totalDistricts} />
      </div>

      {/* Filter */}
      <div className="px-3 pb-3 flex items-center gap-2">
        <Filter size={12} style={{ color: 'var(--a-text-faint)' }} />
        <span className="kpi-label">State</span>
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="rounded px-2 py-1 text-xs"
          style={{
            background: 'var(--a-bg)',
            border: '1px solid var(--a-border)',
            color: 'var(--a-text)',
          }}
        >
          <option value="ALL">All states</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div
          className="mx-3 mb-3 rounded p-3 text-xs"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.35)',
            color: 'var(--a-red)',
          }}
        >
          Failed to load citizens: {error.message}
        </div>
      )}

      {loading && (
        <p className="px-4 pb-4 text-xs" style={{ color: 'var(--a-text-dim)' }}>
          Loading…
        </p>
      )}

      {!loading && citizens.length === 0 && !error && (
        <p
          className="px-4 pb-6 text-center text-sm"
          style={{ color: 'var(--a-text-mid)' }}
        >
          No registered citizens yet.
        </p>
      )}

      {!loading && citizens.length > 0 && (
        <div className="overflow-x-auto pb-1">
          <table className="vn-adm-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>District</th>
                <th>State</th>
                <th>Status</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {visibleStates.map((st) => {
                const list = (grouped.get(st) || [])
                  .slice()
                  .sort((a, b) => (a.district || '').localeCompare(b.district || ''));
                return (
                  <FragmentGroup key={st} state={st} count={list.length}>
                    {list.map((c) => (
                      <tr key={c.user_id}>
                        <td style={{ color: 'var(--a-text)' }}>{c.name || '—'}</td>
                        <td className="mono" style={{ color: 'var(--a-text-dim)' }}>
                          {c.email}
                        </td>
                        <td className="mono" style={{ color: 'var(--a-text-dim)' }}>
                          {c.district || '—'}
                        </td>
                        <td className="mono" style={{ color: 'var(--a-text-dim)' }}>
                          {c.state || '—'}
                        </td>
                        <td>
                          <span
                            className={
                              c.is_active
                                ? 'vn-adm-badge vn-adm-badge--low'
                                : 'vn-adm-badge vn-adm-badge--critical'
                            }
                          >
                            {c.is_active ? 'ACTIVE' : 'DISABLED'}
                          </span>
                        </td>
                        <td className="mono" style={{ color: 'var(--a-text-dim)' }}>
                          {fmtDateTime(c.created_at)}
                        </td>
                      </tr>
                    ))}
                  </FragmentGroup>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
  return (
    <div
      className="rounded p-3 flex items-center gap-2"
      style={{ background: 'var(--a-bg)', border: '1px solid var(--a-border)' }}
    >
      <Icon size={14} style={{ color: 'var(--a-text-dim)' }} />
      <div>
        <div className="kpi-label">{label}</div>
        <div className="mono text-sm" style={{ color: 'var(--a-text)' }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function FragmentGroup({ state, count, children }) {
  return (
    <>
      <tr>
        <td
          colSpan={6}
          className="text-[11px] font-medium"
          style={{
            background: 'var(--a-bg)',
            color: 'var(--a-text-dim)',
            borderTop: '1px solid var(--a-border)',
          }}
        >
          {state}{' '}
          <span style={{ color: 'var(--a-text-faint)' }}>({count})</span>
        </td>
      </tr>
      {children}
    </>
  );
}