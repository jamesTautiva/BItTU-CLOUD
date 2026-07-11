import { useState, useEffect } from 'react'
import { useThemeStore } from '../../../app/store'
import { ticketService } from '../../../services/api'
import { 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  User, 
  UserPlus,
  Tag, 
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'

function TicketList({ currentUser, onTicketSelect, onCreateTicket }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [assignedFilter, setAssignedFilter] = useState('all') // 'all', 'mine', 'unassigned'
  const [supportAgents, setSupportAgents] = useState([])
  const [loadingAgents, setLoadingAgents] = useState(false)

  useEffect(() => {
    loadTickets()
    loadSupportAgents()
  }, [statusFilter, priorityFilter, assignedFilter])

  const loadSupportAgents = async () => {
    // Solo cargar si el usuario tiene rol de soporte
    if (!['support', 'admin', 'super_admin', 'moderator'].includes(currentUser?.role)) {
      return
    }

    try {
      setLoadingAgents(true)
      const response = await ticketService.getSupportAgents()
      console.log('📋 Respuesta support agents:', response)
      
      // El API devuelve directamente el array, no response.data
      let agentsData = []
      if (Array.isArray(response)) {
        agentsData = response
      } else if (response.data && Array.isArray(response.data)) {
        agentsData = response.data
      } else {
        console.warn('⚠️ Respuesta inesperada de support agents:', response)
        agentsData = []
      }
      
      console.log('✅ Agentes de soporte cargados:', agentsData.length)
      setSupportAgents(agentsData)
    } catch (error) {
      console.error('❌ Error loading support agents:', error)
      setSupportAgents([])
    } finally {
      setLoadingAgents(false)
    }
  }

  const loadTickets = async () => {
    try {
      setLoading(true)
      const params = {}
      
      // Filtros - solo enviar si no son 'all'
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter
      if (priorityFilter && priorityFilter !== 'all') params.priority = priorityFilter
      
      // Filtro de asignación
      if (assignedFilter === 'mine') {
        params.assigned_to = currentUser.id
      } else if (assignedFilter === 'unassigned') {
        params.assigned_to = null  // Enviar null directamente
      }
      // Si es 'all', no se envía el parámetro assigned_to

      console.log('🔍 Enviando filtros:', { statusFilter, priorityFilter, assignedFilter, params })
      
      const response = await ticketService.getAll(params)
      
      // Procesar respuesta - manejar diferentes formatos
      let ticketsData = []
      if (response && response.tickets && Array.isArray(response.tickets)) {
        ticketsData = response.tickets
      } else if (response && Array.isArray(response)) {
        ticketsData = response
      } else {
        console.warn('⚠️ Respuesta inesperada:', response)
        ticketsData = []
      }
      
      // Aplicar filtros localmente si es necesario (fallback)
      if (assignedFilter === 'unassigned') {
        ticketsData = ticketsData.filter(ticket => !ticket.assignedTo)
      } else if (assignedFilter === 'mine') {
        ticketsData = ticketsData.filter(ticket => ticket.assignedTo?.id === currentUser.id)
      }
      
      if (statusFilter && statusFilter !== 'all') {
        ticketsData = ticketsData.filter(ticket => ticket.status === statusFilter)
      }
      
      if (priorityFilter && priorityFilter !== 'all') {
        ticketsData = ticketsData.filter(ticket => ticket.priority === priorityFilter)
      }
      
      console.log('✅ Tickets finales:', ticketsData.length, 'tickets')
      setTickets(ticketsData)
    } catch (error) {
      console.error('Error loading tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadTickets()
      return
    }

    try {
      setLoading(true)
      const response = await ticketService.search(searchQuery)
      setTickets(response.data || [])
    } catch (error) {
      console.error('Error searching tickets:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignTicket = async (ticketId, agentId) => {
    try {
      await ticketService.assignTicket(ticketId, agentId)
      loadTickets() // Recargar la lista
    } catch (error) {
      console.error('Error assigning ticket:', error)
    }
  }

  const canAssignTickets = () => {
    return ['support', 'admin', 'super_admin', 'moderator'].includes(currentUser?.role)
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
    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffHours < 1) return 'Hace un momento'
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays}d`
    return date.toLocaleDateString('es-ES')
  }

  const filteredTickets = tickets.filter(ticket => {
    if (searchQuery && !searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      ticket.title?.toLowerCase().includes(query) ||
      ticket.description?.toLowerCase().includes(query) ||
      ticket.ticket_number?.toLowerCase().includes(query)
    )
  })

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

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: '700',
          color: isDark ? '#fff' : '#111'
        }}>
          Tickets de Soporte
        </h1>
        <button
          onClick={onCreateTicket}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: '#dc2626',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          <Plus size={18} />
          Nuevo Ticket
        </button>
      </div>

      {/* Search and Filters */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flex: 1,
          minWidth: '200px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flex: 1,
            padding: '8px 12px',
            background: isDark ? '#1f293766' : '#f9fafb',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px'
          }}>
            <Search size={18} color={isDark ? '#9ca3af' : '#6b7280'} />
            <input
              type="text"
              placeholder="Buscar tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                outline: 'none',
                color: isDark ? '#fff' : '#111',
                fontSize: '14px'
              }}
            />
          </div>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            background: isDark ? '#1f293768' : '#f9fafb',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px',
            color: isDark ? '#fff' : '#111',
            fontSize: '14px'
          }}
        >
          <option value="all">Todos los estados</option>
          <option value="open">Abierto</option>
          <option value="in_progress">En Progreso</option>
          <option value="pending_user">Esperando Usuario</option>
          <option value="resolved">Resuelto</option>
          <option value="closed">Cerrado</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            background: isDark ? '#1f293764' : '#f9fafb',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px',
            color: isDark ? '#fff' : '#111',
            fontSize: '14px'
          }}
        >
          <option value="all">Todas las prioridades</option>
          <option value="low">Baja</option>
          <option value="medium">Media</option>
          <option value="high">Alta</option>
          <option value="urgent">Urgente</option>
        </select>

        {/* Assigned Filter */}
        <select
          value={assignedFilter}
          onChange={(e) => setAssignedFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            background: isDark ? '#1f293775' : '#f9fafb',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px',
            color: isDark ? '#fff' : '#111',
            fontSize: '14px'
          }}
        >
          <option value="all">Todos los tickets</option>
          <option value="mine">Mis tickets asignados</option>
          <option value="unassigned">Sin asignar</option>
        </select>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: isDark ? '#9ca3af' : '#6b7280'
        }}>
          <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
            {searchQuery ? 'No se encontraron tickets' : 'No hay tickets'}
          </h3>
          <p style={{ margin: 0, fontSize: '14px' }}>
            {searchQuery 
              ? 'Intenta con otra búsqueda o ajusta los filtros'
              : 'Crea tu primer ticket de soporte'
            }
          </p>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => onTicketSelect(ticket)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '16px 20px',
                background: isDark ? '#1f2937' : '#fff',
                border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                ':hover': {
                  background: isDark ? '#111827' : '#f9fafb',
                  transform: 'translateY(1px)'
                }
              }}
            >
              {/* Status Indicator */}
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: getStatusColor(ticket.status)
              }} />

              {/* Main Content */}
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <div>
                    <h3 style={{
                      margin: '0 0 4px 0',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: isDark ? '#fff' : '#111'
                    }}>
                      {ticket.ticket_number} - {ticket.title}
                    </h3>
                    <p style={{
                      margin: 0,
                      fontSize: '14px',
                      color: isDark ? '#9ca3af' : '#6b7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '600px'
                    }}>
                      {ticket.description}
                    </p>
                  </div>
                  <ChevronRight 
                    size={20} 
                    color={isDark ? '#9ca3af' : '#6b7280'} 
                  />
                </div>

                {/* Meta Information */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '13px',
                  color: isDark ? '#9ca3af' : '#6b7280'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Tag size={14} />
                    <span>{ticket.Category?.name || 'Sin categoría'}</span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <User size={14} />
                    <span>{ticket.creator?.username || 'Usuario'}</span>
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {ticket.assignedTo ? (
                      <>
                        <User size={14} />
                        <span>Asignado a: {ticket.assignedTo.username}</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={14} />
                        <span>Sin asignar</span>
                      </>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Clock size={14} />
                    <span>{formatDate(ticket.created_at)}</span>
                  </div>

                  {/* Priority Badge */}
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

                  {/* Status Badge */}
                  <div style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '500',
                    background: `${getStatusColor(ticket.status)}20`,
                    color: getStatusColor(ticket.status)
                  }}>
                    {getStatusLabel(ticket.status)}
                  </div>

                  {/* Assign Button */}
                  {canAssignTickets() && (
                    <div style={{ position: 'relative' }}>
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            e.stopPropagation()
                            handleAssignTicket(ticket.id, parseInt(e.target.value))
                            e.target.value = '' // Reset select
                          }
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          padding: '4px 8px',
                          background: '#dc2626',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '500',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          appearance: 'none',
                          paddingRight: '20px'
                        }}
                      >
                        <option value="">
                          {loadingAgents ? 'Cargando...' : 'Asignar...'}
                        </option>
                        {supportAgents.map((agent) => (
                          <option key={agent.id} value={agent.id}>
                            {agent.username} ({agent.role})
                          </option>
                        ))}
                      </select>
                      <UserPlus 
                        size={12} 
                        style={{
                          position: 'absolute',
                          right: '6px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          pointerEvents: 'none'
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TicketList
