// BITU API Client - Servicios para 112 endpoints
// Basado en API_ROUTES_REPORT.md

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// ============================================
// CLIENTE HTTP
// ============================================

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
  }

  getToken() {
    try {
      const authData = localStorage.getItem('auth-storage')
      console.log('Auth data from localStorage:', authData ? '[PRESENT]' : '[MISSING]')
      if (authData) {
        const parsed = JSON.parse(authData)
        console.log('Parsed auth data:', parsed)
        // Zustand persist structure: {state: {user: userData, isAuthenticated: boolean}}
        const token = parsed.state?.user?.token || null
        console.log('Token extracted:', token ? '[PRESENT]' : '[MISSING]')
        return token
      }
    } catch (e) {
      console.error('Error parsing auth token:', e)
    }
    return null
  }

  getHeaders(contentType = 'application/json') {
    const headers = {}
    if (contentType) {
      headers['Content-Type'] = contentType
    }
    const token = this.getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const headers = {
      ...this.getHeaders(),
      ...options.headers,
    }
    
    // Debug logging
    console.log('API Request:', {
      method: options.method || 'GET',
      url,
      headers: {
        ...headers,
        Authorization: headers.Authorization ? '[REDACTED]' : 'MISSING'
      }
    })
    
    const config = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.message || `HTTP Error: ${response.status}`,
          response.status,
          errorData
        )
      }

      if (response.status === 204) {
        return null
      }

      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(
        error.message || 'Error de conexión con el servidor',
        0,
        { originalError: error }
      )
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' })
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' })
  }

  upload(endpoint, formData) {
    return this.request(endpoint, {
      method: 'POST',
      body: formData,
      headers: {},
    })
  }
}

class ApiError extends Error {
  constructor(message, status, data = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export const api = new ApiClient()
export { ApiError, API_BASE_URL }

// ============================================
// SERVICIOS
// ============================================

// AUTH - Rutas públicas
export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
  me: () => api.get('/auth/me'),
}

// USUARIOS - rutas que funcionan
export const userService = {
  getAll: () => api.get('/users'),           // GET /users funciona
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/auth/register', data),  // Crear vía auth/register
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getProfile: (id) => api.get(`/users/profile/${id}`),
  updateProfile: (id, data) => api.put(`/users/profile/${id}`, data),
  deleteProfile: (id) => api.delete(`/users/profile/${id}`),
}

// CANCIONES - /song
export const songService = {
  getAll: () => api.get('/song/all'),
  getById: (id) => api.get(`/song/get/${id}`),
  getByAlbum: (albumId) => api.get(`/song/album/${albumId}`),
  create: (data) => api.post('/song/create', data),
  update: (id, data) => api.put(`/song/update/${id}`, data),
  delete: (id) => api.delete(`/song/delete/${id}`),
}

// ÁLBUMES - /album
export const albumService = {
  getAll: () => api.get('/album/all'),
  getById: (id) => api.get(`/album/${id}`),
  create: (data) => api.post('/album/create', data),
  update: (id, data) => api.put(`/album/update/${id}`, data),
  delete: (id) => api.delete(`/album/delete/${id}`),
  updateStatus: (id, status) => api.put(`/album/update-status/${id}`, { status }),
}

// TICKETS - /tickets
export const ticketService = {
  // CRUD de tickets
  getAll: (params = {}) => api.get('/tickets/all', { params }),
  getById: (id) => api.get(`/tickets/by-id/${id}`),
  create: (data) => api.post('/tickets/create', data),
  update: (id, data) => api.put(`/tickets/update/${id}`, data),
  delete: (id) => api.delete(`/tickets/delete/${id}`),
  
  // Búsqueda
  search: (query, params = {}) => api.get('/tickets/search', { params: { q: query, ...params } }),
  
  // Estado y asignación
  updateStatus: (id, status) => api.put(`/tickets/update-status/${id}`, { status }),
  assignTicket: (id, assignedTo) => api.put(`/tickets/assign/${id}`, { assigned_to: assignedTo }),
  
  // Agentes de soporte
  getSupportAgents: () => api.get('/tickets/support-agents'),
  
  // Mensajes
  addMessage: (ticketId, message, userId, messageType = 'text', isInternal = false) => 
    api.post(`/tickets/add-message/${ticketId}`, { 
      user_id: userId, 
      message, 
      message_type: messageType, 
      is_internal: isInternal 
    }),
  updateMessage: (messageId, message) => api.put(`/tickets/update-message/${messageId}`, { message }),
  deleteMessage: (messageId) => api.delete(`/tickets/delete-message/${messageId}`),
  
  // Categorías
  getCategories: () => api.get('/tickets/categories/all'),
  createCategory: (data) => api.post('/tickets/categories/create', data),
  updateCategory: (id, data) => api.put(`/tickets/categories/update/${id}`, data),
  deleteCategory: (id) => api.delete(`/tickets/categories/delete/${id}`),
  
  // Estadísticas
  getStats: (params = {}) => api.get('/tickets/stats/dashboard', { params }),
}

// GÉNEROS DE ÁLBUM - /album/genres
export const albumGenreService = {
  getAll: () => api.get('/album/genres/all'),
  getById: (id) => api.get(`/album/genres/${id}`),
  create: (data) => api.post('/album/genres/create', data),
  update: (id, data) => api.put(`/album/genres/update/${id}`, data),
  delete: (id) => api.delete(`/album/genres/delete/${id}`),
}

// ARTISTAS - /artist (usando rutas admin para gestión completa)
export const artistService = {
  getAll: () => api.get('/artist/admin/all'),
  getById: (id) => api.get(`/artist/admin/${id}`),
  create: (data) => api.post('/artist/create', data),
  update: (id, data) => api.put(`/artist/admin/update/${id}`, data),
  delete: (id) => api.delete(`/artist/admin/delete/${id}`),
}

// MIEMBROS DE ARTISTA - /artist/members
export const artistMemberService = {
  getAll: () => api.get('/artist/members/all'),
  create: (data) => api.post('/artist/members/create', data),
  update: (id, data) => api.put(`/artist/members/update/${id}`, data),
  delete: (id) => api.delete(`/artist/members/delete/${id}`),
}

// PLAYLISTS - /playlist
export const playlistService = {
  getAll: () => api.get('/playlist/all'),
  search: (q) => api.get(`/playlist/search?q=${encodeURIComponent(q)}`),
  getByUser: (userId) => api.get(`/playlist/user/${userId}`),
  getById: (id) => api.get(`/playlist/${id}`),
  create: (data) => api.post('/playlist/create', data),
  update: (id, data) => api.put(`/playlist/update/${id}`, data),
  delete: (id) => api.delete(`/playlist/delete/${id}`),
  // Canciones en playlist
  addSong: (playlistId, songId) => api.post(`/playlist/${playlistId}/songs`, { songId }),
  removeSong: (playlistId, songId) => api.delete(`/playlist/${playlistId}/songs/${songId}`),
  reorderSongs: (playlistId, songIds) => api.put(`/playlist/${playlistId}/reorder`, { song_ids: songIds }),
}


// COMENTARIOS - /comments
export const commentService = {
  getBySong: (songId) => api.get(`/comments/song?song_id=${songId}`),
  getByAlbum: (albumId) => api.get(`/comments/album/${albumId}`),
  create: (data) => api.post('/comments/create', data),
  update: (id, data) => api.put(`/comments/update/${id}`, data),
  delete: (id) => api.delete(`/comments/${id}`),
  moderate: (id, status) => api.put(`/comments/${id}/moderate`, { status }),
  getFlagged: () => api.get('/comments/moderation/flagged'),
  getStats: () => api.get('/comments/stats/count'),
}

// STREAMING - /stream
export const streamService = {
  getStream: (songId) => api.get(`/stream/${songId}`),
  getInfo: (songId) => api.get(`/stream/${songId}/info`),
  preload: (songId, size = 256000) => api.get(`/stream/${songId}/preload?size=${size}`),
  getStreamUrl: (songId) => `${API_BASE_URL}/stream/${songId}`,
}

// BÚSQUEDA - /search (público)
export const searchService = {
  search: (q, type = 'all', params = {}) => {
    const qs = new URLSearchParams({ q, type, ...params }).toString()
    return api.get(`/search?${qs}`)
  },
  advanced: (params) => {
    const qs = new URLSearchParams(params).toString()
    return api.get(`/search/advanced?${qs}`)
  },
  suggestions: (q, limit = 5) => api.get(`/search/suggestions?q=${encodeURIComponent(q)}&limit=${limit}`),
}

// FAVORITOS - /favorites
export const favoriteService = {
  getByUser: (userId, type = 'all') => api.get(`/favorites/user/${userId}?type=${type}`),
  check: (userId, resourceId, resourceType) => api.get(`/favorites/user/${userId}/check?${resourceType}_id=${resourceId}`),
  getStats: (userId) => api.get(`/favorites/user/${userId}/stats`),
  add: (data) => api.post('/favorites/add', data),
  addBulk: (data) => api.post('/favorites/add-bulk', data),
  remove: (userId, resourceId, resourceType) => api.delete(`/favorites/user/${userId}/remove?${resourceType}_id=${resourceId}`),
  removeById: (favoriteId) => api.delete(`/favorites/${favoriteId}`),
}

// UPLOAD - /upload
export const uploadService = {
  uploadAvatar: async (userId, file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    
    const token = api.getToken()
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/upload/avatar/${userId}`,
        formData,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            // Axios maneja Content-Type automáticamente para FormData
          },
          // Para debugging
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            console.log(`Upload progress: ${percentCompleted}%`)
          }
        }
      )
      
      console.log('Axios upload success:', response.data)
      return response.data
      
    } catch (error) {
      console.error('Axios upload error details:')
      console.error('  Status:', error.response?.status)
      console.error('  Status Text:', error.response?.statusText)
      console.error('  Response data:', error.response?.data)
      console.error('  Request headers:', error.config?.headers)
      console.error('  File info:', {
        name: file?.name,
        type: file?.type,
        size: file?.size
      })
      
      // Lanzar error con más contexto
      throw {
        status: error.response?.status,
        message: error.response?.data?.error || error.response?.data?.details || error.message,
        data: error.response?.data,
        fullError: error
      }
    }
  },
  updateAvatar: (userId, file) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.request(`/upload/avatar/${userId}`, {
      method: 'PUT',
      body: formData,
      headers: {},
    })
  },
  deleteAvatar: (userId) => api.delete(`/upload/avatar/${userId}`),
  uploadAlbumCover: (albumId, file) => {
    const formData = new FormData()
    return api.upload(`/upload/album-cover/${albumId}`, formData)
  },
  
  uploadArtistImage: async (artistId, file) => {
    const formData = new FormData()
    formData.append('artist_image', file)
    
    const token = api.getToken()
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/upload/artist-image/${artistId}`,
        formData,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            console.log(`Artist image upload progress: ${percentCompleted}%`)
          }
        }
      )
      
      console.log('Artist image upload success:', response.data)
      return response.data
      
    } catch (error) {
      console.error('Artist image upload error details:')
      console.error('  Status:', error.response?.status)
      console.error('  Response data:', error.response?.data)
      console.error('  File info:', {
        name: file?.name,
        type: file?.type,
        size: file?.size
      })
      
      throw {
        status: error.response?.status,
        message: error.response?.data?.error || error.response?.data?.details || error.message,
        data: error.response?.data,
        fullError: error
      }
    }
  },
  
  uploadArtistImage: async (artistId, file) => {
    const formData = new FormData()
    formData.append('artist_image', file)
    
    const token = api.getToken()
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/upload/artist-image/${artistId}`,
        formData,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            console.log(`Artist image upload progress: ${percentCompleted}%`)
          }
        }
      )
      
      console.log('Artist image upload success:', response.data)
      return response.data
      
    } catch (error) {
      console.error('Artist image upload error details:')
      console.error('  Status:', error.response?.status)
      console.error('  Response data:', error.response?.data)
      console.error('  File info:', {
        name: file?.name,
        type: file?.type,
        size: file?.size
      })
      
      throw {
        status: error.response?.status,
        message: error.response?.data?.error || error.response?.data?.details || error.message,
        data: error.response?.data,
        fullError: error
      }
    }
  },
  uploadArtistImage: async (artistId, file) => {
    const formData = new FormData()
    formData.append('artist_image', file)
    
    const token = api.getToken()
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/upload/artist-image/${artistId}`,
        formData,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            console.log(`Artist image upload progress: ${percentCompleted}%`)
          }
        }
      )
      
      console.log('Artist image upload success:', response.data)
      return response.data
      
    } catch (error) {
      console.error('Artist image upload error details:')
      console.error('  Status:', error.response?.status)
      console.error('  Response data:', error.response?.data)
      console.error('  File info:', {
        name: file?.name,
        type: file?.type,
        size: file?.size
      })
      
      throw {
        status: error.response?.status,
        message: error.response?.data?.error || error.response?.data?.details || error.message,
        data: error.response?.data,
        fullError: error
      }
    }
  },
  uploadSong: (songId, file) => {
    const formData = new FormData()
    formData.append('audio_file', file)
    return api.upload(`/upload/song/${songId}`, formData)
  },
  uploadAlbumCover: async (albumId, file) => {
    const formData = new FormData()
    formData.append('cover_image', file)

    const token = api.getToken()

    try {
      const response = await axios.post(
        `${API_BASE_URL}/upload/album-cover/${albumId}`,
        formData,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            console.log(`Album cover upload progress: ${percentCompleted}%`)
          }
        }
      )

      console.log('Album cover upload success:', response.data)
      return response.data

    } catch (error) {
      console.error('Album cover upload error details:')
      console.error('  Status:', error.response?.status)
      console.error('  Response data:', error.response?.data)
      console.error('  File info:', {
        name: file?.name,
        type: file?.type,
        size: file?.size
      })

      throw {
        status: error.response?.status,
        message: error.response?.data?.error || error.response?.data?.details || error.message,
        data: error.response?.data,
        fullError: error
      }
    }
  },
  deleteFile: (bucket, path) => api.delete(`/upload/file?bucket=${bucket}&path=${path}`),
}

// NOTIFICACIONES - /notifications
export const notificationService = {
  getByUser: (userId, params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return api.get(`/notifications/user/${userId}${qs ? '?' + qs : ''}`)
  },
  getUnread: (userId) => api.get(`/notifications/user/${userId}/unread`),
  getCount: (userId) => api.get(`/notifications/user/${userId}/count`),
  create: (data) => api.post('/notifications/create', data),
  createBulk: (data) => api.post('/notifications/create-bulk', data),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: (userId) => api.put(`/notifications/user/${userId}/read-all`),
  delete: (id) => api.delete(`/notifications/${id}`),
  deleteRead: (userId) => api.delete(`/notifications/user/${userId}/read`),
  deleteOld: (userId) => api.delete(`/notifications/user/${userId}/old`),
  }

// COMPOSITORES - /composer
export const composerService = {
  getAll: () => api.get('/composer/all'),
  search: (q) => api.get(`/composer/search?q=${encodeURIComponent(q)}`),
  getById: (id) => api.get(`/composer/${id}`),
  create: (data) => api.post('/composer/create', data),
  update: (id, data) => api.put(`/composer/update/${id}`, data),
  delete: (id) => api.delete(`/composer/delete/${id}`),
  // Relación con canciones
  getBySong: (songId) => api.get(`/composer/song/${songId}`),
  assignToSong: (songId, composerId, role = 'principal') => 
    api.post(`/composer/song/${songId}/assign`, { composer_id: composerId, role }),
  updateAssignment: (songId, composerId, data) => 
    api.put(`/composer/song/${songId}/composer/${composerId}`, data),
  unassignFromSong: (songId, composerId) => 
    api.delete(`/composer/song/${songId}/composer/${composerId}`),
}

// ACEPTACIONES LEGALES - /legal-acceptance
export const legalAcceptanceService = {
  getAll: () => api.get('/legal-acceptance/all'),
  getById: (id) => api.get(`/legal-acceptance/by-id/${id}`),
  create: (userId, legalDocumentId) => 
    api.post('/legal-acceptance/create', { userId, legalDocumentId }),
  delete: (id) => api.delete(`/legal-acceptance/delete/${id}`),
  getByUser: (userId) => api.get(`/legal-acceptance/user/${userId}`),
  check: (userId, documentId) => api.get(`/legal-acceptance/check/${userId}/${documentId}`),
  getStats: () => api.get('/legal-acceptance/stats/dashboard'),
}
