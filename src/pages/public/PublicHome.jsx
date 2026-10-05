import { Link } from 'react-router-dom';
import { CloudRain, Map as MapIcon, Bell, ShieldCheck, Phone } from 'lucide-react';

export default function PublicHome() {
  return (
    <div className="space-y-6">
      <section className="vn-panel p-8">
        <div className="text-xs font-semibold tracking-wider uppercase" style={{ color: 'var(--vn-saffron)' }}>
          AI-Driven Early Warning
        </div>
        <h1 className="mt-2 text-3xl md:text-4xl font-semibold" style={{ color: 'var(--vn-primary)' }}>
          Know the weather risk for your area — 2 to 6 hours ahead
        </h1>
        <p className="mt-3 text-slate-600 max-w-2xl leading-relaxed">
          VajraNetra uses a spatiotemporal AI model to predict thunderstorms,
          heavy rainfall, and flash flood risk at a hyper-local scale. Get
          early warnings for your district, village, or city.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/forecast" className="vn-btn vn-btn--primary">
            <CloudRain size={16} /> Check Forecast for My Area
          </Link>
          <Link to="/map" className="vn-btn vn-btn--outline">
            <MapIcon size={16} /> Open Risk Map
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Tile icon={CloudRain} title="Hyper-Local Forecast" text="Predictions at the 120x163 grid level — closer than most district-level forecasts." />
        <Tile icon={Bell} title="Alerts for Your Area" text="Officially issued warnings for your district, updated in near real-time." />
        <Tile icon={ShieldCheck} title="Reviewed by Authorities" text="Every public warning is reviewed and issued by designated disaster management officers." />
      </div>

      <section className="vn-panel p-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--vn-primary)' }}>How It Works</h2>
        <ol className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-slate-700">
          <Step n="1" title="AI detects risk" text="The model scores every grid cell for the next 2, 3, 4, 5, and 6 hours." />
          <Step n="2" title="Officer reviews" text="A trained officer examines the detection and cross-checks with ground data." />
          <Step n="3" title="Warning is issued" text="If confirmed, an alert is published here and via SMS to subscribers." />
          <Step n="4" title="Take precautions" text="Follow the guidance in the alert. Move to safety if required." />
        </ol>
      </section>

      <section className="vn-panel p-6" style={{ borderLeft: '4px solid var(--vn-red)' }}>
        <div className="flex items-start gap-3">
          <Phone size={20} style={{ color: 'var(--vn-red)' }} className="mt-0.5" />
          <div>
            <div className="font-semibold text-slate-800">In an emergency</div>
            <p className="text-sm text-slate-600 mt-1">
              Call <strong>112</strong> for immediate help. For disaster-related information call the National Disaster Helpline <strong>1070</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Tile({ icon: Icon, title, text }) {
  return (
    <div className="vn-panel p-5">
      <div className="w-9 h-9 rounded flex items-center justify-center mb-3" style={{ background: 'var(--vn-primary-soft)', color: 'var(--vn-primary)' }}>
        <Icon size={16} />
      </div>
      <div className="font-semibold text-slate-800">{title}</div>
      <p className="text-sm text-slate-600 mt-1 leading-relaxed">{text}</p>
    </div>
  );
}

function Step({ n, title, text }) {
  return (
    <li className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'var(--vn-primary)', color: '#fff' }}>{n}</div>
      <div>
        <div className="font-semibold text-slate-800">{title}</div>
        <p className="text-slate-600 mt-1 leading-relaxed">{text}</p>
      </div>
    </li>
  );
}
