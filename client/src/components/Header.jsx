import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-teal-700 to-teal-600 rounded-lg">
              <span className="text-white font-bold text-lg">SF</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Siete Fronteras</h1>
              <p className="text-xs text-slate-500">Sistema de Tickets</p>
            </div>
          </div>

          {/* User info */}
          {isAuthenticated() && user && (
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-900">👋 {user.nombre}</p>
                <p className="text-xs text-slate-500">{user.rol}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
