import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { resetDb, createUser, startServer, baseUrl } from './helpers.js';

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

beforeEach(async () => {
  server ??= await startServer();
  url = baseUrl(server);
  await resetDb();
});

afterAll(() => server?.close());

describe('GET/PATCH /api/settings', () => {
  it('blocks non-admins', async () => {
    await createUser({ fullName: 'Empleado', email: 'empleado@test.com', role: 'empleado' });
    const token = await login('empleado@test.com');

    const getRes = await fetch(`${url}/api/settings`, { headers: { Authorization: `Bearer ${token}` } });
    expect(getRes.status).toBe(403);

    const patchRes = await fetch(`${url}/api/settings`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ googleAllowedDomain: 'empresa.com' }),
    });
    expect(patchRes.status).toBe(403);
  });

  it('rejects a malformed domain', async () => {
    await createUser({ fullName: 'Admin', email: 'admin@test.com', role: 'admin' });
    const token = await login('admin@test.com');

    const res = await fetch(`${url}/api/settings`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ googleAllowedDomain: 'not a domain' }),
    });

    expect(res.status).toBe(400);
  });

  it('persists a valid domain and reflects it on GET', async () => {
    await createUser({ fullName: 'Admin', email: 'admin@test.com', role: 'admin' });
    const token = await login('admin@test.com');
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    const patchRes = await fetch(`${url}/api/settings`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ googleAllowedDomain: 'empresa.com' }),
    });
    expect(patchRes.status).toBe(200);

    const getRes = await fetch(`${url}/api/settings`, { headers });
    const body = await getRes.json();
    expect(body.googleAllowedDomain).toBe('empresa.com');
  });
});
