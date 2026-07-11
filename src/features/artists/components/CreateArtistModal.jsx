import { useState, useEffect } from 'react'
import { useThemeStore } from '../../../app/store'
import { userService } from '../../../services/api'
import { X, User, Loader2, Upload, Users } from 'lucide-react'

function CreateArtistModal({ isOpen, onClose, onSubmit }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [artistUsers, setArtistUsers] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    user_id: '',
    status: 'pending'
  })

  // Cargar usuarios con rol 'artist' al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadArtistUsers()
    }
  }, [isOpen])

  const loadArtistUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await userService.getAll()
      const users = Array.isArray(response) ? response : (response.data || [])
      // Filtrar solo usuarios con rol 'artist'
      const artists = users.filter(user => user.role === 'artist')
      setArtistUsers(artists)
    } catch (err) {
      console.error('Error loading artist users:', err)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validar que se seleccionó un usuario
    if (!formData.user_id) {
      alert('Debes seleccionar un usuario artista')
      return
    }
    
    setLoading(true)
    try {
      // Convertir user_id a número
      const dataToSubmit = {
        ...formData,
        user_id: parseInt(formData.user_id, 10)
      }
      await onSubmit(dataToSubmit)
      setFormData({ name: '', bio: '', user_id: '', status: 'pending' })
      onClose()
    } catch (err) {
      console.error('Error creating artist:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

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
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
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
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'rgba(220, 38, 38, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={20} color="#dc2626" />
            </div>
            <div>
              <h2 style={{
                fontSize: '18px',
                fontWeight: 700,
                color: isDark ? '#fff' : '#111',
                margin: 0
              }}>
                Crear Nuevo Artista
              </h2>
              <p style={{
                fontSize: '13px',
                color: isDark ? '#9ca3af' : '#6b7280',
                margin: 0
              }}>
                Completa la información del artista
              </p>
            </div>
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
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
              placeholder="Nombre artístico"
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
              <Users size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Usuario Artista Asociado *
            </label>
            
            {loadingUsers ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 12px',
                background: isDark ? '#111827' : '#f3f4f6',
                borderRadius: '6px',
                color: isDark ? '#9ca3af' : '#6b7280'
              }}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Cargando usuarios artista...</span>
              </div>
            ) : artistUsers.length === 0 ? (
              <div style={{
                padding: '12px',
                background: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                border: `1px solid ${isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                borderRadius: '6px',
                color: '#f59e0b',
                fontSize: '13px'
              }}>
                No hay usuarios con rol "artist" disponibles.
                <br />
                Crea un usuario con rol "artist" primero.
              </div>
            ) : (
              <select
                value={formData.user_id}
                onChange={(e) => handleChange('user_id', e.target.value)}
                required
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
                <option value="">Selecciona un usuario artista...</option>
                {artistUsers.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.username} ({user.email}) - ID: {user.id}
                  </option>
                ))}
              </select>
            )}
            
            {!loadingUsers && artistUsers.length > 0 && (
              <p style={{
                fontSize: '12px',
                color: isDark ? '#6b7280' : '#9ca3af',
                margin: '4px 0 0 0'
              }}>
                {artistUsers.length} usuario(s) con rol "artist" disponible(s)
              </p>
            )}
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
              placeholder="Descripción del artista..."
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
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: '#dc2626',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={18} />}
              {loading ? 'Creando...' : 'Crear Artista'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateArtistModal
