import { useState, useEffect } from 'react'
import { useAuthStore, useThemeStore } from '../../app/store'
import { ticketService } from '../../services/api'
import TicketList from './components/TicketList'
import TicketDetail from './components/TicketDetail'
import TicketForm from './components/TicketForm'

function TicketsPage() {
  const { user: currentUser } = useAuthStore()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  
  const [currentView, setCurrentView] = useState('list') // 'list', 'detail', 'form'
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [editingTicket, setEditingTicket] = useState(null)
  const [loadingTicketFromNotification, setLoadingTicketFromNotification] = useState(false)

  const handleTicketSelect = (ticket) => {
    setSelectedTicket(ticket)
    setCurrentView('detail')
  }

  const handleCreateTicket = () => {
    setEditingTicket(null)
    setCurrentView('form')
  }

  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket)
    setCurrentView('form')
  }

  const handleBack = () => {
    setCurrentView('list')
    setSelectedTicket(null)
    setEditingTicket(null)
  }

  const handleSaveTicket = (savedTicket) => {
    setCurrentView('list')
    setSelectedTicket(null)
    setEditingTicket(null)
  }

  // 🎯 Detectar ticket seleccionado desde notificaciones
  useEffect(() => {
    const selectedTicketId = localStorage.getItem('selectedTicketId')
    if (selectedTicketId) {
      console.log('🎫 Ticket seleccionado desde notificación:', selectedTicketId)
      
      // 🔄 Cargar datos completos del ticket
      const loadTicketFromNotification = async () => {
        try {
          setLoadingTicketFromNotification(true)
          console.log('🔍 Cargando ticket desde notificación:', selectedTicketId)
          const ticketData = await ticketService.getById(selectedTicketId)
          
          if (ticketData) {
            console.log('✅ Ticket cargado desde notificación:', ticketData)
            setSelectedTicket(ticketData)
            setCurrentView('detail')
          } else {
            console.warn('⚠️ No se encontró el ticket:', selectedTicketId)
          }
        } catch (error) {
          console.error('❌ Error cargando ticket desde notificación:', error)
          // Si falla, al menos mostrar la vista con el ID
          setSelectedTicket({ id: parseInt(selectedTicketId) })
          setCurrentView('detail')
        } finally {
          setLoadingTicketFromNotification(false)
        }
      }
      
      loadTicketFromNotification()
      
      // Limpiar el localStorage
      localStorage.removeItem('selectedTicketId')
    }
  }, [])
  
  const renderCurrentView = () => {
    // 🔄 Mostrar carga mientras se carga el ticket desde notificación
    if (loadingTicketFromNotification) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px',
          color: isDark ? '#9ca3af' : '#6b7280'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }} />
          <div style={{ fontSize: '16px', fontWeight: '500' }}>
            Cargando ticket...
          </div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            Obteniendo detalles del ticket seleccionado
          </div>
        </div>
      )
    }

    switch (currentView) {
      case 'detail':
        return (
          <TicketDetail
            ticketId={selectedTicket?.id}
            currentUser={currentUser}
            onBack={handleBack}
            onEdit={handleEditTicket}
          />
        )
      case 'form':
        return (
          <TicketForm
            currentUser={currentUser}
            ticket={editingTicket}
            onSave={handleSaveTicket}
            onCancel={handleBack}
          />
        )
      default:
        return (
          <TicketList
            currentUser={currentUser}
            onTicketSelect={handleTicketSelect}
            onCreateTicket={handleCreateTicket}
          />
        )
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      color: isDark ? '#ffffff' : '#000000'
    }}>
      {renderCurrentView()}
    </div>
  )
}

export default TicketsPage
