// =====================================================
// PÁGINA: VISTA DE CAMARERA - MOBILE FIRST
// =====================================================

import { openDB, getAll, put } from '../idb.js';
import { getAllRooms, updateRoomStatus, getRoomAssignments } from '$/services/ApiMaid.js';
import { getCurrentUserId } from '$/utils/jwt.js';
import { openReportModal } from '$/components/maid/ReportModal.js';
import { openQRScanner } from '$/components/maid/QRScanner.js';
import { hasRearCamera } from '$/utils/camera.js';
import { ROOM_STATUS } from '$/utils/constants.js';
import { saveRoomStatusOffline, setupOnlineListener, flushOutbox } from '../offline-sync.js';
import { roomStatusToAPI } from '../modules/shared/constants.js';

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
  currentFilter: 'all', // all, myRooms, dirty, clean, incident
  selectedFloor: null, // null = todas, 1, 2, 3, etc.
  rearCameraAvailable: null,
  currentUserId: null,
  allRooms: [],
};

// =====================
// ELEMENTOS DEL DOM
// =====================

const userEmail = document.getElementById('userEmail');
const logoutBtn = document.getElementById('logoutBtn');
const scanQrBtn = document.getElementById('scanQrBtn');
const filterGroup = document.getElementById('filterGroup');
const floorGrid = document.getElementById('floorGrid');
const roomsList = document.getElementById('roomsList');

// =====================
// FUNCIONES PRINCIPALES
// =====================

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
 * Extrae el número de piso de una habitación siguiendo la nomenclatura
 * Formato: N-XX donde N es el piso
 * @param {string} roomNumber
 * @returns {number|null}
 */
function extractFloorFromRoom(roomNumber) {
  if (!roomNumber) return null;

  const match = String(roomNumber).match(/^(\d+)-/);
  if (match) {
    return parseInt(match[1], 10);
  }

  return null;
}

/**
 * Obtiene todos los pisos únicos de las habitaciones
 * @param {Array} rooms
 * @returns {Array<number>}
 */
function getUniqueFloors(rooms) {
  const floors = new Set();

  rooms.forEach(room => {
    const floor = extractFloorFromRoom(room.number);
    if (floor !== null) {
      floors.add(floor);
    }
  });

  return Array.from(floors).sort((a, b) => a - b);
}

/**
 * Filtra habitaciones según el filtro actual y piso seleccionado
 * @param {Array} rooms
 * @returns {Array}
 */
function filterRooms(rooms) {
  let filtered = rooms;

  // Filtro por tipo
  switch (state.currentFilter) {
    case 'myRooms':
      filtered = filtered.filter(r => r.maidId === state.currentUserId);
      break;
    case 'dirty':
      filtered = filtered.filter(r => r.status === 'Sucia' || r.status === 'limpieza');
      break;
    case 'clean':
      filtered = filtered.filter(r => r.status === 'Limpia' || r.status === 'disponible');
      break;
    case 'incident':
      filtered = filtered.filter(r => r.status === 'Bloqueada' || r.status === 'mantenimiento');
      break;
    default:
      // all - no filtrar
      break;
  }

  // Filtro por piso
  if (state.selectedFloor !== null) {
    filtered = filtered.filter(r => {
      const floor = extractFloorFromRoom(r.number);
      return floor === state.selectedFloor;
    });
  }

  return filtered;
}

/**
 * Renderiza el button group de filtros
 */
function renderFilterGroup() {
  const filters = [
    { id: 'all', label: 'Todas' },
    { id: 'myRooms', label: 'Asignadas a mí' },
    { id: 'dirty', label: 'Sucias' },
    { id: 'clean', label: 'Limpias' },
    { id: 'incident', label: 'Siniestro' },
  ];

  filterGroup.innerHTML = filters.map(filter => `
    <button
      class="filter-btn ${state.currentFilter === filter.id ? 'active' : ''}"
      data-filter="${filter.id}"
    >
      ${filter.label}
    </button>
  `).join('');

  // Event listeners
  filterGroup.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentFilter = btn.dataset.filter;
      renderFilterGroup();
      renderRooms();
    });
  });
}

/**
 * Renderiza las cards de pisos
 */
function renderFloorGrid() {
  const floors = getUniqueFloors(state.allRooms);

  // Calcular cuántas habitaciones hay en cada piso
  const floorCounts = {};
  floors.forEach(floor => {
    floorCounts[floor] = state.allRooms.filter(r => extractFloorFromRoom(r.number) === floor).length;
  });

  // Agregar "Otros" si hay habitaciones sin piso
  const othersCount = state.allRooms.filter(r => extractFloorFromRoom(r.number) === null).length;

  floorGrid.innerHTML = '';

  // Pisos con nomenclatura estándar
  floors.forEach(floor => {
    const card = document.createElement('div');
    card.className = `floor-card ${state.selectedFloor === floor ? 'selected' : ''}`;
    card.innerHTML = `
      <div class="floor-card-content">
        <div class="floor-label">Piso</div>
      </div>
      <div class="floor-number-badge">${floor}</div>
    `;

    card.addEventListener('click', () => {
      // Toggle: si ya está seleccionado, deseleccionar
      state.selectedFloor = state.selectedFloor === floor ? null : floor;
      renderFloorGrid();
      renderRooms();
    });

    floorGrid.appendChild(card);
  });

  // Card de "Otros" si hay habitaciones sin nomenclatura estándar
  if (othersCount > 0) {
    const othersCard = document.createElement('div');
    othersCard.className = `floor-card ${state.selectedFloor === 'others' ? 'selected' : ''}`;
    othersCard.innerHTML = `
      <div class="floor-card-content">
        <div class="floor-label">Piso</div>
      </div>
      <div class="floor-number-badge">Otros</div>
    `;

    othersCard.addEventListener('click', () => {
      state.selectedFloor = state.selectedFloor === 'others' ? null : 'others';
      renderFloorGrid();
      renderRooms();
    });

    floorGrid.appendChild(othersCard);
  }
}

/**
 * Renderiza las cards de habitaciones
 */
function renderRooms() {
  let rooms = filterRooms(state.allRooms);

  // Si selectedFloor es 'others', mostrar solo habitaciones sin piso
  if (state.selectedFloor === 'others') {
    rooms = rooms.filter(r => extractFloorFromRoom(r.number) === null);
  }

  roomsList.innerHTML = '';

  if (rooms.length === 0) {
    roomsList.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: var(--color-text-light);">
        <i class="bi bi-inbox" style="font-size: 48px; opacity: 0.3; display: block; margin-bottom: 16px;"></i>
        <p style="font-size: 16px; font-weight: 600;">No hay habitaciones con este filtro</p>
      </div>
    `;
    return;
  }

  rooms.forEach(room => {
    const card = createRoomCard(room);
    roomsList.appendChild(card);
  });
}

/**
 * Crea una card de habitación
 * @param {Object} room
 * @returns {HTMLElement}
 */
function createRoomCard(room) {
  const card = document.createElement('div');

  // Clase de status para el borde de color
  const statusClass = `status-${(room.status || 'disponible').toLowerCase()}`;
  card.className = `room-card ${statusClass}`;

  card.innerHTML = `
    <div class="room-card-left">
      <div class="room-icon">
        <i class="bi bi-door-closed"></i>
      </div>
      <div class="room-info">
        <div class="room-number">${room.number || room.id}</div>
        <div class="room-status">${room.status || 'Disponible'}</div>
      </div>
    </div>
    <div class="room-card-right">
      <button class="room-action-btn btn-clean" title="Marcar como limpia" data-action="clean">
        <i class="bi bi-check-circle"></i>
      </button>
      <button class="room-action-btn btn-report" title="Reportar siniestro" data-action="report">
        <i class="bi bi-exclamation-triangle"></i>
      </button>
    </div>
  `;

  // Event listeners para botones
  const btnClean = card.querySelector('[data-action="clean"]');
  const btnReport = card.querySelector('[data-action="report"]');

  btnClean.addEventListener('click', () => markRoomClean(room));
  btnReport.addEventListener('click', () => triggerReport(room));

  // Deshabilitar botón de reporte si no hay cámara trasera
  if (state.rearCameraAvailable === false) {
    btnReport.disabled = true;
  }

  return card;
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
  const hasConnection = navigator.onLine;

  // Actualizar localmente SIEMPRE
  room.status = ROOM_STATUS.CLEAN;
  room.cleanedBy = state.currentUserId;
  room.cleanedAt = new Date().toISOString();
  room._pendingSync = !hasConnection; // Marcar si está pendiente de sincronización

  try {
    // Guardar en IndexedDB
    await put('rooms', room);

    // Intentar sincronizar con backend si hay conexión
    if (hasConnection) {
      try {
        await updateRoomStatus({
          id: room.id,
          number: room.number,
          status: roomStatusToAPI(ROOM_STATUS.CLEAN), // Convertir a formato API
          userId: state.currentUserId
        });

        // Si tuvo éxito, quitar marca de pendiente
        room._pendingSync = false;
        await put('rooms', room);

        console.log(`[Maid] Habitación ${room.number} marcada como limpia y sincronizada`);
      } catch (syncError) {
        console.warn(`[Maid] Error al sincronizar con backend, guardando en outbox:`, syncError);

        // Guardar en outbox para sincronización posterior
        await saveRoomStatusOffline({
          room_id: room.id,
          room_number: room.number,
          status: ROOM_STATUS.CLEAN,
          user_id: state.currentUserId
        });

        alert('✓ Habitación marcada como limpia.\n\n⚠️ No se pudo sincronizar con el servidor.\nSe guardó para sincronizar más tarde.');
      }
    } else {
      // Sin conexión - guardar en outbox directamente
      console.log(`[Maid] Sin conexión, guardando en outbox`);

      await saveRoomStatusOffline({
        room_id: room.id,
        room_number: room.number,
        status: ROOM_STATUS.CLEAN,
        user_id: state.currentUserId
      });

      alert('✓ Habitación marcada como limpia.\n\n📱 Sin conexión a internet.\nSe sincronizará automáticamente cuando la conexión se restablezca.');
    }

    await loadAndRender();
  } catch (e) {
    console.error('Error al actualizar habitación:', e);
    // Revertir cambio local solo si falla el guardado en IndexedDB
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
    await loadAndRender();
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
        <h4 style="margin-bottom: 20px; color: var(--color-text);">Marcar habitación como limpia</h4>
        <p style="font-size: 1rem; margin: 16px 0; line-height: 1.6; color: #555;">
          ¿Estás seguro de que la habitación <strong style="color: var(--color-primary-dark);">${room.number || room.id}</strong> ha sido limpiada correctamente?
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

/**
 * Carga las habitaciones y renderiza la interfaz
 */
async function loadAndRender() {
  // Obtener habitaciones locales
  let rooms = (await getAll('rooms').catch(() => [])) || [];

  // Si no hay datos locales y hay conexión, sincronizar
  if (rooms.length === 0 && navigator.onLine) {
    await syncFromBackend();
    rooms = (await getAll('rooms').catch(() => [])) || [];
  }

  state.allRooms = rooms;

  renderFilterGroup();
  renderFloorGrid();
  renderRooms();
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

  // Mostrar email del usuario
  const username = localStorage.getItem('username');
  userEmail.textContent = username || 'Usuario';

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

  // Event: Logout
  logoutBtn.addEventListener('click', () => {
    const confirm = window.confirm('¿Estás seguro de que deseas cerrar sesión?');
    if (confirm) {
      localStorage.clear();
      location.href = './index.html';
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
        // Buscar la habitación y hacer scroll
        const room = state.allRooms.find(r => String(r.number) === String(qrData) || String(r.id) === String(qrData));

        if (room) {
          // Limpiar filtros para mostrar todas
          state.currentFilter = 'all';
          const floor = extractFloorFromRoom(room.number);
          state.selectedFloor = floor;

          loadAndRender();

          // Hacer scroll después de renderizar
          setTimeout(() => {
            const cards = Array.from(document.querySelectorAll('.room-card'));
            const targetCard = cards.find(c => {
              const numberEl = c.querySelector('.room-number');
              return numberEl && (numberEl.textContent === String(room.number) || numberEl.textContent === String(room.id));
            });

            if (targetCard) {
              targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
              targetCard.style.boxShadow = '0 0 0 4px var(--color-primary)';
              setTimeout(() => {
                targetCard.style.boxShadow = '';
              }, 2000);
            }
          }, 300);
        } else {
          alert(`No se encontró la habitación "${qrData}"`);
        }
      },
      () => {
        console.log('Escaneo cancelado');
      }
    );
  });

  // Deshabilitar botón QR si no hay cámara trasera
  if (state.rearCameraAvailable === false) {
    scanQrBtn.disabled = true;
  }

  // Configurar listeners para sincronización automática al recuperar conexión
  setupOnlineListener();

  // Intentar sincronizar operaciones pendientes si hay conexión
  if (navigator.onLine) {
    console.log('[Maid] Hay conexión, intentando sincronizar operaciones pendientes...');
    try {
      const result = await flushOutbox();
      if (result.success > 0) {
        console.log(`[Maid] Se sincronizaron ${result.success} operaciones pendientes al iniciar`);
      }
    } catch (e) {
      console.warn('[Maid] Error al sincronizar operaciones pendientes:', e);
    }
  }

  // Cargar y renderizar vista inicial
  await loadAndRender();
}

init();
