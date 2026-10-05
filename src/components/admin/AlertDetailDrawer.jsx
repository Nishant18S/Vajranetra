import { useEffect, useMemo, useState } from 'react';
import {
  X, AlertTriangle, CheckCircle2, Send, FileText, MapPin,
} from 'lucide-react';
import {
  MapContainer, TileLayer, Marker, Popup, Rectangle, useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { alertService } from '../../services/alertService';
import { regionService } from '../../services/regionService';
import { forecastService } from '../../services/forecastService';
import { fmtDateTime, fmtNumber } from '../../utils/formatters';

const SEV_CLASS = {
  CRITICAL: 'vn-adm-badge vn-adm-badge--critical',
  HIGH: 'vn-adm-badge vn-adm-badge--high',
  MODERATE: 'vn-adm-badge vn-adm-badge--moderate',
  LOW: 'vn-adm-badge vn-adm-badge--low',
};

const SEV_COLOR = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MODERATE: '#f59e0b',
  LOW: '#10b981',
};

const GRID_ROWS = 120;
const GRID_COLS = 163;

const locationIcon = (severity) => {
  const color = SEV_COLOR[severity] || '#22d3ee';
  return L.divIcon({
    className: 'vn-alert-marker',
    html:
      `<span style="display:block;width:22px;height:22px;border-radius:50%;` +
      `border:3px solid ${color};background:rgba(255,255,255,0.9);` +
      `box-shadow:0 0 0 5px ${color}40, 0 2px 10px rgba(0,0,0,0.4)"></span>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
};

function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 11, { animate: true });
    }
  }, [center, map]);
  return null;
}

/**
 * Convert a grid cell + coverage bounds into a geographic rectangle.
 */
function gridCellToBounds(gridY, gridX, bounds, cellRadius = 3) {
  if (!bounds) return null;
  const [[south, west], [north, east]] = bounds;

  const dLat = (north - south) / GRID_ROWS;
  const dLon = (east - west) / GRID_COLS;

  const y0 = Math.max(0, gridY - cellRadius);
  const y1 = Math.min(GRID_ROWS - 1, gridY + cellRadius);
  const x0 = Math.max(0, gridX - cellRadius);
  const x1 = Math.min(GRID_COLS - 1, gridX + cellRadius);

  const latTop = south + (GRID_ROWS - 1 - y0) * dLat + dLat;
  const latBot = south + (GRID_ROWS - 1 - y1) * dLat;
  const lonL = west + x0 * dLon;
  const lonR = west + x1 * dLon + dLon;

  return [[latBot, lonL], [latTop, lonR]];
}

export default function AlertDetailDrawer({ alert, user, onClose, onChanged }) {
  const [mode, setMode] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Location resolution
  const [place, setPlace] = useState(null);
  const [coords, setCoords] = useState(null);
  const [coverage, setCoverage] = useState(null);
  const [placeLoading, setPlaceLoading] = useState(false);

  // Affected-zone data (top-K cells + cell count from the forecast's spatial grid)
  const [zoneBounds, setZoneBounds] = useState(null);
  const [alertCellCount, setAlertCellCount] = useState(null);
  const [zoneLoading, setZoneLoading] = useState(false);

  if (!alert) return null;

  const id = alert.alert_id || alert._id;
  const sev = (alert.severity || '').toUpperCase();
  const status = (alert.status || '').toUpperCase();
  const gridY = alert.grid_y;
  const gridX = alert.grid_x;

  // ─── Resolve grid cell → coordinates + place ───
  useEffect(() => {
    if (gridY == null || gridX == null) return;
    let cancelled = false;

    setPlaceLoading(true);
    regionService
      .gridLookup(gridY, gridX)
      .then((res) => {
        if (cancelled) return;
        if (res?.latitude != null && res?.longitude != null) {
          setCoords({ lat: res.latitude, lon: res.longitude });
        }
        if (res?.place) setPlace(res.place);
        // Coverage bounds come back on some responses
        if (res?.coverage_label) setCoverage({ label: res.coverage_label });
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setPlaceLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [gridY, gridX]);

  // ─── Fetch coverage bounds for zone rectangle ───
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await (await import('../../services/api')).default.get(
          '/settings/coverage'
        );
        if (!cancelled && data?.bounds) {
          setCoverage((prev) => ({ ...(prev || {}), bounds: data.bounds, label: data.label }));
        }
      } catch {
        // ignore — zone rectangle just won't draw
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ─── Compute zone bounds from coverage + grid cell ───
  useEffect(() => {
    if (!coverage?.bounds || gridY == null || gridX == null) return;
    const b = gridCellToBounds(gridY, gridX, coverage.bounds, 4);
    setZoneBounds(b);
  }, [coverage, gridY, gridX]);

  // ─── Optionally fetch the spatial grid to show alert cells ───
  useEffect(() => {
    if (!alert.forecast_id || alert.horizon_hours == null) return;
    let cancelled = false;
    setZoneLoading(true);
    (async () => {
      try {
        const data = await forecastService.spatial(
          alert.forecast_id,
          alert.horizon_hours,
          1
        );
        if (cancelled) return;
        if (data?.alert_cells_count != null) {
          setAlertCellCount(data.alert_cells_count);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setZoneLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [alert.forecast_id, alert.horizon_hours]);

  const resolvedCenter = useMemo(() => {
    if (coords) return [coords.lat, coords.lon];
    return null;
  }, [coords]);

  const close = () => {
    setMode(null);
    setError(null);
    onClose?.();
  };

  // ─────────────────────────────────────────────
  // Action handlers — with pre-flight validation
  // ─────────────────────────────────────────────

  const handleAck = async (notes) => {
    setBusy(true);
    setError(null);
    try {
      await alertService.acknowledge(id, {
        acknowledged_by: user?.email || 'authority',
        notes,
      });
      onChanged?.();
      close();
    } catch (e) {
      setError(e.message || 'Failed to acknowledge');
    } finally {
      setBusy(false);
    }
  };

  const handleDispatch = async (payload) => {
    // ─── Client-side validation matching backend DispatchRequest ───
    const title = (payload.title || '').trim();
    const description = (payload.description || '').trim();
    const actionAdvice = (payload.action_advice || '').trim();

    if (title.length < 4) {
      setError('Title must be at least 4 characters.');
      return;
    }
    if (description.length < 10) {
      setError(`Description must be at least 10 characters (currently ${description.length}).`);
      return;
    }
    if (actionAdvice.length < 4) {
      setError('Action advice must be at least 4 characters.');
      return;
    }
    if (!payload.valid_until) {
      setError('Please set a validity end time.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await alertService.dispatch(id, {
        dispatched_by: user?.email || 'authority',
        title,
        description,
        action_advice: actionAdvice,
        valid_until: payload.valid_until,
      });
      onChanged?.();
      close();
    } catch (e) {
      setError(e.message || 'Failed to dispatch');
    } finally {
      setBusy(false);
    }
  };

  const handleResolve = async (notes) => {
    setBusy(true);
    setError(null);
    try {
      await alertService.resolve(id, {
        resolved_by: user?.email || 'authority',
        notes,
      });
      onChanged?.();
      close();
    } catch (e) {
      setError(e.message || 'Failed to resolve');
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 z-30"
        style={{ background: 'rgba(0,0,0,0.55)' }}
        onClick={close}
        aria-hidden="true"
      />
      <aside
        className="fixed top-0 right-0 h-full z-40 overflow-y-auto"
        style={{
          width: 'min(560px, 100vw)',
          background: 'var(--a-surface)',
          borderLeft: '1px solid var(--a-border)',
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between"
          style={{
            background: 'var(--a-surface)',
            borderBottom: '1px solid var(--a-border)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className={SEV_CLASS[sev] || 'vn-adm-badge'}>
              {sev || 'UNKNOWN'}
            </span>
            <span
              className="text-xs uppercase tracking-widest"
              style={{ color: 'var(--a-text-faint)' }}
            >
              {status}
            </span>
          </div>
          <button
            type="button"
            onClick={close}
            className="vn-admin__hamburger"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-5">
          <div>
            <h2 className="text-base font-semibold" style={{ color: 'var(--a-text)' }}>
              {alert.title || `+${alert.horizon_hours}h weather warning`}
            </h2>
            <div
              className="text-[11px] mt-1 mono"
              style={{ color: 'var(--a-text-faint)' }}
            >
              ID {String(id).slice(-12)} ·{' '}
              {alert.source === 'MANUAL' ? 'Officer-issued' : 'Model-generated'}
            </div>
          </div>

          {/* ─── Map with zone overlay ─── */}
          <div>
            <div className="kpi-label mb-2 flex items-center gap-2">
              <MapPin size={11} /> Location &amp; Affected Zone
            </div>

            {gridY != null && gridX != null && resolvedCenter ? (
              <div
                className="rounded overflow-hidden"
                style={{ border: '1px solid var(--a-border)', height: 260 }}
              >
                <MapContainer
                  center={resolvedCenter}
                  zoom={11}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                    subdomains={['a', 'b', 'c']}
                    maxZoom={19}
                  />

                  {/* Coverage area */}
                  {coverage?.bounds && (
                    <Rectangle
                      bounds={coverage.bounds}
                      pathOptions={{
                        color: '#22d3ee',
                        weight: 1,
                        fillOpacity: 0,
                        dashArray: '4 4',
                      }}
                    />
                  )}

                  {/* Affected zone — a small rectangle centered on the peak cell */}
                  {zoneBounds && (
                    <Rectangle
                      bounds={zoneBounds}
                      pathOptions={{
                        color: SEV_COLOR[sev] || '#ef4444',
                        weight: 2,
                        fillColor: SEV_COLOR[sev] || '#ef4444',
                        fillOpacity: 0.15,
                      }}
                    />
                  )}

                  {/* Peak cell marker */}
                  <Marker position={resolvedCenter} icon={locationIcon(sev)}>
                    <Popup>
                      <div style={{ fontSize: 12 }}>
                        <div style={{ fontWeight: 700, marginBottom: 2 }}>
                          {place?.label || 'Alert location'}
                        </div>
                        <div style={{ fontFamily: 'monospace', color: '#475569' }}>
                          Y{gridY} · X{gridX}
                        </div>
                        {place?.state && (
                          <div style={{ color: '#64748b', marginTop: 2 }}>
                            {place.state}
                            {place.country ? `, ${place.country}` : ''}
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>

                  <Recenter center={resolvedCenter} />
                </MapContainer>
              </div>
            ) : (
              <div
                className="rounded p-3 text-xs"
                style={{
                  background: 'var(--a-surface-2)',
                  border: '1px solid var(--a-border)',
                  color: 'var(--a-text-dim)',
                }}
              >
                {placeLoading
                  ? 'Resolving location…'
                  : gridY != null && gridX != null
                  ? 'Coordinates unavailable — configure coverage area on the Risk Map page.'
                  : 'No grid coordinates for this alert.'}
              </div>
            )}

            {/* Zone legend */}
            {zoneBounds && (
              <div
                className="mt-2 text-[11px] flex items-center gap-3 flex-wrap"
                style={{ color: 'var(--a-text-dim)' }}
              >
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="inline-block w-3 h-3 rounded"
                    style={{
                      background: `${SEV_COLOR[sev]}30`,
                      border: `1.5px solid ${SEV_COLOR[sev]}`,
                    }}
                  />
                  Affected zone
                </span>
                {alertCellCount != null && (
                  <span className="mono">
                    {alertCellCount.toLocaleString()} alert cells over threshold
                  </span>
                )}
                {zoneLoading && <span style={{ color: 'var(--a-text-faint)' }}>· loading…</span>}
              </div>
            )}

            {/* Location caption */}
            {(place || (gridY != null && gridX != null)) && (
              <div
                className="text-[11px] mt-2 flex items-center gap-2 flex-wrap"
                style={{ color: 'var(--a-text-dim)' }}
              >
                <MapPin size={11} />
                {place?.label ? (
                  <span style={{ color: 'var(--a-text)' }}>
                    {place.label}
                    {place.state && `, ${place.state}`}
                  </span>
                ) : (
                  <span className="mono">
                    Grid Y{gridY} · X{gridX}
                  </span>
                )}
                {gridY != null && gridX != null && (
                  <span className="mono" style={{ color: 'var(--a-text-faint)' }}>
                    Y{gridY} · X{gridX}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ─── Meta grid ─── */}
          <div className="grid grid-cols-2 gap-3">
            <Meta
              label="Horizon"
              value={alert.horizon_hours != null ? `+${alert.horizon_hours}h` : '—'}
            />
            <Meta
              label="Probability"
              value={
                alert.probability != null
                  ? fmtNumber(alert.probability, 4)
                  : '—'
              }
            />
            <Meta
              label="Threshold"
              value={alert.threshold != null ? fmtNumber(alert.threshold, 2) : '—'}
            />
            <Meta
              label="Alert cells"
              value={alert.alert_cells ?? '—'}
            />
            <Meta
              label="Region"
              value={
                alert.region?.district
                  ? `${alert.region.district}, ${alert.region.state || ''}`
                  : '—'
              }
            />
            <Meta
              label="Source"
              value={alert.source === 'MANUAL' ? 'Officer' : 'Model'}
            />
          </div>

          {alert.description && (
            <Section title="Description">
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--a-text-mid)' }}
              >
                {alert.description}
              </p>
            </Section>
          )}
          {alert.action_advice && (
            <Section title="Action advice">
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--a-text-mid)' }}
              >
                {alert.action_advice}
              </p>
            </Section>
          )}

          {/* ─── Timeline ─── */}
          <Section title="Timeline">
            <ul
              className="text-xs space-y-1.5"
              style={{ color: 'var(--a-text-mid)' }}
            >
              <li className="flex justify-between">
                <span>Created</span>
                <span className="mono">{fmtDateTime(alert.created_at)}</span>
              </li>
              {alert.acknowledged_at && (
                <li className="flex justify-between">
                  <span>Acknowledged by {alert.acknowledged_by}</span>
                  <span className="mono">{fmtDateTime(alert.acknowledged_at)}</span>
                </li>
              )}
              {alert.dispatched_at && (
                <li className="flex justify-between">
                  <span>Dispatched by {alert.dispatched_by}</span>
                  <span className="mono">{fmtDateTime(alert.dispatched_at)}</span>
                </li>
              )}
              {alert.resolved_at && (
                <li className="flex justify-between">
                  <span>Resolved by {alert.resolved_by}</span>
                  <span className="mono">{fmtDateTime(alert.resolved_at)}</span>
                </li>
              )}
              {alert.valid_until && (
                <li className="flex justify-between">
                  <span>Valid until</span>
                  <span className="mono">{fmtDateTime(alert.valid_until)}</span>
                </li>
              )}
            </ul>
          </Section>

          {/* ─── Error banner ─── */}
          {error && (
            <div
              className="flex items-start gap-2 rounded p-3"
              style={{
                background: 'rgba(239,68,68,0.10)',
                border: '1px solid rgba(239,68,68,0.45)',
              }}
            >
              <AlertTriangle
                size={14}
                style={{ color: 'var(--a-red)' }}
                className="mt-0.5 shrink-0"
              />
              <p className="text-xs leading-relaxed" style={{ color: 'var(--a-red)' }}>
                {error}
              </p>
            </div>
          )}

          {/* ─── Action forms ─── */}
          {mode === 'ack' && (
            <AckForm busy={busy} onCancel={() => setMode(null)} onSubmit={handleAck} />
          )}
          {mode === 'dispatch' && (
            <DispatchForm
              alert={alert}
              busy={busy}
              onCancel={() => setMode(null)}
              onSubmit={handleDispatch}
            />
          )}
          {mode === 'resolve' && (
            <ResolveForm
              busy={busy}
              onCancel={() => setMode(null)}
              onSubmit={handleResolve}
            />
          )}
        </div>

        {/* Sticky actions */}
        {!mode && (
          <div
            className="sticky bottom-0 px-5 py-3 flex items-center justify-end gap-2"
            style={{
              background: 'var(--a-surface)',
              borderTop: '1px solid var(--a-border)',
            }}
          >
            {status === 'ACTIVE' && (
              <>
                <button
                  type="button"
                  className="vn-adm-btn vn-adm-btn--outline"
                  onClick={() => {
                    setError(null);
                    setMode('ack');
                  }}
                >
                  <FileText size={13} /> Acknowledge
                </button>
                <button
                  type="button"
                  className="vn-adm-btn vn-adm-btn--primary"
                  onClick={() => {
                    setError(null);
                    setMode('dispatch');
                  }}
                >
                  <Send size={13} /> Dispatch
                </button>
              </>
            )}
            {status === 'ACKNOWLEDGED' && (
              <>
                <button
                  type="button"
                  className="vn-adm-btn vn-adm-btn--outline"
                  onClick={() => {
                    setError(null);
                    setMode('resolve');
                  }}
                >
                  <CheckCircle2 size={13} /> Resolve
                </button>
                <button
                  type="button"
                  className="vn-adm-btn vn-adm-btn--primary"
                  onClick={() => {
                    setError(null);
                    setMode('dispatch');
                  }}
                >
                  <Send size={13} /> Dispatch
                </button>
              </>
            )}
            {status === 'DISPATCHED' && (
              <button
                type="button"
                className="vn-adm-btn vn-adm-btn--outline"
                onClick={() => {
                  setError(null);
                  setMode('resolve');
                }}
              >
                <CheckCircle2 size={13} /> Resolve
              </button>
            )}
            {(status === 'RESOLVED' || status === 'EXPIRED') && (
              <span className="text-xs" style={{ color: 'var(--a-text-faint)' }}>
                No further action.
              </span>
            )}
          </div>
        )}
      </aside>
    </>
  );
}

/* ─────────────────────────────────────────────────────────── */

function Meta({ label, value }) {
  return (
    <div>
      <div className="kpi-label">{label}</div>
      <div className="text-sm mono mt-0.5" style={{ color: 'var(--a-text)' }}>
        {String(value)}
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className="kpi-label mb-2">{title}</div>
      {children}
    </div>
  );
}

function AckForm({ busy, onCancel, onSubmit }) {
  const [notes, setNotes] = useState('');
  return (
    <div
      className="rounded p-4 space-y-3"
      style={{
        background: 'var(--a-surface-2)',
        border: '1px solid var(--a-border)',
      }}
    >
      <div className="text-sm font-semibold" style={{ color: 'var(--a-text)' }}>
        Acknowledge alert
      </div>
      <label className="block">
        <span className="kpi-label">Notes (optional)</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="e.g. Confirmed with radar. Monitoring."
          className="mt-1 w-full rounded px-3 py-2 text-sm"
          style={{
            background: 'var(--a-bg)',
            border: '1px solid var(--a-border)',
            color: 'var(--a-text)',
          }}
        />
      </label>
      <div className="flex justify-end gap-2">
        <button type="button" className="vn-adm-btn vn-adm-btn--outline" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="vn-adm-btn vn-adm-btn--primary"
          disabled={busy}
          onClick={() => onSubmit(notes)}
        >
          {busy ? 'Saving…' : 'Confirm acknowledge'}
        </button>
      </div>
    </div>
  );
}

function DispatchForm({ alert, busy, onCancel, onSubmit }) {
  const [title, setTitle] = useState(alert.title || '');
  const [description, setDescription] = useState(alert.description || '');
  const [actionAdvice, setActionAdvice] = useState(alert.action_advice || '');
  const defaultValid = new Date(Date.now() + 6 * 3600 * 1000);
  const [validUntil, setValidUntil] = useState(
    defaultValid.toISOString().slice(0, 16)
  );

  // Live character counters so the officer can see when they meet the minimum
  const titleLen = title.trim().length;
  const descLen = description.trim().length;
  const adviceLen = actionAdvice.trim().length;

  const titleOk = titleLen >= 4;
  const descOk = descLen >= 10;
  const adviceOk = adviceLen >= 4;
  const allOk = titleOk && descOk && adviceOk;

  const handleSubmit = () => {
    if (!allOk) return;
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      action_advice: actionAdvice.trim(),
      valid_until: new Date(validUntil).toISOString(),
    });
  };

  return (
    <div
      className="rounded p-4 space-y-3"
      style={{
        background: 'var(--a-surface-2)',
        border: '1px solid var(--a-border)',
      }}
    >
      <div className="text-sm font-semibold" style={{ color: 'var(--a-text)' }}>
        Dispatch public warning
      </div>
      <p className="text-[11px]" style={{ color: 'var(--a-text-faint)' }}>
        This will publish the alert to citizens in the matching region.
      </p>

      <label className="block">
        <span className="kpi-label flex justify-between">
          <span>Title</span>
          <span
            className="mono"
            style={{
              color: titleOk ? 'var(--a-green)' : 'var(--a-amber)',
            }}
          >
            {titleLen} / 4 min
          </span>
        </span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Heavy Rainfall Warning"
          className="mt-1 w-full rounded px-3 py-2 text-sm"
          style={{
            background: 'var(--a-bg)',
            border: `1px solid ${titleOk ? 'var(--a-border)' : 'var(--a-amber)'}`,
            color: 'var(--a-text)',
          }}
        />
      </label>

      <label className="block">
        <span className="kpi-label flex justify-between">
          <span>Public description</span>
          <span
            className="mono"
            style={{
              color: descOk ? 'var(--a-green)' : 'var(--a-amber)',
            }}
          >
            {descLen} / 10 min
          </span>
        </span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="What is expected — plain language, no jargon."
          className="mt-1 w-full rounded px-3 py-2 text-sm"
          style={{
            background: 'var(--a-bg)',
            border: `1px solid ${descOk ? 'var(--a-border)' : 'var(--a-amber)'}`,
            color: 'var(--a-text)',
          }}
        />
      </label>

      <label className="block">
        <span className="kpi-label flex justify-between">
          <span>Action advice</span>
          <span
            className="mono"
            style={{
              color: adviceOk ? 'var(--a-green)' : 'var(--a-amber)',
            }}
          >
            {adviceLen} / 4 min
          </span>
        </span>
        <textarea
          value={actionAdvice}
          onChange={(e) => setActionAdvice(e.target.value)}
          rows={2}
          placeholder="What citizens should do."
          className="mt-1 w-full rounded px-3 py-2 text-sm"
          style={{
            background: 'var(--a-bg)',
            border: `1px solid ${adviceOk ? 'var(--a-border)' : 'var(--a-amber)'}`,
            color: 'var(--a-text)',
          }}
        />
      </label>

      <label className="block">
        <span className="kpi-label">Valid until</span>
        <input
          type="datetime-local"
          value={validUntil}
          onChange={(e) => setValidUntil(e.target.value)}
          className="mt-1 w-full rounded px-3 py-2 text-sm"
          style={{
            background: 'var(--a-bg)',
            border: '1px solid var(--a-border)',
            color: 'var(--a-text)',
            colorScheme: 'dark',
          }}
        />
      </label>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          className="vn-adm-btn vn-adm-btn--outline"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className="vn-adm-btn vn-adm-btn--primary"
          disabled={busy || !allOk}
          onClick={handleSubmit}
          title={!allOk ? 'Fill in all required fields with minimum lengths.' : ''}
        >
          {busy ? 'Dispatching…' : 'Dispatch to public'}
        </button>
      </div>
    </div>
  );
}

function ResolveForm({ busy, onCancel, onSubmit }) {
  const [notes, setNotes] = useState('');
  return (
    <div
      className="rounded p-4 space-y-3"
      style={{
        background: 'var(--a-surface-2)',
        border: '1px solid var(--a-border)',
      }}
    >
      <div className="text-sm font-semibold" style={{ color: 'var(--a-text)' }}>
        Resolve alert
      </div>
      <label className="block">
        <span className="kpi-label">Outcome / notes</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="e.g. Situation cleared. No casualties."
          className="mt-1 w-full rounded px-3 py-2 text-sm"
          style={{
            background: 'var(--a-bg)',
            border: '1px solid var(--a-border)',
            color: 'var(--a-text)',
          }}
        />
      </label>
      <div className="flex justify-end gap-2">
        <button type="button" className="vn-adm-btn vn-adm-btn--outline" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="vn-adm-btn vn-adm-btn--primary"
          disabled={busy}
          onClick={() => onSubmit(notes)}
        >
          {busy ? 'Resolving…' : 'Mark resolved'}
        </button>
      </div>
    </div>
  );
}