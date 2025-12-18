import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Loading from './components/Loading';

// Pages
import CreateTicket from './pages/CreateTicket';
import Login from './pages/Login';
import DashboardAuxiliar from './pages/DashboardAuxiliar';
import DashboardAdmin from './pages/DashboardAdmin';

function DashboardRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirigir según el rol
  if (user.rol === 'Admin') {
    return <DashboardAdmin />;
  } else {
    return <DashboardAuxiliar />;
  }
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta pública - Crear ticket */}
          <Route path="/" element={<CreateTicket />} />

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard (redirige según rol) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            }
          />

          {/* Redirigir cualquier otra ruta a inicio */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
