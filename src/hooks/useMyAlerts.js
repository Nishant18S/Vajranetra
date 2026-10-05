import { useEffect, useRef, useState, useCallback } from 'react';
import { publicService } from '../services/publicService';

const POLL_MS = Number(import.meta.env.VITE_POLL_INTERVAL_MS || 45000);

export function useMyAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [region, setRegion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const data = await publicService.myAlerts();
      if (!mounted.current) return;
      setAlerts(Array.isArray(data?.alerts) ? data.alerts : []);
      setRegion(data?.region || null);
      setLastUpdated(new Date().toISOString());
      setError(null);
    } catch (e) {
      if (!mounted.current) return;
      setError(e);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    refresh();
    const tick = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    const t = setInterval(tick, POLL_MS);
    document.addEventListener('visibilitychange', tick);
    return () => {
      mounted.current = false;
      clearInterval(t);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [refresh]);

  return { alerts, region, loading, error, lastUpdated, refresh };
}