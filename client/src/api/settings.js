import request from './client.js';

export function getSettings(token) {
  return request('/settings', { token });
}

export function updateSettings(token, googleAllowedDomain) {
  return request('/settings', { method: 'PATCH', token, body: { googleAllowedDomain } });
}
