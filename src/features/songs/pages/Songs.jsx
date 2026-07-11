import { useState, useEffect } from 'react'
import { Loader2, Search, Music } from 'lucide-react'
import { useThemeStore } from '../../../app/store'
import { songService, albumService } from '../../../services/api'
import SongTable from '../components/SongTable'
import Toast from '../../../components/ui/Toast'

function Songs() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [songs, setSongs] = useState([])
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAlbum, setSelectedAlbum] = useState('')

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  useEffect(() => {
    loadSongs()
    loadAlbums()
  }, [])

  const loadSongs = async () => {
    setLoading(true)
    try {
      const data = await songService.getAll()
      console.log('Songs loaded:', data)
      setSongs(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading songs:', err)
      showToast('Error al cargar canciones', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadAlbums = async () => {
    try {
      const data = await albumService.getAll()
      setAlbums(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading albums:', err)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type }), 3000)
  }

  // Filtrar canciones solo de álbumes aprobados
  const getApprovedAlbumIds = () => {
    return albums
      .filter(album => album.status === 'approved')
      .map(album => album.id)
  }

  const getFilteredSongs = () => {
    const approvedAlbumIds = getApprovedAlbumIds()
    
    return songs.filter(song => {
      // Solo canciones de álbumes aprobados
      const songAlbumId = song.album_id || song.albumId
      const isFromApprovedAlbum = approvedAlbumIds.includes(songAlbumId) || 
                                   approvedAlbumIds.includes(String(songAlbumId))
      
      if (!isFromApprovedAlbum) return false

      // Filtro por búsqueda
      const matchesSearch = song.title?.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Filtro por álbum
      const matchesAlbum = selectedAlbum === '' || 
                          String(songAlbumId) === String(selectedAlbum)

      return matchesSearch && matchesAlbum
    })
  }

  const getAlbumName = (albumId) => {
    const album = albums.find(a => a.id === parseInt(albumId))
    return album?.title || 'Álbum desconocido'
  }

  const getAlbumCover = (albumId) => {
    const album = albums.find(a => a.id === parseInt(albumId))
    return album?.cover_image
  }

  const getAlbumStatus = (albumId) => {
    const album = albums.find(a => a.id === parseInt(albumId))
    return album?.status || 'unknown'
  }

  const filteredSongs = getFilteredSongs()
  const approvedAlbums = albums.filter(a => a.status === 'approved')

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Music size={28} color="#dc2626" />
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 700, 
            margin: 0,
            color: isDark ? '#fff' : '#111'
          }}>
            Catálogo de Canciones
          </h1>
        </div>

        {/* Stats */}
        <div style={{ 
          display: 'flex', 
          gap: '16px',
          fontSize: '14px',
          color: isDark ? '#9ca3af' : '#6b7280'
        }}>
          <span>
            <strong style={{ color: isDark ? '#fff' : '#111' }}>{filteredSongs.length}</strong> canciones
          </span>
          <span>
            de <strong style={{ color: isDark ? '#fff' : '#111' }}>{approvedAlbums.length}</strong> álbumes aprobados
          </span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search size={18} style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#d80000' 
          }} />
          <input
            type="text"
            placeholder="Buscar canciones..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              background: isDark ? '#1f2937' : '#fff',
              border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
              borderRadius: '8px',
              color: isDark ? '#fff' : '#111',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Album Filter */}
        <select
          value={selectedAlbum}
          onChange={(e) => setSelectedAlbum(e.target.value)}
          style={{
            padding: '10px 12px',
            background: isDark ? '#1f2937' : '#fff',
            border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
            borderRadius: '8px',
            color: isDark ? '#fff' : '#111',
            fontSize: '14px',
            minWidth: '200px',
            cursor: 'pointer'
          }}
        >
          <option value="">Todos los álbumes</option>
          {approvedAlbums.map(album => (
            <option key={album.id} value={album.id}>{album.title}</option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: '60px'
        }}>
          <Loader2 size={40} style={{ 
            animation: 'spin 1s linear infinite',
            color: isDark ? '#6b7280' : '#9ca3af'
          }} />
        </div>
      ) : (
        <SongTable
          songs={filteredSongs}
          albums={albums}
          getAlbumName={getAlbumName}
          getAlbumCover={getAlbumCover}
          getAlbumStatus={getAlbumStatus}
        />
      )}

      {/* Toast */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  )
}

export default Songs
