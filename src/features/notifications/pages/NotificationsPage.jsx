import { useState, useEffect } from 'react'
import { useThemeStore } from '../../../app/store'
import { notificationService, userService, artistService } from '../../../services/api'
import { 
  Bell, 
  Send, 
  RefreshCw,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react'

function NotificationsPage() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [notificationForm, setNotificationForm] = useState({
    type: 'system',
    title: '',
    message: '',
    priority: 'medium',
    action_url: '',
    targetRole: 'all', // 'all', 'user', 'artist'
    targetUsers: [] // Para selección específica
  })

  const [users, setUsers] = useState([])
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingArtists, setLoadingArtists] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)

  const currentUser = JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.user || {}

  // Función para mostrar notificaciones toast
  const showToast = (message, type = 'success') => {
    // Crear elemento toast
    const toast = document.createElement('div')
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      z-index: 9999;
      font-size: 14px;
      font-weight: 500;
      max-width: 400px;
      word-wrap: break-word;
      animation: slideIn 0.3s ease-out;
    `
    toast.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        ${type === 'success' ? '✅' : '❌'}
        <span>${message}</span>
      </div>
    `
    
    // Agregar animación
    const style = document.createElement('style')
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `
    document.head.appendChild(style)
    
    document.body.appendChild(toast)
    
    // Remover después de 3 segundos
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-in'
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style)
        }
      }, 300)
    }, 3000)
  }

  // Cargar usuarios y artistas
  useEffect(() => {
    loadUsers()
    loadArtists()
  }, [])

  // Función para recargar datos
  const reloadData = async () => {
    await Promise.all([loadUsers(), loadArtists()])
  }

  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      console.log('🔍 Cargando usuarios...')
      const response = await userService.getAll()
      console.log('📋 Respuesta usuarios:', response)
      
      const usersData = Array.isArray(response) ? response : response.users || []
      console.log('� Todos los usuarios recibidos:', usersData)
      console.log('📋 Roles encontrados:', usersData.map(u => ({ id: u.id, username: u.username, role: u.role })))
      
      const filteredUsers = usersData.filter(u => u.role === 'user')
      console.log('👥 Usuarios con role=user:', filteredUsers)
      console.log('👥 Total usuarios con role=user:', filteredUsers.length)
      
      setUsers(filteredUsers)
    } catch (error) {
      console.error('❌ Error loading users:', error)
      // Intentar con fetch directo como fallback
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/users/all', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        const usersData = Array.isArray(data) ? data : data.users || []
        
        console.log('📋 Fallback - Todos los usuarios:', usersData)
        console.log('📋 Fallback - Roles:', usersData.map(u => ({ id: u.id, username: u.username, role: u.role })))
        
        const filteredUsers = usersData.filter(u => u.role === 'user')
        console.log('👥 Fallback - Usuarios con role=user:', filteredUsers)
        
        setUsers(filteredUsers)
      } catch (fallbackError) {
        console.error('❌ Error en fallback:', fallbackError)
      }
    } finally {
      setLoadingUsers(false)
    }
  }

  const loadArtists = async () => {
    try {
      setLoadingArtists(true)
      console.log('🔍 Cargando artistas...')
      const response = await artistService.getAll()
      console.log('📋 Respuesta artistas:', response)
      
      const artistsData = Array.isArray(response) ? response : response.artists || []
      console.log('🎨 Artistas cargados:', artistsData)
      
      // 🔍 Debug detallado de estructura de artistas
      if (artistsData.length > 0) {
        console.log('🔍 Estructura del primer artista:', artistsData[0])
        console.log('🔍 Campos disponibles:', Object.keys(artistsData[0]))
        console.log('🔍 avatar_url:', artistsData[0].avatar_url)
        console.log('🔍 image:', artistsData[0].image)
        console.log('🔍 profile_picture:', artistsData[0].profile_picture)
        console.log('🔍 photo:', artistsData[0].photo)
      }
      
      setArtists(artistsData)
    } catch (error) {
      console.error('❌ Error loading artists:', error)
      // Intentar con fetch directo como fallback
      try {
        const token = localStorage.getItem('token')
        const response = await fetch('/api/artist/all', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        const artistsData = Array.isArray(data) ? data : data.artists || []
        
        // 🔍 Debug también en fallback
        if (artistsData.length > 0) {
          console.log('🔍 Estructura fallback artista:', artistsData[0])
          console.log('🔍 Campos fallback:', Object.keys(artistsData[0]))
        }
        
        setArtists(artistsData)
      } catch (fallbackError) {
        console.error('❌ Error en fallback artistas:', fallbackError)
      }
    } finally {
      setLoadingArtists(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNotificationForm(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleUserToggle = (userId) => {
    console.log('🔍 handleUserToggle llamado con userId:', userId)
    setNotificationForm(prev => {
      const newTargetUsers = prev.targetUsers.includes(userId)
        ? prev.targetUsers.filter(id => id !== userId)
        : [...prev.targetUsers, userId]
      
      console.log('🔍 Nuevos targetUsers:', newTargetUsers)
      
      return {
        ...prev,
        targetUsers: newTargetUsers
      }
    })
  }

  const sendNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      setResult({
        type: 'error',
        message: 'El título y mensaje son obligatorios'
      })
      return
    }

    try {
      setSending(true)
      setResult(null)

      let targetUsers = []

      // Determinar usuarios objetivo
      if (notificationForm.targetRole === 'all') {
        // Todos los usuarios y artistas
        targetUsers = [
          ...users.map(u => u.id),
          ...artists.map(a => a.user_id) // Usar user_id para artistas
        ]
      } else if (notificationForm.targetRole === 'user') {
        // Solo usuarios específicos o todos los usuarios
        targetUsers = notificationForm.targetUsers.length > 0
          ? notificationForm.targetUsers
          : users.map(u => u.id)
      } else if (notificationForm.targetRole === 'artist') {
        // Solo artistas específicos o todos los artistas
        targetUsers = notificationForm.targetUsers.length > 0
          ? notificationForm.targetUsers
          : artists.map(a => a.user_id) // Usar user_id para artistas
      }

      if (targetUsers.length === 0) {
        setResult({
          type: 'error',
          message: 'No hay usuarios seleccionados para enviar la notificación'
        })
        return
      }

      // Enviar notificación bulk
      const response = await notificationService.createBulk({
        user_ids: targetUsers,
        type: notificationForm.type,
        title: notificationForm.title,
        message: notificationForm.message,
        priority: notificationForm.priority,
        action_url: notificationForm.action_url || null
      })

      setResult({
        type: 'success',
        message: `Notificación enviada exitosamente a ${targetUsers.length} usuarios`,
        details: response
      })

      // Mostrar notificación toast de éxito
      showToast(`✅ Notificación enviada exitosamente a ${targetUsers.length} usuarios`, 'success')

      // Resetear formulario
      setNotificationForm({
        type: 'system',
        title: '',
        message: '',
        priority: 'medium',
        action_url: '',
        targetRole: 'all',
        targetUsers: []
      })

    } catch (error) {
      console.error('Error sending notification:', error)
      setResult({
        type: 'error',
        message: 'Error al enviar la notificación',
        details: error.message
      })
      
      // Mostrar notificación toast de error
      showToast('❌ Error al enviar la notificación', 'error')
    } finally {
      setSending(false)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'system': return <Bell size={18} />
      case 'ticket': return <Bell size={18} />
      case 'artist': return <Bell size={18} />
      case 'album': return <Bell size={18} />
      case 'song': return <Bell size={18} />
      default: return <Bell size={18} />
    }
  }

  const getTargetUsers = () => {
    console.log('🔍 getTargetUsers llamado con targetRole:', notificationForm.targetRole)
    console.log('🔍 users.length:', users.length)
    console.log('🔍 artists.length:', artists.length)
    
    // 🔍 Debug específico para usuarios
    if (notificationForm.targetRole === 'user') {
      console.log('🔍 Filtrando usuarios con role=user...')
      console.log('🔍 Usuarios actuales:', users.map(u => ({ id: u.id, username: u.username, role: u.role })))
    }
    
    let result = []
    if (notificationForm.targetRole === 'all') {
      result = [
        ...users.map(u => ({ ...u, type: 'user' })),
        ...artists.map(a => ({ ...a, type: 'artist', id: a.user_id })) // Usar user_id para artistas
      ]
    } else if (notificationForm.targetRole === 'user') {
      result = users.map(u => ({ ...u, type: 'user' }))
      console.log('🔍 Resultado usuarios filtrados:', result.map(u => ({ id: u.id, username: u.username, role: u.role, type: u.type })))
    } else if (notificationForm.targetRole === 'artist') {
      result = artists.map(a => ({ ...a, type: 'artist', id: a.user_id })) // Usar user_id para artistas
    }
    
    console.log('🔍 Resultado getTargetUsers:', result)
    console.log('🔍 Longitud resultado:', result.length)
    
    return result
  }

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '32px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: isDark ? '#fff' : '#111',
              margin: '0 0 8px 0'
            }}>
              Crear Notificaciones
            </h1>
            <p style={{
              fontSize: '16px',
              color: isDark ? '#9ca3af' : '#6b7280',
              margin: 0
            }}>
              Envía notificaciones a usuarios y artistas del sistema
            </p>
          </div>
          
          <button
            onClick={reloadData}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: isDark ? '#374151' : '#f3f4f6',
              border: 'none',
              borderRadius: '8px',
              color: isDark ? '#fff' : '#111',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <RefreshCw size={16} />
            Recargar Datos
          </button>
        </div>
        
        {/* Debug Info */}
        <div style={{
          display: 'flex',
          gap: '24px',
          padding: '12px 16px',
          background: isDark ? '#1f2937' : '#f9fafb',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          borderRadius: '8px',
          fontSize: '14px',
          color: isDark ? '#9ca3af' : '#6b7280'
        }}>
          <div>
            <strong>Usuarios (role: user):</strong> {users.length}
          </div>
          <div>
            <strong>Artistas:</strong> {artists.length}
          </div>
          <div>
            <strong>Total destinatarios:</strong> {users.length + artists.length}
          </div>
          <div>
            <strong>Usuario actual:</strong> {currentUser.username || 'N/A'} ({currentUser.role || 'N/A'})
          </div>
        </div>
      </div>

      {/* Result Message */}
      {result && (
        <div style={{
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '24px',
          border: `1px solid ${
            result.type === 'success' 
              ? '#10b981' 
              : '#ef4444'
          }`,
          background: result.type === 'success'
            ? (isDark ? '#064e3b' : '#d1fae5')
            : (isDark ? '#7f1d1d' : '#fee2e2'),
          color: result.type === 'success'
            ? '#10b981'
            : '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {result.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <div>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>
              {result.message}
            </div>
            {result.details && (
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                {JSON.stringify(result.details)}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px'
      }}>
        {/* Formulario */}
        <div style={{
          background: isDark ? '#1f2937' : '#fff',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: isDark ? '#fff' : '#111',
            margin: '0 0 20px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Send size={24} />
            Detalles de la Notificación
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Tipo */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: isDark ? '#fff' : '#111',
                marginBottom: '8px'
              }}>
                Tipo de Notificación
              </label>
              <select
                name="type"
                value={notificationForm.type}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  background: isDark ? '#111827' : '#fff',
                  color: isDark ? '#fff' : '#111',
                  fontSize: '14px'
                }}
              >
                <option value="system">Sistema</option>
                <option value="ticket">Tickets</option>
                <option value="artist">Artistas</option>
                <option value="album">Álbumes</option>
                <option value="song">Canciones</option>
              </select>
            </div>

            {/* Título */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: isDark ? '#fff' : '#111',
                marginBottom: '8px'
              }}>
                Título *
              </label>
              <input
                type="text"
                name="title"
                value={notificationForm.title}
                onChange={handleInputChange}
                placeholder="Título de la notificación"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  background: isDark ? '#111827' : '#fff',
                  color: isDark ? '#fff' : '#111',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Mensaje */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: isDark ? '#fff' : '#111',
                marginBottom: '8px'
              }}>
                Mensaje *
              </label>
              <textarea
                name="message"
                value={notificationForm.message}
                onChange={handleInputChange}
                placeholder="Mensaje detallado de la notificación"
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  background: isDark ? '#111827' : '#fff',
                  color: isDark ? '#fff' : '#111',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Prioridad */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: isDark ? '#fff' : '#111',
                marginBottom: '8px'
              }}>
                Prioridad
              </label>
              <select
                name="priority"
                value={notificationForm.priority}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  background: isDark ? '#111827' : '#fff',
                  color: isDark ? '#fff' : '#111',
                  fontSize: '14px'
                }}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
              </select>
            </div>

            {/* URL de Acción */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: isDark ? '#fff' : '#111',
                marginBottom: '8px'
              }}>
                URL de Acción (opcional)
              </label>
              <input
                type="text"
                name="action_url"
                value={notificationForm.action_url}
                onChange={handleInputChange}
                placeholder="/tickets/123 o /profile"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  background: isDark ? '#111827' : '#fff',
                  color: isDark ? '#fff' : '#111',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Botón de enviar */}
            <button
              onClick={sendNotification}
              disabled={sending}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 20px',
                background: sending ? '#9ca3af' : '#10b981',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                cursor: sending ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              {sending ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Enviar Notificación
                </>
              )}
            </button>
          </div>
        </div>

        {/* Selección de Destinatarios */}
        <div style={{
          background: isDark ? '#1f2937' : '#fff',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: isDark ? '#fff' : '#111',
            margin: '0 0 20px 0'
          }}>
            Destinatarios
          </h2>

          {/* Rol objetivo */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: isDark ? '#fff' : '#111',
              marginBottom: '8px'
            }}>
              Enviar a
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { value: 'all', label: 'Todos' },
                { value: 'user', label: 'Usuarios' },
                { value: 'artist', label: 'Artistas' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setNotificationForm(prev => ({
                    ...prev,
                    targetRole: option.value,
                    targetUsers: []
                  }))}
                  style={{
                    padding: '10px 20px',
                    border: `1px solid ${notificationForm.targetRole === option.value ? '#3b82f6' : isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    background: notificationForm.targetRole === option.value ? '#3b82f6' : isDark ? '#111827' : '#fff',
                    color: notificationForm.targetRole === option.value ? '#fff' : isDark ? '#fff' : '#111',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lista de usuarios */}
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <label style={{
                fontSize: '14px',
                fontWeight: '500',
                color: isDark ? '#fff' : '#111'
              }}>
                {notificationForm.targetRole === 'all' && 'Todos los usuarios y artistas'}
                {notificationForm.targetRole === 'user' && 'Usuarios'}
                {notificationForm.targetRole === 'artist' && 'Artistas'}
              </label>
              
              {notificationForm.targetRole !== 'all' && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <button
                    onClick={() => {
                      const targetUsers = getTargetUsers()
                      const allIds = targetUsers.map(u => u.id)
                      console.log('🔍 Seleccionando todos:', allIds)
                      setNotificationForm(prev => ({
                        ...prev,
                        targetUsers: allIds
                      }))
                    }}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      background: isDark ? '#374151' : '#f3f4f6',
                      border: '1px solid ' + (isDark ? '#4b5563' : '#d1d5db'),
                      borderRadius: '4px',
                      color: isDark ? '#fff' : '#111',
                      cursor: 'pointer'
                    }}
                  >
                    Seleccionar todos
                  </button>
                  
                  <button
                    onClick={() => {
                      console.log('🔍 Deseleccionando todos')
                      setNotificationForm(prev => ({
                        ...prev,
                        targetUsers: []
                      }))
                    }}
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      background: isDark ? '#374151' : '#f3f4f6',
                      border: '1px solid ' + (isDark ? '#4b5563' : '#d1d5db'),
                      borderRadius: '4px',
                      color: isDark ? '#fff' : '#111',
                      cursor: 'pointer'
                    }}
                  >
                    Deseleccionar todos
                  </button>
                  
                  <div style={{
                    fontSize: '12px',
                    color: isDark ? '#9ca3af' : '#6b7280'
                  }}>
                    {notificationForm.targetUsers.length} seleccionados
                  </div>
                </div>
              )}
            </div>

            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              padding: '8px'
            }}>
              {notificationForm.targetRole === 'all' ? (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: isDark ? '#9ca3af' : '#6b7280'
                }}>
                  <Bell size={48} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                  <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                    Enviando a todos
                  </div>
                  <div style={{ fontSize: '14px' }}>
                    La notificación se enviará a todos los usuarios y artistas del sistema
                  </div>
                  <div style={{
                    marginTop: '16px',
                    padding: '12px',
                    background: isDark ? '#37415120' : '#f3f4f6',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}>
                    Total: {users.length + artists.length} destinatarios
                  </div>
                </div>
              ) : (
                getTargetUsers().map(targetUser => (
                  <div
                    key={targetUser.id}
                    onClick={() => handleUserToggle(targetUser.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: notificationForm.targetUsers.includes(targetUser.id)
                        ? (isDark ? '#10b98120' : '#d1fae5')
                        : 'transparent',
                      border: notificationForm.targetUsers.includes(targetUser.id)
                        ? `1px solid #10b981`
                        : `1px solid transparent`,
                      marginBottom: '4px',
                      transition: 'all 0.2s'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={notificationForm.targetUsers.includes(targetUser.id)}
                      onChange={() => {}}
                      style={{ margin: 0 }}
                    />
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: targetUser.type === 'artist' ? '#8b5cf620' : '#3b82f620',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: targetUser.type === 'artist' ? '#8b5cf6' : '#3b82f6',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {(() => {
                        const imageUrl = targetUser.avatar_url || 
                                         targetUser.image || 
                                         targetUser.profile_picture || 
                                         targetUser.photo ||
                                         targetUser.profile_image ||
                                         targetUser.picture ||
                                         targetUser.img ||
                                         targetUser.avatar ||
                                         targetUser.artist_image ||
                                         targetUser.cover_image
                        console.log('🔍 Avatar check para:', targetUser.name || targetUser.username)
                        console.log('🔍 avatar_url:', targetUser.avatar_url)
                        console.log('🔍 image:', targetUser.image)
                        console.log('🔍 profile_picture:', targetUser.profile_picture)
                        console.log('🔍 photo:', targetUser.photo)
                        console.log('🔍 profile_image:', targetUser.profile_image)
                        console.log('🔍 picture:', targetUser.picture)
                        console.log('🔍 img:', targetUser.img)
                        console.log('🔍 avatar:', targetUser.avatar)
                        console.log('🔍 artist_image:', targetUser.artist_image)
                        console.log('🔍 cover_image:', targetUser.cover_image)
                        console.log('🔍 imageUrl final:', imageUrl)
                        
                        // Log específico para artistas
                        if (targetUser.type === 'artist') {
                            console.log('🎨 ARTISTA DETECTADO:', targetUser.name)
                            console.log('🎨 artist_image valor:', targetUser.artist_image)
                            console.log('🎨 imageUrl para artista:', imageUrl)
                        }
                        return imageUrl
                      })() ? (
                        <img
                          src={targetUser.avatar_url || 
                               targetUser.image || 
                               targetUser.profile_picture || 
                               targetUser.photo ||
                               targetUser.profile_image ||
                               targetUser.picture ||
                               targetUser.img ||
                               targetUser.avatar ||
                               targetUser.artist_image ||
                               targetUser.cover_image}
                          alt={targetUser.username || targetUser.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: '50%'
                          }}
                          onError={(e) => {
                            // Si la imagen falla, mostrar el icono
                            console.log('❌ Error cargando imagen:', e.target.src)
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                          onLoad={(e) => {
                            console.log('✅ Imagen cargada exitosamente:', e.target.src)
                          }}
                        />
                      ) : null}
                      <div style={{
                        display: (targetUser.avatar_url || 
                                 targetUser.image || 
                                 targetUser.profile_picture || 
                                 targetUser.photo ||
                                 targetUser.profile_image ||
                                 targetUser.picture ||
                                 targetUser.img ||
                                 targetUser.avatar ||
                                 targetUser.artist_image ||
                                 targetUser.cover_image) ? 'none' : 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Bell size={18} />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: isDark ? '#fff' : '#111'
                      }}>
                        {targetUser.username || targetUser.name}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: isDark ? '#9ca3af' : '#6b7280'
                      }}>
                        {targetUser.email} • {targetUser.type}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      {notificationForm.title && notificationForm.message && (
        <div style={{
          marginTop: '24px',
          background: isDark ? '#1f2937' : '#fff',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: isDark ? '#fff' : '#111',
            margin: '0 0 16px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Bell size={20} />
            Vista Previa
          </h3>
          
          <div style={{
            display: 'flex',
            gap: '12px',
            padding: '16px',
            background: isDark ? '#37415120' : '#f9fafb',
            borderRadius: '8px',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: `${notificationForm.priority === 'high' ? '#ef4444' : notificationForm.priority === 'medium' ? '#f59e0b' : '#10b981'}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: notificationForm.priority === 'high' ? '#ef4444' : notificationForm.priority === 'medium' ? '#f59e0b' : '#10b981'
            }}>
              {getNotificationIcon(notificationForm.type)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: isDark ? '#fff' : '#111',
                marginBottom: '4px'
              }}>
                {notificationForm.title}
              </div>
              <div style={{
                fontSize: '14px',
                color: isDark ? '#9ca3af' : '#6b7280',
                lineHeight: '1.4'
              }}>
                {notificationForm.message}
              </div>
              {notificationForm.action_url && (
                <div style={{
                  fontSize: '12px',
                  color: '#3b82f6',
                  marginTop: '8px'
                }}>
                  📎 {notificationForm.action_url}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


export default NotificationsPage
