import { useCallback, useEffect, useState } from 'react';
import {
  RefreshCw, BarChart3, Clock, TrendingUp, Users, MapPin,
  AlertTriangle, Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts';
import KPITile from '../../components/admin/KPITile';
import { adminService } from '../../services/adminService';
import { fmtDateTime } from '../../utils/formatters';

const RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
];

const SEVERITY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MODERATE: '#f59e0b',
  LOW: '#10b981',
};

const STATUS_COLORS = {
  ACTIVE: '#ef4444',
  ACKNOWLEDGED: '#f59e0b',
  DISPATCHED: '#22d3ee',
  RESOLVED: '#10b981',
  EXPIRED: '#64748b',
};

const HORIZON_COLORS = ['#22d3ee', '#06b6d4', '#0891b2', '#0e7490', '#155e75'];

const TASK_COLORS = {
  thunderstorm: '#8b5cf6',
  cloudburst: '#3b82f6',
  flash_flood: '#06b6d4',
};

function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: '#0d1425',
        border: '1px solid #1f2a44',
        borderRadius: 6,
        padding: '8px 12px',
        fontSize: 11,
        color: '#e6edf7',
      }}
    >
      {label && (
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      )}
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#e6edf7' }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function AdminAnalytics() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [distributions, setDistributions] = useState(null);
  const [gridHeat, setGridHeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summary, dist, heat] = await Promise.all([
        adminService.analyticsSummary(days),
        adminService.analyticsDistributions(),
        adminService.analyticsGridHeatmap(50),
      ]);
      setData(summary);
      setDistributions(dist);
      setGridHeat(heat);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    load();
  }, [load]);

  const a = data?.alerts || {};
  const f = data?.forecasts || {};
  const inc = data?.incidents || {};
  const u = data?.users || {};

  const severityData = Object.entries(a.by_severity || {}).map(
    ([name, value]) => ({
      name,
      value,
      fill: SEVERITY_COLORS[name] || '#64748b',
    })
  );

  const statusData = Object.entries(a.by_status || {}).map(
    ([name, value]) => ({
      name,
      value,
      fill: STATUS_COLORS[name] || '#64748b',
    })
  );

  const horizonData = (distributions?.by_horizon || []).map((h, i) => ({
    horizon: `+${h.horizon}h`,
    count: h.count,
    fill: HORIZON_COLORS[i % HORIZON_COLORS.length],
  }));

  const taskData = (distributions?.by_task || []).map((t) => ({
    name: t.task?.replace(/_/g, ' ') || 'unknown',
    value: t.count,
    fill: TASK_COLORS[t.task] || '#64748b',
  }));

  const districtData = (distributions?.by_district || []).slice(0, 10);

  const dailyData = (a.daily || []).map((d) => ({
    date: d.date?.slice(5),
    count: d.count,
  }));

  const incidentStatusData = Object.entries(inc.by_status || {}).map(
    ([name, value]) => ({
      name,
      value,
      fill:
        name === 'OPEN'
          ? '#ef4444'
          : name === 'IN_PROGRESS'
          ? '#f59e0b'
          : name === 'RESOLVED'
          ? '#10b981'
          : '#64748b',
    })
  );

  const userData = [
    { role: 'Citizens', count: u.CITIZEN ?? 0, fill: '#10b981' },
    { role: 'Authority', count: u.AUTHORITY ?? 0, fill: '#22d3ee' },
    { role: 'Admins', count: u.ADMIN ?? 0, fill: '#8b5cf6' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--a-text)' }}>
            Analytics
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--a-text-dim)' }}>
            Real metrics from alerts, forecasts, incidents, and users.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex border rounded overflow-hidden"
            style={{ borderColor: 'var(--a-border)' }}
          >
            {RANGES.map((r) => (
              <button
                key={r.days}
                onClick={() => setDays(r.days)}
                className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
                style={{
                  background:
                    days === r.days ? 'var(--a-accent-soft)' : 'transparent',
                  color: days === r.days ? 'var(--a-accent)' : 'var(--a-text-dim)',
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={load}
            className="vn-adm-btn vn-adm-btn--outline"
            disabled={loading}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />{' '}
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div
          className="rounded p-3 text-xs"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.35)',
            color: 'var(--a-red)',
          }}
        >
          Could not load analytics: {error.message}
        </div>
      )}

      {/* KPI tiles */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPITile
          label="Alerts"
          tone="accent"
          value={a.total ?? '—'}
          hint={`last ${days} days`}
        />
        <KPITile
          label="Avg time to ACK"
          icon={Clock}
          tone="watch"
          value={
            a.avg_time_to_acknowledge_minutes != null
              ? `${a.avg_time_to_acknowledge_minutes} min`
              : '—'
          }
        />
        <KPITile
          label="Avg time to Dispatch"
          icon={Clock}
          tone="warning"
          value={
            a.avg_time_to_dispatch_minutes != null
              ? `${a.avg_time_to_dispatch_minutes} min`
              : '—'
          }
        />
        <KPITile
          label="Forecasts (window)"
          icon={TrendingUp}
          value={f.in_window ?? '—'}
        />
      </section>

      {/* Row 1: three donuts */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Alerts by Severity" icon={AlertTriangle}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={severityData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                stroke="#0d1425"
                strokeWidth={2}
              >
                {severityData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<DarkTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: '#b6c1d3' }}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Alerts by Status" icon={Activity}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                stroke="#0d1425"
                strokeWidth={2}
              >
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<DarkTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: '#b6c1d3' }}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Alerts by Task" icon={BarChart3}>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={taskData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                stroke="#0d1425"
                strokeWidth={2}
              >
                {taskData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<DarkTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, color: '#b6c1d3' }}
                iconType="circle"
                iconSize={8}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* Row 2: horizon bar + district bar */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Alerts by Horizon" icon={Clock}>
          {horizonData.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={horizonData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="#1f2a44"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="horizon"
                  tick={{ fill: '#7c8aa3', fontSize: 11 }}
                  axisLine={{ stroke: '#1f2a44' }}
                />
                <YAxis
                  tick={{ fill: '#7c8aa3', fontSize: 11 }}
                  axisLine={{ stroke: '#1f2a44' }}
                />
                <Tooltip
                  content={<DarkTooltip />}
                  cursor={{ fill: 'rgba(34,211,238,0.06)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {horizonData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Top 10 Districts by Alerts" icon={MapPin}>
          {districtData.length === 0 ? (
            <EmptyChart text="No district-tagged alerts yet." />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={districtData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 80, bottom: 0 }}
              >
                <CartesianGrid
                  stroke="#1f2a44"
                  strokeDasharray="3 3"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  tick={{ fill: '#7c8aa3', fontSize: 11 }}
                  axisLine={{ stroke: '#1f2a44' }}
                />
                <YAxis
                  type="category"
                  dataKey="district"
                  tick={{ fill: '#b6c1d3', fontSize: 11 }}
                  axisLine={{ stroke: '#1f2a44' }}
                  width={80}
                />
                <Tooltip
                  content={<DarkTooltip />}
                  cursor={{ fill: 'rgba(34,211,238,0.06)' }}
                />
                <Bar dataKey="count" fill="#22d3ee" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </section>

      {/* Row 3: daily area */}
      <ChartCard title="Daily Alerts" icon={BarChart3}>
        {dailyData.length === 0 ? (
          <EmptyChart text={`No alerts in the last ${days} days.`} />
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart
              data={dailyData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="dailyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                stroke="#1f2a44"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: '#7c8aa3', fontSize: 11 }}
                axisLine={{ stroke: '#1f2a44' }}
              />
              <YAxis
                tick={{ fill: '#7c8aa3', fontSize: 11 }}
                axisLine={{ stroke: '#1f2a44' }}
              />
              <Tooltip content={<DarkTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#22d3ee"
                strokeWidth={2}
                fill="url(#dailyGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Row 4: incidents donut + users bar */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Incidents by Status" icon={AlertTriangle}>
          {incidentStatusData.every((d) => d.value === 0) ? (
            <EmptyChart text="No incidents yet." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={incidentStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  stroke="#0d1425"
                  strokeWidth={2}
                >
                  {incidentStatusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<DarkTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 11, color: '#b6c1d3' }}
                  iconType="circle"
                  iconSize={8}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Users by Role" icon={Users}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart
              data={userData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                stroke="#1f2a44"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="role"
                tick={{ fill: '#7c8aa3', fontSize: 11 }}
                axisLine={{ stroke: '#1f2a44' }}
              />
              <YAxis
                tick={{ fill: '#7c8aa3', fontSize: 11 }}
                axisLine={{ stroke: '#1f2a44' }}
                allowDecimals={false}
              />
              <Tooltip
                content={<DarkTooltip />}
                cursor={{ fill: 'rgba(34,211,238,0.06)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {userData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </section>

      {/* Affected locations table */}
      <ChartCard title="Affected Locations (Top Grid Cells)" icon={MapPin}>
        {!gridHeat || gridHeat.length === 0 ? (
          <EmptyChart text="No grid cells with alerts yet." />
        ) : (
          <div className="overflow-x-auto">
            <table className="vn-adm-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Grid Cell</th>
                  <th>Alerts</th>
                  <th>Highest Severity</th>
                  <th>Frequency</th>
                </tr>
              </thead>
              <tbody>
                {gridHeat.slice(0, 15).map((cell, i) => {
                  const max = Math.max(...gridHeat.map((c) => c.count), 1);
                  const pct = Math.round((cell.count / max) * 100);
                  const sev = (cell.highest_severity || '').toUpperCase();
                  const color =
                    sev === 'CRITICAL'
                      ? '#ef4444'
                      : sev === 'HIGH'
                      ? '#f97316'
                      : sev === 'MODERATE'
                      ? '#f59e0b'
                      : '#10b981';
                  return (
                    <tr key={`${cell.grid_y}-${cell.grid_x}`}>
                      <td
                        className="mono"
                        style={{ color: 'var(--a-text-faint)' }}
                      >
                        {i + 1}
                      </td>
                      <td className="mono">
                        Y{cell.grid_y} · X{cell.grid_x}
                      </td>
                      <td className="mono">{cell.count}</td>
                      <td>
                        <span
                          className={`vn-adm-badge vn-adm-badge--${sev.toLowerCase()}`}
                        >
                          {cell.highest_severity || '—'}
                        </span>
                      </td>
                      <td>
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${pct}%`,
                            background: color,
                            minWidth: 4,
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </ChartCard>

      {data?.generated_at && (
        <p
          className="text-[10px] uppercase tracking-widest text-center"
          style={{ color: 'var(--a-text-faint)' }}
        >
          Generated {fmtDateTime(data.generated_at)}
        </p>
      )}
    </div>
  );
}

function ChartCard({ title, icon: Icon, children }) {
  return (
    <section className="vn-adm-panel">
      <div className="vn-adm-panel__hd">
        <span className="vn-adm-panel__title flex items-center gap-2">
          {Icon && <Icon size={12} />}
          {title}
        </span>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function EmptyChart({ text = 'No data available.' }) {
  return (
    <div
      className="flex items-center justify-center h-[240px] text-xs"
      style={{ color: 'var(--a-text-faint)' }}
    >
      {text}
    </div>
  );
}