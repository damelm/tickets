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

export function createTicket(token, ticket) {
  return request('/tickets', { method: 'POST', token, body: ticket });
}

export function listMyTickets(token, filters = {}) {
  return request(`/tickets/mine${buildQuery(filters)}`, { token });
}

export function listTickets(token, filters = {}) {
  return request(`/tickets${buildQuery(filters)}`, { token });
}

export function getTicket(token, id) {
  return request(`/tickets/${id}`, { token });
}

export function listAssignableAgents(token, id) {
  return request(`/tickets/${id}/assignable-agents`, { token });
}

export function updateTicketStatus(token, id, status) {
  return request(`/tickets/${id}/status`, { method: 'PATCH', token, body: { status } });
}

export function updateTicketPriority(token, id, priority) {
  return request(`/tickets/${id}/priority`, { method: 'PATCH', token, body: { priority } });
}

export function updateTicketAssignment(token, id, assignedTo) {
  return request(`/tickets/${id}/assignment`, { method: 'PATCH', token, body: { assignedTo } });
}

export function addComment(token, id, body) {
  return request(`/tickets/${id}/comments`, { method: 'POST', token, body: { body } });
}
