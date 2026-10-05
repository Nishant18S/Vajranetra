import { createContext, useCallback, useEffect, useState } from 'react';
import { alertService } from '../services/alertService';
import { POLL_INTERVAL_MS, STATUS } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';

export const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const { isAuthenticated, canAccessAdmin } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [state, setState] = useState(STATUS.EMPTY);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = useCallback(async () => {
    // Only poll the authority endpoint when an authority user is signed in.
    if (!canAccessAdmin) {
      setAlerts([]);
      setState(STATUS.EMPTY);
      return;
    }

    setRefreshing(true);
    try {
      const data = await alertService.active();
      const list = Array.isArray(data?.alerts)
        ? data.alerts
        : Array.isArray(data)
        ? data
        : [];
      setAlerts(list);
      setState(list.length ? STATUS.SUCCESS : STATUS.EMPTY);
      setLastUpdated(new Date().toISOString());
      setError(null);
    } catch (e) {
      // Silent on 401/403 — they're expected when roles change.
      if (e.code === 'UNAUTHORIZED' || e.code === 'FORBIDDEN') {
        setAlerts([]);
        setState(STATUS.EMPTY);
      } else {
        setError(e);
        setState(STATUS.ERROR);
      }
    } finally {
      setRefreshing(false);
    }
  }, [canAccessAdmin]);

  const loadSample = useCallback(async (idx) => {
    setRefreshing(true);
    try {
      const data = await alertService.list({ sample_index: idx });
      const list = Array.isArray(data?.alerts) ? data.alerts : [];
      setAlerts(list);
      setState(list.length ? STATUS.SUCCESS : STATUS.EMPTY);
      setLastUpdated(new Date().toISOString());
      setError(null);
      return data;
    } catch (e) {
      setError(e);
      setState(STATUS.ERROR);
      throw e;
    } finally {
      setRefreshing(false);
    }
  }, []);

  const acknowledge = useCallback(async (id, payload) => {
    await alertService.acknowledge(id, payload);
    await refresh();
  }, [refresh]);

  const resolve = useCallback(async (id, payload) => {
    await alertService.resolve(id, payload);
    await refresh();
  }, [refresh]);

  // Only poll when an authority user is signed in.
  useEffect(() => {
    if (!isAuthenticated || !canAccessAdmin) {
      setAlerts([]);
      setState(STATUS.EMPTY);
      return;
    }
    refresh();
    const t = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [isAuthenticated, canAccessAdmin, refresh]);

  return (
    <AlertContext.Provider
      value={{
        alerts,
        state,
        error,
        refreshing,
        lastUpdated,
        intervalMs: POLL_INTERVAL_MS,
        refresh,
        loadSample,
        acknowledge,
        resolve,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
}