import { openDB, getAll, put } from "./idb.js";
import { API_BASE_URL } from './utils/constants.js';


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
      const resp = await fetch(`${API_BASE_URL}/user`);
      if (resp.ok) {
        const data = await resp.json();
        const maids = data.data || [];
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
//  
    // Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      showError("Ingresa un correo electrónico válido");
      return;
    }

    // Intentar login con el backend
    try {
      const API_BASE = API_BASE_URL;
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
        
        // Obtener datos del usuario para verificar su rol
        try {
          const userResponse = await fetch(`${API_BASE}/user`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${data.data}`,
              "Content-Type": "application/json"
            }
          });

          const userData = await userResponse.json();
          
          if (userData.data && Array.isArray(userData.data)) {
            // Buscar el usuario actual por username
            const currentUser = userData.data.find(u => u.username === username);
            
            if (currentUser) {
              // Guardar información del usuario
              localStorage.setItem("userId", currentUser.id);
              localStorage.setItem("userRole", currentUser.rol?.id || "");
              
              // Redirigir según el rol
              if (currentUser.rol?.id === 2) {
                // MAID (Camarera) - id 2
                const encoded = encodeURIComponent(currentUser.id);
                location.href = `./maid.html?user=${encoded}`;
              } else {
                // RECEPTION (Recepcionista) - id 1 o cualquier otro
                location.href = "./reception.html";
              }
              return;
            }
          }
          
          // Si no se encontró el usuario, redirigir a reception por defecto
          location.href = "./reception.html";
          
        } catch (userError) {
          console.error("Error al obtener datos del usuario:", userError);
          // En caso de error, redirigir a reception por defecto
          location.href = "./reception.html";
        }
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
