import { Link } from 'react-router-dom';
import {
  Satellite,
  Cpu,
  ShieldCheck,
  Radio,
  AlertTriangle,
  Zap,
  Globe,
  Layers,
  ArrowRight,
  Database,
  CheckCircle2,
  HelpCircle,
  Activity,
  Compass
} from 'lucide-react';

export default function PublicAbout() {
  return (
    <div className="space-y-8 font-sans pb-12">

      {/* ── 1. Hero Overview Banner ── */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Satellite size={260} />
        </div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 backdrop-blur-md">
            <Radio size={13} className="text-blue-400 animate-pulse" />
            <span>Ministry of Earth Sciences Pilot Project</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Next-Generation Hyper-Local Weather Risk Intelligence
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium">
            <strong>VajraNetra</strong> is an advanced AI-driven early warning ecosystem designed for rapid detection of severe atmospheric events, cloudbursts, and flash floods. By fusing ISRO INSAT-3D satellite telemetry with Ground Radar CNN models, VajraNetra predicts risk probabilities at 2, 3, 4, 5, and 6-hour horizons.
          </p>

          <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-slate-200">
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <Globe size={14} className="text-blue-400" />
              120 × 163 Spatial Grid
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <Cpu size={14} className="text-emerald-400" />
              Spatiotemporal Transformer v2
            </span>
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <ShieldCheck size={14} className="text-amber-400" />
              ODSMA Verified
            </span>
          </div>
        </div>
      </section>

      {/* ── 2. ISRO & Ground Telemetry Showcase ── */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-extrabold tracking-wider text-blue-600 uppercase">
            Data Ingestion
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            ISRO Satellite & Doppler Radar Integration
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Real-time multispectral imagery from ISRO's INSAT-3D/3DR geostationary satellites combined with IMD Doppler Weather Radar (DWR) telemetry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ISRO INSAT Card */}
          <div className="bg-slate-900 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-md group">
            <div className="relative h-48 sm:h-56 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&w=1200&q=80"
                alt="ISRO INSAT Satellite Thermal Radar"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-amber-400 border border-amber-400/30 flex items-center gap-1">
                <Satellite size={12} />
                <span>ISRO INSAT-3DR Telemetry</span>
              </div>
            </div>
            <div className="p-5 space-y-2">
              <h3 className="font-bold text-slate-100 text-base">Multispectral Thermal Sounding</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Captures high-frequency cloud-top temperatures, atmospheric moisture profiles, and brightness temperature differences to identify convective storm formation.
              </p>
            </div>
          </div>

          {/* Doppler Weather Radar Card */}
          <div className="bg-slate-900 text-white rounded-2xl overflow-hidden border border-slate-800 shadow-md group">
            <div className="relative h-48 sm:h-56 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?auto=format&fit=crop&w=1200&q=80"
                alt="Doppler Weather Radar Grid"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-bold text-cyan-400 border border-cyan-400/30 flex items-center gap-1">
                <Activity size={12} />
                <span>IMD Doppler Radar (DWR)</span>
              </div>
            </div>
            <div className="p-5 space-y-2">
              <h3 className="font-bold text-slate-100 text-base">S-Band Reflectivity Scans</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provides sub-kilometer precipitation reflectivity maps. Enables the neural network to measure hydrometeor density and vertical wind velocity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Step-by-Step Predictive Workflow Pipeline ── */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="mb-6">
          <span className="text-xs font-extrabold tracking-wider text-blue-600 uppercase">
            Predictive Workflow
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            How Forecast Alerts Are Generated
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          <StepCard
            step="1"
            icon={Database}
            title="Spatial Grid Scoring"
            text="The AI model scores every coordinate on a high-density 120 × 163 geographical grid."
          />
          <StepCard
            step="2"
            icon={Zap}
            title="Threshold Evaluation"
            text="Cells exceeding horizon-specific risk thresholds generate automated warning flags."
          />
          <StepCard
            step="3"
            icon={ShieldCheck}
            title="Authority Verification"
            text="State SEOC and ODSMA meteorologists independently review flagged grid regions."
          />
          <StepCard
            step="4"
            icon={Radio}
            title="Citizen Broadcast"
            text="Confirmed severe weather alerts are dispatched via SMS, App, and Web bulletins."
          />
        </div>
      </section>

      {/* ── 4. Research Prototype Limitations & Safety Directives ── */}
      <section className="bg-amber-50/70 border-2 border-amber-200/80 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500 text-white rounded-2xl shrink-0 shadow-sm">
            <AlertTriangle size={24} />
          </div>
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-black text-amber-900 tracking-tight">
                Experimental Research Prototype Disclaimer
              </h2>
              <p className="text-xs sm:text-sm text-amber-800 font-medium mt-1">
                VajraNetra is currently operating under a trial pilot phase. Please adhere to the following operational parameters:
              </p>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-amber-950 font-semibold pt-1">
              <li className="flex items-center gap-2 bg-amber-100/60 p-2.5 rounded-xl border border-amber-200">
                <CheckCircle2 size={15} className="text-amber-700 shrink-0" />
                <span>Predictions are experimental and subject to model variance.</span>
              </li>
              <li className="flex items-center gap-2 bg-amber-100/60 p-2.5 rounded-xl border border-amber-200">
                <CheckCircle2 size={15} className="text-amber-700 shrink-0" />
                <span>Always prioritize official warnings issued by IMD & NDMA.</span>
              </li>
              <li className="flex items-center gap-2 bg-amber-100/60 p-2.5 rounded-xl border border-amber-200">
                <CheckCircle2 size={15} className="text-amber-700 shrink-0" />
                <span>Localized cloudburst micro-events may undergo rapid shift.</span>
              </li>
              <li className="flex items-center gap-2 bg-amber-100/60 p-2.5 rounded-xl border border-amber-200">
                <CheckCircle2 size={15} className="text-amber-700 shrink-0" />
                <span>Follow instructions from District Emergency Operation Centres (DEOC).</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 5. Contact & Support Navigation Callout ── */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md border border-slate-800">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-lg font-bold">Have Questions or Technical Feedback?</h3>
          <p className="text-xs text-slate-400">
            Reach out to our research team or submit feedback regarding weather prediction accuracy.
          </p>
        </div>

        <Link
          to="/contact"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-2 shrink-0"
        >
          <span>Contact Operations Desk</span>
          <ArrowRight size={15} />
        </Link>
      </section>

    </div>
  );
}

function StepCard({ step, icon: Icon, title, text }) {
  return (
    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3 relative">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
          <Icon size={18} />
        </div>
        <span className="text-2xl font-black text-slate-200 font-mono">0{step}</span>
      </div>
      <div>
        <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}