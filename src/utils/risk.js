import { RISK_STYLE } from './constants';

export const riskStyle = (risk) =>
  RISK_STYLE[(risk || '').toUpperCase()] || RISK_STYLE.UNKNOWN;

export const probabilityPct = (p) =>
  p == null || Number.isNaN(Number(p))
    ? '—'
    : `${(Number(p) * 100).toFixed(2)}%`;