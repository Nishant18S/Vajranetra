const tone = {
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  accent: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  normal: 'bg-green-50 text-green-700 border-green-200',
  watch: 'bg-amber-50 text-amber-700 border-amber-200',
  warning: 'bg-orange-50 text-orange-700 border-orange-200',
  critical: 'bg-red-50 text-red-700 border-red-200',
};

export default function Badge({ tone: t = 'neutral', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-medium uppercase tracking-wider ${tone[t] || tone.neutral} ${className}`}
    >
      {children}
    </span>
  );
}