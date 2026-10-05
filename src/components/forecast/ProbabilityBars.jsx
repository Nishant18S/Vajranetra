export default function ProbabilityBars({ forecasts = [], thresholdByHorizon = {} }) {
  if (!forecasts.length) return null;

  return (
    <div className="space-y-3">
      {forecasts.map((f) => {
        const hours = f.horizon_hours ?? f.hours;
        const prob = f.probability ?? f.max_probability ?? 0;
        const threshold = f.threshold ?? thresholdByHorizon[hours] ?? 0.5;
        const pct = Math.min(100, Math.max(0, prob * 100));
        const above = prob >= threshold;

        return (
          <div key={hours}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-700">+{hours}h</span>
              <span className="font-mono text-slate-700">
                {(prob * 100).toFixed(2)}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 relative overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  background: above ? '#ea580c' : '#22d3ee',
                }}
              />
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-slate-800/60"
                style={{ left: `${threshold * 100}%` }}
                title={`Threshold ${threshold}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}