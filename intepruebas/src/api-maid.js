// api-maid.js - endpoints específicos para camareras
const API_BASE = "http://localhost:8081/api";

function getAuthToken() {
  return localStorage.getItem("authToken");
}

async function request(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const resp = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok || data.error) {
    const msg = data.message || `HTTP ${resp.status}`;
    throw new Error(msg);
  }
  return data;
}

// Crea una camarera (rol id = 2)
export async function createMaid({ fullname, username, password }) {
  const payload = {
    fullname,
    username,
    password,
    active: true,
    rol: { id: 2 },
  };
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Obtiene todas las camareras (rol id = 2)
export async function getMaids() {
  const data = await request("/user", { method: "GET" });
  return (data.data || []).filter((u) => u.rol?.id === 2);
}

// Actualiza datos básicos de la camarera
export async function updateMaid({ id, fullname, username, password, active }) {
  const payload = {
    id,
    fullname,
    username,
    password,
    active,
  };
  return request("/user", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
