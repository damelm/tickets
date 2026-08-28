import bcrypt from 'bcryptjs';
import pool from '../src/db/pool.js';
import app from '../src/app.js';

export async function resetDb() {
  // CASCADE also empties app_settings (it has a FK to users) — reseed its row after.
  await pool.query('TRUNCATE ticket_events, tickets, users, departments RESTART IDENTITY CASCADE');
  await pool.query(
    "INSERT INTO app_settings (key, value) VALUES ('google_allowed_domain', NULL) ON CONFLICT (key) DO UPDATE SET value = NULL"
  );
}

export async function createDepartment(name, acceptsTickets = true) {
  const { rows } = await pool.query(
    'INSERT INTO departments (name, accepts_tickets) VALUES ($1, $2) RETURNING id',
    [name, acceptsTickets]
  );
  return rows[0].id;
}

export async function createUser({ fullName, email, password = 'testpass123', role, departmentId = null, isActive = true }) {
  const passwordHash = await bcrypt.hash(password, 4);
  const { rows } = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role, department_id, is_active)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [fullName, email, passwordHash, role, departmentId, isActive]
  );
  return rows[0].id;
}

export function startServer() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => resolve(server));
  });
}

export function baseUrl(server) {
  return `http://localhost:${server.address().port}`;
}
