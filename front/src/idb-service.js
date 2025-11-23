// Simple wrapper for IndexedDB used by the app (blobs store + sync-ops + data cache)
export const IDB = (function () {
  const DB_NAME = "pwa-hotel";
  const VERSION = 1;
  let db;
  function open() {
    return new Promise((res, rej) => {
      if (db) return res(db);
      const rq = indexedDB.open(DB_NAME, VERSION);
      rq.onupgradeneeded = () => {
        const d = rq.result;
        if (!d.objectStoreNames.contains("rooms"))
          d.createObjectStore("rooms", { keyPath: "id" });
        if (!d.objectStoreNames.contains("sync-ops"))
          d.createObjectStore("sync-ops", {
            keyPath: "id",
            autoIncrement: true,
          });
        if (!d.objectStoreNames.contains("blobs"))
          d.createObjectStore("blobs", { keyPath: "id" });
      };
      rq.onsuccess = () => {
        db = rq.result;
        res(db);
      };
      rq.onerror = () => rej(rq.error);
    });
  }

  async function put(store, val) {
    const d = await open();
    return new Promise((res, rej) => {
      const tx = d.transaction(store, "readwrite");
      const st = tx.objectStore(store);
      const rq = st.put(val);
      rq.onsuccess = () => res(rq.result);
      rq.onerror = () => rej(rq.error);
    });
  }
  async function getAll(store) {
    const d = await open();
    return new Promise((res, rej) => {
      const tx = d.transaction(store, "readonly");
      const st = tx.objectStore(store);
      const rq = st.getAll();
      rq.onsuccess = () => res(rq.result);
      rq.onerror = () => rej(rq.error);
    });
  }
  async function add(store, val) {
    const d = await open();
    return new Promise((res, rej) => {
      const tx = d.transaction(store, "readwrite");
      const st = tx.objectStore(store);
      const rq = st.add(val);
      rq.onsuccess = () => res(rq.result);
      rq.onerror = () => rej(rq.error);
    });
  }
  async function get(store, key) {
    const d = await open();
    return new Promise((res, rej) => {
      const tx = d.transaction(store, "readonly");
      const st = tx.objectStore(store);
      const rq = st.get(key);
      rq.onsuccess = () => res(rq.result);
      rq.onerror = () => rej(rq.error);
    });
  }
  async function deleteItem(store, key) {
    const d = await open();
    return new Promise((res, rej) => {
      const tx = d.transaction(store, "readwrite");
      const st = tx.objectStore(store);
      const rq = st.delete(key);
      rq.onsuccess = () => res();
      rq.onerror = () => rej(rq.error);
    });
  }

  return { put, getAll, add, get, delete: deleteItem };
})();

// Convenience wrapper used by the app
export async function addSyncOp(op) {
  return IDB.add('sync-ops', op);
}

export async function getAllSyncOps() {
  return IDB.getAll('sync-ops');
}

export async function saveBlob(idObj) {
  // idObj should contain key 'id' and 'blob' or the full object to store
  return IDB.put('blobs', idObj);
}
