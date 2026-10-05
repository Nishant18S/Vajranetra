import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CloudRain,
  Map as MapIcon,
  UserCircle2,
  AlertTriangle,
  CheckCircle2,
  Satellite,
  Compass,
  PhoneCall,
  Wind,
  Droplets,
  Eye,
  ShieldCheck,
  LifeBuoy,
  ArrowRight,
  Radio,
  AlertOctagon
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useMyAlerts } from '../../hooks/useMyAlerts';
import RiskBadge from '../../components/common/RiskBadge';
import { fmtDateTime } from '../../utils/formatters';

// OpenWeather Configuration (reads from .env or uses default fallback)
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '2746329ec842b85e524afdd07b1e3bac';
const OPENWEATHER_BASE_URL = import.meta.env.VITE_OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const { alerts, region, loading } = useMyAlerts();

  // OpenWeather Satellite / Station Telemetry State
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const highCount = alerts.filter((a) => a.severity === 'HIGH').length;

  // Fetch real-time weather telemetry for user district on mount
  useEffect(() => {
    const district = user?.district || 'Bhubaneswar';
    fetchWeatherTelemetry(district);
  }, [user?.district]);

  const fetchWeatherTelemetry = async (location) => {
    setWeatherLoading(true);
    try {
      const geoRes = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${OPENWEATHER_API_KEY}`
      );
      const geoData = await geoRes.json();

      if (geoData && geoData.length > 0) {
        const { lat, lon, name, state, country } = geoData[0];
        const res = await fetch(
          `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`
        );
        const data = await res.json();
        setWeatherData({
          ...data,
          displayName: `${name}${state ? `, ${state}` : ''}, ${country}`
        });
      }
    } catch {
      // Fallback silent load
    } finally {
      setWeatherLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans pb-10">

      {/* ── Emergency Priority Banner ── */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-amber-600 text-white rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl animate-pulse">
            <AlertOctagon size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide">Emergency Assistance Hotline</h2>
            <p className="text-xs text-red-100">Direct connection to State Disaster Management Operations</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <a
            href="tel:108"
            className="flex-1 sm:flex-initial text-center bg-white text-red-600 hover:bg-red-50 font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
          >
            <PhoneCall size={14} />
            <span>Call 108 Emergency</span>
          </a>
          <a
            href="tel:1070"
            className="flex-1 sm:flex-initial text-center bg-red-800/60 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded-xl text-xs backdrop-blur-md transition-colors flex items-center justify-center gap-1.5 border border-white/20"
          >
            <LifeBuoy size={14} />
            <span>Disaster 1070</span>
          </a>
        </div>
      </div>

      {/* ── Main Top Grid: Welcome + Satellite Weather ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Welcome Section */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                <Radio size={12} className="animate-pulse text-blue-600" />
                Live Citizen Portal
              </span>
              <span className="text-[11px] text-slate-400 font-medium">System Online</span>
            </div>

            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-4">
              Welcome, {user?.name || 'Citizen'}
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Signed in as <span className="font-semibold text-slate-800">{user?.email}</span>
            </p>

            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
              <MapIcon size={14} className="text-blue-600" />
              <span>
                Monitored District:{' '}
                <strong className="text-slate-900 font-bold">
                  {user?.district ? `${user.district}, ${user.state}` : 'Not set'}
                </strong>
              </span>
              {!user?.district && (
                <Link to="/profile" className="text-blue-700 font-bold hover:underline ml-2">
                  Set location →
                </Link>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <ShieldCheck size={18} className="text-emerald-600" />
              <span>Active Radar Monitoring</span>
            </div>
            <Link to="/profile" className="text-xs font-bold text-blue-600 hover:underline">
              Preferences →
            </Link>
          </div>
        </div>

        {/* Live Satellite Weather Telemetry Panel */}
        <div className="lg:col-span-5 bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-6 -right-6 p-6 opacity-10 pointer-events-none">
            <Satellite size={140} />
          </div>

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Satellite size={14} className="text-blue-400" />
                <span>Satellite Telemetry</span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Live Feed
              </span>
            </div>

            {weatherLoading ? (
              <p className="text-xs text-slate-400">Syncing satellite telemetry...</p>
            ) : weatherData ? (
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                    alt={weatherData.weather[0].description}
                    className="w-14 h-14 -my-2"
                  />
                  <div>
                    <div className="text-3xl font-black">{Math.round(weatherData.main.temp)}°C</div>
                    <p className="text-xs text-slate-300 capitalize font-medium">
                      {weatherData.weather[0].description}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Station: {weatherData.displayName}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">Weather radar data available in Risk Map.</p>
            )}
          </div>

          {weatherData && (
            <div className="relative z-10 grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/10 text-center">
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <Droplets size={15} className="mx-auto text-blue-400 mb-1" />
                <span className="block text-[10px] text-slate-400">Humidity</span>
                <span className="text-xs font-bold text-slate-200">{weatherData.main.humidity}%</span>
              </div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <Wind size={15} className="mx-auto text-cyan-400 mb-1" />
                <span className="block text-[10px] text-slate-400">Wind</span>
                <span className="text-xs font-bold text-slate-200">{weatherData.wind.speed} m/s</span>
              </div>
              <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                <Eye size={15} className="mx-auto text-emerald-400 mb-1" />
                <span className="block text-[10px] text-slate-400">Visibility</span>
                <span className="text-xs font-bold text-slate-200">{(weatherData.visibility / 1000).toFixed(1)} km</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── Alert Summary Tiles ── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Tile
          icon={Bell}
          label="Active Alerts"
          value={alerts.length}
          tone={alerts.length ? 'red' : 'green'}
          hint={region?.district ? `for ${region.district}` : 'for your region'}
        />
        <Tile
          icon={AlertTriangle}
          label="Critical Risk"
          value={criticalCount}
          tone={criticalCount ? 'red' : 'neutral'}
          hint="Immediate action required"
        />
        <Tile
          icon={AlertTriangle}
          label="High Risk"
          value={highCount}
          tone={highCount ? 'orange' : 'neutral'}
          hint="Monitored atmospheric events"
        />
      </section>

      {/* ── Active Alerts Feed & Citizen Preparedness Checklist ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Alerts List */}
        <section className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900 text-sm">Your Active Alerts</h2>
                <p className="text-[11px] text-slate-400">Official bulletins issued for your district</p>
              </div>
              <Link
                to="/alerts"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="p-6">
              {loading && (
                <div className="text-center py-8 text-xs text-slate-500">Loading active alerts...</div>
              )}

              {!loading && alerts.length === 0 && (
                <div className="text-center py-8 space-y-3">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">No active alerts for your area.</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      Your area is currently under normal weather status. Notifications will trigger automatically if severe conditions develop.
                    </p>
                  </div>
                </div>
              )}

              {!loading && alerts.length > 0 && (
                <ul className="divide-y divide-slate-100">
                  {alerts.slice(0, 5).map((a) => (
                    <li key={a.alert_id} className="py-3.5 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <RiskBadge risk={a.severity} />
                            <span className="text-sm font-bold text-slate-900">
                              {a.title || `+${a.horizon_hours}h weather warning`}
                            </span>
                          </div>

                          {a.description && (
                            <p className="text-xs text-slate-600 leading-relaxed">
                              {a.description}
                            </p>
                          )}

                          <div className="text-[11px] text-slate-400">
                            Issued {fmtDateTime(a.dispatched_at || a.created_at)}
                            {a.valid_until && ` · Valid until ${fmtDateTime(a.valid_until)}`}
                          </div>
                        </div>

                        <Link
                          to="/alerts"
                          className="text-xs font-bold text-blue-600 hover:text-blue-800 whitespace-nowrap self-end sm:self-center"
                        >
                          Details →
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
            <span>Automated Satellite Broadcast Priority: Level 1</span>
            <span className="font-bold text-slate-700">ODSMA Verified</span>
          </div>
        </section>

        {/* Citizen Preparedness Panel */}
        <section className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                <span>Emergency Readiness</span>
              </h3>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                75% Ready
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-medium">
              <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100">
                <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                <span className="line-through text-slate-400">Emergency Kit & First Aid</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100">
                <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                <span className="line-through text-slate-400">72-Hour Dry Food & Water</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                <span className="text-slate-700">Powerbanks & Flashlight Charged</span>
              </label>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <LifeBuoy size={14} className="text-red-400" />
              <span>District Hotlines</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="block text-[10px] text-slate-400">Police</span>
                <span className="font-mono font-bold text-amber-300">112</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="block text-[10px] text-slate-400">Disaster SEOC</span>
                <span className="font-mono font-bold text-amber-300">1070</span>
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* ── Quick Action Cards ── */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Quick
          to="/forecast"
          icon={CloudRain}
          title="Check Forecast"
          text="Hyper-local 6-hour precipitation predictions."
        />
        <Quick
          to="/map"
          icon={MapIcon}
          title="Risk Map & Radar"
          text="Interactive spatial radar overlays & weather telemetry."
        />
        <Quick
          to="/profile"
          icon={UserCircle2}
          title="Profile & Preferences"
          text="Update district location and SMS/email triggers."
        />
      </section>

    </div>
  );
}

function Tile({ icon: Icon, label, value, tone = 'neutral', hint }) {
  const colors = {
    red: { bg: '#fee2e2', color: '#b91c1c' },
    orange: { bg: '#ffedd5', color: '#c2410c' },
    green: { bg: '#dcfce7', color: '#15803d' },
    neutral: { bg: '#f1f5f9', color: '#475569' },
  }[tone];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
        <div className="text-2xl font-black mt-1" style={{ color: colors.color }}>
          {value}
        </div>
        {hint && <div className="text-[10px] text-slate-500 mt-0.5">{hint}</div>}
      </div>

      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: colors.bg, color: colors.color }}
      >
        <Icon size={18} />
      </div>
    </div>
  );
}

function Quick({ to, icon: Icon, title, text }) {
  return (
    <Link
      to={to}
      className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-4"
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors group-hover:bg-blue-600 group-hover:text-white"
        style={{
          background: 'var(--vn-primary-soft, #eff6ff)',
          color: 'var(--vn-primary, #2563eb)',
        }}
      >
        <Icon size={18} />
      </div>
      <div>
        <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{title}</h3>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{text}</p>
      </div>
    </Link>
  );
}