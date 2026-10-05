import { useEffect, useState } from 'react';
import { fmtDateTime, fmtNumber } from '../../utils/formatters';
import { regionService } from '../../services/regionService';

const SEV_CLASS = {
  CRITICAL: 'vn-adm-badge vn-adm-badge--critical',
  HIGH: 'vn-adm-badge vn-adm-badge--high',
  MODERATE: 'vn-adm-badge vn-adm-badge--moderate',
  LOW: 'vn-adm-badge vn-adm-badge--low',
};

const STATUS_CLASS = {
  ACTIVE: 'vn-adm-badge vn-adm-badge--critical',
  ACKNOWLEDGED: 'vn-adm-badge vn-adm-badge--moderate',
  DISPATCHED: 'vn-adm-badge vn-adm-badge--info',
  RESOLVED: 'vn-adm-badge vn-adm-badge--low',
  EXPIRED: 'vn-adm-badge vn-adm-badge--info',
};

const _placeCache = new Map();

function useCellPlace(y, x) {
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (y == null || x == null) return;
    const key = `${y},${x}`;
    if (_placeCache.has(key)) {
      setPlace(_placeCache.get(key));
      return;
    }
    let cancelled = false;
    setLoading(true);
    regionService
      .gridLookup(y, x)
      .then((res) => {
        if (cancelled) return;
        const label =
          res?.place?.label || res?.place?.district || res?.place?.city || null;
        _placeCache.set(key, label);
        setPlace(label);
      })
      .catch(() => {
        if (!cancelled) setPlace(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [y, x]);

  return { place, loading };
}

function LocationCell({ alert }) {
  const gridY = alert.grid_y;
  const gridX = alert.grid_x;
  const { place, loading } = useCellPlace(gridY, gridX);

  // Prefer the explicit region field if it's set
  if (alert.region?.district) {
    return (
      <span className="text-[11px]" style={{ color: 'var(--a-text)' }}>
        {alert.region.district}
        {alert.region.state && (
          <span className="ml-1 text-[10px]" style={{ color: 'var(--a-text-faint)' }}>
            {alert.region.state}
          </span>
        )}
      </span>
    );
  }

  if (gridY == null || gridX == null) {
    return <span className="text-[10px]" style={{ color: 'var(--a-text-faint)' }}>—</span>;
  }

  if (loading) {
    return <span className="text-[10px]" style={{ color: 'var(--a-text-faint)' }}>…</span>;
  }

  if (!place) {
    return (
      <span className="mono text-[10px]" style={{ color: 'var(--a-text-faint)' }}>
        Y{gridY}·X{gridX}
      </span>
    );
  }

  return (
    <span className="text-[11px]" style={{ color: 'var(--a-text-dim)' }}>
      {place}
    </span>
  );
}

export default function AlertQueueTable({ alerts = [], loading, onSelect }) {
  if (loading) {
    return (
      <div className="p-6 text-sm" style={{ color: 'var(--a-text-dim)' }}>
        Loading alerts…
      </div>
    );
  }

  if (!alerts.length) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm" style={{ color: 'var(--a-text-mid)' }}>
          No alerts in this view.
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--a-text-faint)' }}>
          Run a forecast to generate candidates, or create one manually.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="vn-adm-table">
        <thead>
          <tr>
            <th>Alert</th>
            <th>Source</th>
            <th>Location</th>
            <th>Horizon</th>
            <th>Severity</th>
            <th>Prob</th>
            <th>Grid</th>
            <th>Status</th>
            <th>Created</th>
            <th style={{ textAlign: 'right' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((a) => {
            const id = a.alert_id || a._id;
            const sev = (a.severity || '').toUpperCase();
            const st = (a.status || '').toUpperCase();
            return (
              <tr
                key={id}
                style={{ cursor: 'pointer' }}
                onClick={() => onSelect?.(a)}
              >
                <td className="mono" style={{ color: 'var(--a-text-dim)' }}>
                  {String(id).slice(-8)}
                </td>
                <td>
                  <span
                    className="text-[10px] uppercase tracking-widest"
                    style={{ color: 'var(--a-text-faint)' }}
                  >
                    {a.source === 'MANUAL' ? 'Officer' : 'Model'}
                  </span>
                </td>
                <td>
                  <LocationCell alert={a} />
                </td>
                <td className="mono">
                  {a.horizon_hours != null ? `+${a.horizon_hours}h` : '—'}
                </td>
                <td>
                  <span className={SEV_CLASS[sev] || 'vn-adm-badge'}>
                    {sev || '—'}
                  </span>
                </td>
                <td className="mono">
                  {a.probability != null ? fmtNumber(a.probability, 4) : '—'}
                </td>
                <td className="mono">
                  {a.grid_y != null ? `Y${a.grid_y}·X${a.grid_x}` : '—'}
                </td>
                <td>
                  <span className={STATUS_CLASS[st] || 'vn-adm-badge'}>
                    {st || '—'}
                  </span>
                </td>
                <td className="mono" style={{ color: 'var(--a-text-dim)' }}>
                  {fmtDateTime(a.created_at)}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect?.(a);
                    }}
                    className="vn-adm-btn vn-adm-btn--outline"
                  >
                    Open
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}