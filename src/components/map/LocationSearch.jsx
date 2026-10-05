import { useEffect, useRef, useState } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { geocodeService } from '../../services/geocodeService';

export default function LocationSearch({ onSelect }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [state, setState] = useState('idle');
  const [error, setError] = useState(null);
  const abortRef = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setResults([]);
      setState('idle');
      return;
    }

    const ticket = ++abortRef.current;
    setState('loading');

    const t = setTimeout(async () => {
      try {
        const data = await geocodeService.search(q, { limit: 6 });
        if (ticket !== abortRef.current) return;
        setResults(data);
        setState(data.length ? 'success' : 'empty');
        setError(null);
      } catch (e) {
        if (ticket !== abortRef.current) return;
        setError(e);
        setState('error');
        setResults([]);
      }
    }, 400);

    return () => clearTimeout(t);
  }, [query]);

  const pick = (r) => {
    onSelect?.(r);
    setQuery('');
    setResults([]);
    setState('idle');
  };

  return (
    <div className="relative">
      <label className="block text-xs">
        <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">
          Search location
        </span>
        <div className="mt-1 relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="City, district, state, region…"
            className="w-full rounded border border-slate-300 bg-white pl-8 pr-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
            autoComplete="off"
          />
          {state === 'loading' && (
            <Loader2
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 animate-spin"
            />
          )}
        </div>
      </label>

      {state === 'success' && results.length > 0 && (
        <ul className="mt-2 max-h-64 overflow-y-auto border border-slate-200 rounded divide-y divide-slate-100 bg-white shadow-sm">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => pick(r)}
                className="w-full text-left px-3 py-2 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start gap-2">
                  <MapPin size={13} className="text-blue-700 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-slate-800 truncate">
                      {r.shortName}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {r.displayName}
                    </div>
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {state === 'empty' && (
        <p className="mt-2 text-[11px] text-slate-500">
          No matching places. Try a different name or use the manual bounds below.
        </p>
      )}

      {state === 'error' && (
        <p className="mt-2 text-[11px] text-red-600">
          {error?.message || 'Geocoding failed.'} You can still enter bounds manually.
        </p>
      )}
    </div>
  );
}