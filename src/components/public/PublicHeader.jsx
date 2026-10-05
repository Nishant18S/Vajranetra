import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import {
  Phone,
  ShieldCheck,
  Menu,
  User,
  LogOut,
  ChevronDown,
  UserPlus,
  ShieldAlert,
  Radio,
  Satellite,
  Pause,
  Play,
  ChevronLeft,
  ChevronRight,
  BellRing
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const ALERT_SLIDES = [
  {
    id: 1,
    icon: ShieldAlert,
    tag: 'IMD Official Advisory',
    message: 'Isolated heavy rainfall & localized thunder predicted across Odisha coastal districts over next 6 hours.',
    actionText: 'Call 1070',
    actionHref: 'tel:1070'
  },
  {
    id: 2,
    icon: Radio,
    tag: 'Emergency Response',
    message: 'State Control Room (SEOC) fully operational. Dial 112 or 1070 for immediate emergency assistance.',
    actionText: 'Call 112',
    actionHref: 'tel:112'
  },
  {
    id: 3,
    icon: Satellite,
    tag: 'AI Radar System',
    message: 'VajraNetra Satellite-CNN model active. Continuous 2-6 hour precipitation risk tracking enabled.',
    actionText: 'View Radar',
    actionHref: '/map'
  }
];

export default function PublicHeader() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const menuRef = useRef(null);

  // Close user dropdown menu when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Automated Slider Timer (Changes every 5 seconds if not paused)
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % ALERT_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const openSidebar = () => {
    window.dispatchEvent(new CustomEvent('vn:open-sidebar'));
  };

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/', { replace: true });
  };

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % ALERT_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + ALERT_SLIDES.length) % ALERT_SLIDES.length);

  const CurrentIcon = ALERT_SLIDES[currentSlide].icon;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/80 shadow-2xs">
      
      {/* ── Top Professional Alert Slider ── */}
      <div 
        className="bg-slate-900 text-white text-xs py-1.5 px-4 overflow-hidden border-b border-slate-800"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          
          {/* Left Live Indicator & Slide Content */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shrink-0 shadow-xs">
              <Radio size={11} className="animate-pulse" />
              <span>Broadcast</span>
            </span>

            {/* Slide Item Container with Fade Transition */}
            <div className="flex items-center gap-2 min-w-0 flex-1 transition-all duration-300">
              <CurrentIcon size={14} className="text-amber-400 shrink-0" />
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider shrink-0 hidden sm:inline">
                [{ALERT_SLIDES[currentSlide].tag}]:
              </span>
              <p className="text-[11px] text-slate-200 font-medium truncate">
                {ALERT_SLIDES[currentSlide].message}
              </p>
            </div>
          </div>

          {/* Right Controls & Indicators */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Slide Pagination Dots */}
            <div className="hidden md:flex items-center gap-1">
              {ALERT_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1 rounded-full transition-all ${
                    idx === currentSlide ? 'w-4 bg-amber-400' : 'w-1 bg-slate-700'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Slider Controls */}
            <div className="flex items-center gap-1 text-slate-400 border-l border-slate-800 pl-2">
              <button
                type="button"
                onClick={prevSlide}
                className="p-0.5 hover:text-white transition-colors"
                aria-label="Previous alert"
              >
                <ChevronLeft size={14} />
              </button>

              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                className="p-0.5 hover:text-white transition-colors"
                aria-label={isPaused ? 'Resume slider' : 'Pause slider'}
              >
                {isPaused ? <Play size={12} /> : <Pause size={12} />}
              </button>

              <button
                type="button"
                onClick={nextSlide}
                className="p-0.5 hover:text-white transition-colors"
                aria-label="Next alert"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Direct Slide Action Button */}
            <a
              href={ALERT_SLIDES[currentSlide].actionHref}
              className="hidden lg:inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20 hover:bg-amber-400/20 transition-colors"
            >
              <BellRing size={10} />
              <span>{ALERT_SLIDES[currentSlide].actionText}</span>
            </a>
          </div>

        </div>
      </div>

      {/* ── Main Navigation Bar ── */}
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="h-16 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Toggle + Brand Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openSidebar}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>

            <Link to="/" className="flex flex-col justify-center min-w-0">
              <span className="text-lg font-black tracking-tight text-blue-900 leading-none">
                VAJRANETRA
              </span>
              <span className="text-[9px] font-bold tracking-widest text-slate-400 mt-1 uppercase">
                AI Early Warning Platform
              </span>
            </Link>
          </div>

          {/* Center: Desktop Nav Items */}
          <nav
            className="hidden lg:flex items-center gap-1 bg-slate-100/70 p-1 rounded-full border border-slate-200/60"
            aria-label="Primary Navigation"
          >
            {[
              { to: '/', end: true, label: 'Home' },
              { to: '/forecast', label: 'Check Forecast' },
              { to: '/map', label: 'Risk Map' },
              { to: '/alerts', label: 'Alerts' },
              { to: '/about', label: 'About' },
              { to: '/contact', label: 'Contact' },
            ].map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-150 ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right: Actions & User Account */}
          <div className="flex items-center gap-3 shrink-0">
            
            <a
              href="tel:1070"
              className="hidden xl:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors"
            >
              <Phone size={13} className="text-amber-700" />
              <span>Helpline: 1070</span>
            </a>

            {!isAuthenticated && (
              <div className="flex items-center gap-2">
                <Link
                  to="/register"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
                >
                  <UserPlus size={14} /> Register
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-2xs"
                >
                  Sign In
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="inline-flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <span className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black bg-blue-600">
                    {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden sm:inline text-xs font-bold text-slate-800 max-w-[100px] truncate">
                    {user?.name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown size={12} className="text-slate-400" />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white shadow-xl py-1.5 z-[60] overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {user?.name || 'Citizen User'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {user?.email}
                      </div>
                      <div className="inline-block text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100 mt-1.5">
                        {user?.role || 'CITIZEN'}
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User size={14} className="text-slate-400" /> My Dashboard
                      </Link>

                      <Link
                        to="/profile"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User size={14} className="text-slate-400" /> Profile & Settings
                      </Link>

                      {(user?.role === 'AUTHORITY' || user?.role === 'ADMIN') && (
                        <Link
                          to="/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <ShieldCheck size={14} className="text-blue-600" /> Authority Console
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 text-left transition-colors"
                      >
                        <LogOut size={14} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}