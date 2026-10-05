export default function Spinner({ size = 16, className = '' }) {
  return (
    <span
      className={`inline-block border-2 border-slate-300 border-t-blue-700 rounded-full animate-spin ${className}`}
      style={{ width: size, height: size }}
    />
  );
}