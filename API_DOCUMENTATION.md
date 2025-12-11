# 📚 Documentación API - Sistema de Limpieza de Hotel

**Base URL:** `http://localhost:8081/api`

**Versión:** 1.0.0

**Base de Datos:** MySQL - `hotel_cleaning`

---

## 📋 Tabla de Contenidos

- [Autenticación](#autenticación)
- [Usuarios](#usuarios)
- [Habitaciones](#habitaciones)
- [Asignaciones de Habitaciones](#asignaciones-de-habitaciones)
- [Reportes](#reportes)
- [Códigos de Estado HTTP](#códigos-de-estado-http)
- [Estructura de Respuestas](#estructura-de-respuestas)

---

## 🔐 Autenticación

### Login

**POST** `/api/auth`

Inicia sesión y retorna un token JWT.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response 200 - Success:**
```json
{
  "message": "Operación exitosa",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "fullname": "Administrador",
      "username": "admin",
      "active": true,
      "rol": {
        "id": 1,
        "name": "ADMIN"
      }
    }
  },
  "error": false,
  "status": "OK"
}
```

**Response 401 - Error:**
```json
{
  "message": "Credenciales incorrectas",
  "error": true,
  "status": "UNAUTHORIZED"
}
```

---

### Registro

**POST** `/api/auth/register`

Registra un nuevo usuario en el sistema.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "fullname": "Juan Pérez",
  "username": "juanperez",
  "password": "password123",
  "active": true,
  "rol": {
    "id": 2
  }
}
```

**Roles disponibles:**
- `1` - ADMIN (Administrador/Recepción)
- `2` - MAID (Camarera)

**Response 201 - Success:**
```json
{
  "message": "Usuario registrado exitosamente",
  "error": false,
  "status": "CREATED"
}
```

**Response 400 - Error:**
```json
{
  "message": "El usuario ya existe",
  "error": true,
  "status": "BAD_REQUEST"
}
```

---

## 👥 Usuarios

### Obtener todos los usuarios

**GET** `/api/user`

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200 - Success:**
```json
{
  "message": "Operación exitosa",
  "data": [
    {
      "id": 1,
      "fullname": "reception",
      "username": "reception",
      "active": true,
      "rol": {
        "id": 1,
        "name": "RECEPTION"
      }
    },
    {
      "id": 2,
      "fullname": "María García",
      "username": "maria.garcia",
      "active": true,
      "rol": {
        "id": 2,
        "name": "MAID"
      }
    }
  ],
  "error": false,
  "status": "OK"
}
```

---

### Obtener usuario por ID

**GET** `/api/user/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Path Parameters:**
- `id` (Long) - ID del usuario

**Response 200 - Success:**
```json
{
  "message": "Operación exitosa",
  "data": {
    "id": 2,
    "fullname": "María García",
    "username": "maria.garcia",
    "active": true,
    "rol": {
      "id": 2,
      "name": "MAID"
    }
  },
  "error": false,
  "status": "OK"
}
```

**Response 404 - Not Found:**
```json
{
  "message": "Usuario no encontrado",
  "error": true,
  "status": "NOT_FOUND"
}
```

---

### Crear usuario

**POST** `/api/user`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullname": "Pedro López",
  "username": "pedro.lopez",
  "password": "password123",
  "active": true,
  "rol": {
    "id": 2
  }
}
```

**Response 201 - Success:**
```json
{
  "message": "Usuario creado exitosamente",
  "error": false,
  "status": "CREATED"
}
```

---

### Actualizar usuario

**PUT** `/api/user`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": 2,
  "fullname": "María García Actualizada",
  "username": "maria.garcia",
  "password": "newpassword123",
  "active": true,
    "rol":
  {
    "id": 1
  }
}
```

**Nota:** El campo `password` es opcional. Si no se envía, se mantiene la contraseña actual.

**Response 200 - Success:**
```json
{
  "message": "Usuario actualizado exitosamente",
  "error": false,
  "status": "OK"
}
```

---

### Eliminar usuario

**DELETE** `/api/user`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": 2
}
```

**Response 200 - Success:**
```json
{
  "message": "Usuario eliminado exitosamente",
  "error": false,
  "status": "OK"
}
```

---

## 🚪 Habitaciones

### Obtener todas las habitaciones

**GET** `/api/rooms`

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200 - Success:**
```json
{
  "message": "Operación exitosa",
  "data": [
    {
      "id": 1,
      "number": "1-01",
      "status": "disponible"
    },
    {
      "id": 2,
      "number": "1-02",
      "status": "limpieza"
    },
    {
      "id": 3,
      "number": "2-01",
      "status": "ocupada"
    }
  ],
  "error": false,
  "status": "OK"
}
```

**Estados de habitación:**
- `disponible` - Habitación limpia y lista
- `ocupada` - Habitación ocupada por huésped
- `limpieza` - Habitación sucia, necesita limpieza

---

### Obtener habitación por ID

**GET** `/api/rooms/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Path Parameters:**
- `id` (Long) - ID de la habitación

**Response 200 - Success:**
```json
{
  "message": "Operación exitosa",
  "data": {
    "id": 1,
    "number": "1-01",
    "status": "disponible"
  },
  "error": false,
  "status": "OK"
}
```

---

### Crear habitación

**POST** `/api/rooms`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "number": "3-05",
  "status": "disponible"
}
```

**Response 201 - Success:**
```json
{
  "message": "Operación exitosa",
  "error": false,
  "status": "CREATED"
}
```

**Response 400 - Error (Habitación duplicada):**
```json
{
  "message": "Ya existe una habitación con el número 3-05",
  "error": true,
  "status": "BAD_REQUEST"
}
```

---

### Crear habitaciones en lote

**POST** `/api/rooms/batch`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
[
  {
    "number": "3-01",
    "status": "disponible"
  },
  {
    "number": "3-02",
    "status": "disponible"
  },
  {
    "number": "3-03",
    "status": "disponible"
  }
]
```

**Response 201 - Success:**
```json
{
  "message": "3 habitaciones creadas exitosamente",
  "error": false,
  "status": "CREATED"
}
```

**Response 201 - Partial Success:**
```json
{
  "message": "2 habitaciones creadas exitosamente. 1 habitaciones ya existían",
  "error": false,
  "status": "CREATED"
}
```

---

### Actualizar habitación

**PUT** `/api/rooms`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": 1,
  "number": "1-01",
  "status": "limpieza"
}
```

**Response 200 - Success:**
```json
{
  "message": "Operación exitosa",
  "error": false,
  "status": "OK"
}
```

---

### Eliminar habitación

**DELETE** `/api/rooms`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": 1
}
```

**Nota:** Al eliminar una habitación, se eliminan automáticamente todas sus asignaciones y reportes asociados (CASCADE).

**Response 200 - Success:**
```json
{
  "message": "Operación exitosa",
  "error": false,
  "status": "OK"
}
```

---

## 📋 Asignaciones de Habitaciones

### Obtener todas las asignaciones

**GET** `/api/room-assignments`

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200 - Success:**
```json
{
  "message": "Operación exitosa",
  "data": [
    {
      "id": 1,
      "fechaAsignacion": "2025-12-10T10:30:00",
      "user": {
        "id": 2,
        "fullname": "María García",
        "username": "maria.garcia"
      },
      "room": {
        "id": 1,
        "number": "1-01",
        "status": "limpieza"
      }
    },
    {
      "id": 2,
      "fechaAsignacion": "2025-12-10T11:00:00",
      "user": {
        "id": 2,
        "fullname": "María García",
        "username": "maria.garcia"
      },
      "room": {
        "id": 2,
        "number": "1-02",
        "status": "disponible"
      }
    }
  ],
  "error": false,
  "status": "OK"
}
```

---

### Obtener asignación por ID

**GET** `/api/room-assignments/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Path Parameters:**
- `id` (Long) - ID de la asignación

**Response 200 - Success:**
```json
{
  "message": "Operación exitosa",
  "data": {
    "id": 1,
    "fechaAsignacion": "2025-12-10T10:30:00",
    "user": {
      "id": 2,
      "fullname": "María García",
      "username": "maria.garcia"
    },
    "room": {
      "id": 1,
      "number": "1-01",
      "status": "limpieza"
    }
  },
  "error": false,
  "status": "OK"
}
```

---

### Crear asignación

**POST** `/api/room-assignments`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "room": {
    "id": 2
  },
  "user": {
    "id": 1
  }
}
```

**Nota:** Si no se proporciona `fechaAsignacion`, se usa la fecha y hora actual del servidor.

**Response 201 - Success:**
```json
{
  "message": "Asignación creada exitosamente",
  "error": false,
  "status": "CREATED"
}
```

---

### Actualizar asignación

**PUT** `/api/room-assignments`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
    "id": 1,
  "number": "101",
  "status": "ocupada"
}
```

**Response 200 - Success:**
```json
{
  "message": "Asignación actualizada exitosamente",
  "error": false,
  "status": "OK"
}
```

---

### Eliminar asignación

**DELETE** `/api/room-assignments`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": 1
}
```

**Response 200 - Success:**
```json
{
  "message": "Asignación eliminada exitosamente",
  "error": false,
  "status": "OK"
}
```

---

## 📸 Reportes

### Obtener todos los reportes

**GET** `/api/reports`

**Headers:**
```
Authorization: Bearer {token}
```

**Response 200 - Success:**
```json
{
  "message": "Operación exitosa",
  "data": [
    {
      "id": 1,
      "title": "Fuga de agua en baño",
      "description": "Se detectó una fuga de agua en el lavabo del baño",
      "photo1": "report_1_photo1_1733875200000.jpg",
      "photo2": null,
      "photo3": null,
      "user": {
        "id": 2,
        "fullname": "María García",
        "username": "maria.garcia"
      },
      "room": {
        "id": 1,
        "number": "1-01",
        "status": "limpieza"
      }
    }
  ],
  "error": false,
  "status": "OK"
}
```

---

### Obtener reporte por ID

**GET** `/api/reports/{id}`

**Headers:**
```
Authorization: Bearer {token}
```

**Path Parameters:**
- `id` (Long) - ID del reporte

**Response 200 - Success:**
```json
{
  "message": "Operación exitosa",
  "data": {
    "id": 1,
    "title": "Fuga de agua en baño",
    "description": "Se detectó una fuga de agua en el lavabo del baño",
    "photo1": "report_1_photo1_1733875200000.jpg",
    "photo2": "report_1_photo2_1733875200000.jpg",
    "photo3": null,
    "user": {
      "id": 2,
      "fullname": "María García",
      "username": "maria.garcia"
    },
    "room": {
      "id": 1,
      "number": "1-01",
      "status": "limpieza"
    }
  },
  "error": false,
  "status": "OK"
}
```

---

### Crear reporte

**POST** `/api/reports`

**⚠️ IMPORTANTE:** Esta petición usa **multipart/form-data** para enviar archivos.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `title` | String | Sí | Título del reporte |
| `description` | String | Sí | Descripción detallada |
| `user_id` | Long | Sí | ID del usuario que crea el reporte |
| `room_id` | Long | Sí | ID de la habitación |
| `photo1` | File | No | Imagen 1 (JPG, PNG) |
| `photo2` | File | No | Imagen 2 (JPG, PNG) |
| `photo3` | File | No | Imagen 3 (JPG, PNG) |

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:8081/api/reports \
  -H "Authorization: Bearer {token}" \
  -F "title=Fuga de agua" \
  -F "description=Fuga detectada en el baño" \
  -F "user_id=2" \
  -F "room_id=1" \
  -F "photo1=@/path/to/image1.jpg" \
  -F "photo2=@/path/to/image2.jpg"
```

**Ejemplo con JavaScript (FormData):**
```javascript
const formData = new FormData();
formData.append('title', 'Fuga de agua');
formData.append('description', 'Fuga detectada en el baño');
formData.append('user_id', '2');
formData.append('room_id', '1');
formData.append('photo1', file1); // File object
formData.append('photo2', file2); // File object

fetch('http://localhost:8081/api/reports', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Response 201 - Success:**
```json
{
  "message": "Reporte creado exitosamente",
  "error": false,
  "status": "CREATED"
}
```

**Response 400 - Error:**
```json
{
  "message": "El titulo es requerido",
  "error": true,
  "status": "BAD_REQUEST"
}
```

---

### Actualizar reporte

**PUT** `/api/reports`

**⚠️ IMPORTANTE:** Esta petición usa **multipart/form-data** para enviar archivos.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | Long | Sí | ID del reporte a actualizar |
| `title` | String | Sí | Título del reporte |
| `description` | String | Sí | Descripción detallada |
| `user_id` | Long | Sí | ID del usuario |
| `room_id` | Long | Sí | ID de la habitación |
| `photo1` | File | No | Nueva imagen 1 (reemplaza la anterior) |
| `photo2` | File | No | Nueva imagen 2 (reemplaza la anterior) |
| `photo3` | File | No | Nueva imagen 3 (reemplaza la anterior) |

**Ejemplo con cURL:**
```bash
curl -X PUT http://localhost:8081/api/reports \
  -H "Authorization: Bearer {token}" \
  -F "id=1" \
  -F "title=Fuga de agua - Actualizado" \
  -F "description=Fuga reparada exitosamente" \
  -F "user_id=2" \
  -F "room_id=1" \
  -F "photo1=@/path/to/new_image1.jpg"
```

**Response 200 - Success:**
```json
{
  "message": "Reporte actualizado exitosamente",
  "error": false,
  "status": "OK"
}
```

---

### Obtener imagen de reporte

**GET** `/api/reports/image/{fileName}`

**No requiere autenticación.**

**Path Parameters:**
- `fileName` (String) - Nombre del archivo de imagen (ej: `report_1_photo1_1733875200000.jpg`)

**Response 200 - Success:**
Retorna la imagen en formato binario con headers:
```
Content-Type: image/jpeg
Content-Length: {tamaño en bytes}
```

**Response 404 - Not Found:**
Si la imagen no existe, retorna 404.

**Ejemplo de URL:**
```
http://localhost:8081/api/reports/image/report_1_photo1_1733875200000.jpg
```

---

### Eliminar reporte

**DELETE** `/api/reports`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": 1
}
```

**Nota:** Al eliminar un reporte, también se eliminan las imágenes asociadas del servidor.

**Response 200 - Success:**
```json
{
  "message": "Reporte eliminado exitosamente",
  "error": false,
  "status": "OK"
}
```

---

## 📊 Códigos de Estado HTTP

| Código | Nombre | Descripción |
|--------|--------|-------------|
| 200 | OK | Operación exitosa |
| 201 | CREATED | Recurso creado exitosamente |
| 400 | BAD_REQUEST | Error en la petición (datos inválidos) |
| 401 | UNAUTHORIZED | No autenticado o token inválido |
| 403 | FORBIDDEN | No tiene permisos para esta acción |
| 404 | NOT_FOUND | Recurso no encontrado |
| 500 | INTERNAL_SERVER_ERROR | Error interno del servidor |

---

## 🔧 Estructura de Respuestas

Todas las respuestas de la API siguen esta estructura:

```json
{
  "message": "Mensaje descriptivo de la operación",
  "data": {}, // Datos de respuesta (opcional)
  "error": false, // true si hay error
  "status": "OK" // Estado HTTP
}
```

### Respuesta Exitosa
```json
{
  "message": "Operación exitosa",
  "data": { /* datos */ },
  "error": false,
  "status": "OK"
}
```

### Respuesta con Error
```json
{
  "message": "Descripción del error",
  "error": true,
  "status": "BAD_REQUEST"
}
```

---

## 🔒 Autenticación JWT

La mayoría de los endpoints requieren autenticación mediante token JWT.

### Cómo obtener el token:
1. Hacer login en `/api/auth`
2. Guardar el token recibido en `data.token`
3. Enviar el token en el header de cada petición:

```
Authorization: Bearer {token}
```

### Ejemplo:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTczMzg3NTIwMH0.abc123...
```

---

## 📁 Archivos y Carpetas

### Ubicación de archivos subidos:
- **Reportes:** `hotel/uploads/reports/`

### Formato de nombres de archivo:
```
report_{reportId}_photo{1|2|3}_{timestamp}.{ext}
```

Ejemplo: `report_1_photo1_1733875200000.jpg`

---

## 🗄️ Base de Datos

**Configuración:**
```properties
URL: jdbc:mysql://localhost:3306/hotel_cleaning
Usuario: root
Puerto: 8081
```

**Tablas principales:**
- `users` - Usuarios del sistema
- `rol` - Roles (ADMIN, MAID)
- `room` - Habitaciones
- `room_assignment` - Asignaciones de habitaciones a camareras
- `report` - Reportes de mantenimiento

---

## 🚀 Iniciar el Backend

```bash
cd hotel
./mvnw spring-boot:run
```

O compilar y ejecutar:
```bash
./mvnw clean package
java -jar target/hotel-0.0.1-SNAPSHOT.jar
```

---

## 📝 Notas Importantes

1. **CORS:** Todos los endpoints tienen CORS habilitado (`@CrossOrigin(origins = "*")`)

2. **Formato de fechas:** Las fechas usan formato ISO 8601: `2025-12-10T10:30:00`

3. **Cascadas:** 
   - Al eliminar una habitación, se eliminan sus asignaciones y reportes
   - Al eliminar un reporte, se eliminan sus imágenes

4. **Seguridad:**
   - Las contraseñas se almacenan encriptadas (BCrypt)
   - Los tokens JWT tienen expiración
   - Secret Key configurada en `application.properties`

5. **Multipart:**
   - Solo los endpoints de reportes (POST/PUT) usan `multipart/form-data`
   - Todos los demás usan `application/json`

6. **Imágenes:**
   - Formatos aceptados: JPG, PNG, JPEG
   - Tamaño máximo: configurado en Spring Boot (por defecto 10MB)
   - Las imágenes se almacenan localmente en `/uploads/reports/`

---

## 🤝 Contacto y Soporte

Para dudas o soporte, contactar al equipo de desarrollo.

**Última actualización:** 10 de diciembre de 2025
