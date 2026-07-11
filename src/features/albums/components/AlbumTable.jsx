import { Edit2, Trash2, Disc } from 'lucide-react'
import { useThemeStore } from '../../../app/store'
import { Permiso } from '../../../hooks/permissions'

function AlbumTable({ albums, artists, onEdit, onDelete }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const getArtistName = (artistId) => {
    const artist = artists.find(a => a.id === artistId)
    return artist?.name || 'Artista desconocido'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return '#22c55e'
      case 'active': return '#22c55e'
      case 'pending': return '#f59e0b'
      case 'inactive': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'approved': return 'Activo'
      case 'active': return 'Activo'
      case 'pending': return 'Pendiente'
      case 'inactive': return 'Inactivo'
      default: return status
    }
  }

  if (albums.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '60px 20px',
        color: isDark ? '#9ca3af' : '#6b7280'
      }}>
        <Disc size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
        <p style={{ fontSize: '16px' }}>No se encontraron álbumes</p>
      </div>
    )
  }

  return (
    <div style={{
      background: isDark ? '#1f293760' : '#fff',
      borderRadius: '12px',
      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
      overflow: 'hidden'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{
            background: isDark ? '#950000' : '#f9fafb',
            borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
          }}>
            <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: isDark ? '#d1d5db' : '#374151' }}>Imagen</th>
            <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: isDark ? '#d1d5db' : '#374151' }}>Álbum</th>
            <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: isDark ? '#d1d5db' : '#374151' }}>Artista</th>
            <th style={{ padding: '16px', textAlign: 'left', fontSize: '14px', fontWeight: 600, color: isDark ? '#d1d5db' : '#374151' }}>Estado</th>
            <th style={{ padding: '16px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: isDark ? '#d1d5db' : '#374151' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {albums.map((album) => (
            <tr
              key={album.id}
              style={{
                borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                transition: 'background 0.2s',
                ':hover': { background: isDark ? '#111827' : '#f9fafb' }
              }}
            >
              <td style={{ padding: '16px' }}>
                {album.cover_image ? (
                  <img
                    src={album.cover_image}
                    alt={album.title}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    background: isDark ? '#374151' : '#e5e7eb',
                    display: album.cover_image ? 'none' : 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Disc size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
                </div>
              </td>
              <td style={{ padding: '16px' }}>
                <div style={{ fontWeight: 600, color: isDark ? '#fff' : '#111', fontSize: '14px' }}>
                  {album.title}
                </div>
                <div style={{ fontSize: '13px', color: isDark ? '#9ca3af' : '#6b7280', marginTop: '4px' }}>
                  {album.release_date ? new Date(album.release_date).getFullYear() : 'Sin fecha'}
                </div>
              </td>
              <td style={{ padding: '16px', color: isDark ? '#d1d5db' : '#374151', fontSize: '14px' }}>
                {getArtistName(album.artist_id)}
              </td>
              <td style={{ padding: '16px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: `${getStatusColor(album.status)}20`,
                  color: getStatusColor(album.status)
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: getStatusColor(album.status)
                  }} />
                  {getStatusLabel(album.status)}
                </span>
              </td>
              <td style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  <Permiso rolesPermitidos={['admin', 'super_admin', 'moderator']}>
                  <button
                    onClick={() => onEdit(album)}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: isDark ? '#374151' : '#f3f4f6',
                      color: isDark ? '#60a5fa' : '#2563eb',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    title="Editar"
                  >
                    <Edit2 size={18} />
                  </button>
                  </Permiso>
                  <Permiso rolesPermitidos={['admin', 'super_admin', 'moderator']}>
                  <button
                    onClick={() => onDelete(album)}
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      border: 'none',
                      background: isDark ? '#374151' : '#f3f4f6',
                      color: isDark ? '#f87171' : '#dc2626',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
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

export default AlbumTable
