import 'dotenv/config';
import bcrypt from 'bcryptjs';
import db, { initDatabase } from './database.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('\n🎯 Configuración Inicial - Sistema de Tickets Siete Fronteras\n');

  // Inicializar base de datos
  initDatabase();

  // Verificar si ya existe un administrador
  const existingAdmin = db.prepare('SELECT * FROM usuarios WHERE rol = ?').get('Admin');

  if (existingAdmin) {
    console.log('⚠️  Ya existe un usuario administrador en el sistema.');
    const response = await question('¿Deseas crear otro administrador? (s/n): ');

    if (response.toLowerCase() !== 's') {
      console.log('\n✅ Configuración completada. El sistema está listo para usar.');
      rl.close();
      return;
    }
  }

  console.log('\n📝 Creación de Usuario Administrador:\n');

  // Solicitar datos del administrador
  const nombre = await question('Nombre completo: ') || 'Administrador';
  const email = await question('Email: ') || 'admin@sietefronteras.com.py';
  const password = await question('Contraseña (mínimo 6 caracteres): ') || 'Admin123!';

  // Validar
  if (password.length < 6) {
    console.log('\n❌ Error: La contraseña debe tener al menos 6 caracteres');
    rl.close();
    return;
  }

  // Hash de password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Insertar usuario
  try {
    const stmt = db.prepare(`
      INSERT INTO usuarios (email, password, nombre, rol, activo)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(email, hashedPassword, nombre, 'Admin', 1);

    console.log('\n✅ Usuario administrador creado exitosamente!');
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

  rl.close();
}

setup().catch(console.error);
