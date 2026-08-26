import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext.jsx';
import { ProtectedRoute, homeForRole } from './auth/ProtectedRoute.jsx';
import { Layout } from './components/Layout.jsx';
import { Login } from './pages/Login.jsx';
import { CrearTicket } from './pages/employee/CrearTicket.jsx';
import { MisTickets } from './pages/employee/MisTickets.jsx';
import { TicketDetail } from './pages/TicketDetail.jsx';
import { IssueList } from './pages/agent/IssueList.jsx';
import { KanbanBoard } from './pages/agent/KanbanBoard.jsx';
import { ConfigDepartamentos } from './pages/admin/ConfigDepartamentos.jsx';
import { GestionarUsuarios } from './pages/admin/GestionarUsuarios.jsx';

function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  return <Navigate to={isAuthenticated ? homeForRole(user.role) : '/login'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/mis-tickets"
            element={
              <ProtectedRoute roles={['empleado']}>
                <Layout>
                  <MisTickets />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/nuevo"
            element={
              <ProtectedRoute roles={['empleado']}>
                <Layout>
                  <CrearTicket />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <ProtectedRoute roles={['empleado', 'agente', 'admin']}>
                <Layout>
                  <TicketDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/agente/lista"
            element={
              <ProtectedRoute roles={['agente', 'admin']}>
                <Layout>
                  <IssueList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/agente/kanban"
            element={
              <ProtectedRoute roles={['agente', 'admin']}>
                <Layout>
                  <KanbanBoard />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/departamentos"
            element={
              <ProtectedRoute roles={['admin']}>
                <Layout>
                  <ConfigDepartamentos />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/usuarios"
            element={
              <ProtectedRoute roles={['admin']}>
                <Layout>
                  <GestionarUsuarios />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
