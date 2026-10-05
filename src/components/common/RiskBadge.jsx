const TONE = {
  LOW:      { bg: '#dcfce7', fg: '#15803d' },
  MODERATE: { bg: '#fef3c7', fg: '#b45309' },
  HIGH:     { bg: '#ffedd5', fg: '#c2410c' },
  CRITICAL: { bg: '#fee2e2', fg: '#b91c1c' },
  NORMAL:   { bg: '#dcfce7', fg: '#15803d' },
  WATCH:    { bg: '#fef3c7', fg: '#b45309' },
  WARNING:  { bg: '#ffedd5', fg: '#c2410c' },
};

export default function RiskBadge({ risk }) {
  const key = (risk || '').toUpperCase();
  const tone = TONE[key] || { bg: '#e2e8f0', fg: '#475569' };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider"
      style={{ background: tone.bg, color: tone.fg }}
    >
      <span
        className="inline-block rounded-full"
        style={{ width: 6, height: 6, background: tone.fg }}
      />
      {key || 'UNKNOWN'}
    </span>
  );
}