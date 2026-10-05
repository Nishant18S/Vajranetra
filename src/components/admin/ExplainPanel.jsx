import { useEffect, useState } from 'react';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { regionService } from '../../services/regionService';

export default function ExplainPanel({ sampleIndex = 0, gridCell, horizon = 4, task = 'cloudburst' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    if (!gridCell || !horizon || !task) return;
    setLoading(true);
    setError(null);
    try {
      const res = await regionService.getExplanation({
        sampleIndex: sampleIndex ?? 0,
        y: gridCell.y,
        x: gridCell.x,
        horizon,
        task,
      });
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
  }, [sampleIndex, gridCell?.y, gridCell?.x, horizon, task]);

  if (!gridCell) return null;

  const maxAbs = data?.top_channels?.length
    ? Math.max(...data.top_channels.map((c) => Math.abs(c.contribution)), 1e-9)
    : 1;

  return (
    <section className="vn-adm-panel">
      <div className="vn-adm-panel__hd">
        <span className="vn-adm-panel__title flex items-center gap-2">
          <Sparkles size={12} /> Why This Prediction?
        </span>
        <button
          onClick={load}
          className="vn-adm-btn vn-adm-btn--outline"
          disabled={loading}
        >
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {loading && !data && (
          <p className="text-xs" style={{ color: 'var(--a-text-dim)' }}>
            Computing feature attribution… (~30 s first call, then cached)
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

        {data?.status === 'ok' && data.top_channels.length > 0 && (
          <>
            <div className="text-[11px]" style={{ color: 'var(--a-text-dim)' }}>
              Method: <span className="mono">{data.method}</span> · Base probability:{' '}
              <span className="mono" style={{ color: 'var(--a-text)' }}>
                {(data.base_probability * 100).toFixed(2)}%
              </span>{' '}
              for +{data.horizon}h {data.task}
            </div>

            <div className="space-y-2">
              {data.top_channels.map((c) => {
                const pct = Math.min(100, (Math.abs(c.contribution) / maxAbs) * 100);
                return (
                  <div key={c.channel}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span style={{ color: 'var(--a-text)' }}>
                        <span className="mono" style={{ color: 'var(--a-text-faint)' }}>
                          ch{c.channel}
                        </span>{' '}
                        {c.label}
                      </span>
                      <span className="mono" style={{ color: 'var(--a-text-dim)' }}>
                        {c.contribution >= 0 ? '+' : ''}
                        {(c.contribution * 100).toFixed(3)}%
                      </span>
                    </div>
                    <div
                      className="h-1.5 rounded-full"
                      style={{ background: 'var(--a-surface-2)' }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: 'var(--a-accent)' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <p
              className="text-[10px] pt-2 leading-relaxed"
              style={{ color: 'var(--a-text-faint)' }}
            >
              Interpretation: the channels above, when zeroed out, caused the
              largest drop in the model's output probability.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
