import { Link } from 'react-router-dom';
import {
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Lock,
  Globe,
  CheckCircle,
  QrCode,
  Sparkles,
  Radio
} from 'lucide-react';

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto bg-[#070e1b] text-slate-300 border-t border-slate-800/80 font-sans">
      
      {/* ── 1. Main Content Grid ── */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 text-xs">
          
          {/* Column 1: Brand & Ministry Info (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="flex items-center gap-3">
              {/* Official Government Emblem / Digital India Emblem */}
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                alt="Emblem of India"
                className="h-10 w-auto invert brightness-200"
              />
              <div className="border-l border-slate-700 pl-3">
                <h2 className="text-white font-black text-sm tracking-wide leading-tight">
                  VAJRANETRA
                </h2>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Ministry of Earth Sciences
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Official AI Early Warning Portal for hyper-local severe weather detection, radar-CNN precipitation forecast, and real-time citizen disaster advisories.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-blue-300 bg-blue-950/80 border border-blue-800/60 rounded-md">
                <Sparkles size={11} className="text-amber-400" />
                Digital India Initiative
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800/60 rounded-md">
                <Radio size={11} className="text-emerald-400 animate-pulse" />
                Live Radar
              </span>
            </div>
          </div>

          {/* Column 2: Government Portals (2 Cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-white mb-3 relative inline-block">
              GOVT PORTALS
              <span className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-amber-500 rounded-full" />
            </h3>
            <ul className="space-y-2 text-[11px] text-slate-400">
              {[
                { label: 'India Meteorological Dept.', url: 'https://mausam.imd.gov.in' },
                { label: 'Disaster Mgmt (NDMA)', url: 'https://ndma.gov.in' },
                { label: 'Ministry of Earth Sciences', url: 'https://www.moes.gov.in' },
                { label: 'National Data Portal', url: 'https://data.gov.in' },
                { label: 'MyGov India', url: 'https://mygov.in' },
              ].map(({ label, url }) => (
                <li key={label}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 hover:text-white transition-colors group"
                  >
                    <ChevronRight size={11} className="text-amber-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    <span>{label}</span>
                    <ExternalLink size={9} className="text-slate-600 opacity-80" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Platform Links (2 Cols) */}
          <div className="lg:col-span-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-white mb-3 relative inline-block">
              QUICK LINKS
              <span className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-amber-500 rounded-full" />
            </h3>
            <ul className="space-y-2 text-[11px] text-slate-400">
              {[
                { label: 'Check Forecast', path: '/forecast' },
                { label: 'Risk Map & Radar', path: '/map' },
                { label: 'Active Bulletins', path: '/alerts' },
                { label: 'About Platform', path: '/about' },
                { label: 'Contact Helplines', path: '/contact' },
              ].map(({ label, path }) => (
                <li key={label}>
                  <Link
                    to={path}
                    className="inline-flex items-center gap-1.5 hover:text-white transition-colors group"
                  >
                    <ChevronRight size={11} className="text-amber-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Mobile Access QR Code (2 Cols) */}
          <div className="lg:col-span-2 space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-white mb-3 relative inline-block">
              MOBILE ALERTS
              <span className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-amber-500 rounded-full" />
            </h3>
            <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center gap-3">
              <div className="p-1.5 bg-white rounded-lg shrink-0 shadow-sm">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent('https://vajranetra.gov.in')}`}
                  alt="Scan for Mobile Weather Alerts"
                  className="w-14 h-14"
                />
              </div>
              <div>
                <span className="text-[11px] font-bold text-white block">Scan for Alerts</span>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                  Instant mobile access to early warning radar alerts.
                </p>
              </div>
            </div>
          </div>

          {/* Column 5: Embedded Bhubaneswar Location Map (3 Cols) */}
          <div className="lg:col-span-3 space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-white mb-3 relative inline-block">
              STATE RADAR HQ
              <span className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-amber-500 rounded-full" />
            </h3>

            {/* Embedded Dark-Styled Google Map centered at Bhubaneswar */}
            <div className="w-full h-28 rounded-xl overflow-hidden border border-slate-800 shadow-md relative">
              <iframe
                title="Bhubaneswar Weather Operations HQ"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(0.8) contrast(1.2) opacity(0.85)' }}
                loading="lazy"
                allowFullScreen
                src="https://maps.google.com/maps?q=Meteorological%20Centre,%20Bhubaneswar,%20Odisha&t=&z=12&ie=UTF8&iwloc=&output=embed"
              />
              <div className="absolute bottom-1 left-1 bg-slate-950/90 px-2 py-0.5 rounded text-[9px] font-bold text-amber-400 backdrop-blur-xs flex items-center gap-1">
                <MapPin size={10} />
                <span>Bhubaneswar, Odisha</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── 2. Official Compliance Strip ── */}
      <div className="border-t border-slate-800/60 bg-[#040812] py-2 px-6 text-[10px] text-slate-400">
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><ShieldCheck size={12} className="text-blue-400" /> ISO 27001 Certified</span>
            <span className="flex items-center gap-1.5"><Lock size={12} className="text-blue-400" /> IT Act Compliant</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={12} className="text-blue-400" /> GIGW 3.0 Guidelines</span>
          </div>
          <div className="flex items-center gap-2">
            <Mail size={12} className="text-amber-500" />
            <span>Official Helpdesk: <a href="mailto:support@vajranetra.gov.in" className="text-white hover:underline">support@vajranetra.gov.in</a></span>
          </div>
        </div>
      </div>

      {/* ── 3. Bottom Legal & NIC Branding Footer ── */}
      <div className="border-t border-slate-800/80 bg-[#02050b] py-3 px-6 text-[11px] text-slate-400">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Copyright */}
          <div>
            © {currentYear} Government of India. Ministry of Earth Sciences. All rights reserved.
          </div>

          {/* Policy Links */}
          <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 font-medium">
            <Link to="/about" className="hover:text-white transition-colors">Terms of Service</Link>
            <span>•</span>
            <a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <span>•</span>
            <a href="#hyperlink" className="hover:text-white transition-colors">Hyperlinking Policy</a>
            <span>•</span>
            <a href="#accessibility" className="hover:text-white transition-colors">Accessibility</a>
            <span>•</span>
            <a href="#sitemap" className="hover:text-white transition-colors">Sitemap</a>
          </div>

          {/* Official NIC Branding Logo */}
          <div className="flex items-center gap-3">
            <a
              href="https://www.nic.in"
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1 bg-white rounded-md flex items-center gap-2 hover:bg-slate-100 transition-colors"
            >
              <img
                src="https://thumb.wikimedia.org/wikipedia/commons/thumb/1/12/NIC_logo.svg/1280px-NIC_logo.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail"
                alt="National Informatics Centre"
                className="h-5 w-auto object-contain"
              />
            </a>
          </div>

        </div>
      </div>

    </footer>
  );
}