import { NavLink } from 'react-router-dom';
import { Zap, Shield } from 'lucide-react';
import { useSystemStatus } from '../../hooks/useSystemStatus';

const nav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/forecast', label: 'Forecast' },
  { to: '/map', label: 'Risk Map' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/about', label: 'About' },
];

export default function PublicHeader() {
  const { health, loading, error } = useSystemStatus();

  // Backend is considered online if /api/health returned the expected shape
  // AND the last request did not error.
  const backendOk =
    !error &&
    health &&
    (health.status === 'healthy' || health.status === 'ok');

  // Three-state indicator: loading, online, offline.
  const dotClass = loading
    ? 'bg-ink-faint animate-pulseSoft'
    : backendOk
    ? 'bg-risk-normal animate-pulseSoft'
    : 'bg-risk-critical';

  const label = loading
    ? 'Checking backend…'
    : backendOk
    ? 'Backend online'
    : 'Backend offline';

  return (
    <header className="border-b border-line bg-base-900/95 backdrop-blur sticky top-0 z-30">
      <div className="max-w-[1400px] mx-auto px-5 h-14 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="w-7 h-7 rounded bg-accent/15 border border-accent/30 flex items-center justify-center">
            <Zap size={14} className="text-accent" />
          </span>
          <span className="font-semibold tracking-tight text-ink-hi">VAJRANETRA</span>
          <span className="hidden sm:inline text-2xs uppercase tracking-widest text-ink-faint border border-line rounded px-1.5 py-0.5 ml-1">
            Prototype
          </span>
        </NavLink>

        <nav className="hidden md:flex items-center gap-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-base-750 text-accent'
                    : 'text-ink-dim hover:text-ink hover:bg-base-750/60'
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-2xs">
            <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
            <span className="text-ink-dim uppercase tracking-wider">{label}</span>
          </div>
          <NavLink
            to="/authority"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-line text-xs text-ink hover:border-accent/50 hover:text-accent"
          >
            <Shield size={12} /> Authority
          </NavLink>
        </div>
      </div>
    </header>
  );
}