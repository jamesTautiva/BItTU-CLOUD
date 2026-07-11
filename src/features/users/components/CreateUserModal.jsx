import { useState } from 'react'
import { X, Upload, User } from 'lucide-react'
import { useThemeStore } from '../../../app/store'

function CreateUserModal({ isOpen, onClose, onSubmit }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    avatar_url: ''
  })
  const [previewAvatar, setPreviewAvatar] = useState(null)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPreviewAvatar(URL.createObjectURL(file))
      // En producción subirías el archivo y obtendrías la URL
      setFormData({ ...formData, avatar_file: file })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await onSubmit(formData)
    setLoading(false)
    setFormData({ username: '', email: '', password: '', role: 'user', avatar_url: '' })
    setPreviewAvatar(null)
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.64)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div style={{
        background: isDark ? '#1f2937dd' : '#fff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '480px',
        maxHeight: '90vh',
        overflow: 'auto',
        margin: '16px',
        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: isDark ? '#fff' : '#111'
          }}>
            Crear Usuario
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '6px',
              background: 'transparent',
              border: 'none',
              color: isDark ? '#9ca3af' : '#6b7280',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Avatar Upload */}
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: isDark ? '#374151' : '#e5e7eb',
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: `2px dashed ${isDark ? '#6b7280' : '#9ca3af'}`
            }}>
              {previewAvatar ? (
                <img
                  src={previewAvatar}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <User size={40} color={isDark ? '#6b7280' : '#9ca3af'} />
              )}
            </div>
            <label style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              background: isDark ? '#374151' : '#f3f4f6',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              color: isDark ? '#d1d5db' : '#374151'
            }}>
              <Upload size={16} />
              <span>Subir avatar</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {/* Username */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '6px',
              color: isDark ? '#d1d5db' : '#374151'
            }}>
              Nombre de usuario *
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Ej: juan_perez"
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

          {/* Email */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '6px',
              color: isDark ? '#d1d5db' : '#374151'
            }}>
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="usuario@ejemplo.com"
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

          {/* Rol */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '6px',
              color: isDark ? '#d1d5db' : '#374151'
            }}>
              Rol *
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
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
              <option value="user">Usuario</option>
              <option value="artist">Artista</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '6px',
              color: isDark ? '#d1d5db' : '#374151'
            }}>
              Contraseña *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
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

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                borderRadius: '6px',
                color: isDark ? '#d1d5db' : '#374151',
                fontSize: '14px',
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
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Creando...' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateUserModal
