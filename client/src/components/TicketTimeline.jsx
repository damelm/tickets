const EVENT_LABEL = {
  status_change: 'cambió el estado',
  assignment_change: 'cambió la asignación',
  priority_change: 'cambió la prioridad',
};

function formatDateTime(iso) {
  return new Date(iso).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function TicketTimeline({ events }) {
  return (
    <div className="flex flex-col gap-3.5">
      {events.map((event) =>
        event.event_type === 'comment' ? (
          <div key={event.id} className="flex gap-2.5 items-start">
            <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex-shrink-0" />
            <div className="flex-1 bg-gray-50 rounded-lg px-3.5 py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[13px] font-semibold text-ink">{event.author_name}</span>
                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                  {event.author_role}
                </span>
                <span className="text-xs text-ink-faint">{formatDateTime(event.created_at)}</span>
              </div>
              <div className="text-sm text-ink-soft leading-relaxed">{event.comment_body}</div>
            </div>
          </div>
        ) : (
          <div key={event.id} className="flex gap-2.5 items-start">
            <div className="w-[22px] h-[22px] rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-[13px] text-ink-muted pt-0.5">
              <b className="text-ink-soft">{event.author_name}</b> {EVENT_LABEL[event.event_type]}
              {event.from_value && event.to_value && (
                <>
                  {' de '}
                  <b className="text-ink-soft">{event.from_value}</b>
                  {' a '}
                  <b className="text-ink-soft">{event.to_value}</b>
                </>
              )}
              {' · '}
              {formatDateTime(event.created_at)}
            </div>
          </div>
        )
      )}
    </div>
  );
}
