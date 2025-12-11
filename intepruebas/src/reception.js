// =====================================================
// RECEPTION - ARCHIVO PRINCIPAL (NUEVA ESTRUCTURA)
// =====================================================

import { getAll, get, put, del } from './idb.js'
import { initModal, getModal, showModal, hideModal } from './modules/shared/modal.js'
import { padRoom } from './modules/shared/utils.js'
import { ensureRoomsFromLayout } from './modules/rooms/rooms.js'
import { openRoomAddModal, openRoomEditModal } from './modules/rooms/rooms-modal.js'
import { openMaidAddModal, openMaidEditModal } from './modules/maids/maids-modal.js'
import { showReportDetailModal } from './modules/reports/reports-modal.js'
import { getRooms, getUsers, getRoomAssignments, getReports, deleteRoom, deleteUser, updateRoomAssignment, createRoomAssignment, deleteRoomAssignment } from './api.js'

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
// ESTADO GLOBAL
// =====================
const state = {
  currentSection: 'rooms', // rooms, maids, reports
  allRooms: [],
  allMaids: [],
  allReports: [],
  allAssignments: [],
  currentFloor: 'all',
  layoutSettings: null,

  // Filtros
  searchTerm: '',
  statusFilter: '',
  maidFilter: '',
  maidStatusFilter: '',
  reportRoomFilter: '',
  reportMaidFilter: '',
  reportStatusFilter: '',
}

// =====================
// REFERENCIAS DOM
// =====================
const modal = document.getElementById('modal')

// Sidebar & Navigation
const sidebarItems = document.querySelectorAll('.sidebar-item[data-section]')
const mobileMenuItems = document.querySelectorAll('.mobile-menu-item[data-section]')
const hamburgerBtn = document.getElementById('hamburgerBtn')
const mobileMenu = document.getElementById('mobileMenu')
const logoutBtn = document.getElementById('logoutBtn')
const mobileLogoutBtn = document.getElementById('mobileLogoutBtn')

// Header
const sectionTitle = document.getElementById('sectionTitle')
const mobileTitle = document.getElementById('mobileTitle')
const btnCreate = document.getElementById('btnCreate')

// Sections
const sectionRooms = document.getElementById('section-rooms')
const sectionMaids = document.getElementById('section-maids')
const sectionReports = document.getElementById('section-reports')

// Rooms
const floorFilters = document.getElementById('floorFilters')
const searchRooms = document.getElementById('searchRooms')
const filterStatus = document.getElementById('filterStatus')
const filterMaid = document.getElementById('filterMaid')
const layoutFloors = document.getElementById('layoutFloors')
const layoutRooms = document.getElementById('layoutRooms')
const btnGenerateRooms = document.getElementById('btnGenerateRooms')
const layoutStatus = document.getElementById('layoutStatus')
const roomsTableBody = document.getElementById('roomsTableBody')
const roomsCards = document.getElementById('roomsCards')
const roomsPager = document.getElementById('roomsPager')

// Maids
const searchMaids = document.getElementById('searchMaids')
const filterMaidStatus = document.getElementById('filterMaidStatus')
const maidsTableBody = document.getElementById('maidsTableBody')
const maidsCards = document.getElementById('maidsCards')
const maidsPager = document.getElementById('maidsPager')

// Reports
const searchReports = document.getElementById('searchReports')
const filterReportRoom = document.getElementById('filterReportRoom')
const filterReportMaid = document.getElementById('filterReportMaid')
const filterReportStatus = document.getElementById('filterReportStatus')
const reportsTableBody = document.getElementById('reportsTableBody')
const reportsCards = document.getElementById('reportsCards')
const reportsPager = document.getElementById('reportsPager')

// Inicializar modal
initModal(modal)

// =====================
// HELPERS
// =====================

/**
 * Mapea el estado de la habitación a su texto y clase CSS
 * @param {string} status
 * @returns {{text: string, className: string}}
 */
function getRoomStatusDisplay(status) {
  const statusMap = {
    'disponible': { text: 'Limpia', className: 'disponible' },
    'ocupada': { text: 'Ocupada', className: 'ocupada' },
    'limpieza': { text: 'Sucia', className: 'limpieza' },
    'mantenimiento': { text: 'Bloqueada', className: 'mantenimiento' }
  }
  return statusMap[status] || { text: 'Limpia', className: 'disponible' }
}

// =====================
// SISTEMA DE NAVEGACIÓN
// =====================

/**
 * Cambia a una sección específica
 */
function switchSection(section) {
  state.currentSection = section

  // Update sidebar
  sidebarItems.forEach(item => {
    if (item.dataset.section === section) {
      item.classList.add('active')
    } else {
      item.classList.remove('active')
    }
  })

  // Update mobile menu
  mobileMenuItems.forEach(item => {
    if (item.dataset.section === section) {
      item.classList.add('active')
    } else {
      item.classList.remove('active')
    }
  })

  // Hide all sections
  sectionRooms.classList.remove('active')
  sectionMaids.classList.remove('active')
  sectionReports.classList.remove('active')

  // Show current section
  if (section === 'rooms') {
    sectionRooms.classList.add('active')
    updateSectionTitle('Habitaciones')
    updateCreateButton('Nueva Habitación', 'bi-plus-circle', () => openRoomAddModal())
    renderRooms()
  } else if (section === 'maids') {
    sectionMaids.classList.add('active')
    updateSectionTitle('Camareras')
    updateCreateButton('Nueva Camarera', 'bi-person-plus', () => openMaidAddModal())
    renderMaids()
  } else if (section === 'reports') {
    sectionReports.classList.add('active')
    updateSectionTitle('Reportes')
    btnCreate.style.display = 'none' // No crear reportes desde recepción
    renderReports()
  }
}

/**
 * Actualiza el título de la sección
 */
function updateSectionTitle(title) {
  sectionTitle.textContent = title
  mobileTitle.textContent = title
}

/**
 * Actualiza el botón de crear
 */
function updateCreateButton(text, icon, callback) {
  const btn = document.getElementById('btnCreate')
  if (!btn) return

  btn.innerHTML = `<i class="bi ${icon}"></i><span>${text}</span>`
  btn.style.display = 'flex'

  // Remove old listeners by cloning
  const newBtn = btn.cloneNode(true)
  btn.parentNode.replaceChild(newBtn, btn)

  // Add new listener to the new button
  newBtn.addEventListener('click', callback)
}

// Event listeners para navegación
sidebarItems.forEach(item => {
  item.addEventListener('click', () => {
    switchSection(item.dataset.section)
  })
})

mobileMenuItems.forEach(item => {
  item.addEventListener('click', () => {
    switchSection(item.dataset.section)
    mobileMenu.classList.remove('open')
  })
})

// Toggle mobile menu
if (hamburgerBtn) {
  hamburgerBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open')
  })
}

// Logout
const handleLogout = () => {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    localStorage.clear()
    window.location.href = './index.html'
  }
}

if (logoutBtn) logoutBtn.addEventListener('click', handleLogout)
if (mobileLogoutBtn) mobileLogoutBtn.addEventListener('click', handleLogout)

// =====================
// SINCRONIZACIÓN DE DATOS
// =====================

/**
 * Limpia habitaciones duplicadas
 */
async function cleanDuplicateRooms() {
  try {
    const allRooms = await getAll('rooms').catch(() => []) || []
    const roomsByNumber = new Map()

    for (const room of allRooms) {
      const number = room.number || room.id
      if (!roomsByNumber.has(number)) {
        roomsByNumber.set(number, [])
      }
      roomsByNumber.get(number).push(room)
    }

    let duplicatesRemoved = 0
    for (const [number, roomGroup] of roomsByNumber.entries()) {
      if (roomGroup.length > 1) {
        roomGroup.sort((a, b) => {
          const aIsNumeric = typeof a.id === 'number'
          const bIsNumeric = typeof b.id === 'number'
          if (aIsNumeric && !bIsNumeric) return -1
          if (!aIsNumeric && bIsNumeric) return 1
          return 0
        })

        const toKeep = roomGroup[0]
        for (let i = 1; i < roomGroup.length; i++) {
          await del('rooms', roomGroup[i].id)
          duplicatesRemoved++
        }
      }
    }

    if (duplicatesRemoved > 0) {
      console.log(`${duplicatesRemoved} habitaciones duplicadas eliminadas`)
    }
  } catch (error) {
    console.error('Error al limpiar duplicados:', error)
  }
}

/**
 * Limpia camareras duplicadas
 */
async function cleanDuplicateMaids() {
  try {
    const allMaids = await getAll('maids').catch(() => [])
    const maidsById = new Map()

    for (const maid of allMaids) {
      const key = maid.id || maid.email
      if (!maidsById.has(key)) {
        maidsById.set(key, [])
      }
      maidsById.get(key).push(maid)
    }

    let duplicatesRemoved = 0
    for (const [key, maidGroup] of maidsById.entries()) {
      if (maidGroup.length > 1) {
        maidGroup.sort((a, b) => {
          const aIsNumeric = typeof a.id === 'number'
          const bIsNumeric = typeof b.id === 'number'
          if (aIsNumeric && !bIsNumeric) return -1
          if (!aIsNumeric && bIsNumeric) return 1
          return 0
        })

        const toKeep = maidGroup[0]
        for (let i = 1; i < maidGroup.length; i++) {
          await del('maids', maidGroup[i].id || maidGroup[i].email)
          duplicatesRemoved++
        }
      }
    }

    if (duplicatesRemoved > 0) {
      console.log(`${duplicatesRemoved} camareras duplicadas eliminadas`)
    }
  } catch (error) {
    console.error('Error al limpiar camareras duplicadas:', error)
  }
}

/**
 * Sincroniza datos desde el backend
 */
async function syncDataFromBackend() {
  if (!navigator.onLine) {
    console.log('Sin conexión - usando datos locales')
    return
  }

  try {
    // Sincronizar habitaciones
    const rooms = await getRooms()
    const localRooms = await getAll('rooms').catch(() => []) || []
    const localRoomsMap = new Map(localRooms.map(r => [r.number || r.id, r]))

    for (const room of rooms) {
      const existingLocal = localRoomsMap.get(room.number)

      await put('rooms', {
        id: room.id,
        number: room.number,
        status: room.status,
        maid: existingLocal?.maid || null,
        rented: existingLocal?.rented || false,
      })
    }

    await cleanDuplicateRooms()

    // Sincronizar usuarios (camareras)
    const users = await getUsers()
    const maids = users.filter(u => u.rol?.id === 2)

    const uniqueMaids = new Map()
    for (const maid of maids) {
      if (!uniqueMaids.has(maid.id)) {
        uniqueMaids.set(maid.id, {
          id: maid.id,
          name: maid.fullname,
          email: maid.username,
          active: maid.active,
        })
      }
    }

    for (const maid of uniqueMaids.values()) {
      await put('maids', maid)
    }

    await cleanDuplicateMaids()

    // Sincronizar asignaciones
    const assignments = await getRoomAssignments()
    state.allAssignments = assignments

    for (const assignment of assignments) {
      if (assignment.room && assignment.user) {
        const room = await get('rooms', assignment.room.id)
        if (room) {
          room.maid = assignment.user.id
          await put('rooms', room)
        }
      }
    }

    // Sincronizar reportes
    const reports = await getReports()
    for (const report of reports) {
      await put('reports', {
        _id: `report_${report.id}`,
        id: report.id,
        title: report.title,
        description: report.description,
        photo1: report.photo1,
        photo2: report.photo2,
        photo3: report.photo3,
        room: report.room,
        user: report.user,
        status: 'Pendiente',
        createdAt: new Date().toISOString(),
        _synced: true
      })
    }

    console.log('Datos sincronizados correctamente')
  } catch (error) {
    console.error('Error al sincronizar datos:', error)
  }
}

/**
 * Carga todos los datos
 */
async function loadAllData() {
  try {
    await cleanDuplicateRooms()
    await cleanDuplicateMaids()

    let rooms = (await getAll('rooms').catch(() => [])) || []
    let maids = (await getAll('maids').catch(() => [])) || []
    let reports = (await getAll('reports').catch(() => [])) || []

    if (navigator.onLine) {
      await syncDataFromBackend()

      rooms = (await getAll('rooms').catch(() => [])) || []
      maids = (await getAll('maids').catch(() => [])) || []
      reports = (await getAll('reports').catch(() => [])) || []
    }

    state.allRooms = rooms
    state.allMaids = maids
    state.allReports = reports

    console.log('Datos cargados:', { rooms: rooms.length, maids: maids.length, reports: reports.length })
  } catch (error) {
    console.error('Error al cargar datos:', error)
  }
}

// =====================
// FLOOR FILTERS
// =====================

/**
 * Extrae el número de piso de una habitación
 */
function extractFloor(roomNumber) {
  if (!roomNumber) return null
  const match = String(roomNumber).match(/^(\d+)-/)
  return match ? parseInt(match[1], 10) : null
}

/**
 * Obtiene pisos únicos
 */
function getUniqueFloors() {
  const floors = new Set()
  state.allRooms.forEach(room => {
    const floor = extractFloor(room.number)
    if (floor !== null) {
      floors.add(floor)
    }
  })
  return Array.from(floors).sort((a, b) => a - b)
}

/**
 * Renderiza floor filters
 */
function renderFloorFilters() {
  const floors = getUniqueFloors()
  const othersCount = state.allRooms.filter(r => extractFloor(r.number) === null).length

  let html = '<button class="floor-btn active" data-floor="all">Todos</button>'

  floors.forEach(floor => {
    html += `<button class="floor-btn" data-floor="${floor}">Piso ${floor}</button>`
  })

  if (othersCount > 0) {
    html += '<button class="floor-btn" data-floor="others">Otros</button>'
  }

  floorFilters.innerHTML = html

  // Event listeners
  floorFilters.querySelectorAll('.floor-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.currentFloor = btn.dataset.floor

      floorFilters.querySelectorAll('.floor-btn').forEach(b => b.classList.remove('active'))
      btn.classList.add('active')

      renderRooms()
    })
  })
}

// =====================
// RENDERIZADO DE HABITACIONES
// =====================

/**
 * Filtra habitaciones
 */
function filterRooms() {
  let filtered = state.allRooms

  // Floor filter
  if (state.currentFloor !== 'all') {
    if (state.currentFloor === 'others') {
      filtered = filtered.filter(r => extractFloor(r.number) === null)
    } else {
      const floor = parseInt(state.currentFloor, 10)
      filtered = filtered.filter(r => extractFloor(r.number) === floor)
    }
  }

  // Search
  if (state.searchTerm) {
    const term = state.searchTerm.toLowerCase()
    filtered = filtered.filter(r => {
      const number = (r.number || r.id || '').toString().toLowerCase()
      const status = (r.status || '').toLowerCase()
      return number.includes(term) || status.includes(term)
    })
  }

  // Status filter
  if (state.statusFilter) {
    filtered = filtered.filter(r => r.status === state.statusFilter)
  }

  // Maid filter
  if (state.maidFilter) {
    const maidId = parseInt(state.maidFilter, 10)
    filtered = filtered.filter(r => r.maid === maidId)
  }

  return filtered
}

/**
 * Renderiza habitaciones (tabla + cards)
 */
async function renderRooms() {
  renderFloorFilters()
  populateMaidFilter()

  const filtered = filterRooms()

  // Render table (desktop)
  roomsTableBody.innerHTML = ''
  filtered.forEach(room => {
    const statusDisplay = getRoomStatusDisplay(room.status)
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td><strong>${room.number || room.id}</strong></td>
      <td><span class="status-badge ${statusDisplay.className}">${statusDisplay.text}</span></td>
      <td>
        <select class="maid-select" data-room-id="${room.id}">
          <option value="">Sin asignar</option>
          ${state.allMaids.map(m => `
            <option value="${m.id}" ${room.maid === m.id ? 'selected' : ''}>
              ${m.name || m.email}
            </option>
          `).join('')}
        </select>
      </td>
      <td>
        <div class="action-btns">
          <button class="action-btn btn-edit" data-room-id="${room.id}" title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="action-btn btn-delete" data-room-id="${room.id}" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    `

    roomsTableBody.appendChild(tr)
  })

  // Render cards (mobile)
  roomsCards.innerHTML = ''
  filtered.forEach(room => {
    const statusDisplay = getRoomStatusDisplay(room.status)
    const card = document.createElement('div')
    card.className = 'data-card'
    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">${room.number || room.id}</div>
        <button class="card-menu-btn" data-room-id="${room.id}">
          <i class="bi bi-three-dots-vertical"></i>
        </button>
      </div>
      <div class="card-body">
        <div class="card-icon">
          <i class="bi bi-door-closed"></i>
        </div>
        <div class="card-info">
          <div class="card-info-row">
            <span class="card-label">Estado</span>
            <span class="status-badge ${statusDisplay.className}">${statusDisplay.text}</span>
          </div>
          <div class="card-info-row">
            <span class="card-label">Camarera Asignada</span>
            <select class="maid-select" data-room-id="${room.id}">
              <option value="">Sin asignar</option>
              ${state.allMaids.map(m => `
                <option value="${m.id}" ${room.maid === m.id ? 'selected' : ''}>
                  ${m.name || m.email}
                </option>
              `).join('')}
            </select>
          </div>
        </div>
      </div>
    `

    roomsCards.appendChild(card)
  })

  // Event listeners para select de camarera
  document.querySelectorAll('.maid-select').forEach(select => {
    select.addEventListener('change', async (e) => {
      const roomId = parseInt(e.target.dataset.roomId, 10)
      const maidId = e.target.value ? parseInt(e.target.value, 10) : null
      await assignMaidToRoom(roomId, maidId)
    })
  })

  // Event listeners para botones de acción (tabla)
  document.querySelectorAll('.action-btn.btn-edit').forEach(btn => {
    btn.addEventListener('click', () => {
      const roomId = parseInt(btn.dataset.roomId, 10)
      const room = state.allRooms.find(r => r.id === roomId)
      if (room) openRoomEditModal(room)
    })
  })

  document.querySelectorAll('.action-btn.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const roomId = parseInt(btn.dataset.roomId, 10)
      if (confirm('¿Estás seguro de eliminar esta habitación?')) {
        await deleteRoomById(roomId)
      }
    })
  })

  // Event listeners para menú de cards (mobile)
  document.querySelectorAll('.card-menu-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const roomId = parseInt(btn.dataset.roomId, 10)
      const room = state.allRooms.find(r => r.id === roomId)
      if (room) showRoomCardMenu(room, btn)
    })
  })
}

/**
 * Popula el filtro de camareras
 */
function populateMaidFilter() {
  if (!filterMaid) return

  filterMaid.innerHTML = '<option value="">Camarera</option>'
  state.allMaids.forEach(maid => {
    filterMaid.innerHTML += `<option value="${maid.id}">${maid.name || maid.email}</option>`
  })
}

/**
 * Asigna camarera a habitación
 */
async function assignMaidToRoom(roomId, maidId) {
  try {
    const room = state.allRooms.find(r => r.id === roomId)
    if (!room) return

    room.maid = maidId
    await put('rooms', room)

    // Actualizar en backend si hay conexión
    if (navigator.onLine) {
      // Buscar si ya existe una asignación
      const existingAssignment = state.allAssignments.find(a => a.room?.id === roomId)

      if (maidId) {
        if (existingAssignment) {
          // Actualizar asignación existente
          await updateRoomAssignment(existingAssignment.id, { userId: maidId, roomId })
        } else {
          // Crear nueva asignación
          await createRoomAssignment({ userId: maidId, roomId })
        }
      } else {
        // Eliminar asignación si existe
        if (existingAssignment) {
          await deleteRoomAssignment(existingAssignment.id)
        }
      }

      await syncDataFromBackend()
      await loadAllData()
    }

    renderRooms()
  } catch (error) {
    console.error('Error al asignar camarera:', error)
    alert('No se pudo asignar la camarera')
  }
}

/**
 * Elimina una habitación
 */
async function deleteRoomById(roomId) {
  try {
    await del('rooms', roomId)

    if (navigator.onLine) {
      await deleteRoom(roomId)
    }

    state.allRooms = state.allRooms.filter(r => r.id !== roomId)
    renderRooms()
  } catch (error) {
    console.error('Error al eliminar habitación:', error)
    alert('No se pudo eliminar la habitación')
  }
}

/**
 * Muestra menú de opciones para card (mobile)
 */
function showRoomCardMenu(room, btnElement) {
  const rect = btnElement.getBoundingClientRect()

  const menu = document.createElement('div')
  menu.style.position = 'fixed'
  menu.style.top = `${rect.bottom + 5}px`
  menu.style.right = '20px'
  menu.style.background = 'white'
  menu.style.borderRadius = '12px'
  menu.style.boxShadow = 'var(--shadow-lg)'
  menu.style.zIndex = '1000'
  menu.style.minWidth = '150px'
  menu.innerHTML = `
    <button style="display:flex;align-items:center;gap:8px;width:100%;padding:12px 16px;border:none;background:transparent;cursor:pointer;font-size:15px;font-weight:600;" id="menuEdit">
      <i class="bi bi-pencil" style="color:var(--color-info);"></i> Editar
    </button>
    <button style="display:flex;align-items:center;gap:8px;width:100%;padding:12px 16px;border:none;background:transparent;cursor:pointer;font-size:15px;font-weight:600;" id="menuDelete">
      <i class="bi bi-trash" style="color:var(--color-danger);"></i> Eliminar
    </button>
  `

  document.body.appendChild(menu)

  const cleanup = () => menu.remove()

  document.getElementById('menuEdit').onclick = () => {
    cleanup()
    openRoomEditModal(room)
  }

  document.getElementById('menuDelete').onclick = async () => {
    cleanup()
    if (confirm('¿Estás seguro de eliminar esta habitación?')) {
      await deleteRoomById(room.id)
    }
  }

  setTimeout(() => {
    document.addEventListener('click', cleanup, { once: true })
  }, 100)
}

// Event listeners para filtros de habitaciones
if (searchRooms) {
  searchRooms.addEventListener('input', (e) => {
    state.searchTerm = e.target.value
    renderRooms()
  })
}

if (filterStatus) {
  filterStatus.addEventListener('change', (e) => {
    state.statusFilter = e.target.value
    renderRooms()
  })
}

if (filterMaid) {
  filterMaid.addEventListener('change', (e) => {
    state.maidFilter = e.target.value
    renderRooms()
  })
}

// =====================
// LAYOUT GENERATOR
// =====================

/**
 * Carga configuración de layout
 */
async function loadLayoutSettings() {
  try {
    const stored = await get('settings', 'hotelLayout')
    if (stored) {
      state.layoutSettings = stored
      if (layoutFloors) layoutFloors.value = stored.floors
      if (layoutRooms) layoutRooms.value = stored.roomsPerFloor
      if (layoutStatus) {
        layoutStatus.textContent = `${stored.floors} pisos × ${stored.roomsPerFloor} hab.`
      }
    }
  } catch (e) {
    console.warn('No se pudo cargar layout', e)
  }
}

/**
 * Guarda configuración de layout
 */
async function saveLayoutSettings(floors, roomsPerFloor) {
  state.layoutSettings = {
    key: 'hotelLayout',
    floors,
    roomsPerFloor,
    updatedAt: new Date().toISOString(),
  }
  await put('settings', state.layoutSettings)
}

// Event listener para generar habitaciones
if (btnGenerateRooms) {
  btnGenerateRooms.addEventListener('click', async () => {
    const floors = parseInt(layoutFloors?.value || '0', 10)
    const roomsPerFloor = parseInt(layoutRooms?.value || '0', 10)

    if (!floors || floors < 1) return alert('Ingresa el número de pisos')
    if (!roomsPerFloor || roomsPerFloor < 1) return alert('Ingresa habitaciones por piso')

    const confirmGenerate = confirm(`¿Generar ${floors * roomsPerFloor} habitaciones (${floors} pisos × ${roomsPerFloor})?`)

    if (confirmGenerate) {
      if (layoutStatus) layoutStatus.textContent = 'Generando...'

      await saveLayoutSettings(floors, roomsPerFloor)
      const created = await ensureRoomsFromLayout(floors, roomsPerFloor)

      if (layoutStatus) {
        layoutStatus.textContent = `${floors} pisos × ${roomsPerFloor} hab. (${created} nuevas)`
      }

      await loadAllData()
      renderRooms()
    }
  })
}

// =====================
// RENDERIZADO DE CAMARERAS
// =====================

/**
 * Filtra camareras
 */
function filterMaids() {
  let filtered = state.allMaids

  // Search
  if (state.searchTerm) {
    const term = state.searchTerm.toLowerCase()
    filtered = filtered.filter(m => {
      const name = (m.name || '').toLowerCase()
      const email = (m.email || '').toLowerCase()
      return name.includes(term) || email.includes(term)
    })
  }

  // Status filter
  if (state.maidStatusFilter) {
    filtered = filtered.filter(m => {
      const active = m.active !== false
      if (state.maidStatusFilter === 'disponible') return active
      if (state.maidStatusFilter === 'no disponible') return !active
      return true
    })
  }

  return filtered
}

/**
 * Renderiza camareras
 */
function renderMaids() {
  const filtered = filterMaids()

  // Render table (desktop)
  maidsTableBody.innerHTML = ''
  filtered.forEach(maid => {
    const tr = document.createElement('tr')
    const status = maid.active !== false ? 'Disponible' : 'No Disponible'
    const statusClass = maid.active !== false ? 'disponible' : 'mantenimiento'

    tr.innerHTML = `
      <td><strong>${maid.name || maid.email}</strong></td>
      <td>${maid.email || ''}</td>
      <td><span class="status-badge ${statusClass}">${status}</span></td>
      <td>
        <div class="action-btns">
          <button class="action-btn btn-edit" data-maid-id="${maid.id}" title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="action-btn btn-delete" data-maid-id="${maid.id}" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </td>
    `

    maidsTableBody.appendChild(tr)
  })

  // Render cards (mobile)
  maidsCards.innerHTML = ''
  filtered.forEach(maid => {
    const status = maid.active !== false ? 'Disponible' : 'No Disponible'
    const statusClass = maid.active !== false ? 'disponible' : 'mantenimiento'

    const card = document.createElement('div')
    card.className = 'data-card'
    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">${maid.name || maid.email}</div>
        <button class="card-menu-btn" data-maid-id="${maid.id}">
          <i class="bi bi-three-dots-vertical"></i>
        </button>
      </div>
      <div class="card-body">
        <div class="card-icon">
          <i class="bi bi-person"></i>
        </div>
        <div class="card-info">
          <div class="card-info-row">
            <span class="card-label">Email</span>
            <span class="card-value">${maid.email || ''}</span>
          </div>
          <div class="card-info-row">
            <span class="card-label">Estado</span>
            <span class="status-badge ${statusClass}">${status}</span>
          </div>
        </div>
      </div>
    `

    maidsCards.appendChild(card)
  })

  // Event listeners para editar (tabla)
  document.querySelectorAll('.action-btn.btn-edit[data-maid-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const maidId = parseInt(btn.dataset.maidId, 10)
      const maid = state.allMaids.find(m => m.id === maidId)
      if (maid) openMaidEditModal(maid)
    })
  })

  // Event listeners para eliminar (tabla)
  document.querySelectorAll('.action-btn.btn-delete[data-maid-id]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const maidId = parseInt(btn.dataset.maidId, 10)
      const maid = state.allMaids.find(m => m.id === maidId)
      if (maid && confirm(`¿Estás seguro de que deseas eliminar a ${maid.name || maid.email}?`)) {
        await deleteMaidById(maidId)
      }
    })
  })

  // Event listeners para menú (mobile)
  document.querySelectorAll('.card-menu-btn[data-maid-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const maidId = parseInt(btn.dataset.maidId, 10)
      const maid = state.allMaids.find(m => m.id === maidId)
      if (maid) showMaidCardMenu(maid, btn)
    })
  })
}

/**
 * Elimina una camarera
 */
async function deleteMaidById(maidId) {
  try {
    await del('maids', maidId)

    if (navigator.onLine) {
      await deleteUser(maidId)
    }

    state.allMaids = state.allMaids.filter(m => m.id !== maidId)
    renderMaids()
    alert('Camarera eliminada exitosamente')
  } catch (error) {
    console.error('Error al eliminar camarera:', error)
    alert('No se pudo eliminar la camarera')
  }
}

/**
 * Muestra menú de opciones para camarera (mobile)
 */
function showMaidCardMenu(maid, btnElement) {
  const rect = btnElement.getBoundingClientRect()

  const menu = document.createElement('div')
  menu.style.position = 'fixed'
  menu.style.top = `${rect.bottom + 5}px`
  menu.style.right = '20px'
  menu.style.background = 'white'
  menu.style.borderRadius = '12px'
  menu.style.boxShadow = 'var(--shadow-lg)'
  menu.style.zIndex = '1000'
  menu.style.minWidth = '150px'
  menu.innerHTML = `
    <button style="display:flex;align-items:center;gap:8px;width:100%;padding:12px 16px;border:none;background:transparent;cursor:pointer;font-size:15px;font-weight:600;" id="menuEdit">
      <i class="bi bi-pencil" style="color:var(--color-info);"></i> Editar
    </button>
    <button style="display:flex;align-items:center;gap:8px;width:100%;padding:12px 16px;border:none;background:transparent;cursor:pointer;font-size:15px;font-weight:600;" id="menuDelete">
      <i class="bi bi-trash" style="color:var(--color-danger);"></i> Eliminar
    </button>
  `

  document.body.appendChild(menu)

  const cleanup = () => menu.remove()

  document.getElementById('menuEdit').onclick = () => {
    cleanup()
    openMaidEditModal(maid)
  }

  document.getElementById('menuDelete').onclick = async () => {
    cleanup()
    if (confirm(`¿Estás seguro de que deseas eliminar a ${maid.name || maid.email}?`)) {
      await deleteMaidById(maid.id)
    }
  }

  setTimeout(() => {
    document.addEventListener('click', cleanup, { once: true })
  }, 100)
}

// Event listeners para filtros de camareras
if (searchMaids) {
  searchMaids.addEventListener('input', (e) => {
    state.searchTerm = e.target.value
    renderMaids()
  })
}

if (filterMaidStatus) {
  filterMaidStatus.addEventListener('change', (e) => {
    state.maidStatusFilter = e.target.value
    renderMaids()
  })
}

// =====================
// RENDERIZADO DE REPORTES
// =====================

/**
 * Filtra reportes
 */
function filterReports() {
  let filtered = state.allReports

  // Search
  if (state.searchTerm) {
    const term = state.searchTerm.toLowerCase()
    filtered = filtered.filter(r => {
      const title = (r.title || r.subject || '').toLowerCase()
      const roomNumber = (r.room?.number || '').toString().toLowerCase()
      return title.includes(term) || roomNumber.includes(term)
    })
  }

  // Room filter
  if (state.reportRoomFilter) {
    filtered = filtered.filter(r => (r.room?.id || r.room_id) == state.reportRoomFilter)
  }

  // Maid filter
  if (state.reportMaidFilter) {
    filtered = filtered.filter(r => (r.user?.id || r.user_id) == state.reportMaidFilter)
  }

  // Status filter
  if (state.reportStatusFilter) {
    filtered = filtered.filter(r => r.status === state.reportStatusFilter)
  }

  return filtered
}

/**
 * Renderiza reportes
 */
function renderReports() {
  populateReportFilters()

  const filtered = filterReports()

  // Render table (desktop)
  reportsTableBody.innerHTML = ''
  filtered.forEach(report => {
    const tr = document.createElement('tr')
    const date = report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '—'
    const roomNumber = report.room?.number || report.roomId || report.room_id || '—'
    const maidName = report.user?.fullname || report.user?.username || '—'
    const title = report.title || report.subject || '—'
    const status = report.status || 'Pendiente'

    tr.innerHTML = `
      <td>${date}</td>
      <td><strong>${roomNumber}</strong></td>
      <td>${maidName}</td>
      <td>${title}</td>
      <td>
        <select class="report-status-select" data-report-id="${report._id || report.id}">
          <option value="Pendiente" ${status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
          <option value="Resuelto" ${status === 'Resuelto' || status === 'Habilitado' ? 'selected' : ''}>Resuelto</option>
        </select>
      </td>
      <td>
        <div class="action-btns">
          <button class="action-btn btn-view" data-report-id="${report._id}" title="Ver más">
            <i class="bi bi-eye"></i>
          </button>
        </div>
      </td>
    `

    reportsTableBody.appendChild(tr)
  })

  // Render cards (mobile)
  reportsCards.innerHTML = ''
  filtered.forEach(report => {
    const date = report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '—'
    const roomNumber = report.room?.number || report.roomId || report.room_id || '—'
    const maidName = report.user?.fullname || report.user?.username || '—'
    const title = report.title || report.subject || '—'
    const status = report.status || 'Pendiente'

    const card = document.createElement('div')
    card.className = 'data-card'
    card.innerHTML = `
      <div class="card-header">
        <div class="card-title">${title}</div>
        <button class="card-menu-btn" data-report-id="${report._id}">
          <i class="bi bi-eye"></i>
        </button>
      </div>
      <div class="card-body">
        <div class="card-icon">
          <i class="bi bi-file-earmark-text"></i>
        </div>
        <div class="card-info">
          <div class="card-info-row">
            <span class="card-label">Fecha</span>
            <span class="card-value">${date}</span>
          </div>
          <div class="card-info-row">
            <span class="card-label">Habitación</span>
            <span class="card-value">${roomNumber}</span>
          </div>
          <div class="card-info-row">
            <span class="card-label">Camarera</span>
            <span class="card-value">${maidName}</span>
          </div>
          <div class="card-info-row">
            <span class="card-label">Estado</span>
            <select class="report-status-select" data-report-id="${report._id || report.id}">
              <option value="Pendiente" ${status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
              <option value="Resuelto" ${status === 'Resuelto' || status === 'Habilitado' ? 'selected' : ''}>Resuelto</option>
            </select>
          </div>
        </div>
      </div>
    `

    reportsCards.appendChild(card)
  })

  // Event listeners para ver más (tabla)
  document.querySelectorAll('.action-btn.btn-view').forEach(btn => {
    btn.addEventListener('click', () => {
      const reportId = btn.dataset.reportId
      const report = state.allReports.find(r => r._id === reportId)
      if (report) showReportDetailModal(report, state.allMaids)
    })
  })

  // Event listeners para ver más (mobile)
  document.querySelectorAll('.card-menu-btn[data-report-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const reportId = btn.dataset.reportId
      const report = state.allReports.find(r => r._id === reportId)
      if (report) showReportDetailModal(report, state.allMaids)
    })
  })

  // Event listeners para cambiar estado de reporte
  document.querySelectorAll('.report-status-select').forEach(select => {
    select.addEventListener('change', async (e) => {
      const reportId = select.dataset.reportId
      const newStatus = e.target.value
      await updateReportStatus(reportId, newStatus)
    })
  })
}

/**
 * Actualiza el estado de un reporte
 */
async function updateReportStatus(reportId, newStatus) {
  try {
    const report = state.allReports.find(r => (r._id || r.id) === reportId)
    if (!report) {
      console.error('Reporte no encontrado:', reportId)
      return
    }

    // Actualizar en el estado local
    report.status = newStatus

    // Actualizar en IndexedDB
    await put('reports', report)

    console.log(`Estado del reporte ${reportId} actualizado a ${newStatus}`)
  } catch (error) {
    console.error('Error al actualizar estado del reporte:', error)
    alert('No se pudo actualizar el estado del reporte')
  }
}

/**
 * Popula los filtros de reportes
 */
function populateReportFilters() {
  // Room filter
  if (filterReportRoom) {
    filterReportRoom.innerHTML = '<option value="">Habitación</option>'
    const uniqueRooms = new Set()
    state.allReports.forEach(r => {
      const roomId = r.room?.id || r.room_id
      const roomNumber = r.room?.number || r.roomId
      if (roomId && roomNumber && !uniqueRooms.has(roomId)) {
        uniqueRooms.add(roomId)
        filterReportRoom.innerHTML += `<option value="${roomId}">${roomNumber}</option>`
      }
    })
  }

  // Maid filter
  if (filterReportMaid) {
    filterReportMaid.innerHTML = '<option value="">Camarera</option>'
    const uniqueMaids = new Set()
    state.allReports.forEach(r => {
      const userId = r.user?.id || r.user_id
      const userName = r.user?.fullname || r.user?.username
      if (userId && userName && !uniqueMaids.has(userId)) {
        uniqueMaids.add(userId)
        filterReportMaid.innerHTML += `<option value="${userId}">${userName}</option>`
      }
    })
  }
}

// Event listeners para filtros de reportes
if (searchReports) {
  searchReports.addEventListener('input', (e) => {
    state.searchTerm = e.target.value
    renderReports()
  })
}

if (filterReportRoom) {
  filterReportRoom.addEventListener('change', (e) => {
    state.reportRoomFilter = e.target.value
    renderReports()
  })
}

if (filterReportMaid) {
  filterReportMaid.addEventListener('change', (e) => {
    state.reportMaidFilter = e.target.value
    renderReports()
  })
}

if (filterReportStatus) {
  filterReportStatus.addEventListener('change', (e) => {
    state.reportStatusFilter = e.target.value
    renderReports()
  })
}

// =====================
// INICIALIZACIÓN
// =====================

;(async () => {
  try {
    // Verificar autenticación
    const authToken = localStorage.getItem('authToken')
    if (!authToken) {
      console.warn('No hay token de autenticación')
      alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
      window.location.href = './index.html'
      return
    }

    // Cargar configuración y datos
    await loadLayoutSettings()
    await syncDataFromBackend()

    // Generar habitaciones según layout
    if (state.layoutSettings?.floors && state.layoutSettings?.roomsPerFloor) {
      await ensureRoomsFromLayout(state.layoutSettings.floors, state.layoutSettings.roomsPerFloor)
    }

    await loadAllData()

    // Mostrar sección inicial
    switchSection('rooms')

    console.log('Aplicación inicializada correctamente')
  } catch (error) {
    console.error('Error al inicializar:', error)

    if (error.message && error.message.includes('403')) {
      alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
      window.location.href = './index.html'
      return
    }

    await loadAllData()
    switchSection('rooms')
  }
})()

// Recargar al cerrar modales para actualizar datos
window.addEventListener('modal-closed', async () => {
  await loadAllData()

  if (state.currentSection === 'rooms') renderRooms()
  else if (state.currentSection === 'maids') renderMaids()
  else if (state.currentSection === 'reports') renderReports()
})
