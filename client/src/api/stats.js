import request from './client.js';

export function getStats(token) {
  return request('/stats', { token });
}
