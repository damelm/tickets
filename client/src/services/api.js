import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token a todas las requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const auth = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me')
};

// Tickets
export const tickets = {
  create: (data) => api.post('/tickets', data),
  getAll: (params) => api.get('/tickets', { params }),
  getById: (id) => api.get(`/tickets/${id}`),
  update: (id, data) => api.put(`/tickets/${id}`, data),
  take: (id) => api.post(`/tickets/${id}/tomar`),
  unassign: (id) => api.post(`/tickets/${id}/desasignar`),
  getHistory: (id) => api.get(`/tickets/${id}/historial`),
  getStats: () => api.get('/tickets/stats/dashboard')
};

// Usuarios
export const usuarios = {
  getAll: () => api.get('/usuarios'),
  create: (data) => api.post('/usuarios', data),
  update: (id, data) => api.put(`/usuarios/${id}`, data),
  delete: (id) => api.delete(`/usuarios/${id}`),
  getTecnicos: () => api.get('/usuarios/tecnicos/lista')
};

// Reportes
export const reportes = {
  getGeneral: () => api.get('/reportes/general'),
  getEquipo: () => api.get('/reportes/equipo'),
  getIndicadores: () => api.get('/reportes/indicadores'),
  getAnalytics: (periodo) => api.get('/reportes/analytics', { params: { periodo } })
};

// Configuración
export const configuracion = {
  get: () => api.get('/configuracion'),
  updateSLA: (data) => api.put('/configuracion/sla', data),
  updateAutocierre: (data) => api.put('/configuracion/autocierre', data),
  updateEmail: (data) => api.put('/configuracion/email', data),
  getCatalogos: () => api.get('/configuracion/catalogos')
};

export default api;
