import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-5">
      <div className="vn-panel p-8 text-center max-w-md">
        <div className="text-3xl font-mono text-blue-700">404</div>
        <p className="text-sm text-slate-700 mt-3">Page not found.</p>
        <Link
          to="/"
          className="inline-block mt-5 px-4 py-2 rounded bg-blue-800 text-white text-sm font-semibold hover:bg-blue-900"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}