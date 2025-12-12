import { openDB, getAll, put } from "./idb.js";
import { API_BASE_URL } from './utils/constants.js';

/**
 * Decodifica un token JWT y extrae su payload
 * @param {string} token - Token JWT
 * @returns {Object|null} - Payload del token o null si hay error
 */
function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (e) {
    console.error("Error al decodificar JWT:", e);
    return null;
  }
}


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
      const resp = await fetch("/api/user");
      if (resp.ok) {
        const users = await resp.json();
        for (const u of users) await put("user", u);
        console.log("Users sincronizadas:", users.length);
     
      }
    } catch (err) {
      console.warn("No se pudo sincronizar users:", err);
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

      // Login exitoso - guardar token y decodificarlo
      if (data.data) {
        const token = data.data;
        localStorage.setItem("authToken", token);
        localStorage.setItem("username", username);

        console.log("✅ Login exitoso, token guardado");

        // Decodificar el JWT para obtener información del usuario
        const payload = decodeJWT(token);

        if (payload) {
          console.log("🔍 Token decodificado:", payload);
          console.log("👤 Usuario:", payload.sub);
          console.log("🔐 Authorities:", payload.authorities);

          // Determinar el rol del usuario
          const authorities = payload.authorities || [];
          const isMaid = authorities.some(auth => {
            const role = auth.authority || auth;
            return role === "ROLE_MAID" || role === "MAID";
          });

          const isReception = authorities.some(auth => {
            const role = auth.authority || auth;
            return role === "ROLE_RECEPTION" || role === "RECEPTION";
          });

          // Guardar rol
          if (isMaid) {
            localStorage.setItem("userRole", "2"); // MAID = 2
          } else if (isReception) {
            localStorage.setItem("userRole", "1"); // RECEPTION = 1
          }

          // Redirigir según el rol
          if (isMaid) {
            // Para MAIDs necesitamos el userId, intentar obtenerlo
            console.log("🧹 Usuario es MAID, obteniendo ID de usuario...");

            try {
              const userResponse = await fetch(`${API_BASE}/user`, {
                method: "GET",
                headers: {
                  "Authorization": `Bearer ${token}`,
                  "Content-Type": "application/json"
                }
              });

              if (userResponse.ok) {
                const userData = await userResponse.json();
                const currentUser = userData.data?.find(u => u.username === username);

                if (currentUser && currentUser.id) {
                  localStorage.setItem("userId", currentUser.id);
                  console.log("✅ userId obtenido:", currentUser.id);
                  const encoded = encodeURIComponent(currentUser.id);
                  window.location.href = `/maid.html?user=${encoded}`;
                  return;
                }
              }

              // Fallback: usar username como identificador
              console.warn("⚠️ No se pudo obtener userId, usando username");
              const encoded = encodeURIComponent(username);
              window.location.href = `/maid.html?user=${encoded}`;

            } catch (err) {
              console.error("❌ Error obteniendo userId:", err);
              // Fallback: usar username
              const encoded = encodeURIComponent(username);
              window.location.href = `/maid.html?user=${encoded}`;
            }
          } else {
            // RECEPTION no necesita userId en la URL
            console.log("🏨 Redirigiendo a interfaz de recepción...");
            window.location.href = "/reception.html";
          }
        } else {
          console.error("❌ No se pudo decodificar el token");
          showError("Error al procesar la sesión");
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
