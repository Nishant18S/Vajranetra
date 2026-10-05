import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Activity, Map as MapIcon, Bell, AlertOctagon,
  BarChart3, ScrollText, Users, PlusCircle, Radio, Search, MapPinned,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const NAV = [
  {
    section: 'Operations',
    items: [
      { to: '/admin',              label: 'Overview',         icon: LayoutDashboard, end: true },
      { to: '/admin/region',       label: 'Region Inspector', icon: Search },
      { to: '/admin/forecast',     label: 'Forecast',         icon: Activity },
      { to: '/admin/alerts',       label: 'Alert Queue',      icon: Bell },
      { to: '/admin/alerts/new',   label: 'Create Alert',     icon: PlusCircle },
      { to: '/admin/incidents',    label: 'Incidents',        icon: AlertOctagon },
      { to: '/admin/map',          label: 'Operational Map',  icon: MapIcon },
    ],
  },
  {
    section: 'Insight',
    items: [
      { to: '/admin/inspections',  label: 'Inspections', icon: MapPinned },
      { to: '/admin/analytics',    label: 'Analytics',   icon: BarChart3 },
      { to: '/admin/audit',        label: 'Audit Log',   icon: ScrollText },
    ],
  },
];

const ADMIN_ONLY = {
  section: 'Administration',
  items: [
    { to: '/admin/users', label: 'Users', icon: Users },
  ],
};

export default function AdminSidebar({ onNavigate }) {
  const { user, isAdmin } = useAuth();

  const renderGroup = (group) => (
    <div key={group.section}>
      <div className="vn-admin__nav-section">{group.section}</div>
      {group.items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `vn-admin__nav-link ${isActive ? 'vn-admin__nav-link--active' : ''}`
          }
        >
          <Icon size={15} />
          <span>{label}</span>
        </NavLink>
      ))}
    </div>
  );

  return (
    <aside className="vn-admin__sidebar">
      {/* Brand */}
      <div className="vn-admin__sidebar-brand">
        <div className="vn-admin__sidebar-mark">V</div>
        <div className="min-w-0">
          <div className="vn-admin__sidebar-title">VAJRANETRA</div>
          <div className="vn-admin__sidebar-sub">Authority</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="vn-admin__nav" aria-label="Admin">
        {NAV.map(renderGroup)}
        {isAdmin && renderGroup(ADMIN_ONLY)}
      </nav>

      {/* Foot */}
      <div className="vn-admin__sidebar-foot">
        <div className="flex items-center gap-2">
          <Radio size={12} style={{ color: 'var(--a-accent)' }} />
          <span>Signed in as</span>
        </div>
        <div className="mt-1" style={{ color: 'var(--a-text)' }}>
          {user?.name || user?.email}
        </div>
        <div className="uppercase tracking-widest text-[10px] mt-0.5">
          {user?.role}
        </div>
      </div>
    </aside>
  );
}