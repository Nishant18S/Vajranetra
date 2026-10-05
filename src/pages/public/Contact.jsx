import { useState } from 'react';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  ShieldAlert, 
  CloudSun, 
  MessageSquare, 
  ExternalLink, 
  Building2, 
  Clock, 
  Send,
  CheckCircle2
} from 'lucide-react';

export default function PublicContact() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <div className="space-y-6 font-sans pb-10">
      
      {/* ── Banner Section ── */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-700 border border-red-100 mb-2">
              <ShieldAlert size={13} className="text-red-600 animate-pulse" />
              24/7 Disaster Operations Directory
            </span>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Emergency Hotlines & Public Support
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              For life-threatening emergencies, dial toll-free numbers immediately. This portal complements official state broadcasts.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
            <Clock size={16} className="text-blue-600 shrink-0" />
            <div>
              <span className="block font-bold text-slate-800">State Control Room Status</span>
              <span className="text-emerald-600 font-semibold">Active & Operational (24x7)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Emergency Hotline Cards ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Critical Emergency */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-red-300 transition-all">
          <div className="flex items-center gap-2.5 font-bold text-slate-900 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-100">
              <PhoneCall size={18} />
            </div>
            <div>
              <h3 className="text-sm">Emergency Hotlines</h3>
              <p className="text-[10px] text-slate-400 font-normal">Immediate Response Services</p>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <Line label="National Emergency" value="112" isTel />
            <Line label="Disaster Helpline (SEOC)" value="1070" isTel />
            <Line label="Medical Ambulance" value="108" isTel />
            <Line label="Fire & Rescue" value="101" isTel />
          </div>
        </div>

        {/* Card 2: Weather Advisory */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-blue-300 transition-all">
          <div className="flex items-center gap-2.5 font-bold text-slate-900 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <CloudSun size={18} />
            </div>
            <div>
              <h3 className="text-sm">Weather Information</h3>
              <p className="text-[10px] text-slate-400 font-normal">India Meteorological Department</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Line label="IMD Toll-Free" value="1800 180 1717" isTel />
            <Line label="Bhubaneswar MC" value="0674 2596116" isTel />
            <Line label="Official Portal" value="mausam.imd.gov.in" href="https://mausam.imd.gov.in" />
            <Line label="ODSMA Portal" value="osdma.org" href="https://www.osdma.org" />
          </div>
        </div>

        {/* Card 3: Platform Helpdesk */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-indigo-300 transition-all">
          <div className="flex items-center gap-2.5 font-bold text-slate-900 border-b border-slate-100 pb-3">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Mail size={18} />
            </div>
            <div>
              <h3 className="text-sm">Platform Feedback</h3>
              <p className="text-[10px] text-slate-400 font-normal">VajraNetra Support Desk</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Line label="Email Support" value="src.or@nic.in" isMail />
            <Line label="Alternate Email" value="osdma@osdma.org" isMail />
            <Line label="Response Time" value="Within 24 Hours" />
            <Line label="Portal Version" value="v2.4 (Enterprise)" />
          </div>
        </div>

      </section>

      {/* ── Main Content Grid: Regional Offices + Feedback Form ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Regional Offices Directory */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 size={18} className="text-blue-600" />
                <span>State Disaster Management Headquarters</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official headquarters and state control center contacts
              </p>
            </div>
          </div>

          <div className="space-y-4">
            
            {/* Office 1 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  Odisha State Disaster Management Authority (OSDMA)
                </h3>
                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">
                  Head Office
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p className="flex items-start gap-1.5">
                  <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <span>Rajiv Bhawan, Unit-5, Bhubaneswar, Odisha – 751001</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <PhoneCall size={14} className="text-slate-400 shrink-0" />
                  <span>Phone: 0674-2395398 / 2395531</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400 shrink-0" />
                  <span>Email: osdma@osdma.org</span>
                </p>
              </div>
            </div>

            {/* Office 2 */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  State Emergency Operations Centre (SEOC)
                </h3>
                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">
                  24x7 Control Room
                </span>
              </div>
              <div className="text-xs text-slate-600 space-y-1">
                <p className="flex items-start gap-1.5">
                  <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <span>Ground Floor, Rajiv Bhawan, Unit-V, Bhubaneswar – 751001</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <PhoneCall size={14} className="text-slate-400 shrink-0" />
                  <span>Direct: 0674-2534177 | Fax: 0674-2534176</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400 shrink-0" />
                  <span>Email: srcodishagov@gmail.com</span>
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Public Feedback / Query Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <div className="border-b border-slate-100 pb-3 mb-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-600" />
              <span>Submit Inquiry or Feedback</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Send non-emergency reports or platform feedback
            </p>
          </div>

          {submitted ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Message Received</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Thank you for your feedback. Our platform operations team will review your query shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs font-bold text-blue-600 hover:underline pt-2 inline-block"
              >
                Send another message →
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nishant Swain"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. user@example.com"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Topic / Category
                </label>
                <select className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option>Platform Bug / Technical Issue</option>
                  <option>District Radar Data Discrepancy</option>
                  <option>Alert Notification Preferences</option>
                  <option>General Support Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Your Message
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe your query or suggestion..."
                  className="w-full rounded-xl border border-slate-300 bg-white p-3 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {loading ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
}

function Line({ label, value, isTel, isMail, href }) {
  let content = <span className="font-bold text-slate-800">{value}</span>;

  if (isTel) {
    content = (
      <a
        href={`tel:${value.replace(/\s+/g, '')}`}
        className="font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
      >
        <span>{value}</span>
      </a>
    );
  } else if (isMail) {
    content = (
      <a
        href={`mailto:${value}`}
        className="font-bold text-blue-600 hover:text-blue-800 hover:underline"
      >
        {value}
      </a>
    );
  } else if (href) {
    content = (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
      >
        <span>{value}</span>
        <ExternalLink size={12} />
      </a>
    );
  }

  return (
    <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
      <span className="text-slate-500">{label}</span>
      {content}
    </div>
  );
}