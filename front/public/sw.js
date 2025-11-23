// ======================================================
//  SERVICE WORKER - PWA HOTEL CLEANING (COMPLETO Y OK)
// ======================================================

// ----------- Nombres de caché -----------
const STATIC_CACHE = "static-v1";
const DYNAMIC_CACHE = "dynamic-v1";

// ----------- Archivos estáticos a cachear -----------
const APP_SHELL = [
  "/",
  "/index.html",
  "/src/app.css",
  "/src/app.js",
  "/manifest.json",
  
];

// ----------- Install: carga caché estático -----------
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// ----------- Activate: limpia cachés viejos ----------
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
            .map((key) => caches.delete(key))
        )
      )
  );
  self.clients.claim();
});

// ----------- Fetch: network → cache fallback -----------
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // No cachear llamadas POST
  if (req.method === "POST") {
    return event.respondWith(
      fetch(req).catch(() => new Response("Offline", { status: 503 }))
    );
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((net) => {
          // Guardar en caché dinámico
          return caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(req, net.clone());
            return net;
          });
        })
        .catch(() => caches.match("/offline.html"));
    })
  );
});

// ======================================================
//  BACKGROUND SYNC
// ======================================================

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-operations") {
    event.waitUntil(processSyncOps());
  }
});

// ======================================================
//  PROCESO DE SINCRONIZACIÓN (CORREGIDO Y COMPLETO)
// ======================================================

async function processSyncOps() {
  const ops = await readAllSyncOps();

  for (const op of ops) {
    try {
      const form = new FormData();

      // Campos normales
      if (op.fields && typeof op.fields === "object") {
        for (const k in op.fields) {
          form.append(k, op.fields[k]);
        }
      }

      // Blobs (fotos, evidencias, etc.)
      if (op.blobs && Array.isArray(op.blobs)) {
        for (const blobId of op.blobs) {
          const blob = await getBlobFromIDB(blobId);
          if (blob) {
            form.append("files[]", blob, blob.name || `file-${blobId}`);
          }
        }
      }

      // Headers
      const headers = {};
      if (op.token) headers["Authorization"] = "Bearer " + op.token;

      const res = await fetch(op.url, {
        method: "POST",
        body: form,
        headers,
      });

      if (!res.ok) throw new Error(`Sync failed: ${res.status}`);

      await deleteSyncOp(op.id);
    } catch (e) {
      console.error("sync op failed:", e);
    }
  }
}

// ======================================================
//  INDEXEDDB (CORREGIDO)
// ======================================================

// Abrir base de datos
function openDB() {
  return new Promise((res, rej) => {
    const rq = indexedDB.open("pwa-hotel", 1);

    rq.onupgradeneeded = () => {
      const db = rq.result;

      if (!db.objectStoreNames.contains("sync-ops")) {
        db.createObjectStore("sync-ops", {
          keyPath: "id",
          autoIncrement: true,
        });
      }

      if (!db.objectStoreNames.contains("blobs")) {
        db.createObjectStore("blobs", { keyPath: "id" });
      }
    };

    rq.onsuccess = () => res(rq.result);
    rq.onerror = () => rej(rq.error);
  });
}

// Leer todas las operaciones pendientes
async function readAllSyncOps() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("sync-ops", "readonly");
    const st = tx.objectStore("sync-ops");
    const rq = st.getAll();

    rq.onsuccess = () => res(rq.result || []);
    rq.onerror = () => rej(rq.error);
  });
}

// Borrar una operación
async function deleteSyncOp(id) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("sync-ops", "readwrite");
    const st = tx.objectStore("sync-ops");
    const rq = st.delete(id);

    rq.onsuccess = () => res(true);
    rq.onerror = () => rej(rq.error);
  });
}

// Obtener blob guardado
async function getBlobFromIDB(id) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction("blobs", "readonly");
    const st = tx.objectStore("blobs");
    const rq = st.get(id);

    rq.onsuccess = () => {
      const item = rq.result;
      res(item ? item.blob : null);
    };

    rq.onerror = () => rej(rq.error);
  });
}
