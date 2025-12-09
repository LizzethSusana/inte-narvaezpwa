// =====================
// RECEPTION - ARCHIVO PRINCIPAL
// =====================

import { getAll, get, put } from './idb.js'
import { initModal, getModal } from './modules/shared/modal.js'
import { padRoom } from './modules/shared/utils.js'
import { renderRooms, ensureRoomsFromLayout } from './modules/rooms/rooms.js'
import { renderMaids } from './modules/maids/maids.js'
import { renderReports } from './modules/reports/reports.js'
import { openRoomAddModal } from './modules/rooms/rooms-modal.js'
import { openMaidAddModal } from './modules/maids/maids-modal.js'
import { openReportModal } from './modules/reports/reports-modal.js'
import { getRooms, getUsers, getRoomAssignments, getReports } from './api.js'

// =====================
// DESREGISTRAR SW EN DESARROLLO
// =====================
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  if (import.meta && import.meta.env && import.meta.env.DEV) {
    navigator.serviceWorker
      .getRegistrations()
      .then((rs) => rs.forEach((r) => r.unregister()))
      .catch(() => {})
  }
}

// =====================
// REFERENCIAS DOM
// =====================
const modal = document.getElementById('modal')
const roomsList = document.getElementById('roomsList')
const maidsList = document.getElementById('maidsList')
const reportsEl = document.getElementById('reportsList')
const btnAddRoom = document.getElementById('btnAddRoom')
const btnAddMaid = document.getElementById('btnAddMaid')
const layoutFloorsInput = document.getElementById('layoutFloors')
const layoutRoomsInput = document.getElementById('layoutRooms')
const btnSaveLayout = document.getElementById('btnSaveLayout')
const layoutStatus = document.getElementById('layoutStatus')
const navItems = document.querySelectorAll('.nav-item')

// Inicializar modal
initModal(modal)

// =====================
// CONFIGURACIÓN DE LAYOUT
// =====================
let layoutSettings = null

/**
 * Carga la configuración del layout guardada
 */
async function loadLayoutSettings() {
  try {
    const stored = await get('settings', 'hotelLayout')
    if (stored) {
      layoutSettings = stored
      if (layoutFloorsInput) layoutFloorsInput.value = stored.floors
      if (layoutRoomsInput) layoutRoomsInput.value = stored.roomsPerFloor
      if (layoutStatus)
        layoutStatus.textContent = `El hotel tiene: ${stored.floors} pisos x ${stored.roomsPerFloor} hab.`
    }
  } catch (e) {
    console.warn('No se pudo cargar layout', e)
  }
}

/**
 * Guarda la configuración del layout
 */
async function saveLayoutSettings(floors, roomsPerFloor) {
  layoutSettings = {
    key: 'hotelLayout',
    floors,
    roomsPerFloor,
    updatedAt: new Date().toISOString(),
  }
  await put('settings', layoutSettings)
}

// =====================
// FUNCIONES DE RENDERIZADO
// =====================

/**
 * Sincroniza datos desde el backend
 */
async function syncDataFromBackend() {
  if (!navigator.onLine) {
    console.log('Sin conexión - usando datos locales');
    return;
  }

  try {
    // Sincronizar habitaciones
    const rooms = await getRooms();
    for (const room of rooms) {
      await put('rooms', {
        id: room.id,
        number: room.number,
        status: room.status,
      });
    }

    // Sincronizar usuarios (camareras)
    const users = await getUsers();
    const maids = users.filter(u => u.rol?.id === 2); // Solo camareras (ID=2)
    for (const maid of maids) {
      await put('maids', {
        id: maid.id,
        name: maid.fullname,
        email: maid.username,
        active: maid.active,
      });
    }

    // Sincronizar asignaciones
    const assignments = await getRoomAssignments();
    for (const assignment of assignments) {
      // Actualizar la habitación con la asignación de camarera
      if (assignment.room && assignment.user) {
        const room = await get('rooms', assignment.room.id);
        if (room) {
          room.maid = assignment.user.id;
          await put('rooms', room);
        }
      }
    }

    // Sincronizar reportes
    const reports = await getReports();
    for (const report of reports) {
      await put('reports', {
        id: report.id,
        description: report.description,
        photo1: report.photo1,
        photo2: report.photo2,
        photo3: report.photo3,
        room: report.room,
        user: report.user,
        createdAt: report.createdAt,
      });
    }

    console.log('Datos sincronizados correctamente');
  } catch (error) {
    console.error('Error al sincronizar datos:', error);
  }
}

/**
 * Renderiza todos los datos (habitaciones, camareras, reportes)
 */
async function renderAll() {
  try {
    const rooms = (await getAll('rooms').catch(() => [])) || []
    const maids = (await getAll('maids').catch(() => [])) || []
    const reports = (await getAll('reports').catch(() => [])) || []

    if (roomsList) await renderRooms(roomsList, rooms, maids)
    if (maidsList) await renderMaids(maidsList, maids)
    if (reportsEl) await renderReports(reportsEl, reports, maids)
  } catch (error) {
    console.error('Error al renderizar datos:', error)
  }
}

// =====================
// EVENT LISTENERS - BOTONES
// =====================

if (btnAddRoom) {
  btnAddRoom.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    openRoomAddModal()
  })

  btnAddRoom.addEventListener('touchend', (e) => {
    e.preventDefault()
    e.stopPropagation()
    openRoomAddModal()
  })
}

if (btnAddMaid) {
  btnAddMaid.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    openMaidAddModal()
  })

  btnAddMaid.addEventListener('touchend', (e) => {
    e.preventDefault()
    e.stopPropagation()
    openMaidAddModal()
  })
}

if (btnSaveLayout) {
  btnSaveLayout.addEventListener('click', async (e) => {
    e.preventDefault()
    e.stopPropagation()

    const floors = parseInt(layoutFloorsInput?.value || '0', 10)
    const roomsPerFloor = parseInt(layoutRoomsInput?.value || '0', 10)

    if (!floors || floors < 1) return alert('Ingresa el número de pisos')
    if (!roomsPerFloor || roomsPerFloor < 1)
      return alert('Ingresa habitaciones por piso')

    await saveLayoutSettings(floors, roomsPerFloor)
    const created = await ensureRoomsFromLayout(floors, roomsPerFloor)

    if (layoutStatus)
      layoutStatus.textContent = `Guardado: ${floors} pisos x ${roomsPerFloor} hab. (${created} nuevas)`

    await renderAll()
  })
}

// =====================
// MENÚ DE NAVEGACIÓN
// =====================

navItems.forEach((item) => {
  item.addEventListener('click', () => {
    const section = item.dataset.section
    scrollToSection(section)
  })
})

/**
 * Desplaza a una sección específica
 */
function scrollToSection(section) {
  const sectionMap = {
    rooms: roomsList.closest('.card'),
    maids: maidsList.closest('.card'),
    reports: reportsEl.closest('.card'),
  }

  const targetSection = sectionMap[section]
  if (targetSection) {
    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// =====================
// INICIALIZACIÓN
// =====================

;(async () => {
  await loadLayoutSettings()
  
  // Sincronizar datos desde el backend
  await syncDataFromBackend()
  
  if (layoutSettings?.floors && layoutSettings?.roomsPerFloor) {
    await ensureRoomsFromLayout(layoutSettings.floors, layoutSettings.roomsPerFloor)
  }
  await renderAll()
})()
