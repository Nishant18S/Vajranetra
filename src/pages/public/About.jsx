export default function About() {
  return (
    <div className="space-y-6">
      <section className="vn-panel p-6">
        <h1
          className="text-xl font-semibold"
          style={{ color: 'var(--vn-primary)' }}
        >
          About VajraNetra
        </h1>
        <p className="mt-2 text-sm text-slate-700 leading-relaxed">
          VajraNetra is an AI-driven early warning platform for thunderstorms,
          heavy rainfall, and flash floods. It uses a spatiotemporal transformer
          model trained on multimodal weather data to produce hyper-local
          probability forecasts at 2, 3, 4, 5, and 6 hour horizons.
        </p>
      </section>

      <section className="vn-panel p-6">
        <h2 className="text-base font-semibold text-slate-800">
          How the forecast is produced
        </h2>
        <ol className="mt-3 space-y-2 text-sm text-slate-700 list-decimal list-inside leading-relaxed">
          <li>The model scores every cell on a 120 × 163 grid.</li>
          <li>Cells above a horizon-specific threshold are flagged as alerts.</li>
          <li>A trained authority officer reviews each alert.</li>
          <li>Confirmed alerts are issued as public warnings.</li>
        </ol>
      </section>

      <section
        className="vn-panel p-6"
        style={{ borderLeft: '4px solid var(--vn-amber)' }}
      >
        <h2 className="text-base font-semibold text-slate-800">
          Important limitations
        </h2>
        <ul className="mt-3 space-y-1.5 text-sm text-slate-700 list-disc list-inside leading-relaxed">
          <li>
            This is a <strong>research prototype</strong> — not an official
            warning service.
          </li>
          <li>Predictions are experimental and must be independently verified.</li>
          <li>
            Always follow guidance from IMD, NDMA, and your district
            administration.
          </li>
          <li>The current model may miss events or over-warn in some regions.</li>
        </ul>
      </section>

      <section className="vn-panel p-6">
        <h2 className="text-base font-semibold text-slate-800">Contact</h2>
        <p className="text-sm text-slate-700 mt-2">
          For feedback or questions about this pilot, use the Contact page.
        </p>
      </section>
    </div>
  );
}