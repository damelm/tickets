import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.routes.js';
import departmentsRoutes from './routes/departments.routes.js';
import usersRoutes from './routes/users.routes.js';
import ticketsRoutes from './routes/tickets.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import { apiLimiter } from './middleware/rateLimit.js';

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
const indexHtml = path.join(publicDir, 'index.html');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tickets', ticketsRoutes);
app.use('/api/settings', settingsRoutes);

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'No encontrado' });
  }
  next();
});

// Cliente productivo (server/public, copiado del build de client/dist) — ausente en dev,
// donde estas rutas caen en el 404 JSON de arriba.
if (existsSync(indexHtml)) {
  app.use(express.static(publicDir));
  app.get('*', (req, res) => res.sendFile(indexHtml));
} else {
  app.use((req, res) => res.status(404).json({ error: 'No encontrado' }));
}

app.use(errorHandler);

export default app;
