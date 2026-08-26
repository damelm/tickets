import request from './client.js';

export function login(email, password) {
  return request('/auth/login', { method: 'POST', body: { email, password } });
}
