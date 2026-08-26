import pool from '../db/pool.js';

export async function list({ onlyAcceptingTickets } = {}) {
  const where = onlyAcceptingTickets ? 'WHERE accepts_tickets = true' : '';
  const { rows } = await pool.query(
    `SELECT d.id, d.name, d.accepts_tickets,
       (SELECT COUNT(*)::int FROM users u WHERE u.department_id = d.id) AS member_count
     FROM departments d ${where}
     ORDER BY d.name`
  );
  return rows;
}

export async function findById(id) {
  const { rows } = await pool.query('SELECT id, name, accepts_tickets FROM departments WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function setAcceptsTickets(id, acceptsTickets) {
  const { rows } = await pool.query(
    'UPDATE departments SET accepts_tickets = $2 WHERE id = $1 RETURNING id, name, accepts_tickets',
    [id, acceptsTickets]
  );
  return rows[0] ?? null;
}
