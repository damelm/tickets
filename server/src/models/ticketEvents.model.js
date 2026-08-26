import pool from '../db/pool.js';

export async function create({ ticketId, authorId, eventType, commentBody, fromValue, toValue }) {
  const { rows } = await pool.query(
    `INSERT INTO ticket_events (ticket_id, author_id, event_type, comment_body, from_value, to_value)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [ticketId, authorId, eventType, commentBody ?? null, fromValue ?? null, toValue ?? null]
  );
  return rows[0];
}

export async function listByTicket(ticketId) {
  const { rows } = await pool.query(
    `SELECT e.id, e.event_type, e.comment_body, e.from_value, e.to_value, e.created_at,
            e.author_id, u.full_name AS author_name, u.role AS author_role
     FROM ticket_events e
     JOIN users u ON u.id = e.author_id
     WHERE e.ticket_id = $1
     ORDER BY e.created_at ASC`,
    [ticketId]
  );
  return rows;
}
