// =====================
// MODALES DE HABITACIONES
// =====================

import { getAll, put } from '../../idb.js'
import { ROOM_STATUS } from '../shared/constants.js'
import { showModal, hideModal, getModal } from '../shared/modal.js'
import { 
  createRoom, 
  updateRoom, 
  createRoomAssignment, 
  getUsers,
  getRooms,
} from '../../api.js'

/**
 * Abre el modal de agregar habitación
 */
export async function openRoomAddModal() {
  try {
    // Obtener usuarios (camareras) desde el backend
    const allUsers = await getUsers().catch(() => []);
    const maids = allUsers.filter(u => u.rol?.id === 2); // Filtrar solo camareras (rol id=2)
    
    const maidOptions = maids
      .map((m) => {
        const id = m.id;
        const label = m.fullname || m.username;
        const disabled = !m.active ? 'disabled' : '';
        return `<option value="${id}" ${disabled}>${label}${!m.active ? ' (Inactivo)' : ''}</option>`;
      })
      .join('');

    const modal = getModal();
    showModal();
    modal.innerHTML = `
      <div class="modal-content" role="dialog">
        <h3>Nueva Habitación</h3>
        <label>Número de habitación</label>
        <input id="newRoomNumber" type="text" required placeholder="Ej: 101" />
        <label>Estado</label>
        <select id="newRoomStatus">
          <option value="disponible">Disponible</option>
          <option value="ocupada">Ocupada</option>
          <option value="limpieza">Sucia</option>
        </select>
        <label>Asignar camarera (opcional)</label>
        <select id="newRoomMaid">
          <option value="">-- Sin asignar --</option>
          ${maidOptions}
        </select>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px;">
          <button id="saveRoom" class="btn btn-sm btn-primary">Guardar</button>
          <button id="closeModal" class="btn btn-sm btn-secondary">Cerrar</button>
        </div>
      </div>`;

    document.getElementById('closeModal').onclick = () => hideModal();

    document.getElementById('saveRoom').onclick = async () => {
      const number = document.getElementById('newRoomNumber').value.trim();
      const status = document.getElementById('newRoomStatus').value;
      const maidId = document.getElementById('newRoomMaid').value;

      if (!number) {
        alert('El número de habitación es requerido');
        return;
      }

      try {
        // 1. Crear la habitación
        const roomData = {
          number: number,
          status: status || 'disponible'
        };
        
        const result = await createRoom(roomData);

        // Obtener id de la habitación (el backend no lo devuelve en data)
        let roomId = result?.data?.id;
        if (!roomId) {
          const allRooms = await getRooms().catch(() => []);
          const found = allRooms.find((r) => r.number === number);
          roomId = found?.id || null;
        }

        // 2. Si se seleccionó una camarera y tenemos id de habitación, crear la asignación
        if (maidId && roomId) {
          await createRoomAssignment({
            room: { id: roomId },
            user: { id: parseInt(maidId) }
          });
        }

        // 3. Guardar en IndexedDB para uso offline
        await put('rooms', {
          id: roomId || number,
          number: number,
          status: status,
          maid: maidId || null
        });

        alert('Habitación creada exitosamente');
        hideModal();
        location.reload();
        
      } catch (error) {
        console.error('Error al crear habitación:', error);
        alert('Error al crear habitación: ' + error.message);
      }
    };
  } catch (error) {
    console.error('Error al abrir modal:', error);
    alert('Error al cargar usuarios');
  }
}

/**
 * Abre el modal de editar habitación
 * @param {Object} room
 */
export async function openRoomEditModal(room) {
  try {
    // Obtener usuarios (camareras) desde el backend
    const allUsers = await getUsers().catch(() => []);
    const maids = allUsers.filter(u => u.rol?.id === 2); // Filtrar solo camareras
    
    const maidOptions = maids
      .map((m) => {
        const id = m.id;
        const label = m.fullname || m.username;
        const sel = room.maid && room.maid === id ? 'selected' : '';
        const disabled = !m.active ? 'disabled' : '';
        return `<option value="${id}" ${sel} ${disabled}>${label}${!m.active ? ' (Inactivo)' : ''}</option>`;
      })
      .join('');

    const modal = getModal();
    showModal();
    modal.innerHTML = `
      <div class="modal-content" role="dialog">
        <h3>Editar Habitación ${room.number || room.id}</h3>
        <label>Número de habitación</label>
        <input id="editRoomNumber" type="text" value="${room.number || ''}" required />
        <label>Estado</label>
        <select id="editRoomStatus">
          <option value="disponible">Disponible</option>
          <option value="ocupada">Ocupada</option>
          <option value="limpieza">Sucia</option>
        </select>
        <label>Asignar camarera (opcional)</label>
        <select id="editRoomMaid">
          <option value="">-- Sin asignar --</option>
          ${maidOptions}
        </select>
        <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px;">
          <button id="saveEditRoom" class="btn btn-sm btn-primary">Guardar</button>
          <button id="closeModal" class="btn btn-sm btn-secondary">Cerrar</button>
        </div>
      </div>`;

    const statusEl = document.getElementById('editRoomStatus');
    if (statusEl) statusEl.value = room.status || 'disponible';

    const maidEl = document.getElementById('editRoomMaid');
    if (maidEl) maidEl.value = room.maid || '';

    document.getElementById('closeModal').onclick = () => hideModal();

    document.getElementById('saveEditRoom').onclick = async () => {
      const newNumber = document.getElementById('editRoomNumber').value.trim();
      const newStatus = document.getElementById('editRoomStatus').value;
      const newMaid = document.getElementById('editRoomMaid').value || null;

      if (!newNumber) {
        alert('El número de habitación es requerido');
        return;
      }

      try {
        // 1. Actualizar la habitación
        const roomData = {
          id: room.id,
          number: newNumber,
          status: newStatus
        };
        
        await updateRoom(roomData);
        
        // 2. Si cambió la asignación de camarera, crear nueva asignación
        if (newMaid && newMaid !== room.maid) {
          await createRoomAssignment({
            room: { id: room.id },
            user: { id: parseInt(newMaid) }
          });
        }

        // 3. Actualizar en IndexedDB
        await put('rooms', {
          ...room,
          number: newNumber,
          status: newStatus,
          maid: newMaid
        });

        alert('Habitación actualizada exitosamente');
        hideModal();
        location.reload();
        
      } catch (error) {
        console.error('Error al actualizar habitación:', error);
        alert('Error al actualizar habitación: ' + error.message);
      }
    };
  } catch (error) {
    console.error('Error al abrir modal:', error);
    alert('Error al cargar usuarios');
  }
}