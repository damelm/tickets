import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = process.env.DB_PATH || path.join(__dirname, '../database/tickets.db');
const db = new Database(dbPath);

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

// Crear tablas
export function initDatabase() {
  // Tabla de usuarios
  db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nombre TEXT NOT NULL,
      rol TEXT NOT NULL CHECK(rol IN ('Admin', 'Auxiliar')),
      activo INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabla de tickets
  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      estado TEXT NOT NULL DEFAULT 'Nuevo' CHECK(estado IN ('Nuevo', 'En curso', 'Pausado', 'Resuelto', 'Cerrado')),
      prioridad_usuario TEXT NOT NULL CHECK(prioridad_usuario IN ('Baja', 'Media', 'Alta', 'Crítica')),
      urgencia_validada TEXT NOT NULL CHECK(urgencia_validada IN ('Baja', 'Media', 'Alta', 'Crítica')),
      categoria TEXT NOT NULL,
      sede TEXT NOT NULL,
      titulo TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      solicitante TEXT NOT NULL,
      contacto TEXT NOT NULL,
      asignado TEXT,
      comentarios TEXT,
      ultima_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
      fecha_en_curso DATETIME,
      fecha_pausado DATETIME,
      fecha_resuelto DATETIME,
      fecha_cerrado DATETIME,
      pausa_acumulada_min INTEGER DEFAULT 0
    )
  `);

  // Tabla de historial
  db.exec(`
    CREATE TABLE IF NOT EXISTS historial (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      usuario TEXT NOT NULL,
      campo TEXT NOT NULL,
      valor_anterior TEXT,
      valor_nuevo TEXT,
      comentario TEXT,
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
    )
  `);

  // Tabla de configuración
  db.exec(`
    CREATE TABLE IF NOT EXISTS configuracion (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);

  // Insertar configuraciones por defecto si no existen
  const configs = [
    { key: 'sla_critica', value: '4' },
    { key: 'sla_alta', value: '8' },
    { key: 'sla_media', value: '24' },
    { key: 'sla_baja', value: '72' },
    { key: 'autocierre_horas', value: '72' },
    { key: 'email_enabled', value: 'true' }
  ];

  const insertConfig = db.prepare(`
    INSERT OR IGNORE INTO configuracion (key, value) VALUES (?, ?)
  `);

  for (const config of configs) {
    insertConfig.run(config.key, config.value);
  }

  console.log('✅ Base de datos inicializada correctamente');
}

export default db;
