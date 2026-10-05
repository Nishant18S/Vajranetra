import RiskBadge from '../common/RiskBadge';
import { fmtDateTime, fmtNumber } from '../../utils/formatters';

export default function AlertDetailPanel({ alert }) {
  if (!alert) return null;
  const a = alert;

  return (
    <div className="vn-panel p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <RiskBadge risk={a.severity || a.risk} />
          <span className="text-sm font-semibold text-slate-800">
            {a.title || `+${a.horizon_hours}h weather warning`}
          </span>
        </div>
        <span className="text-[11px] uppercase tracking-wider text-slate-500">
          {a.status}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        <Meta label="Horizon" value={a.horizon_hours != null ? `+${a.horizon_hours}h` : '—'} />
        <Meta label="Probability" value={fmtNumber(a.probability ?? a.max_probability, 4)} />
        <Meta label="Threshold" value={fmtNumber(a.threshold, 2)} />
        <Meta label="Alert cells" value={a.alert_cells ?? '—'} />
        <Meta label="Grid cell" value={a.grid_y != null ? `Y${a.grid_y} · X${a.grid_x}` : '—'} />
        <Meta label="Region" value={a.region?.district ? `${a.region.district}, ${a.region.state || ''}` : '—'} />
        <Meta label="Created" value={fmtDateTime(a.created_at)} />
        <Meta label="Valid until" value={fmtDateTime(a.valid_until)} />
      </div>

      {a.description && (
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">Description</div>
          <p className="text-sm text-slate-700 leading-relaxed">{a.description}</p>
        </div>
      )}
      {a.action_advice && (
        <div>
          <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">Action advice</div>
          <p className="text-sm text-slate-700 leading-relaxed">{a.action_advice}</p>
        </div>
      )}
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className="font-mono text-slate-800 mt-0.5">{String(value)}</div>
    </div>
  );
}