import { useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import FreshnessIndicator from '../components/common/FreshnessIndicator';
import HorizonCard from '../components/forecast/HorizonCard';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { useForecast } from '../hooks/useForecast';
import { useSystemStatus } from '../hooks/useSystemStatus';
import { STATUS } from '../utils/constants';
import { fmtDateTime } from '../utils/formatters';

export default function Forecast() {
  const { forecast, state, error, refreshing, lastUpdated, loadSample, sampleIndex } = useForecast();
  const { modelInfo } = useSystemStatus();
  const [idx, setIdx] = useState(sampleIndex);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg({ kind: 'info', text: 'Loading forecast…' });
    try {
      await loadSample(Number(idx));
      setMsg({ kind: 'ok', text: `Forecast loaded for sample ${idx}.` });
    } catch (err) {
      setMsg({ kind: 'err', text: err.message || 'Failed to load forecast.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-5 py-6 space-y-5">
      <PageHeader
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Forecast' }]}
        title="Forecast"
        subtitle="Multi-horizon cloudburst probability from precomputed model outputs."
        right={<FreshnessIndicator updatedAt={lastUpdated} intervalMs={45000} onRefresh={() => loadSample(sampleIndex)} refreshing={refreshing} />}
      />

      <form onSubmit={submit} className="panel p-4 flex flex-wrap items-end gap-3">
        <label className="text-xs">
          <span className="block text-ink-faint uppercase tracking-wider text-2xs mb-1">Sample index</span>
          <input
            type="number" min={0} value={idx}
            onChange={(e) => setIdx(e.target.value)}
            className="w-32 bg-base-900 border border-line rounded px-2.5 py-2 text-ink mono focus:outline-none focus:border-accent/60"
          />
        </label>
        <Button type="submit" loading={busy}>Run Forecast</Button>
        {msg && (
          <p className={`text-xs ml-auto ${
            msg.kind === 'err' ? 'text-risk-critical'
            : msg.kind === 'ok' ? 'text-risk-normal'
            : 'text-ink-dim'}`}>
            {msg.text}
          </p>
        )}
      </form>

      {forecast && (
        <div className="panel p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <Meta label="Highest risk" value={forecast.highest_risk ?? '—'} />
          <Meta label="Sample index" value={sampleIndex} mono />
          <Meta label="Model" value={modelInfo?.model ?? '—'} />
          <Meta label="Data source" value="Precomputed (.npz)" />
        </div>
      )}

      <section className="panel">
        <div className="panel-hd"><h3 className="panel-title">Horizons</h3></div>
        <div className="p-4">
          {state === STATUS.ERROR && <ErrorState error={error} onRetry={() => loadSample(sampleIndex)} />}
          {state === STATUS.EMPTY && (
            <EmptyState title="No forecast loaded." hint="Enter a sample index and press Run Forecast." />
          )}
          {state === STATUS.SUCCESS && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {(forecast?.forecasts || []).map((h) => <HorizonCard key={h.horizon_hours} h={h} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const Meta = ({ label, value, mono }) => (
  <div>
    <div className="kpi-label">{label}</div>
    <div className={`mt-1 text-ink-hi ${mono ? 'mono text-xs' : 'text-sm'} truncate`}>{String(value)}</div>
  </div>
);