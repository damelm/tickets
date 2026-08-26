import request from './client.js';

function buildQuery(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) value.forEach((v) => search.append(key, v));
    else search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export function listUsers(token, filters = {}) {
  return request(`/users${buildQuery(filters)}`, { token });
}

export function createUser(token, user) {
  return request('/users', { method: 'POST', token, body: user });
}

export function updateUser(token, id, changes) {
  return request(`/users/${id}`, { method: 'PATCH', token, body: changes });
}
