// Conexión con el backend
export const API_BASE = "http://localhost:8081/api"; // AJUSTA si hace falta

export async function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("token");
  const headers = opts.headers || {};
  if (token) headers["Authorization"] = "Bearer " + token;
  opts.headers = headers;
  const res = await fetch(API_BASE + path, opts);
  if (!res.ok) throw new Error("API error: " + res.status);
  return res.ok ? res.json().catch(() => null) : null;
}

export async function apiFetchNoJson(path, formData, opts = {}) {
  const token = localStorage.getItem("token");
  const headers = opts.headers || {};
  if (token) headers["Authorization"] = "Bearer " + token;
  opts.headers = headers;
  const res = await fetch(API_BASE + path, {
    method: "POST",
    body: formData,
    ...opts,
  });
  if (!res.ok) throw new Error("API error: " + res.status);
  return res.json().catch(() => null);
}

// Helper para login (used by main.js)
export async function loginRequest(username, password) {
  const res = await fetch(API_BASE + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error('Login failed: ' + res.status + (text ? ' - ' + text : ''));
  }

  return res.json().catch(() => null);
}
