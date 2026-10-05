import { useEffect, useState } from 'react';
import { Mountain, RefreshCw, AlertCircle } from 'lucide-react';
import { regionService } from '../../services/regionService';

export default function TerrainPanel({ latitude, longitude }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    if (latitude == null || longitude == null) return;
    setLoading(true);
    setError(null);
    try {
      const res = await regionService.getTerrain({ lat: latitude, lon: longitude });
      setData(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);

  if (latitude == null || longitude == null) return null;

  return (
    <section className="vn-adm-panel">
      <div className="vn-adm-panel__hd">
        <span className="vn-adm-panel__title flex items-center gap-2">
          <Mountain size={12} /> Terrain
        </span>
        <button
          onClick={load}
          className="vn-adm-btn vn-adm-btn--outline"
          disabled={loading}
        >
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="p-4">
        {loading && !data && (
          <p className="text-xs" style={{ color: 'var(--a-text-dim)' }}>
            Loading terrain data…
          </p>
        )}

        {error && (
          <div
            className="flex items-start gap-2 rounded p-3"
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.35)',
            }}
          >
            <AlertCircle size={14} style={{ color: 'var(--a-red)' }} className="mt-0.5" />
            <p className="text-xs" style={{ color: 'var(--a-red)' }}>
              {error.message}
            </p>
          </div>
        )}

        {data?.status === 'not_available' && (
          <div
            className="rounded p-3 text-xs leading-relaxed"
            style={{
              background: 'var(--a-surface-2)',
              border: '1px solid var(--a-border)',
              color: 'var(--a-text-dim)',
            }}
          >
            <strong style={{ color: 'var(--a-text)' }}>Not available.</strong>{' '}
            {data.message}
          </div>
        )}

        {data?.status === 'ok' && (
          <div className="space-y-2 text-xs">
            {data.elevation_m != null && (
              <Row label="Elevation" value={`${data.elevation_m.toFixed(1)} m`} mono />
            )}
            {data.slope != null && (
              <Row
                label="Slope"
                value={`${data.slope.toFixed(3)} ${data.slope_unit || ''}`}
                mono
              />
            )}
            <Row label="Latitude"  value={data.latitude.toFixed(4)} mono />
            <Row label="Longitude" value={data.longitude.toFixed(4)} mono />
            <Row label="Source"    value={data.source} small />
          </div>
        )}

        {data?.status === 'error' && (
          <p className="text-xs" style={{ color: 'var(--a-red)' }}>
            {data.message}
          </p>
        )}
      </div>
    </section>
  );
}

function Row({ label, value, mono, small }) {
  return (
    <div
      className="flex items-center justify-between py-1 border-b"
      style={{ borderColor: 'var(--a-border-soft)' }}
    >
      <span
        className="text-[10px] uppercase tracking-widest"
        style={{ color: 'var(--a-text-faint)' }}
      >
        {label}
      </span>
      <span
        className={mono ? 'mono' : ''}
        style={{ color: 'var(--a-text)', fontSize: small ? 10 : 12 }}
      >
        {value}
      </span>
    </div>
  );
}
