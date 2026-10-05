import PageHeader from '../components/common/PageHeader';
import FreshnessIndicator from '../components/common/FreshnessIndicator';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import RiskBadge from '../components/common/RiskBadge';
import Button from '../components/common/Button';
import { useState } from 'react';
import { useAlerts } from '../hooks/useAlerts';
import { useForecast } from '../hooks/useForecast';
import { STATUS } from '../utils/constants';
import { fmtNumber } from '../utils/formatters';

export default function Alerts() {
  const { alerts, state, error, refreshing, lastUpdated, loadSample } = useAlerts();
  const { sampleIndex } = useForecast();
  const [idx, setIdx] = useState(sampleIndex);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { await loadSample(Number(idx)); } catch {}
    finally { setBusy(false); }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-5 py-6 space-y-5">
      <PageHeader
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Alerts' }]}
        title="Alert Summary"
        subtitle="Forecast horizons whose risk is HIGH or CRITICAL, per the configured thresholds."
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
        <Button type="submit" loading={busy}>Load Alerts</Button>
      </form>

      <section className="panel">
        <div className="panel-hd">
          <h3 className="panel-title">Active</h3>
          <span className="text-2xs text-ink-faint">{alerts?.length ?? 0} alert(s)</span>
        </div>
        <div className="p-4">
          {state === STATUS.ERROR && <ErrorState error={error} onRetry={() => loadSample(sampleIndex)} />}
          {state === STATUS.EMPTY && (
            <EmptyState title="No active alerts." hint="Nothing crossed the thresholds for this sample." />
          )}
          {state === STATUS.SUCCESS && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-2xs uppercase tracking-wider text-ink-faint">
                  <tr className="border-b border-line">
                    <th className="px-3 py-2 text-left">Horizon</th>
                    <th className="px-3 py-2 text-left">Risk</th>
                    <th className="px-3 py-2 text-left">Probability</th>
                    <th className="px-3 py-2 text-left">Threshold</th>
                    <th className="px-3 py-2 text-left">Alert cells</th>
                    <th className="px-3 py-2 text-left">Grid</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((a) => (
                    <tr key={a.horizon_hours} className="border-b border-line/60">
                      <td className="px-3 py-2 mono">+{a.horizon_hours}h</td>
                      <td className="px-3 py-2"><RiskBadge risk={a.risk} /></td>
                      <td className="px-3 py-2 mono">{fmtNumber(a.probability ?? a.max_probability, 4)}</td>
                      <td className="px-3 py-2 mono">{fmtNumber(a.threshold, 2)}</td>
                      <td className="px-3 py-2 mono">{a.alert_cells ?? '—'}</td>
                      <td className="px-3 py-2 mono">Y {a.grid_y ?? '—'} · X {a.grid_x ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <div className="text-2xs text-ink-faint">
        Note: Alert acknowledgement, resolution, and authority workflow require backend endpoints
        that are not yet implemented. These actions are intentionally not shown until the
        corresponding APIs exist.
      </div>
    </div>
  );
}