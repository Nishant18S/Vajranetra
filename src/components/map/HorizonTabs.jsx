import { HORIZONS } from '../../utils/constants';

export default function HorizonTabs({ value, onChange }) {
  return (
    <div className="inline-flex border border-slate-300 rounded overflow-hidden">
      {HORIZONS.map((h) => (
        <button
          key={h}
          type="button"
          onClick={() => onChange(h)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            value === h
              ? 'bg-blue-50 text-blue-800'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          +{h}h
        </button>
      ))}
    </div>
  );
}