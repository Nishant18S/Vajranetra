import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

const titleFor = (code) =>
  ({
    NETWORK: 'Connection lost',
    UNAVAILABLE: 'Service unavailable',
    NOT_FOUND: 'Not found',
    SERVER: 'Server error',
    BAD_REQUEST: 'Invalid request',
    UNAUTHORIZED: 'Sign in required',
    FORBIDDEN: 'Access denied',
  }[code] || 'Something went wrong');

export default function ErrorState({ error, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8 px-4">
      <div className="w-10 h-10 rounded-md bg-red-50 border border-red-200 flex items-center justify-center mb-3">
        <AlertTriangle size={18} className="text-red-600" />
      </div>
      <p className="text-sm text-slate-800">{titleFor(error?.code)}</p>
      <p className="text-xs text-slate-500 mt-1 max-w-md break-words">
        {error?.message}
      </p>
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          className="mt-4"
          onClick={onRetry}
        >
          <RefreshCw size={14} /> Retry
        </Button>
      )}
    </div>
  );
}