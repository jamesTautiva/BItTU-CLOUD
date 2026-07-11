import { useState, useEffect, useRef } from 'react'
import { useThemeStore } from '../../../app/store'
import { songService, uploadService } from '../../../services/api'
import { X, Music, Disc, FileText, Clock, Save, Loader2, Play, Pause } from 'lucide-react'

function EditSongModal({ isOpen, onClose, song, albums, onSave }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const audioRef = useRef(null)

  const [formData, setFormData] = useState({
    title: '',
    album_id: '',
    track_number: '',
    duration: '',
    lyrics: '',
    status: 'pending'
  })
  const [saving, setSaving] = useState(false)
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (song && isOpen) {
      setFormData({
        title: song.title || '',
        album_id: song.album_id || song.albumId || '',
        track_number: song.track_number || '',
        duration: song.duration || '',
        lyrics: song.lyrics || '',
        status: song.status || 'pending'
      })
    }
  }, [song, isOpen])

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await songService.update(song.id, formData)
      onSave?.(formData)
      onClose()
    } catch (err) {
      console.error('Error updating song:', err)
      alert('Error al actualizar la canción')
    } finally {
      setSaving(false)
    }
  }

  const handleAudioUpload = async (e) => {
    const file = e.target.files[0]
    if (!file || !song?.id) return

    setUploadingAudio(true)
    try {
      const result = await uploadService.uploadSong(song.id, file)
      // Actualizar la canción con la nueva URL
      await songService.update(song.id, { ...formData, audio_url: result.url })
      alert('Audio subido exitosamente')
    } catch (err) {
      console.error('Error uploading audio:', err)
      alert('Error al subir el audio: ' + (err.message || 'Error desconocido'))
    } finally {
      setUploadingAudio(false)
    }
  }

  const togglePlay = async () => {
    if (!song?.audio_url) {
      alert('No hay archivo de audio disponible')
      return
    }

    if (playing) {
      audioRef.current?.pause()
      setPlaying(false)
    } else {
      try {
        if (audioRef.current) {
          audioRef.current.pause()
        }
        const audio = new Audio(song.audio_url)
        audio.onended = () => setPlaying(false)
        audio.onerror = () => {
          console.error('Error playing audio')
          setPlaying(false)
        }
        audioRef.current = audio
        await audio.play()
        setPlaying(true)
      } catch (err) {
        console.error('Error playing:', err)
        alert('Error al reproducir')
      }
    }
  }

  const getAlbumTitle = () => {
    const album = albums.find(a => a.id === parseInt(formData.album_id))
    return album?.title || 'Álbum desconocido'
  }

  const getAlbumCover = () => {
    const album = albums.find(a => a.id === parseInt(formData.album_id))
    return album?.cover_image
  }

  if (!isOpen || !song) return null

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
        maxWidth: '600px',
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
            <Music size={24} color="#dc2626" />
            <h2 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 600,
              color: isDark ? '#fff' : '#111'
            }}>
              Editar Canción
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
        <div style={{ padding: '24px' }}>
          {/* Album Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '16px',
            background: isDark ? '#111827' : '#f9fafb',
            borderRadius: '12px',
            marginBottom: '24px'
          }}>
            {getAlbumCover() ? (
              <img
                src={getAlbumCover()}
                alt=""
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '8px',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '8px',
                background: isDark ? '#374151' : '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Disc size={32} color={isDark ? '#6b7280' : '#9ca3af'} />
              </div>
            )}
            <div>
              <p style={{
                margin: '0 0 4px 0',
                fontSize: '12px',
                color: isDark ? '#9ca3af' : '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Álbum
              </p>
              <p style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 600,
                color: isDark ? '#fff' : '#111'
              }}>
                {getAlbumTitle()}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Audio Player / Upload */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
                color: isDark ? '#d1d5db' : '#374151'
              }}>
                Archivo de Audio
              </label>
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                padding: '16px',
                background: isDark ? '#111827' : '#f9fafb',
                borderRadius: '12px',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
              }}>
                <button
                  type="button"
                  onClick={togglePlay}
                  disabled={!song.audio_url}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: song.audio_url ? '#dc2626' : '#6b7280',
                    border: 'none',
                    cursor: song.audio_url ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {playing ? (
                    <Pause size={20} color="#fff" />
                  ) : (
                    <Play size={20} color="#fff" />
                  )}
                </button>
                <div style={{ flex: 1 }}>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: isDark ? '#fff' : '#111',
                    fontWeight: 500
                  }}>
                    {song.audio_url ? 'Audio disponible' : 'Sin audio'}
                  </p>
                  <p style={{
                    margin: '4px 0 0 0',
                    fontSize: '12px',
                    color: isDark ? '#9ca3af' : '#6b7280'
                  }}>
                    {song.audio_url ? 'Click para reproducir' : 'Sube un archivo de audio'}
                  </p>
                </div>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioUpload}
                  style={{ display: 'none' }}
                  id="audio-upload"
                />
                <label
                  htmlFor="audio-upload"
                  style={{
                    padding: '8px 16px',
                    background: isDark ? '#374151' : '#e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: isDark ? '#fff' : '#374151',
                    fontWeight: 500
                  }}
                >
                  {uploadingAudio ? 'Subiendo...' : 'Subir Audio'}
                </label>
              </div>
            </div>

            {/* Title */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
                color: isDark ? '#d1d5db' : '#374151'
              }}>
                Título
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: isDark ? '#111827' : '#fff',
                  border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                  borderRadius: '6px',
                  color: isDark ? '#fff' : '#111',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Track Number & Duration */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '16px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '8px',
                  color: isDark ? '#d1d5db' : '#374151'
                }}>
                  Número de Track
                </label>
                <input
                  type="number"
                  value={formData.track_number}
                  onChange={(e) => handleChange('track_number', e.target.value)}
                  min="1"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: isDark ? '#111827' : '#fff',
                    border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                    borderRadius: '6px',
                    color: isDark ? '#fff' : '#111',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '8px',
                  color: isDark ? '#d1d5db' : '#374151'
                }}>
                  Duración
                </label>
                <input
                  type="text"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  placeholder="3:45"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    background: isDark ? '#111827' : '#fff',
                    border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                    borderRadius: '6px',
                    color: isDark ? '#fff' : '#111',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Status */}
            <div style={{ marginBottom: '16px' }}>
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
                  cursor: 'pointer',
                  boxSizing: 'border-box'
                }}
              >
                <option value="pending">Pendiente</option>
                <option value="approved">Aprobado</option>
                <option value="rejected">Rechazado</option>
              </select>
            </div>

            {/* Lyrics */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
                color: isDark ? '#d1d5db' : '#374151'
              }}>
                Letras
              </label>
              <textarea
                value={formData.lyrics}
                onChange={(e) => handleChange('lyrics', e.target.value)}
                rows={6}
                placeholder="Letras de la canción..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: isDark ? '#111827' : '#fff',
                  border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                  borderRadius: '6px',
                  color: isDark ? '#fff' : '#111',
                  fontSize: '14px',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
              />
            </div>

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
                disabled={saving}
                style={{
                  padding: '10px 20px',
                  background: '#dc2626',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: saving ? 'not-allowed' : 'pointer',
                  opacity: saving ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditSongModal
