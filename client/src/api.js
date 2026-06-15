// Piccolo wrapper per chiamare le API del backend con il token di login.

const TOKEN_KEY = 'gp_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}
export function setToken(t) {
  localStorage.setItem(TOKEN_KEY, t);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + getToken(),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401) {
    clearToken();
    window.location.reload();
    throw new Error('Sessione scaduta');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Errore');
  return data;
}

export const api = {
  login: (username, password) =>
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    }).then(async (r) => {
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Errore di accesso');
      return d;
    }),

  getSpecialisti: () => request('GET', '/api/specialisti'),
  addSpecialista: (nome) => request('POST', '/api/specialisti', { nome }),
  delSpecialista: (id) => request('DELETE', `/api/specialisti/${id}`),

  getBookings: (specialista, data) =>
    request('GET', `/api/bookings?specialista=${encodeURIComponent(specialista)}&data=${data}`),
  addBooking: (b) => request('POST', '/api/bookings', b),
  setStato: (id, stato) => request('PATCH', `/api/bookings/${id}`, { stato }),
  delBooking: (id) => request('DELETE', `/api/bookings/${id}`),
};
