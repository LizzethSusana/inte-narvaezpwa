# Actualización API - Tracking de Usuario en Cambios de Habitación

## Cambios Implementados

### 1. Modelo Room
Se agregó un campo `lastModifiedBy` que almacena la referencia al usuario que realizó la última modificación:
- Relación `@ManyToOne` con `BeanUser`
- Configurado con `FetchType.LAZY` para optimizar consultas
- **NO tiene cascade**, lo que permite eliminar habitaciones sin afectar a los usuarios

### 2. DTO de Respuesta (RoomResponseDTO)
Ahora incluye información del usuario que modificó la habitación:
```json
{
  "id": 1,
  "number": "101",
  "status": "LIMPIA",
  "lastModifiedById": 5,
  "lastModifiedByName": "María García"
}
```

### 3. DTO de Actualización (UpdateRoomDTO)
Nuevo DTO para actualizar habitaciones:
```json
{
  "id": 1,
  "number": "101",
  "status": "LIMPIA",
  "userId": 5
}
```

## Endpoints Actualizados

### PUT /api/rooms
**Request Body:**
```json
{
  "id": 1,
  "number": "101",
  "status": "LIMPIA",
  "userId": 5
}
```

**Campos:**
- `id` (requerido): ID de la habitación a actualizar
- `number` (requerido): Número de la habitación
- `status` (requerido): Estado de la habitación (LIMPIA, SUCIA, EN_LIMPIEZA, DESHABILITADA, etc.)
- `userId` (opcional): ID del usuario que está realizando el cambio

**Response:**
```json
{
  "message": "Operación exitosa",
  "data": null,
  "error": false,
  "status": "OK"
}
```

### GET /api/rooms
**Response:**
```json
{
  "message": "Operación exitosa",
  "data": [
    {
      "id": 1,
      "number": "101",
      "status": "LIMPIA",
      "lastModifiedById": 5,
      "lastModifiedByName": "María García"
    }
  ],
  "error": false,
  "status": "OK"
}
```

### GET /api/rooms/{id}
**Response:**
```json
{
  "message": "Operación exitosa",
  "data": {
    "id": 1,
    "number": "101",
    "status": "LIMPIA",
    "lastModifiedById": 5,
    "lastModifiedByName": "María García"
  },
  "error": false,
  "status": "OK"
}
```

## Consideraciones Importantes

### 1. Eliminación de Habitaciones
✅ **Puedes eliminar habitaciones libremente** sin problemas de foreign keys:
- La relación `lastModifiedBy` NO tiene cascade hacia el usuario
- Solo se eliminará la referencia en la habitación
- El usuario permanecerá intacto en la base de datos

### 2. Migración de Datos
Al implementar estos cambios, la columna `last_modified_by` se creará automáticamente en la base de datos:
- Habitaciones existentes tendrán `null` en este campo
- El frontend debe manejar valores `null` en `lastModifiedById` y `lastModifiedByName`

### 3. Frontend
Ejemplo de código para mostrar la información:
```javascript
// Al mostrar la habitación
const displayModifiedBy = (room) => {
  if (room.lastModifiedByName) {
    return `Última modificación: ${room.lastModifiedByName}`;
  }
  return 'Sin información de modificación';
};

// Al actualizar una habitación
const updateRoom = async (roomId, newStatus, userId) => {
  const response = await fetch(`${API_URL}/rooms`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      id: roomId,
      number: roomNumber, // del estado actual
      status: newStatus,
      userId: userId // ID del usuario logueado
    })
  });
  
  return response.json();
};
```

## Validaciones

### Backend valida:
1. ✅ Habitación existe antes de actualizar
2. ✅ Número de habitación no esté duplicado
3. ✅ Usuario existe si se proporciona `userId`
4. ✅ No permite eliminar habitación con referencias que tengan cascade

### Códigos de Error:
- `404`: Habitación o usuario no encontrado
- `400`: Número de habitación duplicado
- `500`: Error interno del servidor
