import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeStore } from '../../../app/store'
import { notificationService } from '../../../services/api'
import { 
  Bell, 
  CheckCircle, 
  X, 
  Clock, 
  AlertCircle, 
  Info,
  Music,
  MessageSquare,
  User,
  Settings,
  ExternalLink
} from 'lucide-react'

function NotificationWidget() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const navigate = useNavigate()
  
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [badgeAnimation, setBadgeAnimation] = useState(false)
  const [bellColor, setBellColor] = useState(isDark ? '#d1d5db' : '#374151') // Color normal de la campana

  // Obtener currentUser del auth-storage (como en Navbar)
  const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}')
  const currentUser = authStorage.state?.user || {}
  
  console.log('🔍 NotificationWidget - CurrentUser:', currentUser)
  console.log('🔍 NotificationWidget - UserID:', currentUser.id)

  const loadNotifications = async () => {
    if (!currentUser.id) {
      console.warn('⚠️ No currentUser.id available')
      return
    }
    
    try {
      setLoading(true)
      console.log('🔍 Cargando notificaciones para usuario:', currentUser.id)
      
      const response = await notificationService.getUnread(currentUser.id, { limit: 5 })
      console.log('📋 Respuesta getUnread:', response)
      
      const notifData = Array.isArray(response) ? response : response.notifications || []
      console.log('📋 Datos de notificaciones:', notifData)
      setNotifications(notifData)
      
      // Cargar contador
      const countResponse = await notificationService.getCount(currentUser.id)
      console.log('📋 Respuesta getCount:', countResponse)
      
      const count = countResponse.total || countResponse.count || 0
      console.log('📋 Contador de no leídas:', count)
      
      // 🟢 Si hay nuevas notificaciones, activar animación de campana
      if (count > unreadCount && count > 0) {
        console.log('🔔 ¡Nuevas notificaciones detectadas! Activando campana verde')
        triggerBellAnimation()
      }
      
      setUnreadCount(count)
    } catch (error) {
      console.error('❌ Error loading notifications:', error)
      console.error('❌ Error response:', error.response)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId)
      // Actualizar localmente
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      // 🔄 Resetear color de campana si no hay más notificaciones
      if (unreadCount <= 1) {
        setBellColor(isDark ? '#d1d5db' : '#374151')
      }
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  // 🎨 Función para cambiar color de campana cuando llega nueva notificación
  const triggerBellAnimation = () => {
    // 🟢 Cambiar a verde brillante
    setBellColor('#10b981')
    
    // 🔄 Animación de parpadeo
    setTimeout(() => setBellColor(isDark ? '#d1d5db' : '#374151'), 300)
    setTimeout(() => setBellColor('#10b981'), 600)
    setTimeout(() => setBellColor(isDark ? '#d1d5db' : '#374151'), 900)
    setTimeout(() => setBellColor('#10b981'), 1200)
    setTimeout(() => setBellColor(isDark ? '#d1d5db' : '#374151'), 1500)
    
    // 🟢 Mantener verde si hay notificaciones no leídas
    setTimeout(() => {
      if (unreadCount > 0) {
        setBellColor('#10b981')
      }
    }, 1600)
  }

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(currentUser.id)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
      
      // 🔄 Resetear color de campana a normal
      setBellColor(isDark ? '#d1d5db' : '#374151')
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'system': return <Settings size={16} />
      case 'ticket': return <MessageSquare size={16} />
      case 'artist': return <User size={16} />
      case 'album': return <Music size={16} />
      case 'song': return <Music size={16} />
      default: return <Info size={16} />
    }
  }

  const getNotificationColor = (type, priority) => {
    if (priority === 'high') return '#ef4444'
    switch (type) {
      case 'system': return '#6b7280'
      case 'ticket': return '#ef4444'
      case 'artist': return '#8b5cf6'
      case 'album': return '#3b82f6'
      case 'song': return '#10b981'
      default: return '#6b7280'
    }
  }

  const formatTime = (createdAt) => {
    const now = new Date()
    const time = new Date(createdAt)
    const diff = now - time
    
    if (diff < 60000) return 'ahora'
    if (diff < 3600000) return `hace ${Math.floor(diff / 60000)} min`
    if (diff < 86400000) return `hace ${Math.floor(diff / 3600000)} h`
    return `hace ${Math.floor(diff / 86400000)} d`
  }

  useEffect(() => {
    if (currentUser.id) {
      loadNotifications()
      // Recargar cada 30 segundos
      const interval = setInterval(loadNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [currentUser.id])

  // 🟢 Mantener color verde mientras haya notificaciones no leídas
  useEffect(() => {
    if (unreadCount > 0) {
      setBellColor('#10b981')
    } else {
      setBellColor(isDark ? '#d1d5db' : '#374151')
    }
  }, [unreadCount, isDark])

  
  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.notification-widget')) {
        setIsOpen(false)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="notification-widget">
      {/* Botón de notificaciones */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
          if (!isOpen) loadNotifications()
        }}
        style={{
          position: 'relative',
          padding: '8px',
          background: 'transparent',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          color: isDark ? '#fff' : '#111',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.3s ease'
        }}
      >
        <Bell size={20} color={bellColor} />
        
        {/* Badge de contador */}
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            background: '#ef4444',
            color: '#fff',
            fontSize: '10px',
            fontWeight: '600',
            padding: '2px 5px',
            borderRadius: '10px',
            minWidth: '16px',
            textAlign: 'center',
            lineHeight: '1',
            transform: badgeAnimation ? 'scale(1.3)' : 'scale(1)',
            transition: 'transform 0.3s ease',
            boxShadow: badgeAnimation ? '0 0 10px rgba(239, 68, 68, 0.5)' : 'none'
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: '0',
          width: '380px',
          maxHeight: '480px',
          background: isDark ? '#1f2937' : '#fff',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: isDark ? '#fff' : '#111'
            }}>
              Notificaciones
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    background: isDark ? '#374151' : '#f3f4f6',
                    border: 'none',
                    borderRadius: '4px',
                    color: isDark ? '#fff' : '#111',
                    cursor: 'pointer'
                  }}
                >
                  Marcar todas como leídas
                </button>
              )}
              
              <button
                onClick={() => {
                  console.log('🧪 Probando animación de campana verde')
                  triggerBellAnimation()
                }}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  background: '#10b98120',
                  border: '1px solid #10b981',
                  borderRadius: '4px',
                  color: '#10b981',
                  cursor: 'pointer'
                }}
              >
                🟢 Test Campana
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  padding: '4px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  color: isDark ? '#9ca3af' : '#6b7280',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div style={{
            maxHeight: '350px',
            overflowY: 'auto'
          }}>
            {loading ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: isDark ? '#9ca3af' : '#6b7280'
              }}>
                Cargando...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: isDark ? '#9ca3af' : '#6b7280'
              }}>
                <Bell size={48} style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
                <div>No tienes notificaciones</div>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => {
                    console.log('🔍 Click en notificación:', notification)
                    console.log('🔗 Action URL:', notification.action_url)
                    
                    if (!notification.is_read) {
                      markAsRead(notification.id)
                    }
                    
                    if (notification.action_url) {
                      console.log('🚀 Navegando a:', notification.action_url)
                      
                      // 🎯 Manejar navegación interna de tickets
                      if (notification.action_url.startsWith('/tickets/')) {
                        const ticketId = notification.action_url.split('/')[2]
                        console.log('🎫 Ticket ID detectado:', ticketId)
                        
                        // Guardar en localStorage para que TicketsPage lo detecte
                        localStorage.setItem('selectedTicketId', ticketId)
                        
                        // Navegar a la página de tickets
                        navigate('/tickets')
                        
                        // Limpiar después de un tiempo
                        setTimeout(() => {
                          localStorage.removeItem('selectedTicketId')
                        }, 1000)
                      } else {
                        // Para otras URLs, usar navegación normal
                        navigate(notification.action_url)
                      }
                    } else {
                      console.log('⚠️ No hay action_url, no redirige')
                    }
                    setIsOpen(false)
                  }}
                  style={{
                    padding: '16px',
                    borderBottom: `1px solid ${isDark ? '#374151' : '#f3f4f6'}`,
                    cursor: 'pointer',
                    background: notification.is_read 
                      ? 'transparent' 
                      : (isDark ? '#37415120' : '#f9fafb'),
                    display: 'flex',
                    gap: '12px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark ? '#37415140' : '#f3f4f6'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = notification.is_read 
                      ? 'transparent' 
                      : (isDark ? '#37415120' : '#f9fafb')
                  }}
                >
                  {/* Icono */}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: `${getNotificationColor(notification.type, notification.priority)}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: getNotificationColor(notification.type, notification.priority),
                    flexShrink: 0
                  }}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Contenido */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: notification.is_read ? '400' : '600',
                      color: isDark ? '#fff' : '#111',
                      marginBottom: '4px',
                      lineHeight: '1.3'
                    }}>
                      {notification.title}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: isDark ? '#9ca3af' : '#6b7280',
                      marginBottom: '6px',
                      lineHeight: '1.4'
                    }}>
                      {notification.message}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: isDark ? '#6b7280' : '#9ca3af',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Clock size={12} />
                      {formatTime(notification.created_at)}
                    </div>
                  </div>

                  {/* Indicador de no leído */}
                  {!notification.is_read && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: getNotificationColor(notification.type, notification.priority),
                      flexShrink: 0,
                      marginTop: '4px'
                    }} />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={{
              padding: '12px',
              borderTop: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              textAlign: 'center'
            }}>
              <button
                onClick={() => {
                  window.location.href = '/notifications'
                }}
                style={{
                  padding: '8px 16px',
                  background: 'transparent',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '6px',
                  color: isDark ? '#fff' : '#111',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  margin: '0 auto'
                }}
              >
                Ver todas las notificaciones
                <ExternalLink size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationWidget
