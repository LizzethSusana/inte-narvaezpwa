import { openDB, getAll, put } from "./idb.js";

async function bootstrap() {
  // Registrar/Desregistrar service worker según entorno
  if ("serviceWorker" in navigator) {
    // En desarrollo, desregistrar para evitar caché que rompe estilos
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

  // 🔄 SOLO sincronizamos maids si hay internet
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

  const passwordInput = document.getElementById("password");
  const togglePasswordBtn = document.getElementById("togglePassword");
  const loginErrorEl = document.getElementById("loginError");

  const showError = (msg) => {
    if (!loginErrorEl) return;
    loginErrorEl.textContent = msg;
    loginErrorEl.classList.remove("hidden");
  };

  const clearError = () => {
    if (!loginErrorEl) return;
    loginErrorEl.classList.add("hidden");
    loginErrorEl.textContent = "";
  };

  if (togglePasswordBtn && passwordInput) {
    const eyeIcon = document.getElementById("eyeIcon");
    togglePasswordBtn.addEventListener("click", () => {
      const isHidden = passwordInput.type === "password";
      passwordInput.type = isHidden ? "text" : "password";
      if (eyeIcon) {
        eyeIcon.className = isHidden ? "bi bi-eye" : "bi bi-eye-slash";
      }
    });
  }

  document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    clearError();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value || "";

    if (!username || !password) {
      showError("Por favor ingresa correo y contraseña");
      return;
    }

    // Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      showError("Ingresa un correo electrónico válido");
      return;
    }

    // Intentar login con el backend
    try {
      const API_BASE = "http://localhost:8081/api";
      
      const response = await fetch(`${API_BASE}/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: username,
          password: password
        })
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        showError(data.message || "Usuario o contraseña incorrectos");
        return;
      }

      // Login exitoso - guardar token
      if (data.data) {
        localStorage.setItem("authToken", data.data);
        localStorage.setItem("username", username);
        
        // Redirigir según el rol del usuario
        // Por ahora redirigir a reception (puedes ajustar según el rol)
        location.href = "./reception.html";
      } else {
        showError("Error al iniciar sesión");
      }

    } catch (err) {
      console.error("Error login:", err);
      showError("Error de conexión. Verifica que el servidor esté activo.");
    }
  });
}

bootstrap();
