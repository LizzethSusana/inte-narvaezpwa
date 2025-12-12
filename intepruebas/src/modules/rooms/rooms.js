// =====================
// MÓDULO DE HABITACIONES
// =====================

import { getAll, put, del, get } from '../../idb.js'
import { ITEMS_PER_PAGE, ROOM_STATUS, roomStatusToAPI, roomStatusFromAPI } from '../shared/constants.js'
import { getStatusKey, padRoom } from '../shared/utils.js'
import { confirmAction, showModal, hideModal, getModal } from '../shared/modal.js'
import { openRoomEditModal, openRoomAddModal } from './rooms-modal.js'
import { deleteRoom, createRoomAssignment, createRoom, getRooms, createRoomsBatch, updateRoom } from '../../api.js'
import { getCurrentUserId } from '../../utils/jwt.js'

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
  
  // Eliminar duplicados: primero por número (prioridad), luego por ID
  const uniqueByNumber = new Map()
  for (const room of roomsToDisplay) {
    const key = room.number || room.id
    // Solo agregar si no existe o si el nuevo tiene ID numérico (del backend)
    if (!uniqueByNumber.has(key) || (typeof room.id === 'number' && typeof uniqueByNumber.get(key).id !== 'number')) {
      uniqueByNumber.set(key, room)
    }
  }
  const uniqueRooms = Array.from(uniqueByNumber.values())
  
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

      // Si no hay conexión, guardar en outbox para desasignar después
      if (!navigator.onLine && room.id) {
        const { saveMaidAssignmentOffline } = await import('../../offline-sync.js')
        await saveMaidAssignmentOffline({
          room_id: room.id,
          maid_id: null
        })
        alert('Sin conexión. La desasignación se sincronizará cuando se restablezca la conexión.')
      }

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
      } else if (!navigator.onLine && room.id && selected) {
        // Sin conexión: guardar en outbox
        const { saveMaidAssignmentOffline } = await import('../../offline-sync.js')
        await saveMaidAssignmentOffline({
          room_id: room.id,
          maid_id: selected
        })
        alert('Sin conexión. La asignación se sincronizará cuando se restablezca la conexión.')
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
      // Primero eliminar del backend si hay conexión
      if (navigator.onLine && room.id) {
        try {
          await deleteRoom(room.id)
          console.log('Habitación eliminada del backend exitosamente')
        } catch (err) {
          console.error('Error al eliminar del backend:', err)
          if (err.message && err.message.includes('403')) {
            alert('No tienes permisos para eliminar habitaciones. Solo usuarios con rol RECEPTION pueden realizar esta acción.')
            return
          }
          alert('Error al eliminar del backend: ' + err.message + '. Se eliminará solo localmente.')
        }
      }
      
      // Eliminar de IndexedDB
      await del('rooms', room.id)
      alert('Habitación eliminada exitosamente')
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
      
      const userId = getCurrentUserId();
      room.status = ROOM_STATUS.DIRTY
      
      // Actualizar en backend si hay conexión
      try {
        if (navigator.onLine && room.id) {
          await updateRoom({
            id: room.id,
            number: room.number,
            status: ROOM_STATUS.DIRTY,
            userId: userId
          });
        }
        await put('rooms', room)
        location.reload()
      } catch (error) {
        console.error('Error al habilitar habitación:', error)
        alert('Error al habilitar habitación: ' + error.message)
      }
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
  // Obtener habitaciones existentes tanto del backend como locales
  let backendRooms = []
  let localRooms = []
  
  if (navigator.onLine) {
    backendRooms = await getRooms().catch(() => [])
  }
  localRooms = (await getAll('rooms').catch(() => [])) || []
  
  // Combinar y eliminar duplicados usando un Map por número de habitación
  const allRoomsMap = new Map()
  
  // Primero agregar habitaciones del backend (tienen prioridad)
  for (const room of backendRooms) {
    allRoomsMap.set(room.number || room.id, room)
  }
  
  // Luego agregar locales solo si no existen en backend
  for (const room of localRooms) {
    const key = room.number || room.id
    if (!allRoomsMap.has(key)) {
      allRoomsMap.set(key, room)
    }
  }
  
  const existingNumbers = new Set(allRoomsMap.keys())
  
  // Recolectar todas las habitaciones que necesitan crearse
  const roomsToCreate = []
  
  for (let f = 1; f <= floors; f++) {
    for (let n = 1; n <= roomsPerFloor; n++) {
      const number = `${f}-${padRoom(n)}`
      
      // Si ya existe, saltarla
      if (existingNumbers.has(number)) {
        continue
      }

      roomsToCreate.push({
        number,
        status: roomStatusToAPI('limpia')  // Convertir a formato API (MAYÚSCULAS)
      })
    }
  }

  let created = 0

  // Si hay habitaciones para crear y hay conexión, crearlas en lote
  if (roomsToCreate.length > 0 && navigator.onLine) {
    try {
      console.log(`Creando ${roomsToCreate.length} habitaciones en lote...`)
      const resp = await createRoomsBatch(roomsToCreate)
      console.log('Respuesta del batch:', resp)
      
      // Obtener las habitaciones actualizadas del backend
      const updatedRooms = await getRooms().catch(() => [])
      
      // Guardar en IndexedDB las nuevas habitaciones
      for (const roomData of roomsToCreate) {
        const found = updatedRooms.find((r) => r.number === roomData.number)
        if (found) {
          await put('rooms', {
            id: found.id,
            number: found.number,
            status: found.status,
            maid: null,
            rented: false,
          })
          created++
        }
      }
    } catch (err) {
      console.warn('No se pudo crear en lote en el backend, creando individualmente:', err)
      
      // Fallback: crear una por una si falla el batch
      for (const roomData of roomsToCreate) {
        try {
          const resp = await createRoom(roomData)
          const roomId = resp?.data?.id || null
          
          await put('rooms', {
            id: roomId || roomData.number,
            number: roomData.number,
            status: roomData.status,
            maid: null,
            rented: false,
          })
          created++
        } catch (singleErr) {
          console.warn(`No se pudo crear habitación ${roomData.number}:`, singleErr)
        }
      }
    }
  } else if (roomsToCreate.length > 0) {
    // Si no hay conexión, guardar solo localmente
    for (const roomData of roomsToCreate) {
      await put('rooms', {
        id: roomData.number,
        number: roomData.number,
        status: roomData.status,
        maid: null,
        rented: false,
      })
      created++
    }
  }
  
  console.log(`ensureRoomsFromLayout: ${created} habitaciones nuevas creadas`)
  return created
}