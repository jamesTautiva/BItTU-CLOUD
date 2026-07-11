import { Pencil, Trash2, User, Disc, Music } from 'lucide-react'
import { useThemeStore } from '../../../app/store'
import { Permiso } from '../../../hooks/permissions'

function ArtistTable({ artists, onEdit, onDelete }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

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

  if (artists.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '64px',
        color: isDark ? '#9ca3af' : '#6b7280'
      }}>
        <User size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <p>No se encontraron artistas</p>
      </div>
    )
  }

  return (
    <div style={{
      background: isDark ? '#1f293770' : '#fff',
      borderRadius: '8px',
      overflow: 'hidden',
      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{
            background: isDark ? '#940000' : '#f9fafb',
            borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
          }}>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: isDark ? '#9ca3af' : '#6b7280', textTransform: 'uppercase' }}>Imagen</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: isDark ? '#9ca3af' : '#6b7280', textTransform: 'uppercase' }}>Artista</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: isDark ? '#9ca3af' : '#6b7280', textTransform: 'uppercase' }}>Estado</th>
            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 600, color: isDark ? '#9ca3af' : '#6b7280', textTransform: 'uppercase' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {artists.map((artist) => (
            <tr
              key={artist.id}
              style={{
                borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
              }}
            >
              {/* Imagen */}
              <td style={{ padding: '12px 16px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: isDark ? '#374151' : '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden'
                }}>
                  {artist.artist_image ? (
                    <img
                      src={artist.artist_image}
                      alt={artist.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <div style={{
                    display: artist.artist_image ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    height: '100%'
                  }}>
                    <User size={24} color={isDark ? '#6b7280' : '#9ca3af'} />
                  </div>
                </div>
              </td>

              {/* Nombre y Bio */}
              <td style={{ padding: '12px 16px' }}>
                <div>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: isDark ? '#fff' : '#111'
                  }}>
                    {artist.name}
                  </span>
                  {artist.bio && (
                    <p style={{
                      fontSize: '12px',
                      color: isDark ? '#9ca3af' : '#6b7280',
                      margin: '4px 0 0 0',
                      maxWidth: '300px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {artist.bio}
                    </p>
                  )}
                </div>
              </td>

              {/* Estado */}
              <td style={{ padding: '12px 16px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: 500,
                  background: `${getStatusColor(artist.status)}20`,
                  color: getStatusColor(artist.status)
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: getStatusColor(artist.status)
                  }} />
                  {getStatusLabel(artist.status)}
                </span>
              </td>

              {/* Acciones */}
              <td style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Permiso rolesPermitidos={['admin', 'super_admin', 'moderator']}>
                  <button
                    onClick={() => onEdit(artist)}
                    style={{
                      padding: '8px',
                      background: isDark ? '#374151' : '#f3f4f6',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: isDark ? '#fff' : '#374151',
                      transition: 'all 0.2s'
                    }}
                    title="Editar artista"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#dc2626'
                      e.currentTarget.style.color = '#fff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDark ? '#374151' : '#f3f4f6'
                      e.currentTarget.style.color = isDark ? '#fff' : '#374151'
                    }}
                  >
                    <Pencil size={16} />
                  </button>
                  </Permiso>

                  <Permiso rolesPermitidos={['admin', 'super_admin']}>
                  <button
                    onClick={() => onDelete(artist)}
                    style={{
                      padding: '8px',
                      background: isDark ? '#374151' : '#f3f4f6',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: isDark ? '#fff' : '#374151',
                      transition: 'all 0.2s'
                    }}
                    title="Eliminar artista"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#dc2626'
                      e.currentTarget.style.color = '#fff'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isDark ? '#374151' : '#f3f4f6'
                      e.currentTarget.style.color = isDark ? '#fff' : '#374151'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                  </Permiso>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ArtistTable
