export const HORIZONS = [2, 3, 4, 5, 6];

export const RISK_LEVELS = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];

export const RISK_STYLE = {
  LOW:      { text: 'text-green-700',   bg: 'bg-green-50'   },
  MODERATE: { text: 'text-amber-700',   bg: 'bg-amber-50'   },
  HIGH:     { text: 'text-orange-700',  bg: 'bg-orange-50'  },
  CRITICAL: { text: 'text-red-700',     bg: 'bg-red-50'     },
  UNKNOWN:  { text: 'text-slate-500',   bg: 'bg-slate-100'  },
};

export const STATUS = {
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  EMPTY: 'empty',
  UNAVAILABLE: 'unavailable',
  IDLE: 'idle',
};

export const POLL_INTERVAL_MS = Number(
  import.meta.env.VITE_POLL_INTERVAL_MS || 45000
);

export const ROLES = {
  CITIZEN: 'CITIZEN',
  AUTHORITY: 'AUTHORITY',
  ADMIN: 'ADMIN',
};