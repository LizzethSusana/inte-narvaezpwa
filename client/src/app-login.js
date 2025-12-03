import { openDB, getAll, put } from "./idb.js";

async function bootstrap() {
<<<<<<< HEAD
  if ("serviceWorker" in navigator) {
=======
  // Registrar/Desregistrar service worker según entorno
  if ("serviceWorker" in navigator) {
    // En desarrollo, desregistrar para evitar caché que rompe estilos
>>>>>>> a940211 (Guardando mis cambios locales)
    if (import.meta && import.meta.env && import.meta.env.DEV) {
      try {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      } catch (_) {}
    } else {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }
  }

  await openDB();

  if (navigator.onLine) {
    try {
      const resp = await fetch("/api/maids");
      if (resp.ok) {
        const maids = await resp.json();
        for (const m of maids) await put("maids", m);
        console.log("Maids sincronizadas:", maids.length);
      }
    } catch (err) {
      console.warn("No se pudo sincronizar maids:", err);
    }
  }

  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const u = document.getElementById("username").value.trim();
    const p = document.getElementById("password").value || "";

    if (!u) return;

    if (u.toLowerCase() === "reception") {
      if (!navigator.onLine) {
        alert("Recepción solo funciona con internet.");
        return;
      }
      location.href = "./reception.html";
      return;
    }

    try {
      const maids = await getAll("maids").catch(() => []);

      if (!maids.length) {
        alert("No hay datos locales. Conéctate una vez para cargar las camareras.");
        return;
      }

      const maid = maids.find(
        (m) => m.id === u || m.email === u
      );

      if (!maid) {
        alert("Usuario no encontrado");
        return;
      }

      if (!maid.password || String(maid.password) !== String(p)) {
        alert("Contraseña incorrecta");
        return;
      }

      const encoded = encodeURIComponent(maid.id || maid.email);
<<<<<<< HEAD
      location.href = ./maid.html?user=${encoded};
=======
      location.href = `./maid.html?user=${encoded}`;
>>>>>>> a940211 (Guardando mis cambios locales)

    } catch (err) {
      console.error("Error login:", err);
      alert("Error al verificar credenciales");
    }
  });
}

bootstrap();