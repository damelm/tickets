import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { user, loading, isAuthenticated, isAdmin } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
