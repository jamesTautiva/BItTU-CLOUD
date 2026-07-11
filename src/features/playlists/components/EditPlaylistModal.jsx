import { useState, useEffect, useRef } from 'react'
import { useThemeStore } from '../../../app/store'
import { X, ListMusic, Type, FileText, Globe, Lock, Save, Loader2, Music, Disc, Trash2, Upload, Image as ImageIcon } from 'lucide-react'
import { playlistService } from '../../../services/api'

function EditPlaylistModal({ isOpen, onClose, playlist, onSave, mode = 'create' }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_public: true,
    img_playlist_url: null
  })
  const [saving, setSaving] = useState(false)
  const [loadingSongs, setLoadingSongs] = useState(false)
  const [playlistSongs, setPlaylistSongs] = useState([])
  const [removingSongId, setRemovingSongId] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (playlist && mode === 'edit') {
      setFormData({
        name: playlist.name || '',
        description: playlist.description || '',
        is_public: playlist.is_public !== undefined ? playlist.is_public : true,
        img_playlist_url: playlist.img_playlist_url || null
      })
      loadPlaylistSongs()
    } else {
      setFormData({
        name: '',
        description: '',
        is_public: true,
        img_playlist_url: null
      })
      setPlaylistSongs([])
    }
  }, [playlist, mode, isOpen])

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const loadPlaylistSongs = async () => {
    if (!playlist?.id || mode !== 'edit') return
    
    console.log('Loading songs for playlist ID:', playlist.id)
    setLoadingSongs(true)
    try {
      const playlistData = await playlistService.getById(playlist.id)
      console.log('Playlist data received:', playlistData)
      console.log('Songs in playlist:', playlistData.songs)
      setPlaylistSongs(playlistData.songs || [])
    } catch (err) {
      console.error('Error loading playlist songs:', err)
      console.error('Error details:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        data: err.response?.data
      })
    } finally {
      setLoadingSongs(false)
    }
  }

  const handleRemoveSong = async (songId) => {
    if (!playlist?.id) return
    
    console.log('Removing song:', songId, 'from playlist:', playlist.id)
    setRemovingSongId(songId)
    try {
      await playlistService.removeSong(playlist.id, songId)
      console.log('Song removed successfully')
      // Reload songs
      console.log('Reloading playlist songs...')
      await loadPlaylistSongs()
      console.log('Playlist songs reloaded')
    } catch (err) {
      console.error('Error removing song:', err)
      console.error('Error details:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        data: err.response?.data
      })
    } finally {
      setRemovingSongId(null)
    }
  }

  const handleImageUpload = async (file) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten imágenes (JPEG, PNG, GIF, WebP)')
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      alert('La imagen no puede ser mayor a 5MB')
      return
    }

    // Store the file for upload when form is submitted
    setUploadedFile(file)
    console.log('📁 Imagen seleccionada para subir:', file.name)
    
    // Show preview immediately
    const reader = new FileReader()
    reader.onload = (e) => {
      console.log('🖼️ Vista previa de imagen cargada')
      setFormData(prev => ({
        ...prev,
        img_playlist_url: e.target.result
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('El nombre de la playlist es obligatorio')
      return
    }

    setSaving(true)
    try {
      if (mode === 'create') {
        // PASO 1: Crear playlist solo con información básica
        const playlistData = {
          name: formData.name,
          description: formData.description,
          is_public: formData.is_public,
          user_id: 18 // Current user ID
        }
        
        const newPlaylist = await playlistService.create(playlistData)
        console.log('Playlist creada:', newPlaylist)
        
        // PASO 2: Subir imagen si existe (después de crear la playlist)
        if (uploadedFile) {
          console.log('Subiendo imagen para playlist ID:', newPlaylist.id)
          alert('Playlist creada exitosamente. Subiendo imagen...')
          await uploadPlaylistImage(newPlaylist.id, uploadedFile)
          alert('¡Playlist completa con imagen!')
        } else {
          alert('¡Playlist creada exitosamente!')
        }
        
        onSave(newPlaylist)
      } else {
        // Para edición: enviar solo los campos básicos, sin imagen temporal
        const updateData = {
          name: formData.name,
          description: formData.description,
          is_public: formData.is_public
        }
        
        await onSave(updateData)
        
        // Subir imagen si se cambió
        if (uploadedFile && playlist?.id) {
          console.log('Actualizando imagen para playlist ID:', playlist.id)
          await uploadPlaylistImage(playlist.id, uploadedFile)
        }
      }
    } catch (err) {
      console.error('Error guardando playlist:', err)
      alert('Error al guardar la playlist. Por favor intenta nuevamente.')
    } finally {
      setSaving(false)
    }
  }

  // Función separada para subir imagen
  const uploadPlaylistImage = async (playlistId, file) => {
    try {
      setUploadingImage(true)
      
      // Verificar si tenemos un token válido
      const authData = localStorage.getItem('auth-storage')
      if (!authData) {
        throw new Error('No hay sesión activa. Por favor inicia sesión.')
      }
      
      const parsed = JSON.parse(authData)
      const token = parsed.state?.user?.token // Use correct path like api.js
      if (!token) {
        console.log('Auth data structure:', parsed)
        console.log('Available keys:', Object.keys(parsed))
        if (parsed.state) console.log('State keys:', Object.keys(parsed.state))
        throw new Error('No hay token de autenticación. Por favor inicia sesión nuevamente.')
      }
      
      const imageFormData = new FormData()
      imageFormData.append('playlist_image', file)
      
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
      const response = await fetch(`${API_BASE_URL}/upload/playlist-image/${playlistId}`, {
        method: 'POST',
        body: imageFormData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 401) {
          throw new Error('Tu sesión ha expirado. Por favor inicia sesión nuevamente.')
        } else {
          throw new Error(errorData.error || 'Error al subir imagen')
        }
      }
      
      const result = await response.json()
      console.log('✅ Imagen subida exitosamente:', result)
      
      // Actualizar estado con la nueva URL
      setFormData(prev => ({
        ...prev,
        img_playlist_url: result.url
      }))
      
      // Si es modo edición, actualizar playlist existente
      if (mode === 'edit' && playlist) {
        playlist.img_playlist_url = result.url
      }
      
      return result.url
    } catch (error) {
      console.error('❌ Error subiendo imagen:', error)
      alert('Error al subir la imagen: ' + error.message)
      throw error
    } finally {
      setUploadingImage(false)
    }
  }

  const formatDuration = (duration) => {
    if (!duration) return '--:--'
    
    // If duration is in seconds
    if (typeof duration === 'number') {
      const minutes = Math.floor(duration / 60)
      const seconds = Math.floor(duration % 60)
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
    
    // If duration is already formatted (MM:SS)
    if (typeof duration === 'string' && duration.includes(':')) {
      return duration
    }
    
    return '--:--'
  }

  if (!isOpen) return null

  const isEdit = mode === 'edit'

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: isDark ? '#1f2937' : '#fff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '85vh',
        overflow: 'auto',
        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ListMusic size={24} color="#dc2626" />
            <h2 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 600,
              color: isDark ? '#fff' : '#111'
            }}>
              {isEdit ? 'Editar Playlist' : 'Nueva Playlist'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: isDark ? '#374151' : '#e5e7eb',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? '#4b5563' : '#d1d5db'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDark ? '#374151' : '#e5e7eb'
            }}
          >
            <X size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '8px',
              color: isDark ? '#d1d5db' : '#374151'
            }}>
              Nombre <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <Type size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: isDark ? '#6b7280' : '#9ca3af'
              }} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nombre de la playlist"
                required
                maxLength={255}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  background: isDark ? '#111827' : '#fff',
                  border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                  borderRadius: '8px',
                  color: isDark ? '#fff' : '#111',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '8px',
              color: isDark ? '#d1d5db' : '#374151'
            }}>
              Descripción
            </label>
            <div style={{ position: 'relative' }}>
              <FileText size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '12px',
                color: isDark ? '#6b7280' : '#9ca3af'
              }} />
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Descripción opcional de la playlist"
                maxLength={1000}
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  background: isDark ? '#111827' : '#fff',
                  border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                  borderRadius: '8px',
                  color: isDark ? '#fff' : '#111',
                  fontSize: '14px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
              />
            </div>
            <p style={{
              fontSize: '12px',
              color: isDark ? '#6b7280' : '#9ca3af',
              margin: '4px 0 0 0',
              textAlign: 'right'
            }}>
              {formData.description?.length || 0}/1000
            </p>
          </div>

          {/* Playlist Image */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '8px',
              color: isDark ? '#d1d5db' : '#374151'
            }}>
              Imagen de la playlist
            </label>
            <div style={{ position: 'relative' }}>
              <FileText size={18} style={{
                position: 'absolute',
                left: '12px',
                top: '12px',
                color: isDark ? '#6b7280' : '#9ca3af'
              }} />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={(e) => {
                  const file = e.target.files[0]
                  if (file) handleImageUpload(file)
                }}
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 40px',
                  background: isDark ? '#111827' : '#fff',
                  border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                  borderRadius: '8px',
                  color: isDark ? '#fff' : '#111',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            {/* Image Preview */}
            {formData.img_playlist_url && (
              <div style={{
                marginTop: '12px',
                padding: '8px',
                background: isDark ? '#111827' : '#f3f4f6',
                borderRadius: '8px',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <img 
                    src={formData.img_playlist_url} 
                    alt="Playlist cover" 
                    style={{
                      width: '60px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{
                      margin: 0,
                      fontSize: '12px',
                      color: isDark ? '#9ca3af' : '#6b7280'
                    }}>
                      Imagen actual
                    </p>
                    <button
                      type="button"
                      onClick={handleImageClick}
                      disabled={uploadingImage}
                      style={{
                        padding: '4px 8px',
                        background: isDark ? '#dc2626' : '#ef4444',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '12px',
                        cursor: uploadingImage ? 'not-allowed' : 'pointer',
                        opacity: uploadingImage ? 0.7 : 1
                      }}
                    >
                      {uploadingImage ? 'Subiendo...' : 'Cambiar'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Upload Button */}
            {!formData.img_playlist_url && (
              <button
                type="button"
                onClick={handleImageClick}
                disabled={uploadingImage}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: uploadingImage ? '#9ca3af' : '#dc2626',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  cursor: uploadingImage ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: uploadingImage ? 0.7 : 1
                }}
              >
                <Upload size={18} />
                {uploadingImage ? 'Subiendo imagen...' : 'Subir imagen de playlist'}
              </button>
            )}
          </div>

          {/* Visibility */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '8px',
              color: isDark ? '#d1d5db' : '#374151'
            }}>
              Visibilidad
            </label>
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <button
                type="button"
                onClick={() => handleChange('is_public', true)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  background: formData.is_public ? '#dc262620' : isDark ? '#111827' : '#fff',
                  border: `2px solid ${formData.is_public ? '#dc2626' : isDark ? '#374151' : '#d1d5db'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: isDark ? '#fff' : '#111',
                  fontSize: '14px'
                }}
              >
                <Globe size={18} color={formData.is_public ? '#dc2626' : isDark ? '#9ca3af' : '#6b7280'} />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, fontWeight: 500 }}>Pública</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>
                    Todos pueden verla
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleChange('is_public', false)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  background: !formData.is_public ? '#6b728020' : isDark ? '#111827' : '#fff',
                  border: `2px solid ${!formData.is_public ? '#6b7280' : isDark ? '#374151' : '#d1d5db'}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: isDark ? '#fff' : '#111',
                  fontSize: '14px'
                }}
              >
                <Lock size={18} color={!formData.is_public ? '#6b7280' : isDark ? '#9ca3af' : '#6b7280'} />
                <div style={{ textAlign: 'left' }}>
                  <p style={{ margin: 0, fontWeight: 500 }}>Privada</p>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>
                    Solo tú puedes verla
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Songs Section - Only in Edit Mode */}
          {isEdit && (
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              background: isDark ? '#111827' : '#f9fafb',
              borderRadius: '8px',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: isDark ? '#fff' : '#111',
                margin: '0 0 12px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Music size={16} color="#dc2626" />
                Canciones en esta playlist ({playlistSongs.length})
              </h3>
              
              {loadingSongs ? (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  padding: '20px'
                }}>
                  <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} color={isDark ? '#9ca3af' : '#6b7280'} />
                </div>
              ) : playlistSongs.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: isDark ? '#9ca3af' : '#6b7280',
                  fontSize: '13px'
                }}>
                  No hay canciones en esta playlist.
                  <br />
                  Usa el botón + en la tabla para agregar canciones.
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  maxHeight: '250px',
                  overflow: 'auto'
                }}>
                  {playlistSongs.map((playlistSong, index) => {
                    const song = playlistSong.song || playlistSong
                    const songId = playlistSong.id // Use playlistSong.id for API call
                    const playlistSongId = playlistSong.id // Use playlistSong.id for key
                    return (
                      <div
                        key={playlistSongId || index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px 12px',
                          background: isDark ? '#1f2937' : '#fff',
                          borderRadius: '6px',
                          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
                        }}
                      >
                        <span style={{
                          fontSize: '12px',
                          color: isDark ? '#9ca3af' : '#6b7280',
                          minWidth: '20px'
                        }}>
                          {index + 1}.
                        </span>
                        {song.Album?.cover_image ? (
                          <img 
                            src={song.Album?.cover_image} 
                            alt="" 
                            style={{ width: '36px', height: '36px', borderRadius: '4px', objectFit: 'cover' }} 
                          />
                        ) : (
                          <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '4px', 
                            background: isDark ? '#374151' : '#e5e7eb', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}>
                            <Disc size={16} color={isDark ? '#6b7280' : '#9ca3af'} />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ 
                            margin: 0, 
                            fontSize: '13px', 
                            fontWeight: 500, 
                            color: isDark ? '#fff' : '#111', 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis' 
                          }}>
                            {song.title}
                          </p>
                          <p style={{ 
                            margin: '2px 0 0 0', 
                            fontSize: '11px', 
                            color: isDark ? '#9ca3af' : '#6b7280' 
                          }}>
                            {song.Artist?.name || 'Artista desconocido'} • {song.Album?.title || 'Álbum desconocido'}
                          </p>
                        </div>
                        <span style={{ 
                          fontSize: '11px', 
                          color: isDark ? '#9ca3af' : '#6b7280',
                          marginRight: '8px'
                        }}>
                          {song.duration ? formatDuration(song.duration) : '--:--'}
                        </span>
                        <button
                          onClick={() => handleRemoveSong(songId)}
                          disabled={removingSongId === songId}
                          style={{
                            padding: '4px',
                            background: '#ef4444',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: removingSongId === songId ? 'not-allowed' : 'pointer',
                            opacity: removingSongId === songId ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Eliminar canción"
                        >
                          {removingSongId === songId ? (
                            <Loader2 size={12} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
                          ) : (
                            <Trash2 size={12} color="#fff" />
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '20px',
            borderTop: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                borderRadius: '8px',
                color: isDark ? '#d1d5db' : '#374151',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || uploadingImage}
              style={{
                padding: '10px 20px',
                background: '#dc2626',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 500,
                cursor: (saving || uploadingImage) ? 'not-allowed' : 'pointer',
                opacity: (saving || uploadingImage) ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {saving || uploadingImage ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
              {uploadingImage ? 'Subiendo imagen...' : (isEdit ? 'Guardar Cambios' : 'Crear Playlist')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditPlaylistModal
