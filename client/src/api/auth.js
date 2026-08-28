import request from './client.js';

export function login(email, password) {
  return request('/auth/login', { method: 'POST', body: { email, password } });
}

export function loginWithGoogle(idToken) {
  return request('/auth/google', { method: 'POST', body: { idToken } });
}
