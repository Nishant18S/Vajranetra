import { useState, useEffect } from 'react';
import { 
  Search, 
  CloudRain, 
  AlertTriangle, 
  Clock, 
  Zap, 
  ShieldAlert, 
  Thermometer, 
  RefreshCw, 
  MapPin, 
  CheckCircle2,
  Info
} from 'lucide-react';
import { forecastService } from '../../services/forecastService';
import RiskBadge from '../../components/common/RiskBadge';
import { fmtNumber } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

const PLAIN_RISK = {
  LOW: { 
    label: 'Low', 
    text: 'Conditions are normal and safe for outdoor activities over the next few hours.', 
    tone: 'green',
    action: 'No immediate action required. Continue checking routine advisories.'
  },
  MODERATE: { 
    label: 'Moderate', 
    text: 'Light to moderate rainfall expected. Stay alert if planning extended travel.', 
    tone: 'amber',
    action: 'Keep an umbrella handy and stay aware of changing cloud conditions.'
  },
  HIGH: { 
    label: 'High', 
    text: 'Heavy precipitation risk detected. Exercise caution in low-lying zones.', 
    tone: 'orange',
    action: 'Secure loose outdoor items and avoid waterlogged roads or drainage channels.'
  },
  CRITICAL: { 
    label: 'Critical', 
    text: 'Severe atmospheric event imminent. Official advisory level: RED ALERT.', 
    tone: 'red',
    action: 'Remain indoors, charge electronic devices, and follow IMD & ODSMA directives.'
  },
};

const TONE = { 
  green: '#10b981', 
  amber: '#f59e0b', 
  orange: '#f97316', 
  red: '#ef4444' 
};

export default function CitizenForecast() {
  const { user } = useAuth();
  const [input, setInput] = useState('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // Fetch initial forecast on component mount
  useEffect(() => {
    fetchForecast(0);
  }, []);

  const fetchForecast = async (sampleId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await forecastService.bySample(Number(sampleId));
      setResult(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const submit = (e) => {
    e.preventDefault();
    fetchForecast(input);
  };

  const plain = result?.highest_risk ? PLAIN_RISK[result.highest_risk] || PLAIN_RISK.LOW : null;

  return (
    <div className="space-y-6 font-sans pb-10">
      
      {/* ── Search & Location Header ── */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
              <Zap size={13} className="text-blue-600" />
              VajraNetra Atmospheric AI Engine
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-2">
              Hyper-Local Weather Risk Forecast
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {user?.district
                ? `Assigned Monitoring Station: ${user.district}, ${user.state || 'Odisha'}`
                : 'Enter your sample or area code to predict 2-6 hour storm intensity.'}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs text-slate-600">
            <MapPin size={16} className="text-blue-600 shrink-0" />
            <span>Region: <strong className="text-slate-800">{user?.district || 'Khordha Central'}</strong></span>
          </div>
        </div>

        {/* Forecast Search Form */}
        <form onSubmit={submit} className="mt-5 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[240px]">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Area / Sample Grid Index
            </label>
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter sample ID (e.g., 0, 12, 45)"
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-4 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>Predicting...</span>
              </>
            ) : (
              <>
                <Zap size={15} />
                <span>Check Forecast</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Area Samples */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <span className="font-medium">Quick Grids:</span>
          {[0, 101, 205, 309].map((sampleId) => (
            <button
              key={sampleId}
              type="button"
              onClick={() => { setInput(String(sampleId)); fetchForecast(sampleId); }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
            >
              Grid #{sampleId}
            </button>
          ))}
        </div>
      </section>

      {/* ── Error Banner ── */}
      {error && (
        <section className="bg-red-50 rounded-2xl border border-red-200 p-5 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-red-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-900 text-sm">Unable to Retrieve Radar Predictions</h3>
              <p className="text-xs text-red-700 mt-1">{error.message || 'Server connection timeout. Please try again.'}</p>
            </div>
          </div>
        </section>
      )}

      {/* ── Forecast Results ── */}
      {result && plain && (
        <>
          {/* Overall Risk Banner */}
          <section
            className="bg-white rounded-2xl border p-6 shadow-xs relative overflow-hidden"
            style={{ borderColor: TONE[plain.tone], borderLeftWidth: '6px' }}
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Clock size={13} />
                  <span>2 to 6 Hour Risk Window</span>
                </span>
                <div className="text-3xl font-black tracking-tight" style={{ color: TONE[plain.tone] }}>
                  {plain.label} Risk Level
                </div>
                <p className="text-sm font-medium text-slate-700 max-w-2xl mt-1">
                  {plain.text}
                </p>
              </div>

              <div
                className="p-4 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${TONE[plain.tone]}15` }}
              >
                <CloudRain size={52} style={{ color: TONE[plain.tone] }} />
              </div>
            </div>

            {/* Recommended Safety Directive */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-start gap-3">
              <ShieldAlert size={18} className="text-slate-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-slate-900 font-bold">Recommended Citizen Action: </strong>
                <span className="text-slate-600">{plain.action}</span>
              </div>
            </div>
          </section>

          {/* Hourly Forecast Grid */}
          <section className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Hourly Risk Progression</h3>
                <p className="text-[11px] text-slate-400">Precipitation probability across time horizons</p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                Model: Radar-CNN v2.1
              </span>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {(result.forecasts || []).map((h) => {
                const probValue = Number(h.probability ?? h.max_probability ?? 0);
                const probPercentage = Math.round(probValue * 100);

                return (
                  <div
                    key={h.horizon_hours}
                    className="rounded-xl border border-slate-200/80 p-4 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                        <span className="text-xl font-black text-slate-900">+{h.horizon_hours}h</span>
                        <RiskBadge risk={h.risk} />
                      </div>

                      {/* Probability Bar */}
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                          <span>Rain Prob</span>
                          <span className="font-mono text-slate-900">{probPercentage}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(probPercentage, 100)}%`,
                              backgroundColor: probPercentage > 60 ? '#ef4444' : probPercentage > 30 ? '#f59e0b' : '#3b82f6'
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs pt-2 border-t border-slate-200/60">
                      <Row label="Raw Prob" value={fmtNumber(probValue, 4)} />
                      <Row label="Threshold" value={fmtNumber(h.threshold, 2)} />
                      <Row label="Alert Cells" value={h.alert_cells ?? '0'} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Model Disclaimer & Authority Notice */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex items-start gap-3 text-xs text-slate-500">
            <Info size={18} className="text-slate-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Official Disclaimer:</strong> Weather predictions are powered by the VajraNetra AI early-warning model.
              While high-precision satellite radar is used, localized cloudbursts can vary. Always prioritize official warnings broadcasted by IMD and state disaster management authority (ODSMA).
            </p>
          </div>
        </>
      )}

    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between text-[11px]">
      <span className="text-slate-500">{label}</span>
      <span className="font-mono font-bold text-slate-800">{String(value ?? '—')}</span>
    </div>
  );
}