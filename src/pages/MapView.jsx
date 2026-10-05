import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../components/common/PageHeader';
import FreshnessIndicator from '../components/common/FreshnessIndicator';
import HorizonTabs from '../components/map/HorizonTabs';
import MapLegend from '../components/map/MapLegend';
import CoverageBoundsForm from '../components/map/CoverageBoundsForm';
import LeafletMap from '../components/map/LeafletMap';
import RiskBadge from '../components/common/RiskBadge';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import Spinner from '../components/common/Spinner';
import Button from '../components/common/Button';
import { useForecast } from '../hooks/useForecast';
import { forecastService } from '../services/forecastService';
import { STATUS, HORIZONS } from '../utils/constants';
import { fmtNumber, fmtDateTime } from '../utils/formatters';
import {
  coverageApi,
  loadMirror,
  saveMirror,
  clearMirror,
} from '../utils/coverage';

export default function MapView() {
  const {
    forecast,
    state,
    refreshing,
    lastUpdated,
    sampleIndex,
    loadSample,
  } = useForecast();

  const [horizon, setHorizon] = useState(HORIZONS[0]);
  const [latest, setLatest] = useState(null);
  const [spatial, setSpatial] = useState(null);
  const [spatialState, setSpatialState] = useState('idle');
  const [spatialError, setSpatialError] = useState(null);

  // Coverage: mirror first for instant render, then reconcile with server.
  const [coverage, setCoverage] = useState(() => loadMirror());
  const [coverageState, setCoverageState] = useState('idle');
  const [coverageError, setCoverageError] = useState(null);

  // -------- Load coverage from server --------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCoverageState('loading');
      try {
        const server = await coverageApi.get();
        if (cancelled) return;
        // Only treat it as set if bounds are non-null
        if (server?.bounds) {
          setCoverage(server);
          saveMirror(server);
        } else {
          setCoverage(null);
          clearMirror();
        }
        setCoverageState('success');
        setCoverageError(null);
      } catch (e) {
        if (cancelled) return;
        // Leave the mirror in place — user can still work offline.
        setCoverageState('error');
        setCoverageError(e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // -------- Forecast id resolution --------
  const activeForecast = forecast?.forecast_id ? forecast : latest;
  const forecastId = activeForecast?.forecast_id;

  useEffect(() => {
    if (forecast?.forecast_id) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await forecastService.latest();
        if (!cancelled) setLatest(data);
      } catch {
        if (!cancelled) setLatest(null);
      }
    })();
    return () => { cancelled = true; };
  }, [forecast?.forecast_id]);

  // -------- Spatial fetch --------
  useEffect(() => {
    if (!forecastId) return;
    let cancelled = false;
    (async () => {
      setSpatialState('loading');
      setSpatialError(null);
      try {
        const data = await forecastService.spatial(forecastId, horizon, 1);
        if (!cancelled) {
          setSpatial(data);
          setSpatialState('success');
        }
      } catch (e) {
        if (!cancelled) {
          setSpatialError(e);
          setSpatialState('error');
        }
      }
    })();
    return () => { cancelled = true; };
  }, [forecastId, horizon]);

  const currentHorizon = useMemo(() => {
    const list = activeForecast?.forecasts || activeForecast?.horizons || [];
    return (
      list.find((f) => (f.horizon_hours ?? f.hours) === horizon) || null
    );
  }, [activeForecast, horizon]);

  const grid = spatial?.grid || null;
  const bounds = coverage?.bounds || null;
  const peakCell = spatial?.peak_grid
    ? { y: spatial.peak_grid.y, x: spatial.peak_grid.x }
    : null;

  const resetCoverage = async () => {
    try {
      await coverageApi.clear();
    } catch {
      // fall through — we still clear the local mirror
    }
    clearMirror();
    setCoverage(null);
  };

  const runForecastNow = async () => {
    try {
      await loadSample(sampleIndex ?? 0);
      const data = await forecastService.latest();
      setLatest(data);
    } catch {}
  };

  return (
    <div className="max-w-[1500px] mx-auto px-5 py-6 space-y-5">
      <PageHeader
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Risk Map' }]}
        title="Risk Map"
        subtitle="Probability heatmap rendered on a real geographic map. The grid is placed over an operator-configured coverage area because the model has no georeferencing metadata."
        right={
          <FreshnessIndicator
            updatedAt={lastUpdated}
            intervalMs={45000}
            onRefresh={() =>
              forecastId ? loadSample(sampleIndex) : runForecastNow()
            }
            refreshing={refreshing}
          />
        }
      />

      {!forecastId && (
        <div className="panel">
          <div className="panel-hd">
            <h3 className="panel-title">Spatial probability</h3>
          </div>
          <div className="p-6">
            <EmptyState
              title="No forecast available."
              hint="Run a forecast to generate a spatial prediction, then return to this page."
            />
            <div className="flex justify-center mt-4">
              <Button onClick={runForecastNow} loading={refreshing}>
                Run Forecast Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {forecastId && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
          <section className="space-y-4">
            <div className="panel">
              <div className="panel-hd">
                <h3 className="panel-title">Horizon</h3>
                <HorizonTabs value={horizon} onChange={setHorizon} />
              </div>
            </div>

            <div className="panel">
              <div className="panel-hd">
                <h3 className="panel-title">Spatial probability</h3>
                <span className="text-2xs text-ink-faint">
                  forecast {String(forecastId).slice(-8)}
                </span>
              </div>
              <div className="p-4">
                {spatialState === 'loading' && (
                  <div className="h-[560px] flex items-center justify-center gap-3 text-ink-dim text-xs">
                    <Spinner /> Loading spatial forecast…
                  </div>
                )}

                {spatialState === 'error' && (
                  <ErrorState
                    error={spatialError}
                    onRetry={() => {
                      const h = horizon;
                      setHorizon(h === 2 ? 3 : 2);
                      setTimeout(() => setHorizon(h), 50);
                    }}
                  />
                )}

                {spatialState === 'success' && spatial && !coverage && (
                  <div className="h-[560px] flex items-center justify-center text-center px-8">
                    <div className="max-w-md space-y-2">
                      <p className="text-sm text-ink">
                        Configure coverage area first.
                      </p>
                      <p className="text-xs text-ink-dim">
                        The model grid has no built-in georeferencing. Search a
                        location and we will use its real bounding box. Saved to
                        the server so all operators see the same coverage.
                      </p>
                    </div>
                  </div>
                )}

                {spatialState === 'success' && spatial && coverage && (
                  <LeafletMap
                    bounds={bounds}
                    label="Model Grid Coordinates · placed over configured region"
                    grid={grid}
                    threshold={Number(spatial.threshold)}
                    peakCell={peakCell}
                    horizon={horizon}
                    maxProbability={Number(spatial.max_probability || 0)}
                    height={560}
                  />
                )}

                {spatialState === 'idle' && (
                  <div className="h-[560px] flex items-center justify-center text-ink-dim text-xs">
                    Waiting for forecast id…
                  </div>
                )}
              </div>
            </div>

            {spatialState === 'success' && spatial && (
              <div className="panel p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <Meta label="Horizon" value={`+${spatial.horizon_hours}h`} />
                <Meta
                  label="Dimensions"
                  value={`${spatial.width} × ${spatial.height}`}
                />
                <Meta
                  label="Threshold"
                  value={fmtNumber(spatial.threshold, 2)}
                />
                <Meta
                  label="Max prob"
                  value={fmtNumber(spatial.max_probability, 4)}
                />
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <div className="panel p-4">
              <h3 className="panel-title mb-2">Legend</h3>
              <MapLegend threshold={spatial?.threshold} />
            </div>

            <div className="panel p-4">
              <h3 className="panel-title mb-2">Peak cell</h3>
              {peakCell ? (
                <>
                  <div className="mono text-sm text-ink-hi">
                    Y {peakCell.y} · X {peakCell.x}
                  </div>
                  {currentHorizon && (
                    <div className="mt-2">
                      <RiskBadge risk={currentHorizon.risk} />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-xs text-ink-dim">Not available.</div>
              )}
            </div>

            <div className="panel p-4">
              <h3 className="panel-title mb-2">Alert cells</h3>
              <div className="mono text-sm text-ink-hi">
                {spatial?.alert_cells_count ?? spatial?.alert_cells ?? '—'}
              </div>
            </div>

            {!coverage && coverageState !== 'loading' ? (
              <CoverageBoundsForm
                onSaved={setCoverage}
                gridShape={
                  grid ? [grid.length, grid[0]?.length || 163] : [120, 163]
                }
              />
            ) : (
              <div className="panel p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="panel-title">Coverage</h3>
                  {coverageState === 'loading' && (
                    <span className="text-2xs text-ink-faint">loading…</span>
                  )}
                </div>

                {coverage ? (
                  <>
                    <div className="text-xs space-y-1.5">
                      <Row label="Label" value={coverage.label || '—'} />
                      <Row
                        label="Bounds"
                        value={
                          coverage.bounds
                            ? `[${coverage.bounds[0][0]},${coverage.bounds[0][1]}] → [${coverage.bounds[1][0]},${coverage.bounds[1][1]}]`
                            : '—'
                        }
                        mono
                      />
                      <Row
                        label="Grid"
                        value={
                          coverage.shape
                            ? `${coverage.shape[0]} × ${coverage.shape[1]}`
                            : '120 × 163'
                        }
                        mono
                      />
                      {coverage.updated_at && (
                        <Row
                          label="Updated"
                          value={fmtDateTime(coverage.updated_at)}
                        />
                      )}
                    </div>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={resetCoverage}
                      >
                        Reconfigure
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-ink-dim">
                    Coverage loading from server…
                  </div>
                )}
              </div>
            )}

            {coverageError && (
              <div className="panel p-3 text-2xs text-risk-critical border border-risk-critical/30">
                Could not load coverage from server: {coverageError.message}
                <br />
                Using local mirror if available.
              </div>
            )}

            <div className="text-2xs text-ink-faint leading-relaxed">
              Coverage is stored on the server so every operator sees the same
              region. The model itself does not emit geographic coordinates;
              placement is a display configuration.
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

const Meta = ({ label, value }) => (
  <div>
    <div className="kpi-label">{label}</div>
    <div className="mono text-ink-hi mt-1">{String(value)}</div>
  </div>
);

const Row = ({ label, value, mono }) => (
  <div className="flex items-start justify-between gap-3">
    <span className="kpi-label whitespace-nowrap">{label}</span>
    <span className={`text-ink-hi text-right ${mono ? 'mono' : ''}`}>
      {String(value)}
    </span>
  </div>
);