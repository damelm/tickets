import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import jwt from 'jsonwebtoken';

const verifyIdToken = vi.fn();

vi.mock('google-auth-library', () => ({
  OAuth2Client: vi.fn().mockImplementation(function OAuth2Client() {
    return { verifyIdToken };
  }),
}));

const { resetDb, createUser, createDepartment, startServer, baseUrl } = await import('./helpers.js');
const pool = (await import('../src/db/pool.js')).default;

let server;
let url;

beforeEach(async () => {
  server ??= await startServer();
  url = baseUrl(server);
  await resetDb();
  verifyIdToken.mockReset();
});

afterAll(() => server?.close());

function mockPayload(payload) {
  verifyIdToken.mockResolvedValue({ getPayload: () => payload });
}

async function googleLogin() {
  const res = await fetch(`${url}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: 'fake-id-token' }),
  });
  return { res, body: await res.json() };
}

describe('POST /api/auth/google', () => {
  it('logs in a verified, active, pre-existing user with no domain restriction', async () => {
    await createUser({ fullName: 'Ana Test', email: 'ana@test.com', role: 'empleado' });
    mockPayload({ email: 'ana@test.com', email_verified: true });

    const { res, body } = await googleLogin();

    expect(res.status).toBe(200);
    expect(body.user.email).toBe('ana@test.com');

    const decoded = jwt.decode(body.token);
    expect(decoded).toMatchObject({ role: 'empleado' });
  });

  it('rejects a domain mismatch when a restriction is set', async () => {
    await createUser({ fullName: 'Ana Test', email: 'ana@otra.com', role: 'empleado' });
    await pool.query("UPDATE app_settings SET value = 'test.com' WHERE key = 'google_allowed_domain'");
    mockPayload({ email: 'ana@otra.com', email_verified: true });

    const { res } = await googleLogin();

    expect(res.status).toBe(403);
  });

  it('rejects an unverified email', async () => {
    await createUser({ fullName: 'Ana Test', email: 'ana@test.com', role: 'empleado' });
    mockPayload({ email: 'ana@test.com', email_verified: false });

    const { res } = await googleLogin();

    expect(res.status).toBe(401);
  });

  it('rejects an email with no matching user', async () => {
    mockPayload({ email: 'nadie@test.com', email_verified: true });

    const { res } = await googleLogin();

    expect(res.status).toBe(401);
  });

  it('rejects an inactive user', async () => {
    await createUser({ fullName: 'Inactivo', email: 'inactivo@test.com', role: 'empleado', isActive: false });
    mockPayload({ email: 'inactivo@test.com', email_verified: true });

    const { res } = await googleLogin();

    expect(res.status).toBe(401);
  });

  it('issues a JWT with the same payload shape as password login', async () => {
    const deptId = await createDepartment('IT');
    await createUser({ fullName: 'Ana Test', email: 'ana@test.com', role: 'agente', departmentId: deptId });
    mockPayload({ email: 'ana@test.com', email_verified: true });

    const { body } = await googleLogin();
    const decoded = jwt.decode(body.token);

    expect(decoded).toMatchObject({ role: 'agente', departmentId: String(deptId) });
    expect(decoded.sub).toBeTruthy();
  });
});
