import { useState, useEffect, useRef } from 'react'
import { useThemeStore } from '../../../app/store'
import { albumService, songService, artistService, uploadService } from '../../../services/api'
import { X, Disc, Music, User, Calendar, FileText, Save, Loader2, Play, Pause } from 'lucide-react'
import SongDetailModal from './SongDetailModal'

function EditAlbumModal({ isOpen, onClose, album, artists, onSave }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [activeTab, setActiveTab] = useState('info')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    artist_id: '',
    description: '',
    release_date: '',
    cover_image: '',
    status: 'approved'
  })

  const [songs, setSongs] = useState([])
  const [selectedSong, setSelectedSong] = useState(null)
  const [isSongModalOpen, setIsSongModalOpen] = useState(false)
  const [playingSongId, setPlayingSongId] = useState(null)
  const audioRef = useRef(null)

  useEffect(() => {
    if (album && isOpen) {
      setFormData({
        title: album.title || '',
        artist_id: album.artist_id || '',
        description: album.description || '',
        release_date: album.release_date ? album.release_date.split('T')[0] : '',
        cover_image: album.cover_image || '',
        status: album.status || 'approved'
      })
      loadSongs()
    }
  }, [album, isOpen])

  const loadSongs = async () => {
    if (!album?.id) return
    setLoading(true)
    try {
      console.log('🎵 Cargando canciones del álbum ID:', album.id)
      const albumSongs = await songService.getByAlbum(album.id)
      console.log('✅ Canciones cargadas con AudioFile:', albumSongs)
      setSongs(albumSongs)
    } catch (err) {
      console.error('❌ Error loading songs:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      console.log('Updating album with data:', formData)
      await albumService.update(album.id, formData)
      onSave()
      onClose()
    } catch (err) {
      console.error('Error updating album:', err)
      alert('Error al actualizar álbum: ' + (err.message || 'Error desconocido'))
    } finally {
      setSaving(false)
    }
  }

  const handleSongClick = (song) => {
    setSelectedSong(song)
    setIsSongModalOpen(true)
  }

  const handlePlayClick = async (e, song) => {
    e.stopPropagation()

    console.log('🎵 Intentando reproducir:', song)
    const audioUrl = song?.AudioFile?.storage_url || song?.audio_url
    console.log('🎧 Audio URL:', audioUrl)

    // Verificar si hay archivo de audio
    if (!audioUrl || audioUrl === 'null' || audioUrl === '') {
      alert('Esta canción no tiene un archivo de audio disponible')
      return
    }

    if (playingSongId === song.id) {
      // Pausar si ya está reproduciendo
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      setPlayingSongId(null)
      return
    }

    // Detener cualquier audio anterior
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    // Crear nuevo elemento de audio
    try {
      const audio = new Audio()
      const audioUrl = song?.AudioFile?.storage_url || song?.audio_url
      console.log('🎧 Creando audio con URL:', audioUrl)

      // Esperar a que el audio esté listo
      const canPlayPromise = new Promise((resolve, reject) => {
        audio.oncanplay = () => resolve()
        audio.onerror = () => reject(new Error('No se pudo cargar el audio'))
        // Timeout de 5 segundos
        setTimeout(() => reject(new Error('Timeout cargando audio')), 5000)
      })

      // Configurar eventos
      audio.onended = () => {
        setPlayingSongId(null)
        audioRef.current = null
      }

      // Cargar fuente
      audio.src = audioUrl
      audioRef.current = audio

      // Esperar a que esté listo
      await canPlayPromise

      // Reproducir
      await audio.play()
      setPlayingSongId(song.id)

    } catch (err) {
      console.error('Error reproduciendo:', err)
      alert('Error al reproducir: ' + (err.message || 'Verifica que el archivo de audio exista'))
      setPlayingSongId(null)
      audioRef.current = null
    }
  }

  const getArtistName = () => {
    const artist = artists.find(a => a.id === parseInt(formData.artist_id))
    return artist?.name || 'Artista desconocido'
  }

  const getArtistImage = () => {
    const artist = artists.find(a => a.id === parseInt(formData.artist_id))
    return artist?.artist_image
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen || !album) return null

  return (
    <>
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Disc size={24} color="#dc2626" />
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: isDark ? '#fff' : '#111' }}>
                Editar Álbum
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px',
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
            {[
              { id: 'info', label: 'Información', icon: Disc },
              { id: 'artist', label: 'Artista', icon: User },
              { id: 'songs', label: 'Canciones', icon: Music }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px 20px',
                  background: activeTab === tab.id ? (isDark ? '#111827' : '#f9fafb') : 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #dc2626' : 'none',
                  color: activeTab === tab.id ? '#dc2626' : (isDark ? '#9ca3af' : '#6b7280'),
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px'
          }}>
            {/* Tab: Album Info */}
            {activeTab === 'info' && (
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: isDark ? '#d1d5db' : '#374151' }}>
                    Título del Álbum
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: isDark ? '#111827' : '#fff',
                      border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                      borderRadius: '6px',
                      color: isDark ? '#fff' : '#111',
                      fontSize: '14px'
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: isDark ? '#d1d5db' : '#374151' }}>
                    Artista
                  </label>
                  <select
                    value={formData.artist_id}
                    onChange={(e) => handleChange('artist_id', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      background: isDark ? '#111827' : '#fff',
                      border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                      borderRadius: '6px',
                      color: isDark ? '#fff' : '#111',
                      fontSize: '14px'
                    }}
                    required
                  >
                    <option value="">Seleccionar artista</option>
                    {artists.map(artist => (
                      <option key={artist.id} value={artist.id}>{artist.name}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: isDark ? '#d1d5db' : '#374151' }}>
                    Fecha de Lanzamiento
                  </label>
                  <input
                    type="date"
                    value={formData.release_date}
                    onChange={(e) => handleChange('release_date', e.target.value)}
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
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: isDark ? '#d1d5db' : '#374151' }}>
                    Imagen de Portada
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0]
                      if (file && album?.id) {
                        try {
                          setUploadingCover(true)
                          console.log('📁 Subiendo portada para álbum ID:', album.id)
                          const result = await uploadService.uploadAlbumCover(album.id, file)
                          console.log('✅ Portada subida:', result)
                          handleChange('cover_image', result.url)
                          // No llamar a onSave aquí, solo actualizar el estado
                        } catch (err) {
                          console.error('❌ Error subiendo portada:', err)
                          alert('Error al subir la portada: ' + (err.message || 'Error desconocido'))
                        } finally {
                          setUploadingCover(false)
                        }
                      }
                    }}
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
                  {uploadingCover && (
                    <p style={{ fontSize: '13px', color: isDark ? '#9ca3af' : '#6b7280', marginTop: '8px' }}>
                      Subiendo portada...
                    </p>
                  )}
                  {formData.cover_image && (
                    <div style={{ marginTop: '12px' }}>
                      <img
                        src={formData.cover_image}
                        alt="Preview"
                        style={{
                          width: '100px',
                          height: '100px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`
                        }}
                        onError={(e) => { e.target.style.display = 'none' }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: isDark ? '#d1d5db' : '#374151' }}>
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
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
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: isDark ? '#d1d5db' : '#374151' }}>
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
                      fontSize: '14px'
                    }}
                  >
                    <option value="approved">Activo</option>
                    <option value="pending">Pendiente</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                </div>
              </form>
            )}

            {/* Tab: Artist Info */}
            {activeTab === 'artist' && (
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '20px',
                  background: isDark ? '#111827' : '#f9fafb',
                  borderRadius: '12px',
                  marginBottom: '20px'
                }}>
                  {getArtistImage() ? (
                    <img
                      src={getArtistImage()}
                      alt={getArtistName()}
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: `3px solid ${isDark ? '#374151' : '#e5e7eb'}`
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: isDark ? '#374151' : '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <User size={32} color={isDark ? '#9ca3af' : '#6b7280'} />
                    </div>
                  )}
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', color: isDark ? '#fff' : '#111' }}>
                      {getArtistName()}
                    </h3>
                    <p style={{ margin: 0, fontSize: '14px', color: isDark ? '#9ca3af' : '#6b7280' }}>
                      Artista del álbum
                    </p>
                  </div>
                </div>

                <div style={{
                  padding: '16px',
                  background: isDark ? '#111827' : '#f9fafb',
                  borderRadius: '8px'
                }}>
                  <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: isDark ? '#9ca3af' : '#6b7280' }}>
                    <strong style={{ color: isDark ? '#d1d5db' : '#374151' }}>ID del Artista:</strong> {formData.artist_id}
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', color: isDark ? '#9ca3af' : '#6b7280' }}>
                    <strong style={{ color: isDark ? '#d1d5db' : '#374151' }}>Álbum:</strong> {formData.title}
                  </p>
                </div>
              </div>
            )}

            {/* Tab: Songs */}
            {activeTab === 'songs' && (
              <div>
                {loading ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
                    <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', color: '#dc2626' }} />
                  </div>
                ) : songs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: isDark ? '#9ca3af' : '#6b7280' }}>
                    <Music size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                    <p>No hay canciones en este álbum</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {songs.map((song, index) => (
                      <div
                        key={song.id}
                        onClick={() => handleSongClick(song)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px 16px',
                          background: isDark ? '#111827' : '#f9fafb',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          ':hover': { background: isDark ? '#1f2937' : '#f3f4f6' }
                        }}
                      >
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: '#dc2626',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: '14px',
                          fontWeight: 600
                        }}>
                          {index + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 600, color: isDark ? '#fff' : '#111' }}>
                            {song.title}
                          </p>
                          <p style={{ margin: 0, fontSize: '13px', color: isDark ? '#9ca3af' : '#6b7280' }}>
                            {song.AudioFiles?.[0]?.duration ? formatTime(song.AudioFiles[0].duration) : '0:00'} • {song.status}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handlePlayClick(e, song)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {playingSongId === song.id ? (
                            <span style={{ color: '#dc2626', fontSize: '14px', fontWeight: 600 }}>❚❚</span>
                          ) : (
                            <Play size={20} color="#dc2626" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {activeTab === 'info' && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              padding: '20px 24px',
              borderTop: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
            }}>
              <button
                onClick={onClose}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
                  background: 'transparent',
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
                onClick={handleSubmit}
                disabled={saving || uploadingCover}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#dc2626',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: (saving || uploadingCover) ? 'not-allowed' : 'pointer',
                  opacity: (saving || uploadingCover) ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden audio element for playlist playback */}
      <audio ref={audioRef} style={{ display: 'none' }} />

      <SongDetailModal
        isOpen={isSongModalOpen}
        onClose={() => setIsSongModalOpen(false)}
        song={selectedSong}
        album={album}
        artistName={getArtistName()}
      />
    </>
  )
}

export default EditAlbumModal
