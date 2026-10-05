import { useSystemStatus } from '../../hooks/useSystemStatus';
import { fmtRelative, fmtDateTime } from '../../utils/formatters';

export default function SystemStatusStrip() {
  const { status, modelInfo, loading } = useSystemStatus();
  if (loading && !status) return null;

  const items = [
    { k: 'Device',      v: modelInfo?.device ?? status?.device ?? '—' },
    { k: 'Parameters',  v: modelInfo?.parameters?.toLocaleString?.() ?? '—' },
    { k: 'Input shape', v: Array.isArray(modelInfo?.input_shape) ? modelInfo.input_shape.join(' × ') : '—' },
    { k: 'Checkpoint',  v: modelInfo?.checkpoint_loaded ? 'Loaded' : 'Not loaded' },
    { k: 'Data source', v: status?.data_source_status ?? 'unknown' },
    { k: 'Last inference', v: fmtRelative(status?.last_inference_at) },
    { k: 'Uptime',      v: status?.api_uptime ?? '—' },
    { k: 'Server time', v: fmtDateTime(status?.timestamp) },
  ];

  return (
    <div className="panel">
      <div className="panel-hd">
        <h3 className="panel-title">System status</h3>
        <span className="text-2xs text-ink-faint">Polled every 45s</span>
      </div>
      <dl className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-line">
        {items.map((it) => (
          <div key={it.k} className="p-3">
            <dt className="kpi-label">{it.k}</dt>
            <dd className="mono text-sm text-ink-hi mt-1 truncate">{String(it.v)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}