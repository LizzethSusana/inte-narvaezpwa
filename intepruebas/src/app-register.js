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

  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirmPassword");
  const togglePasswordBtn = document.getElementById("togglePassword");
  const toggleConfirmPasswordBtn = document.getElementById("toggleConfirmPassword");
  const registerErrorEl = document.getElementById("registerError");
  const registerSuccessEl = document.getElementById("registerSuccess");

  const showError = (msg) => {
    if (!registerErrorEl) return;
    registerErrorEl.textContent = msg;
    registerErrorEl.classList.remove("hidden");
    registerSuccessEl.classList.add("hidden");
  };

  const showSuccess = (msg) => {
    if (!registerSuccessEl) return;
    registerSuccessEl.textContent = msg;
    registerSuccessEl.classList.remove("hidden");
    registerErrorEl.classList.add("hidden");
  };

  const clearMessages = () => {
    if (registerErrorEl) {
      registerErrorEl.classList.add("hidden");
      registerErrorEl.textContent = "";
    }
    if (registerSuccessEl) {
      registerSuccessEl.classList.add("hidden");
      registerSuccessEl.textContent = "";
    }
  };

  const showSuccessModal = (message) => {
    // Evitar duplicados
    const existing = document.getElementById("registerSuccessModal");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "registerSuccessModal";
    overlay.className = "modal-overlay show";

    overlay.innerHTML = `
      <div class="modal-card">
        <h3>Registro exitoso</h3>
        <p>${message}</p>
        <div class="modal-actions">
          <button id="goToLogin" class="btn-primary">Ir al login</button>
          <button id="closeSuccessModal" class="btn-secondary">Cerrar</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    const removeModal = () => overlay.remove();

    document.getElementById("goToLogin").onclick = () => {
      removeModal();
      window.location.href = "./index.html";
    };
    document.getElementById("closeSuccessModal").onclick = removeModal;
  };

  // Toggle para mostrar/ocultar contraseña
  if (togglePasswordBtn && passwordInput) {
    const eyeIcon = document.getElementById("eyeIcon");
    togglePasswordBtn.addEventListener("click", () => {
      const type = passwordInput.type === "password" ? "text" : "password";
      passwordInput.type = type;
      eyeIcon.className = type === "password" ? "bi bi-eye-slash" : "bi bi-eye";
    });
  }

  // Toggle para confirmar contraseña
  if (toggleConfirmPasswordBtn && confirmPasswordInput) {
    const eyeIconConfirm = document.getElementById("eyeIconConfirm");
    toggleConfirmPasswordBtn.addEventListener("click", () => {
      const type = confirmPasswordInput.type === "password" ? "text" : "password";
      confirmPasswordInput.type = type;
      eyeIconConfirm.className = type === "password" ? "bi bi-eye-slash" : "bi bi-eye";
    });
  }

  const registerForm = document.getElementById("registerForm");
  if (!registerForm) return;

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearMessages();

    const fullname = document.getElementById("fullname").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    const roleId = document.getElementById("role").value;

    // Validaciones del lado del cliente
    if (!fullname || !username || !password || !confirmPassword || !roleId) {
      showError("Todos los campos son obligatorios");
      return;
    }

    if (password !== confirmPassword) {
      showError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      showError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    // Validar formato de correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
      showError("Ingresa un correo electrónico válido (ejemplo@correo.com)");
      return;
    }

    // Preparar el payload según BeanUser
    const payload = {
      fullname: fullname,
      username: username,
      password: password,
      active: true,
      rol: {
        id: parseInt(roleId)
      }
    };

    try {
      const API_BASE = API_BASE_URL;
      
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        showError(data.message || "Error al registrar usuario");
        return;
      }

      // Registro exitoso (ignoramos data.error porque el backend la marca mal en 201)
      registerForm.reset();
      showSuccessModal("Usuario registrado correctamente");

    } catch (err) {
      console.error("Error al registrar:", err);
      showError("Error de conexión. Verifica que el servidor esté activo.");
    }
  });
}

bootstrap();
