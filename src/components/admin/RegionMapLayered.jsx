import { useEffect, useMemo, useState } from 'react';
import {
  MapContainer, TileLayer, Marker, Popup, Rectangle, useMap,
  LayersControl, ZoomControl, useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const { BaseLayer } = LayersControl;

const TASK_LAYERS = [
  { key: 'thunderstorm', label: 'Thunderstorm', color: '#8b5cf6', icon: '⚡' },
  { key: 'cloudburst', label: 'Cloudburst', color: '#3b82f6', icon: '☁' },
  { key: 'flash_flood', label: 'Flash Flood', color: '#06b6d4', icon: '🌊' },
];

const RISK_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MODERATE: '#f59e0b',
  LOW: '#10b981',
};

const RISK_BG = {
  CRITICAL: 'rgba(239,68,68,0.18)',
  HIGH: 'rgba(249,115,22,0.16)',
  MODERATE: 'rgba(245,158,11,0.14)',
  LOW: 'rgba(16,185,129,0.12)',
};

const GRID_ROWS = 120;
const GRID_COLS = 163;

function gridToLatLon(y, x, bounds) {
  if (!bounds) return null;
  const [[south, west], [north, east]] = bounds;
  const dLat = (north - south) / GRID_ROWS;
  const dLon = (east - west) / GRID_COLS;
  return [
    south + (GRID_ROWS - 1 - y) * dLat + dLat / 2,
    west + x * dLon + dLon / 2,
  ];
}

function gridCellBounds(y, x, bounds, radius = 2) {
  if (!bounds) return null;
  const [[south, west], [north, east]] = bounds;
  const dLat = (north - south) / GRID_ROWS;
  const dLon = (east - west) / GRID_COLS;

  const y0 = Math.max(0, y - radius);
  const y1 = Math.min(GRID_ROWS - 1, y + radius);
  const x0 = Math.max(0, x - radius);
  const x1 = Math.min(GRID_COLS - 1, x + radius);

  const latTop = south + (GRID_ROWS - 1 - y0) * dLat + dLat;
  const latBot = south + (GRID_ROWS - 1 - y1) * dLat;
  const lonL = west + x0 * dLon;
  const lonR = west + x1 * dLon + dLon;

  return [[latBot, lonL], [latTop, lonR]];
}

function buildMarkerIcon(color, emoji) {
  return L.divIcon({
    className: 'vn-risk-marker',
    html: `
      <div class="vn-risk-marker__wrap">
        <span class="vn-risk-marker__ring" style="border-color:${color}"></span>
        <span class="vn-risk-marker__glow" style="background:${color}"></span>
        <span class="vn-risk-marker__dot" style="background:${color}">
          <span class="vn-risk-marker__emoji">${emoji}</span>
        </span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function LocationPinIcon() {
  return L.divIcon({
    className: 'vn-location-pin',
    html: `
      <div class="vn-location-pin__wrap">
        <span class="vn-location-pin__pulse"></span>
        <svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 0C6 0 0 6 0 13c0 9 13 21 13 21s13-12 13-21c0-7-6-13-13-13z" fill="#0ea5e9" stroke="#0b3d91" stroke-width="1.5"/>
          <circle cx="13" cy="13" r="5" fill="#fff"/>
        </svg>
      </div>
    `,
    iconSize: [26, 34],
    iconAnchor: [13, 32],
  });
}

function ClickPinIcon() {
  return L.divIcon({
    className: 'vn-click-pin',
    html: `
      <div class="vn-click-pin__wrap">
        <span class="vn-click-pin__ring"></span>
        <svg width="22" height="22" viewBox="0 0 22 22">
          <circle cx="11" cy="11" r="5" fill="rgba(14,165,233,0.35)" stroke="#0ea5e9" stroke-width="1.5"/>
          <circle cx="11" cy="11" r="2" fill="#0ea5e9"/>
        </svg>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

function ClickToInspect({ bounds, onInspect }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (bounds) {
        const [[south, west], [north, east]] = bounds;
        if (lat < south || lat > north || lng < west || lng > east) {
          return;
        }
      }
      onInspect?.(lat, lng);
    },
  });
  return null;
}

function FitBounds({ bounds, center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 9 });
    } else if (center) {
      map.setView(center, zoom ?? 9, { animate: true });
    }
  }, [bounds, center, zoom, map]);
  return null;
}

function MapButtons({ bounds, center }) {
  const map = useMap();
  return (
    <div
      className="leaflet-top leaflet-right"
      style={{ top: 10, right: 10, pointerEvents: 'none' }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
          pointerEvents: 'auto',
        }}
      >
        {bounds && (
          <button
            type="button"
            onClick={() => map.fitBounds(bounds, { padding: [40, 40], maxZoom: 9 })}
            className="vn-map-btn"
            title="Fit to coverage area"
          >
            🗺️ Fit coverage
          </button>
        )}
        {center && (
          <button
            type="button"
            onClick={() => map.setView(center, 11, { animate: true })}
            className="vn-map-btn"
            title="Zoom to searched location"
          >
            📍 Focus
          </button>
        )}
      </div>
    </div>
  );
}

export default function RegionMapLayered({
  latitude,
  longitude,
  label,
  bounds,
  tasks,
  height = 520,
  onInspect,
  clickPin,
}) {
  const [visible, setVisible] = useState({
    thunderstorm: true,
    cloudburst: true,
    flash_flood: true,
  });
  const [hovered, setHovered] = useState(false);

  const center = useMemo(() => {
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      return [latitude, longitude];
    }
    if (bounds) {
      return [
        (bounds[0][0] + bounds[1][0]) / 2,
        (bounds[0][1] + bounds[1][1]) / 2,
      ];
    }
    return [20.3, 85.8];
  }, [latitude, longitude, bounds]);

  const overlays = useMemo(() => {
    if (!tasks || !bounds) return { markers: [], rectangles: [] };
    const markers = [];
    const rectangles = [];
    for (const task of TASK_LAYERS) {
      const list = tasks[task.key];
      if (!list) continue;
      for (const h of list) {
        if (h.peak_grid_y == null || h.peak_grid_x == null) continue;
        if (h.peak_inside_coverage === false) continue;

        const latlon = gridToLatLon(h.peak_grid_y, h.peak_grid_x, bounds);
        if (!latlon) continue;

        markers.push({
          key: `${task.key}-${h.horizon_hours}-${h.peak_grid_y}-${h.peak_grid_x}`,
          taskKey: task.key,
          taskLabel: task.label,
          taskColor: task.color,
          emoji: task.icon,
          lat: latlon[0],
          lon: latlon[1],
          risk: h.risk,
          probability: h.peak_probability ?? h.probability,
          horizon_hours: h.horizon_hours,
          grid_y: h.peak_grid_y,
          grid_x: h.peak_grid_x,
          alert_cells: h.alert_cells ?? 0,
        });

        const rect = gridCellBounds(h.peak_grid_y, h.peak_grid_x, bounds, 3);
        if (rect) {
          rectangles.push({
            key: `rect-${task.key}-${h.horizon_hours}-${h.peak_grid_y}-${h.peak_grid_x}`,
            taskKey: task.key,
            color: RISK_COLORS[h.risk] || '#94a3b8',
            bounds: rect,
            risk: h.risk,
          });
        }
      }
    }
    return { markers, rectangles };
  }, [tasks, bounds]);

  const searchPin =
    typeof latitude === 'number' && typeof longitude === 'number'
      ? [latitude, longitude]
      : null;

  const counts = {
    thunderstorm: overlays.markers.filter((m) => m.taskKey === 'thunderstorm').length,
    cloudburst: overlays.markers.filter((m) => m.taskKey === 'cloudburst').length,
    flash_flood: overlays.markers.filter((m) => m.taskKey === 'flash_flood').length,
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="kpi-label mr-1">Layers</span>
        {TASK_LAYERS.map((t) => {
          const on = visible[t.key];
          const count = counts[t.key] ?? 0;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setVisible((v) => ({ ...v, [t.key]: !v[t.key] }))}
              className={`vn-layer-toggle ${on ? 'vn-layer-toggle--on' : ''}`}
              style={{ '--layer-color': t.color }}
            >
              <span className="vn-layer-toggle__dot" />
              <span>{t.label}</span>
              <span className="vn-layer-toggle__count">{count}</span>
            </button>
          );
        })}
        <span
          className="text-[11px] ml-auto flex items-center gap-1.5"
          style={{ color: 'var(--a-text-faint)' }}
        >
          <span
            className="inline-block w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: 'var(--a-accent)' }}
          />
          Click anywhere on the map to hear the AI briefing
        </span>
      </div>

      <div
        className="relative rounded overflow-hidden"
        style={{
          height,
          border: '1px solid var(--a-border)',
          cursor: hovered ? 'crosshair' : 'grab',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <style>{`
          .vn-risk-marker { background: transparent !important; border: none !important; }
          .vn-risk-marker__wrap {
            position: relative; width: 34px; height: 34px;
            display: flex; align-items: center; justify-content: center;
          }
          .vn-risk-marker__ring {
            position: absolute; width: 34px; height: 34px;
            border-radius: 9999px; border: 2.5px solid;
            animation: vnPulseRing 2s ease-out infinite;
          }
          .vn-risk-marker__glow {
            position: absolute; width: 26px; height: 26px;
            border-radius: 9999px; filter: blur(6px); opacity: 0.55;
            animation: vnGlowPulse 2.4s ease-in-out infinite;
          }
          .vn-risk-marker__dot {
            position: relative; width: 20px; height: 20px;
            border-radius: 9999px; border: 2px solid #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.45);
            display: flex; align-items: center; justify-content: center;
          }
          .vn-risk-marker__emoji { font-size: 10px; line-height: 1; }
          @keyframes vnPulseRing {
            0%   { transform: scale(.55); opacity: 1; }
            100% { transform: scale(1.9); opacity: 0; }
          }
          @keyframes vnGlowPulse {
            0%,100% { opacity: .35; transform: scale(.9); }
            50%     { opacity: .7;  transform: scale(1.1); }
          }

          .vn-location-pin { background: transparent !important; border: none !important; }
          .vn-location-pin__wrap { position: relative; display: flex; align-items: center; justify-content: center; }
          .vn-location-pin__pulse {
            position: absolute; width: 40px; height: 40px; border-radius: 9999px;
            background: rgba(14,165,233,0.35); top: -3px;
            animation: vnPinPulse 2s ease-out infinite;
          }
          @keyframes vnPinPulse {
            0%   { transform: scale(.5); opacity: .9; }
            100% { transform: scale(1.8); opacity: 0; }
          }

          .vn-click-pin { background: transparent !important; border: none !important; }
          .vn-click-pin__wrap { position: relative; display: flex; align-items: center; justify-content: center; }
          .vn-click-pin__ring {
            position: absolute; width: 30px; height: 30px; border-radius: 9999px;
            background: rgba(14,165,233,0.18);
            animation: vnClickPulse 1.6s ease-out infinite;
          }
          @keyframes vnClickPulse {
            0%   { transform: scale(.4); opacity: 1; }
            100% { transform: scale(2.2); opacity: 0; }
          }

          .vn-map-btn {
            background: #0d1425; color: #e6edf7;
            border: 1px solid #1f2a44;
            padding: 6px 10px; border-radius: 6px;
            font-size: 11px; font-weight: 600; cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.4);
            transition: background 0.15s, border-color 0.15s;
          }
          .vn-map-btn:hover {
            background: #16203a;
            border-color: rgba(34,211,238,0.5);
            color: #22d3ee;
          }

          .vn-layer-toggle {
            display: inline-flex; align-items: center; gap: 7px;
            padding: 5px 11px; border-radius: 9999px;
            font-size: 11px; font-weight: 600;
            background: transparent;
            border: 1px solid var(--a-border);
            color: var(--a-text-dim);
            cursor: pointer;
            transition: background 0.15s, color 0.15s, border-color 0.15s;
          }
          .vn-layer-toggle:hover { background: var(--a-surface-2); }
          .vn-layer-toggle--on {
            background: color-mix(in srgb, var(--layer-color) 18%, transparent);
            border-color: color-mix(in srgb, var(--layer-color) 55%, transparent);
            color: var(--layer-color);
          }
          .vn-layer-toggle__dot {
            width: 8px; height: 8px; border-radius: 9999px;
            background: var(--layer-color);
            box-shadow: 0 0 0 2px color-mix(in srgb, var(--layer-color) 30%, transparent);
          }
          .vn-layer-toggle__count {
            font-family: monospace; font-size: 10px;
            padding: 1px 6px; border-radius: 9999px;
            background: rgba(255,255,255,0.08);
            color: inherit;
          }
        `}</style>

        <MapContainer
          center={center}
          zoom={9}
          style={{ height: '100%', width: '100%', background: '#eef2f7' }}
          scrollWheelZoom
          zoomControl={false}
        >
          <ZoomControl position="topleft" />

          <LayersControl position="topright">
            <BaseLayer checked name="🌍 Satellite">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri"
                maxZoom={19}
              />
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
                opacity={0.85}
              />
            </BaseLayer>
            <BaseLayer name="🗺️ Topographic">
              <TileLayer
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap · &copy; OpenTopoMap (CC-BY-SA)'
                subdomains={['a', 'b', 'c']}
                maxZoom={17}
              />
            </BaseLayer>
            <BaseLayer name="🏙️ Streets">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
                subdomains={['a', 'b', 'c']}
                maxZoom={19}
              />
            </BaseLayer>
            <BaseLayer name="⛰️ Terrain (DEM)">
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}"
                attribution="Tiles &copy; Esri"
                maxZoom={16}
              />
            </BaseLayer>
          </LayersControl>

          {bounds && (
            <Rectangle
              bounds={bounds}
              pathOptions={{
                color: '#22d3ee',
                weight: 1.5,
                fillColor: '#22d3ee',
                fillOpacity: 0.03,
                dashArray: '6 4',
              }}
            />
          )}

          {overlays.rectangles
            .filter((r) => visible[r.taskKey])
            .map((r) => (
              <Rectangle
                key={r.key}
                bounds={r.bounds}
                pathOptions={{
                  color: r.color,
                  weight: 1,
                  fillColor: r.color,
                  fillOpacity: 0.15,
                }}
              />
            ))}

          {overlays.markers
            .filter((m) => visible[m.taskKey])
            .map((m) => (
              <Marker
                key={m.key}
                position={[m.lat, m.lon]}
                icon={buildMarkerIcon(m.taskColor, m.emoji)}
              >
                <Popup maxWidth={260}>
                  <div style={{ fontSize: 12, fontFamily: 'system-ui' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        marginBottom: 6,
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          width: 8,
                          height: 8,
                          borderRadius: 999,
                          background: m.taskColor,
                        }}
                      />
                      <strong style={{ color: m.taskColor }}>
                        {m.taskLabel}
                      </strong>
                      <span
                        style={{
                          marginLeft: 'auto',
                          background: RISK_BG[m.risk],
                          color: RISK_COLORS[m.risk],
                          padding: '1px 7px',
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        {m.risk}
                      </span>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ color: '#64748b' }}>Horizon: </span>
                      <strong>+{m.horizon_hours}h</strong>
                    </div>
                    <div style={{ marginBottom: 4 }}>
                      <span style={{ color: '#64748b' }}>Peak: </span>
                      <strong>{(m.probability * 100).toFixed(1)}%</strong>
                    </div>
                    <div
                      style={{
                        height: 5,
                        background: '#e2e8f0',
                        borderRadius: 999,
                        overflow: 'hidden',
                        marginTop: 4,
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, m.probability * 100)}%`,
                          height: '100%',
                          background: RISK_COLORS[m.risk] || '#94a3b8',
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontFamily: 'monospace',
                        fontSize: 10,
                        color: '#64748b',
                      }}
                    >
                      Cell Y{m.grid_y} · X{m.grid_x} · {m.alert_cells} alert cells
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

          {searchPin && (
            <Marker position={searchPin} icon={LocationPinIcon()}>
              <Popup maxWidth={220}>
                <div style={{ fontSize: 12 }}>
                  <strong>{label || 'Searched location'}</strong>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      color: '#64748b',
                      marginTop: 2,
                    }}
                  >
                    {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {clickPin && (
            <Marker
              position={[clickPin.lat, clickPin.lon]}
              icon={ClickPinIcon()}
            />
          )}

          {onInspect && <ClickToInspect bounds={bounds} onInspect={onInspect} />}

          <MapButtons bounds={bounds} center={searchPin} />
          <FitBounds bounds={bounds} center={center} zoom={9} />
        </MapContainer>

        <div className="vn-map-legend">
          <div className="vn-map-legend__title">Severity</div>
          <div className="vn-map-legend__row">
            {Object.entries(RISK_COLORS).map(([risk, color]) => (
              <div key={risk} className="vn-map-legend__item">
                <span
                  className="vn-map-legend__swatch"
                  style={{ background: color }}
                />
                <span className="vn-map-legend__label">{risk}</span>
              </div>
            ))}
          </div>
          <div className="vn-map-legend__title" style={{ marginTop: 8 }}>
            Tasks
          </div>
          <div className="vn-map-legend__row">
            {TASK_LAYERS.map((t) => (
              <div key={t.key} className="vn-map-legend__item">
                <span
                  className="vn-map-legend__dot"
                  style={{ background: t.color }}
                >
                  {t.icon}
                </span>
                <span className="vn-map-legend__label">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
