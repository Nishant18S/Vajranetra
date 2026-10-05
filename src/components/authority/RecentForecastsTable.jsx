import { useEffect, useState } from 'react';
import { forecastService } from '../../services/forecastService';
import { fmtDateTime } from '../../utils/formatters';
import EmptyState from '../common/EmptyState';

export default function RecentForecastsTable() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await forecastService.history({ page: 1, limit: 8 });
        if (!cancelled) setItems(data?.items || []);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <p className="text-sm text-slate-500 p-4">Loading…</p>;
  }
  if (!items.length) {
    return <EmptyState title="No recent forecasts." />;
  }

  return (
    <ul className="divide-y divide-slate-100 text-xs">
      {items.map((f) => (
        <li key={f.forecast_id} className="py-2 flex items-center justify-between">
          <span className="font-mono text-slate-500">
            {String(f.forecast_id).slice(-10)}
          </span>
          <span className="font-mono text-slate-500">sample {f.sample_index}</span>
          <span className="font-mono text-slate-800">
            {fmtDateTime(f.generated_at)}
          </span>
        </li>
      ))}
    </ul>
  );
}