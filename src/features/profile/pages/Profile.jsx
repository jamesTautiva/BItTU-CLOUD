import { useState, useEffect, useRef } from 'react'
import { User, Mail, Lock, Camera, Save, Loader2, Trash2, AlertTriangle } from 'lucide-react'
import { useThemeStore, useAuthStore } from '../../../app/store'
import { userService, uploadService } from '../../../services/api'
import Toast from '../../../components/ui/Toast'

function Profile() {
  const { theme } = useThemeStore()
  const { user: currentUser, logout } = useAuthStore()
  const isDark = theme === 'dark'
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
  const [activeTab, setActiveTab] = useState('info')

  useEffect(() => {
    if (currentUser?.id) {
      loadProfile()
    }
  }, [currentUser])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const data = await userService.getById(currentUser.id)
      setFormData(prev => ({
        ...prev,
        username: data.username || '',
        email: data.email || ''
      }))
    } catch (err) {
      console.error('Error loading profile:', err)
      showToast('Error al cargar perfil', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type }), 3000)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleUpdateInfo = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await userService.updateProfile(currentUser.id, {
        username: formData.username,
        email: formData.email
      })
      showToast('Perfil actualizado exitosamente')
    } catch (err) {
      console.error('Error updating profile:', err)
      showToast('Error al actualizar perfil', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      showToast('Las contraseñas no coinciden', 'error')
      return
    }
    if (formData.newPassword.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'error')
      return
    }

    setSaving(true)
    try {
      await userService.updateProfile(currentUser.id, {
        password: formData.newPassword
      })
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }))
      showToast('Contraseña actualizada exitosamente')
    } catch (err) {
      console.error('Error changing password:', err)
      showToast('Error al cambiar contraseña', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploadingAvatar(true)
    try {
      const result = await uploadService.uploadAvatar(currentUser.id, file)
      showToast('Avatar actualizado exitosamente')
      // Recargar para obtener el nuevo avatar
      loadProfile()
    } catch (err) {
      console.error('Error uploading avatar:', err)
      showToast('Error al subir avatar', 'error')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      return
    }
    try {
      await userService.deleteProfile(currentUser.id)
      showToast('Cuenta eliminada')
      logout()
    } catch (err) {
      console.error('Error deleting account:', err)
      showToast('Error al eliminar cuenta', 'error')
    }
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px'
      }}>
        <Loader2 size={40} style={{ animation: 'spin 1s linear infinite', color: '#dc2626' }} />
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 700,
          margin: '0 0 8px 0',
          color: isDark ? '#fff' : '#111'
        }}>
          Mi Perfil
        </h1>
        <p style={{
          fontSize: '14px',
          color: isDark ? '#9ca3af' : '#6b7280',
          margin: 0
        }}>
          Gestiona tu información personal y configuración de cuenta
        </p>
      </div>

      {/* Avatar Section */}
      <div style={{
        background: isDark ? '#1f2937' : '#fff',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative' }}>
          {currentUser?.avatar_url ? (
            <img
              src={currentUser.avatar_url}
              alt="Avatar"
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `3px solid ${isDark ? '#374151' : '#e5e7eb'}`
              }}
            />
          ) : (
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: isDark ? '#374151' : '#e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <User size={48} color={isDark ? '#6b7280' : '#9ca3af'} />
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingAvatar}
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#dc2626',
              border: `3px solid ${isDark ? '#1f2937' : '#fff'}`,
              cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: uploadingAvatar ? 0.7 : 1
            }}
          >
            {uploadingAvatar ? (
              <Loader2 size={16} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Camera size={16} color="#fff" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            style={{ display: 'none' }}
          />
        </div>
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            margin: '0 0 4px 0',
            color: isDark ? '#fff' : '#111'
          }}>
            {formData.username}
          </h2>
          <p style={{
            fontSize: '14px',
            color: isDark ? '#9ca3af' : '#6b7280',
            margin: '0 0 8px 0'
          }}>
            {formData.email}
          </p>
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 500,
            textTransform: 'uppercase',
            background: '#dc262620',
            color: '#dc2626'
          }}>
            {currentUser?.role || 'user'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
      }}>
        {[
          { id: 'info', label: 'Información', icon: User },
          { id: 'password', label: 'Contraseña', icon: Lock },
          { id: 'danger', label: 'Peligro', icon: AlertTriangle }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'transparent',
              border: 'none',
              borderBottom: `2px solid ${activeTab === tab.id ? '#dc2626' : 'transparent'}`,
              color: activeTab === tab.id ? '#dc2626' : isDark ? '#9ca3af' : '#6b7280',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{
        background: isDark ? '#1f2937' : '#fff',
        borderRadius: '12px',
        padding: '24px',
        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
      }}>
        {activeTab === 'info' && (
          <form onSubmit={handleUpdateInfo}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              margin: '0 0 20px 0',
              color: isDark ? '#fff' : '#111'
            }}>
              Información Personal
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
                color: isDark ? '#d1d5db' : '#374151'
              }}>
                Nombre de Usuario
              </label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: isDark ? '#6b7280' : '#9ca3af'
                }} />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    background: isDark ? '#111827' : '#fff',
                    border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                    borderRadius: '8px',
                    color: isDark ? '#fff' : '#111',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
                color: isDark ? '#d1d5db' : '#374151'
              }}>
                Correo Electrónico
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: isDark ? '#6b7280' : '#9ca3af'
                }} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    background: isDark ? '#111827' : '#fff',
                    border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                    borderRadius: '8px',
                    color: isDark ? '#fff' : '#111',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
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
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
              Guardar Cambios
            </button>
          </form>
        )}

        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              margin: '0 0 20px 0',
              color: isDark ? '#fff' : '#111'
            }}>
              Cambiar Contraseña
            </h3>
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
                color: isDark ? '#d1d5db' : '#374151'
              }}>
                Nueva Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: isDark ? '#6b7280' : '#9ca3af'
                }} />
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => handleChange('newPassword', e.target.value)}
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    background: isDark ? '#111827' : '#fff',
                    border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                    borderRadius: '8px',
                    color: isDark ? '#fff' : '#111',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
                color: isDark ? '#d1d5db' : '#374151'
              }}>
                Confirmar Nueva Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: isDark ? '#6b7280' : '#9ca3af'
                }} />
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  required
                  placeholder="Repite la contraseña"
                  style={{
                    width: '100%',
                    padding: '10px 12px 10px 40px',
                    background: isDark ? '#111827' : '#fff',
                    border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                    borderRadius: '8px',
                    color: isDark ? '#fff' : '#111',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
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
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={18} />}
              Cambiar Contraseña
            </button>
          </form>
        )}

        {activeTab === 'danger' && (
          <div>
            <h3 style={{
              fontSize: '16px',
              fontWeight: 600,
              margin: '0 0 20px 0',
              color: '#ef4444'
            }}>
              Zona de Peligro
            </h3>
            <p style={{
              fontSize: '14px',
              color: isDark ? '#9ca3af' : '#6b7280',
              marginBottom: '20px'
            }}>
              Una vez que eliminas tu cuenta, no hay vuelta atrás. Esta acción no se puede deshacer.
            </p>
            <button
              onClick={handleDeleteAccount}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                background: '#ef4444',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <Trash2 size={18} />
              Eliminar Mi Cuenta
            </button>
          </div>
        )}
      </div>

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

export default Profile
