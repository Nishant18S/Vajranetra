import { useAlerts } from '../../hooks/useAlerts';
import StatTile from '../common/StatTile';
import { Bell, AlertOctagon, AlertTriangle } from 'lucide-react';
import { STATUS } from '../../utils/constants';

export default function ActiveAlertsSummary() {
  const { alerts, state } = useAlerts();
  const total = state === STATUS.SUCCESS ? alerts.length : 0;
  const critical = alerts.filter((a) => (a.severity || '').toUpperCase() === 'CRITICAL').length;
  const high = alerts.filter((a) => (a.severity || '').toUpperCase() === 'HIGH').length;

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <StatTile label="Active" value={total} tone="critical" icon={Bell} />
      <StatTile label="Critical" value={critical} tone="critical" icon={AlertOctagon} />
      <StatTile label="High" value={high} tone="warning" icon={AlertTriangle} />
    </section>
  );
}