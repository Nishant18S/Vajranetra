import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, LogOut, UserCircle2, ShieldCheck, ExternalLink, ChevronDown } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useSystemStatus } from '../../hooks/useSystemStatus';
import { fmtRelative } from '../../utils/formatters';

export default function AdminTopBar({ onOpenDrawer }) {
  const { user, logout } = useAuth();
  const { health, modelInfo, lastUpdated } = useSystemStatus();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const backendOk = !!health && (health.status === 'healthy' || health.status === 'ok');
  const dbOk = health?.database === 'ok';
  const modelOk = health?.model_loaded === true || modelInfo?.model_loaded === true;

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login', { replace: true });
  };

  return (
    <header className="vn-admin__topbar">
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          className="vn-admin__hamburger lg:hidden"
          onClick={onOpenDrawer}
          aria-label="Open menu"
        >
          <Menu size={16} />
        </button>

        <div className="hidden md:flex items-center gap-4">
          <StatusPill label="Backend"  ok={backendOk} />
          <StatusPill label="Database" ok={dbOk} />
          <StatusPill label="Model"    ok={modelOk} />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 text-[11px] text-[color:var(--a-text-dim)]">
          <span>Last refresh</span>
          <span className="mono" style={{ color: 'var(--a-text)' }}>
            {lastUpdated ? fmtRelative(lastUpdated) : '—'}
          </span>
        </div>

        {/* User menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border"
            style={{ borderColor: 'var(--a-border)', background: 'var(--a-surface-2)' }}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <span
              className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold"
              style={{ background: 'var(--a-accent-soft)', color: 'var(--a-accent)' }}
            >
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </span>
            <span className="hidden sm:inline text-xs text-[color:var(--a-text)] max-w-[120px] truncate">
              {user?.name?.split(' ')[0] || 'Account'}
            </span>
            <ChevronDown size={12} style={{ color: 'var(--a-text-dim)' }} />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-60 rounded-md border shadow-lg py-1 z-50"
              style={{ background: 'var(--a-surface-2)', borderColor: 'var(--a-border)' }}
            >
              <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--a-border-soft)' }}>
                <div className="text-xs font-semibold" style={{ color: 'var(--a-text)' }}>
                  {user?.name}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--a-text-dim)' }}>
                  {user?.email}
                </div>
                <div className="text-[10px] uppercase tracking-widest mt-1" style={{ color: 'var(--a-accent)' }}>
                  {user?.role}
                </div>
              </div>

              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[color:var(--a-surface-3)]"
                style={{ color: 'var(--a-text-mid)' }}
              >
                <UserCircle2 size={14} /> My Profile
              </Link>

              <Link
                to="/"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-[color:var(--a-surface-3)]"
                style={{ color: 'var(--a-text-mid)' }}
              >
                <ExternalLink size={14} /> Public Site
              </Link>

              {user?.must_change_password && (
                <div className="px-3 py-2 text-[11px] border-t" style={{ color: 'var(--a-amber)', borderColor: 'var(--a-border-soft)' }}>
                  <ShieldCheck size={12} className="inline mr-1" />
                  Password change recommended
                </div>
              )}

              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-[color:var(--a-surface-3)]"
                style={{ color: 'var(--a-red)' }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function StatusPill({ label, ok }) {
  const dot = ok ? 'vn-pill__dot--ok' : 'vn-pill__dot--crit';
  return (
    <div className="vn-pill">
      <span className={`vn-pill__dot ${dot}`} />
      <span>{label}</span>
    </div>
  );
}