import { useEffect, useRef } from 'react';

const colorFor = (p, threshold) => {
  // p in [0,1]; below-threshold uses cool ramp, above uses warm ramp.
  const t = Math.max(0, Math.min(1, p));
  const isAlert = p >= threshold;
  if (!isAlert) {
    // cool: transparent → cyan
    const a = Math.round(60 * t);
    return `rgba(34, 211, 238, ${(a / 255).toFixed(3)})`;
  }
  // alert: amber → red
  const k = Math.min(1, (p - threshold) / Math.max(1e-6, 1 - threshold));
  const r = 245 + Math.round((239 - 245) * k);
  const g = 158 + Math.round((68  - 158) * k);
  const b = 11  + Math.round((68  - 11)  * k);
  const a = 90 + Math.round(120 * k);
  return `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
};

export default function GridHeatmap({ spatial, height = 400 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !spatial?.grid) return;

    const { width: W, height: H } = spatial;
    const threshold = Number(spatial.threshold ?? 0.9);

    // Determine grid dimensions from data if not given
    const grid = spatial.grid;                // 2D array [H][W]
    const rows = H ?? grid.length;
    const cols = W ?? grid[0]?.length ?? 0;
    if (!rows || !cols) return;

    // Fit canvas to container preserving aspect
    const containerW = canvas.parentElement?.clientWidth ?? 800;
    const aspect = cols / rows;
    const cw = containerW;
    const ch = Math.round(containerW / aspect);
    canvas.width = cw;
    canvas.height = ch;
    canvas.style.width = '100%';
    canvas.style.height = 'auto';

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, cw, ch);

    const cellW = cw / cols;
    const cellH = ch / rows;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const p = Number(grid[y]?.[x] ?? 0);
        ctx.fillStyle = colorFor(p, threshold);
        ctx.fillRect(x * cellW, y * cellH, Math.ceil(cellW), Math.ceil(cellH));
      }
    }

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    const stepY = Math.max(1, Math.floor(rows / 12));
    const stepX = Math.max(1, Math.floor(cols / 16));
    for (let y = 0; y <= rows; y += stepY) {
      ctx.beginPath(); ctx.moveTo(0, y * cellH); ctx.lineTo(cw, y * cellH); ctx.stroke();
    }
    for (let x = 0; x <= cols; x += stepX) {
      ctx.beginPath(); ctx.moveTo(x * cellW, 0); ctx.lineTo(x * cellW, ch); ctx.stroke();
    }

    // Peak marker
    if (spatial.peak_grid) {
      const { y, x } = spatial.peak_grid;
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      const px = x * cellW, py = y * cellH;
      ctx.strokeRect(px - 6, py - 6, cellW + 12, cellH + 12);
    }
  }, [spatial, height]);

  return (
    <div className="relative">
      <canvas ref={ref} className="block w-full bg-base-950 rounded" />
      <div className="absolute top-2 left-2 text-2xs mono text-ink-faint bg-base-950/80 border border-line rounded px-1.5 py-0.5">
        Model Grid Coordinates · Y × X
      </div>
    </div>
  );
}