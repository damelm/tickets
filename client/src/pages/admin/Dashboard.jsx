import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/AuthContext.jsx';
import { getStats } from '../../api/stats.js';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { PriorityBadge } from '../../components/PriorityBadge.jsx';
import { EmptyState } from '../../components/EmptyState.jsx';
import { ErrorState } from '../../components/ErrorState.jsx';
import { Skeleton } from '../../components/Skeleton.jsx';
import { Panel } from '../../components/dashboard/Panel.jsx';
import { KpiCard } from '../../components/dashboard/KpiCard.jsx';
import { BarRow } from '../../components/dashboard/BarRow.jsx';
import { MonthlyChart } from '../../components/dashboard/MonthlyChart.jsx';

const ABIERTOS = 'var(--color-accent)';
const RESUELTOS = 'var(--color-status-done-text)';

// urgente es el único token de prioridad cuyo color saturado vive en la variable -bg
const PRIORITY_FILL = {
  baja: 'var(--color-priority-baja-text)',
  media: 'var(--color-priority-media-text)',
  alta: 'var(--color-priority-alta-text)',
  urgente: 'var(--color-priority-urgente-bg)',
};

const num = (v, decimales = 0) => v.toLocaleString('es-AR', { maximumFractionDigits: decimales });

const share = (valor, total) => (total > 0 ? Math.round((valor / total) * 100) : 0);

function formatHoras(horas) {
  if (horas == null) return '—';
  if (horas < 24) return `${num(horas, 1)} h`;
  return `${num(horas / 24, 1)} días`;
}

export function Dashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let vigente = true;
    setLoading(true);
    setError(null);
    getStats(token)
      .then((data) => vigente && setStats(data))
      .catch((err) => vigente && setError(err.message))
      .finally(() => vigente && setLoading(false));
    return () => {
      vigente = false;
    };
  }, [token]);

  function reintentar() {
    setStats(null);
    setLoading(true);
    setError(null);
    getStats(token)
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  return (
    <div className="p-7 max-w-[1400px] mx-auto">
      <div className="mb-[18px]">
        <div className="font-semibold text-xl text-ink">Dashboard</div>
        <div className="text-sm text-ink-muted mt-0.5">Estado general del sistema de tickets.</div>
      </div>

      {loading && <DashboardSkeleton />}

      {!loading && error && (
        <ErrorState title="No pudimos cargar las métricas" message={error} onRetry={reintentar} className="py-24" />
      )}

      {!loading && !error && stats && <Contenido stats={stats} />}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="bg-surface border border-border rounded-lg px-4 py-3.5">
            <Skeleton width="60%" height={10} />
            <Skeleton width="45%" height={22} className="mt-2.5" />
            <Skeleton width="70%" height={9} className="mt-2.5" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-lg p-5 lg:col-span-2">
          <Skeleton width="30%" height={12} />
          <Skeleton height={192} className="mt-5" />
        </div>
        <div className="bg-surface border border-border rounded-lg p-5">
          <Skeleton width="45%" height={12} />
          <div className="flex flex-col gap-4 mt-5">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} height={10} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Contenido({ stats }) {
  const { totals, byStatus, byPriority, byDepartment, agentWorkload, monthly, resolution } = stats;

  if (totals.tickets === 0) {
    return (
      <EmptyState
        icon="inbox"
        title="Todavía no hay tickets"
        description="Cuando el equipo empiece a cargar tickets vas a ver acá el estado general del sistema."
      />
    );
  }

  const maxAgente = Math.max(1, ...agentWorkload.map((a) => a.openTickets));

  // el ranking tiene una cola larga de departamentos con muy poco volumen: mostrarla entera
  // aplasta las barras de los que importan
  const TOP_DEPARTAMENTOS = 8;
  const departamentos = byDepartment.slice(0, TOP_DEPARTAMENTOS);
  const restoDepartamentos = byDepartment.slice(TOP_DEPARTAMENTOS);
  const maxDepartamento = Math.max(1, ...departamentos.map((d) => d.total));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard label="Tickets" value={num(totals.tickets)} hint={`${num(totals.createdLast30d)} nuevos en 30 días`} />
        <KpiCard
          label="Abiertos"
          value={num(totals.open)}
          hint={`${share(totals.open, totals.tickets)}% del total`}
          tone="accent"
        />
        <KpiCard
          label="Resueltos"
          value={num(totals.resolved)}
          hint={`${num(totals.resolvedLast30d)} resueltos en 30 días`}
        />
        <KpiCard
          label="Sin asignar"
          value={num(totals.unassigned)}
          hint={totals.unassigned > 0 ? 'Esperando asignación' : 'Todo asignado'}
          tone={totals.unassigned > 0 ? 'alert' : 'default'}
        />
        <KpiCard
          label="Resolución media"
          value={formatHoras(resolution.avgHours)}
          hint={
            resolution.sampleSize > 0
              ? `Mediana ${formatHoras(resolution.medianHours)} · ${num(resolution.sampleSize)} tickets`
              : 'Sin tickets con historial'
          }
        />
        <KpiCard
          label="Usuarios activos"
          value={num(totals.activeUsers)}
          hint={`${num(totals.agents)} agentes · ${num(totals.activeDepartments)} departamentos`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel title="Creados vs. resueltos" hint="Últimos 6 meses" className="lg:col-span-2">
          <MonthlyChart data={monthly} />
        </Panel>

        <Panel title="Tickets por estado" hint={`${num(totals.tickets)} tickets en total`}>
          <div className="flex flex-col gap-3">
            {byStatus.map((s) => (
              <BarRow
                key={s.status}
                label={<StatusBadge status={s.status} />}
                value={num(s.count)}
                share={share(s.count, totals.tickets)}
                color={`var(--color-status-${s.status}-text)`}
              />
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Panel
          title="Tickets por departamento"
          hint={
            restoDepartamentos.length > 0
              ? `Top ${departamentos.length} por volumen, de ${byDepartment.length} departamentos`
              : 'Ordenado por volumen total'
          }
          className="lg:col-span-2"
        >
          <div className="flex flex-col gap-3.5">
            {departamentos.map((d) => (
              <div key={d.departmentId}>
                <div className="flex items-baseline justify-between gap-3 mb-1.5">
                  <span className="text-[13px] text-ink truncate">{d.departmentName}</span>
                  <span className="text-[13px] text-ink-muted tabular-nums shrink-0">
                    <span className="text-ink font-medium">{num(d.total)}</span> · {num(d.open)} abiertos
                  </span>
                </div>
                <div className="flex h-2 gap-px" style={{ width: `${(d.total / maxDepartamento) * 100}%` }}>
                  <div
                    className="rounded-l-full"
                    style={{ width: `${share(d.open, d.total)}%`, background: ABIERTOS }}
                    title={`${d.open} abiertos`}
                  />
                  <div
                    className="flex-1 rounded-r-full"
                    style={{ background: RESUELTOS }}
                    title={`${d.resolved} resueltos`}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-4 mt-4 text-xs text-ink-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: ABIERTOS }} /> Abiertos
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ background: RESUELTOS }} /> Resueltos
              </span>
            </div>
            {restoDepartamentos.length > 0 && (
              <span className="text-ink-faint">
                +{restoDepartamentos.length} departamentos con {num(restoDepartamentos.reduce((acc, d) => acc + d.total, 0))} tickets
              </span>
            )}
          </div>
        </Panel>

        <Panel title="Tickets por prioridad" hint="Distribución sobre el total">
          <div className="flex flex-col gap-3">
            {byPriority.map((p) => (
              <BarRow
                key={p.priority}
                label={<PriorityBadge priority={p.priority} />}
                value={num(p.count)}
                share={share(p.count, totals.tickets)}
                color={PRIORITY_FILL[p.priority]}
              />
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Carga de trabajo por agente" hint="Agentes con más tickets abiertos asignados">
        {agentWorkload.length === 0 ? (
          <div className="text-sm text-ink-muted py-4">No hay tickets abiertos asignados a agentes.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[520px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-1 pb-2 text-xs font-semibold text-ink-muted uppercase tracking-wide">Agente</th>
                  <th className="text-left px-1 pb-2 text-xs font-semibold text-ink-muted uppercase tracking-wide">Departamento</th>
                  <th className="text-left px-1 pb-2 text-xs font-semibold text-ink-muted uppercase tracking-wide w-[40%]">Abiertos</th>
                  <th className="text-right px-1 pb-2 text-xs font-semibold text-ink-muted uppercase tracking-wide">Resueltos</th>
                  <th className="text-right px-1 pb-2 text-xs font-semibold text-ink-muted uppercase tracking-wide">Asignados</th>
                </tr>
              </thead>
              <tbody>
                {agentWorkload.map((a) => (
                  <tr key={a.agentId} className="border-b border-gray-100 last:border-b-0">
                    <td className="px-1 py-2.5 text-sm text-ink">{a.agentName}</td>
                    <td className="px-1 py-2.5 text-[13px] text-ink-muted">{a.departmentName ?? '—'}</td>
                    <td className="px-1 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="flex-1 min-w-16 h-2 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${(a.openTickets / maxAgente) * 100}%`, background: ABIERTOS }}
                          />
                        </div>
                        <span className="text-[13px] text-ink tabular-nums w-6 text-right">{a.openTickets}</span>
                      </div>
                    </td>
                    <td className="px-1 py-2.5 text-[13px] text-ink-muted tabular-nums text-right">{num(a.resolvedTickets)}</td>
                    <td className="px-1 py-2.5 text-[13px] text-ink-muted tabular-nums text-right">{num(a.totalAssigned)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
