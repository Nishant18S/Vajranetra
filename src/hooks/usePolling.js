import { useCallback, useEffect, useRef, useState } from 'react';

export default function usePolling(fetcher, { intervalMs = 45000, immediate = true } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: immediate });
  const timerRef = useRef(null);
  const mountedRef = useRef(true);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async () => {
    try {
      const data = await fetcherRef.current();
      if (mountedRef.current) setState({ data, error: null, loading: false });
    } catch (err) {
      if (mountedRef.current) setState((s) => ({ ...s, error: err, loading: false }));
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    const tick = () => {
      if (document.visibilityState === 'visible') run();
    };
    if (immediate) run();
    timerRef.current = setInterval(tick, intervalMs);
    const onVis = () => {
      if (document.visibilityState === 'visible') run();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      mountedRef.current = false;
      clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [run, intervalMs, immediate]);

  return { ...state, refresh: run };
}