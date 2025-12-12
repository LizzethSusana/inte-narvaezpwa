// =====================
// SISTEMA DE SINCRONIZACIÓN OFFLINE MEJORADO
// =====================

import { put, getAll, del } from "./idb.js";
import { roomStatusToAPI } from "./modules/shared/constants.js";

/**
 * Guarda un reporte offline en el outbox para sincronización posterior
 * @param {Object} report - Objeto del reporte con imágenes base64
 */
export async function saveReportOffline(report) {
  const pendingReport = {
    _id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'report',
    title: report.title || report.subject,
    description: report.description,
    user_id: report.user_id,
    room_id: report.room_id,
    images: report.images || [],
    active: report.active !== undefined ? report.active : true,
    createdAt: new Date().toISOString(),
    _synced: false
  };

  await put("outbox", pendingReport);
  console.log(`[Offline] Report saved to outbox: ${pendingReport._id}`);

  // Registrar background sync
  await registerBackgroundSync();
}

/**
 * Guarda un cambio de estado de habitación offline en el outbox
 * @param {Object} roomStatus - { room_id, room_number, status, user_id }
 */
export async function saveRoomStatusOffline(roomStatus) {
  const pendingStatus = {
    _id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'room-status',
    room_id: roomStatus.room_id,
    room_number: roomStatus.room_number,
    status: roomStatusToAPI(roomStatus.status), // Convertir a formato API (MAYÚSCULAS)
    user_id: roomStatus.user_id,
    createdAt: new Date().toISOString(),
    _synced: false
  };

  await put("outbox", pendingStatus);
  console.log(`[Offline] Room status saved to outbox: ${pendingStatus._id}`);

  // Registrar background sync
  await registerBackgroundSync();
}

/**
 * Guarda una asignación de camarera offline en el outbox
 * @param {Object} assignment - { room_id, maid_id, assignment_id (opcional para update/delete) }
 */
export async function saveMaidAssignmentOffline(assignment) {
  const pendingAssignment = {
    _id: `assignment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'maid-assignment',
    room_id: assignment.room_id,
    maid_id: assignment.maid_id, // null si se está desasignando
    assignment_id: assignment.assignment_id || null, // ID de la asignación existente (para update/delete)
    createdAt: new Date().toISOString(),
    _synced: false
  };

  await put("outbox", pendingAssignment);
  console.log(`[Offline] Maid assignment saved to outbox: ${pendingAssignment._id}`);

  // Registrar background sync
  await registerBackgroundSync();
}

/**
 * Registra el background sync para sincronizar cuando haya conexión
 */
async function registerBackgroundSync() {
  console.log('[Offline] 🔄 Attempting to register background sync...');

  if ("serviceWorker" in navigator && "SyncManager" in window) {
    try {
      console.log('[Offline] ⏳ Waiting for service worker to be ready...');
      const reg = await navigator.serviceWorker.ready;
      console.log('[Offline] ✅ Service worker ready, registering sync...');

      await reg.sync.register("sync-pending");
      console.log("[Offline] ✅ Background sync registered successfully with tag 'sync-pending'");
    } catch (e) {
      console.warn("[Offline] ❌ Background sync registration failed:", e);
    }
  } else {
    if (!("serviceWorker" in navigator)) {
      console.warn("[Offline] ⚠️ Service Worker not supported in this browser");
    }
    if (!("SyncManager" in window)) {
      console.warn("[Offline] ⚠️ Background Sync not supported in this browser");
    }
  }
}

/**
 * Intenta sincronizar manualmente todas las operaciones pendientes del outbox
 * @returns {Promise<{success: number, failed: number}>}
 */
export async function flushOutbox() {
  console.log('[Offline] Starting manual outbox flush');

  const items = await getAll("outbox");
  console.log(`[Offline] Found ${items.length} pending operations`);

  if (items.length === 0) {
    return { success: 0, failed: 0 };
  }

  let successCount = 0;
  let failedCount = 0;

  for (const item of items) {
    try {
      const success = await syncItem(item);
      if (success) {
        successCount++;
        await del("outbox", item._id);
        console.log(`[Offline] Successfully synced and removed: ${item._id}`);
      } else {
        failedCount++;
        console.warn(`[Offline] Failed to sync: ${item._id}`);
      }
    } catch (e) {
      failedCount++;
      console.error(`[Offline] Error syncing ${item._id}:`, e);
    }
  }

  console.log(`[Offline] Flush complete: ${successCount} success, ${failedCount} failed`);
  return { success: successCount, failed: failedCount };
}

/**
 * Sincroniza un item individual según su tipo
 * @param {Object} item - Item del outbox
 * @returns {Promise<boolean>}
 */
async function syncItem(item) {
  const type = item.type || 'unknown';

  try {
    let res;

    switch (type) {
      case 'report':
        res = await syncReport(item);
        break;

      case 'room-status':
        res = await syncRoomStatus(item);
        break;

      case 'maid-assignment':
        res = await syncMaidAssignment(item);
        break;

      default:
        console.warn(`[Offline] Unknown item type: ${type}`);
        return false;
    }

    return res && res.ok;
  } catch (e) {
    console.error(`[Offline] Exception syncing ${type}:`, e);
    return false;
  }
}

/**
 * Sincroniza un reporte con el backend
 */
async function syncReport(item) {
  const formData = new FormData();
  formData.append('title', item.title);
  formData.append('description', item.description);
  formData.append('user_id', item.user_id);
  formData.append('room_id', item.room_id);
  formData.append('active', item.active !== undefined ? item.active : true);

  // Convertir imágenes base64 a Blob
  if (item.images && Array.isArray(item.images)) {
    for (let i = 0; i < Math.min(item.images.length, 3); i++) {
      const base64 = item.images[i];
      if (base64) {
        const blob = await base64ToBlob(base64);
        formData.append(`photo${i + 1}`, blob, `photo${i + 1}.jpg`);
      }
    }
  }

  const token = localStorage.getItem('authToken');
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch("/api/reports", {
    method: "POST",
    headers,
    body: formData
  });
}

/**
 * Sincroniza el estado de una habitación con el backend
 */
async function syncRoomStatus(item) {
  const token = localStorage.getItem('authToken');
  const headers = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch("/api/rooms", {
    method: "PUT",
    headers,
    body: JSON.stringify({
      id: item.room_id,
      number: item.room_number,
      status: item.status, // Ya está en formato API (MAYÚSCULAS)
      userId: item.user_id
    })
  });
}

/**
 * Sincroniza la asignación de camarera con el backend
 */
async function syncMaidAssignment(item) {
  const token = localStorage.getItem('authToken');
  const headers = {
    "Content-Type": "application/json"
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    // Primero, obtener las asignaciones actuales para verificar si ya existe
    const assignmentsRes = await fetch("/api/room-assignments", {
      method: "GET",
      headers
    });

    if (!assignmentsRes.ok) {
      console.error('[Offline] Error al obtener asignaciones:', assignmentsRes.status);
      return assignmentsRes;
    }

    const assignments = await assignmentsRes.json();
    const existingAssignment = assignments.find(a => a.room?.id === item.room_id);

    if (item.maid_id) {
      // Asignar o actualizar camarera
      if (existingAssignment) {
        // Actualizar asignación existente
        console.log(`[Offline] Actualizando asignación existente: ${existingAssignment.id}`);
        return fetch(`/api/room-assignments/${existingAssignment.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({
            userId: parseInt(item.maid_id, 10),
            roomId: item.room_id
          })
        });
      } else {
        // Crear nueva asignación
        console.log(`[Offline] Creando nueva asignación para habitación ${item.room_id}`);
        return fetch("/api/room-assignments", {
          method: "POST",
          headers,
          body: JSON.stringify({
            room: { id: item.room_id },
            user: { id: parseInt(item.maid_id, 10) }
          })
        });
      }
    } else {
      // Desasignar camarera (maid_id es null)
      if (existingAssignment) {
        console.log(`[Offline] Eliminando asignación: ${existingAssignment.id}`);
        return fetch(`/api/room-assignments/${existingAssignment.id}`, {
          method: "DELETE",
          headers
        });
      } else {
        // No hay asignación que eliminar, considerar exitoso
        return { ok: true, status: 200 };
      }
    }
  } catch (error) {
    console.error('[Offline] Error al sincronizar asignación de camarera:', error);
    throw error;
  }
}

/**
 * Convierte base64 string a Blob
 */
async function base64ToBlob(base64String) {
  const parts = base64String.split(',');
  const contentType = parts[0].match(/:(.*?);/)[1];
  const byteString = atob(parts[1]);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  return new Blob([arrayBuffer], { type: contentType });
}

/**
 * Obtiene el número de operaciones pendientes en el outbox
 */
export async function getPendingCount() {
  const items = await getAll("outbox");
  return items.length;
}

/**
 * Listener para detectar cuando se recupera la conexión
 * y sincronizar automáticamente
 */
export function setupOnlineListener() {
  window.addEventListener('online', async () => {
    console.log('[Offline] Connection restored, flushing outbox');
    try {
      const result = await flushOutbox();
      if (result.success > 0) {
        console.log(`[Offline] Auto-synced ${result.success} operations`);
        // Notificar al usuario
        if (window.showSuccessToast) {
          window.showSuccessToast(`Se sincronizaron ${result.success} operaciones pendientes`);
        }
      }
    } catch (e) {
      console.error('[Offline] Auto-sync failed:', e);
    }
  });

  window.addEventListener('offline', () => {
    console.log('[Offline] Connection lost');
    if (window.showWarningToast) {
      window.showWarningToast('Sin conexión. Los cambios se guardarán localmente.');
    }
  });
}
