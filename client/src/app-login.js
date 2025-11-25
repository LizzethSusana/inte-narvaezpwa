import { openDB, getAll } from "./idb.js";

async function bootstrap() {
  if ("serviceWorker" in navigator)
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  await openDB();
  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const u = document.getElementById("username").value.trim();
    const p = document.getElementById("password").value || "";
    if (!u) return;
    // special reception shortcut
    if (u.toLowerCase() === "reception") {
      location.href = "/reception.html";
      return;
    }
    // check maids in IndexedDB
    try {
      const maids = await getAll('maids').catch(() => []);
      const maid = maids.find(m => (m.id === u) || (m.email === u));
      if (!maid) {
        alert('Usuario no encontrado');
        return;
      }
      // simple password check (stored in plain text currently)
      if (!maid.password || String(maid.password) !== String(p)) {
        alert('Contraseña incorrecta');
        return;
      }
      // success
      location.href = `/maid.html?user=${encodeURIComponent(maid.id || maid.email)}`;
    } catch (err) {
      console.error(err);
      alert('Error al verificar credenciales');
    }
  });
}

bootstrap();
