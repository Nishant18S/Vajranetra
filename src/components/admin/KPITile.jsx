export default function KPITile({ label, value, hint, tone = 'default', icon: Icon }) {
  const toneColor = {
    default:  'var(--a-text)',
    critical: 'var(--a-red)',
    warning:  'var(--a-orange)',
    watch:    'var(--a-amber)',
    normal:   'var(--a-green)',
    accent:   'var(--a-accent)',
  }[tone] || 'var(--a-text)';

  return (
    <div className="vn-adm-panel p-4">
      <div className="flex items-center justify-between">
        <span className="kpi-label">{label}</span>
        {Icon && <Icon size={13} style={{ color: 'var(--a-text-faint)' }} />}
      </div>
      <div className="kpi-value mt-2" style={{ color: toneColor }}>
        {value}
      </div>
      {hint && (
        <div className="text-[10px] mt-1" style={{ color: 'var(--a-text-faint)' }}>
          {hint}
        </div>
      )}
    </div>
  );
}