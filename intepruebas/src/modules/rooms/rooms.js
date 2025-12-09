// =====================
// MÓDULO DE HABITACIONES
// =====================

import { getAll, put, del } from '../../idb.js'
import { ITEMS_PER_PAGE, ROOM_STATUS } from '../shared/constants.js'
import { getStatusKey, padRoom } from '../shared/utils.js'
import { confirmAction, showModal, hideModal, getModal } from '../shared/modal.js'
import { openRoomEditModal, openRoomAddModal } from './rooms-modal.js'
import { deleteRoom, createRoomAssignment, createRoom, getRooms } from '../../api.js'

let roomsPage = 0

/**
 * Renderiza la lista de habitaciones
 * @param {HTMLElement} roomsList
 * @param {Array} rooms
 * @param {Array} maids
 * @param {Array} filteredRooms - Habitaciones filtradas (opcional)
 */
export async function renderRooms(roomsList, rooms, maids, filteredRooms = null) {
  roomsList.innerHTML = ''
  
  // Usar habitaciones filtradas si se proporcionan, sino usar todas
  const roomsToDisplay = filteredRooms || rooms
  
  // Eliminar duplicados basado en room.id
  const uniqueRooms = Array.from(
    new Map(roomsToDisplay.map(r => [r.id, r])).values()
  )
  
  // Ordenar por número de habitación de forma natural
  const sortedRooms = uniqueRooms.sort((a, b) => {
    const numA = String(a.number || a.id)
    const numB = String(b.number || b.id)
    
    // Separar piso y número
    const matchA = numA.match(/(\\d+)-(\\d+)/)
    const matchB = numB.match(/(\\d+)-(\\d+)/)
    
    if (matchA && matchB) {
      const floorA = parseInt(matchA[1])
      const floorB = parseInt(matchB[1])
      if (floorA !== floorB) return floorA - floorB
      return parseInt(matchA[2]) - parseInt(matchB[2])
    }
    
    return numA.localeCompare(numB, undefined, { numeric: true })
  })
  
  const totalRooms = sortedRooms.length
  const roomsStart = roomsPage * ITEMS_PER_PAGE
  const roomsPageItems = sortedRooms.slice(roomsStart, roomsStart + ITEMS_PER_PAGE)

  for (const r of roomsPageItems) {
    const card = createRoomCard(r, maids)
    roomsList.appendChild(card)
  }

  // Crear paginador
  createRoomsPaginator(roomsList, totalRooms, roomsStart)
}

/**
 * Crea una tarjeta de habitación
 * @param {Object} room
 * @param {Array} maids
 * @returns {HTMLElement}
 */
function createRoomCard(room, maids) {
  const card = document.createElement('div')
  card.className = 'card room-card'

  const info = document.createElement('div')
  info.className = 'info'

  const key = getStatusKey(room.status)
  const badge = document.createElement('span')
  badge.className = `status-badge ${key}`
  badge.textContent = room.status || 'Limpia'

  const h3 = document.createElement('h3')
  h3.textContent = `Hab ${room.number || room.id}`

  info.appendChild(h3)
  info.appendChild(badge)

  // Mostrar quién limpió si está limpia
  if (room.cleanedBy && key === 'clean') {
    const cleanedByDiv = document.createElement('div')
    cleanedByDiv.className = 'cleaned-by'
    cleanedByDiv.style.color = '#2e8b57'
    cleanedByDiv.style.fontWeight = '500'
    cleanedByDiv.style.fontSize = '0.9em'
    cleanedByDiv.style.marginTop = '4px'
    cleanedByDiv.textContent = `Aseada por: ${room.cleanedBy}`
    info.appendChild(cleanedByDiv)
  }

  // Mostrar detalles si no está bloqueada
  if (key !== 'blocked') {
    const occ = document.createElement('div')
    occ.className = 'occ'
    occ.textContent = room.rented ? 'Ocupada' : 'Disponible'
    info.appendChild(occ)

    const assigned = createMaidSelector(room, maids)
    info.appendChild(assigned)
  }

  const actions = createRoomActions(room)
  card.appendChild(info)
  card.appendChild(actions)

  return card
}

/**
 * Crea el selector de camarera
 * @param {Object} room
 * @param {Array} maids
 * @returns {HTMLElement}
 */
function createMaidSelector(room, maids) {
  const assigned = document.createElement('div')
  assigned.className = 'assigned'
  const label = document.createElement('div')
  label.textContent = 'Camarera:'
  assigned.appendChild(label)

  const sel = document.createElement('select')
  sel.innerHTML = `<option value="">-- Sin asignar --</option>` + maids
    .map((m) => {
      const disabled = (m.status || '').toLowerCase().includes('no')
        ? 'disabled'
        : ''
      const selected = room.maid === (m.id || m.email) ? 'selected' : ''
      const labelText = `${m.name || ''} ${
        (m.status || '').toLowerCase().includes('no')
          ? '(No disponible)'
          : ''
      }`
      return `<option value="${
        m.id || m.email
      }" ${selected} ${disabled}>${labelText}</option>`
    })
    .join('')

  sel.addEventListener('change', async () => {
    const selected = sel.value
    if (!selected) {
      room.maid = null
      await put('rooms', room)
      location.reload()
      return
    }
    const chosen = maids.find((m) => (m.id || m.email) === selected)
    if (chosen && (chosen.status || '').toLowerCase().includes('no')) {
      alert('La camarera no está disponible')
      sel.value = room.maid || ''
      return
    }
    
    try {
      // Crear asignación en el backend si hay conexión
      if (navigator.onLine && (room.id || room.number) && selected) {
        await createRoomAssignment({
          room: { id: room.id || room.number },
          user: { id: parseInt(selected) }
        })
      }
      
      room.maid = selected
      await put('rooms', room)
      location.reload()
    } catch (error) {
      console.error('Error al asignar camarera:', error)
      alert('Error al asignar camarera: ' + error.message)
      sel.value = room.maid || ''
    }
  })

  assigned.appendChild(sel)
  return assigned
}

/**
 * Crea los botones de acción para una habitación
 * @param {Object} room
 * @returns {HTMLElement}
 */
function createRoomActions(room) {
  const actions = document.createElement('div')
  actions.className = 'actions'

  const btnEditRoom = document.createElement('button')
  btnEditRoom.className = 'btn btn-sm btn-primary'
  btnEditRoom.innerHTML = '<i class="bi bi-pencil" aria-hidden="true"></i>'
  btnEditRoom.title = 'Editar habitación'
  btnEditRoom.addEventListener('click', () => openRoomEditModal(room))
  actions.appendChild(btnEditRoom)

  // Botón eliminar habitación
  const btnDeleteRoom = document.createElement('button')
  btnDeleteRoom.className = 'btn btn-sm btn-danger'
  btnDeleteRoom.innerHTML = '<i class="bi bi-trash" aria-hidden="true"></i>'
  btnDeleteRoom.title = 'Eliminar habitación'
  btnDeleteRoom.addEventListener('click', async () => {
    const ok = await confirmAction(
      `¿Estás seguro de eliminar la habitación ${room.number || room.id}?`
    )
    if (!ok) return
    
    try {
      // Eliminar del backend si hay conexión
      if (navigator.onLine && room.id) {
        await deleteRoom(room.id)
      }
      
      // Eliminar de IndexedDB
      await del('rooms', room.id)
      location.reload()
    } catch (error) {
      console.error('Error al eliminar habitación:', error)
      alert('Error al eliminar habitación: ' + error.message)
    }
  })
  actions.appendChild(btnDeleteRoom)

  // Botón habilitar si está bloqueada
  if (getStatusKey(room.status) === 'blocked') {
    const btn = document.createElement('button')
    btn.className = 'btn btn-sm btn-success'
    btn.textContent = 'Habilitar'
    btn.title = 'Habilitar habitación (se marcará como Sucio)'
    btn.addEventListener('click', async () => {
      const ok = await confirmAction(
        `¿Habilitar la habitación ${room.number || room.id}? Se marcará como "Sucio".`
      )
      if (!ok) return
      room.status = ROOM_STATUS.DIRTY
      await put('rooms', room)
      location.reload()
    })
    actions.appendChild(btn)
  }

  return actions
}

/**
 * Crea el paginador de habitaciones
 * @param {HTMLElement} roomsList
 * @param {number} totalRooms
 * @param {number} roomsStart
 */
function createRoomsPaginator(roomsList, totalRooms, roomsStart) {
  const roomsPagerEl = document.getElementById('roomsPager')
  if (!roomsPagerEl) return

  roomsPagerEl.innerHTML = ''

  const prevRooms = document.createElement('button')
  prevRooms.textContent = '←'
  prevRooms.disabled = roomsPage === 0
  prevRooms.addEventListener('click', async () => {
    roomsPage = Math.max(0, roomsPage - 1)
    const rooms = (await getAll('rooms').catch(() => [])) || []
    const maids = (await getAll('maids').catch(() => [])) || []
    await renderRooms(roomsList, rooms, maids)
  })

  const nextRooms = document.createElement('button')
  nextRooms.textContent = '→'
  nextRooms.disabled = roomsStart + ITEMS_PER_PAGE >= totalRooms
  nextRooms.addEventListener('click', async () => {
    if (roomsStart + ITEMS_PER_PAGE < totalRooms) {
      roomsPage++
      const rooms = (await getAll('rooms').catch(() => [])) || []
      const maids = (await getAll('maids').catch(() => [])) || []
      await renderRooms(roomsList, rooms, maids)
    }
  })

  const infoRooms = document.createElement('span')
  infoRooms.textContent = `Página ${roomsPage + 1} / ${Math.max(
    1,
    Math.ceil(totalRooms / ITEMS_PER_PAGE)
  )}`

  roomsPagerEl.appendChild(prevRooms)
  roomsPagerEl.appendChild(infoRooms)
  roomsPagerEl.appendChild(nextRooms)
}

/**
 * Obtiene la página actual de habitaciones
 * @returns {number}
 */
export function getRoomsPage() {
  return roomsPage
}

/**
 * Establece la página de habitaciones
 * @param {number} page
 */
export function setRoomsPage(page) {
  roomsPage = page
}

/**
 * Carga la configuración de layout y asegura que existan las habitaciones
 * @param {number} floors
 * @param {number} roomsPerFloor
 * @returns {Promise<number>} Número de habitaciones creadas
 */
export async function ensureRoomsFromLayout(floors, roomsPerFloor) {
  let existingRooms = []
  if (navigator.onLine) {
    existingRooms = await getRooms().catch(() => [])
  } else {
    existingRooms = (await getAll('rooms').catch(() => [])) || []
  }

  const existingNumbers = new Set(
    existingRooms
      .map((r) => String(r.number || r.id))
      .filter(Boolean)
  )

  let created = 0

  for (let f = 1; f <= floors; f++) {
    for (let n = 1; n <= roomsPerFloor; n++) {
      const number = `${f}-${padRoom(n)}`
      if (existingNumbers.has(number)) continue

      let roomId = null
      if (navigator.onLine) {
        try {
          const resp = await createRoom({ number, status: 'disponible' })
          roomId = resp?.data?.id || null
        } catch (err) {
          console.warn('No se pudo crear en backend, se guardará solo local:', err)
        }
      }

      await put('rooms', {
        id: roomId || number,
        number,
        status: 'disponible',
        maid: null,
        rented: false,
      })

      existingNumbers.add(number)
      created++
    }
  }
  return created
}