import { useEffect, useState } from 'react';
import { Cloud, RefreshCw, AlertCircle } from 'lucide-react';
import { regionService } from '../../services/regionService';

export default function CTTPanel({ gridCell }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!gridCell) return;
    setLoading(true);
    setError(null);
    try {
      const res = await regionService.getCTT({ y: gridCell.y, x: gridCell.x });
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
  }, [gridCell?.y, gridCell?.x]);

  if (!gridCell) return null;

  const dropK = data?.ctt?.drop_rate_K_per_30min;
  const isCooling = dropK != null && dropK < -1;
  const statusColor = dropK == null
    ? 'var(--a-text-faint)'
    : dropK < -3 ? 'var(--a-red)'
    : dropK < -1 ? 'var(--a-amber)'
    : 'var(--a-green)';

  return (
    <section className="vn-adm-panel">
      <div className="vn-adm-panel__hd">
        <span className="vn-adm-panel__title flex items-center gap-2">
          <Cloud size={12} /> Cloud Top Cooling
        </span>
        <button onClick={load} className="vn-adm-btn vn-adm-btn--outline" disabled={loading}>
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {loading && !data && (
          <p className="text-xs" style={{ color: 'var(--a-text-dim)' }}>Reading INSAT CTP files…</p>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded p-3"
               style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)' }}>
            <AlertCircle size={14} style={{ color: 'var(--a-red)' }} className="mt-0.5" />
            <p className="text-xs" style={{ color: 'var(--a-red)' }}>{error.message}</p>
          </div>
        )}

        {(data?.status === 'not_available' || data?.status === 'error') && (
          <div className="rounded p-3 text-xs leading-relaxed"
               style={{ background: 'var(--a-surface-2)', border: '1px solid var(--a-border)', color: 'var(--a-text-dim)' }}>
            <strong style={{ color: 'var(--a-text)' }}>Not available.</strong> {data.message}
          </div>
        )}

        {data?.status === 'ok' && (
          <>
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] uppercase tracking-widest"
                    style={{ color: 'var(--a-text-faint)' }}>
                Drop rate
              </span>
              <div className="text-right">
                <div className="mono text-lg font-semibold" style={{ color: statusColor }}>
                  {dropK.toFixed(2)}
                </div>
                <div className="text-[10px]" style={{ color: 'var(--a-text-faint)' }}>
                  K per 30 min
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded p-2"
                   style={{ background: 'var(--a-surface-2)', border: '1px solid var(--a-border)' }}>
                <div className="text-[10px] uppercase tracking-widest"
                     style={{ color: 'var(--a-text-faint)' }}>Previous</div>
                <div className="mono mt-1" style={{ color: 'var(--a-text)' }}>
                  {data.ctt.previous_K.toFixed(1)} K
                </div>
              </div>
              <div className="rounded p-2"
                   style={{ background: 'var(--a-surface-2)', border: '1px solid var(--a-border)' }}>
                <div className="text-[10px] uppercase tracking-widest"
                     style={{ color: 'var(--a-text-faint)' }}>Current</div>
                <div className="mono mt-1" style={{ color: 'var(--a-text)' }}>
                  {data.ctt.current_K.toFixed(1)} K
                </div>
              </div>
            </div>

            <div className="rounded p-3 text-[11px] leading-relaxed"
                 style={{ background: 'var(--a-bg)', border: '1px solid var(--a-border)',
                          color: isCooling ? 'var(--a-amber)' : 'var(--a-text-dim)' }}>
              <strong style={{ color: statusColor }}>{isCooling ? 'Active cooling' : 'Stable'}.</strong>{' '}
              {data.interpretation}. Rapid cooling (&lt; −1 K/30min) indicates explosive
              updraft growth and is a strong signal for imminent severe convection.
            </div>

            <div className="text-[10px] mono leading-tight"
                 style={{ color: 'var(--a-text-faint)' }}>
              {data.source_files.current}
              <br />
              vs {data.source_files.previous}
              <br />
              Δt = {data.timestamps.gap_minutes} min
            </div>
          </>
        )}
      </div>
    </section>
  );
}

