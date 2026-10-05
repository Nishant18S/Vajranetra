import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { fmtRelative } from '../../utils/formatters';

export default function FreshnessIndicator({
  updatedAt,
  intervalMs,
  onRefresh,
  refreshing,
}) {
  const [, force] = useState(0);

  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 15000);
    return () => clearInterval(t);
  }, []);

  const ageMs = updatedAt
    ? Date.now() - new Date(updatedAt).getTime()
    : Infinity;

  const dotClass = !updatedAt
    ? 'bg-red-500'
    : ageMs < 60000
    ? 'bg-green-500 animate-pulse'
    : ageMs < 180000
    ? 'bg-amber-500'
    : 'bg-red-500';

  const next =
    updatedAt && intervalMs
      ? Math.max(0, Math.round((intervalMs - ageMs) / 1000))
      : null;

  return (
    <div className="inline-flex items-center gap-2 text-[11px] text-slate-500">
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      <span>
        Updated{' '}
        <span className="font-mono text-slate-700">
          {fmtRelative(updatedAt)}
        </span>
      </span>
      {next != null && (
        <span className="text-slate-400">
          · next in <span className="font-mono">{next}s</span>
        </span>
      )}
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="ml-1 p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-blue-700"
          aria-label="Refresh now"
        >
          <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
        </button>
      )}
    </div>
  );
}