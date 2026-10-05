import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * Props:
 *   roles: array of allowed roles, e.g. ['CITIZEN'] or ['AUTHORITY', 'ADMIN']
 *          if omitted, any authenticated user is allowed
 *   adminScope: when true, redirects to /admin/login instead of /login
 */
export default function ProtectedRoute({ roles, adminScope = false, children }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-sm text-slate-500">
        Verifying session…
      </div>
    );
  }

  if (!isAuthenticated) {
    const target = adminScope ? '/admin/login' : '/login';
    return <Navigate to={target} state={{ from: location.pathname }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    // Logged in but wrong role — send to their home
    const home = user?.role === 'CITIZEN' ? '/dashboard' : '/admin';
    return <Navigate to={home} replace />;
  }

  return children;
}