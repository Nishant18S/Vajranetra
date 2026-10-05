import { useCallback, useEffect, useState } from 'react';
import { RefreshCw, Users as UsersIcon, Filter } from 'lucide-react';
import KPITile from '../../components/admin/KPITile';
import { adminService } from '../../services/adminService';
import { fmtDateTime } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';

const ROLES = ['ALL', 'CITIZEN', 'AUTHORITY', 'ADMIN'];

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [role, setRole] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await adminService.listUsers({
        role: role === 'ALL' ? undefined : role,
        page,
        limit,
      });
      setUsers(data?.items || []);
      setTotal(data?.total ?? 0);
    } catch (e) { setError(e); }
    finally { setLoading(false); }
  }, [role, page, limit]);

  useEffect(() => { load(); }, [load]);

  const updateRole = async (userId, newRole) => {
    if (userId === me?.user_id) {
      alert("You can't change your own role.");
      return;
    }
    try {
      await adminService.updateUser(userId, { role: newRole });
      load();
    } catch (e) {
      alert(`Could not update role: ${e.message}`);
    }
  };

  const toggleActive = async (userId, currentActive) => {
    if (userId === me?.user_id) {
      alert("You can't deactivate your own account.");
      return;
    }
    if (!currentActive) {
      // Reactivating — no confirm needed
    } else if (!confirm('Deactivate this user? They will not be able to log in.')) {
      return;
    }
    try {
      await adminService.updateUser(userId, { is_active: !currentActive });
      load();
    } catch (e) {
      alert(`Could not update user: ${e.message}`);
    }
  };

  // Summary counts from current page (approximation)
  const counts = users.reduce(
    (acc, u) => ({ ...acc, [u.role]: (acc[u.role] || 0) + 1 }),
    {}
  );

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--a-text)' }}>User Management</h1>
          <p className="text-xs mt-1" style={{ color: 'var(--a-text-dim)' }}>
            View accounts, change roles, and activate/deactivate users. Administrator only.
          </p>
        </div>
        <button onClick={load} className="vn-adm-btn vn-adm-btn--outline" disabled={loading}>
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KPITile label="Total shown" icon={UsersIcon} value={users.length} hint={`of ${total} total`} />
        <KPITile label="Citizens"    value={counts.CITIZEN ?? 0} />
        <KPITile label="Authority"   value={counts.AUTHORITY ?? 0} />
        <KPITile label="Admins"      value={counts.ADMIN ?? 0} />
      </section>

      <div className="vn-adm-panel p-3 flex items-center gap-2">
        <Filter size={12} style={{ color: 'var(--a-text-faint)' }} />
        <span className="kpi-label">Role</span>
        <select
          value={role}
          onChange={(e) => { setRole(e.target.value); setPage(1); }}
          className="rounded px-2 py-1 text-xs"
          style={{ background: 'var(--a-bg)', border: '1px solid var(--a-border)', color: 'var(--a-text)' }}
        >
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {error && (
        <div className="rounded p-3 text-xs"
             style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', color: 'var(--a-red)' }}>
          {error.message}
        </div>
      )}

      <div className="vn-adm-panel overflow-hidden">
        {loading && <p className="p-6 text-xs" style={{ color: 'var(--a-text-dim)' }}>Loading…</p>}

        {!loading && users.length === 0 && (
          <p className="p-8 text-center text-sm" style={{ color: 'var(--a-text-mid)' }}>
            No users match this filter.
          </p>
        )}

        {!loading && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="vn-adm-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Region</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isMe = u.user_id === me?.user_id;
                  return (
                    <tr key={u.user_id}>
                      <td style={{ color: 'var(--a-text)' }}>
                        {u.name} {isMe && <span className="text-[10px] ml-1" style={{ color: 'var(--a-accent)' }}>(you)</span>}
                      </td>
                      <td className="mono" style={{ color: 'var(--a-text-dim)' }}>{u.email}</td>
                      <td>
                        <select
                          value={u.role}
                          disabled={isMe}
                          onChange={(e) => updateRole(u.user_id, e.target.value)}
                          className="rounded px-2 py-1 text-[11px]"
                          style={{
                            background: 'var(--a-bg)',
                            border: '1px solid var(--a-border)',
                            color: 'var(--a-text)',
                            opacity: isMe ? 0.5 : 1,
                          }}
                        >
                          <option>CITIZEN</option>
                          <option>AUTHORITY</option>
                          <option>ADMIN</option>
                        </select>
                      </td>
                      <td className="mono" style={{ color: 'var(--a-text-dim)' }}>
                        {u.district ? `${u.district}, ${u.state || ''}` : '—'}
                      </td>
                      <td>
                        <span className={u.is_active ? 'vn-adm-badge vn-adm-badge--low' : 'vn-adm-badge vn-adm-badge--critical'}>
                          {u.is_active ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </td>
                      <td className="mono" style={{ color: 'var(--a-text-dim)' }}>
                        {fmtDateTime(u.created_at)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          disabled={isMe}
                          onClick={() => toggleActive(u.user_id, u.is_active)}
                          className="vn-adm-btn vn-adm-btn--outline text-[11px]"
                          style={{ opacity: isMe ? 0.5 : 1 }}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            className="vn-adm-btn vn-adm-btn--outline"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Prev
          </button>
          <span className="text-xs" style={{ color: 'var(--a-text-dim)' }}>
            Page {page} of {totalPages}
          </span>
          <button
            className="vn-adm-btn vn-adm-btn--outline"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}