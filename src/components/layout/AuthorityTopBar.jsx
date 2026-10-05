import { useSystemStatus } from '../../hooks/useSystemStatus';
import { useAlerts } from '../../hooks/useAlerts';
import { fmtRelative } from '../../utils/formatters';

export default function AuthorityTopBar() {
  const { status, modelInfo } = useSystemStatus();
  const { active } = useAlerts();

  const backendOk = status?.backend_status === 'ok' || status?.status === 'ok';
  const dbOk = status?.database_status === 'ok' || status?.database_status === 'connected';
  const modelOk = modelInfo?.checkpoint_loaded === true || status?.model_status === 'loaded';

  return (
    <div className="h-14 border-b border-line bg-base-900/95 backdrop-blur px-5 flex items-center justify-between text-xs">
      <div className="flex items-center gap-5">
        <Pill label="Backend"   ok={backendOk} />
        <Pill label="Database"  ok={dbOk} />
        <Pill label="Model"     ok={modelOk} />
      </div>

      <div className="flex items-center gap-5 text-ink-dim">
        <span>
          <span className="text-ink-faint mr-1">Last inference:</span>
          <span className="mono text-ink">{fmtRelative(status?.last_inference_at)}</span>
        </span>
        <span>
          <span className="text-ink-faint mr-1">Active alerts:</span>
          <span className="mono text-ink">{active?.length ?? 0}</span>
        </span>
      </div>
    </div>
  );
}

function Pill({ label, ok }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-risk-normal' : 'bg-risk-critical'} ${ok ? 'animate-pulseSoft' : ''}`} />
      <span className="text-ink-faint uppercase tracking-wider text-2xs">{label}</span>
    </div>
  );
}