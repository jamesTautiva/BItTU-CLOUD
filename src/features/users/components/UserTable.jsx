import { Pencil, Trash2, User } from 'lucide-react'
import { useThemeStore } from '../../../app/store'
import { Permiso } from '../../../hooks/permissions'

function UserTable({ users, onEdit, onDelete, editingUser, onSaveEdit, onCancelEdit, editForm, onEditFormChange }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <div style={{
      background: isDark ? '#1f29377d' : '#fff',
      borderRadius: '8px',
      border: `1px solid ${isDark ? '#321414' : '#e5e7eb'}`,
      overflow: 'hidden'
    }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{
              background: isDark ? '#9b0101' : '#f9fafb',
              borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
            }}>
              <th style={{
                padding: '14px 16px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: isDark ? '#9ca3af' : '#6b7280',
                letterSpacing: '0.5px'
              }}>
                Avatar
              </th>
              <th style={{
                padding: '14px 16px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: isDark ? '#9ca3af' : '#6b7280',
                letterSpacing: '0.5px'
              }}>
                Username
              </th>
              <th style={{
                padding: '14px 16px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: isDark ? '#9ca3af' : '#6b7280',
                letterSpacing: '0.5px'
              }}>
                Email
              </th>
              <th style={{
                padding: '14px 16px',
                textAlign: 'left',
                fontSize: '12px',
                fontWeight: 600,
                textTransform: 'uppercase',
                color: isDark ? '#9ca3af' : '#6b7280',
                letterSpacing: '0.5px'
              }}>
                Rol
              </th>
              <th style={{
                  padding: '14px 16px',
                  textAlign: 'center',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: isDark ? '#9ca3af' : '#6b7280',
                  letterSpacing: '0.5px'
                }}>
                
                  Acciones
                </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isEditing = editingUser === user.id

              return (
                <tr
                  key={user.id}
                  style={{
                    borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                    background: isEditing
                      ? (isDark ? 'rgba(220,38,38,0.1)' : 'rgba(220,38,38,0.05)')
                      : 'transparent'
                  }}
                >
                  {/* Avatar */}
                  <td style={{ padding: '12px 16px' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                          {editForm.previewAvatar || user.avatar_url ? (
                            <img
                              src={editForm.previewAvatar || user.avatar_url}
                              alt={user.username}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <User size={24} color={isDark ? '#6b7280' : '#9ca3af'} />
                          )}
                        </div>
                        <label style={{
                          fontSize: '12px',
                          color: '#dc2626',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}>
                          Cambiar
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => onEditFormChange('avatar_file', e.target.files[0])}
                            style={{ display: 'none' }}
                          />
                        </label>
                      </div>
                    ) : (
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: isDark ? '#374151' : '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}>
                        {user.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.username}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div style={{
                          display: user.avatar_url ? 'none' : 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: '100%'
                        }}>
                          <User size={20} color={isDark ? '#6b7280' : '#9ca3af'} />
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Username */}
                  <td style={{ padding: '12px 16px' }}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.username}
                        onChange={(e) => onEditFormChange('username', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: isDark ? '#111827' : '#fff',
                          border: `1px solid ${isDark ? '#dc2626' : '#dc2626'}`,
                          borderRadius: '6px',
                          color: isDark ? '#fff' : '#111',
                          fontSize: '14px'
                        }}
                      />
                    ) : (
                      <span style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: isDark ? '#fff' : '#111'
                      }}>
                        {user.username}
                      </span>
                    )}
                  </td>

                  {/* Email */}
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      fontSize: '14px',
                      color: isDark ? '#d1d5db' : '#374151'
                    }}>
                      {user.email}
                    </span>
                  </td>

                  {/* Rol */}
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '9999px',
                      fontSize: '12px',
                      fontWeight: 500,
                      background: user.role === 'admin' || user.role === 'super_admin'
                        ? 'rgba(220,38,38,0.2)'
                        : (isDark ? '#374151' : '#e5e7eb'),
                      color: user.role === 'admin' || user.role === 'super_admin'
                        ? '#ef4444'
                        : (isDark ? '#d1d5db' : '#374151')
                    }}>
                      {user.role || 'user'}
                    </span>
                  </td>

                  {/* Acciones */}
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => onSaveEdit(user.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#dc2626',
                            border: 'none',
                            borderRadius: '4px',
                            color: '#fff',
                            fontSize: '12px',
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          Guardar
                        </button>
                        <button
                          onClick={onCancelEdit}
                          style={{
                            padding: '6px 12px',
                            background: 'transparent',
                            border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                            borderRadius: '4px',
                            color: isDark ? '#d1d5db' : '#374151',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <Permiso rolesPermitidos={['admin', 'super_admin']}>
                          <button
                            onClick={() => onEdit(user)}
                            style={{
                              padding: '8px',
                              background: 'transparent',
                            border: 'none',
                            borderRadius: '6px',
                            color: isDark ? '#9ca3af' : '#6b7280',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#dc2626'
                            e.currentTarget.style.background = isDark ? 'rgba(220,38,38,0.1)' : 'rgba(220,38,38,0.05)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = isDark ? '#9ca3af' : '#6b7280'
                            e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          <Pencil size={18} />
                        </button>
                        
                        </Permiso>
                        <Permiso rolesPermitidos={['admin', 'super_admin']}>
                          <button
                            onClick={() => onDelete(user)}
                            style={{
                              padding: '8px',
                              background: 'transparent',
                            border: 'none',
                            borderRadius: '6px',
                            color: isDark ? '#9ca3af' : '#6b7280',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = '#dc2626'
                            e.currentTarget.style.background = isDark ? 'rgba(220,38,38,0.1)' : 'rgba(220,38,38,0.05)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = isDark ? '#9ca3af' : '#6b7280'
                            e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                        
                        </Permiso>

                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div style={{
          padding: '48px 24px',
          textAlign: 'center',
          color: isDark ? '#9ca3af' : '#6b7280'
        }}>
          <User size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <p style={{ fontSize: '14px', margin: 0 }}>
            No hay usuarios registrados
          </p>
        </div>
      )}
    </div>
  )
}

export default UserTable
