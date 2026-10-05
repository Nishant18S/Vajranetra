import CreateAlertForm from '../../components/admin/CreateAlertForm';

export default function AdminCreateAlert() {
  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h1 className="text-lg font-semibold" style={{ color: 'var(--a-text)' }}>
          Create Alert
        </h1>
        <p className="text-xs mt-1" style={{ color: 'var(--a-text-dim)' }}>
          Issue a manual public warning. It is published immediately and
          dispatched to citizens in the matching region.
        </p>
      </div>

      <div className="vn-adm-panel p-5">
        <CreateAlertForm />
      </div>
    </div>
  );
}