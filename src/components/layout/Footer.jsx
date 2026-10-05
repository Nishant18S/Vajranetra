export default function Footer() {
  return (
    <footer className="border-t border-line bg-base-950">
      <div className="max-w-[1400px] mx-auto px-5 py-5 flex flex-col sm:flex-row gap-2 sm:gap-6 sm:items-center sm:justify-between text-2xs text-ink-faint">
        <div>VajraNetra · AI-Driven Hyper-Local Early Warning · Research Prototype</div>
        <div className="font-mono">Predictions are experimental and should be independently verified.</div>
      </div>
    </footer>
  );
}