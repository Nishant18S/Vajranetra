import { Link, useNavigate, useLocation } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const justRegistered = location.state?.justRegistered;
  const from = location.state?.from || '/dashboard';

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      {/* Main Container */}
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        
        {/* Left Section - Space Hero Banner */}
        <div className="lg:col-span-5 relative bg-slate-950 hidden sm:flex flex-col justify-between p-8 text-white overflow-hidden">
          
          {/* Space Background Image / GIF */}
          <img
            src="https://i.pinimg.com/originals/b1/4e/59/b14e5944e65f0787ee20edf1c05f3b72.gif"
            alt="Space Backdrop"
            className="absolute inset-0 w-full h-full object-cover opacity-75 mix-blend-screen scale-105 transition-transform duration-1000 hover:scale-100"
          />

          {/* Deep Space Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent z-0" />

          {/* Top Brand Logo / Tag */}
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Cosmic Intelligence</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md leading-tight">
              Explore Beyond <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
                The Atmosphere.
              </span>
            </h2>
          </div>

          {/* Space Highlights List */}
          <div className="relative z-10 space-y-4">
            <div className="space-y-3 text-xs font-medium text-slate-200 backdrop-blur-md bg-black/30 p-4 rounded-xl border border-white/10">
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                <span>Satellite Weather Tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                <span>Orbital Warning System</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span>Real-Time Planetary Feeds</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 pt-2 border-t border-white/10 text-center tracking-wide">
              Official Early Warning & Cosmic Observation Network
            </p>
          </div>
        </div>

        {/* Right Section - Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between bg-white">
          <div className="w-full max-w-md mx-auto space-y-6 my-auto">
            
            {/* Header */}
            <div className="text-left space-y-2">
              <h1 
                className="text-3xl font-extrabold tracking-tight text-slate-900"
                style={{ color: 'var(--vn-primary)' }}
              >
                Citizen Sign In
              </h1>
              <p className="text-sm text-slate-500">
                Welcome back! Please enter your details to access your localized alerts.
              </p>
            </div>

            {/* Success Banner after registration */}
            {justRegistered && (
              <div 
                className="p-4 rounded-xl bg-emerald-50 border-l-4 shadow-sm transition-all"
                style={{ borderLeftColor: 'var(--vn-green, #10b981)' }}
              >
                <p className="text-sm font-medium text-emerald-800 flex items-center gap-2">
                  <span>✓</span> Account created successfully! Please sign in with your details.
                </p>
              </div>
            )}

            {/* Main Form Component */}
            <div className="py-2">
              <LoginForm onSuccess={() => navigate(from, { replace: true })} />
            </div>

            {/* Footer Links */}
            <div className="pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Link 
                to="/register" 
                className="group bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-200/80 transition-all text-center sm:text-left block"
              >
                <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">New here?</span>
                <span className="text-blue-600 font-semibold text-xs group-hover:text-blue-800 transition-colors inline-flex items-center gap-1">
                  Create an account <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>

              <Link 
                to="/admin/login" 
                className="group bg-slate-50 hover:bg-slate-100 p-3.5 rounded-xl border border-slate-200/80 transition-all text-center sm:text-left block"
              >
                <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-0.5">Government official?</span>
                <span className="text-blue-600 font-semibold text-xs group-hover:text-blue-800 transition-colors inline-flex items-center gap-1">
                  Authority portal <span className="group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </Link>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}