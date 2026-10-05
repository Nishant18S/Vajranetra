import { useCallback, useEffect, useState } from 'react';
import { MapPin, RefreshCw, AlertTriangle } from 'lucide-react';
import LeafletMap from '../../components/map/LeafletMap';
import HorizonTabs from '../../components/map/HorizonTabs';
import CoverageBoundsForm from '../../components/map/CoverageBoundsForm';
import { forecastService } from '../../services/forecastService';
import { coverageApi, loadMirror, saveMirror } from '../../utils/coverage';
import { HORIZONS } from '../../utils/constants';
import { fmtNumber } from '../../utils/formatters';

export default function AdminMap() {
  const [coverage, setCoverage] = useState(() => loadMirror());
  const [horizon, setHorizon] = useState(HORIZONS[0]);
  const [latest, setLatest] = useState(null);
  const [spatial, setSpatial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCoverage = useCallback(async () => {
    try {
      const s = await coverageApi.get();
      if (s?.bounds) { setCoverage(s); saveMirror(s); }
    } catch {}
  }, []);

  const loadLatest = useCallback(async () => {
    try {
      const data = await forecastService.latest();
      setLatest(data);
    } catch { setLatest(null); }
  }, []);

  useEffect(() => { loadCoverage(); loadLatest(); }, [loadCoverage, loadLatest]);

  useEffect(() => {
    const id = latest?.forecast_id;
    if (!id) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true); setError(null);
      try {
        const data = await forecastService.spatial(id, horizon, 1);
        if (!cancelled) setSpatial(data);
      } catch (e) { if (!cancelled) setError(e); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [latest?.forecast_id, horizon]);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--a-text)' }}>Operational Map</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--a-text-dim)' }}>
            Spatial forecast grid placed over the configured coverage region.
          </p>
        </div>
        <button
          onClick={loadLatest}
          className="vn-adm-btn vn-adm-btn--outline"
        >
          <RefreshCw size={12} /> Reload latest
        </button>
      </div>

      {!coverage && (
        <div className="vn-adm-panel p-5">
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--a-text)' }}>
            Configure coverage area
          </h2>
          <CoverageBoundsForm onSaved={setCoverage} gridShape={[120, 163]} />
        </div>
      )}

      {coverage && (
        <>
          <div className="vn-adm-panel">
            <div className="vn-adm-panel__hd">
              <span className="vn-adm-panel__title flex items-center gap-2">
                <MapPin size={12} /> {coverage.label || 'Coverage region'}
              </span>
              <HorizonTabs value={horizon} onChange={setHorizon} />
            </div>
            <div className="p-4">
              {loading && (
                <div className="h-[560px] flex items-center justify-center text-xs" style={{ color: 'var(--a-text-dim)' }}>
                  Loading map…
                </div>
              )}
              {!loading && error && (
                <div className="h-[560px] flex items-center justify-center">
                  <div className="text-center">
                    <AlertTriangle size={24} style={{ color: 'var(--a-red)' }} className="mx-auto" />
                    <p className="text-sm mt-2" style={{ color: 'var(--a-text)' }}>Could not load the map</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--a-text-dim)' }}>{error.message}</p>
                  </div>
                </div>
              )}
              {!loading && !error && spatial && (
                <LeafletMap
                  bounds={coverage.bounds}
                  label="Model grid · placed over coverage region"
                  grid={spatial.grid}
                  threshold={Number(spatial.threshold)}
                  peakCell={spatial.peak_grid}
                  horizon={horizon}
                  maxProbability={Number(spatial.max_probability || 0)}
                  height={560}
                />
              )}
              {!loading && !error && !spatial && (
                <div className="h-[560px] flex items-center justify-center text-xs" style={{ color: 'var(--a-text-dim)' }}>
                  No forecast available. Run inference from the Forecast page first.
                </div>
              )}
            </div>
          </div>

          {spatial && (
            <div className="vn-adm-panel p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Meta label="Horizon"     value={`+${spatial.horizon_hours}h`} />
              <Meta label="Dimensions"  value={`${spatial.width} × ${spatial.height}`} />
              <Meta label="Threshold"   value={fmtNumber(spatial.threshold, 2)} />
              <Meta label="Max prob"    value={fmtNumber(spatial.max_probability, 4)} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Meta({ label, value }) {
  return (
    <div>
      <div className="kpi-label">{label}</div>
      <div className="mono text-sm mt-1" style={{ color: 'var(--a-text)' }}>{String(value)}</div>
    </div>
  );
}