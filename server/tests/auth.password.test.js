import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { resetDb, createUser, startServer, baseUrl } from './helpers.js';

let server;
let url;

beforeEach(async () => {
  server ??= await startServer();
  url = baseUrl(server);
  await resetDb();
});

afterAll(() => server?.close());

describe('POST /api/auth/login', () => {
  it('logs in with valid credentials and returns the expected shape', async () => {
    await createUser({ fullName: 'Ana Test', email: 'ana@test.com', password: 'secreto123', role: 'empleado' });

    const res = await fetch(`${url}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ana@test.com', password: 'secreto123' }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({
      token: expect.any(String),
      user: { email: 'ana@test.com', role: 'empleado' },
    });
  });

  it('rejects a wrong password', async () => {
    await createUser({ fullName: 'Ana Test', email: 'ana@test.com', password: 'secreto123', role: 'empleado' });

    const res = await fetch(`${url}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ana@test.com', password: 'mala' }),
    });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBeTruthy();
  });

  it('rejects an unknown email with the same generic message as a wrong password', async () => {
    const res = await fetch(`${url}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nadie@test.com', password: 'x' }),
    });
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe('Credenciales inválidas');
  });

  it('rejects an inactive user', async () => {
    await createUser({ fullName: 'Inactivo', email: 'inactivo@test.com', password: 'secreto123', role: 'empleado', isActive: false });

    const res = await fetch(`${url}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'inactivo@test.com', password: 'secreto123' }),
    });

    expect(res.status).toBe(401);
  });
});
