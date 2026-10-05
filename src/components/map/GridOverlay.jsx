import { useMemo } from 'react';
import { Rectangle } from 'react-leaflet';

function colorFor(p, threshold) {
  const t = Math.max(0, Math.min(1, p));
  if (p < threshold) {
    const a = Math.round(90 * t);
    return `rgba(34, 211, 238, ${(a / 255).toFixed(3)})`;
  }
  const k = Math.min(1, (p - threshold) / Math.max(1e-6, 1 - threshold));
  const r = 245 + Math.round((239 - 245) * k);
  const g = 158 + Math.round((68 - 158) * k);
  const b = 11 + Math.round((68 - 11) * k);
  const a = 130 + Math.round(110 * k);
  return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
}

function downsampleMax(grid, rows, cols, targetRows, targetCols) {
  const out = [];
  const rStride = rows / targetRows;
  const cStride = cols / targetCols;
  for (let y = 0; y < targetRows; y++) {
    const rowOut = [];
    for (let x = 0; x < targetCols; x++) {
      let max = 0;
      const y0 = Math.floor(y * rStride);
      const y1 = Math.min(rows, Math.ceil((y + 1) * rStride));
      const x0 = Math.floor(x * cStride);
      const x1 = Math.min(cols, Math.ceil((x + 1) * cStride));
      for (let yy = y0; yy < y1; yy++) {
        for (let xx = x0; xx < x1; xx++) {
          const v = grid[yy]?.[xx] ?? 0;
          if (v > max) max = v;
        }
      }
      rowOut.push(max);
    }
    out.push(rowOut);
  }
  return { grid: out, rows: targetRows, cols: targetCols };
}

export default function GridOverlay({
  grid,
  bounds,
  threshold = 0.9,
  targetRows = 40,
  targetCols = 55,
}) {
  const cells = useMemo(() => {
    if (!grid || !bounds) return [];

    const rawRows = grid.length;
    const rawCols = grid[0]?.length ?? 0;
    if (!rawRows || !rawCols) return [];

    const { grid: small, rows, cols } = downsampleMax(
      grid,
      rawRows,
      rawCols,
      targetRows,
      targetCols
    );

    const [[south, west], [north, east]] = bounds;
    const dLat = (north - south) / rows;
    const dLon = (east - west) / cols;

    const rects = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const p = small[y][x];
        const latTop = south + (rows - 1 - y) * dLat;
        const latBot = latTop + dLat;
        const lonL = west + x * dLon;
        const lonR = lonL + dLon;
        rects.push({
          key: `${y}-${x}`,
          bounds: [[latTop, lonL], [latBot, lonR]],
          color: colorFor(p, threshold),
        });
      }
    }
    return rects;
  }, [grid, bounds, threshold, targetRows, targetCols]);

  if (!cells.length) return null;

  return (
    <>
      {cells.map((c) => (
        <Rectangle
          key={c.key}
          bounds={c.bounds}
          pathOptions={{
            color: c.color,
            fillColor: c.color,
            fillOpacity: 0.75,
            weight: 0,
            stroke: false,
            interactive: false,
          }}
        />
      ))}
    </>
  );
}