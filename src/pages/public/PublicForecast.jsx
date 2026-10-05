import { useState } from 'react';
import { Search, CloudRain, AlertTriangle } from 'lucide-react';
import { forecastService } from '../../services/forecastService';
import RiskBadge from '../../components/common/RiskBadge';
import { fmtNumber } from '../../utils/formatters';

const PLAIN_RISK = {
  LOW:      { label: 'Low',      text: 'Conditions are normal for the next few hours.',            tone: 'green'  },
  MODERATE: { label: 'Moderate', text: 'Keep an eye on the sky. Stay indoors if it worsens.',      tone: 'amber'  },
  HIGH:     { label: 'High',     text: 'Take precautions. Avoid low-lying areas.',                 tone: 'orange' },
  CRITICAL: { label: 'Critical', text: 'Serious weather is expected. Follow any official warnings.', tone: 'red'  },
};
const TONE_COLOR = { green: 'var(--vn-green)', amber: 'var(--vn-amber)', orange: 'var(--vn-orange)', red: 'var(--vn-red)' };

export default function PublicForecast() {
  const [input, setInput] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(null); setResult(null);
    try { setResult(await forecastService.bySample(Number(input))); }
    catch (err) { setError(err); }
    finally { setLoading(false); }
  };

  const plain = result?.highest_risk ? PLAIN_RISK[result.highest_risk] || PLAIN_RISK.LOW : null;

  return (
    <div className="space-y-6">
      <section className="vn-panel p-6">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--vn-primary)' }}>Check Weather Risk for Your Area</h1>
        <p className="text-sm text-slate-600 mt-1">Enter your area code (pilot) or type a location name. We will show you the forecast for the next 2 to 6 hours.</p>
        <form onSubmit={submit} className="mt-5 flex flex-wrap gap-3 items-end">
          <label className="block">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Area / Sample Index</span>
            <div className="relative mt-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. 0"
                className="w-64 rounded border border-slate-300 bg-white pl-8 pr-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
              />
            </div>
          </label>
          <button type="submit" className="vn-btn vn-btn--primary" disabled={loading}>
            {loading ? 'Checking…' : 'Check Forecast'}
          </button>
        </form>
        <p className="text-xs text-slate-500 mt-3">Note: this prototype maps to a fixed set of model samples. A full location lookup will be added in the next release.</p>
      </section>

      {error && (
        <section className="vn-panel p-5" style={{ borderLeft: '4px solid var(--vn-red)' }}>
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} style={{ color: 'var(--vn-red)' }} />
            <div>
              <div className="font-semibold text-slate-800">Could not fetch forecast</div>
              <p className="text-sm text-slate-600 mt-1">{error.message || 'Please try again in a moment.'}</p>
            </div>
          </div>
        </section>
      )}

      {result && (
        <>
          {plain && (
            <section className="vn-panel p-6" style={{ borderLeft: `4px solid ${TONE_COLOR[plain.tone]}` }}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Overall risk for next 2-6 hours</div>
                  <div className="text-2xl font-bold mt-1" style={{ color: TONE_COLOR[plain.tone] }}>{plain.label} Risk</div>
                  <p className="text-sm text-slate-600 mt-1">{plain.text}</p>
                </div>
                <CloudRain size={48} style={{ color: TONE_COLOR[plain.tone], opacity: 0.25 }} />
              </div>
            </section>
          )}

          <section className="vn-panel">
            <div className="vn-panel__hd"><div className="vn-panel__title">Forecast by horizon</div></div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-5 gap-3">
              {(result.forecasts || []).map((h) => (
                <div key={h.horizon_hours} className="rounded border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-semibold" style={{ color: 'var(--vn-primary)' }}>+{h.horizon_hours}h</div>
                    <RiskBadge risk={h.risk} />
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs">
                    <Row label="Probability" value={fmtNumber(h.probability ?? h.max_probability, 4)} />
                    <Row label="Threshold" value={fmtNumber(h.threshold, 2)} />
                    <Row label="Alert cells" value={h.alert_cells} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <p className="text-xs text-slate-500">Predictions come from the VajraNetra model and are experimental. Always follow official warnings from IMD and your district administration.</p>
        </>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800 vn-mono">{String(value ?? '—')}</span>
    </div>
  );
}
