export default function AdminHeader() {
  return (
    <div
      className="lg:hidden flex items-center gap-2 px-4 h-10 border-b"
      style={{
        background: '#050a12',
        borderColor: 'var(--a-border)',
      }}
    >
      <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold"
           style={{ background: 'var(--a-accent-soft)', color: 'var(--a-accent)' }}>
        V
      </div>
      <span
        className="text-[11px] font-bold tracking-widest uppercase"
        style={{ color: 'var(--a-text)' }}
      >
        VajraNetra Authority
      </span>
    </div>
  );
}