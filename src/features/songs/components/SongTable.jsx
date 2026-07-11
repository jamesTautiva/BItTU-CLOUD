import { useState, useRef } from 'react'
import { useThemeStore } from '../../../app/store'
import { Play, Pause, Disc, Music } from 'lucide-react'

function SongTable({ songs, albums, getAlbumName, getAlbumCover, getAlbumStatus }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [playingId, setPlayingId] = useState(null)
  const audioRef = useRef(null)

  const handlePlay = async (e, song) => {
    e.stopPropagation()

    if (!song.audio_url) {
      alert('Esta canción no tiene archivo de audio')
      return
    }

    if (playingId === song.id) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      setPlayingId(null)
      return
    }

    // Stop previous
    if (audioRef.current) {
      audioRef.current.pause()
    }

    try {
      const audio = new Audio(song.audio_url)
      audio.onended = () => {
        setPlayingId(null)
        audioRef.current = null
      }
      audio.onerror = () => {
        console.error('Error loading audio')
        setPlayingId(null)
        audioRef.current = null
      }

      await audio.play()
      audioRef.current = audio
      setPlayingId(song.id)
    } catch (err) {
      console.error('Error playing:', err)
      alert('Error al reproducir')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#22c55e'
      case 'pending': return '#f59e0b'
      case 'rejected': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved': return 'Aprobado'
      case 'pending': return 'Pendiente'
      case 'rejected': return 'Rechazado'
      default: return status
    }
  }

  if (songs.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        background: isDark ? '#1f29374e' : '#f9fafb',
        borderRadius: '12px',
        border: `1px dashed ${isDark ? '#374151' : '#d1d5db'}`
      }}>
        <Music size={48} style={{ color: isDark ? '#4b5563' : '#9ca3af', marginBottom: '16px' }} />
        <p style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '16px', margin: 0 }}>
          No hay canciones disponibles
        </p>
        <p style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: '14px', marginTop: '8px' }}>
          Las canciones aparecerán aquí cuando sus álbumes estén aprobados
        </p>
      </div>
    )
  }

  return (
    <div style={{
      background: isDark ? '#1f29375a' : '#fff',
      borderRadius: '12px',
      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
      overflow: 'hidden'
    }}>
      {/* Table Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '60px 1fr 200px 120px',
        gap: '16px',
        padding: '16px 20px',
        background: isDark ? '#950000' : '#f9fafb',
        borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        fontSize: '13px',
        fontWeight: 600,
        color: isDark ? '#ffffff' : '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        <div>#</div>
        <div>Canción</div>
        <div>Álbum</div>
        <div style={{ textAlign: 'center' }}>Estado del Álbum</div>
      </div>

      {/* Table Body */}
      <div>
        {songs.map((song, index) => {
          const albumId = song.album_id || song.albumId
          const albumCover = getAlbumCover(albumId)

          const albumStatus = getAlbumStatus?.(albumId) || 'unknown'

          return (
            <div
              key={song.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 200px 120px',
                gap: '16px',
                padding: '16px 20px',
                borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                alignItems: 'center',
                transition: 'background 0.15s ease',
                ':hover': {
                  background: isDark ? '#252f3f' : '#f9fafb'
                }
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isDark ? '#252f3f' : '#f9fafb'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              {/* Track Number / Play Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {playingId === song.id ? (
                  <button
                    onClick={(e) => handlePlay(e, song)}
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
                    <span style={{ color: '#dc2626', fontSize: '12px' }}>❚❚</span>
                  </button>
                ) : (
                  <button
                    onClick={(e) => handlePlay(e, song)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: song.audio_url ? 1 : 0.3,
                      pointerEvents: song.audio_url ? 'auto' : 'none'
                    }}
                  >
                    <Play size={16} color={song.audio_url ? '#dc2626' : '#6b7280'} />
                  </button>
                )}
              </div>

              {/* Song Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {albumCover ? (
                  <img
                    src={albumCover}
                    alt=""
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '6px',
                      objectFit: 'cover',
                      flexShrink: 0
                    }}
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                ) : (
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '6px',
                    background: isDark ? '#374151' : '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Disc size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
                  </div>
                )}
                <div>
                  <p style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: 600,
                    color: isDark ? '#fff' : '#111'
                  }}>
                    {song.title}
                  </p>
                  <p style={{
                    margin: '2px 0 0 0',
                    fontSize: '12px',
                    color: isDark ? '#9ca3af' : '#6b7280'
                  }}>
                    Track {song.track_number || index + 1}
                  </p>
                </div>
              </div>

              {/* Album */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Disc size={14} color={isDark ? '#9ca3af' : '#6b7280'} />
                <span style={{
                  fontSize: '14px',
                  color: isDark ? '#d1d5db' : '#374151',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {getAlbumName(albumId)}
                </span>
              </div>

              {/* Album Status */}
              <div style={{ textAlign: 'center' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  background: `${getStatusColor(albumStatus)}20`,
                  color: getStatusColor(albumStatus)
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: getStatusColor(albumStatus)
                  }} />
                  {getStatusLabel(albumStatus)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SongTable
