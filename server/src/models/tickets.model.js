import pool from '../db/pool.js';

const TICKET_SELECT = `
  SELECT t.id, t.department_id, d.name AS department_name, t.subject, t.description,
         t.priority, t.status, t.created_by, cu.full_name AS created_by_name,
         t.assigned_to, au.full_name AS assigned_to_name,
         t.created_at, t.updated_at
  FROM tickets t
  JOIN departments d ON d.id = t.department_id
  JOIN users cu ON cu.id = t.created_by
  LEFT JOIN users au ON au.id = t.assigned_to
`;

export async function create({ departmentId, subject, description, priority, createdBy }) {
  const { rows } = await pool.query(
    `INSERT INTO tickets (department_id, subject, description, priority, created_by)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [departmentId, subject, description, priority, createdBy]
  );
  return findById(rows[0].id);
}

export async function findById(id) {
  const { rows } = await pool.query(`${TICKET_SELECT} WHERE t.id = $1`, [id]);
  return rows[0] ?? null;
}

export async function findMine({ createdBy, page, pageSize }) {
  const offset = (page - 1) * pageSize;
  const { rows } = await pool.query(
    `${TICKET_SELECT} WHERE t.created_by = $1 ORDER BY t.created_at DESC LIMIT $2 OFFSET $3`,
    [createdBy, pageSize, offset]
  );
  const { rows: countRows } = await pool.query(
    'SELECT COUNT(*)::int AS total FROM tickets WHERE created_by = $1',
    [createdBy]
  );
  return { items: rows, total: countRows[0].total };
}

export async function findFiltered({ departmentId, statuses, priorities, assignedTo, q, page, pageSize }) {
  const conditions = [];
  const params = [];

  if (departmentId) {
    params.push(departmentId);
    conditions.push(`t.department_id = $${params.length}`);
  }
  if (statuses?.length) {
    params.push(statuses);
    conditions.push(`t.status = ANY($${params.length})`);
  }
  if (priorities?.length) {
    params.push(priorities);
    conditions.push(`t.priority = ANY($${params.length})`);
  }
  if (assignedTo) {
    params.push(assignedTo);
    conditions.push(`t.assigned_to = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    conditions.push(`t.subject ILIKE $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * pageSize;

  params.push(pageSize, offset);
  const { rows } = await pool.query(
    `${TICKET_SELECT} ${where} ORDER BY t.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*)::int AS total FROM tickets t ${where}`,
    params.slice(0, params.length - 2)
  );

  return { items: rows, total: countRows[0].total };
}

export async function updateStatus(id, status) {
  const { rows } = await pool.query(
    'UPDATE tickets SET status = $2, updated_at = now() WHERE id = $1 RETURNING id',
    [id, status]
  );
  return rows[0] ?? null;
}

export async function updateAssignment(id, assignedTo) {
  const { rows } = await pool.query(
    'UPDATE tickets SET assigned_to = $2, updated_at = now() WHERE id = $1 RETURNING id',
    [id, assignedTo]
  );
  return rows[0] ?? null;
}

export async function updatePriority(id, priority) {
  const { rows } = await pool.query(
    'UPDATE tickets SET priority = $2, updated_at = now() WHERE id = $1 RETURNING id',
    [id, priority]
  );
  return rows[0] ?? null;
}
