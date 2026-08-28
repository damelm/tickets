import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

const HOME_BY_ROLE = {
  empleado: '/mis-tickets',
  agente: '/agente/lista',
  admin: '/admin/dashboard',
};

export function ProtectedRoute({ roles, children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={HOME_BY_ROLE[user.role]} replace />;

  return children;
}

export function homeForRole(role) {
  return HOME_BY_ROLE[role] ?? '/login';
}
