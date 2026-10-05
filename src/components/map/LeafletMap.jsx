import { useEffect } from 'react';
import { MapContainer, TileLayer, Rectangle, useMap } from 'react-leaflet';
import GridOverlay from './GridOverlay';
import PeakMarker from './PeakMarker';

function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (!bounds) return;
    map.fitBounds(bounds, { padding: [20, 20] });
  }, [bounds, map]);
  return null;
}

export default function LeafletMap({
  bounds,
  label,
  grid,
  threshold = 0.9,
  peakCell,
  horizon = 2,
  maxProbability = 0,
  height = 560,
}) {
  const center = bounds
    ? [(bounds[0][0] + bounds[1][0]) / 2, (bounds[0][1] + bounds[1][1]) / 2]
    : [22.5, 82.5];

  const zoom = bounds ? 6 : 4;

  return (
    <div
      className="relative rounded overflow-hidden border border-slate-200"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', background: '#0a0f1c' }}
        scrollWheelZoom
        worldCopyJump
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics"
          maxZoom={19}
        />
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          attribution="Labels &copy; Esri"
          maxZoom={19}
          opacity={0.9}
        />

        {bounds && (
          <Rectangle
            bounds={bounds}
            pathOptions={{
              color: '#22d3ee',
              weight: 1.5,
              fillOpacity: 0,
              dashArray: '4 4',
            }}
          />
        )}

        {bounds && grid && (
          <GridOverlay grid={grid} bounds={bounds} threshold={threshold} />
        )}

        {bounds && peakCell && (
          <PeakMarker
            bounds={bounds}
            gridShape={[grid?.length || 120, grid?.[0]?.length || 163]}
            peakCell={peakCell}
            horizon={horizon}
            probability={maxProbability}
          />
        )}

        <FitBounds bounds={bounds} />
      </MapContainer>

      {label && (
        <div className="absolute top-2 left-2 z-[1000] text-[11px] font-mono text-slate-200 bg-slate-900/85 border border-slate-700 rounded px-1.5 py-0.5">
          {label}
        </div>
      )}
    </div>
  );
}