import { useState, useEffect } from 'react'
import { useThemeStore } from '../../../app/store'
import { artistService, albumService, songService, artistMemberService, uploadService } from '../../../services/api'
import { X, User, Disc, Music, Users, Save, Loader2, Upload } from 'lucide-react'

function EditArtistModal({ isOpen, onClose, artist, onSave }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [activeTab, setActiveTab] = useState('info')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Artist data
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    artist_image: '',
    status: 'pending'
  })
  
  // Image upload
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  
  // Related data
  const [albums, setAlbums] = useState([])
  const [songs, setSongs] = useState([])
  const [members, setMembers] = useState([])

  useEffect(() => {
    if (artist && isOpen) {
      setFormData({
        name: artist.name || '',
        bio: artist.bio || '',
        artist_image: artist.artist_image || '',
        status: artist.status || 'pending'
      })
      setImagePreview(artist.artist_image || null)
      setImageFile(null)
      loadRelatedData()
    }
  }, [artist, isOpen])

  const loadRelatedData = async () => {
    if (!artist?.id) return
    
    setLoading(true)
    try {
      // Load albums for this artist
      const allAlbums = await albumService.getAll()
      console.log('All albums:', allAlbums)
      console.log('Artist ID:', artist.id)
      console.log('Sample album:', allAlbums[0])
      
      // Intentar ambos formatos de campo
      const artistAlbums = allAlbums.filter(album => {
        const albumArtistId = album.artist_id || album.artistId
        return albumArtistId === artist.id || albumArtistId === String(artist.id)
      })
      console.log('Filtered albums for artist:', artistAlbums)
      setAlbums(artistAlbums)
      
      // Load songs for this artist (a través de los álbumes)
      const allSongs = await songService.getAll()
      console.log('All songs:', allSongs)
      console.log('Sample song:', allSongs[0])
      
      // Obtener IDs de álbumes del artista
      const artistAlbumIds = artistAlbums.map(album => album.id || album.Id)
      console.log('Artist album IDs:', artistAlbumIds)
      
      // Filtrar canciones que pertenezcan a los álbumes del artista
      const artistSongs = allSongs.filter(song => {
        const songAlbumId = song.album_id || song.albumId
        return artistAlbumIds.includes(songAlbumId) || artistAlbumIds.includes(String(songAlbumId))
      })
      console.log('Filtered songs for artist:', artistSongs)
      setSongs(artistSongs)
      
      // Load members
      const allMembers = await artistMemberService.getAll()
      const artistMembers = allMembers.filter(member => {
        const memberArtistId = member.artist_id || member.artistId
        return memberArtistId === artist.id || memberArtistId === String(artist.id)
      })
      console.log('Filtered members for artist:', artistMembers)
      setMembers(artistMembers)
    } catch (err) {
      console.error('Error loading related data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Si hay nueva imagen, subirla primero
      let updatedData = { ...formData }
      
      if (imageFile && artist?.id) {
        setUploadingImage(true)
        try {
          const uploadRes = await uploadService.uploadArtistImage(artist.id, imageFile)
          console.log('Artist image uploaded:', uploadRes)
          
          // La respuesta puede contener la URL en diferentes propiedades
          const imageUrl = uploadRes.url || uploadRes.data?.url || uploadRes.image_url
          if (imageUrl) {
            updatedData.artist_image = imageUrl
          }
        } catch (uploadErr) {
          console.error('Error uploading artist image:', uploadErr)
          alert('Error al subir imagen: ' + (uploadErr.message || 'Error desconocido'))
        } finally {
          setUploadingImage(false)
        }
      }
      
      await artistService.update(artist.id, updatedData)
      onSave()
      onClose()
    } catch (err) {
      console.error('Error updating artist:', err)
      alert('Error al actualizar artista: ' + (err.message || 'Error desconocido'))
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen || !artist) return null

  const tabs = [
    { id: 'info', label: 'Información', icon: User },
    { id: 'albums', label: 'Álbumes', icon: Disc },
    { id: 'songs', label: 'Canciones', icon: Music },
    { id: 'members', label: 'Miembros', icon: Users }
  ]

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '24px'
    }}>
      <div style={{
        background: isDark ? '#1f2937' : '#fff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
        }}>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 700,
              color: isDark ? '#fff' : '#111',
              margin: 0,
              marginBottom: '4px'
            }}>
              Editar Artista
            </h2>
            <p style={{
              fontSize: '14px',
              color: isDark ? '#9ca3af' : '#6b7280',
              margin: 0
            }}>
              {artist.name}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              color: isDark ? '#9ca3af' : '#6b7280'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
        }}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${isActive ? '#dc2626' : 'transparent'}`,
                  color: isActive ? '#dc2626' : (isDark ? '#9ca3af' : '#6b7280'),
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px'
        }}>
          {/* Tab: Información */}
          {activeTab === 'info' && (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '8px',
                  color: isDark ? '#d1d5db' : '#374151'
                }}>
                  Nombre del Artista *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: isDark ? '#111827' : '#fff',
                    border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                    borderRadius: '6px',
                    color: isDark ? '#fff' : '#111',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '8px',
                  color: isDark ? '#d1d5db' : '#374151'
                }}>
                  Biografía
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: isDark ? '#111827' : '#fff',
                    border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                    borderRadius: '6px',
                    color: isDark ? '#fff' : '#111',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '8px',
                  color: isDark ? '#d1d5db' : '#374151'
                }}>
                  Imagen del Artista
                </label>
                
                {/* Vista previa de la imagen */}
                {imagePreview && (
                  <div style={{ marginBottom: '12px' }}>
                    <img
                      src={imagePreview}
                      alt="Artist preview"
                      style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '8px',
                        objectFit: 'cover',
                        border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`
                      }}
                    />
                  </div>
                )}
                
                {/* Input de archivo */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    background: isDark ? '#374151' : '#f3f4f6',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: isDark ? '#fff' : '#374151',
                    fontSize: '14px',
                    fontWeight: 500,
                    transition: 'all 0.2s'
                  }}>
                    <Upload size={18} />
                    {imageFile ? 'Cambiar imagen' : 'Seleccionar imagen'}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  
                  {imageFile && (
                    <span style={{
                      fontSize: '13px',
                      color: isDark ? '#9ca3af' : '#6b7280'
                    }}>
                      {imageFile.name}
                    </span>
                  )}
                  
                  {uploadingImage && (
                    <span style={{
                      fontSize: '13px',
                      color: '#dc2626',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                      Subiendo...
                    </span>
                  )}
                </div>
                
                <p style={{
                  fontSize: '12px',
                  color: isDark ? '#6b7280' : '#9ca3af',
                  margin: '8px 0 0 0'
                }}>
                  Formatos: JPEG, PNG, WebP, GIF (max 10MB)
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '8px',
                  color: isDark ? '#d1d5db' : '#374151'
                }}>
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: isDark ? '#111827' : '#fff',
                    border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                    borderRadius: '6px',
                    color: isDark ? '#fff' : '#111',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  <option value="pending">Pendiente</option>
                  <option value="approved">Aprobado</option>
                  <option value="rejected">Rechazado</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '10px 20px',
                    background: isDark ? '#374151' : '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    color: isDark ? '#fff' : '#374151',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer'
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '10px 20px',
                    background: '#dc2626',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: saving ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          )}

          {/* Tab: Álbumes */}
          {activeTab === 'albums' && (
            <div>
              <h3 style={{ color: isDark ? '#fff' : '#111', marginBottom: '16px' }}>Álbumes ({albums.length})</h3>
              {albums.length === 0 ? (
                <p style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>No hay álbumes registrados</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {albums.map(album => (
                    <div key={album.id} style={{
                      padding: '12px',
                      background: isDark ? '#111827' : '#f9fafb',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <Disc size={20} color="#dc2626" />
                      <div>
                        <p style={{ color: isDark ? '#fff' : '#111', fontWeight: 500, margin: 0 }}>{album.title}</p>
                        <p style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '12px', margin: 0 }}>
                          {album.release_date || 'Sin fecha'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Canciones */}
          {activeTab === 'songs' && (
            <div>
              <h3 style={{ color: isDark ? '#fff' : '#111', marginBottom: '16px' }}>Canciones ({songs.length})</h3>
              {songs.length === 0 ? (
                <p style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>No hay canciones registradas</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {songs.map(song => (
                    <div key={song.id} style={{
                      padding: '12px',
                      background: isDark ? '#111827' : '#f9fafb',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <Music size={20} color="#dc2626" />
                      <div>
                        <p style={{ color: isDark ? '#fff' : '#111', fontWeight: 500, margin: 0 }}>{song.title}</p>
                        <p style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '12px', margin: 0 }}>
                          {song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : 'Sin duración'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab: Miembros */}
          {activeTab === 'members' && (
            <div>
              <h3 style={{ color: isDark ? '#fff' : '#111', marginBottom: '16px' }}>Miembros ({members.length})</h3>
              {members.length === 0 ? (
                <p style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>No hay miembros registrados</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {members.map(member => (
                    <div key={member.id} style={{
                      padding: '12px',
                      background: isDark ? '#111827' : '#f9fafb',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px'
                    }}>
                      <Users size={20} color="#dc2626" />
                      <div>
                        <p style={{ color: isDark ? '#fff' : '#111', fontWeight: 500, margin: 0 }}>{member.name}</p>
                        <p style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '12px', margin: 0 }}>
                          {member.role} {member.instrument && `- ${member.instrument}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EditArtistModal
