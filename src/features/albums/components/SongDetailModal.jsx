import { useState, useRef, useEffect } from 'react'
import { useThemeStore } from '../../../app/store'
import { X, Music, Play, Pause, Disc, User, Clock, FileText, Shield, Activity, HardDrive, Zap } from 'lucide-react'

function SongDetailModal({ isOpen, onClose, song, album, artistName }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

  // Debug logs
  console.log('🎵 SongDetailModal - song recibido:', song)
  console.log('🎵 SongDetailModal - AudioFiles:', song?.AudioFiles)
  console.log('🎵 SongDetailModal - song completo:', JSON.stringify(song, null, 2))

  useEffect(() => {
    if (!isOpen && audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
      setCurrentTime(0)
    }
  }, [isOpen])

  useEffect(() => {
    if (audioRef.current) {
      // Usar el primer AudioFile activo o el audio_file original
      const audioFile = song?.AudioFiles?.[0]
      const audioUrl = audioFile?.storage_url || song?.audio_file
      console.log('🎧 Audio URL a usar:', audioUrl)
      
      if (audioUrl && audioUrl !== 'null' && audioUrl !== '') {
        audioRef.current.src = audioUrl
        audioRef.current.load()
      } else {
        console.warn('⚠️ No hay URL de audio válida')
      }
    }
  }, [song])

  const togglePlay = () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getLicenseLabel = (licenseType) => {
    switch (licenseType) {
      case 'standard': return 'Estándar'
      case 'premium': return 'Premium'
      case 'exclusive': return 'Exclusiva'
      case 'creative_commons': return 'Creative Commons'
      case 'public_domain': return 'Dominio Público'
      default: return licenseType || 'No especificada'
    }
  }

  const getAnalysisStatusLabel = (status) => {
    switch (status) {
      case 'completed': return 'Completado'
      case 'in_progress': return 'En Progreso'
      case 'pending': return 'Pendiente'
      case 'failed': return 'Falló'
      case 'not_analyzed': return 'No Analizado'
      default: return status || 'Desconocido'
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    const size = (bytes / Math.pow(1024, i)).toFixed(1)
    return `${size} ${sizes[i]}`
  }

  const getFormatLabel = (format) => {
    const formats = {
      'mp3': 'MP3',
      'aac': 'AAC', 
      'flac': 'FLAC',
      'ogg': 'OGG',
      'wav': 'WAV'
    }
    return formats[format] || format?.toUpperCase() || 'Desconocido'
  }

  if (!isOpen || !song) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <div style={{
        background: isDark ? '#1f2937' : '#fff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        maxHeight: '80vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Music size={24} color="#dc2626" />
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: isDark ? '#fff' : '#111' }}>
              Detalle de Canción
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: isDark ? '#374151' : '#f3f4f6',
              border: 'none',
              cursor: 'pointer',
              padding: '10px',
              borderRadius: '8px',
              color: isDark ? '#fff' : '#374151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            title="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '16px 20px',
          overflow: 'auto',
          flex: 1
        }}>
          {/* Album Cover & Song Info */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            {album?.cover_image ? (
              <img
                src={album.cover_image}
                alt={album.title}
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                  border: `2px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  marginBottom: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                }}
              />
            ) : (
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '12px',
                background: isDark ? '#374151' : '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '12px'
              }}>
                <Disc size={48} color={isDark ? '#9ca3af' : '#6b7280'} />
              </div>
            )}

            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '16px',
              fontWeight: 700,
              color: isDark ? '#fff' : '#111',
              textAlign: 'center'
            }}>
              {song.title}
            </h3>

            <p style={{
              margin: '0 0 4px 0',
              fontSize: '14px',
              color: isDark ? '#d1d5db' : '#6b7280'
            }}>
              {artistName}
            </p>

            <p style={{
              margin: 0,
              fontSize: '12px',
              color: isDark ? '#9ca3af' : '#9ca3af'
            }}>
              {album?.title}
            </p>
          </div>

          {/* Audio Player */}
          {song.audio_file && (
            <div style={{
              background: isDark ? '#111827' : '#f9fafb',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
              />

              {/* Progress Bar */}
              <div style={{ marginBottom: '12px' }}>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '3px',
                    background: isDark ? '#374151' : '#e5e7eb',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                />
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '8px',
                  fontSize: '12px',
                  color: isDark ? '#9ca3af' : '#6b7280'
                }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '16px'
              }}>
                <button
                  onClick={togglePlay}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    border: 'none',
                    background: '#dc2626',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    ':hover': { transform: 'scale(1.05)' }
                  }}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: '4px' }} />}
                </button>
              </div>
            </div>
          )}

          {/* Song Details */}
          <div style={{
            display: 'grid',
            gap: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: isDark ? '#111827' : '#f9fafb',
              borderRadius: '8px'
            }}>
              <Clock size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
              <div>
                <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>Duración</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: isDark ? '#fff' : '#111' }}>
                  {song.AudioFiles?.[0]?.duration ? formatTime(song.AudioFiles[0].duration) : 'No especificada'}
                </p>
              </div>
            </div>

            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: isDark ? '#111827' : '#f9fafb',
              borderRadius: '8px'
            }}>
              <FileText size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>Letras</p>
                <p style={{ margin: 0, fontSize: '14px', color: isDark ? '#d1d5db' : '#374151' }}>
                  {song.lyrics ? song.lyrics.substring(0, 100) + (song.lyrics.length > 100 ? '...' : '') : 'Sin letras'}
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: isDark ? '#111827' : '#f9fafb',
              borderRadius: '8px'
            }}>
              <Shield size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
              <div>
                <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>Tipo de Licencia</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: isDark ? '#fff' : '#111' }}>
                  {getLicenseLabel(song.license_type)}
                </p>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              background: isDark ? '#111827' : '#f9fafb',
              borderRadius: '8px'
            }}>
              <Activity size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
              <div>
                <p style={{ margin: '0 0 2px 0', fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>Estado de Análisis</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: isDark ? '#fff' : '#111' }}>
                  {getAnalysisStatusLabel(song.analysis_status)}
                </p>
              </div>
            </div>

            {/* AudioFile Metadata */}
            {song.AudioFiles && song.AudioFiles.length > 0 && (
              <div style={{
                background: isDark ? '#111827' : '#f9fafb',
                borderRadius: '8px',
                padding: '16px',
                marginTop: '12px'
              }}>
                <h4 style={{
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: isDark ? '#fff' : '#111',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <HardDrive size={18} color="#dc2626" />
                  Metadatos del Archivo de Audio
                </h4>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: isDark ? '#1f2937' : '#fff',
                    borderRadius: '6px',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
                  }}>
                    <HardDrive size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                    <div>
                      <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: isDark ? '#9ca3af' : '#6b7280' }}>Tamaño</p>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: isDark ? '#fff' : '#111' }}>
                        {formatFileSize(song.AudioFiles[0].file_size)}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: isDark ? '#1f2937' : '#fff',
                    borderRadius: '6px',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
                  }}>
                    <Zap size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                    <div>
                      <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: isDark ? '#9ca3af' : '#6b7280' }}>Formato</p>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: isDark ? '#fff' : '#111' }}>
                        {getFormatLabel(song.AudioFiles[0].format)}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: isDark ? '#1f2937' : '#fff',
                    borderRadius: '6px',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
                  }}>
                    <Activity size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                    <div>
                      <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: isDark ? '#9ca3af' : '#6b7280' }}>Sample Rate</p>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: isDark ? '#fff' : '#111' }}>
                        {song.AudioFiles[0].sample_rate ? `${song.AudioFiles[0].sample_rate} Hz` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    background: isDark ? '#1f2937' : '#fff',
                    borderRadius: '6px',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
                  }}>
                    <Clock size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                    <div>
                      <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: isDark ? '#9ca3af' : '#6b7280' }}>Duración</p>
                      <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: isDark ? '#fff' : '#111' }}>
                        {formatTime(song.AudioFiles[0].duration)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

                      </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 20px',
          borderTop: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          textAlign: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              background: isDark ? '#374151' : '#f3f4f6',
              color: isDark ? '#fff' : '#374151',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default SongDetailModal
