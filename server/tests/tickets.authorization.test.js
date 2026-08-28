import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { resetDb, createUser, createDepartment, startServer, baseUrl } from './helpers.js';
import pool from '../src/db/pool.js';

let server;
let url;

async function login(email, password = 'testpass123') {
  const res = await fetch(`${url}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return (await res.json()).token;
}

beforeEach(async () => {
  server ??= await startServer();
  url = baseUrl(server);
  await resetDb();
});

afterAll(() => server?.close());

describe('department-scoped ticket authorization', () => {
  it('blocks an agent from another department from viewing or acting on a ticket', async () => {
    const itId = await createDepartment('IT');
    const legalId = await createDepartment('Legal');
    await createUser({ fullName: 'Empleado', email: 'empleado@test.com', role: 'empleado', departmentId: itId });
    await createUser({ fullName: 'Agente IT', email: 'agente.it@test.com', role: 'agente', departmentId: itId });
    await createUser({ fullName: 'Agente Legal', email: 'agente.legal@test.com', role: 'agente', departmentId: legalId });

    const { rows } = await pool.query(
      `INSERT INTO tickets (department_id, subject, description, created_by)
       VALUES ($1, 'Asunto', 'Desc', (SELECT id FROM users WHERE email = 'empleado@test.com')) RETURNING id`,
      [itId]
    );
    const ticketId = rows[0].id;

    const legalToken = await login('agente.legal@test.com');
    const viewRes = await fetch(`${url}/api/tickets/${ticketId}`, { headers: { Authorization: `Bearer ${legalToken}` } });
    expect(viewRes.status).toBe(403);

    const statusRes = await fetch(`${url}/api/tickets/${ticketId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${legalToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'done' }),
    });
    expect(statusRes.status).toBe(403);

    const itToken = await login('agente.it@test.com');
    const okRes = await fetch(`${url}/api/tickets/${ticketId}`, { headers: { Authorization: `Bearer ${itToken}` } });
    expect(okRes.status).toBe(200);
  });

  it('lets admin view and act on tickets from any department', async () => {
    const itId = await createDepartment('IT');
    await createUser({ fullName: 'Empleado', email: 'empleado@test.com', role: 'empleado', departmentId: itId });
    await createUser({ fullName: 'Admin', email: 'admin@test.com', role: 'admin' });

    const { rows } = await pool.query(
      `INSERT INTO tickets (department_id, subject, description, created_by)
       VALUES ($1, 'Asunto', 'Desc', (SELECT id FROM users WHERE email = 'empleado@test.com')) RETURNING id`,
      [itId]
    );

    const adminToken = await login('admin@test.com');
    const res = await fetch(`${url}/api/tickets/${rows[0].id}`, { headers: { Authorization: `Bearer ${adminToken}` } });

    expect(res.status).toBe(200);
  });
});
