import { useState, useEffect } from 'react'
import { Loader2, Search, Disc, Plus } from 'lucide-react'
import { useThemeStore } from '../../../app/store'
import { albumService, artistService } from '../../../services/api'
import AlbumTable from '../components/AlbumTable'
import EditAlbumModal from '../components/EditAlbumModal'
import DeleteConfirmModal from '../../users/components/DeleteConfirmModal'
import Toast from '../../../components/ui/Toast'

function Albums() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [albums, setAlbums] = useState([])
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArtist, setSelectedArtist] = useState('')

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedAlbum, setSelectedAlbum] = useState(null)

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  useEffect(() => {
    loadAlbums()
    loadArtists()
  }, [])

  const loadAlbums = async () => {
    setLoading(true)
    try {
      const data = await albumService.getAll()
      console.log('Albums loaded:', data)
      setAlbums(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading albums:', err)
      showToast('Error al cargar álbumes', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadArtists = async () => {
    try {
      const data = await artistService.getAll()
      setArtists(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading artists:', err)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type }), 3000)
  }

  const handleEdit = (album) => {
    setSelectedAlbum(album)
    setIsEditModalOpen(true)
  }

  const handleDelete = (album) => {
    setSelectedAlbum(album)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedAlbum) return
    try {
      await albumService.delete(selectedAlbum.id)
      showToast('Álbum eliminado exitosamente')
      loadAlbums()
    } catch (err) {
      console.error('Error deleting album:', err)
      showToast('Error al eliminar álbum', 'error')
    } finally {
      setIsDeleteModalOpen(false)
      setSelectedAlbum(null)
    }
  }

  const handleSave = () => {
    loadAlbums()
    showToast('Álbum actualizado exitosamente')
  }

  const filteredAlbums = albums.filter(album => {
    const matchesSearch = (album.title || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesArtist = selectedArtist === '' || album.artist_id === parseInt(selectedArtist)
    return matchesSearch && matchesArtist
  })

  const getArtistName = (artistId) => {
    const artist = artists.find(a => a.id === artistId)
    return artist?.name || 'Artista desconocido'
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: isDark ? '#fff' : '#111',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <Disc size={32} color="#dc2626" />
          Gestión de Álbumes
        </h1>
      </div>

      {/* Search and Filter */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search size={20} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: isDark ? '#9ca3af' : '#6b7280'
          }} />
          <input
            type="text"
            placeholder="Buscar álbumes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              background: isDark ? '#1118274d' : '#fff',
              border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
              borderRadius: '8px',
              color: isDark ? '#fff' : '#111',
              fontSize: '14px'
            }}
          />
        </div>

        <select
          value={selectedArtist}
          onChange={(e) => setSelectedArtist(e.target.value)}
          style={{
            padding: '10px 16px',
            background: isDark ? '#11182755' : '#fff',
            border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
            borderRadius: '8px',
            color: isDark ? '#fff' : '#111',
            fontSize: '14px',
            minWidth: '180px'
          }}
        >
          <option value="">Todos los artistas</option>
          {artists.map(artist => (
            <option key={artist.id} value={artist.id}>{artist.name}</option>
          ))}
        </select>
      </div>

      {/* Album Table */}
      {loading ? (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px'
        }}>
          <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#dc2626' }} />
        </div>
      ) : (
        <AlbumTable
          albums={filteredAlbums}
          artists={artists}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modals */}
      <EditAlbumModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        album={selectedAlbum}
        artists={artists}
        onSave={handleSave}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="¿Eliminar álbum?"
        message={`¿Estás seguro de que deseas eliminar el álbum "${selectedAlbum?.title}"? Esta acción no se puede deshacer.`}
      />

      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  )
}

export default Albums
