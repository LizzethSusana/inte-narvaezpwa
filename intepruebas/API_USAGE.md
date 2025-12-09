# Documentación de API - Hotel Management

Este documento explica cómo usar las funciones de API para conectar con el backend (Spring Boot) desde el frontend (PWA).

## Configuración

El archivo `src/api.js` contiene todas las funciones para comunicarse con el backend usando **async/await** y **Promises**.

**URL Base:** `http://localhost:8081/api`

## Autenticación

El token JWT se guarda automáticamente en `localStorage` después del login y se incluye en todas las peticiones que lo requieran.

```javascript
// El token se obtiene automáticamente de localStorage
const token = localStorage.getItem("authToken");
```

---

## 📦 ROOMS (Habitaciones)

### Obtener todas las habitaciones

```javascript
import { getRooms } from './api.js';

async function loadRooms() {
  try {
    const rooms = await getRooms();
    console.log('Habitaciones:', rooms);
    // rooms es un array de objetos Room
  } catch (error) {
    console.error('Error:', error);
  }
}
```

**Respuesta esperada:**
```json
[
  {
    "id": 1,
    "number": "101",
    "status": "disponible"
  }
]
```

### Obtener una habitación por ID

```javascript
import { getRoomById } from './api.js';

async function loadRoom(roomId) {
  try {
    const room = await getRoomById(roomId);
    console.log('Habitación:', room);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Crear una habitación

```javascript
import { createRoom } from './api.js';

async function addRoom() {
  try {
    const newRoom = {
      number: "102",
      status: "disponible"
    };
    
    const result = await createRoom(newRoom);
    console.log('Habitación creada:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Actualizar una habitación

```javascript
import { updateRoom } from './api.js';

async function editRoom() {
  try {
    const roomData = {
      id: 1,
      number: "101",
      status: "ocupada"
    };
    
    const result = await updateRoom(roomData);
    console.log('Habitación actualizada:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Eliminar una habitación

```javascript
import { deleteRoom } from './api.js';

async function removeRoom(roomId) {
  try {
    const result = await deleteRoom(roomId);
    console.log('Habitación eliminada:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## 🔗 ROOM ASSIGNMENTS (Asignaciones de Habitaciones)

### Obtener todas las asignaciones

```javascript
import { getRoomAssignments } from './api.js';

async function loadAssignments() {
  try {
    const assignments = await getRoomAssignments();
    console.log('Asignaciones:', assignments);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

**Respuesta esperada:**
```json
[
  {
    "id": 1,
    "fechaAsignacion": "2025-12-08T10:30:00",
    "room": {
      "id": 2,
      "number": "102",
      "status": "limpieza"
    },
    "user": {
      "id": 1,
      "fullname": "María García",
      "username": "maria@hotel.com"
    }
  }
]
```

### Crear una asignación

```javascript
import { createRoomAssignment } from './api.js';

async function assignRoom() {
  try {
    const assignment = {
      room: { id: 2 },
      user: { id: 1 }
    };
    
    const result = await createRoomAssignment(assignment);
    console.log('Asignación creada:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Actualizar una asignación

```javascript
import { updateRoomAssignment } from './api.js';

async function editAssignment() {
  try {
    const assignment = {
      id: 1,
      room: { id: 3 },
      user: { id: 2 }
    };
    
    const result = await updateRoomAssignment(assignment);
    console.log('Asignación actualizada:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Eliminar una asignación

```javascript
import { deleteRoomAssignment } from './api.js';

async function removeAssignment(assignmentId) {
  try {
    const result = await deleteRoomAssignment(assignmentId);
    console.log('Asignación eliminada:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## 👥 USERS (Usuarios)

### Obtener todos los usuarios

```javascript
import { getUsers } from './api.js';

async function loadUsers() {
  try {
    const users = await getUsers();
    console.log('Usuarios:', users);
    
    // Filtrar solo camareras (rol id = 3)
    const maids = users.filter(u => u.rol?.id === 2);
    console.log('Camareras:', maids);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Obtener un usuario por ID

```javascript
import { getUserById } from './api.js';

async function loadUser(userId) {
  try {
    const user = await getUserById(userId);
    console.log('Usuario:', user);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## 📋 REPORTS (Reportes)

### Obtener todos los reportes

```javascript
import { getReports } from './api.js';

async function loadReports() {
  try {
    const reports = await getReports();
    console.log('Reportes:', reports);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Enviar un reporte con imágenes

```javascript
import { postReport } from './api.js';

async function sendReport() {
  try {
    const formData = new FormData();
    formData.append('description', 'Habitación limpia y en orden');
    formData.append('user_id', '1');
    formData.append('room_id', '2');
    
    // Agregar imágenes (File objects)
    const photo1 = document.getElementById('photo1').files[0];
    if (photo1) {
      formData.append('photo1', photo1);
    }
    
    const result = await postReport(formData);
    console.log('Reporte enviado:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

---

## 🔄 Ejemplo Completo: Flujo de Trabajo

```javascript
import { 
  getRooms, 
  createRoom, 
  createRoomAssignment,
  getUsers 
} from './api.js';

async function setupHotelRoom() {
  try {
    // 1. Crear una habitación
    const newRoom = await createRoom({
      number: "105",
      status: "disponible"
    });
    
    console.log('Habitación creada:', newRoom.data);
    const roomId = newRoom.data.id;
    
    // 2. Obtener camareras disponibles
    const users = await getUsers();
    const maids = users.filter(u => u.rol?.id === 2 && u.active);
    
    if (maids.length > 0) {
      // 3. Asignar la primera camarera disponible
      const assignment = await createRoomAssignment({
        room: { id: roomId },
        user: { id: maids[0].id }
      });
      
      console.log('Habitación asignada a:', maids[0].fullname);
    }
    
    // 4. Listar todas las habitaciones
    const allRooms = await getRooms();
    console.log('Total de habitaciones:', allRooms.length);
    
  } catch (error) {
    console.error('Error en el flujo:', error);
  }
}

// Ejecutar
setupHotelRoom();
```

---

## ⚠️ Manejo de Errores

Todas las funciones lanzan errores que deben ser capturados con try/catch:

```javascript
try {
  const rooms = await getRooms();
  // Usar rooms...
} catch (error) {
  if (error.message.includes('Network')) {
    console.log('Sin conexión - usando datos locales');
  } else {
    console.error('Error del servidor:', error.message);
  }
}
```

---

## 🔌 Modo Offline

El sistema automáticamente:
- Guarda datos en IndexedDB cuando hay conexión
- Usa datos locales cuando no hay conexión
- Sincroniza cambios cuando se recupera la conexión

```javascript
if (navigator.onLine) {
  // Sincronizar con backend
  await syncDataFromBackend();
} else {
  // Usar datos locales de IndexedDB
  const localRooms = await getAll('rooms');
}
```

---

## 📝 Estados de Habitación

Los estados válidos para `room.status` son:
- `"disponible"` - Habitación disponible
- `"ocupada"` - Habitación ocupada por huésped
- `"mantenimiento"` - En mantenimiento
- `"limpieza"` - En proceso de limpieza

---

## 🎯 Roles de Usuario

Los IDs de roles creados por la app son:
- `1` - Recepcionista (RECEPTION)
- `2` - Camarera (MAID)

---

## 🚀 Inicialización Recomendada

```javascript
// En reception.js o app principal
import { getRooms, getUsers, getRoomAssignments } from './api.js';
import { put } from './idb.js';

async function initializeApp() {
  try {
    // Sincronizar datos del backend
    const [rooms, users, assignments] = await Promise.all([
      getRooms(),
      getUsers(),
      getRoomAssignments()
    ]);
    
    // Guardar en IndexedDB para uso offline
    for (const room of rooms) {
      await put('rooms', room);
    }
    
    for (const user of users.filter(u => u.rol?.id === 2)) {
      await put('maids', user);
    }
    
    console.log('App inicializada correctamente');
    
  } catch (error) {
    console.error('Error en inicialización:', error);
  }
}

initializeApp();
```
