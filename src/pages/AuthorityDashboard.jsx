import PageHeader from '../components/common/PageHeader';
import FreshnessIndicator from '../components/common/FreshnessIndicator';
import StatTile from '../components/common/StatTile';
import Card from '../components/common/Card';
import RiskBadge from '../components/common/RiskBadge';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { Bell, AlertOctagon, AlertTriangle, Activity } from 'lucide-react';
import { useAlerts } from '../hooks/useAlerts';
import { useForecast } from '../hooks/useForecast';
import { useSystemStatus } from '../hooks/useSystemStatus';
import { STATUS } from '../utils/constants';

export default function AuthorityDashboard() {
  const { alerts, state: alertState, refreshing, lastUpdated, loadSample: loadAlerts } = useAlerts();
  const { forecast, sampleIndex } = useForecast();
  const { health, modelInfo } = useSystemStatus();

  const counts = countBy(alerts);

  const reload = async () => { await loadAlerts(sampleIndex); };

  return (
    <div className="space-y-5 max-w-[1600px]">
      <PageHeader
        breadcrumbs={[{ label: 'Authority', to: '/authority' }, { label: 'Overview' }]}
        title="Operational Overview"
        subtitle="Aggregated from available forecast and alert endpoints. Acknowledgement workflow requires additional backend endpoints."
        right={<FreshnessIndicator updatedAt={lastUpdated} intervalMs={45000} onRefresh={reload} refreshing={refreshing} />}
      />

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Total Alerts" icon={Bell}          tone="critical"
          value={alertState === STATUS.SUCCESS ? alerts.length : '—'} />
        <StatTile label="Critical"     icon={AlertOctagon}  tone="critical" value={counts.CRITICAL} />
        <StatTile label="High"         icon={AlertTriangle} tone="warning"  value={counts.HIGH} />
        <StatTile label="Moderate"     icon={AlertTriangle} tone="watch"    value={counts.MODERATE} />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="System Health" className="lg:col-span-1">
          <KV label="Backend"      value={health?.status ?? '—'} />
          <KV label="Device"       value={health?.device ?? '—'} />
          <KV label="Model loaded" value={health?.model_loaded ? 'yes' : 'no'} />
          <KV label="Model"        value={modelInfo?.model ?? '—'} />
          <KV label="Horizons"     value={(modelInfo?.forecast_horizons || []).join(', ') || '—'} />
          <KV label="Sample"       value={sampleIndex} mono />
        </Card>

        <Card title="Latest Forecast" className="lg:col-span-2">
          {!forecast?.forecasts?.length && <EmptyState title="No forecast loaded." />}
          {forecast?.forecasts?.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {forecast.forecasts.map((h) => (
                <div key={h.horizon_hours} className="border border-line rounded p-3">
                  <div className="flex items-center justify-between">
                    <span className="mono text-lg text-ink-hi">+{h.horizon_hours}</span>
                    <RiskBadge risk={h.risk} />
                  </div>
                  <div className="text-2xs text-ink-dim mt-2 mono">
                    {h.alert_cells} cells · Y{h.grid_y} X{h.grid_x}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </section>

      <Card title="Alerts (from /api/alerts)">
        {alertState === STATUS.EMPTY && <EmptyState title="No alerts for this sample." />}
        {alertState === STATUS.SUCCESS && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="text-2xs uppercase tracking-wider text-ink-faint">
                <tr className="border-b border-line">
                  <th className="px-3 py-2 text-left">Horizon</th>
                  <th className="px-3 py-2 text-left">Risk</th>
                  <th className="px-3 py-2 text-left">Probability</th>
                  <th className="px-3 py-2 text-left">Threshold</th>
                  <th className="px-3 py-2 text-left">Cells</th>
                  <th className="px-3 py-2 text-left">Grid</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => (
                  <tr key={a.horizon_hours} className="border-b border-line/60">
                    <td className="px-3 py-2 mono">+{a.horizon_hours}h</td>
                    <td className="px-3 py-2"><RiskBadge risk={a.risk} /></td>
                    <td className="px-3 py-2 mono">{(a.probability ?? a.max_probability ?? 0).toFixed(4)}</td>
                    <td className="px-3 py-2 mono">{a.threshold}</td>
                    <td className="px-3 py-2 mono">{a.alert_cells}</td>
                    <td className="px-3 py-2 mono">Y{a.grid_y} X{a.grid_x}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="text-2xs text-ink-faint border-t border-line pt-3 flex items-center gap-3">
        <Activity size={12} />
        Acknowledgement, dispatch, resolve, incident management, and audit logs require
        new backend endpoints. They will appear here once those APIs exist.
      </div>
    </div>
  );
}

const countBy = (list) => {
  const out = { CRITICAL: 0, HIGH: 0, MODERATE: 0, LOW: 0 };
  (list || []).forEach((a) => {
    const k = (a.risk || '').toUpperCase();
    if (out[k] != null) out[k] += 1;
  });
  return out;
};

const KV = ({ label, value, mono }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-line/60 last:border-0 text-xs">
    <span className="text-ink-faint uppercase tracking-wider text-2xs">{label}</span>
    <span className={`text-ink-hi ${mono ? 'mono' : ''}`}>{String(value)}</span>
  </div>
);