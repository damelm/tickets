import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { initDatabase } from './database.js';
import { startAutoCloseService } from './services/autocierre.js';

// Rutas
import authRoutes from './routes/auth.js';
import ticketsRoutes from './routes/tickets.js';
import usuariosRoutes from './routes/usuarios.js';
import reportesRoutes from './routes/reportes.js';
import configuracionRoutes from './routes/configuracion.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Inicializar base de datos
initDatabase();

// Iniciar servicio de autocierre
startAutoCloseService();

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/reportes', reportesRoutes);
app.use('/api/configuracion', configuracionRoutes);

// Ruta de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n🎯 ========================================');
  console.log('   Sistema de Tickets - Siete Fronteras');
  console.log('   ========================================\n');
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`🌐 API: http://localhost:${PORT}/api`);
  console.log(`📧 Email: ${process.env.EMAIL_HOST ? 'Configurado' : 'No configurado'}`);
  console.log('\n   Presiona Ctrl+C para detener\n');
});

export default app;
