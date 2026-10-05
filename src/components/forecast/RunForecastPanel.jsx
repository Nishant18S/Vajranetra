import { useState } from 'react';
import { PlayCircle } from 'lucide-react';
import Button from '../common/Button';
import { useForecast } from '../../hooks/useForecast';

export default function RunForecastPanel({ defaultSample = 0 }) {
  const { loadSample } = useForecast();
  const [idx, setIdx] = useState(defaultSample);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg({ kind: 'info', text: 'Running VajraNetra inference…' });
    try {
      const res = await loadSample(Number(idx));
      setMsg({
        kind: 'ok',
        text: `Prediction generated for sample ${res?.sample_index ?? idx}.`,
      });
    } catch (err) {
      setMsg({ kind: 'err', text: err.message || 'Inference failed.' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="vn-panel p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs">
          <span className="block text-[11px] uppercase tracking-wider text-slate-500 font-medium">
            Sample index
          </span>
          <input
            type="number"
            min={0}
            value={idx}
            onChange={(e) => setIdx(e.target.value)}
            className="mt-1 w-32 rounded border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
          />
        </label>

        <Button type="submit" loading={busy}>
          <PlayCircle size={14} /> Run Forecast
        </Button>

        {msg && (
          <p
            className={`text-xs ml-auto ${
              msg.kind === 'err'
                ? 'text-red-600'
                : msg.kind === 'ok'
                ? 'text-green-700'
                : 'text-slate-500'
            }`}
          >
            {msg.text}
          </p>
        )}
      </div>
    </form>
  );
}