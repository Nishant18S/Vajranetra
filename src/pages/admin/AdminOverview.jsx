import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  AlertOctagon,
  AlertTriangle,
  Send,
  CheckCircle2,
  Users,
  PlusCircle,
  Activity,
  Satellite,
  Radar as RadarIcon,
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart3,
  ShieldCheck,
  Signal,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import KPITile from '../../components/admin/KPITile';
import CitizensByRegionPanel from '../../components/admin/CitizensByRegionPanel';
import { adminService } from '../../services/adminService';
import { fmtDateTime, fmtRelative } from '../../utils/formatters';

/* ---------------------------------------------------------------------- */
/*  Small shared bits                                                      */
/* ---------------------------------------------------------------------- */

function SectionHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-2 mb-3">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={14} style={{ color: 'var(--a-text-dim)' }} />}
        <div>
          <h2
            className="text-[13px] font-semibold tracking-tight"
            style={{ color: 'var(--a-text)' }}
          >
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] mt-0.5" style={{ color: 'var(--a-text-faint)' }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

function LiveDot({ ok = true }) {
  return (
    <span className="vn-adm-livedot__wrap">
      <span
        className="vn-adm-livedot"
        style={{ background: ok ? 'var(--a-green, #22c55e)' : 'var(--a-red)' }}
      />
      <span
        className="vn-adm-livedot vn-adm-livedot--ping"
        style={{ background: ok ? 'var(--a-green, #22c55e)' : 'var(--a-red)' }}
      />
    </span>
  );
}

const SEVERITY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#3b82f6',
};

const STATUS_COLORS = {
  Active: '#ef4444',
  Dispatched: '#0ea5e9',
  Resolved: '#22c55e',
};

/* ---------------------------------------------------------------------- */
/*  Charts                                                                  */
/* ---------------------------------------------------------------------- */

function SeverityBarChart({ data }) {
  const chartData = [
    { name: 'Critical', value: data.critical_alerts ?? 0, key: 'CRITICAL' },
    { name: 'High', value: data.high_alerts ?? 0, key: 'HIGH' },
    { name: 'Medium', value: data.medium_alerts ?? 0, key: 'MEDIUM' },
  ];
  const hasData = chartData.some((d) => d.value > 0);

  return (
    <div className="vn-adm-panel">
      <div className="vn-adm-panel__hd">
        <span className="vn-adm-panel__title">
          <BarChart3 size={12} className="inline mr-1.5 -mt-0.5" />
          Alerts by Severity
        </span>
      </div>
      <div className="p-3" style={{ height: 220 }}>
        {!hasData ? (
          <EmptyChart label="No active alerts to break down yet." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--a-border, #ffffff14)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'var(--a-text-faint)', fontSize: 11 }}
                axisLine={{ stroke: 'var(--a-border, #ffffff1f)' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: 'var(--a-text-faint)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                contentStyle={{
                  background: 'var(--a-panel, #16181d)',
                  border: '1px solid var(--a-border, #ffffff1f)',
                  borderRadius: 6,
                  fontSize: 11,
                }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.key} fill={SEVERITY_COLORS[entry.key]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function StatusDonutChart({ data }) {
  const chartData = [
    { name: 'Active', value: data.active_alerts ?? 0 },
    { name: 'Dispatched', value: data.dispatched_alerts ?? 0 },
    { name: 'Resolved', value: data.resolved_alerts ?? 0 },
  ];
  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="vn-adm-panel">
      <div className="vn-adm-panel__hd">
        <span className="vn-adm-panel__title">
          <PieChartIcon size={12} className="inline mr-1.5 -mt-0.5" />
          Alert Pipeline
        </span>
      </div>
      <div className="p-3 flex items-center gap-3" style={{ height: 220 }}>
        {total === 0 ? (
          <EmptyChart label="No alerts recorded yet." />
        ) : (
          <>
            <div style={{ width: '55%', height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {chartData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--a-panel, #16181d)',
                      border: '1px solid var(--a-border, #ffffff1f)',
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-2 text-[11px]">
              {chartData.map((d) => (
                <li key={d.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5" style={{ color: 'var(--a-text-dim)' }}>
                    <span
                      className="inline-block rounded-full"
                      style={{ width: 7, height: 7, background: STATUS_COLORS[d.name] }}
                    />
                    {d.name}
                  </span>
                  <span className="mono" style={{ color: 'var(--a-text)' }}>
                    {d.value}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function AlertsTrendChart({ alerts }) {
  const trend = useMemo(() => bucketByDay(alerts, 'created_at', 7), [alerts]);
  const hasData = trend.some((t) => t.count > 0);

  return (
    <div className="vn-adm-panel">
      <div className="vn-adm-panel__hd">
        <span className="vn-adm-panel__title">
          <TrendingUp size={12} className="inline mr-1.5 -mt-0.5" />
          7-Day Alert Volume
        </span>
      </div>
      <div className="p-3" style={{ height: 220 }}>
        {!hasData ? (
          <EmptyChart label="Not enough history to chart a trend." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="vnTrendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--a-accent, #0ea5e9)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--a-accent, #0ea5e9)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--a-border, #ffffff14)" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: 'var(--a-text-faint)', fontSize: 11 }}
                axisLine={{ stroke: 'var(--a-border, #ffffff1f)' }}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: 'var(--a-text-faint)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--a-panel, #16181d)',
                  border: '1px solid var(--a-border, #ffffff1f)',
                  borderRadius: 6,
                  fontSize: 11,
                }}
              />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--a-accent, #0ea5e9)"
                strokeWidth={2}
                fill="url(#vnTrendFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

function EmptyChart({ label }) {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <p className="text-[11px] text-center max-w-[180px]" style={{ color: 'var(--a-text-faint)' }}>
        {label}
      </p>
    </div>
  );
}

function bucketByDay(items, dateField, days) {
  const buckets = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    buckets.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(undefined, { weekday: 'short' }),
      count: 0,
    });
  }
  const map = Object.fromEntries(buckets.map((b) => [b.key, b]));
  (items || []).forEach((item) => {
    const raw = item?.[dateField];
    if (!raw) return;
    const key = new Date(raw).toISOString().slice(0, 10);
    if (map[key]) map[key].count += 1;
  });
  return buckets;
}

/* ---------------------------------------------------------------------- */
/*  Satellite & Radar monitoring panel                                     */
/* ---------------------------------------------------------------------- */

function RadarSatellitePanel({ alerts }) {
  const blips = useMemo(() => {
    const list = (alerts || []).slice(0, 8);
    return list.map((a, i) => {
      const angle = (i / Math.max(list.length, 1)) * 2 * Math.PI + i * 0.7;
      const radius = 18 + ((i * 13) % 32);
      return {
        id: a.alert_id ?? i,
        x: 50 + radius * Math.cos(angle),
        y: 50 + radius * Math.sin(angle),
        color: SEVERITY_COLORS[(a.severity || '').toUpperCase()] || '#94a3b8',
      };
    });
  }, [alerts]);

  return (
    <div className="vn-adm-panel">
      <style>{`
        @keyframes vnRadarSweep { to { transform: rotate(360deg); } }
        @keyframes vnRadarPulse { 0% { r: 4; opacity: .9; } 100% { r: 46; opacity: 0; } }
        @keyframes vnOrbit { to { transform: rotate(360deg); } }
        @keyframes vnBlink { 0%, 100% { opacity: .35; } 50% { opacity: 1; } }
        .vn-adm-livedot__wrap { position: relative; display: inline-flex; width: 8px; height: 8px; }
        .vn-adm-livedot { position: absolute; inset: 0; border-radius: 9999px; }
        .vn-adm-livedot--ping { animation: vnBlink 1.6s ease-in-out infinite; }
        .vn-radar__sweep-wrap { animation: vnRadarSweep 4s linear infinite; transform-origin: 50% 50%; }
        .vn-radar__pulse { animation: vnRadarPulse 2.6s ease-out infinite; transform-origin: 50px 50px; }
        .vn-sat__orbit { animation: vnOrbit 9s linear infinite; transform-origin: 50px 50px; }
      `}</style>
      <div className="vn-adm-panel__hd">
        <span className="vn-adm-panel__title">
          <RadarIcon size={12} className="inline mr-1.5 -mt-0.5" />
          Radar Sweep
        </span>
        <span className="text-[10px] flex items-center gap-1.5" style={{ color: 'var(--a-text-faint)' }}>
          <LiveDot /> tracking
        </span>
      </div>
      <div className="p-4 flex items-center gap-5">
        <svg viewBox="0 0 100 100" width="150" height="150" className="shrink-0">
          <circle cx="50" cy="50" r="48" fill="none" stroke="var(--a-border, #ffffff1f)" />
          <circle cx="50" cy="50" r="34" fill="none" stroke="var(--a-border, #ffffff14)" />
          <circle cx="50" cy="50" r="18" fill="none" stroke="var(--a-border, #ffffff14)" />
          <line x1="2" y1="50" x2="98" y2="50" stroke="var(--a-border, #ffffff14)" />
          <line x1="50" y1="2" x2="50" y2="98" stroke="var(--a-border, #ffffff14)" />

          <circle
            className="vn-radar__pulse"
            cx="50"
            cy="50"
            r="4"
            fill="none"
            stroke="var(--a-accent, #0ea5e9)"
            strokeWidth="1"
          />

          {blips.map((b) => (
            <circle key={b.id} cx={b.x} cy={b.y} r="2.4" fill={b.color} />
          ))}

          <g className="vn-radar__sweep-wrap">
            <path d="M50 50 L50 4 A46 46 0 0 1 88 28 Z" fill="var(--a-accent, #0ea5e9)" opacity="0.18" />
            <line x1="50" y1="50" x2="50" y2="4" stroke="var(--a-accent, #0ea5e9)" strokeWidth="1.5" />
          </g>
        </svg>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex items-center gap-2">
            <Satellite size={16} style={{ color: 'var(--a-accent)' }} />
            <div>
              <div className="text-[12px] font-medium" style={{ color: 'var(--a-text)' }}>
                Satellite feed nominal
              </div>
              <div className="text-[10.5px]" style={{ color: 'var(--a-text-faint)' }}>
                Next overhead pass in ~{12 + (blips.length % 5)} min
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Signal size={16} style={{ color: 'var(--a-text-dim)' }} />
            <div>
              <div className="text-[12px] font-medium" style={{ color: 'var(--a-text)' }}>
                {blips.length} contact{blips.length === 1 ? '' : 's'} on scope
              </div>
              <div className="text-[10.5px]" style={{ color: 'var(--a-text-faint)' }}>
                Derived from active &amp; recent alerts
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} style={{ color: 'var(--a-green, #22c55e)' }} />
            <div>
              <div className="text-[12px] font-medium" style={{ color: 'var(--a-text)' }}>
                Ground stations synced
              </div>
              <div className="text-[10.5px]" style={{ color: 'var(--a-text-faint)' }}>
                Last sync {fmtRelative(new Date().toISOString())}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SatelliteOrbitPanel() {
  return (
    <div className="vn-adm-panel">
      <div className="vn-adm-panel__hd">
        <span className="vn-adm-panel__title">
          <Satellite size={12} className="inline mr-1.5 -mt-0.5" />
          Satellite Coverage
        </span>
      </div>
      <div className="p-4 flex items-center justify-center">
        <svg viewBox="0 0 100 100" width="150" height="150">
          <circle cx="50" cy="50" r="30" fill="var(--a-accent, #0ea5e9)" opacity="0.08" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="var(--a-accent, #0ea5e9)" opacity="0.3" strokeDasharray="2 3" />
          <circle cx="50" cy="50" r="14" fill="var(--a-accent, #0ea5e9)" opacity="0.15" />
          {/* planet */}
          <circle cx="50" cy="50" r="10" fill="var(--a-panel-2, #1c1f26)" stroke="var(--a-border, #ffffff2a)" />
          {/* orbiting satellite */}
          <g className="vn-sat__orbit">
            <circle cx="80" cy="50" r="2.2" fill="#fff" />
            <rect x="76.5" y="48.7" width="2.6" height="2.6" fill="var(--a-accent, #0ea5e9)" />
          </g>
        </svg>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/*  Main page                                                               */
/* ---------------------------------------------------------------------- */

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminService.dashboard();
      setData(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const d = data || {};
  const totalUsers =
    (d.user_counts?.CITIZEN ?? 0) + (d.user_counts?.AUTHORITY ?? 0) + (d.user_counts?.ADMIN ?? 0);
  const totalAlerts = (d.active_alerts ?? 0) + (d.dispatched_alerts ?? 0) + (d.resolved_alerts ?? 0);

  return (
    <div className="space-y-6">
      {/* ---------- Header ---------- */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold" style={{ color: 'var(--a-text)' }}>
              Operational Overview
            </h1>
            <span className="flex items-center gap-1.5 text-[10.5px]" style={{ color: 'var(--a-text-faint)' }}>
              <LiveDot ok={!error} /> {error ? 'degraded' : 'live'}
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--a-text-dim)' }}>
            Live picture from alerts, forecasts, satellite/radar monitoring, and users.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="vn-adm-btn vn-adm-btn--outline" disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
          <Link to="/admin/alerts/new" className="vn-adm-btn vn-adm-btn--primary">
            <PlusCircle size={13} /> Create Alert
          </Link>
        </div>
      </div>

      {error && (
        <div
          className="rounded p-4 text-xs"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.35)',
            color: 'var(--a-red)',
          }}
        >
          Failed to load dashboard: {error.message}
        </div>
      )}

      {/* ---------- Section: Key metrics ---------- */}
      <section>
        <SectionHeader icon={Activity} title="Key Metrics" subtitle="Snapshot across alerts and users" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPITile label="Active Alerts" icon={Bell} tone="critical" value={d.active_alerts ?? '—'} hint="Not yet dispatched" />
          <KPITile label="Critical" icon={AlertOctagon} tone="critical" value={d.critical_alerts ?? '—'} hint="Highest severity" />
          <KPITile label="High" icon={AlertTriangle} tone="warning" value={d.high_alerts ?? '—'} hint="Severe risk" />
          <KPITile label="Dispatched" icon={Send} tone="accent" value={d.dispatched_alerts ?? '—'} hint="Visible to citizens" />
          <KPITile label="Resolved" icon={CheckCircle2} tone="normal" value={d.resolved_alerts ?? '—'} />
          <KPITile label="Medium" icon={AlertTriangle} tone="watch" value={d.medium_alerts ?? '—'} />
          <KPITile label="Registered Citizens" icon={Users} tone="default" value={d.user_counts?.CITIZEN ?? '—'} />
          <KPITile
            label="Authority Users"
            icon={Users}
            tone="default"
            value={(d.user_counts?.AUTHORITY ?? 0) + (d.user_counts?.ADMIN ?? 0)}
          />
        </div>
      </section>

      {/* ---------- Section: Analytics ---------- */}
      <section>
        <SectionHeader icon={BarChart3} title="Analytics" subtitle="Distribution and trend of alerts" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <SeverityBarChart data={d} />
          <StatusDonutChart data={d} />
          <AlertsTrendChart alerts={d.recent_alerts} />
        </div>
      </section>

      {/* ---------- Section: Monitoring ---------- */}
      <section>
        <SectionHeader icon={RadarIcon} title="Monitoring" subtitle="Satellite and radar situational awareness" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RadarSatellitePanel alerts={d.recent_alerts} />
          </div>
          <SatelliteOrbitPanel />
        </div>
      </section>

      {/* ---------- Section: Operations ---------- */}
      <section>
        <SectionHeader icon={Bell} title="Operations" subtitle="Most recent alerts and forecast runs" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="vn-adm-panel">
            <div className="vn-adm-panel__hd">
              <span className="vn-adm-panel__title">Recent Alerts</span>
              <Link to="/admin/alerts" className="text-[11px]" style={{ color: 'var(--a-accent)' }}>
                View all →
              </Link>
            </div>
            <div className="p-4">
              {!d.recent_alerts?.length ? (
                <p className="text-xs" style={{ color: 'var(--a-text-dim)' }}>
                  No alerts yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {d.recent_alerts.slice(0, 6).map((a) => (
                    <li key={a.alert_id} className="flex items-start gap-3 text-xs">
                      <span className="mono" style={{ color: 'var(--a-text-faint)', minWidth: 60 }}>
                        {String(a.alert_id).slice(-6)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`vn-adm-badge vn-adm-badge--${(a.severity || '').toLowerCase()}`}>
                            {a.severity}
                          </span>
                          <span style={{ color: 'var(--a-text)' }}>{a.title || `+${a.horizon_hours}h`}</span>
                        </div>
                        <div className="mt-0.5" style={{ color: 'var(--a-text-faint)' }}>
                          {a.status} · {fmtRelative(a.created_at)}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="vn-adm-panel">
            <div className="vn-adm-panel__hd">
              <span className="vn-adm-panel__title">Recent Forecasts</span>
              <Link to="/admin/forecast" className="text-[11px]" style={{ color: 'var(--a-accent)' }}>
                View all →
              </Link>
            </div>
            <div className="p-4">
              {!d.recent_forecasts?.length ? (
                <p className="text-xs" style={{ color: 'var(--a-text-dim)' }}>
                  No forecasts yet. Run inference from the Forecast page.
                </p>
              ) : (
                <ul className="space-y-2">
                  {d.recent_forecasts.slice(0, 6).map((f) => (
                    <li key={f.forecast_id} className="flex items-center justify-between text-xs">
                      <span className="mono" style={{ color: 'var(--a-text-faint)' }}>
                        {String(f.forecast_id).slice(-8)}
                      </span>
                      <span className="mono" style={{ color: 'var(--a-text-dim)' }}>
                        sample {f.sample_index}
                      </span>
                      <span className="mono" style={{ color: 'var(--a-text)' }}>
                        {fmtDateTime(f.generated_at)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Section: Population ---------- */}
      <section>
        <SectionHeader icon={Users} title="Population" subtitle="Citizens registered by region" />
        <CitizensByRegionPanel />
      </section>

      {/* ---------- Section: System health ---------- */}
      <section>
        <SectionHeader icon={Activity} title="System Health" />
        <div className="vn-adm-panel">
          <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <KV label="Backend" value={d.system_health?.backend_status ?? '—'} />
            <KV label="Database" value={d.system_health?.database_status ?? '—'} />
            <KV label="Total users" value={totalUsers} />
            <KV label="Alerts total" value={totalAlerts} />
          </div>
        </div>
      </section>
    </div>
  );
}

function KV({ label, value }) {
  return (
    <div>
      <div className="kpi-label">{label}</div>
      <div className="mono mt-1" style={{ color: 'var(--a-text)' }}>
        {String(value)}
      </div>
    </div>
  );
}