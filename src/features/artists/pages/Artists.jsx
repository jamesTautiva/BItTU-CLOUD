import { useState, useEffect } from 'react'
import { Loader2, Search, Disc } from 'lucide-react'
import { useThemeStore } from '../../../app/store'
import { artistService } from '../../../services/api'
import ArtistTable from '../components/ArtistTable'
import EditArtistModal from '../components/EditArtistModal'
import DeleteConfirmModal from '../../users/components/DeleteConfirmModal'
import Toast from '../../../components/ui/Toast'

function Artists() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [artistToDelete, setArtistToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  // Toast
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type })
  }

  const hideToast = () => {
    setToast(prev => ({ ...prev, isOpen: false }))
  }

  // Load artists
  useEffect(() => {
    loadArtists()
  }, [])

  const loadArtists = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await artistService.getAll()
      const artistsData = Array.isArray(response) ? response : (response.data || [])
      setArtists(artistsData)
    } catch (err) {
      setError('Error al cargar artistas: ' + (err.message || 'Error desconocido'))
      console.error('Error loading artists:', err)
    } finally {
      setLoading(false)
    }
  }

  // Edit artist
  const handleEditClick = (artist) => {
    setSelectedArtist(artist)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    await loadArtists()
    showToast('Artista actualizado exitosamente', 'success')
  }

  // Delete artist
  const handleDeleteClick = (artist) => {
    setArtistToDelete(artist)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!artistToDelete) return

    try {
      setDeleteLoading(true)
      await artistService.delete(artistToDelete.id)
      setIsDeleteModalOpen(false)
      setArtistToDelete(null)
      await loadArtists()
      showToast('Artista eliminado exitosamente', 'success')
    } catch (err) {
      console.error('Error deleting artist:', err)
      showToast('Error al eliminar artista: ' + (err.message || 'Error desconocido'), 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Filter artists
  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          artist.bio?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || artist.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Disc size={28} color="#dc2626" />
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: isDark ? '#fff' : '#111',
            margin: 0
          }}>
            Gestión de Artistas
          </h1>
        </div>

      </div>

      {/* Search and Filter Bar */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          position: 'relative',
          flex: 1,
          minWidth: '250px'
        }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color:'#ff1212' 
          }} />
          <input
            type="text"
            placeholder="Buscar artistas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              background: isDark ? '#1f293771' : '#fff',
              border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
              borderRadius: '8px',
              color: isDark ? '#fff' : '#111',
              fontSize: '14px'
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '10px 16px',
            background: isDark ? '#1f293769' : '#fff',
            border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
            borderRadius: '8px',
            color: isDark ? '#fff' : '#111',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <option value="all">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="approved">Aprobado</option>
          <option value="rejected">Rechazado</option>
        </select>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 16px',
          background: isDark ? '#1f293771' : '#f3f4f6',
          borderRadius: '8px',
          color: isDark ? '#9ca3af' : '#6b7280',
          fontSize: '14px'
        }}>
          {filteredArtists.length} de {artists.length} artistas
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(220,38,38,0.1)',
          border: '1px solid rgba(220,38,38,0.3)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          color: '#ef4444'
        }}>
          {error}
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px'
        }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginRight: '12px' }} />
          <span>Cargando artistas...</span>
        </div>
      ) : (
        <ArtistTable
          artists={filteredArtists}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Modals */}
      <EditArtistModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedArtist(null)
        }}
        artist={selectedArtist}
        onSave={handleSaveEdit}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setArtistToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        userName={artistToDelete?.name || ''}
        loading={deleteLoading}
      />

      {/* Toast */}
      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
        onClose={hideToast}
        duration={3000}
      />
    </div>
  )
}

export default Artists
