import { useThemeStore } from '../../../app/store'
import { Edit2, Trash2, Music, Disc, Plus, Globe, Lock } from 'lucide-react'

function PlaylistTable({ playlists, onEdit, onDelete, onAddSongs }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const getVisibilityIcon = (isPublic) => {
    return isPublic ? <Globe size={14} /> : <Lock size={14} />
  }

  const getVisibilityLabel = (isPublic) => {
    return isPublic ? 'Pública' : 'Privada'
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (playlists.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        background: isDark ? '#1f293765' : '#f9fafb',
        borderRadius: '12px',
        border: `1px dashed ${isDark ? '#374151' : '#d1d5db'}`
      }}>
        <Music size={48} style={{ color: isDark ? '#4b5563' : '#9ca3af', marginBottom: '16px' }} />
        <p style={{ color: isDark ? '#9ca3af' : '#6b7280', fontSize: '16px', margin: 0 }}>
          No hay playlists disponibles
        </p>
        <p style={{ color: isDark ? '#6b7280' : '#9ca3af', fontSize: '14px', marginTop: '8px' }}>
          Crea una nueva playlist para comenzar
        </p>
      </div>
    )
  }

  return (
    <div style={{
      background: isDark ? '#1f2937' : '#fff',
      borderRadius: '12px',
      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
      overflow: 'hidden'
    }}>
      {/* Table Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '80px 1fr 120px 120px 100px 150px',
        gap: '16px',
        padding: '16px 20px',
        background: isDark ? '#111827' : '#f9fafb',
        borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        fontSize: '13px',
        fontWeight: 600,
        color: isDark ? '#9ca3af' : '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.5px'
      }}>
        <div>Imagen</div>
        <div>Nombre</div>
        <div>Canciones</div>
        <div>Duración</div>
        <div>Visibilidad</div>
        <div style={{ textAlign: 'center' }}>Acciones</div>
      </div>

      {/* Table Body */}
      <div>
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '80px 1fr 120px 120px 100px 150px',
              gap: '16px',
              padding: '16px 20px',
              borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              alignItems: 'center',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDark ? '#252f3f' : '#f9fafb'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            {/* Image */}
            <div>
              {playlist.img_playlist_url ? (
                <img
                  src={playlist.img_playlist_url}
                  alt=""
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    objectFit: 'cover'
                  }}
                  onError={(e) => { e.target.style.display = 'none' }}
                />
              ) : (
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '8px',
                  background: isDark ? '#374151' : '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Disc size={28} color={isDark ? '#6b7280' : '#9ca3af'} />
                </div>
              )}
            </div>

            {/* Name & Description */}
            <div>
              <p style={{
                margin: 0,
                fontSize: '15px',
                fontWeight: 600,
                color: isDark ? '#fff' : '#111'
              }}>
                {playlist.name}
              </p>
              {playlist.description && (
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: '13px',
                  color: isDark ? '#9ca3af' : '#6b7280',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {playlist.description}
                </p>
              )}
              <p style={{
                margin: '4px 0 0 0',
                fontSize: '12px',
                color: isDark ? '#6b7280' : '#9ca3af'
              }}>
                Por: {playlist.User?.username || playlist.user?.username || 'Usuario'}
              </p>
            </div>

            {/* Song Count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Music size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
              <span style={{
                fontSize: '14px',
                color: isDark ? '#d1d5db' : '#374151'
              }}>
                {playlist.total_songs || 0}
              </span>
            </div>

            {/* Duration */}
            <div style={{
              fontSize: '14px',
              color: isDark ? '#d1d5db' : '#374151'
            }}>
              {formatDuration(playlist.total_duration)}
            </div>

            {/* Visibility */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 500,
              background: playlist.is_public ? '#22c55e20' : '#6b728020',
              color: playlist.is_public ? '#22c55e' : '#6b7280',
              width: 'fit-content'
            }}>
              {getVisibilityIcon(playlist.is_public)}
              {getVisibilityLabel(playlist.is_public)}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button
                onClick={() => onAddSongs(playlist)}
                style={{
                  background: '#dc2626',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#b91d1d'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#dc2626'
                }}
                title="Agregar canciones"
              >
                <Plus size={16} color="#fff" />
              </button>
              <button
                onClick={() => onEdit(playlist)}
                style={{
                  background: isDark ? '#374151' : '#e5e7eb',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
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
                title="Editar"
              >
                <Edit2 size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
              </button>
              <button
                onClick={() => onDelete(playlist)}
                style={{
                  background: isDark ? '#374151' : '#e5e7eb',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '6px',
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
                title="Eliminar"
              >
                <Trash2 size={16} color="#ef4444" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PlaylistTable
