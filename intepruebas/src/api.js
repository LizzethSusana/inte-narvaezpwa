// api.js - wrapper para llamadas al servidor
import { API_BASE_URL } from './utils/constants.js';

const API_BASE = API_BASE_URL;

// =====================
// UTILIDADES
// =====================

/**
 * Obtiene el token de autenticación
 * @returns {string|null}
 */
function getAuthToken() {
  return localStorage.getItem("authToken");
}

/**
 * Decodifica el token JWT para ver su contenido
 * @param {string} token 
 * @returns {Object|null}
 */
function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    console.log("Token decodificado:", payload);
    return payload;
  } catch (e) {
    console.error("Error al decodificar token:", e);
    return null;
  }
}

/**
 * Realiza una petición HTTP con manejo de errores
 * @param {string} url 
 * @param {Object} options 
 * @returns {Promise<any>}
 */
async function fetchAPI(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP Error ${response.status}`);
  }

  return response.json();
}

// =====================
// ROOMS API
// =====================

/**
 * Obtiene todas las habitaciones
 * @returns {Promise<Array>}
 */
export async function getRooms() {
  try {
    const data = await fetchAPI("/rooms");
    return data.data || [];
  } catch (error) {
    console.error("Error al obtener habitaciones:", error);
    throw error;
  }
}

/**
 * Obtiene una habitación por ID
 * @param {number} id 
 * @returns {Promise<Object>}
 */
export async function getRoomById(id) {
  try {
    const data = await fetchAPI(`/rooms/${id}`);
    return data.data;
  } catch (error) {
    console.error(`Error al obtener habitación ${id}:`, error);
    throw error;
  }
}

/**
 * Crea una nueva habitación
 * @param {Object} roomData - { number, status }
 * @returns {Promise<Object>}
 */
export async function createRoom(roomData) {
  try {
    const data = await fetchAPI("/rooms", {
      method: "POST",
      body: JSON.stringify(roomData),
    });
    return data;
  } catch (error) {
    console.error("Error al crear habitación:", error);
    throw error;
  }
}

/**
 * Crea múltiples habitaciones en una sola petición
 * @param {Array<Object>} roomsData - Array de { number, status }
 * @returns {Promise<Object>}
 */
export async function createRoomsBatch(roomsData) {
  try {
    const data = await fetchAPI("/rooms/batch", {
      method: "POST",
      body: JSON.stringify(roomsData),
    });
    return data;
  } catch (error) {
    console.error("Error al crear habitaciones en lote:", error);
    throw error;
  }
}

/**
 * Actualiza una habitación existente
 * @param {Object} roomData - { id, number, status }
 * @returns {Promise<Object>}
 */
// =====================
export async function updateRoom(roomData) {
  console.log('=== updateRoom API ===');
  console.log('Datos recibidos:', roomData);
  console.log('ID:', roomData.id, 'Tipo:', typeof roomData.id);
  
  try {
    const data = await fetchAPI("/rooms", {
      method: "PUT",
      body: JSON.stringify(roomData),
    });
    console.log('Respuesta del backend:', data);
    return data;
  } catch (error) {
    console.error("Error al actualizar habitación:", error);
    throw error;
  }
}

/**
 * Elimina una habitación
 * @param {number} id 
 * @returns {Promise<Object>}
 */
export async function deleteRoom(id) {
  console.log("=== INICIO deleteRoom ===");
  console.log("ID a eliminar:", id);
  
  const token = getAuthToken();
  console.log("Token existe:", !!token);
  console.log("Token (primeros 20 chars):", token?.substring(0, 20));
  
  if (token) {
    const decoded = decodeJWT(token);
    console.log("Usuario del token:", decoded?.sub);
    console.log("Authorities en token:", decoded?.authorities);
    console.log("Rol en authorities:", decoded?.authorities?.map(a => a.authority || a));
  } else {
    console.error("⚠️ NO HAY TOKEN - Esto causará 403");
  }
  
  try {
    const data = await fetchAPI("/rooms", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    console.log("✅ Eliminación exitosa");
    return data;
  } catch (error) {
    console.error("❌ Error al eliminar habitación:", error);
    console.error("Detalles del error:", error.message);
    throw error;
  }
}

// =====================
// ROOM ASSIGNMENTS API
// =====================

/**
 * Obtiene todas las asignaciones de habitaciones
 * @returns {Promise<Array>}
 */
export async function getRoomAssignments() {
  try {
    const data = await fetchAPI("/room-assignments");
    return data.data || [];
  } catch (error) {
    console.error("Error al obtener asignaciones:", error);
    throw error;
  }
}

/**
 * Obtiene una asignación por ID
 * @param {number} id 
 * @returns {Promise<Object>}
 */
export async function getRoomAssignmentById(id) {
  try {
    const data = await fetchAPI(`/room-assignments/${id}`);
    return data.data;
  } catch (error) {
    console.error(`Error al obtener asignación ${id}:`, error);
    throw error;
  }
}

/**
 * Crea una nueva asignación de habitación
 * @param {Object} assignmentData - { room: { id }, user: { id } }
 * @returns {Promise<Object>}
 */
export async function createRoomAssignment(assignmentData) {
  try {
    const data = await fetchAPI("/room-assignments", {
      method: "POST",
      body: JSON.stringify(assignmentData),
    });
    return data;
  } catch (error) {
    console.error("Error al crear asignación:", error);
    throw error;
  }
}

/**
 * Actualiza una asignación existente
 * @param {Object} assignmentData - { id, room: { id }, user: { id } }
 * @returns {Promise<Object>}
 */
export async function updateRoomAssignment(assignmentData) {
  try {
    const data = await fetchAPI("/room-assignments", {
      method: "PUT",
      body: JSON.stringify(assignmentData),
    });
    return data;
  } catch (error) {
    console.error("Error al actualizar asignación:", error);
    throw error;
  }
}

/**
 * Elimina una asignación
 * @param {number} id 
 * @returns {Promise<Object>}
 */
export async function deleteRoomAssignment(id) {
  try {
    const data = await fetchAPI("/room-assignments", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
    return data;
  } catch (error) {
    console.error("Error al eliminar asignación:", error);
    throw error;
  }
}

// =====================
// USERS API
// =====================

/**
 * Obtiene todos los usuarios
 * @returns {Promise<Array>}
 */
export async function getUsers() {
  try {
    const data = await fetchAPI("/user");
    return data.data || [];
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    throw error;
  }
}

/**
 * Obtiene un usuario por ID
 * @param {number} id 
 * @returns {Promise<Object>}
 */
export async function getUserById(id) {
  try {
    const data = await fetchAPI(`/user/${id}`);
    return data.data;
  } catch (error) {
    console.error(`Error al obtener usuario ${id}:`, error);
    throw error;
  }
}

/**
 * Elimina un usuario por ID
 * @param {number} id - ID del usuario
 * @returns {Promise<Object>}
 */
export async function deleteUser(id) {
  try {
    const data = await fetchAPI(`/user`, {
      method: 'DELETE',
      body: JSON.stringify({ id })
    });
    return data;
  } catch (error) {
    console.error(`Error al eliminar usuario ${id}:`, error);
    throw error;
  }
}

// =====================
// REPORTS API
// =====================

/**
 * Envía un reporte con imágenes (FormData)
 * @param {FormData} formData 
 * @returns {Promise<Object>}
 */
export async function postReport(formData) {
  try {
    const token = getAuthToken();
    const headers = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/reports`, {
      method: "POST",
      headers,
      body: formData, // FormData se envía sin Content-Type
    });

    if (!response.ok) {
      throw new Error("Network");
    }

    return response.json();
  } catch (error) {
    console.error("Error al enviar reporte:", error);
    throw error;
  }
}

/**
 * Obtiene todos los reportes
 * @returns {Promise<Array>}
 */
export async function getReports() {
  try {
    const data = await fetchAPI("/reports");
    return data.data || [];
  } catch (error) {
    console.error("Error al obtener reportes:", error);
    throw error;
  }
}
