import { useState, useEffect } from 'react'
import { Loader2, Search, Plus, ListMusic } from 'lucide-react'
import { useThemeStore, useAuthStore } from '../../../app/store'
import { playlistService, songService, albumService } from '../../../services/api'
import PlaylistTable from '../components/PlaylistTable'
import EditPlaylistModal from '../components/EditPlaylistModal'
import AddSongsToPlaylistModal from '../components/AddSongsToPlaylistModal'
import DeleteConfirmModal from '../../users/components/DeleteConfirmModal'
import Toast from '../../../components/ui/Toast'
import { Permiso } from '../../../hooks/permissions'

function Playlists() {
  const { theme } = useThemeStore()
  const { user } = useAuthStore()
  const isDark = theme === 'dark'

  const [playlists, setPlaylists] = useState([])
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isAddSongsModalOpen, setIsAddSongsModalOpen] = useState(false)
  const [selectedPlaylist, setSelectedPlaylist] = useState(null)

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  useEffect(() => {
    loadPlaylists()
    loadSongs()
  }, [])

  const loadPlaylists = async () => {
    setLoading(true)
    try {
      // Cargar playlists del usuario actual para mostrar todas (públicas y privadas)
      let data = []
      if (user?.id) {
        try {
          data = await playlistService.getByUser(user.id)
        } catch (userErr) {
          console.log('Error loading user playlists, falling back to all:', userErr)
          data = await playlistService.getAll()
        }
      } else {
        data = await playlistService.getAll()
      }
      console.log('Playlists loaded:', data)
      setPlaylists(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading playlists:', err)
      showToast('Error al cargar playlists', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadSongs = async () => {
    try {
      const data = await songService.getAll()
      setSongs(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading songs:', err)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type }), 3000)
  }

  const getFilteredPlaylists = () => {
    if (!searchTerm) return playlists
    return playlists.filter(playlist =>
      playlist.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      playlist.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const handleCreate = async (formData) => {
    console.log('Creating playlist with data:', { ...formData, user_id: user?.id })
    console.log('Current user:', user)
    
    if (!user?.id) {
      showToast('Error: Usuario no identificado', 'error')
      return
    }
    
    try {
      const dataToSend = {
        name: formData.name,
        description: formData.description || '',
        is_public: formData.is_public !== undefined ? formData.is_public : true,
        user_id: parseInt(user.id)
      }
      console.log('Sending to API:', dataToSend)
      
      const result = await playlistService.create(dataToSend)
      console.log('Playlist created:', result)
      
      showToast('Playlist creada exitosamente')
      loadPlaylists()
      setIsCreateModalOpen(false)
      
      // Abrir modal para agregar canciones
      const newPlaylist = result.playlist || result
      if (newPlaylist?.id) {
        setSelectedPlaylist(newPlaylist)
        setIsAddSongsModalOpen(true)
      }
    } catch (err) {
      console.error('Error creating playlist:', err)
      console.error('Error response:', err.response?.data)
      const errorMsg = err.response?.data?.message || err.message || 'Error desconocido'
      showToast(`Error: ${errorMsg}`, 'error')
    }
  }

  const handleEdit = (playlist) => {
    setSelectedPlaylist(playlist)
    setIsEditModalOpen(true)
  }

  const handleUpdate = async (formData) => {
    try {
      await playlistService.update(selectedPlaylist.id, formData)
      showToast('Playlist actualizada exitosamente')
      loadPlaylists()
      setIsEditModalOpen(false)
      setSelectedPlaylist(null)
    } catch (err) {
      console.error('Error updating playlist:', err)
      showToast('Error al actualizar playlist', 'error')
    }
  }

  const handleDelete = (playlist) => {
    setSelectedPlaylist(playlist)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedPlaylist) return
    try {
      await playlistService.delete(selectedPlaylist.id)
      showToast('Playlist eliminada exitosamente')
      loadPlaylists()
    } catch (err) {
      console.error('Error deleting playlist:', err)
      showToast('Error al eliminar playlist', 'error')
    } finally {
      setIsDeleteModalOpen(false)
      setSelectedPlaylist(null)
    }
  }

  const handleAddSong = async (playlistId, songId) => {
    try {
      await playlistService.addSong(playlistId, songId)
      showToast('Canción agregada a la playlist')
      // Refresh playlist details
      if (selectedPlaylist?.id === playlistId) {
        const updated = await playlistService.getById(playlistId)
        setSelectedPlaylist(updated)
      }
      loadPlaylists()
    } catch (err) {
      console.error('Error adding song:', err)
      showToast('Error al agregar canción', 'error')
    }
  }

  const handleRemoveSong = async (playlistId, songId) => {
    try {
      await playlistService.removeSong(playlistId, songId)
      showToast('Canción eliminada de la playlist')
      // Refresh playlist details
      if (selectedPlaylist?.id === playlistId) {
        const updated = await playlistService.getById(playlistId)
        setSelectedPlaylist(updated)
      }
      loadPlaylists()
    } catch (err) {
      console.error('Error removing song:', err)
      showToast('Error al quitar canción', 'error')
    }
  }

  const filteredPlaylists = getFilteredPlaylists()

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
          <ListMusic size={28} color="#dc2626" />
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            margin: 0,
            color: isDark ? '#fff' : '#111'
          }}>
            Gestión de Playlists
          </h1>
        </div>

        <Permiso rolesPermitidos={['admin', 'super_admin', 'moderator']}>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            padding: '10px 20px',
            background: '#dc2626',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer'
          }}
        >
          <Plus size={18} />
          Nueva Playlist
        </button>
        </Permiso>
      </div>

      {/* Stats & Search */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          fontSize: '14px',
          color: isDark ? '#9ca3af' : '#6b7280'
        }}>
          <span>
            <strong style={{ color: isDark ? '#fff' : '#111' }}>{filteredPlaylists.length}</strong> playlists
          </span>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', minWidth: '300px' }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: isDark ? '#6b7280' : '#9ca3af'
          }} />
          <input
            type="text"
            placeholder="Buscar playlists..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              background: isDark ? '#1f29376e' : '#fff',
              border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
              borderRadius: '8px',
              color: isDark ? '#fff' : '#111',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>
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
        <PlaylistTable
          playlists={filteredPlaylists}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddSongs={(playlist) => {
            setSelectedPlaylist(playlist)
            setIsAddSongsModalOpen(true)
          }}
        />
      )}

      {/* Create Modal */}
      <EditPlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreate}
        mode="create"
      />

      {/* Edit Modal */}
      <EditPlaylistModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedPlaylist(null)
        }}
        playlist={selectedPlaylist}
        onSave={handleUpdate}
        mode="edit"
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setSelectedPlaylist(null)
        }}
        onConfirm={confirmDelete}
        title="Eliminar Playlist"
        message={`¿Estás seguro de que deseas eliminar la playlist "${selectedPlaylist?.name}"? Esta acción no se puede deshacer.`}
      />

      {/* Add Songs Modal */}
      <AddSongsToPlaylistModal
        isOpen={isAddSongsModalOpen}
        onClose={() => {
          setIsAddSongsModalOpen(false)
          setSelectedPlaylist(null)
          loadPlaylists()
        }}
        playlist={selectedPlaylist}
        onSongsAdded={loadPlaylists}
      />

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

export default Playlists
