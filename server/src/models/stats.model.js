import pool from '../db/pool.js';

const MONTHS_IN_SERIES = 6;
const AGENT_WORKLOAD_LIMIT = 10;

// El tiempo de resolución se mide contra el ticket_event de cambio a 'done' (el más
// reciente por ticket), no contra updated_at: updated_at se mueve con cualquier edición
// posterior y mentiría. Los tickets en 'done' sin ese evento quedan fuera de la muestra.
const RESOLVED_AT = `
  SELECT t.id, t.created_at, MAX(e.created_at) AS resolved_at
  FROM tickets t
  JOIN ticket_events e ON e.ticket_id = t.id AND e.event_type = 'status_change' AND e.to_value = 'done'
  WHERE t.status = 'done'
  GROUP BY t.id, t.created_at
`;

async function totals() {
  const { rows } = await pool.query(`
    SELECT COUNT(*)::int AS tickets,
           COUNT(*) FILTER (WHERE status <> 'done')::int AS open,
           COUNT(*) FILTER (WHERE status = 'done')::int AS resolved,
           COUNT(*) FILTER (WHERE status <> 'done' AND assigned_to IS NULL)::int AS unassigned,
           COUNT(*) FILTER (WHERE created_at >= now() - interval '30 days')::int AS created_last_30d,
           (SELECT COUNT(DISTINCT ticket_id) FROM ticket_events
             WHERE event_type = 'status_change' AND to_value = 'done'
               AND created_at >= now() - interval '30 days')::int AS resolved_last_30d,
           (SELECT COUNT(*) FROM users WHERE is_active)::int AS active_users,
           (SELECT COUNT(*) FROM users WHERE is_active AND role = 'agente')::int AS agents,
           (SELECT COUNT(*) FROM departments WHERE accepts_tickets)::int AS active_departments
    FROM tickets
  `);
  return rows[0];
}

async function byStatus() {
  const { rows } = await pool.query(`
    SELECT s.status, COUNT(t.id)::int AS count
    FROM unnest(ARRAY['backlog', 'todo', 'in_progress', 'review', 'done']) WITH ORDINALITY AS s(status, ord)
    LEFT JOIN tickets t ON t.status = s.status
    GROUP BY s.status, s.ord
    ORDER BY s.ord
  `);
  return rows;
}

async function byPriority() {
  const { rows } = await pool.query(`
    SELECT p.priority, COUNT(t.id)::int AS count
    FROM unnest(ARRAY['baja', 'media', 'alta', 'urgente']) WITH ORDINALITY AS p(priority, ord)
    LEFT JOIN tickets t ON t.priority = p.priority
    GROUP BY p.priority, p.ord
    ORDER BY p.ord
  `);
  return rows;
}

async function byDepartment() {
  const { rows } = await pool.query(`
    SELECT d.id, d.name,
           COUNT(t.id)::int AS total,
           COUNT(t.id) FILTER (WHERE t.status <> 'done')::int AS open,
           COUNT(t.id) FILTER (WHERE t.status = 'done')::int AS resolved
    FROM departments d
    JOIN tickets t ON t.department_id = d.id
    GROUP BY d.id, d.name
    ORDER BY total DESC, d.name ASC
  `);
  return rows.map((r) => ({
    departmentId: Number(r.id),
    departmentName: r.name,
    total: r.total,
    open: r.open,
    resolved: r.resolved,
  }));
}

async function agentWorkload() {
  const { rows } = await pool.query(
    `SELECT u.id, u.full_name, d.name AS department_name,
            COUNT(*) FILTER (WHERE t.status <> 'done')::int AS open_tickets,
            COUNT(*) FILTER (WHERE t.status = 'done')::int AS resolved_tickets,
            COUNT(*)::int AS total_assigned
     FROM users u
     JOIN tickets t ON t.assigned_to = u.id
     LEFT JOIN departments d ON d.id = u.department_id
     WHERE u.role = 'agente'
     GROUP BY u.id, u.full_name, d.name
     HAVING COUNT(*) FILTER (WHERE t.status <> 'done') > 0
     ORDER BY open_tickets DESC, u.full_name ASC
     LIMIT $1`,
    [AGENT_WORKLOAD_LIMIT]
  );
  return rows.map((r) => ({
    agentId: Number(r.id),
    agentName: r.full_name,
    departmentName: r.department_name,
    openTickets: r.open_tickets,
    resolvedTickets: r.resolved_tickets,
    totalAssigned: r.total_assigned,
  }));
}

async function monthlySeries() {
  const { rows } = await pool.query(
    `WITH months AS (
       SELECT generate_series(
         date_trunc('month', now()) - make_interval(months => $1::int - 1),
         date_trunc('month', now()),
         interval '1 month'
       ) AS month
     )
     SELECT to_char(m.month, 'YYYY-MM') AS month,
            (SELECT COUNT(*) FROM tickets t
              WHERE t.created_at >= m.month AND t.created_at < m.month + interval '1 month')::int AS created,
            (SELECT COUNT(DISTINCT e.ticket_id) FROM ticket_events e
              WHERE e.event_type = 'status_change' AND e.to_value = 'done'
                AND e.created_at >= m.month AND e.created_at < m.month + interval '1 month')::int AS resolved
     FROM months m
     ORDER BY m.month`,
    [MONTHS_IN_SERIES]
  );
  return rows;
}

async function resolution() {
  const { rows } = await pool.query(`
    WITH resolved AS (${RESOLVED_AT})
    SELECT COUNT(*)::int AS sample_size,
           ROUND(AVG(EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600)::numeric, 1)::float8 AS avg_hours,
           ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (
             ORDER BY EXTRACT(EPOCH FROM (resolved_at - created_at)) / 3600
           )::numeric, 1)::float8 AS median_hours
    FROM resolved
  `);
  const { sample_size: sampleSize, avg_hours: avgHours, median_hours: medianHours } = rows[0];
  return { avgHours: avgHours ?? null, medianHours: medianHours ?? null, sampleSize };
}

export async function getDashboardStats() {
  const [general, statuses, priorities, departments, agents, monthly, resolutionStats] = await Promise.all([
    totals(),
    byStatus(),
    byPriority(),
    byDepartment(),
    agentWorkload(),
    monthlySeries(),
    resolution(),
  ]);

  return {
    totals: {
      tickets: general.tickets,
      open: general.open,
      resolved: general.resolved,
      unassigned: general.unassigned,
      createdLast30d: general.created_last_30d,
      resolvedLast30d: general.resolved_last_30d,
      activeUsers: general.active_users,
      agents: general.agents,
      activeDepartments: general.active_departments,
    },
    byStatus: statuses,
    byPriority: priorities,
    byDepartment: departments,
    agentWorkload: agents,
    monthly,
    resolution: resolutionStats,
  };
}
