import bcrypt from 'bcryptjs';
import pool from '../src/db/pool.js';

const DEPARTMENTS = [
  { name: 'Finanzas', accepts_tickets: true },
  { name: 'IT', accepts_tickets: true },
  { name: 'RRHH', accepts_tickets: true },
  { name: 'Compras', accepts_tickets: true },
  { name: 'Legal', accepts_tickets: true },
  { name: 'Marketing', accepts_tickets: true },
  { name: 'Ventas', accepts_tickets: true },
  { name: 'Operaciones', accepts_tickets: true },
  { name: 'Logística', accepts_tickets: true },
  { name: 'Atención al Cliente', accepts_tickets: true },
  { name: 'Administración', accepts_tickets: true },
  { name: 'Auditoría', accepts_tickets: false },
  { name: 'Seguridad', accepts_tickets: true },
  { name: 'Mantenimiento', accepts_tickets: true },
  { name: 'Calidad', accepts_tickets: true },
  { name: 'Comunicaciones', accepts_tickets: false },
  { name: 'Proyectos', accepts_tickets: true },
  { name: 'Dirección General', accepts_tickets: false },
];

const DEV_PASSWORD = 'devpass123';

async function upsertDepartment(dept) {
  const { rows } = await pool.query(
    `INSERT INTO departments (name, accepts_tickets)
     VALUES ($1, $2)
     ON CONFLICT (name) DO UPDATE SET accepts_tickets = EXCLUDED.accepts_tickets
     RETURNING id, name`,
    [dept.name, dept.accepts_tickets]
  );
  return rows[0];
}

async function upsertUser({ fullName, email, role, departmentId }, passwordHash) {
  const { rows } = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role, department_id)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role, department_id = EXCLUDED.department_id
     RETURNING id, email, role`,
    [fullName, email, passwordHash, role, departmentId ?? null]
  );
  return rows[0];
}

async function run() {
  const departmentsByName = {};
  for (const dept of DEPARTMENTS) {
    const row = await upsertDepartment(dept);
    departmentsByName[row.name] = row.id;
  }
  console.log(`departamentos: ${DEPARTMENTS.length}`);

  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 10);

  const users = await Promise.all([
    upsertUser({ fullName: 'María Gómez', email: 'maria.gomez@empresa.com', role: 'empleado', departmentId: departmentsByName['Finanzas'] }, passwordHash),
    upsertUser({ fullName: 'Ana López', email: 'ana.lopez@empresa.com', role: 'empleado', departmentId: departmentsByName['RRHH'] }, passwordHash),
    upsertUser({ fullName: 'Sebastián Ruiz', email: 'sebastian.ruiz@empresa.com', role: 'agente', departmentId: departmentsByName['IT'] }, passwordHash),
    upsertUser({ fullName: 'Diego Torres', email: 'diego.torres@empresa.com', role: 'agente', departmentId: departmentsByName['Compras'] }, passwordHash),
    upsertUser({ fullName: 'Laura Fernández', email: 'laura.fernandez@empresa.com', role: 'agente', departmentId: departmentsByName['Legal'] }, passwordHash),
    upsertUser({ fullName: 'Andrés López', email: 'andres.lopez@empresa.com', role: 'admin', departmentId: departmentsByName['Dirección General'] }, passwordHash),
  ]);
  console.log(`usuarios: ${users.length}`);

  const maria = users.find((u) => u.email === 'maria.gomez@empresa.com');
  const sebastian = users.find((u) => u.email === 'sebastian.ruiz@empresa.com');

  const { rows: existingTickets } = await pool.query('SELECT COUNT(*)::int AS count FROM tickets');
  if (existingTickets[0].count === 0) {
    const sampleTickets = [
      { subject: 'No puedo acceder a la VPN', description: 'Desde ayer no puedo conectarme a la VPN de la empresa.', department: 'IT', priority: 'alta', status: 'in_progress', assignedTo: sebastian.id },
      { subject: 'Reembolso de viáticos pendiente', description: 'Cargué el formulario hace dos semanas y no tengo novedades.', department: 'Finanzas', priority: 'baja', status: 'todo', assignedTo: null },
      { subject: 'Instalación de licencia de software', description: 'Necesito la licencia de Adobe para el nuevo equipo.', department: 'IT', priority: 'media', status: 'done', assignedTo: sebastian.id },
    ];
    for (const t of sampleTickets) {
      const { rows: ticketRows } = await pool.query(
        `INSERT INTO tickets (department_id, subject, description, priority, status, created_by, assigned_to)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
        [departmentsByName[t.department], t.subject, t.description, t.priority, t.status, maria.id, t.assignedTo]
      );
      await pool.query(
        `INSERT INTO ticket_events (ticket_id, author_id, event_type, comment_body)
         VALUES ($1, $2, 'comment', $3)`,
        [ticketRows[0].id, maria.id, t.description]
      );
    }
    console.log(`tickets de ejemplo: ${sampleTickets.length}`);
  }

  console.log('seed completo');
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
