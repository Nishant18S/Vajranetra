import { useEffect, useState } from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';
import LeafletMap from '../../components/map/LeafletMap';
import HorizonTabs from '../../components/map/HorizonTabs';
import CoverageBoundsForm from '../../components/map/CoverageBoundsForm';
import { forecastService } from '../../services/forecastService';
import { coverageApi, loadMirror, saveMirror } from '../../utils/coverage';
import { HORIZONS } from '../../utils/constants';

export default function PublicMapView() {
  const [coverage, setCoverage] = useState(() => loadMirror());
  const [horizon, setHorizon] = useState(HORIZONS[0]);
  const [latest, setLatest] = useState(null);
  const [spatial, setSpatial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await coverageApi.get();
        if (cancelled) return;
        if (s?.bounds) { setCoverage(s); saveMirror(s); }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try { const data = await forecastService.latest(); if (!cancelled) setLatest(data); }
      catch { if (!cancelled) setLatest(null); }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const id = latest?.forecast_id;
    if (!id) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true); setError(null);
      try { const data = await forecastService.spatial(id, horizon, 1); if (!cancelled) setSpatial(data); }
      catch (e) { if (!cancelled) setError(e); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [latest?.forecast_id, horizon]);

  return (
    <div className="space-y-6">
      <section className="vn-panel p-6">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--vn-primary)' }}>Risk Map</h1>
        <p className="text-sm text-slate-600 mt-1">Probability of severe weather over the selected area. Change the horizon below to see different time windows.</p>
      </section>

      {!coverage && (
        <section className="vn-panel p-6">
          <h2 className="font-semibold text-slate-800 mb-3">Select an area to view on the map</h2>
          <CoverageBoundsForm onSaved={setCoverage} gridShape={spatial ? [spatial.height, spatial.width] : [120, 163]} />
        </section>
      )}

      {coverage && (
        <>
          <section className="vn-panel">
            <div className="vn-panel__hd">
              <div className="vn-panel__title flex items-center gap-2"><MapPin size={14} /> {coverage.label || 'Selected area'}</div>
              <HorizonTabs value={horizon} onChange={setHorizon} />
            </div>
            <div className="p-4">
              {loading && (<div className="h-[540px] flex items-center justify-center text-slate-500 text-sm">Loading map…</div>)}
              {!loading && error && (
                <div className="h-[540px] flex items-center justify-center">
                  <div className="text-center max-w-md">
                    <AlertTriangle size={24} className="mx-auto" style={{ color: 'var(--vn-red)' }} />
                    <p className="mt-2 text-sm text-slate-700">Could not load the map.</p>
                    <p className="text-xs text-slate-500 mt-1">{error.message}</p>
                  </div>
                </div>
              )}
              {!loading && !error && spatial && (
                <LeafletMap
                  bounds={coverage.bounds}
                  label="Model grid — placed over selected region"
                  grid={spatial.grid}
                  threshold={Number(spatial.threshold)}
                  peakCell={spatial.peak_grid}
                  horizon={horizon}
                  maxProbability={Number(spatial.max_probability || 0)}
                  height={540}
                />
              )}
            </div>
          </section>
          <p className="text-xs text-slate-500">The map shows model output on the 120 x 163 grid. Placement is based on the coverage area you selected.</p>
        </>
      )}
    </div>
  );
}
