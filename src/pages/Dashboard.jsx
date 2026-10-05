import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useMyAlerts } from '../hooks/useMyAlerts';
import {
  Bell,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  CloudRain,
  Map,
  User,
  ArrowRight,
  PhoneCall,
  Wind,
  Droplets,
  Eye,
  CheckCircle2,
  Navigation,
  Radio,
  LifeBuoy,
  FileText,
  AlertOctagon,
} from 'lucide-react';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const { alerts, loading } = useMyAlerts();

  const activeAlerts = alerts || [];
  const criticalCount = activeAlerts.filter((a) => a.severity === 'CRITICAL').length;
  const highCount = activeAlerts.filter((a) => a.severity === 'HIGH').length;
  const mediumCount = activeAlerts.filter((a) => a.severity === 'MEDIUM').length;

  return (
    <div className="space-y-6 font-sans pb-10">
      
      {/* ── Emergency Action Bar ── */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-amber-600 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-xl animate-pulse">
            <AlertOctagon size={22} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold tracking-wide">Emergency Assistance Hotline</h2>
            <p className="text-xs text-red-100">Direct connection to State Disaster Management Authority</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <a
            href="tel:108"
            className="flex-1 sm:flex-initial text-center bg-white text-red-600 hover:bg-red-50 font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            <PhoneCall size={14} />
            <span>Call 108 Emergency</span>
          </a>
          <Link
            to="/shelters"
            className="flex-1 sm:flex-initial text-center bg-red-800/60 hover:bg-red-800 text-white font-semibold px-4 py-2 rounded-xl text-xs backdrop-blur-md transition-colors flex items-center justify-center gap-1.5 border border-white/20"
          >
            <Navigation size={14} />
            <span>Find Shelters</span>
          </Link>
        </div>
      </div>

      {/* ── Welcome Banner & Live Weather Overview ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Citizen Info Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                <Radio size={12} className="animate-pulse text-blue-600" />
                Live Citizen Monitoring Portal
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Last updated: Just now</span>
            </div>

            <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-4">
              Welcome back, {user?.name || 'Citizen'}!
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Signed in as <span className="text-slate-800 font-semibold">{user?.email}</span>
            </p>

            <div className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
              <MapPin size={15} className="text-blue-600" />
              <span>Assigned District: <strong className="text-slate-900">{user?.district || 'Khordha'}</strong>, {user?.state || 'Odisha'}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-600" />
              <span className="text-xs font-bold text-slate-700">System Status: Active Monitoring</span>
            </div>
            <Link to="/profile" className="text-xs font-bold text-blue-600 hover:underline">
              Edit Location & Preferences →
            </Link>
          </div>
        </div>

        {/* Live Weather Card */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <CloudRain size={160} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Atmosphere</span>
              <span className="text-xs font-semibold bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Safe Conditions
              </span>
            </div>

            <div className="flex items-baseline gap-3 mt-4">
              <span className="text-4xl font-black tracking-tight">29°C</span>
              <span className="text-sm text-slate-300 font-medium">Partly Cloudy</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Expect intermittent light showers towards evening.</p>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-white/10 text-center">
            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              <Droplets size={16} className="mx-auto text-blue-400 mb-1" />
              <span className="block text-[10px] text-slate-400">Humidity</span>
              <span className="text-xs font-bold text-slate-200">78%</span>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              <Wind size={16} className="mx-auto text-cyan-400 mb-1" />
              <span className="block text-[10px] text-slate-400">Wind</span>
              <span className="text-xs font-bold text-slate-200">14 km/h</span>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              <Eye size={16} className="mx-auto text-indigo-400 mb-1" />
              <span className="block text-[10px] text-slate-400">Visibility</span>
              <span className="text-xs font-bold text-slate-200">8.5 km</span>
            </div>
          </div>
        </div>

      </div>

      {/* ── KPI Alert Overview Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        
        {/* Total Active Alerts */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Alerts
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {activeAlerts.length}
            </div>
            <span className="text-[10px] text-slate-500">In {user?.district || 'Khordha'}</span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Bell size={20} />
          </div>
        </div>

        {/* Critical Risk */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Critical Risk
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {criticalCount}
            </div>
            <span className="text-[10px] text-slate-500">Immediate action required</span>
          </div>
          <div className="p-3 rounded-xl bg-red-50 text-red-600 border border-red-100">
            <AlertTriangle size={20} />
          </div>
        </div>

        {/* High Risk */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              High Risk
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {highCount}
            </div>
            <span className="text-[10px] text-slate-500">Severe advisory events</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
            <AlertTriangle size={20} />
          </div>
        </div>

        {/* Medium Risk */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Watch Advisory
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {mediumCount}
            </div>
            <span className="text-[10px] text-slate-500">Precautionary warnings</span>
          </div>
          <div className="p-3 rounded-xl bg-yellow-50 text-yellow-600 border border-yellow-100">
            <ShieldCheck size={20} />
          </div>
        </div>

      </div>

      {/* ── Main Content Grid: Alerts Feed + Emergency Preparedness ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Active Alerts Feed */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">District Warning & Advisory Feed</h3>
                <p className="text-[11px] text-slate-400">Live bulletins issued by meteorology & disaster response</p>
              </div>
              <Link
                to="/alerts"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 transition-colors"
              >
                <span>View historical alerts</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="text-center py-10 space-y-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">Fetching latest alerts...</p>
                </div>
              ) : activeAlerts.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
                    <ShieldCheck size={28} />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    No active emergency alerts for {user?.district || 'Khordha'}.
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                    Your area is currently under green status. We will push instant SMS and app advisories if conditions change.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                            alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            alert.severity === 'HIGH' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {alert.severity}
                          </span>
                          <span className="text-[11px] text-slate-400">Issued 10 mins ago</span>
                        </div>
                        <h5 className="font-bold text-slate-900 text-sm">{alert.title}</h5>
                        <p className="text-xs text-slate-600">{alert.description}</p>
                      </div>

                      <Link
                        to={`/alerts/${alert.id}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 whitespace-nowrap self-end sm:self-center"
                      >
                        Read Guidelines →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Automated Broadcast Priority: Level 1</span>
            <span className="font-semibold text-slate-700">ODSMA Verified</span>
          </div>
        </div>

        {/* Right Column: Disaster Preparedness Checklist */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span>Preparedness Checklist</span>
              </h3>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                75% Ready
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Ensure your household has these essential items prepped in case of extreme weather advisories.
            </p>

            <div className="space-y-2.5 text-xs font-medium">
              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100">
                <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                <span className="line-through text-slate-400">Emergency Kit & First Aid</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100">
                <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                <span className="line-through text-slate-400">72-Hour Water & Dry Food</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100">
                <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                <span className="line-through text-slate-400">Powerbank & Radio Flashlight</span>
              </label>

              <label className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 border border-slate-100 cursor-pointer hover:bg-slate-100">
                <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                <span className="text-slate-700">Important Documents Sealed Waterproof</span>
              </label>
            </div>

            <Link
              to="/guide"
              className="block text-center text-xs font-bold text-blue-600 hover:text-blue-800 pt-2 border-t border-slate-100"
            >
              View Full Preparedness Guide →
            </Link>
          </div>

          {/* Quick Helpline Numbers */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <LifeBuoy size={14} className="text-red-400" />
              <span>District Hotlines</span>
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="block text-[10px] text-slate-400">Police Department</span>
                <span className="font-mono font-bold text-amber-300">112 / 100</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="block text-[10px] text-slate-400">Fire & Rescue</span>
                <span className="font-mono font-bold text-amber-300">101</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="block text-[10px] text-slate-400">Ambulance</span>
                <span className="font-mono font-bold text-amber-300">108</span>
              </div>
              <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                <span className="block text-[10px] text-slate-400">Disaster Helpline</span>
                <span className="font-mono font-bold text-amber-300">1070</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* ── Bottom Quick Action Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <Link
          to="/forecast"
          className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
            <CloudRain size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
              Check Forecast
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Hyper-local rain & storm predictions
            </p>
          </div>
        </Link>

        <Link
          to="/map"
          className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
            <Map size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
              Risk Assessment Map
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Interactive radar & cyclone tracking
            </p>
          </div>
        </Link>

        <Link
          to="/shelters"
          className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
            <Navigation size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
              Nearby Shelters
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Locate active safe havens & routes
            </p>
          </div>
        </Link>

        <Link
          to="/profile"
          className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
            <User size={20} />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
              Alert Preferences
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage SMS & push triggers
            </p>
          </div>
        </Link>

      </div>

    </div>
  );
}