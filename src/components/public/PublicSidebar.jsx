import { useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  CloudRain,
  Map as MapIcon,
  Bell,
  Info,
  Phone,
  UserCircle2,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ShieldCheck,
  Activity,
  FileText,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

const COLLAPSE_KEY = 'vn:sidebar-collapsed';

// Streamlined navigation
const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/forecast', label: 'Check Forecast', icon: CloudRain },
  { to: '/map', label: 'Risk Map', icon: MapIcon },
  { to: '/alerts', label: 'Active Alerts', icon: Bell, badge: 'LIVE' },
  { to: '/about', label: 'About Platform', icon: Info },
  { to: '/contact', label: 'Contact & Helplines', icon: Phone },
  { to: '/profile', label: 'Profile & Settings', icon: UserCircle2 },
];

// Quick actions shown in the empty space
const QUICK_ACTIONS = [
  { to: '/profile', label: 'Emergency Kit', icon: ShieldCheck },
  { to: '/contact', label: 'Report an Issue', icon: FileText },
  { to: '/map', label: 'View Safe Zones', icon: MapPin },
];

export default function PublicSidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
    } catch {}
  }, [collapsed]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('vn:open-sidebar', handler);
    return () => window.removeEventListener('vn:open-sidebar', handler);
  }, []);

  const close = () => setOpen(false);
  const toggleCollapsed = () => setCollapsed((v) => !v);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-30 lg:hidden transition-opacity"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={[
          'shrink-0 flex flex-col bg-white border-r border-slate-200/80',
          'transition-all duration-300 ease-in-out',

          // Desktop collapsed vs expanded widths
          collapsed ? 'lg:w-[72px]' : 'lg:w-[240px]',
          'w-[260px] max-w-[85vw]',

          // Desktop sticky below header
          'lg:sticky lg:top-16 lg:self-start lg:z-30',
          'lg:h-[calc(100vh-64px)]',

          // Mobile fixed drawer
          'fixed lg:static top-0 left-0 h-screen z-40',

          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
      >
        {/* Top Header Row */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 shrink-0">
          {!collapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
                V
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-extrabold tracking-tight text-slate-900 leading-tight">
                  VajraNetra
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  Early Warning Portal
                </span>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex w-full justify-center">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
                V
              </div>
            </div>
          )}

          {/* Desktop Toggle Button */}
          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={close}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-3 py-3">
          {/* Navigation links */}
          <div className="space-y-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end, badge }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={close}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-50/90 text-blue-700 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  } ${collapsed ? 'lg:justify-center lg:px-2' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={18}
                      className={`shrink-0 transition-colors ${
                        isActive
                          ? 'text-blue-600'
                          : 'text-slate-500 group-hover:text-slate-800'
                      }`}
                    />

                    <span className={`truncate ${collapsed ? 'lg:hidden' : 'block'}`}>
                      {label}
                    </span>

                    {badge && !collapsed && (
                      <span className="ml-auto px-1.5 py-0.5 text-[9px] font-black tracking-wider text-red-600 bg-red-50 border border-red-100 rounded-md animate-pulse">
                        {badge}
                      </span>
                    )}

                    {isActive && collapsed && (
                      <span className="hidden lg:block absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full" />
                    )}

                    {collapsed && (
                      <div className="hidden lg:group-hover:flex absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg shadow-lg whitespace-nowrap z-50 pointer-events-none items-center gap-1.5">
                        <span>{label}</span>
                        {badge && (
                          <span className="text-[9px] bg-red-500 px-1 rounded text-white font-mono">
                            {badge}
                          </span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* ─── Live Status (hidden when collapsed) ─── */}
          {!collapsed && (
            <>
              <div className="border-t border-slate-100 my-3" />

              <div className="px-3 pt-1 pb-1">
                <div className="flex items-center gap-2 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-2">
                  <Activity size={11} className="text-emerald-500" />
                  <span>Live Status</span>
                </div>
                <ul className="space-y-1.5 text-[11px]">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-slate-600">System Online</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-blue-500 shrink-0" />
                    <span className="text-slate-600">
                      District:{' '}
                      <span className="font-semibold text-slate-800">
                        Khordha
                      </span>
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={12} className="text-blue-500 shrink-0" />
                    <span className="text-slate-600">
                      Alerts:{' '}
                      <span className="font-semibold text-slate-800">
                        Monitoring
                      </span>
                    </span>
                  </li>
                </ul>
              </div>

              {/* ─── Quick Actions ─── */}
              <div className="border-t border-slate-100 my-3" />

              <div className="px-3 pt-1 pb-1">
                <div className="flex items-center gap-2 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase mb-2">
                  <ShieldCheck size={11} className="text-blue-500" />
                  <span>Quick Actions</span>
                </div>
                <div className="space-y-1">
                  {QUICK_ACTIONS.map(({ to, label, icon: Icon }) => (
                    <Link
                      key={`${to}-${label}`}
                      to={to}
                      onClick={close}
                      className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[11px] font-medium text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 transition-colors"
                    >
                      <Icon size={14} className="text-slate-500 shrink-0" />
                      <span className="truncate">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Emergency Hotline Footer (pinned to bottom) */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60 shrink-0">
          {!collapsed ? (
            <div className="p-3 rounded-xl bg-red-50/80 border border-red-200/60 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-red-700">
                <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <AlertTriangle size={14} className="shrink-0 text-red-600" />
                  <span>Emergency Helplines</span>
                </span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              </div>

              <div className="space-y-1 text-slate-600 font-semibold text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">National Call:</span>
                  <a
                    href="tel:112"
                    className="font-mono text-slate-900 hover:text-red-600 transition-colors"
                  >
                    112
                  </a>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Disaster SEOC:</span>
                  <a
                    href="tel:1070"
                    className="font-mono text-slate-900 hover:text-red-600 transition-colors"
                  >
                    1070
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex justify-center py-1">
              <a
                href="tel:112"
                title="National Emergency: Call 112"
                className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-200/80 hover:bg-red-100 transition-colors shadow-2xs"
              >
                <Phone size={17} />
              </a>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}