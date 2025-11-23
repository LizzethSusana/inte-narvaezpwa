// src/main.js (copia para servir desde public/src)

import { apiFetch, loginRequest } from './api.js';
import { addSyncOp } from './idb-service.js';
import { renderRooms, showReportModal, showToast, showConfirm } from './ui.js';

let token = null;

// App container and current mounted view
const app = document.getElementById('app');
let currentView = null;

function mountTemplate(tplId) {
  if (currentView) currentView.remove();
  const tpl = document.getElementById(tplId);
  if (!tpl) throw new Error('Template not found: ' + tplId);
  const node = tpl.content.cloneNode(true);
  const wrapper = document.createElement('div');
  wrapper.appendChild(node);
  app.appendChild(wrapper);
  currentView = wrapper;
  return wrapper;
}

// -----------------------------------------------------------------------------
// INICIO
// -----------------------------------------------------------------------------

window.addEventListener('load', async () => {
  token = localStorage.getItem('token');

  if (token) {
    await showPanelByRole();
  } else {
    showLogin();
  }
});

// -----------------------------------------------------------------------------
// LOGIN / LOGOUT
// -----------------------------------------------------------------------------

// We'll mount login template and wire handlers
function showLogin() {
  const wr = mountTemplate('tpl-login');
  const usernameEl = wr.querySelector('#username');
  const passwordEl = wr.querySelector('#password');
  const btnLogin = wr.querySelector('#btnLogin');

  btnLogin.addEventListener('click', async (e) => {
    const username = (usernameEl.value || '').trim();
    const password = (passwordEl.value || '').trim();
    try {
      const res = await loginRequest(username, password);
      token = res.token || res?.data?.token;
      if (!token) throw new Error('No token returned');
      localStorage.setItem('token', token);
      await showPanelByRole();
    } catch (err) {
      showToast('Credenciales incorrectas');
    }
  });
}

function bindLogout(btn) {
  btn.addEventListener('click', () => {
    localStorage.removeItem('token');
    token = null;
    showLogin();
  });
}

// -----------------------------------------------------------------------------
// PANELES POR ROL
// -----------------------------------------------------------------------------

async function showPanelByRole() {
  try {
    const me = await apiFetch('/auth/me', { token });

    if (me.role === 'RECEPCION') {
      showReception();
      await loadRooms();
    } else {
      showCleaner();
      await loadRooms();
    }
  } catch (e) {
    localStorage.removeItem('token');
    showLogin();
  }
}

function showReception() {
  const wr = mountTemplate('tpl-reception');
  const btnLogout = wr.querySelector('#btnLogout');
  const roomsContainer = wr.querySelector('#rooms');
  bindLogout(btnLogout);

  // expose rooms container to module-level functions
  currentRoomsContainer = roomsContainer;
}

function showCleaner() {
  const wr = mountTemplate('tpl-maid');
  const btnLogout = wr.querySelector('#btnLogout');
  const roomsContainer = wr.querySelector('#rooms');
  bindLogout(btnLogout);

  currentRoomsContainer = roomsContainer;
}

// Holder for currently mounted rooms container
let currentRoomsContainer = null;

// -----------------------------------------------------------------------------
// CARGAR HABITACIONES
// -----------------------------------------------------------------------------

async function loadRooms() {
  try {
    const rooms = await apiFetch('/rooms', { token });
    renderRooms(currentRoomsContainer, rooms, {
      onClean: markClean,
      onReport: (roomId) => showReportModal(roomId, sendReport),
      onUnlock: unlockRoom,
    });
  } catch (e) {
    showToast('Sin conexión – mostrando datos incompletos');
  }
}

// -----------------------------------------------------------------------------
// MARCAR LIMPIA
// -----------------------------------------------------------------------------

async function markClean(roomId) {
  try {
    await apiFetch(`/rooms/${roomId}/clean`, {
      method: 'POST',
      token
    });

    showToast('Habitación marcada como limpia');
    await loadRooms();
  } catch (err) {
    // Offline → guardar en cola
    await addSyncOp({
      type: 'clean-room',
      roomId,
      timestamp: Date.now()
    });

    showToast('Sin conexión. Se sincronizará después.');
  }
}

// -----------------------------------------------------------------------------
// DESBLOQUEAR HABITACION (RECEPCIÓN)
// -----------------------------------------------------------------------------

async function unlockRoom(roomId) {
  showConfirm('¿Habilitar habitación?', async () => {
    try {
      await apiFetch(`/rooms/${roomId}/unlock`, {
        method: 'POST',
        token
      });

      showToast('Habitación habilitada');
      await loadRooms();
    } catch (err) {
      showToast('Error: no se pudo habilitar');
    }
  });
}

// -----------------------------------------------------------------------------
// ENVIAR REPORTE
// -----------------------------------------------------------------------------

async function sendReport(roomId, description, photoFiles) {
  // Quitar nulls
  const realPhotos = photoFiles.filter(f => f);

  const formData = new FormData();
  formData.append('roomId', roomId);
  formData.append('description', description);
  realPhotos.forEach((file, i) => formData.append('photos', file));

  // --- Intento online
  try {
    await apiFetch('/reports', {
      method: 'POST',
      token,
      body: formData,
      isForm: true
    });

    showToast('Reporte enviado');
    await loadRooms();
    return;
  } catch (err) {
    // OFFLINE → guardar en cola
    await addSyncOp({
      type: 'send-report',
      roomId,
      description,
      photos: realPhotos, // se guardan como blobs en IndexedDB
      timestamp: Date.now()
    });

    showToast('Sin conexión. Reporte encolado.');
  }
}

// -----------------------------------------------------------------------------
// SYNC MANUAL (BOTÓN OPCIONAL)
// -----------------------------------------------------------------------------

document.getElementById('btn-sync')?.addEventListener('click', () => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ action: 'sync-now' });
    showToast('Sincronizando...');
  }
});
