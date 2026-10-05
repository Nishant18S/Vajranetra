import { ShieldAlert } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-[900px] mx-auto px-5 py-8 space-y-5">
      <h1 className="text-xl font-semibold text-ink-hi">About VajraNetra</h1>

      <section className="panel p-6 space-y-3 text-sm text-ink-dim leading-relaxed">
        <p>
          VajraNetra is an AI-driven hyper-local early warning platform built to forecast
          thunderstorms, heavy rainfall, and flash floods at 2–6 hour horizons over a
          120 × 163 spatial grid.
        </p>
        <p>
          Predictions are produced by a spatiotemporal multimodal transformer trained
          on a multimodal dataset. Each inference emits a per-horizon probability map;
          the platform converts probability to spatial alerts using horizon-specific
          thresholds and records every forecast and alert in MongoDB.
        </p>
      </section>

      <section className="panel p-6 space-y-3">
        <h2 className="text-sm font-semibold text-ink-hi flex items-center gap-2">
          <ShieldAlert size={14} className="text-risk-warning" /> Research Prototype Notice
        </h2>
        <p className="text-sm text-ink-dim leading-relaxed">
          This model is a <strong className="text-ink">prototype / research system</strong>.
          Reported metrics indicate limited precision and recall across horizons.
          Forecast output must be treated as <strong className="text-ink">experimental</strong>
          and independently verified through operational meteorological sources before
          being used for decisions affecting people or property.
        </p>
      </section>

      <section className="panel p-6 space-y-3 text-sm text-ink-dim leading-relaxed">
        <h2 className="text-sm font-semibold text-ink-hi">Data source policy</h2>
        <p>
          When live ingestion is not available, the platform reports a data-source
          status of <span className="mono text-ink">unavailable</span>. It does not
          synthesise, interpolate, or randomise probability values under any circumstance.
        </p>
      </section>
    </div>
  );
}