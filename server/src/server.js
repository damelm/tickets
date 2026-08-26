import app from './app.js';

const port = Number(process.env.PORT) || 3001;

const server = app.listen(port, () => {
  console.log(`API escuchando en http://localhost:${port}`);
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
