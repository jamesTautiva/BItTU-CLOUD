import { useState, useEffect } from 'react'
import { useThemeStore } from '../../../app/store'
import { ticketService } from '../../../services/api'
import { 
  ArrowLeft, 
  MessageSquare, 
  Send, 
  User, 
  Clock, 
  Tag, 
  Edit, 
  Trash2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader2,
  Paperclip,
  Download
} from 'lucide-react'

function TicketDetail({ ticketId, currentUser, onBack, onEdit }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    if (ticketId) {
      loadTicket()
    }
  }, [ticketId])

  const loadTicket = async () => {
    try {
      setLoading(true)
      const response = await ticketService.getById(ticketId)
      console.log('📋 Respuesta ticket detail:', response)
      
      // El API devuelve directamente el ticket, no response.data
      if (response) {
        setTicket(response)
        console.log('✅ Ticket cargado:', response.id)
        console.log('📋 Mensajes:', response.TicketMessages)
        console.log('📋 Estructura del primer mensaje:', response.TicketMessages?.[0])
      } else {
        console.warn('⚠️ No se encontró el ticket')
        setTicket(null)
      }
    } catch (error) {
      console.error('❌ Error loading ticket:', error)
      console.error('❌ Error response:', error.response)
      console.error('❌ Error status:', error.response?.status)
      setTicket(null)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !ticket) return

    try {
      setSendingMessage(true)
      await ticketService.addMessage(ticketId, newMessage, currentUser.id)
      setNewMessage('')
      // Reload ticket to show new message
      await loadTicket()
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSendingMessage(false)
    }
  }

  const handleStatusUpdate = async (newStatus) => {
    if (!ticket) return

    try {
      await ticketService.updateStatus(ticketId, newStatus)
      await loadTicket()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return '#ef4444'
      case 'in_progress': return '#f59e0b'
      case 'pending_user': return '#3b82f6'
      case 'resolved': return '#10b981'
      case 'closed': return '#6b7280'
      default: return '#6b7280'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'open': return 'Abierto'
      case 'in_progress': return 'En Progreso'
      case 'pending_user': return 'Esperando Usuario'
      case 'resolved': return 'Resuelto'
      case 'closed': return 'Cerrado'
      default: return status
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <AlertCircle size={16} />
      case 'in_progress': return <Clock size={16} />
      case 'pending_user': return <AlertCircle size={16} />
      case 'resolved': return <CheckCircle size={16} />
      case 'closed': return <XCircle size={16} />
      default: return <AlertCircle size={16} />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return '#10b981'
      case 'medium': return '#f59e0b'
      case 'high': return '#ef4444'
      case 'urgent': return '#dc2626'
      default: return '#6b7280'
    }
  }

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'low': return 'Baja'
      case 'medium': return 'Media'
      case 'high': return 'Alta'
      case 'urgent': return 'Urgente'
      default: return priority
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const canRespond = () => {
    if (!ticket || !currentUser) return false
    // User can respond if status is pending_user or if they created the ticket
    return ticket.status === 'pending_user' || ticket.user_id === currentUser.id
  }

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        color: isDark ? '#9ca3af' : '#6b7280'
      }}>
        <Loader2 size={32} className="animate-spin" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        color: isDark ? '#9ca3af' : '#6b7280'
      }}>
        <div style={{ textAlign: 'center' }}>
          <AlertCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3>Ticket no encontrado</h3>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              background: isDark ? '#1f2937' : '#f9fafb',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              color: isDark ? '#fff' : '#111',
              fontSize: '14px'
            }}
          >
            <ArrowLeft size={18} />
            Volver
          </button>
          <div style={{
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            background: `${getStatusColor(ticket.status)}20`,
            color: getStatusColor(ticket.status),
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            {getStatusIcon(ticket.status)}
            {getStatusLabel(ticket.status)}
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={() => onEdit(ticket)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              background: isDark ? '#1f2937' : '#f9fafb',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              color: isDark ? '#fff' : '#111',
              fontSize: '14px'
            }}
          >
            <Edit size={16} />
            Editar
          </button>
        </div>
      </div>

      {/* Ticket Info */}
      <div style={{
        background: isDark ? '#1f2937' : '#fff',
        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '16px'
        }}>
          <div>
            <h1 style={{
              margin: '0 0 8px 0',
              fontSize: '24px',
              fontWeight: '700',
              color: isDark ? '#fff' : '#111'
            }}>
              {ticket.ticket_number} - {ticket.title}
            </h1>
            <p style={{
              margin: '0 0 16px 0',
              fontSize: '16px',
              lineHeight: '1.5',
              color: isDark ? '#d1d5db' : '#374151'
            }}>
              {ticket.description}
            </p>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '14px',
              color: isDark ? '#9ca3af' : '#6b7280'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Tag size={14} />
                <span>{ticket.Category?.name || 'Sin categoría'}</span>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <User size={14} />
                <span>{ticket.User?.username || 'Usuario'}</span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Clock size={14} />
                <span>{formatDate(ticket.created_at)}</span>
              </div>

              <div style={{
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
                background: `${getPriorityColor(ticket.priority)}20`,
                color: getPriorityColor(ticket.priority)
              }}>
                {getPriorityLabel(ticket.priority)}
              </div>
            </div>
          </div>

          {/* Status Actions */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {ticket.status !== 'closed' && (
              <>
                {ticket.status !== 'resolved' && (
                  <button
                    onClick={() => handleStatusUpdate('resolved')}
                    style={{
                      padding: '6px 12px',
                      background: '#10b981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}
                  >
                    Marcar como Resuelto
                  </button>
                )}
                <button
                  onClick={() => handleStatusUpdate('closed')}
                  style={{
                    padding: '6px 12px',
                    background: '#6b7280',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  Cerrar Ticket
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Messages - Messenger Style */}
      <div style={{
        background: isDark ? '#1f2937' : '#fff',
        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h2 style={{
          margin: '0 0 20px 0',
          fontSize: '18px',
          fontWeight: '600',
          color: isDark ? '#fff' : '#111',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <MessageSquare size={20} />
          Conversación ({ticket.TicketMessages?.length || 0})
        </h2>

        {/* Messages List - Messenger Style */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '20px',
          maxHeight: '400px',
          overflowY: 'auto',
          padding: '10px',
          background: isDark ? '#111827' : '#f8fafc',
          borderRadius: '8px'
        }}>
          {ticket.TicketMessages?.map((message) => {
            const isOwnMessage = message.user_id === currentUser.id;
            return (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                  gap: '8px',
                  maxWidth: '100%'
                }}
              >
                {!isOwnMessage && (
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '600',
                    flexShrink: 0,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {message.User?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                
                <div style={{
                  maxWidth: isOwnMessage ? '70%' : '75%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  {!isOwnMessage && (
                    <div style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: isDark ? '#9ca3af' : '#6b7280',
                      marginLeft: '8px'
                    }}>
                      {message.User?.username || 'Usuario'}
                    </div>
                  )}
                  
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '18px',
                    background: isOwnMessage 
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : (isDark ? '#374151' : '#e5e7eb'),
                    color: isOwnMessage ? '#fff' : (isDark ? '#fff' : '#111'),
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    wordBreak: 'break-word',
                    position: 'relative'
                  }}>
                    <p style={{
                      margin: '0',
                      fontSize: '14px',
                      lineHeight: '1.4'
                    }}>
                      {message.message}
                    </p>
                    
                    {/* Timestamp */}
                    <div style={{
                      fontSize: '11px',
                      color: isOwnMessage 
                        ? 'rgba(255,255,255,0.7)' 
                        : (isDark ? '#9ca3af' : '#6b7280'),
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Clock size={10} />
                      {new Date(message.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
                
                {isOwnMessage && (
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '600',
                    flexShrink: 0,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {currentUser?.username?.[0]?.toUpperCase() || 'Y'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Message Input - Messenger Style */}
        <div style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-end',
          padding: '16px',
          background: isDark ? '#111827' : '#f8fafc',
          borderRadius: '12px',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
        }}>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '8px',
              background: isDark ? '#1f2937' : '#fff',
              borderRadius: '24px',
              padding: '8px 12px',
              border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
            }}>
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                rows={1}
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontSize: '14px',
                  background: 'transparent',
                  color: isDark ? '#fff' : '#111',
                  maxHeight: '100px',
                  minHeight: '20px',
                  padding: '4px 0'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
            </div>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendingMessage}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: !newMessage.trim() || sendingMessage 
                ? (isDark ? '#374151' : '#d1d5db')
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              cursor: !newMessage.trim() || sendingMessage ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease'
            }}
          >
            {sendingMessage ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TicketDetail
