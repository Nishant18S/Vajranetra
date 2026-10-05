import { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const peakIcon = L.divIcon({
  className: 'vn-peak-marker',
  html:
    '<span style="display:block;width:14px;height:14px;border:2px solid #ef4444;' +
    'border-radius:2px;box-shadow:0 0 0 3px rgba(239,68,68,0.30);' +
    'background:rgba(239,68,68,0.20)"></span>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

export default function PeakMarker({
  bounds,
  gridShape,
  peakCell,
  horizon,
  probability,
}) {
  const position = useMemo(() => {
    if (!bounds || !gridShape || !peakCell) return null;
    const [rows, cols] = gridShape;
    const [[south, west], [north, east]] = bounds;

    const dLat = (north - south) / rows;
    const dLon = (east - west) / cols;

    const lat = south + (rows - 1 - peakCell.y) * dLat + dLat / 2;
    const lon = west + peakCell.x * dLon + dLon / 2;
    return [lat, lon];
  }, [bounds, gridShape, peakCell]);

  if (!position) return null;

  return (
    <Marker position={position} icon={peakIcon}>
      <Popup>
        <div style={{ fontSize: 11 }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Peak cell</div>
          <div style={{ fontFamily: 'monospace' }}>
            Y {peakCell.y} · X {peakCell.x}
          </div>
          <div style={{ fontFamily: 'monospace' }}>
            +{horizon}h · p = {Number(probability).toFixed(4)}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}