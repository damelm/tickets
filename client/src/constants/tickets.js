// Fuente única de las etiquetas de estado: los valores (backlog, todo, ...) son los que
// guarda la base; acá solo se traduce lo que ve el usuario. Estaban duplicadas en cuatro
// pantallas y se desincronizaban.
export const STATUS_LABELS = {
  backlog: 'Pendiente',
  todo: 'Por hacer',
  in_progress: 'En curso',
  review: 'En revisión',
  done: 'Resuelto',
};

export const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

export const PRIORITY_LABELS = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  urgente: 'Urgente',
};

export const PRIORITY_OPTIONS = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }));
