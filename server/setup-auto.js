import 'dotenv/config';
import bcrypt from 'bcryptjs';
import db, { initDatabase } from './database.js';

async function setup() {
  console.log('\n🎯 Configuración Inicial - Sistema de Tickets Siete Fronteras\n');

  // Inicializar base de datos
  initDatabase();

  // Verificar si ya existe un administrador
  const existingAdmin = db.prepare('SELECT * FROM usuarios WHERE rol = ?').get('Admin');

  if (existingAdmin) {
    console.log('⚠️  Ya existe un usuario administrador en el sistema.');
    console.log('\n✅ Configuración completada. El sistema está listo para usar.');
    return;
  }

  console.log('📝 Creando Usuario Administrador por defecto:\n');

  const nombre = 'Administrador';
  const email = 'admin@sietefronteras.com.py';
  const password = 'Admin123!';

  // Hash de password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Insertar usuario
  try {
    const stmt = db.prepare(`
      INSERT INTO usuarios (email, password, nombre, rol, activo)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(email, hashedPassword, nombre, 'Admin', 1);

    console.log('✅ Usuario administrador creado exitosamente!');
    console.log('\n📋 Credenciales:');
    console.log(`   Email: ${email}`);
    console.log(`   Contraseña: ${password}`);
    console.log('\n⚠️  IMPORTANTE: Guarda estas credenciales en un lugar seguro.');
    console.log('\n✅ Sistema listo para usar. Ejecuta "npm run dev" para iniciar.\n');

  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      console.log('\n❌ Error: Ya existe un usuario con ese email');
    } else {
      console.log('\n❌ Error al crear usuario:', error.message);
    }
  }
}

setup().catch(console.error);
