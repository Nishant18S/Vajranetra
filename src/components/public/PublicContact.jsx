import { Phone, Mail, MapPin } from 'lucide-react';

export default function PublicContact() {
  return (
    <div className="space-y-6">
      <section className="vn-panel p-6">
        <h1
          className="text-xl font-semibold"
          style={{ color: 'var(--vn-primary)' }}
        >
          Contact &amp; Helplines
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          In an emergency, always call the numbers below. This platform is not
          a substitute for emergency services.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card icon={Phone} title="Emergency">
          <Line label="National Emergency" value="112" />
          <Line label="Disaster Helpline" value="1070" />
          <Line label="Ambulance" value="108" />
        </Card>
        <Card icon={Phone} title="Weather Information">
          <Line label="IMD Toll-free" value="1800 180 1717" />
          <Line label="IMD Website" value="mausam.imd.gov.in" />
        </Card>
        <Card icon={Mail} title="Platform Feedback">
          <Line label="Email" value="feedback@vajranetra.example" />
          <Line label="Response time" value="2–3 working days" />
        </Card>
      </section>

      <section className="vn-panel p-6">
        <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
          <MapPin size={16} /> Regional Offices
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Contact your State Disaster Management Authority for local guidance.
          A directory of offices will be added in a future release.
        </p>
      </section>
    </div>
  );
}

function Card({ icon: Icon, title, children }) {
  return (
    <div className="vn-panel p-5">
      <div className="flex items-center gap-2 text-slate-800 font-semibold">
        <Icon size={16} style={{ color: 'var(--vn-primary)' }} />
        {title}
      </div>
      <div className="mt-3 space-y-1.5 text-sm">{children}</div>
    </div>
  );
}

function Line({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-800">{value}</span>
    </div>
  );
}