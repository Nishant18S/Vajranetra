import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const TONE = {
  CRITICAL: { bg: '#fee2e2', border: '#dc2626', text: '#7f1d1d', label: 'CRITICAL' },
  HIGH: { bg: '#ffedd5', border: '#ea580c', text: '#7c2d12', label: 'HIGH' },
  MODERATE: { bg: '#fef3c7', border: '#d97706', text: '#78350f', label: 'MODERATE' },
  LOW: { bg: '#dbeafe', border: '#2563eb', text: '#1e3a8a', label: 'LOW' },
};

export default function CitizenAlertBanner({ alerts = [] }) {
  const [dismissed, setDismissed] = useState({});

  const visible = alerts.filter((a) => !dismissed[a.alert_id || a._id]);
  if (!visible.length) return null;

  return (
    <div className="space-y-2">
      {visible.map((a) => {
        const tone = TONE[(a.severity || '').toUpperCase()] || TONE.LOW;
        const id = a.alert_id || a._id;
        return (
          <div
            key={id}
            className="rounded-lg border-l-4 p-3 flex items-start gap-3"
            style={{ background: tone.bg, borderLeftColor: tone.border }}
          >
            <AlertTriangle
              size={18}
              className="mt-0.5 shrink-0"
              style={{ color: tone.border }}
            />
            <div className="flex-1 min-w-0">
              <div
                className="text-[11px] font-semibold tracking-widest uppercase mb-0.5"
                style={{ color: tone.text, opacity: 0.85 }}
              >
                Active alert · {tone.label}
              </div>
              <div className="text-sm font-semibold" style={{ color: tone.text }}>
                {a.title || `+${a.horizon_hours}h weather warning`}
              </div>
              {a.description && (
                <p
                  className="text-xs mt-1 leading-relaxed"
                  style={{ color: tone.text, opacity: 0.9 }}
                >
                  {a.description}
                </p>
              )}
              {a.action_advice && (
                <p
                  className="text-xs mt-1.5 leading-relaxed"
                  style={{ color: tone.text }}
                >
                  <strong>Action:</strong> {a.action_advice}
                </p>
              )}
              <div className="mt-2">
                <Link
                  to="/alerts"
                  className="text-xs font-semibold underline"
                  style={{ color: tone.text }}
                >
                  View details →
                </Link>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setDismissed((d) => ({ ...d, [id]: true }))}
              className="p-1 rounded hover:bg-black/5"
              aria-label="Dismiss this alert"
              style={{ color: tone.text }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}