// =====================================================
// SERVICIO API PARA OPERACIONES DE CAMARERA
// =====================================================

import { API_BASE_URL } from '../utils/constants.js';

const API_BASE = API_BASE_URL;
//
/**
 * Obtiene el token de autenticación del localStorage
 * @returns {string|null}
 */
function getAuthToken() {
  return localStorage.getItem("authToken");
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
// HABITACIONES
// =====================

/**
 * Obtiene todas las habitaciones del hotel
 * @returns {Promise<Array>}
 */
export async function getAllRooms() {
  try {
    const data = await fetchAPI("/rooms");
    return data.data || [];
  } catch (error) {
    console.error("Error al obtener habitaciones:", error);
    throw error;
  }
}

/**
 * Actualiza el estado de una habitación
 * @param {Object} roomData - { id, number, status }
 * @returns {Promise<Object>}
 */
export async function updateRoomStatus(roomData) {
  try {
    const data = await fetchAPI("/rooms", {
      method: "PUT",
      body: JSON.stringify(roomData),
    });
    return data;
  } catch (error) {
    console.error("Error al actualizar habitación:", error);
    throw error;
  }
}

// =====================
// ASIGNACIONES
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
 * Obtiene las habitaciones asignadas a un usuario específico
 * @param {number} userId - ID del usuario (camarera)
 * @returns {Promise<Array>} - Array de habitaciones asignadas
 */
export async function getMyAssignedRooms(userId) {
  try {
    const assignments = await getRoomAssignments();
    const rooms = await getAllRooms();

    // Filtrar asignaciones del usuario
    const myAssignments = assignments.filter(a => a.user?.id === userId);

    // Mapear a habitaciones con información de asignación
    const assignedRooms = myAssignments.map(assignment => {
      const room = rooms.find(r => r.id === assignment.room?.id);
      return {
        ...room,
        assignmentId: assignment.id,
        assignmentDate: assignment.fechaAsignacion,
        maidId: userId,
      };
    });

    return assignedRooms;
  } catch (error) {
    console.error("Error al obtener mis habitaciones asignadas:", error);
    throw error;
  }
}

// =====================
// REPORTES
// =====================

/**
 * Envía un reporte de siniestro con imágenes
 * @param {Object} reportData - { title, description, user_id, room_id, active, images: [base64...] }
 * @returns {Promise<Object>}
 */
export async function postReport(reportData) {
  try {
    const formData = new FormData();

    // Campos requeridos según API
    formData.append('title', reportData.title);
    formData.append('description', reportData.description);
    formData.append('user_id', reportData.user_id.toString());
    formData.append('room_id', reportData.room_id.toString());
    
    // Campo active: true = habitación bloqueada, false = habitación sucia
    // Por defecto true (bloquea la habitación)
    formData.append('active', reportData.active !== undefined ? reportData.active.toString() : 'true');

    // Convertir imágenes base64 a Blob y adjuntar
    if (reportData.images && Array.isArray(reportData.images)) {
      for (let i = 0; i < Math.min(reportData.images.length, 3); i++) {
        const base64 = reportData.images[i];
        const blob = base64ToBlob(base64);
        const fileName = `photo${i + 1}.jpg`;
        formData.append(`photo${i + 1}`, blob, fileName);
      }
    }

    const token = getAuthToken();
    const headers = {};

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/reports`, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Error al enviar reporte");
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

// =====================
// UTILIDADES
// =====================

/**
 * Convierte una cadena base64 a Blob
 * @param {string} base64
 * @returns {Blob}
 */
function base64ToBlob(base64) {
  const parts = base64.split(';base64,');
  const contentType = parts[0].split(':')[1];
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

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
