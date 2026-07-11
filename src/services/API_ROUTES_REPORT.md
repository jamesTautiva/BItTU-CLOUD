# 📋 Informe Completo de Rutas - BITU API

> **Versión**: 1.0.0  
> **Base URL**: `https://bitu-api.onrender.com/api`  
> **Última actualización**: 2026-04-14

---

## 🔐 Autenticación

La API usa **JWT (JSON Web Tokens)** para autenticación.

### Headers Requeridos (para rutas protegidas)
```
Authorization: Bearer <tu_token_jwt>
Content-Type: application/json
```

### Cómo obtener el token
1. Registrar usuario: `POST /auth/register`
2. Login: `POST /auth/login`
3. El token viene en la respuesta: `response.token`

---

## 📊 Resumen por Categorías

| Categoría | Rutas | Auth Requerida |
|-----------|-------|----------------|
| Auth | 3 | ❌ Pública |
| Users | 10 | ✅ Sí |
| Songs | 5 | ✅ Sí |
| Albums | 12 | ✅ Sí |
| Artists | 11 | ✅ Sí |
| Playlists | 10 | ✅ Sí |
| Tickets | 13 | ✅ Sí |
| Comments | 8 | ✅ Sí |
| Streaming | 3 | ✅ Sí |
| Search | 3 | ❌ Pública |
| Favorites | 8 | ✅ Sí |
| Upload | 10 | ✅ Sí |
| Notifications | 10 | ✅ Sí |
| Composers | 8 | ✅ Sí |
| Legal Acceptance | 6 | ✅ Sí |

**Total: 112 endpoints**

---

## 🔓 RUTAS PÚBLICAS (No requieren token)

### 🔑 Autenticación - `/auth`

#### 1. Registrar Usuario
```http
POST /auth/register
Content-Type: application/json
```

**Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"  // opcional: user, artist, admin
}
```

**Respuesta éxito (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "role": "user"
}
```

**Errores:**
- `400`: Datos inválidos
- `409`: Email ya registrado

---

#### 2. Login
```http
POST /auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Respuesta éxito (200):**
```json
{
  "message": "User logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Errores:**
- `401`: Credenciales inválidas

---

### 🔍 Búsqueda - `/search`

#### 3. Búsqueda Unificada
```http
GET /search?q=amor&type=all&limit=20&offset=0
```

**Query Parameters:**
| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| q | string | - | Término de búsqueda (requerido) |
| type | string | all | all, artist, album, song, lyrics |
| limit | integer | 20 | Máximo de resultados |
| offset | integer | 0 | Paginación |

---

#### 4. Búsqueda Avanzada
```http
GET /search/advanced?q=amor&type=song&artist_id=1&year_from=2020&has_lyrics=true
```

---

#### 5. Sugerencias Autocomplete
```http
GET /search/suggestions?q=amor&limit=5
```

---

## 🔒 RUTAS PROTEGIDAS (Requieren Bearer Token)

### 👤 Usuarios - `/users`

**Headers requeridos:**
```
Authorization: Bearer <token>
```

#### 6. Listar Usuarios
```http
GET /users
Authorization: Bearer <token>
```

---

#### 7. Obtener Usuario por ID
```http
GET /users/{id}
Authorization: Bearer <token>
```

**Params:**
- `id` (integer) - ID del usuario

---

#### 8. Actualizar Usuario
```http
PUT /users/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "username": "nuevo_username",
  "email": "nuevo@email.com",
  "avatar_url": "https://..."
}
```

---

#### 9. Eliminar Usuario
```http
DELETE /users/{id}
Authorization: Bearer <token>
```

---

#### 10. Obtener Perfil
```http
GET /users/profile/{id}
Authorization: Bearer <token>
```

---

#### 11. Actualizar Perfil
```http
PUT /users/profile/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

---

#### 12. Eliminar Perfil
```http
DELETE /users/profile/{id}
Authorization: Bearer <token>
```

---

#### 13. Obtener Usuario Actual (Me)
```http
GET /auth/me
Authorization: Bearer <token>
```

---

### 🎵 Canciones - `/song`

#### 14. Listar Canciones
```http
GET /song/all
Authorization: Bearer <token>
```

---

#### 15. Obtener Canción por ID
```http
GET /song/get/{id}
Authorization: Bearer <token>
```

---

#### 16. Crear Canción
```http
POST /song/create
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Mi Canción",
  "album_id": 1,
  "duration": 180,
  "track_number": 1,
  "lyrics": "Letra de la canción...",
  "license_type": "standard"
}
```

**Campos requeridos:** `title`, `album_id`

---

#### 17. Actualizar Canción
```http
PUT /song/update/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Nuevo título",
  "duration": 200,
  "lyrics": "Nueva letra..."
}
```

---

#### 18. Eliminar Canción
```http
DELETE /song/delete/{id}
Authorization: Bearer <token>
```

---

### 💿 Álbumes - `/album`

#### 19. Listar Álbumes
```http
GET /album/all
Authorization: Bearer <token>
```

---

#### 20. Obtener Álbum por ID
```http
GET /album/{id}
Authorization: Bearer <token>
```

---

#### 21. Crear Álbum
```http
POST /album/create
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Mi Álbum",
  "artist_id": 1,
  "release_date": "2024-01-01",
  "cover_image": "https://..."
}
```

**Campos requeridos:** `title`, `artist_id`

---

#### 22. Actualizar Álbum
```http
PUT /album/update/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

---

#### 23. Eliminar Álbum
```http
DELETE /album/delete/{id}
Authorization: Bearer <token>
```

---

#### 24. Cambiar Estado del Álbum
```http
PUT /album/change-status/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

---

### 🎤 Géneros de Álbum - `/album/genres`

#### 25-29. CRUD de Géneros
```http
GET    /album/genres/all
GET    /album/genres/{id}
POST   /album/genres/create
PUT    /album/genres/update/{id}
DELETE /album/genres/delete/{id}
```

**Todas requieren:** `Authorization: Bearer <token>`

---

### 🎸 Artistas - `/artist`

#### 30. Listar Artistas
```http
GET /artist/all
Authorization: Bearer <token>
```

---

#### 31. Crear Artista
```http
POST /artist/create
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Artista Principal",
  "user_id": 1,
  "bio": "Biografía del artista...",
  "artist_image": "https://..."
}
```

**Campos requeridos:** `name`, `user_id`

---

#### 32. Actualizar Artista (Usuario)
```http
PUT /artist/update/{id}
Authorization: Bearer <token>
```

---

#### 33. Eliminar Artista
```http
DELETE /artist/delete/{id}
Authorization: Bearer <token>
```

---

### 👥 Miembros de Artista - `/artist/members`

#### 34-38. CRUD de Miembros
```http
GET    /artist/members/all
POST   /artist/members/create
PUT    /artist/members/update/{id}
DELETE /artist/members/delete/{id}
```

---

### 📝 Playlists - `/playlist`

#### 39. Listar Playlists Públicas
```http
GET /playlist/all
Authorization: Bearer <token>
```

---

#### 40. Buscar Playlists
```http
GET /playlist/search?q=rock
Authorization: Bearer <token>
```

---

#### 41. Obtener Playlists de Usuario
```http
GET /playlist/user/{userId}
Authorization: Bearer <token>
```

---

#### 42. Obtener Playlist por ID
```http
GET /playlist/{id}
Authorization: Bearer <token>
```

---

#### 43. Crear Playlist
```http
POST /playlist/create
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "user_id": 1,
  "name": "Mi Playlist",
  "description": "Descripción opcional",
  "is_public": true
}
```

---

#### 44. Actualizar Playlist
```http
PUT /playlist/update/{id}
Authorization: Bearer <token>
```

---

#### 45. Eliminar Playlist
```http
DELETE /playlist/delete/{id}
Authorization: Bearer <token>
```

---

### 🎵 Canciones en Playlist - `/playlist/{id}/...`

#### 46. Agregar Canción a Playlist
```http
POST /playlist/{id}/songs
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "song_id": 1
}
```

---

#### 47. Eliminar Canción de Playlist
```http
DELETE /playlist/{id}/songs/{songId}
Authorization: Bearer <token>
```

---

#### 48. Reordenar Canciones
```http
PUT /playlist/{id}/reorder
Authorization: Bearer <token>
Content-Type: application/json
```

---

### 🎫 Tickets de Soporte - `/tickets`

#### 49. Listar Tickets
```http
GET /tickets/all?limit=20&offset=0
Authorization: Bearer <token>
```

---

#### 50. Buscar Tickets
```http
GET /tickets/search?q=problema&limit=20
Authorization: Bearer <token>
```

---

#### 51. Obtener Ticket por ID
```http
GET /tickets/by-id/{id}
Authorization: Bearer <token>
```

---

#### 52. Crear Ticket
```http
POST /tickets/create
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "user_id": 1,
  "category_id": 1,
  "title": "Problema con reproducción",
  "description": "No puedo reproducir canciones...",
  "priority": "medium"  // low, medium, high, urgent
}
```

---

#### 53. Actualizar Ticket
```http
PUT /tickets/update/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

---

#### 54. Eliminar Ticket
```http
DELETE /tickets/delete/{id}
Authorization: Bearer <token>
```

---

#### 55. Cambiar Estado del Ticket
```http
PUT /tickets/update-status/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "resolved"  // open, in_progress, resolved, closed
}
```

---

#### 56. Asignar Agente
```http
PUT /tickets/assign/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "agent_id": 2
}
```

---

### 💬 Mensajes en Tickets - `/tickets/...`

#### 57. Agregar Mensaje
```http
POST /tickets/add-message/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "message": "Nuevo mensaje..."
}
```

---

#### 58. Actualizar Mensaje
```http
PUT /tickets/update-message/{messageId}
Authorization: Bearer <token>
```

---

#### 59. Eliminar Mensaje
```http
DELETE /tickets/delete-message/{messageId}
Authorization: Bearer <token>
```

---

### 📂 Categorías de Tickets - `/tickets/categories`

#### 60-63. CRUD de Categorías
```http
GET    /tickets/categories/all
POST   /tickets/categories/create
PUT    /tickets/categories/update/{id}
DELETE /tickets/categories/delete/{id}
```

---

#### 64. Estadísticas de Tickets
```http
GET /tickets/stats/dashboard
Authorization: Bearer <token>
```

---

### 💬 Comentarios - `/comments`

#### 65. Comentarios por Canción
```http
GET /comments/song?song_id=1
Authorization: Bearer <token>
```

---

#### 66. Comentarios por Álbum
```http
GET /comments/album/{albumId}
Authorization: Bearer <token>
```

---

#### 67. Crear Comentario
```http
POST /comments/create
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "user_id": 1,
  "content": "¡Excelente canción!",
  "song_id": 1,     // opcional
  "album_id": null  // opcional
}
```

**Nota:** Debe incluir `song_id` O `album_id`

---

#### 68. Actualizar Comentario
```http
PUT /comments/update/{id}
Authorization: Bearer <token>
Content-Type: application/json
```

---

#### 69. Eliminar Comentario
```http
DELETE /comments/{id}
Authorization: Bearer <token>
```

---

#### 70. Moderar Comentario
```http
PUT /comments/{id}/moderate
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "approved"  // approved, pending, rejected
}
```

---

#### 71. Comentarios Reportados
```http
GET /comments/moderation/flagged
Authorization: Bearer <token>
```

---

#### 72. Estadísticas de Comentarios
```http
GET /comments/stats/count
Authorization: Bearer <token>
```

---

### 🎵 Streaming - `/stream`

#### 73. Stream de Audio
```http
GET /stream/{songId}
Authorization: Bearer <token>
```

**Headers opcionales:**
```
Range: bytes=0-1023
```

**Respuestas:**
- `200`: Audio completo
- `206`: Partial Content (si se envía Range)

---

#### 74. Información del Stream
```http
GET /stream/{songId}/info
Authorization: Bearer <token>
```

---

#### 75. Preload Chunk (carga rápida)
```http
GET /stream/{songId}/preload?size=256000
Authorization: Bearer <token>
```

---

### ⭐ Favoritos - `/favorites`

#### 76. Obtener Favoritos de Usuario
```http
GET /favorites/user/{userId}?type=songs|artists|all
Authorization: Bearer <token>
```

---

#### 77. Verificar si es Favorito
```http
GET /favorites/user/{userId}/check?song_id=1
Authorization: Bearer <token>
```

**O:**
```http
GET /favorites/user/{userId}/check?artist_id=1
```

---

#### 78. Estadísticas de Favoritos
```http
GET /favorites/user/{userId}/stats
Authorization: Bearer <token>
```

---

#### 79. Agregar a Favoritos
```http
POST /favorites/add
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "user_id": 1,
  "song_id": 1,    // opcional
  "artist_id": 1   // opcional
}
```

---

#### 80. Agregar Múltiples Favoritos
```http
POST /favorites/add-bulk
Authorization: Bearer <token>
Content-Type: application/json
```

---

#### 81. Eliminar de Favoritos (por ID de recurso)
```http
DELETE /favorites/user/{userId}/remove?song_id=1
Authorization: Bearer <token>
```

---

#### 82. Eliminar Favorito (por ID)
```http
DELETE /favorites/{favoriteId}
Authorization: Bearer <token>
```

---

### 📤 Upload - `/upload`

#### 83. Subir Avatar
```http
POST /upload/avatar/{userId}
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `avatar`: File (imagen)

---

#### 84. Actualizar Avatar
```http
PUT /upload/avatar/{userId}
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

---

#### 85. Eliminar Avatar
```http
DELETE /upload/avatar/{userId}
Authorization: Bearer <token>
```

---

#### 86. Subir Portada de Álbum
```http
POST /upload/album-cover/{albumId}
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

---

#### 87. Subir Imagen de Artista
```http
POST /upload/artist-image/{artistId}
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

---

#### 88. Subir Audio de Canción
```http
POST /upload/song/{songId}
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `audio_file`: File (mp3, wav, flac)

**Respuesta éxito:**
```json
{
  "success": true,
  "url": "https://supabase...",
  "metadata": {
    "duration": 180,
    "bitrate": 320,
    "format": "mp3"
  }
}
```

---

#### 89. Eliminar Archivo
```http
DELETE /upload/file?bucket=songs&path=song-1/track.mp3
Authorization: Bearer <token>
```

---

### 🔔 Notificaciones - `/notifications`

#### 90. Obtener Notificaciones
```http
GET /notifications/user/{userId}?type=info&is_read=false&limit=20
Authorization: Bearer <token>
```

---

#### 91. Notificaciones No Leídas
```http
GET /notifications/user/{userId}/unread
Authorization: Bearer <token>
```

---

#### 92. Contador de No Leídas
```http
GET /notifications/user/{userId}/count
Authorization: Bearer <token>
```

---

#### 93. Crear Notificación
```http
POST /notifications/create
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "user_id": 1,
  "type": "info",      // info, success, warning, error
  "title": "Nuevo álbum",
  "message": "Tu artista favorito lanzó un álbum",
  "priority": "medium"   // low, medium, high
}
```

---

#### 94. Crear Notificaciones Masivas (Admin)
```http
POST /notifications/create-bulk
Authorization: Bearer <token>
```

---

#### 95. Marcar como Leída
```http
PUT /notifications/{id}/read
Authorization: Bearer <token>
```

---

#### 96. Marcar Todas como Leídas
```http
PUT /notifications/user/{userId}/read-all
Authorization: Bearer <token>
```

---

#### 97. Eliminar Notificación
```http
DELETE /notifications/{id}
Authorization: Bearer <token>
```

---

#### 98. Eliminar Leídas
```http
DELETE /notifications/user/{userId}/read
Authorization: Bearer <token>
```

---

#### 99. Eliminar Notificaciones Antiguas
```http
DELETE /notifications/user/{userId}/old
Authorization: Bearer <token>
```

---

### 🎼 Compositores - `/composer`

#### 100. Listar Compositores
```http
GET /composer/all
Authorization: Bearer <token>
```

---

#### 101. Buscar Compositores
```http
GET /composer/search?q=john
Authorization: Bearer <token>
```

---

#### 102. Obtener Compositor por ID
```http
GET /composer/{id}
Authorization: Bearer <token>
```

---

#### 103. Crear Compositor
```http
POST /composer/create
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "name": "John Williams",
  "biography": "Compositor estadounidense...",
  "website": "https://johnwilliams.com",
  "image": "https://..."
}
```

---

#### 104. Actualizar Compositor
```http
PUT /composer/update/{id}
Authorization: Bearer <token>
```

---

#### 105. Eliminar Compositor
```http
DELETE /composer/delete/{id}
Authorization: Bearer <token>
```

---

#### 106. Compositores de una Canción
```http
GET /composer/song/{songId}
Authorization: Bearer <token>
```

---

#### 107. Asignar Compositor a Canción
```http
POST /composer/song/{songId}/assign
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "composer_id": 1,
  "role": "principal"  // principal, colaborador, arreglista
}
```

---

#### 108. Actualizar Relación
```http
PUT /composer/song/{songId}/composer/{composerId}
Authorization: Bearer <token>
```

---

#### 109. Desasignar Compositor
```http
DELETE /composer/song/{songId}/composer/{composerId}
Authorization: Bearer <token>
```

---

### 📜 Aceptaciones Legales - `/legal-acceptance`

#### 110. Listar Aceptaciones
```http
GET /legal-acceptance/all
Authorization: Bearer <token>
```

---

#### 111. Obtener Aceptación por ID
```http
GET /legal-acceptance/by-id/{id}
Authorization: Bearer <token>
```

---

#### 112. Crear Aceptación (Usuario acepta documento)
```http
POST /legal-acceptance/create
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "userId": 1,
  "legalDocumentId": 1
}
```

**Respuesta éxito (201):**
```json
{
  "id": 1,
  "userId": 1,
  "legalDocumentId": 1,
  "acceptedAt": "2026-04-14T...",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

---

#### 113. Eliminar Aceptación
```http
DELETE /legal-acceptance/delete/{id}
Authorization: Bearer <token>
```

---

#### 114. Aceptaciones de Usuario
```http
GET /legal-acceptance/user/{userId}
Authorization: Bearer <token>
```

---

#### 115. Verificar Aceptación Específica
```http
GET /legal-acceptance/check/{userId}/{documentId}
Authorization: Bearer <token>
```

**Respuesta:**
```json
{
  "accepted": true,
  "acceptedAt": "2026-04-14T..."
}
```

---

#### 116. Estadísticas de Aceptaciones
```http
GET /legal-acceptance/stats/dashboard
Authorization: Bearer <token>
```

---

## 🔧 Guía Rápida para Frontend

### Configuración Base
```javascript
const API_BASE_URL = 'https://bitu-api.onrender.com/api';

// Configurar axios/fetch
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Manejo de Errores Comunes
```javascript
// Errores HTTP frecuentes
400 - Bad Request: Datos inválidos
401 - Unauthorized: Token inválido o expirado
403 - Forbidden: No tienes permisos
404 - Not Found: Recurso no existe
409 - Conflict: Conflicto (ej: email duplicado)
422 - Unprocessable: Validación falló
500 - Server Error: Error interno del servidor
```

### Ejemplo Completo: Login + Uso
```javascript
// 1. Login
async function login(email, password) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// 2. Uso de API protegida
async function getSongs() {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}/song/all`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
}
```

### Subida de Archivos
```javascript
async function uploadAvatar(userId, file) {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await fetch(
    `${API_BASE_URL}/upload/avatar/${userId}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
        // NO incluir Content-Type, fetch lo pone automáticamente con boundary
      },
      body: formData
    }
  );
  
  return await response.json();
}
```

---

## 📊 Códigos de Estado HTTP

| Código | Significado | Cuándo ocurre |
|--------|-------------|---------------|
| 200 | OK | Éxito en GET, PUT, DELETE |
| 201 | Created | Recurso creado exitosamente |
| 204 | No Content | Eliminación exitosa sin body |
| 400 | Bad Request | Datos enviados incorrectos |
| 401 | Unauthorized | Token inválido o faltante |
| 403 | Forbidden | Sin permisos suficientes |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Conflicto de datos (duplicado) |
| 422 | Unprocessable | Validación falló |
| 500 | Server Error | Error interno |

---

## 📝 Notas Importantes

1. **Paginación**: La mayoría de endpoints de listado soportan `limit` y `offset`
2. **Filtros**: Usa query params para filtrar resultados
3. **Uploads**: Para archivos usa `multipart/form-data`, no JSON
4. **Token**: Se obtiene en login/register y expira (configurable en .env)
5. **Refresh**: Si el token expira, redirige al login
6. **WebSocket**: Para notificaciones en tiempo real (si está implementado)

---

## 📚 Documentación Swagger

Para probar endpoints interactivamente:
```
https://bitu-api.onrender.com/api-docs
```

---

*Generado automáticamente el 2026-04-14*
