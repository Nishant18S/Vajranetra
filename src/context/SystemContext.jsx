import { createContext, useCallback, useEffect, useState } from 'react';
import { systemService } from '../services/systemService';
import { POLL_INTERVAL_MS } from '../utils/constants';

export const SystemContext = createContext(null);

export function SystemProvider({ children }) {
  const [health, setHealth] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [h, m] = await Promise.all([
        systemService.health().catch((e) => ({ __error: e })),
        systemService.modelInfo().catch((e) => ({ __error: e })),
      ]);
      setHealth(h);
      setModelInfo(m);
      setLastUpdated(new Date().toISOString());
      setError(h?.__error || m?.__error || null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [refresh]);

  return (
    <SystemContext.Provider
      value={{
        health,
        modelInfo,
        loading,
        refreshing,
        error,
        lastUpdated,
        refresh,
        intervalMs: POLL_INTERVAL_MS,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
}