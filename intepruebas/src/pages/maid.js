// =====================================================
// PÁGINA: VISTA DE CAMARERA
// =====================================================

import { openDB, getAll, get, put } from '../idb.js';
import { getAllRooms, updateRoomStatus, getRoomAssignments } from '$/services/ApiMaid.js';
import { getCurrentUserId } from '$/utils/jwt.js';
import { renderRoomMap } from '$/components/maid/RoomMap.js';
import { renderFilterLegend } from '$/components/maid/FilterLegend.js';
import { openReportModal } from '$/components/maid/ReportModal.js';
import { openQRScanner } from '$/components/maid/QRScanner.js';
import { hasRearCamera } from '$/utils/camera.js';
import { ROOM_FILTERS, ROOM_STATUS } from '$/utils/constants.js';

// En desarrollo, desregistrar SW para evitar caché de estilos
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  if (import.meta && import.meta.env && import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then(rs => rs.forEach(r => r.unregister())).catch(() => {});
  }
}

// =====================
// ESTADO DE LA APLICACIÓN
// =====================

const state = {
  currentFilter: ROOM_FILTERS.ALL,
  searchQuery: '',
  rearCameraAvailable: null,
  layoutConfig: null,
  currentUserId: null,
};

// =====================
// ELEMENTOS DEL DOM
// =====================

const allRoomsGrid = document.getElementById('allRooms');
const roomSearchInput = document.getElementById('roomSearch');
const scanQrBtn = document.getElementById('scanQrBtn');
const filterLegend = document.getElementById('filterLegend');
const searchHint = document.getElementById('searchHint');

// =====================
// FUNCIONES PRINCIPALES
// =====================

/**
 * Carga la configuración de layout del hotel desde IndexedDB
 */
async function loadLayoutConfig() {
  try {
    const stored = await get('settings', 'hotelLayout');
    if (stored) state.layoutConfig = stored;
  } catch (e) {
    state.layoutConfig = null;
  }
}

/**
 * Sincroniza datos desde el backend a IndexedDB
 */
async function syncFromBackend() {
  if (!navigator.onLine) {
    console.log('Sin conexión - usando datos locales');
    return;
  }

  console.log('Sincronizando datos desde backend...');

  try {
    const [backendRooms, assignments] = await Promise.all([
      getAllRooms(),
      getRoomAssignments()
    ]);

    for (const room of backendRooms) {
      const assignment = assignments.find(a => a.room?.id === room.id);

      await put('rooms', {
        id: room.id,
        number: room.number,
        status: room.status,
        maidId: assignment?.user?.id || null,
        assignmentId: assignment?.id || null,
        assignmentDate: assignment?.fechaAsignacion || null,
      });
    }

    console.log('Sincronización completada:', backendRooms.length, 'habitaciones');
  } catch (error) {
    console.error('Error en sincronización:', error);

    // Si el error es 403, redirigir al login
    if (error.message && error.message.includes('403')) {
      alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      location.href = './index.html';
    }
  }
}

/**
 * Marca una habitación como limpia
 * @param {Object} room
 */
async function markRoomClean(room) {
  if (!room) return;

  // Mostrar modal de confirmación
  const confirmed = await confirmMarkClean(room);
  if (!confirmed) return;

  const originalStatus = room.status;

  // Actualizar localmente
  room.status = ROOM_STATUS.CLEAN;
  room.cleanedBy = state.currentUserId;
  room.cleanedAt = new Date().toISOString();

  try {
    await put('rooms', room);

    // Intentar actualizar en el backend si hay conexión
    if (navigator.onLine) {
      await updateRoomStatus({
        id: room.id,
        number: room.number,
        status: ROOM_STATUS.CLEAN
      });
    }

    await render();
  } catch (e) {
    console.error('Error al actualizar habitación:', e);
    // Revertir cambio local
    room.status = originalStatus;
    await put('rooms', room);
    alert('No se pudo actualizar la habitación: ' + (e && e.message));
  }
}

/**
 * Abre el modal de reporte de siniestro
 * @param {Object} room
 */
async function triggerReport(room) {
  if (!room) return;

  // Verificar cámara trasera
  if (state.rearCameraAvailable === null) {
    state.rearCameraAvailable = await hasRearCamera();
  }

  if (!state.rearCameraAvailable) {
    alert('Función no habilitada en dispositivos sin cámara trasera');
    return;
  }

  openReportModal(room, state.currentUserId, async () => {
    await render();
  });
}

/**
 * Renderiza la vista completa
 */
async function render() {
  if (!state.layoutConfig) await loadLayoutConfig();

  // Obtener habitaciones locales
  let rooms = (await getAll('rooms').catch(() => [])) || [];

  // Si no hay datos locales y hay conexión, sincronizar
  if (rooms.length === 0 && navigator.onLine) {
    await syncFromBackend();
    rooms = (await getAll('rooms').catch(() => [])) || [];
  }

  // Renderizar mapa de habitaciones
  renderRoomMap(allRoomsGrid, rooms, {
    currentFilter: state.currentFilter,
    searchQuery: state.searchQuery,
    currentUserId: state.currentUserId,
    layoutConfig: state.layoutConfig,
    onMarkClean: markRoomClean,
    onReportIncident: triggerReport,
    rearCameraAvailable: state.rearCameraAvailable
  });
}

/**
 * Modal de confirmación para marcar habitación como limpia
 * @param {Object} room
 * @returns {Promise<boolean>}
 */
function confirmMarkClean(room) {
  return new Promise((res) => {
    const hasConnection = navigator.onLine;
    const connectionStatus = hasConnection ? '' : '⚠ Conexión: Sin internet';
    const connectionColor = hasConnection ? '#2e8b57' : '#b8860b';

    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.style.display = 'flex';

    modal.innerHTML = `
      <div class="modal-content" role="dialog">
        <h4 style="margin-bottom: 20px; color: var(--primary);">Marcar habitación como limpia</h4>
        <p style="font-size: 1rem; margin: 16px 0; line-height: 1.6; color: #555;">
          ¿Estás seguro de que la habitación <strong style="color: var(--primary);">${room.id}</strong> ha sido limpiada correctamente?
        </p>
        <div style="background: #f8f9fa; padding: 14px; border-left: 4px solid ${connectionColor}; border-radius: 6px; margin: 16px 0; font-size: 0.95rem;">
          <div style="color: ${connectionColor}; font-weight: 600;">
            ${connectionStatus}
          </div>
          ${!hasConnection ? '<div style="color: #b8860b; margin-top: 8px; font-size: 0.9rem;">Los datos se sincronizarán automáticamente cuando haya conexión.</div>' : ''}
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px;">
          <button id="confirmNo" class="btn btn-sm btn-secondary">Cancelar</button>
          <button id="confirmYes" class="btn btn-sm btn-primary">Sí, está limpia</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const cleanup = () => {
      modal.remove();
    };

    modal.querySelector('#confirmNo').addEventListener('click', () => {
      cleanup();
      res(false);
    });

    modal.querySelector('#confirmYes').addEventListener('click', () => {
      cleanup();
      res(true);
    });
  });
}

// =====================
// INICIALIZACIÓN
// =====================

async function init() {
  // Verificar autenticación
  const authToken = localStorage.getItem('authToken');
  if (!authToken) {
    console.warn('No hay token de autenticación, redirigiendo al login...');
    alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
    location.href = './index.html';
    return;
  }

  // Obtener ID del usuario actual
  state.currentUserId = getCurrentUserId();
  if (!state.currentUserId) {
    alert('No se pudo obtener la información del usuario. Por favor, inicia sesión nuevamente.');
    location.href = './index.html';
    return;
  }

  // Abrir IndexedDB
  await openDB();

  // Detectar cámara trasera ANTES de cualquier renderizado
  try {
    state.rearCameraAvailable = await hasRearCamera();
    console.log('Cámara trasera disponible:', state.rearCameraAvailable);
  } catch (e) {
    console.error('Error al detectar cámara:', e);
    state.rearCameraAvailable = false;
  }

  // Sincronizar con backend al iniciar
  await syncFromBackend();

  // Renderizar leyenda de filtros
  renderFilterLegend(filterLegend, state.currentFilter, (newFilter) => {
    state.currentFilter = newFilter;
    render();
  });

  // Event: Input de búsqueda
  roomSearchInput.addEventListener('input', (e) => {
    state.searchQuery = String(e.target.value).trim();
    searchHint.textContent = state.searchQuery ? `Filtrando: "${state.searchQuery}"` : '';
    render();
  });

  // Event: Enter en búsqueda (scroll a habitación)
  roomSearchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = String(roomSearchInput.value).trim();
      if (value) {
        const seats = Array.from(document.querySelectorAll('[data-room]'));
        const match = seats.find(s => s.getAttribute('data-room') === value);
        if (match) {
          match.scrollIntoView({ behavior: 'smooth', block: 'center' });
          match.style.backgroundColor = '#fffacd';
          setTimeout(() => (match.style.backgroundColor = ''), 1500);
        } else {
          searchHint.textContent = `Habitación "${value}" no encontrada`;
        }
      }
    }
  });

  // Event: Escanear QR
  scanQrBtn.addEventListener('click', async () => {
    if (state.rearCameraAvailable === null) {
      state.rearCameraAvailable = await hasRearCamera();
    }

    if (!state.rearCameraAvailable) {
      alert('El escaneo de QR requiere cámara trasera. Esta función no está disponible en tu dispositivo.');
      return;
    }

    alert('Se va a solicitar acceso a la cámara para escanear el código QR de la habitación.');

    openQRScanner(
      (qrData) => {
        roomSearchInput.value = qrData;
        state.searchQuery = qrData;
        searchHint.textContent = `Escaneado: "${qrData}"`;
        render();
      },
      () => {
        console.log('Escaneo cancelado');
      }
    );
  });

  // Deshabilitar botón QR si no hay cámara trasera
  if (state.rearCameraAvailable === false) {
    scanQrBtn.disabled = true;
    scanQrBtn.classList.add('disabled');
    scanQrBtn.title = 'Requiere cámara trasera';
  }

  // Renderizar vista inicial
  await render();
}

init();
