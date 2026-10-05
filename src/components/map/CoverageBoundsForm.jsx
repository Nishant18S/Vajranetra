import { useState } from 'react';
import { ChevronDown, ChevronRight, MapPin, Save } from 'lucide-react';
import Button from '../common/Button';
import LocationSearch from './LocationSearch';
import { coverageApi, saveMirror } from '../../utils/coverage';

export default function CoverageBoundsForm({ onSaved, gridShape = [120, 163] }) {
  const [label, setLabel] = useState('');
  const [south, setSouth] = useState('20.0');
  const [west, setWest] = useState('85.0');
  const [north, setNorth] = useState('25.0');
  const [east, setEast] = useState('90.0');
  const [showManual, setShowManual] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const applySearchResult = (r) => {
    setLabel(r.shortName);
    setSouth(String(r.bounds[0][0]));
    setWest(String(r.bounds[0][1]));
    setNorth(String(r.bounds[1][0]));
    setEast(String(r.bounds[1][1]));
  };

  const submit = async (ev) => {
    ev.preventDefault();
    setBusy(true);
    setError(null);

    const bounds = [
      [parseFloat(south), parseFloat(west)],
      [parseFloat(north), parseFloat(east)],
    ];
    const payload = {
      label: label || 'Model coverage area',
      bounds,
      shape: gridShape,
      source: label ? 'search-or-manual' : 'manual',
    };

    try {
      const saved = await coverageApi.set(payload);
      saveMirror({
        label: saved.label,
        bounds: saved.bounds,
        shape: saved.shape,
        source: saved.source,
        updated_at: saved.updated_at,
      });
      onSaved?.(saved);
    } catch (e) {
      // Fallback to local mirror
      saveMirror(payload);
      onSaved?.(payload);
      setError(
        `${
          e.message || 'Could not save to server.'
        } Saved locally only — it will not be visible to other devices.`
      );
    } finally {
      setBusy(false);
    }
  };

  const boundsValid =
    !Number.isNaN(parseFloat(south)) &&
    !Number.isNaN(parseFloat(west)) &&
    !Number.isNaN(parseFloat(north)) &&
    !Number.isNaN(parseFloat(east));

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-slate-800">
          Configure map coverage
        </h3>
        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
          The model grid has no georeferencing. Search a location and we use its
          real bounding box, or enter bounds manually. Saved to the server so all
          devices see the same coverage.
        </p>
      </div>

      <LocationSearch onSelect={applySearchResult} />

      {label && boundsValid && (
        <div className="border border-slate-200 rounded p-2.5 bg-slate-50">
          <div className="flex items-start gap-2">
            <MapPin size={13} className="text-blue-700 mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs text-slate-800 truncate">{label}</div>
              <div className="text-[11px] text-slate-500 font-mono">
                [{south}, {west}] → [{north}, {east}]
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setShowManual((v) => !v)}
        className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-blue-700"
      >
        {showManual ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        Advanced — enter bounds manually
      </button>

      {showManual && (
        <div className="space-y-3 border-t border-slate-200 pt-3">
          <label className="block text-xs">
            <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
              Region label
            </span>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Eastern Ghats pilot region"
              className="mt-1 w-full rounded border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <Num label="South lat" value={south} onChange={setSouth} />
            <Num label="West lon" value={west} onChange={setWest} />
            <Num label="North lat" value={north} onChange={setNorth} />
            <Num label="East lon" value={east} onChange={setEast} />
          </div>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-red-600 leading-relaxed">{error}</p>
      )}

      <div className="flex justify-between items-center pt-1">
        <span className="text-[11px] text-slate-500">
          Grid: {gridShape[0]} × {gridShape[1]}
        </span>
        <Button type="submit" size="sm" disabled={!boundsValid} loading={busy}>
          <Save size={12} /> Save coverage
        </Button>
      </div>
    </form>
  );
}

function Num({ label, value, onChange }) {
  return (
    <label className="block text-xs">
      <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
        {label}
      </span>
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded border border-slate-300 bg-white px-2.5 py-2 text-slate-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
      />
    </label>
  );
}