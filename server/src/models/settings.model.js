import pool from '../db/pool.js';

export async function getAll() {
  const { rows } = await pool.query('SELECT key, value FROM app_settings');
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function getValue(key) {
  const { rows } = await pool.query('SELECT value FROM app_settings WHERE key = $1', [key]);
  return rows[0]?.value ?? null;
}

export async function setValue(key, value, updatedByUserId) {
  const { rows } = await pool.query(
    `UPDATE app_settings SET value = $2, updated_by = $3, updated_at = now()
     WHERE key = $1 RETURNING key, value`,
    [key, value, updatedByUserId]
  );
  return rows[0] ?? null;
}
