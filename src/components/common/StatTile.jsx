export default function StatTile({
  label,
  value,
  hint,
  tone = 'default',
  icon: Icon,
}) {
  const toneClass = {
    default: 'text-slate-800',
    critical: 'text-red-600',
    warning: 'text-orange-600',
    watch: 'text-amber-600',
    normal: 'text-green-600',
    accent: 'text-blue-700',
  }[tone] || 'text-slate-800';

  return (
    <div className="vn-panel p-4">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
          {label}
        </span>
        {Icon && <Icon size={14} className="text-slate-400" />}
      </div>
      <div className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</div>
      {hint && (
        <div className="text-[11px] text-slate-500 mt-1">{hint}</div>
      )}
    </div>
  );
}