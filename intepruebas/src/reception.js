// =====================
// RECEPTION - ARCHIVO PRINCIPAL
// =====================

import { getAll, get, put, del } from './idb.js'
import { initModal, getModal, showModal, hideModal } from './modules/shared/modal.js'
import { padRoom } from './modules/shared/utils.js'
import { renderRooms, ensureRoomsFromLayout } from './modules/rooms/rooms.js'
import { renderMaids } from './modules/maids/maids.js'
import { renderReports } from './modules/reports/reports.js'
import { openRoomAddModal } from './modules/rooms/rooms-modal.js'
import { openMaidAddModal } from './modules/maids/maids-modal.js'
import { openReportModal } from './modules/reports/reports-modal.js'
import { getRooms, getUsers, getRoomAssignments, getReports, deleteRoom } from './api.js'

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
const searchRoomsInput = document.getElementById('searchRooms')
const clearSearchBtn = document.getElementById('clearSearchRooms')

// Inicializar modal
initModal(modal)

// =====================
// BÚSQUEDA DE HABITACIONES
// =====================
let allRooms = []
let allMaids = []

/**
 * Filtra las habitaciones según el término de búsqueda
 */
function filterRooms(searchTerm) {
  if (!searchTerm.trim()) {
    return allRooms
  }
  
  const term = searchTerm.toLowerCase().trim()
  return allRooms.filter(room => {
    const roomNumber = (room.number || room.id || '').toString().toLowerCase()
    const roomStatus = (room.status || '').toLowerCase()
    return roomNumber.includes(term) || roomStatus.includes(term)
  })
}

/**
 * Renderiza las habitaciones con filtro de búsqueda
 */
async function renderRoomsWithFilter() {
  const searchTerm = searchRoomsInput?.value || ''
  const filtered = filterRooms(searchTerm)
  await renderRooms(roomsList, allRooms, allMaids, filtered)
}

if (searchRoomsInput) {
  searchRoomsInput.addEventListener('input', renderRoomsWithFilter)
}

if (clearSearchBtn) {
  clearSearchBtn.addEventListener('click', async () => {
    if (searchRoomsInput) searchRoomsInput.value = ''
    await renderRoomsWithFilter()
  })
}

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

    // Guardar en variables globales para la búsqueda
    allRooms = rooms
    allMaids = maids

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

    // Verificar si hay un layout previo configurado
    if (layoutSettings && layoutSettings.floors && layoutSettings.roomsPerFloor) {
      const hasChanges = layoutSettings.floors !== floors || layoutSettings.roomsPerFloor !== roomsPerFloor
      
      if (hasChanges) {
        // Mostrar modal de confirmación de cambio
        const totalRooms = floors * roomsPerFloor
        const previousTotal = layoutSettings.floors * layoutSettings.roomsPerFloor
        const confirmModal = getModal()
        showModal()
        
        confirmModal.innerHTML = `
          <div class="modal-content">
            <h3>⚠️ Confirmar cambio de configuración</h3>
            <p><strong>Configuración actual:</strong> ${layoutSettings.floors} pisos × ${layoutSettings.roomsPerFloor} habitaciones = ${previousTotal} hab.</p>
            <p><strong>Nueva configuración:</strong> ${floors} pisos × ${roomsPerFloor} habitaciones = ${totalRooms} hab.</p>
            <p style="color: #d32f2f; margin-top: 16px;">
              <i class="bi bi-exclamation-triangle"></i> 
              ¿Qué deseas hacer con las habitaciones existentes?
            </p>
            <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 20px;">
              <button id="replaceLayout" class="btn btn-danger" style="width: 100%;">
                <i class="bi bi-arrow-repeat"></i> Reemplazar (eliminar anteriores y crear nuevas)
              </button>
              <button id="keepAndAddLayout" class="btn btn-primary" style="width: 100%;">
                <i class="bi bi-plus-circle"></i> Mantener anteriores y agregar nuevas
              </button>
              <button id="cancelLayoutChange" class="btn btn-secondary" style="width: 100%;">
                <i class="bi bi-x-circle"></i> Cancelar
              </button>
            </div>
          </div>
        `
        
        document.getElementById('replaceLayout').onclick = async () => {
          hideModal()
          if (layoutStatus) layoutStatus.textContent = 'Eliminando habitaciones anteriores...'
          
          // Primero eliminar del backend para asegurar sincronización
          if (navigator.onLine) {
            try {
              const backendRooms = await getRooms()
              for (const room of backendRooms) {
                if (room.id) {
                  try {
                    await deleteRoom(room.id)
                    console.log('Eliminada del backend:', room.number)
                  } catch (err) {
                    console.warn('No se pudo eliminar del backend:', room.number, err)
                  }
                }
              }
            } catch (err) {
              console.warn('Error al obtener habitaciones del backend:', err)
            }
          }
          
          // Luego eliminar de IndexedDB local
          const allRooms = await getAll('rooms').catch(() => [])
          for (const room of allRooms) {
            await del('rooms', room.id)
          }
          
          if (layoutStatus) layoutStatus.textContent = 'Creando nuevas habitaciones...'
          
          await saveLayoutSettings(floors, roomsPerFloor)
          const created = await ensureRoomsFromLayout(floors, roomsPerFloor)
          
          if (layoutStatus)
            layoutStatus.textContent = `Reemplazado: ${floors} pisos × ${roomsPerFloor} hab. (${created} habitaciones)`
          
          await renderAll()
        }
        
        document.getElementById('keepAndAddLayout').onclick = async () => {
          hideModal()
          if (layoutStatus) layoutStatus.textContent = 'Aplicando cambios...'
          
          await saveLayoutSettings(floors, roomsPerFloor)
          const created = await ensureRoomsFromLayout(floors, roomsPerFloor)
          
          if (layoutStatus)
            layoutStatus.textContent = `Actualizado: ${floors} pisos × ${roomsPerFloor} hab. (${created} nuevas)`
          
          await renderAll()
        }
        
        document.getElementById('cancelLayoutChange').onclick = () => {
          hideModal()
          // Restaurar valores anteriores en los inputs
          if (layoutFloorsInput) layoutFloorsInput.value = layoutSettings.floors
          if (layoutRoomsInput) layoutRoomsInput.value = layoutSettings.roomsPerFloor
        }
        
        return
      }
    }

    // Si no hay layout previo o no hay cambios, proceder normalmente con modal de confirmación
    const totalRooms = floors * roomsPerFloor
    const confirmModal = getModal()
    showModal()
    
    confirmModal.innerHTML = `
      <div class="modal-content">
        <h3>Confirmar generación de habitaciones</h3>
        <p>Se generarán <strong>${totalRooms} habitaciones</strong> (${floors} pisos × ${roomsPerFloor} habitaciones por piso).</p>
        <p style="color: #666; margin-top: 12px;">
          <i class="bi bi-info-circle"></i> 
          Las habitaciones duplicadas no se crearán nuevamente.
        </p>
        <div style="display: flex; gap: 10px; margin-top: 20px;">
          <button id="confirmGenerate" class="btn btn-primary" style="flex: 1;">
            <i class="bi bi-check-circle"></i> Sí, generar
          </button>
          <button id="cancelGenerate" class="btn btn-secondary" style="flex: 1;">
            <i class="bi bi-x-circle"></i> Cancelar
          </button>
        </div>
      </div>
    `
    
    document.getElementById('confirmGenerate').onclick = async () => {
      hideModal()
      if (layoutStatus) layoutStatus.textContent = 'Generando habitaciones...'
      
      await saveLayoutSettings(floors, roomsPerFloor)
      const created = await ensureRoomsFromLayout(floors, roomsPerFloor)
      
      if (layoutStatus)
        layoutStatus.textContent = `Guardado: ${floors} pisos × ${roomsPerFloor} hab. (${created} nuevas)`
      
      await renderAll()
    }
    
    document.getElementById('cancelGenerate').onclick = () => {
      hideModal()
    }
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
