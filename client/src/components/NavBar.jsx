import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

const LINKS_BY_ROLE = {
  empleado: [
    { to: '/mis-tickets', label: 'Mis tickets' },
    { to: '/tickets/nuevo', label: 'Crear ticket' },
  ],
  agente: [
    { to: '/agente/lista', label: 'Lista' },
    { to: '/agente/kanban', label: 'Kanban' },
  ],
  admin: [
    { to: '/admin/usuarios', label: 'Usuarios' },
    { to: '/admin/departamentos', label: 'Departamentos' },
  ],
};

function initials(fullName) {
  return fullName
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function NavBar() {
  const { user, logout } = useAuth();
  const links = LINKS_BY_ROLE[user.role] ?? [];

  return (
    <div className="bg-surface border-b border-border px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="font-semibold text-lg text-ink">TicketHub</span>
        <nav className="flex items-center gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-md text-sm font-medium ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-ink-muted hover:text-ink'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-ink-muted">{user.fullName}</span>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-semibold">
          {initials(user.fullName)}
        </div>
        <button
          type="button"
          onClick={logout}
          className="text-sm text-ink-muted hover:text-ink border border-border rounded-md px-3 py-1.5"
        >
          Salir
        </button>
      </div>
    </div>
  );
}
