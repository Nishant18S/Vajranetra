import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, Map, Bell, ArrowLeft, Zap } from 'lucide-react';

const items = [
  { to: '/authority',            label: 'Overview',   icon: LayoutDashboard, end: true },
  { to: '/forecast',             label: 'Forecast',   icon: Activity },
  { to: '/map',                  label: 'Risk Map',   icon: Map },
  { to: '/alerts',               label: 'Alerts',     icon: Bell },
];

export default function AuthoritySidebar() {
  return (
    <aside className="border-r border-line bg-base-950 flex flex-col">
      <div className="h-14 px-4 border-b border-line flex items-center gap-2">
        <span className="w-6 h-6 rounded bg-accent/15 border border-accent/30 flex items-center justify-center">
          <Zap size={12} className="text-accent" />
        </span>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-ink-hi leading-tight truncate">VAJRANETRA</div>
          <div className="text-2xs text-ink-faint uppercase tracking-widest">Authority</div>
        </div>
      </div>

      <nav className="p-3 space-y-0.5 flex-1">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-base-800 text-accent border border-line'
                  : 'text-ink-dim hover:text-ink hover:bg-base-800/60'
              }`
            }
          >
            <Icon size={14} /> {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-line">
        <NavLink
          to="/"
          className="flex items-center gap-2 px-3 py-2 rounded text-xs text-ink-dim hover:text-ink hover:bg-base-800/60"
        >
          <ArrowLeft size={14} /> Public Site
        </NavLink>
      </div>
    </aside>
  );
}