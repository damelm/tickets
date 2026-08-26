import pool from '../db/pool.js';

export async function findByEmail(email) {
  const { rows } = await pool.query(
    `SELECT id, full_name, email, password_hash, role, department_id, is_active
     FROM users WHERE email = $1`,
    [email]
  );
  return rows[0] ?? null;
}

export async function findById(id) {
  const { rows } = await pool.query(
    `SELECT id, full_name, email, role, department_id, is_active
     FROM users WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function listAgentsByDepartment(departmentId) {
  const { rows } = await pool.query(
    `SELECT id, full_name FROM users
     WHERE role = 'agente' AND department_id = $1 AND is_active = true
     ORDER BY full_name`,
    [departmentId]
  );
  return rows;
}

export async function list({ roles, departmentIds, isActive, q, page, pageSize }) {
  const conditions = [];
  const params = [];

  if (roles?.length) {
    params.push(roles);
    conditions.push(`role = ANY($${params.length})`);
  }
  if (departmentIds?.length) {
    params.push(departmentIds);
    conditions.push(`department_id = ANY($${params.length})`);
  }
  if (isActive !== undefined) {
    params.push(isActive);
    conditions.push(`is_active = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    conditions.push(`(full_name ILIKE $${params.length} OR email ILIKE $${params.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * pageSize;

  params.push(pageSize, offset);
  const { rows } = await pool.query(
    `SELECT id, full_name, email, role, department_id, is_active, created_at
     FROM users ${where}
     ORDER BY full_name
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM users ${where}`,
    params.slice(0, params.length - 2)
  );

  return { items: rows, total: countRows[0].total };
}

export async function create({ fullName, email, passwordHash, role, departmentId }) {
  const { rows } = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role, department_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, full_name, email, role, department_id, is_active`,
    [fullName, email, passwordHash, role, departmentId ?? null]
  );
  return rows[0];
}

export async function update(id, { role, departmentId, isActive }) {
  const { rows } = await pool.query(
    `UPDATE users SET
       role = COALESCE($2, role),
       department_id = COALESCE($3, department_id),
       is_active = COALESCE($4, is_active),
       updated_at = now()
     WHERE id = $1
     RETURNING id, full_name, email, role, department_id, is_active`,
    [id, role ?? null, departmentId ?? null, isActive ?? null]
  );
  return rows[0] ?? null;
}
