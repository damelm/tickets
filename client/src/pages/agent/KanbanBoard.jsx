import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { listTickets, updateTicketStatus } from '../../api/tickets.js';
import { EmptyState } from '../../components/EmptyState.jsx';
import { ErrorState, InlineError } from '../../components/ErrorState.jsx';
import { LoadingState } from '../../components/Spinner.jsx';
import { KanbanCard } from '../../components/kanban/KanbanCard.jsx';
import { KanbanColumn } from '../../components/kanban/KanbanColumn.jsx';

const COLUMNS = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Done' },
];

// Tope que admite el validador de la API (listTicketsQuerySchema).
const PAGE_SIZE = 100;
const CARDS_PER_COLUMN = 20;

function moveTo(tickets, id, status) {
  const ticket = tickets.find((t) => t.id === id);
  if (!ticket) return tickets;
  const rest = tickets.filter((t) => t.id !== id);
  return [{ ...ticket, status }, ...rest];
}

export function KanbanBoard() {
  const { token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [moveError, setMoveError] = useState(null);
  const [pending, setPending] = useState([]);
  const [dragged, setDragged] = useState(null);
  const [visible, setVisible] = useState({});
  const draggedRef = useRef(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await listTickets(token, { pageSize: PAGE_SIZE });
      setTickets(res.items);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = useCallback(
    async (id, from, to) => {
      if (from === to) return;
      setMoveError(null);
      setTickets((cur) => moveTo(cur, id, to));
      setPending((cur) => [...cur, id]);
      try {
        const updated = await updateTicketStatus(token, id, to);
        setTickets((cur) => cur.map((t) => (t.id === id ? { ...t, ...updated } : t)));
      } catch (err) {
        setTickets((cur) => moveTo(cur, id, from));
        setMoveError(`No se pudo mover TCK-${id}: ${err.message}`);
      } finally {
        setPending((cur) => cur.filter((p) => p !== id));
      }
    },
    [token],
  );

  const handleDragStart = useCallback((e, ticket) => {
    const info = { id: ticket.id, status: ticket.status };
    draggedRef.current = info;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(ticket.id));
    requestAnimationFrame(() => setDragged(info));
  }, []);

  const handleDragEnd = useCallback(() => {
    draggedRef.current = null;
    setDragged(null);
  }, []);

  const handleDropTicket = useCallback(
    (status) => {
      const drag = draggedRef.current;
      draggedRef.current = null;
      setDragged(null);
      if (drag) changeStatus(drag.id, drag.status, status);
    },
    [changeStatus],
  );

  const showMore = useCallback((status) => {
    setVisible((cur) => ({ ...cur, [status]: (cur[status] ?? CARDS_PER_COLUMN) + CARDS_PER_COLUMN }));
  }, []);

  const grouped = useMemo(() => {
    const byStatus = Object.fromEntries(COLUMNS.map((c) => [c.value, []]));
    for (const t of tickets) byStatus[t.status]?.push(t);
    return byStatus;
  }, [tickets]);

  if (loading) return <LoadingState label="Cargando tablero..." />;
  if (loadError) return <ErrorState message={loadError} onRetry={load} />;

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 57px)' }}>
      {moveError && (
        <div className="px-6 pt-4">
          <InlineError message={moveError} />
        </div>
      )}

      <div className="flex-1 min-h-0 p-6 overflow-x-auto flex">
        <div className="flex gap-4 min-w-max">
          {COLUMNS.map((col) => {
            const colTickets = grouped[col.value];
            const limit = visible[col.value] ?? CARDS_PER_COLUMN;
            return (
              <KanbanColumn
                key={col.value}
                column={col}
                count={colTickets.length}
                canDrop={Boolean(dragged) && dragged.status !== col.value}
                onDropTicket={handleDropTicket}
              >
                {colTickets.length === 0 ? (
                  <EmptyState
                    compact
                    icon="inbox"
                    title="Sin tickets"
                    className="border border-dashed border-border rounded-md"
                  />
                ) : (
                  <>
                    {colTickets.slice(0, limit).map((t) => (
                      <KanbanCard
                        key={t.id}
                        ticket={t}
                        columns={COLUMNS}
                        dragging={dragged?.id === t.id}
                        pending={pending.includes(t.id)}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onStatusChange={changeStatus}
                      />
                    ))}
                    {colTickets.length > limit && (
                      <button
                        type="button"
                        onClick={() => showMore(col.value)}
                        className="w-full py-2 text-xs font-medium text-ink-muted hover:text-ink border border-dashed border-border rounded-md hover:bg-surface"
                      >
                        Mostrar {Math.min(CARDS_PER_COLUMN, colTickets.length - limit)} más
                      </button>
                    )}
                  </>
                )}
              </KanbanColumn>
            );
          })}
        </div>
      </div>
    </div>
  );
}
