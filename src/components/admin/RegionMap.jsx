import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Rectangle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const locationIcon = L.divIcon({
  className: 'vn-location-marker',
  html:
    '<span style="display:block;width:20px;height:20px;border-radius:50%;' +
    'border:3px solid #dc2626;background:#fff;' +
    'box-shadow:0 0 0 4px rgba(220,38,38,0.25), 0 2px 8px rgba(0,0,0,0.35)"></span>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function Recenter({ center, bounds, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    } else if (center) {
      map.setView(center, zoom ?? 10, { animate: true });
    }
  }, [center, bounds, zoom, map]);
  return null;
}

export default function RegionMap({
  latitude,
  longitude,
  label,
  bounds,
  height = 420,
}) {
  const center = useMemo(() => {
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      return [latitude, longitude];
    }
    return [22.5, 82.5];
  }, [latitude, longitude]);

  const zoom = bounds ? 6 : 10;

  return (
    <div
      className="relative rounded overflow-hidden"
      style={{
        height,
        border: '1px solid var(--a-border)',
        background: '#eef2f7',
      }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom
        worldCopyJump
      >
        {/* Colorful terrain basemap */}
        <TileLayer
          url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
          attribution='Map data: &copy; OpenStreetMap contributors, SRTM | Style: &copy; OpenTopoMap (CC-BY-SA)'
          subdomains={['a', 'b', 'c']}
          maxZoom={17}
        />

        {/* Coverage bounding box */}
        {bounds && (
          <Rectangle
            bounds={bounds}
            pathOptions={{
              color: '#0b3d91',
              weight: 2,
              fillOpacity: 0.05,
              dashArray: '6 4',
            }}
          />
        )}

        {/* Location marker */}
        {typeof latitude === 'number' && typeof longitude === 'number' && (
          <Marker position={[latitude, longitude]} icon={locationIcon}>
            <Popup>
              <div style={{ fontSize: 12, fontFamily: 'system-ui, sans-serif' }}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>
                  {label || 'Searched location'}
                </div>
                <div style={{ fontFamily: 'monospace', color: '#475569' }}>
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        <Recenter center={center} bounds={bounds} zoom={zoom} />
      </MapContainer>
    </div>
  );
}