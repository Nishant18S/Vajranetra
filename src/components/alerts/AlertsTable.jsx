import RiskBadge from '../common/RiskBadge';
import { fmtDateTime, fmtNumber } from '../../utils/formatters';

export default function AlertsTable({ alerts, onSelect }) {
  if (!alerts?.length) return null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="text-[11px] uppercase tracking-wider text-slate-500">
          <tr className="border-b border-slate-200">
            <Th>Alert</Th>
            <Th>Horizon</Th>
            <Th>Severity</Th>
            <Th>Prob</Th>
            <Th>Grid</Th>
            <Th>Status</Th>
            <Th>Created</Th>
            <Th right>Action</Th>
          </tr>
        </thead>
        <tbody>
          {alerts.map((a) => {
            const id = a.alert_id || a._id;
            return (
              <tr key={id} className="border-b border-slate-100 hover:bg-slate-50">
                <Td mono>{String(id).slice(-8)}</Td>
                <Td mono>
                  {a.horizon_hours != null ? `+${a.horizon_hours}h` : '—'}
                </Td>
                <Td>
                  <RiskBadge risk={a.severity || a.risk} />
                </Td>
                <Td mono>{fmtNumber(a.probability ?? a.max_probability, 4)}</Td>
                <Td mono>
                  {a.grid_y != null ? `Y${a.grid_y}·X${a.grid_x}` : '—'}
                </Td>
                <Td>{a.status || '—'}</Td>
                <Td mono>{fmtDateTime(a.created_at)}</Td>
                <Td right>
                  <button
                    onClick={() => onSelect?.(a)}
                    className="text-xs font-medium text-blue-700 hover:underline"
                  >
                    Open
                  </button>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const Th = ({ children, right }) => (
  <th className={`px-3 py-2 text-left font-medium ${right ? 'text-right' : ''}`}>
    {children}
  </th>
);
const Td = ({ children, mono, right }) => (
  <td className={`px-3 py-2 text-slate-700 ${mono ? 'font-mono' : ''} ${right ? 'text-right' : ''}`}>
    {children}
  </td>
);