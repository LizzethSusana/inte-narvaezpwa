// =====================
// UTILIDADES JWT
// =====================

/**
 * Decodifica un token JWT
 * @param {string} token
 * @returns {Object|null}
 */
export function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (e) {
    console.error("Error al decodificar token:", e);
    return null;
  }
}

/**
 * Obtiene el token de autenticación del localStorage
 * @returns {string|null}
 */
export function getAuthToken() {
  return localStorage.getItem("authToken");
}

/**
 * Obtiene el ID del usuario desde localStorage o el token JWT
 * @returns {number|null}
 */
export function getCurrentUserId() {
  // Primero intentar desde localStorage (guardado en login)
  const userIdFromStorage = localStorage.getItem('userId');
  if (userIdFromStorage) {
    return parseInt(userIdFromStorage, 10);
  }

  // Si no está en localStorage, intentar desde el token
  const token = getAuthToken();
  if (!token) return null;

  const decoded = decodeJWT(token);

  // Intentar diferentes campos donde podría estar el ID
  return decoded?.id || decoded?.userId || decoded?.sub || null;
}

/**
 * Obtiene el nombre de usuario desde el token JWT
 * @returns {string|null}
 */
export function getCurrentUsername() {
  const token = getAuthToken();
  if (!token) return null;

  const decoded = decodeJWT(token);
  return decoded?.sub || null;
}

/**
 * Obtiene el rol del usuario desde el token JWT
 * @returns {string|null}
 */
export function getCurrentUserRole() {
  const token = getAuthToken();
  if (!token) return null;

  const decoded = decodeJWT(token);
  const authorities = decoded?.authorities || [];

  if (Array.isArray(authorities) && authorities.length > 0) {
    return authorities[0].authority || authorities[0];
  }

  return null;
}

/**
 * Verifica si el token ha expirado
 * @returns {boolean}
 */
export function isTokenExpired() {
  const token = getAuthToken();
  if (!token) return true;

  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now;
}

/**
 * Guarda el token en localStorage
 * @param {string} token
 */
export function saveAuthToken(token) {
  localStorage.setItem("authToken", token);
}

/**
 * Elimina el token del localStorage
 */
export function clearAuthToken() {
  localStorage.removeItem("authToken");
}
