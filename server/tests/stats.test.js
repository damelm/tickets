import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import pool from '../src/db/pool.js';
import { resetDb, createDepartment, createUser, startServer, baseUrl } from './helpers.js';

let server;
let url;

async function login(email) {
  const res = await fetch(`${url}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'testpass123' }),
  });
  return (await res.json()).token;
}

function getStats(token) {
  return fetch(`${url}/api/stats`, { headers: { Authorization: `Bearer ${token}` } });
}

async function createTicket({ departmentId, createdBy, assignedTo = null, status, priority = 'media', daysAgo = 0 }) {
  const { rows } = await pool.query(
    `INSERT INTO tickets (department_id, subject, description, priority, status, created_by, assigned_to, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, now() - make_interval(days => $8::int), now())
     RETURNING id`,
    [departmentId, 'Asunto de prueba', 'Descripción de prueba', priority, status, createdBy, assignedTo, daysAgo]
  );
  return rows[0].id;
}

async function markResolved(ticketId, authorId, hoursToResolve, daysAgo) {
  await pool.query(
    `INSERT INTO ticket_events (ticket_id, author_id, event_type, from_value, to_value, created_at)
     VALUES ($1, $2, 'status_change', 'review', 'done', now() - make_interval(days => $3::int) + make_interval(hours => $4::int))`,
    [ticketId, authorId, daysAgo, hoursToResolve]
  );
}

beforeEach(async () => {
  server ??= await startServer();
  url = baseUrl(server);
  await resetDb();
});

afterAll(() => server?.close());

describe('GET /api/stats', () => {
  it('blocks non-admins', async () => {
    const departmentId = await createDepartment('IT');
    await createUser({ fullName: 'Empleado', email: 'empleado@test.com', role: 'empleado', departmentId });
    await createUser({ fullName: 'Agente', email: 'agente@test.com', role: 'agente', departmentId });

    for (const email of ['empleado@test.com', 'agente@test.com']) {
      const res = await getStats(await login(email));
      expect(res.status).toBe(403);
    }
  });

  it('requires authentication', async () => {
    const res = await fetch(`${url}/api/stats`);
    expect(res.status).toBe(401);
  });

  it('returns every status and priority bucket even with no tickets', async () => {
    await createUser({ fullName: 'Admin', email: 'admin@test.com', role: 'admin' });
    const res = await getStats(await login('admin@test.com'));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.totals.tickets).toBe(0);
    expect(body.byStatus.map((s) => s.status)).toEqual(['backlog', 'todo', 'in_progress', 'review', 'done']);
    expect(body.byStatus.every((s) => s.count === 0)).toBe(true);
    expect(body.byPriority.map((p) => p.priority)).toEqual(['baja', 'media', 'alta', 'urgente']);
    expect(body.byDepartment).toEqual([]);
    expect(body.agentWorkload).toEqual([]);
    expect(body.monthly).toHaveLength(6);
    expect(body.resolution).toEqual({ avgHours: null, medianHours: null, sampleSize: 0 });
  });

  it('aggregates seeded tickets into coherent metrics', async () => {
    const itId = await createDepartment('IT');
    const rrhhId = await createDepartment('RRHH');
    await createDepartment('Auditoría', false);

    await createUser({ fullName: 'Admin', email: 'admin@test.com', role: 'admin' });
    const agentId = await createUser({ fullName: 'Agente IT', email: 'agente@test.com', role: 'agente', departmentId: itId });
    const employeeId = await createUser({ fullName: 'Empleado', email: 'empleado@test.com', role: 'empleado', departmentId: itId });
    await createUser({ fullName: 'Baja', email: 'baja@test.com', role: 'empleado', departmentId: rrhhId, isActive: false });

    await createTicket({ departmentId: itId, createdBy: employeeId, status: 'backlog', priority: 'baja' });
    await createTicket({ departmentId: itId, createdBy: employeeId, assignedTo: agentId, status: 'in_progress', priority: 'alta' });
    await createTicket({ departmentId: itId, createdBy: employeeId, assignedTo: agentId, status: 'review', priority: 'urgente' });
    await createTicket({ departmentId: rrhhId, createdBy: employeeId, status: 'todo' });

    const fastTicket = await createTicket({ departmentId: itId, createdBy: employeeId, assignedTo: agentId, status: 'done', daysAgo: 10 });
    const slowTicket = await createTicket({ departmentId: itId, createdBy: employeeId, assignedTo: agentId, status: 'done', daysAgo: 10 });
    await markResolved(fastTicket, agentId, 10, 10);
    await markResolved(slowTicket, agentId, 30, 10);

    const body = await (await getStats(await login('admin@test.com'))).json();

    expect(body.totals).toMatchObject({
      tickets: 6,
      open: 4,
      resolved: 2,
      unassigned: 2,
      createdLast30d: 6,
      resolvedLast30d: 2,
      activeUsers: 3,
      agents: 1,
      activeDepartments: 2,
    });

    const statusCounts = Object.fromEntries(body.byStatus.map((s) => [s.status, s.count]));
    expect(statusCounts).toEqual({ backlog: 1, todo: 1, in_progress: 1, review: 1, done: 2 });

    const priorityCounts = Object.fromEntries(body.byPriority.map((p) => [p.priority, p.count]));
    expect(priorityCounts).toEqual({ baja: 1, media: 3, alta: 1, urgente: 1 });

    expect(body.byDepartment).toEqual([
      { departmentId: Number(itId), departmentName: 'IT', total: 5, open: 3, resolved: 2 },
      { departmentId: Number(rrhhId), departmentName: 'RRHH', total: 1, open: 1, resolved: 0 },
    ]);

    expect(body.agentWorkload).toEqual([
      { agentId: Number(agentId), agentName: 'Agente IT', departmentName: 'IT', openTickets: 2, resolvedTickets: 2, totalAssigned: 4 },
    ]);

    const currentMonth = body.monthly.at(-1);
    expect(currentMonth.month).toBe(new Date().toISOString().slice(0, 7));
    expect(body.monthly.reduce((sum, m) => sum + m.created, 0)).toBe(6);
    expect(body.monthly.reduce((sum, m) => sum + m.resolved, 0)).toBe(2);

    expect(body.resolution).toEqual({ avgHours: 20, medianHours: 20, sampleSize: 2 });
  });
});
