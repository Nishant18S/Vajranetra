import { useState } from 'react';
import { Bell, AlertTriangle, ChevronDown, ChevronUp, CheckCircle2, Phone } from 'lucide-react';
import { useMyAlerts } from '../../hooks/useMyAlerts';
import RiskBadge from '../../components/common/RiskBadge';
import { fmtDateTime } from '../../utils/formatters';

export default function CitizenAlerts() {
  const { alerts, region, loading, error, refresh, lastUpdated } = useMyAlerts();
  const [expanded, setExpanded] = useState({});

  const toggle = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  return (
    <div className="space-y-6">
      <section className="vn-panel p-6">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--vn-primary)' }}>
              Active Alerts
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Weather warnings issued for your area
              {region?.district && (
                <> · <span className="font-medium">{region.district}, {region.state}</span></>
              )}.
            </p>
          </div>
          <button
            onClick={refresh}
            className="vn-btn vn-btn--outline text-xs"
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
        {lastUpdated && (
          <div className="text-[11px] text-slate-500 mt-2">
            Last updated {fmtDateTime(lastUpdated)}
          </div>
        )}
      </section>

      {error && (
        <section className="vn-panel p-5" style={{ borderLeft: '4px solid var(--vn-red)' }}>
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} style={{ color: 'var(--vn-red)' }} />
            <div>
              <div className="font-semibold text-slate-800">Could not load alerts</div>
              <p className="text-sm text-slate-600 mt-1">{error.message}</p>
            </div>
          </div>
        </section>
      )}

      {loading && alerts.length === 0 && (
        <section className="vn-panel p-8 text-center text-sm text-slate-500">
          Loading alerts…
        </section>
      )}

      {!loading && !error && alerts.length === 0 && (
        <section className="vn-panel p-8 text-center">
          <CheckCircle2 size={32} className="mx-auto text-green-600" />
          <p className="mt-3 text-base font-medium text-slate-700">
            No active alerts for your area right now.
          </p>
          <p className="text-xs text-slate-500 mt-1">
            You'll see a warning here as soon as an authority issues one for
            {' '}
            {region?.district || 'your district'}.
          </p>
        </section>
      )}

      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((a) => {
            const id = a.alert_id || a._id;
            const isOpen = expanded[id];
            return (
              <article key={id} className="vn-panel overflow-hidden" style={{ borderLeft: '4px solid var(--vn-orange)' }}>
                <header className="p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <RiskBadge risk={a.severity} />
                        <span className="text-base font-semibold text-slate-800">
                          {a.title || `+${a.horizon_hours}h weather warning`}
                        </span>
                        {a.source === 'MANUAL' && (
                          <span className="text-[10px] uppercase tracking-widest text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded">
                            Officer issued
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1.5">
                        Issued {fmtDateTime(a.dispatched_at || a.created_at)}
                        {a.valid_until && ` · Valid until ${fmtDateTime(a.valid_until)}`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggle(id)}
                      className="text-xs font-medium text-blue-700 hover:underline inline-flex items-center gap-1"
                    >
                      {isOpen ? <>Hide <ChevronUp size={12} /></> : <>Details <ChevronDown size={12} /></>}
                    </button>
                  </div>
                </header>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-3 text-sm">
                    {a.description && (
                      <div>
                        <div className="vn-kpi-label mb-1">What is expected</div>
                        <p className="text-slate-700 leading-relaxed">{a.description}</p>
                      </div>
                    )}

                    {a.action_advice && (
                      <div>
                        <div className="vn-kpi-label mb-1">Recommended action</div>
                        <p className="text-slate-700 leading-relaxed">{a.action_advice}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                      <Meta label="Severity" value={a.severity} />
                      <Meta label="Horizon" value={a.horizon_hours ? `+${a.horizon_hours}h` : '—'} />
                      <Meta label="Region" value={a.region?.district || region?.district || '—'} />
                      <Meta label="Grid cell" value={a.grid_y != null ? `Y${a.grid_y} · X${a.grid_x}` : '—'} />
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                      <Phone size={13} />
                      <span>
                        Emergency <strong>112</strong> · Disaster Helpline <strong>1070</strong>
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed pt-2">
                      This alert was reviewed and issued by disaster management authorities.
                      Always follow official guidance and local advisories.
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <div className="vn-kpi-label">{label}</div>
      <div className="text-slate-800 font-medium mono">{value ?? '—'}</div>
    </div>
  );
}