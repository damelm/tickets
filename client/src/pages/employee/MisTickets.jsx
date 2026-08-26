import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext.jsx';
import { listMyTickets } from '../../api/tickets.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';

export function MisTickets() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listMyTickets(token).then((res) => {
      setTickets(res.items);
      setLoading(false);
    });
  }, [token]);

  return (
    <div className="px-8 py-7">
      <div className="flex items-center justify-between mb-5">
        <div className="font-semibold text-xl text-ink">Mis tickets</div>
        <Link
          to="/tickets/nuevo"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-accent text-white rounded-md text-sm font-semibold"
        >
          + Nuevo ticket
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Ticket</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Departamento</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Asunto</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Estado</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-ink-muted uppercase tracking-wide">Creado</th>
            </tr>
          </thead>
          <tbody>
            {!loading && tickets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-ink-faint">
                  Todavía no creaste ningún ticket.
                </td>
              </tr>
            )}
            {tickets.map((t) => (
              <tr key={t.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link to={`/tickets/${t.id}`} className="text-[13px] text-ink-muted font-medium hover:underline">
                    TCK-{t.id}
                  </Link>
                </td>
                <td className="px-4 py-3 text-sm text-ink-soft">{t.department_name}</td>
                <td className="px-4 py-3 text-sm text-ink">
                  <Link to={`/tickets/${t.id}`} className="hover:underline">
                    {t.subject}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-4 py-3 text-[13px] text-ink-faint">
                  {new Date(t.created_at).toLocaleDateString('es-AR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
