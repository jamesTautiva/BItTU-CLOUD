import { useState, useEffect, useMemo } from 'react'
import { useThemeStore, useAuthStore } from '../../../app/store'
import { X, Search, Plus, Music, Disc, Check, Loader2, Trash2 } from 'lucide-react'
import { playlistService, albumService, songService } from '../../../services/api'

function AddSongsToPlaylistModal({ isOpen, onClose, playlist, onSongsAdded }) {
  const { theme } = useThemeStore()
  const { user } = useAuthStore()
  const isDark = theme === 'dark'

  const [songs, setSongs] = useState([])
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [addingSongId, setAddingSongId] = useState(null)
  const [addedSongs, setAddedSongs] = useState(new Set())
  const [removingSongId, setRemovingSongId] = useState(null)
  const [fullPlaylist, setFullPlaylist] = useState(null)

  useEffect(() => {
    if (isOpen && playlist?.id) {
      loadAllData()
      setAddedSongs(new Set())
    }
  }, [isOpen, playlist?.id])

  const loadAllData = async () => {
    setLoading(true)
    try {
      // 1. Cargar información completa de la playlist (con canciones)
      let playlistData = playlist
      try {
        const fullData = await playlistService.getById(playlist.id)
        if (fullData) {
          playlistData = fullData
          setFullPlaylist(fullData)
        }
      } catch (err) {
        console.log('Could not load full playlist details:', err)
        setFullPlaylist(playlist)
      }

      // 2. Cargar álbumes aprobados
      const albumsData = await albumService.getAll()
      const approvedAlbums = (Array.isArray(albumsData) ? albumsData : []).filter(
        a => a.status === 'approved'
      )
      setAlbums(approvedAlbums)

      // 3. Cargar todas las canciones y filtrar por álbumes aprobados
      const songsData = await songService.getAll()
      const allSongs = Array.isArray(songsData) ? songsData : []
      
      const approvedAlbumIds = new Set(approvedAlbums.map(a => a.id))
      const filteredSongs = allSongs.filter(song => {
        const albumId = song.album_id || song.albumId
        return approvedAlbumIds.has(albumId)
      })
      
      setSongs(filteredSongs)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar canciones por búsqueda y excluir las ya agregadas a esta playlist
  const filteredSongs = useMemo(() => {
    let result = songs

    // Usar la playlist completa si está disponible
    const currentPlaylist = fullPlaylist || playlist
    
    // Excluir canciones ya en la playlist
    const playlistSongIds = new Set(
      (currentPlaylist?.songs || []).map(ps => ps.song?.id || ps.song_id || ps.id)
    )
    result = result.filter(s => !playlistSongIds.has(s.id) && !addedSongs.has(s.id))

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(song =>
        song.title?.toLowerCase().includes(term) ||
        getAlbumName(song)?.toLowerCase().includes(term) ||
        getArtistName(song)?.toLowerCase().includes(term)
      )
    }

    return result
  }, [songs, searchTerm, playlist, fullPlaylist, addedSongs])

  const getAlbumName = (song) => {
    const albumId = song.album_id || song.albumId
    const album = albums.find(a => a.id === albumId)
    return album?.title || 'Álbum desconocido'
  }

  const getAlbumCover = (song) => {
    const albumId = song.album_id || song.albumId
    const album = albums.find(a => a.id === albumId)
    return album?.cover_image
  }

  const getArtistName = (song) => {
    const albumId = song.album_id || song.albumId
    const album = albums.find(a => a.id === albumId)
    return album?.Artist?.name || 'Artista desconocido'
  }

  const handleAddSong = async (songId) => {
    if (!playlist?.id) return
    
    setAddingSongId(songId)
    try {
      await playlistService.addSong(playlist.id, songId)
      setAddedSongs(prev => new Set(prev).add(songId))
      // Refresh playlist data
      const fullData = await playlistService.getById(playlist.id)
      if (fullData) setFullPlaylist(fullData)
      onSongsAdded?.()
    } catch (err) {
      console.error('Error adding song:', err)
    } finally {
      setAddingSongId(null)
    }
  }

  const handleRemoveSong = async (playlistSongId) => {
    if (!playlist?.id) return
    
    setRemovingSongId(playlistSongId)
    try {
      await playlistService.removeSong(playlist.id, playlistSongId)
      // Refresh playlist data
      const fullData = await playlistService.getById(playlist.id)
      if (fullData) setFullPlaylist(fullData)
      
      // Remove from addedSongs set so it appears in available songs again
      // Find the song_id from the playlistSongId
      const playlistSong = (fullPlaylist?.songs || playlist?.songs || []).find(ps => ps.id === playlistSongId)
      if (playlistSong) {
        const songId = playlistSong.song?.id || playlistSong.song_id
        if (songId) {
          setAddedSongs(prev => {
            const newSet = new Set(prev)
            newSet.delete(songId)
            return newSet
          })
        }
      }
      
      onSongsAdded?.()
    } catch (err) {
      console.error('Error removing song:', err)
    } finally {
      setRemovingSongId(null)
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen || !playlist) return null

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
          <div>
            <h2 style={{
              margin: 0,
              fontSize: '20px',
              fontWeight: 600,
              color: isDark ? '#fff' : '#111'
            }}>
              Agregar Canciones
            </h2>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '13px',
              color: isDark ? '#9ca3af' : '#6b7280'
            }}>
              A "{playlist.name}" - Solo canciones de álbumes aprobados
            </p>
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
              justifyContent: 'center'
            }}
          >
            <X size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Search size={18} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: isDark ? '#6b7280' : '#9ca3af'
            }} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar canciones, álbumes o artistas..."
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                background: isDark ? '#111827' : '#fff',
                border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                borderRadius: '8px',
                color: isDark ? '#fff' : '#111',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Existing Songs Section */}
          {(fullPlaylist?.songs?.length > 0 || playlist?.songs?.length > 0) && (
            <>
              <h3 style={{
                fontSize: '14px',
                fontWeight: 600,
                color: isDark ? '#fff' : '#111',
                margin: '0 0 12px 0'
              }}>
                Canciones en la playlist ({(fullPlaylist?.songs || playlist?.songs || []).length})
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '24px',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                {(fullPlaylist?.songs || playlist?.songs || []).map((playlistSong, index) => {
                  const song = playlistSong.song || playlistSong
                  const songId = song.id || playlistSong.song_id
                  const playlistSongId = playlistSong.id // ID del registro en PlaylistSong
                  return (
                    <div
                      key={songId || index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 12px',
                        background: isDark ? '#111827' : '#f9fafb',
                        borderRadius: '8px',
                        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
                      }}
                    >
                      {getAlbumCover(song) ? (
                        <img src={getAlbumCover(song)} alt="" style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: isDark ? '#374151' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Disc size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: isDark ? '#fff' : '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {song.title}
                        </p>
                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>
                          {getArtistName(song)} • {getAlbumName(song)}
                        </p>
                      </div>
                      <span style={{ fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>
                        {formatDuration(song.duration)}
                      </span>
                      <button
                        onClick={() => handleRemoveSong(playlistSongId)}
                        disabled={removingSongId === playlistSongId}
                        style={{
                          padding: '6px',
                          background: '#ef4444',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: removingSongId === playlistSongId ? 'not-allowed' : 'pointer',
                          opacity: removingSongId === playlistSongId ? 0.7 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {removingSongId === playlistSongId ? (
                          <Loader2 size={14} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
                        ) : (
                          <Trash2 size={14} color="#fff" />
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* Available Songs Section */}
          <h3 style={{
            fontSize: '14px',
            fontWeight: 600,
            color: isDark ? '#fff' : '#111',
            margin: '0 0 12px 0'
          }}>
            Agregar canciones
          </h3>

          {/* Stats */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            fontSize: '13px',
            color: isDark ? '#9ca3af' : '#6b7280'
          }}>
            <span>
              <strong style={{ color: isDark ? '#fff' : '#111' }}>
                {filteredSongs.length}
              </strong> canciones disponibles
            </span>
            <span>
              <strong style={{ color: isDark ? '#fff' : '#111' }}>
                {addedSongs.size}
              </strong> agregadas
            </span>
          </div>

          {/* Songs List */}
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '40px'
            }}>
              <Loader2 size={32} style={{
                animation: 'spin 1s linear infinite',
                color: '#dc2626'
              }} />
            </div>
          ) : filteredSongs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px'
            }}>
              <Music size={48} style={{
                color: isDark ? '#4b5563' : '#9ca3af',
                marginBottom: '16px'
              }} />
              <p style={{
                color: isDark ? '#9ca3af' : '#6b7280',
                fontSize: '14px',
                margin: 0
              }}>
                No hay canciones disponibles
              </p>
              <p style={{
                color: isDark ? '#6b7280' : '#9ca3af',
                fontSize: '13px',
                marginTop: '8px'
              }}>
                {searchTerm 
                  ? 'Intenta con otra búsqueda' 
                  : 'Todas las canciones de álbumes aprobados ya están en tu playlist'}
              </p>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              maxHeight: '400px',
              overflow: 'auto'
            }}>
              {filteredSongs.map(song => (
                <div
                  key={song.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: isDark ? '#111827' : '#f9fafb',
                    borderRadius: '8px',
                    border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
                  }}
                >
                  {/* Cover */}
                  {getAlbumCover(song) ? (
                    <img
                      src={getAlbumCover(song)}
                      alt=""
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '6px',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '6px',
                      background: isDark ? '#374151' : '#e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Disc size={24} color={isDark ? '#6b7280' : '#9ca3af'} />
                    </div>
                  )}

                  {/* Song Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
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
                      fontSize: '12px',
                      color: isDark ? '#9ca3af' : '#6b7280'
                    }}>
                      {getArtistName(song)} • {getAlbumName(song)}
                    </p>
                  </div>

                  {/* Duration */}
                  <span style={{
                    fontSize: '12px',
                    color: isDark ? '#9ca3af' : '#6b7280'
                  }}>
                    {formatDuration(song.duration)}
                  </span>

                  {/* Add Button */}
                  <button
                    onClick={() => handleAddSong(song.id)}
                    disabled={addingSongId === song.id}
                    style={{
                      padding: '8px',
                      background: addedSongs.has(song.id) ? '#22c55e' : '#dc2626',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: addingSongId === song.id ? 'not-allowed' : 'pointer',
                      opacity: addingSongId === song.id ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {addingSongId === song.id ? (
                      <Loader2 size={16} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
                    ) : addedSongs.has(song.id) ? (
                      <Check size={16} color="#fff" />
                    ) : (
                      <Plus size={16} color="#fff" />
                    )}
                  </button>
                </div>
              ))}
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
              onClick={onClose}
              style={{
                padding: '10px 24px',
                background: 'transparent',
                border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                borderRadius: '8px',
                color: isDark ? '#d1d5db' : '#374151',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              {addedSongs.size > 0 ? 'Terminar' : 'Cancelar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddSongsToPlaylistModal
