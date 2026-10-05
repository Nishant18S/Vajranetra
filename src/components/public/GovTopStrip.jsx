export default function GovTopStrip() {
  return (
    <div className="vn-topstrip">
      <div className="max-w-[1400px] mx-auto h-full px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" style={{ fontSize: 14 }}>🇮🇳</span>
          <span className="font-medium">Government of India</span>
          <span className="hidden sm:inline opacity-60">·</span>
          <span className="hidden sm:inline">Ministry of Earth Sciences</span>
        </div>

        <div className="hidden md:flex items-center">
          <a className="vn-topstrip__link" href="#main">Skip to Main Content</a>
          <a className="vn-topstrip__link" href="#">Screen Reader</a>
          <a className="vn-topstrip__link" href="#">A−</a>
          <a className="vn-topstrip__link" href="#">A</a>
          <a className="vn-topstrip__link" href="#">A+</a>
          <a className="vn-topstrip__link" href="#">English</a>
          <a className="vn-topstrip__link" href="#">हिन्दी</a>
        </div>
      </div>
    </div>
  );
}