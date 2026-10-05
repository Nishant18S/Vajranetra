import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'No data available',
  hint,
  icon: Icon = Inbox,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center mb-3">
        <Icon size={18} className="text-slate-500" />
      </div>
      <p className="text-sm text-slate-800">{title}</p>
      {hint && (
        <p className="text-xs text-slate-500 mt-1 max-w-sm">{hint}</p>
      )}
    </div>
  );
}