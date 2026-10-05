import { fmtDateTime } from '../../utils/formatters';

const ACTION_TONE = {
  'alert.created':          'vn-adm-badge vn-adm-badge--info',
  'alert.created_manual':   'vn-adm-badge vn-adm-badge--info',
  'alert.acknowledged':     'vn-adm-badge vn-adm-badge--moderate',
  'alert.dispatched':       'vn-adm-badge vn-adm-badge--high',
  'alert.resolved':         'vn-adm-badge vn-adm-badge--low',
  'incident.created':       'vn-adm-badge vn-adm-badge--info',
  'incident.updated':       'vn-adm-badge vn-adm-badge--moderate',
};

export default function AuditRow({ entry }) {
  const tone = ACTION_TONE[entry.action] || 'vn-adm-badge';
  return (
    <tr>
      <td className="mono" style={{ color: 'var(--a-text-dim)', whiteSpace: 'nowrap' }}>
        {fmtDateTime(entry.timestamp)}
      </td>
      <td>
        <span className={tone}>{entry.action}</span>
      </td>
      <td>
        <div className="text-xs" style={{ color: 'var(--a-text)' }}>
          {entry.actor_email || entry.actor_role || 'system'}
        </div>
        {entry.actor_role && (
          <div className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--a-text-faint)' }}>
            {entry.actor_role}
          </div>
        )}
      </td>
      <td>
        <div className="mono text-xs" style={{ color: 'var(--a-text-dim)' }}>
          {entry.target_type ? `${entry.target_type}:${String(entry.target_id || '').slice(-8)}` : '—'}
        </div>
      </td>
      <td>
        {entry.notes ? (
          <span className="text-xs" style={{ color: 'var(--a-text-mid)' }}>
            {entry.notes.length > 80 ? entry.notes.slice(0, 80) + '…' : entry.notes}
          </span>
        ) : '—'}
      </td>
      <td>
        {renderChanges(entry.changes)}
      </td>
    </tr>
  );
}

function renderChanges(changes) {
  if (!changes || Object.keys(changes).length === 0) {
    return <span style={{ color: 'var(--a-text-faint)' }}>—</span>;
  }
  return (
    <div className="space-y-0.5">
      {Object.entries(changes).map(([k, v]) => {
        if (Array.isArray(v) && v.length === 2) {
          return (
            <div key={k} className="mono text-[10px]" style={{ color: 'var(--a-text-dim)' }}>
              {k}: <span style={{ color: 'var(--a-red)' }}>{String(v[0])}</span>
              {' → '}
              <span style={{ color: 'var(--a-green)' }}>{String(v[1])}</span>
            </div>
          );
        }
        return (
          <div key={k} className="mono text-[10px]" style={{ color: 'var(--a-text-dim)' }}>
            {k}: {String(v)}
          </div>
        );
      })}
    </div>
  );
}