import { useEffect, useState } from 'react';
import { Activity, AlertCircle, RefreshCw } from 'lucide-react';
import { regionService } from '../../services/regionService';

const PRECURSOR_ORDER = [
  'insat_hem',
  'insat_uth',
  'era5_cape',
  'era5_cin',
  'era5_r_850',
  'era5_r_500',
  'era5_t_500',
  'terrain_elevation',
];

const PRECURSOR_META = {
  insat_hem:         { label: 'INSAT HEM Rainfall',   group: 'Rainfall',    unit: 'σ' },
  insat_uth:         { label: 'INSAT UTH',            group: 'Moisture',    unit: 'σ' },
  era5_cape:         { label: 'CAPE',                 group: 'Instability', unit: 'σ' },
  era5_cin:          { label: 'CIN',                  group: 'Instability', unit: 'σ' },
  era5_r_850:        { label: 'Rel. Humidity 850',    group: 'Moisture',    unit: 'σ' },
  era5_r_500:        { label: 'Rel. Humidity 500',    group: 'Moisture',    unit: 'σ' },
  era5_t_500:        { label: 'Temperature 500 hPa',  group: 'Thermo',      unit: 'σ' },
  terrain_elevation: { label: 'Elevation',            group: 'Terrain',     unit: 'σ' },
};

const TONE = {
  ok:      'var(--a-green)',
  warn:    'var(--a-amber)',
  danger:  'var(--a-red)',
  unknown: 'var(--a-text-faint)',
};

export default function PrecursorsPanel({ sampleIndex = 0, gridCell }) {
  const [data, setData] = useState(null);
  const [qpe, setQpe] = useState(null);
  const [conv, setConv] = useState(null);
  const [ctt, setCtt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!gridCell) return;
    setLoading(true);
    setError(null);
    try {
      const [p, q, c, t] = await Promise.all([
        regionService.getPrecursors({ sampleIndex, y: gridCell.y, x: gridCell.x }),
        regionService.getQPE({ sampleIndex, y: gridCell.y, x: gridCell.x }).catch(() => null),
        regionService.getConvergence({ sampleIndex, y: gridCell.y, x: gridCell.x }).catch(() => null),
        regionService.getCTT({ y: gridCell.y, x: gridCell.x }).catch(() => null),
      ]);
      setData(p);
      setQpe(q);
      setConv(c);
      setCtt(t);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sampleIndex, gridCell?.y, gridCell?.x]);

  if (!gridCell) return null;

  const convTone = conv?.regime === 'convergence' ? 'danger'
                 : conv?.regime === 'divergence'  ? 'ok'
                 : 'unknown';

  const cttDropK = ctt?.ctt?.drop_rate_K_per_30min;
  const cttTone = cttDropK == null ? 'unknown'
                : cttDropK < -3 ? 'danger'
                : cttDropK < -1 ? 'warn'
                : 'ok';

  return (
    <section className="vn-adm-panel">
      <div className="vn-adm-panel__hd">
        <span className="vn-adm-panel__title flex items-center gap-2">
          <Activity size={12} /> Atmospheric Precursors
        </span>
        <button onClick={load} className="vn-adm-btn vn-adm-btn--outline" disabled={loading}>
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="p-4">
        <div className="text-[10px] mb-2 leading-relaxed" style={{ color: 'var(--a-text-faint)' }}>
          σ = standardized anomaly from climatological mean (what the model sees).
          Convergence and CTT are derived quantities shown for situational awareness.
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded p-3 mb-3"
               style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)' }}>
            <AlertCircle size={14} style={{ color: 'var(--a-red)' }} className="mt-0.5" />
            <p className="text-xs" style={{ color: 'var(--a-red)' }}>{error.message}</p>
          </div>
        )}

        {data?.status === 'ok' && (
          <div className="space-y-2">
            {PRECURSOR_ORDER.map((key) => {
              const p = data.precursors.find((x) => x.key === key);
              if (!p) return null;
              const meta = PRECURSOR_META[key] || {};
              return (
                <Row
                  key={key}
                  label={meta.label || p.label}
                  sub={`${meta.group || p.group} · ch ${p.channel}`}
                  value={Number(p.value).toFixed(2)}
                  unit={meta.unit || p.unit}
                  tone="unknown"
                />
              );
            })}

            {/* QPE — derived from channel 0 */}
            {qpe?.status === 'ok' && (
              <Row
                label="Satellite Rainfall (QPE)"
                sub={`HEM anomaly · Δ30min ${qpe.values.change_30min >= 0 ? '+' : ''}${qpe.values.change_30min}`}
                value={qpe.values.current_normalized.toFixed(2)}
                unit="σ"
                tone={qpe.values.current_normalized > 1.5 ? 'danger'
                    : qpe.values.current_normalized > 0.5 ? 'warn' : 'ok'}
              />
            )}

            {/* Convergence — derived from channels 2, 3 */}
            {conv?.status === 'ok' && (
              <Row
                label="Low-Level Convergence"
                sub={`10m wind · regime: ${conv.regime}`}
                value={(conv.convergence_s_inv * 1e6).toFixed(3)}
                unit="×10⁻⁶ s⁻¹"
                tone={convTone}
              />
            )}

            {/* CTT — derived from INSAT CTP files */}
            {ctt?.status === 'ok' && (
              <>
                <Row
                  label="Cloud Top Temperature"
                  sub={`${ctt.timestamps.current.slice(0, 16).replace('T', ' ')} · Δ${ctt.timestamps.gap_minutes}min`}
                  value={ctt.ctt.current_K.toFixed(1)}
                  unit="K"
                  tone="unknown"
                />
                <Row
                  label="CTT Drop Rate"
                  sub={ctt.interpretation}
                  value={ctt.ctt.drop_rate_K_per_30min.toFixed(2)}
                  unit="K/30min"
                  tone={cttTone}
                />
              </>
            )}

            {ctt?.status === 'not_available' && (
              <div className="text-[10px] pt-2" style={{ color: 'var(--a-text-faint)' }}>
                CTT: {ctt.message}
              </div>
            )}

            <div className="text-[10px] pt-2 uppercase tracking-widest"
                 style={{ color: 'var(--a-text-faint)' }}>
              Sample {data.sample_index} / {data.total_samples - 1}
            </div>
          </div>
        )}

        {data?.status === 'not_available' && (
          <div className="rounded p-3 text-xs leading-relaxed"
               style={{ background: 'var(--a-surface-2)', border: '1px solid var(--a-border)', color: 'var(--a-text-dim)' }}>
            <strong style={{ color: 'var(--a-text)' }}>Not available.</strong> {data.message}
          </div>
        )}
      </div>
    </section>
  );
}

function Row({ label, sub, value, unit, tone }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b"
         style={{ borderColor: 'var(--a-border-soft)' }}>
      <div className="min-w-0">
        <div className="text-xs font-medium" style={{ color: 'var(--a-text)' }}>{label}</div>
        <div className="text-[10px]" style={{ color: 'var(--a-text-faint)' }}>{sub}</div>
      </div>
      <div className="text-right shrink-0 ml-2">
        <div className="mono text-sm" style={{ color: TONE[tone] }}>{value}</div>
        <div className="text-[10px]" style={{ color: 'var(--a-text-faint)' }}>{unit}</div>
      </div>
    </div>
  );
}
