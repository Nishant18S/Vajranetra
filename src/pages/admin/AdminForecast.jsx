import { useCallback, useEffect, useState } from 'react';
import {
  PlayCircle, RefreshCw, Database, Cpu, Layers, BarChart3, MapPin,
} from 'lucide-react';
import KPITile from '../../components/admin/KPITile';
import { forecastService } from '../../services/forecastService';
import { regionService } from '../../services/regionService';
import { useSystemStatus } from '../../hooks/useSystemStatus';
import { fmtDateTime, fmtNumber } from '../../utils/formatters';

const TASKS = [
  { key: 'thunderstorm', label: 'Thunderstorm' },
  { key: 'cloudburst', label: 'Cloudburst' },
  { key: 'flash_flood', label: 'Flash Flood' },
];

export default function AdminForecast() {
  const { modelInfo, health } = useSystemStatus();

  const [sampleIndex, setSampleIndex] = useState('0');
  const [regionQuery, setRegionQuery] = useState('');
  const [regionData, setRegionData] = useState(null);
  const [regionBusy, setRegionBusy] = useState(false);
  const [regionError, setRegionError] = useState(null);

  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [runError, setRunError] = useState(null);

  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await forecastService.history({ page: 1, limit: 10 });
      setHistory(data);
    } catch {
      setHistory({ items: [], total: 0 });
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const resolveLocation = async (ev) => {
    ev?.preventDefault?.();
    if (!regionQuery.trim()) return;

    setRegionBusy(true);
    setRegionError(null);
    setRegionData(null);

    try {
      const res = await regionService.inspect({
        q: regionQuery.trim(),
        sampleIndex: Number(sampleIndex) || 0,
      });
      setRegionData(res);
      if (res.forecast_error) setRegionError(res.forecast_error);
    } catch (e) {
      setRegionError(e);
    } finally {
      setRegionBusy(false);
    }
  };

  const runInference = async (e) => {
    e.preventDefault();
    setRunning(true);
    setRunError(null);
    setRunResult(null);
    try {
      const data = await forecastService.bySample(Number(sampleIndex));
      setRunResult(data);
      loadHistory();
    } catch (err) {
      setRunError(err);
    } finally {
      setRunning(false);
    }
  };

  // Build per-horizon rows from the region inspection
  const regionHorizons = (() => {
    if (!regionData?.forecast?.tasks) return null;
    const tasks = regionData.forecast.tasks;

    // Union of horizons from whichever task is present
    const anyTask = TASKS.map((t) => tasks[t.key]).find((h) => h && h.length);
    if (!anyTask) return null;

    const coverage = regionData.coverage;
    const bounds = coverage?.bounds;

    return anyTask.map((_, i) => {
      const hours = anyTask[i].horizon_hours;

      const row = {
        horizon_hours: hours,
        tasks: {},
        highest_risk: 'LOW',
        peak_grid: null,
        peak_location: null,
        peak_inside: null,
      };

      const riskOrder = { LOW: 1, MODERATE: 2, HIGH: 3, CRITICAL: 4 };
      let highest = 'LOW';

      for (const t of TASKS) {
        const list = tasks[t.key];
        if (!list || !list[i]) continue;
        const h = list[i];

        row.tasks[t.key] = {
          risk: h.risk,
          probability: h.probability,
          threshold: h.threshold,
          alert_cells: h.alert_cells,
        };

        if (riskOrder[h.risk] > riskOrder[highest]) highest = h.risk;

        // Peak from the highest-probability task on this row
        if (!row.peak_grid && h.peak_grid_y != null) {
          row.peak_grid = { y: h.peak_grid_y, x: h.peak_grid_x };
          row.peak_probability = h.peak_probability;
        }
      }

      row.highest_risk = highest;

      // Is the peak inside the coverage box?
      if (row.peak_grid && bounds) {
        const [[south, west], [north, east]] = bounds;
        const dLat = (north - south) / 120;
        const dLon = (east - west) / 163;
        const pLat = south + (120 - 1 - row.peak_grid.y) * dLat + dLat / 2;
        const pLon = west + row.peak_grid.x * dLon + dLon / 2;
        row.peak_inside =
          pLat >= south && pLat <= north && pLon >= west && pLon <= east;
      }

      return row;
    });
  })();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-semibold" style={{ color: 'var(--a-text)' }}>
          Forecast &amp; Model
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--a-text-dim)' }}>
          Model metadata, inference controls, and recent runs.
        </p>
      </div>

      {/* Model info */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPITile
          label="Model"
          icon={Cpu}
          tone="accent"
          value={modelInfo?.model_loaded ? 'Loaded' : 'Unavailable'}
        />
        <KPITile
          label="Device"
          icon={Cpu}
          value={modelInfo?.device ?? health?.device ?? '—'}
        />
        <KPITile
          label="Input channels"
          icon={Layers}
          value={modelInfo?.input_channels ?? '—'}
        />
        <KPITile
          label="Horizons"
          icon={BarChart3}
          value={(modelInfo?.forecast_horizons || []).map((h) => `+${h}h`).join(' ')}
        />
      </section>

      {/* Focus Location */}
      <section className="vn-adm-panel">
        <div className="vn-adm-panel__hd">
          <span className="vn-adm-panel__title flex items-center gap-2">
            <MapPin size={12} /> Focus Location
          </span>
          <span
            className="text-[10px] uppercase tracking-widest"
            style={{ color: 'var(--a-text-faint)' }}
          >
            {regionData?.grid_cell
              ? `Y${regionData.grid_cell.y} · X${regionData.grid_cell.x}`
              : 'Set a location to focus the analysis'}
          </span>
        </div>
        <form onSubmit={resolveLocation} className="p-4 flex flex-wrap items-end gap-3">
          <label className="block flex-1 min-w-[220px]">
            <span className="kpi-label">Location</span>
            <input
              type="text"
              value={regionQuery}
              onChange={(e) => setRegionQuery(e.target.value)}
              placeholder="City, district, region (e.g. Bhubaneswar)"
              className="mt-1 w-full rounded px-3 py-2 text-sm"
              style={{
                background: 'var(--a-bg)',
                border: '1px solid var(--a-border)',
                color: 'var(--a-text)',
              }}
            />
          </label>
          <button
            type="submit"
            className="vn-adm-btn vn-adm-btn--outline"
            disabled={regionBusy}
          >
            {regionBusy ? 'Resolving…' : 'Set location'}
          </button>
        </form>

        {regionData?.location && (
          <div
            className="px-4 pb-4 pt-2 flex items-start gap-2 border-t"
            style={{ borderColor: 'var(--a-border-soft)' }}
          >
            <MapPin size={13} style={{ color: 'var(--a-accent)' }} className="mt-0.5" />
            <div className="text-xs">
              <div style={{ color: 'var(--a-text)' }}>
                {regionData.location.short_name || regionData.location.name}
              </div>
              <div className="mt-0.5" style={{ color: 'var(--a-text-dim)' }}>
                Lat {regionData.location.latitude?.toFixed(4)} · Lon{' '}
                {regionData.location.longitude?.toFixed(4)}
                {regionData.grid_cell && (
                  <>
                    {' · Grid '}
                    <span className="mono" style={{ color: 'var(--a-accent)' }}>
                      Y{regionData.grid_cell.y} · X{regionData.grid_cell.x}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {regionError && (
          <div className="px-4 pb-4 pt-2 text-xs" style={{ color: 'var(--a-amber)' }}>
            {typeof regionError === 'string' ? regionError : regionError.message}
          </div>
        )}
      </section>

      {/* Per-task horizon table */}
      {regionHorizons && (
        <section className="vn-adm-panel">
          <div className="vn-adm-panel__hd">
            <span className="vn-adm-panel__title">
              Horizons · sample {sampleIndex}
              {regionData?.location && (
                <span className="ml-2 text-[10px]" style={{ color: 'var(--a-text-faint)' }}>
                  ({regionData.location.short_name || regionData.location.name})
                </span>
              )}
            </span>
            <span
              className="text-[10px] uppercase tracking-widest"
              style={{ color: 'var(--a-text-faint)' }}
            >
              All 3 tasks shown per horizon
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="vn-adm-table">
              <thead>
                <tr>
                  <th rowSpan={2}>Horizon</th>
                  <th colSpan={3} style={{ textAlign: 'center' }}>Probability by task</th>
                  <th rowSpan={2}>Highest</th>
                  <th rowSpan={2}>Peak grid</th>
                  <th rowSpan={2}>Peak location</th>
                </tr>
                <tr>
                  <th style={{ textAlign: 'center' }}>Thunderstorm</th>
                  <th style={{ textAlign: 'center' }}>Cloudburst</th>
                  <th style={{ textAlign: 'center' }}>Flash Flood</th>
                </tr>
              </thead>
              <tbody>
                {regionHorizons.map((row) => (
                  <tr key={row.horizon_hours}>
                    <td className="mono">+{row.horizon_hours}h</td>
                    {TASKS.map((t) => {
                      const cell = row.tasks[t.key];
                      if (!cell) {
                        return (
                          <td key={t.key} style={{ textAlign: 'center', color: 'var(--a-text-faint)' }}>
                            —
                          </td>
                        );
                      }
                      const colorMap = {
                        CRITICAL: 'var(--a-red)',
                        HIGH: 'var(--a-orange)',
                        MODERATE: 'var(--a-amber)',
                        LOW: 'var(--a-green)',
                      };
                      return (
                        <td key={t.key} style={{ textAlign: 'center' }}>
                          <div className="mono" style={{ color: 'var(--a-text)' }}>
                            {fmtNumber(cell.probability, 4)}
                          </div>
                          <div
                            className="text-[10px] font-bold uppercase"
                            style={{ color: colorMap[cell.risk] || 'var(--a-text-dim)' }}
                          >
                            {cell.risk}
                          </div>
                        </td>
                      );
                    })}
                    <td>
                      <span
                        className={`vn-adm-badge vn-adm-badge--${(row.highest_risk || '').toLowerCase()}`}
                      >
                        {row.highest_risk}
                      </span>
                    </td>
                    <td className="mono">
                      {row.peak_grid ? `Y${row.peak_grid.y} · X${row.peak_grid.x}` : '—'}
                    </td>
                    <td>
                      <PeakLocationCell
                        y={row.peak_grid?.y}
                        x={row.peak_grid?.x}
                        insideCoverage={row.peak_inside}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Run inference */}
      <section className="vn-adm-panel">
        <div className="vn-adm-panel__hd">
          <span className="vn-adm-panel__title">Run Inference</span>
          <span
            className="text-[10px] uppercase tracking-widest"
            style={{ color: 'var(--a-text-faint)' }}
          >
            Precomputed model outputs
          </span>
        </div>
        <form onSubmit={runInference} className="p-4 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="kpi-label">Sample index</span>
            <input
              type="number"
              min={0}
              value={sampleIndex}
              onChange={(e) => setSampleIndex(e.target.value)}
              className="mt-1 w-32 rounded px-3 py-2 text-sm mono"
              style={{
                background: 'var(--a-bg)',
                border: '1px solid var(--a-border)',
                color: 'var(--a-text)',
              }}
            />
          </label>
          <button
            type="submit"
            className="vn-adm-btn vn-adm-btn--primary"
            disabled={running}
          >
            <PlayCircle size={13} /> {running ? 'Running…' : 'Run forecast'}
          </button>
          {runError && (
            <span className="text-xs" style={{ color: 'var(--a-red)' }}>
              {runError.message}
            </span>
          )}
          {runResult?.forecast_id && (
            <span className="text-xs" style={{ color: 'var(--a-green)' }}>
              Forecast ID:{' '}
              <span className="mono">{String(runResult.forecast_id).slice(-10)}</span>
            </span>
          )}
        </form>
      </section>

      {/* History */}
      <section className="vn-adm-panel">
        <div className="vn-adm-panel__hd">
          <span className="vn-adm-panel__title flex items-center gap-2">
            <Database size={12} /> Recent Forecasts
          </span>
          <button
            onClick={loadHistory}
            className="vn-adm-btn vn-adm-btn--outline"
            disabled={historyLoading}
          >
            <RefreshCw size={12} className={historyLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
        <div className="p-4">
          {historyLoading && (
            <p className="text-xs" style={{ color: 'var(--a-text-dim)' }}>
              Loading…
            </p>
          )}
          {!historyLoading && !history?.items?.length && (
            <p className="text-xs" style={{ color: 'var(--a-text-dim)' }}>
              No forecasts yet. Run inference above to create one.
            </p>
          )}
          {!historyLoading && history?.items?.length > 0 && (
            <ul className="divide-y" style={{ borderColor: 'var(--a-border-soft)' }}>
              {history.items.map((f) => (
                <li
                  key={f.forecast_id}
                  className="py-2 flex items-center justify-between text-xs"
                >
                  <span className="mono" style={{ color: 'var(--a-text-faint)' }}>
                    {String(f.forecast_id).slice(-10)}
                  </span>
                  <span className="mono" style={{ color: 'var(--a-text-dim)' }}>
                    sample {f.sample_index}
                  </span>
                  <span
                    className={`vn-adm-badge vn-adm-badge--${(f.highest_risk || '').toLowerCase()}`}
                  >
                    {f.highest_risk}
                  </span>
                  <span className="mono" style={{ color: 'var(--a-text)' }}>
                    {fmtDateTime(f.generated_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

const _placeCache = new Map();

function PeakLocationCell({ y, x, insideCoverage }) {
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (y == null || x == null) return;
    if (insideCoverage === false) return; // Don't fetch for outside-coverage cells

    const key = `${y},${x}`;
    if (_placeCache.has(key)) {
      setPlace(_placeCache.get(key));
      return;
    }

    let cancelled = false;
    setLoading(true);

    regionService
      .gridLookup(y, x)
      .then((res) => {
        if (cancelled) return;
        const label =
          res?.place?.label || res?.place?.district || res?.place?.city || null;
        _placeCache.set(key, label);
        setPlace(label);
      })
      .catch(() => {
        if (!cancelled) setPlace(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [y, x, insideCoverage]);

  if (y == null || x == null) {
    return <span className="text-[10px]" style={{ color: 'var(--a-text-faint)' }}>—</span>;
  }

  if (insideCoverage === false) {
    return (
      <span
        className="text-[10px] uppercase tracking-wider"
        style={{ color: 'var(--a-text-faint)' }}
        title="Peak cell is outside the configured coverage region"
      >
        Outside coverage
      </span>
    );
  }

  if (loading) {
    return <span className="text-[10px]" style={{ color: 'var(--a-text-faint)' }}>…</span>;
  }

  if (!place) {
    return (
      <span className="mono text-[10px]" style={{ color: 'var(--a-text-faint)' }}>
        Y{y}·X{x}
      </span>
    );
  }

  return (
    <span className="text-[11px]" style={{ color: 'var(--a-text-dim)' }}>
      {place}
    </span>
  );
}