export default function MapLegend({ threshold }) {
  return (
    <div className="text-[11px] text-slate-600 space-y-1.5">
      <div className="flex items-center gap-2">
        <span
          className="w-4 h-3 rounded"
          style={{ background: 'rgba(34,211,238,0.35)' }}
        />
        <span>Below threshold</span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="w-4 h-3 rounded"
          style={{ background: 'rgba(249,115,22,0.7)' }}
        />
        <span>
          Above threshold{' '}
          {threshold != null ? `(≥ ${threshold})` : ''}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 border-2 border-red-500 inline-block" />
        <span>Peak cell</span>
      </div>
    </div>
  );
}