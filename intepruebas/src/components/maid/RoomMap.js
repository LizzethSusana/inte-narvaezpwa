// =====================================================
// COMPONENTE: MAPA DE HABITACIONES
// =====================================================

import { getStatusKey, getFloorFromId, padRoomNumber } from '$/utils/helpers.js';
import { ROOM_FILTERS } from '$/utils/constants.js';

/**
 * Renderiza el mapa de habitaciones organizado por pisos
 * @param {HTMLElement} container - Contenedor donde renderizar el mapa
 * @param {Array} rooms - Lista de habitaciones
 * @param {Object} options - Opciones de renderizado
 * @param {string} options.currentFilter - Filtro actual
 * @param {string} options.searchQuery - Consulta de búsqueda
 * @param {number} options.currentUserId - ID del usuario actual
 * @param {Object} options.layoutConfig - Configuración de pisos y habitaciones
 * @param {Function} options.onMarkClean - Callback para marcar habitación como limpia
 * @param {Function} options.onReportIncident - Callback para reportar incidente
 * @param {boolean} options.rearCameraAvailable - Si hay cámara trasera disponible
 */
export function renderRoomMap(container, rooms, options = {}) {
  if (!container) return;

  const {
    currentFilter = ROOM_FILTERS.ALL,
    searchQuery = '',
    currentUserId = null,
    layoutConfig = null,
    onMarkClean = null,
    onReportIncident = null,
    rearCameraAvailable = true
  } = options;

  container.innerHTML = '';

  // Filtrar habitaciones
  const visibleRooms = rooms.filter(room => shouldShowRoom(room, {
    currentFilter,
    searchQuery,
    currentUserId
  }));

  if (!visibleRooms.length) {
    container.innerHTML = '<p>No se encontraron habitaciones con los filtros aplicados.</p>';
    return;
  }

  // Organizar por pisos
  const floors = organizeByFloors(visibleRooms, layoutConfig);

  if (!floors.length) {
    container.innerHTML = '<p>No se encontraron habitaciones con los filtros aplicados.</p>';
    return;
  }

  // Renderizar cada piso
  floors.forEach(({ floorId, seats }) => {
    const floorBlock = createFloorBlock(floorId, seats, {
      currentUserId,
      onMarkClean,
      onReportIncident,
      rearCameraAvailable
    });
    container.appendChild(floorBlock);
  });
}

/**
 * Verifica si una habitación debe mostrarse según los filtros
 * @param {Object} room
 * @param {Object} filters
 * @returns {boolean}
 */
function shouldShowRoom(room, filters) {
  const { currentFilter, searchQuery, currentUserId } = filters;

  // Filtrar por búsqueda de texto
  if (searchQuery) {
    const query = String(searchQuery).toLowerCase();
    const roomId = String(room.id).toLowerCase();
    if (!roomId.includes(query)) return false;
  }

  // Filtrar por estado seleccionado
  if (currentFilter === ROOM_FILTERS.ALL) return true;

  const statusKey = getStatusKey(room && room.status);

  if (currentFilter === ROOM_FILTERS.ASSIGNED) return room.maidId === currentUserId || room.maid === currentUserId;
  if (currentFilter === ROOM_FILTERS.DIRTY) return statusKey === 'dirty';
  if (currentFilter === ROOM_FILTERS.CLEAN) return statusKey === 'clean';
  if (currentFilter === ROOM_FILTERS.BLOCKED) return statusKey === 'blocked';

  return true;
}

/**
 * Organiza las habitaciones por pisos
 * @param {Array} rooms
 * @param {Object} layoutConfig
 * @returns {Array}
 */
function organizeByFloors(rooms, layoutConfig) {
  const floors = [];

  if (layoutConfig && layoutConfig.floors && layoutConfig.roomsPerFloor) {
    // Usar configuración de layout
    for (let f = 1; f <= layoutConfig.floors; f++) {
      const floorId = String(f);
      const seats = [];

      for (let n = 1; n <= layoutConfig.roomsPerFloor; n++) {
        const roomId = `${floorId}-${padRoomNumber(n)}`;
        const room = rooms.find(r => String(r.id) === roomId);

        if (room) {
          seats.push({ roomId, room });
        }
      }

      if (seats.length) {
        floors.push({ floorId, seats });
      }
    }
  } else {
    // Agrupar automáticamente por piso
    const grouped = rooms.reduce((acc, r) => {
      const fId = getFloorFromId(r.id);
      if (!acc[fId]) acc[fId] = [];
      acc[fId].push({ roomId: String(r.id), room: r });
      return acc;
    }, {});

    Object.keys(grouped)
      .sort((a, b) => Number(a) - Number(b))
      .forEach(floorId => floors.push({ floorId, seats: grouped[floorId] }));
  }

  return floors;
}

/**
 * Crea el bloque HTML de un piso
 * @param {string} floorId
 * @param {Array} seats
 * @param {Object} options
 * @returns {HTMLElement}
 */
function createFloorBlock(floorId, seats, options) {
  const { currentUserId, onMarkClean, onReportIncident, rearCameraAvailable } = options;

  const floorBlock = document.createElement('div');
  floorBlock.className = 'floor-block card';

  const title = document.createElement('div');
  title.className = 'floor-title';
  title.textContent = `Piso ${floorId}`;
  floorBlock.appendChild(title);

  const seatRow = document.createElement('div');
  seatRow.className = 'room-seats';

  seats.forEach(({ roomId, room }) => {
    const seat = createRoomSeat(roomId, room, {
      currentUserId,
      onMarkClean,
      onReportIncident,
      rearCameraAvailable
    });
    seatRow.appendChild(seat);
  });

  floorBlock.appendChild(seatRow);

  return floorBlock;
}

/**
 * Crea el elemento HTML de una habitación
 * @param {string} roomId
 * @param {Object} room
 * @param {Object} options
 * @returns {HTMLElement}
 */
function createRoomSeat(roomId, room, options) {
  const { currentUserId, onMarkClean, onReportIncident, rearCameraAvailable } = options;

  const statusKey = getStatusKey(room && room.status);
  const assignedToMe = room && (room.maidId === currentUserId || room.maid === currentUserId);

  let colorClass = 'seat-gray';
  if (statusKey === 'blocked' || statusKey === 'siniestro') colorClass = 'seat-red';
  else if (assignedToMe) colorClass = 'seat-green';
  else if (statusKey === 'dirty') colorClass = 'seat-blue';

  const seat = document.createElement('div');
  seat.className = `room-seat ${colorClass}`;
  seat.setAttribute('data-room', roomId);

  const seatHeader = document.createElement('div');
  seatHeader.className = 'room-seat__name';
  seatHeader.textContent = roomId;

  const seatMeta = document.createElement('div');
  seatMeta.className = 'room-seat__meta';
  seatMeta.textContent = room ? (room.status || 'Limpia') : 'Sin registrar';

  const seatAssign = document.createElement('div');
  seatAssign.className = 'room-seat__assignment';
  if (room) {
    seatAssign.textContent = room.maidId || room.maid ? `Asignada` : 'Sin asignar';
  } else {
    seatAssign.textContent = 'No existe en base';
  }

  const actions = document.createElement('div');
  actions.className = 'seat-actions';

  // Botón "Marcar como limpia" solo si está sucia
  if (room && statusKey === 'dirty') {
    const btnClean = document.createElement('button');
    btnClean.type = 'button';
    btnClean.className = 'btn btn-sm btn-success';
    btnClean.innerHTML = '<i class="bi bi-broom"></i>Limpia';

    const handleClean = async (ev) => {
      ev.stopPropagation();
      if (onMarkClean) await onMarkClean(room);
    };

    btnClean.addEventListener('click', handleClean);
    btnClean.addEventListener('touchend', handleClean);
    actions.appendChild(btnClean);
  }

  // Botón "Siniestro" siempre disponible
  if (room) {
    const btnReport = document.createElement('button');
    btnReport.type = 'button';
    btnReport.className = 'btn btn-sm btn-danger';
    btnReport.innerHTML = '<i class="bi bi-exclamation-triangle"></i>Siniestro';

    // Solo deshabilitar si explícitamente es false (no null ni undefined)
    if (rearCameraAvailable === false) {
      btnReport.disabled = true;
      btnReport.setAttribute('aria-disabled', 'true');
      btnReport.classList.add('disabled');
      btnReport.title = 'Función no disponible en dispositivos sin cámara trasera';
    }

    const handleReport = async (ev) => {
      ev.stopPropagation();
      if (onReportIncident) await onReportIncident(room);
    };

    btnReport.addEventListener('click', handleReport);
    btnReport.addEventListener('touchend', handleReport);
    actions.appendChild(btnReport);
  }

  seat.appendChild(seatHeader);
  seat.appendChild(seatMeta);
  seat.appendChild(seatAssign);
  if (actions.childElementCount) seat.appendChild(actions);

  seat.title = `Hab ${roomId} \nEstado: ${room ? (room.status || 'Limpia') : 'Sin registrar'}${room && room.rented ? ' (ocupada)' : ''}\nAsignación: ${room && (room.maidId || room.maid) ? 'Asignada' : 'Ninguna'}`;

  return seat;
}
