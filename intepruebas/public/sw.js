const CACHE_NAME = "pwa-hotel-static-v7";
const RUNTIME = "pwa-hotel-runtime-v7";

console.log('[SW] Service Worker script loaded - Version 7');

self.addEventListener("activate", (event) => {
  console.log('[SW] Activating new service worker v7');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME && key !== RUNTIME)
          .map((key) => {
            console.log(`[SW] Deleting old cache: ${key}`);
            return caches.delete(key);
          })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

const APP_SHELL = [
  "/",
  "/index.html",
  "/maid.html",
  "/reception.html",
  "/register.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  console.log('[SW] Installing service worker and caching app shell');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(APP_SHELL).catch((error) => {
        console.error('[SW] Failed to cache app shell:', error);
        throw error;
      });
    })
  );
  self.skipWaiting();
});


self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Ignorar requests de otros orígenes (CDN, APIs externas)
  if (url.origin !== location.origin) {
    return;
  }

  // API pattern -> network-first then cache (SOLO para GET requests)
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/reports")) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          // Solo cachear GET requests exitosos (200-299)
          if (event.request.method === 'GET' && res.ok) {
            return caches.open(RUNTIME).then((cache) => {
              console.log(`[SW] Caching API response: ${url.pathname}`);
              cache.put(event.request, res.clone());
              return res;
            });
          }
          return res;
        })
        .catch((error) => {
          console.log(`[SW] Network failed for ${url.pathname}, trying cache`);
          // Solo intentar caché para GET requests
          if (event.request.method === 'GET') {
            return caches.match(event.request).then((cached) => {
              if (cached) {
                console.log(`[SW] Serving from cache: ${url.pathname}`);
                return cached;
              }
              // Si no hay caché, devolver error offline
              console.error(`[SW] No cache available for ${url.pathname}`);
              throw error;
            });
          }
          // Para POST/PUT/DELETE, simplemente fallar
          throw error;
        })
    );
    return;
  }

  // Assets de la app (CSS, JS, imágenes) -> cache-first con network fallback
  if (
    url.pathname.startsWith("/assets/") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg")
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) {
          console.log(`[SW] Serving asset from cache: ${url.pathname}`);
          return cached;
        }
        // Si no está en caché, buscar en red y cachear
        return fetch(event.request).then((response) => {
          if (response.ok) {
            return caches.open(RUNTIME).then((cache) => {
              console.log(`[SW] Caching new asset: ${url.pathname}`);
              cache.put(event.request, response.clone());
              return response;
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML pages y app shell -> cache-first con network fallback
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        console.log(`[SW] Serving from cache: ${url.pathname}`);
        return cached;
      }
      // Si no está en caché, buscar en red y cachear
      return fetch(event.request).then((response) => {
        if (response.ok && event.request.method === 'GET') {
          return caches.open(CACHE_NAME).then((cache) => {
            console.log(`[SW] Caching new page: ${url.pathname}`);
            cache.put(event.request, response.clone());
            return response;
          });
        }
        return response;
      });
    })
  );
});

self.addEventListener("sync", (event) => {
  console.log(`[SW v7] 🔄 Background Sync event fired: ${event.tag}`);
  if (event.tag === "sync-pending") {
    console.log('[SW v7] 📋 Starting sync-pending operation');
    event.waitUntil(syncPendingOperations());
  } else {
    console.log(`[SW v7] ⚠️ Unknown sync tag: ${event.tag}`);
  }
});

/**
 * Sincroniza todas las operaciones pendientes del outbox
 * Soporta diferentes tipos: 'report', 'room-status', etc.
 */
async function syncPendingOperations() {
  console.log('[SW v7] 🔄 Starting sync of pending operations');
  try {
    const db = await openSelfDB();
    console.log('[SW v7] ✅ IndexedDB connection opened');

    const tx = db.transaction("outbox", "readwrite");
    const store = tx.objectStore("outbox");

    return new Promise((resolve, reject) => {
      const req = store.getAll();

      req.onsuccess = async () => {
        const items = req.result || [];
        console.log(`[SW v7] 📦 Found ${items.length} pending operations in outbox`);

        if (items.length > 0) {
          console.log('[SW v7] 📋 Pending items:', items.map(i => ({type: i.type, id: i._id})));
        }

        let successCount = 0;
        let failCount = 0;

        for (const item of items) {
          try {
            const success = await syncSingleItem(item, store);
            if (success) {
              successCount++;
            } else {
              failCount++;
            }
          } catch (e) {
            console.error(`[SW] Error syncing item ${item._id}:`, e);
            failCount++;
          }
        }

        console.log(`[SW] Sync complete: ${successCount} success, ${failCount} failed`);
        resolve();
      };

      req.onerror = () => {
        console.error('[SW] Error reading outbox:', req.error);
        reject(req.error);
      };
    });
  } catch (e) {
    console.error("[SW] Sync error:", e);
    throw e;
  }
}

/**
 * Sincroniza un item individual según su tipo
 */
async function syncSingleItem(item, store) {
  const type = item.type || 'unknown';
  console.log(`[SW] Syncing item ${item._id} of type: ${type}`);

  try {
    let res;

    switch (type) {
      case 'report':
        // Convertir imágenes base64 a FormData
        const formData = new FormData();
        formData.append('title', item.title || item.subject);
        formData.append('description', item.description);
        formData.append('user_id', item.user_id);
        formData.append('room_id', item.room_id);
        formData.append('active', item.active !== undefined ? item.active : true);

        // Convertir base64 a Blob y agregar fotos
        if (item.images && Array.isArray(item.images)) {
          for (let i = 0; i < Math.min(item.images.length, 3); i++) {
            const base64 = item.images[i];
            if (base64) {
              const blob = await base64ToBlob(base64);
              formData.append(`photo${i + 1}`, blob, `photo${i + 1}.jpg`);
            }
          }
        }

        res = await fetch("/api/reports", {
          method: "POST",
          body: formData
        });
        break;

      case 'room-status':
        // Actualizar estado de habitación
        res = await fetch("/api/rooms", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: item.room_id,
            number: item.room_number,
            status: item.status,
            userId: item.user_id
          })
        });
        break;

      case 'maid-assignment':
        // Sincronizar asignación de camarera
        console.log(`[SW v7] 👤 Syncing maid assignment for room ${item.room_id}, maid: ${item.maid_id}`);
        try {
          // Obtener asignaciones actuales
          console.log('[SW v7] 📡 Fetching current room assignments...');
          const assignmentsRes = await fetch("/api/room-assignments", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
          });

          if (!assignmentsRes.ok) {
            console.error(`[SW v7] ❌ Error al obtener asignaciones: ${assignmentsRes.status}`);
            res = assignmentsRes;
            break;
          }

          const assignments = await assignmentsRes.json();
          console.log(`[SW v7] ✅ Got ${assignments.length} current assignments`);
          const existingAssignment = assignments.find(a => a.room?.id === item.room_id);

          if (existingAssignment) {
            console.log(`[SW v7] 📌 Existing assignment found:`, existingAssignment);
          } else {
            console.log(`[SW v7] ℹ️ No existing assignment for room ${item.room_id}`);
          }

          if (item.maid_id) {
            // Asignar o actualizar camarera
            if (existingAssignment) {
              // Actualizar asignación existente
              console.log(`[SW] Actualizando asignación existente: ${existingAssignment.id}`);
              res = await fetch(`/api/room-assignments/${existingAssignment.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: parseInt(item.maid_id, 10),
                  roomId: item.room_id
                })
              });
            } else {
              // Crear nueva asignación
              console.log(`[SW] Creando nueva asignación para habitación ${item.room_id}`);
              res = await fetch("/api/room-assignments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  room: { id: item.room_id },
                  user: { id: parseInt(item.maid_id, 10) }
                })
              });
            }
          } else {
            // Desasignar camarera (maid_id es null)
            if (existingAssignment) {
              console.log(`[SW] Eliminando asignación: ${existingAssignment.id}`);
              res = await fetch(`/api/room-assignments/${existingAssignment.id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
              });
            } else {
              // No hay asignación que eliminar, considerar exitoso
              res = { ok: true, status: 200 };
            }
          }
        } catch (error) {
          console.error('[SW] Error al sincronizar asignación de camarera:', error);
          return false;
        }
        break;

      default:
        console.warn(`[SW] Unknown item type: ${type}`);
        return false;
    }

    if (res && res.ok) {
      console.log(`[SW] Successfully synced ${type} item ${item._id}`);
      await store.delete(item._id);
      return true;
    } else {
      console.error(`[SW] Failed to sync ${type} item ${item._id}: ${res ? res.status : 'no response'}`);
      return false;
    }
  } catch (e) {
    console.error(`[SW] Exception syncing ${type} item ${item._id}:`, e);
    return false;
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

function openSelfDB() {
  return new Promise((res, rej) => {
    const r = indexedDB.open("hotel-db");
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
    r.onupgradeneeded = () => res(r.result);
  });
}
