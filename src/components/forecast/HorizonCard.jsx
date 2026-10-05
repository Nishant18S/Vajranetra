import RiskBadge from '../common/RiskBadge';
import { fmtNumber } from '../../utils/formatters';

export default function HorizonCard({ h }) {
  const hours = h.horizon_hours ?? h.hours;
  const prob = h.probability ?? h.max_probability;

  return (
    <div className="vn-panel p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-2xl text-slate-800">+{hours}</span>
          <span className="text-[11px] uppercase tracking-wider text-slate-500">
            hrs
          </span>
        </div>
        <RiskBadge risk={h.risk} />
      </div>

      <div className="grid grid-cols-2 gap-y-2 text-xs">
        <Field label="Max prob" value={fmtNumber(prob, 4)} />
        <Field label="Threshold" value={fmtNumber(h.threshold, 2)} />
        <Field label="Alert cells" value={h.alert_cells ?? '—'} />
        <Field label="Risk" value={h.risk || '—'} />
      </div>

      <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span className="uppercase tracking-wider">Peak cell</span>
        <span className="font-mono text-slate-700">
          Y {h.grid_y ?? '—'} · X {h.grid_x ?? '—'}
        </span>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <>
      <span className="text-[11px] uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <span className="font-mono text-slate-800 text-right">{value}</span>
    </>
  );
}