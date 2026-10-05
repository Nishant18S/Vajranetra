import { createContext, useCallback, useEffect, useState } from 'react';
import { forecastService } from '../services/forecastService';
import { POLL_INTERVAL_MS, STATUS } from '../utils/constants';

export const ForecastContext = createContext(null);

export function ForecastProvider({ children }) {
  const [forecast, setForecast] = useState(null);
  const [state, setState] = useState(STATUS.LOADING);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [sampleIndex, setSampleIndex] = useState(0);

  const loadLatest = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await forecastService.latest();
      if (!data || !data.forecast_id) {
        setForecast(null);
        setState(STATUS.EMPTY);
      } else {
        setForecast(data);
        setState(STATUS.SUCCESS);
        setSampleIndex(data.sample_index ?? 0);
      }
      setLastUpdated(new Date().toISOString());
      setError(null);
    } catch (e) {
      if (e.code === 'NOT_FOUND') {
        setForecast(null);
        setState(STATUS.EMPTY);
      } else {
        setError(e);
        setState(STATUS.ERROR);
      }
    } finally {
      setRefreshing(false);
    }
  }, []);

  const runSample = useCallback(async (idx) => {
    setRefreshing(true);
    try {
      const data = await forecastService.bySample(Number(idx));
      setForecast(data);
      setSampleIndex(Number(idx));
      setState(STATUS.SUCCESS);
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

  useEffect(() => {
    loadLatest();
    const t = setInterval(loadLatest, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, [loadLatest]);

  return (
    <ForecastContext.Provider
      value={{
        forecast,
        state,
        error,
        refreshing,
        lastUpdated,
        intervalMs: POLL_INTERVAL_MS,
        sampleIndex,
        refresh: loadLatest,
        loadSample: runSample,
      }}
    >
      {children}
    </ForecastContext.Provider>
  );
}