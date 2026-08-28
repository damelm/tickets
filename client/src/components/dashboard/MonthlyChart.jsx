const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const CREADOS = 'var(--color-accent)';
const RESUELTOS = 'var(--color-status-done-text)';

function etiquetaMes(month) {
  const [anio, mes] = month.split('-');
  return `${MESES[Number(mes) - 1]} ${anio.slice(2)}`;
}

function Barra({ valor, max, color, titulo }) {
  const alto = max === 0 ? 0 : (valor / max) * 100;
  return (
    <div
      title={titulo}
      className="w-full max-w-6 rounded-t-sm"
      style={{ height: valor > 0 ? `max(${alto}%, 3px)` : 0, background: color }}
    />
  );
}

export function MonthlyChart({ data }) {
  const max = Math.max(1, ...data.flatMap((m) => [m.created, m.resolved]));
  const mitad = Math.round(max / 2);

  return (
    <div>
      <div className="relative h-48 pl-9">
        {[max, mitad, 0].map((valor, i) => (
          <div key={valor + '-' + i} className="absolute left-9 right-0 border-t border-border" style={{ top: `${i * 50}%` }}>
            <span className="absolute -left-9 -top-2 w-7 text-right text-[10px] text-ink-faint tabular-nums">{valor}</span>
          </div>
        ))}
        <div className="absolute inset-y-0 left-9 right-0 flex items-end gap-1.5 sm:gap-3">
          {data.map((m) => (
            <div key={m.month} className="flex-1 h-full flex items-end justify-center gap-0.5 sm:gap-1">
              <Barra valor={m.created} max={max} color={CREADOS} titulo={`${etiquetaMes(m.month)}: ${m.created} creados`} />
              <Barra valor={m.resolved} max={max} color={RESUELTOS} titulo={`${etiquetaMes(m.month)}: ${m.resolved} resueltos`} />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-1.5 sm:gap-3 pl-9 mt-2">
        {data.map((m) => (
          <div key={m.month} className="flex-1 text-center text-[11px] text-ink-muted">
            {etiquetaMes(m.month)}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 pl-9 mt-4 text-xs text-ink-muted">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: CREADOS }} /> Creados
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: RESUELTOS }} /> Resueltos
        </span>
      </div>
    </div>
  );
}
