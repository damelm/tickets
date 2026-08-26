import request from './client.js';

export function listDepartments(token) {
  return request('/departments', { token });
}

export function toggleDepartment(token, id, acceptsTickets) {
  return request(`/departments/${id}/toggle`, { method: 'PATCH', token, body: { acceptsTickets } });
}
