import { useState, useEffect } from 'react'
import { useThemeStore } from '../../app/store'
import { api } from '../../services/api'
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Server, 
  Database, 
  Wifi, 
  Clock,
  RefreshCw,
  Activity,
  Users,
  Ticket,
  Music
} from 'lucide-react'

function SettingsPage() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [systemStatus, setSystemStatus] = useState({
    api: null,
    database: null,
    tickets: null,
    categories: null,
    users: null,
    loading: true,
    lastCheck: null
  })

  const [refreshing, setRefreshing] = useState(false)

  const checkSystemStatus = async () => {
    try {
      setRefreshing(true)
      const results = {}
      
      // 1. Verificar API Health
      try {
        const apiResponse = await api.get('/health')
        results.api = {
          status: 'success',
          message: apiResponse.message || 'API funcionando correctamente',
          response: apiResponse
        }
      } catch (error) {
        results.api = {
          status: 'error',
          message: 'Error de conexión con API',
          error: error.message
        }
      }

      // 2. Verificar Base de Datos (usando endpoint de tickets)
      try {
        const dbResponse = await api.get('/tickets/test-db')
        results.database = {
          status: 'success',
          message: 'Base de datos conectada',
          data: dbResponse.tests,
          response: dbResponse
        }
      } catch (error) {
        results.database = {
          status: 'error',
          message: 'Error de conexión con base de datos',
          error: error.message
        }
      }

      // 3. Verificar Tickets
      try {
        const ticketsResponse = await api.get('/tickets/all')
        const ticketsCount = ticketsResponse.tickets?.length || ticketsResponse?.length || 0
        results.tickets = {
          status: 'success',
          message: `${ticketsCount} tickets en sistema`,
          count: ticketsCount,
          response: ticketsResponse
        }
      } catch (error) {
        results.tickets = {
          status: 'error',
          message: 'Error al cargar tickets',
          error: error.message
        }
      }

      // 4. Verificar Categorías
      try {
        const categoriesResponse = await api.get('/tickets/categories/all')
        const categoriesCount = Array.isArray(categoriesResponse) ? categoriesResponse.length : 0
        results.categories = {
          status: 'success',
          message: `${categoriesCount} categorías disponibles`,
          count: categoriesCount,
          response: categoriesResponse
        }
      } catch (error) {
        results.categories = {
          status: 'error',
          message: 'Error al cargar categorías',
          error: error.message
        }
      }

      // 5. Verificar Usuarios de Soporte
      try {
        const agentsResponse = await api.get('/tickets/support-agents')
        const agentsCount = Array.isArray(agentsResponse) ? agentsResponse.length : 0
        results.users = {
          status: 'success',
          message: `${agentsCount} agentes de soporte`,
          count: agentsCount,
          response: agentsResponse
        }
      } catch (error) {
        results.users = {
          status: 'error',
          message: 'Error al cargar agentes de soporte',
          error: error.message
        }
      }

      setSystemStatus({
        ...results,
        loading: false,
        lastCheck: new Date()
      })

    } catch (error) {
      console.error('Error checking system status:', error)
      setSystemStatus(prev => ({
        ...prev,
        loading: false,
        lastCheck: new Date()
      }))
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    checkSystemStatus()
  }, [])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />
      case 'error':
        return <XCircle size={20} className="text-red-500" />
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-500" />
      default:
        return <Clock size={20} className="text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return isDark ? '#10b981' : '#059669'
      case 'error':
        return isDark ? '#ef4444' : '#dc2626'
      case 'warning':
        return isDark ? '#f59e0b' : '#d97706'
      default:
        return isDark ? '#6b7280' : '#4b5563'
    }
  }

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: isDark ? '#fff' : '#111',
            margin: '0 0 8px 0'
          }}>
            Configuración del Sistema
          </h1>
          <p style={{
            fontSize: '16px',
            color: isDark ? '#9ca3af' : '#6b7280',
            margin: 0
          }}>
            Monitoreo del estado y conexión del sistema BITU
          </p>
        </div>
        
        <button
          onClick={checkSystemStatus}
          disabled={refreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: isDark ? '#1f29379d' : '#f9fafb',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px',
            color: isDark ? '#fff' : '#111',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Verificando...' : 'Actualizar Estado'}
        </button>
      </div>

      {/* Last Check */}
      {systemStatus.lastCheck && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px',
          fontSize: '14px',
          color: isDark ? '#9ca3af' : '#6b7280'
        }}>
          <Clock size={16} />
          Última verificación: {systemStatus.lastCheck.toLocaleString()}
        </div>
      )}

      {/* Status Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* API Status */}
        <div style={{
          background: isDark ? '#1f293765' : '#fff',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <Server size={24} style={{ color: getStatusColor(systemStatus.api?.status) }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: isDark ? '#fff' : '#111',
              margin: 0
            }}>
              API Server
            </h3>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            {getStatusIcon(systemStatus.api?.status)}
            <span style={{
              fontSize: '14px',
              color: getStatusColor(systemStatus.api?.status)
            }}>
              {systemStatus.api?.message || 'Verificando...'}
            </span>
          </div>
        </div>

        {/* Database Status */}
        <div style={{
          background: isDark ? '#1f293767' : '#fff',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <Database size={24} style={{ color: getStatusColor(systemStatus.database?.status) }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: isDark ? '#fff' : '#111',
              margin: 0
            }}>
              Base de Datos
            </h3>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            {getStatusIcon(systemStatus.database?.status)}
            <span style={{
              fontSize: '14px',
              color: getStatusColor(systemStatus.database?.status)
            }}>
              {systemStatus.database?.message || 'Verificando...'}
            </span>
          </div>
          {systemStatus.database?.data && (
            <div style={{
              fontSize: '12px',
              color: isDark ? '#9ca3af' : '#6b7280',
              marginTop: '8px'
            }}>
              Categorías: {systemStatus.database.data.categoryQuery?.results || 0} | 
              Tickets: {systemStatus.database.data.ticketModel?.results || 0}
            </div>
          )}
        </div>

        {/* Tickets Status */}
        <div style={{
          background: isDark ? '#1f293768' : '#fff',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <Ticket size={24} style={{ color: getStatusColor(systemStatus.tickets?.status) }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: isDark ? '#fff' : '#111',
              margin: 0
            }}>
              Sistema de Tickets
            </h3>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            {getStatusIcon(systemStatus.tickets?.status)}
            <span style={{
              fontSize: '14px',
              color: getStatusColor(systemStatus.tickets?.status)
            }}>
              {systemStatus.tickets?.message || 'Verificando...'}
            </span>
          </div>
        </div>

        {/* Categories Status */}
        <div style={{
          background: isDark ? '#1f293765' : '#fff',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <Activity size={24} style={{ color: getStatusColor(systemStatus.categories?.status) }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: isDark ? '#fff' : '#111',
              margin: 0
            }}>
              Categorías
            </h3>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            {getStatusIcon(systemStatus.categories?.status)}
            <span style={{
              fontSize: '14px',
              color: getStatusColor(systemStatus.categories?.status)
            }}>
              {systemStatus.categories?.message || 'Verificando...'}
            </span>
          </div>
        </div>

        {/* Support Agents Status */}
        <div style={{
          background: isDark ? '#1f293767' : '#fff',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          borderRadius: '12px',
          padding: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <Users size={24} style={{ color: getStatusColor(systemStatus.users?.status) }} />
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: isDark ? '#fff' : '#111',
              margin: 0
            }}>
              Agentes de Soporte
            </h3>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px'
          }}>
            {getStatusIcon(systemStatus.users?.status)}
            <span style={{
              fontSize: '14px',
              color: getStatusColor(systemStatus.users?.status)
            }}>
              {systemStatus.users?.message || 'Verificando...'}
            </span>
          </div>
        </div>
      </div>

      {/* Overall System Status */}
      <div style={{
        background: isDark ? '#1f293768' : '#fff',
        border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: '600',
          color: isDark ? '#fff' : '#111',
          margin: '0 0 16px 0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Wifi size={24} />
          Estado General del Sistema
        </h2>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px',
          background: (() => {
            const allSuccess = Object.values(systemStatus).filter(val => val?.status === 'success').length >= 4
            return allSuccess 
              ? (isDark ? '#065f46' : '#d1fae5')
              : (isDark ? '#7f1d1d' : '#fee2e2')
          })(),
          borderRadius: '8px',
          border: `1px solid ${(() => {
            const allSuccess = Object.values(systemStatus).filter(val => val?.status === 'success').length >= 4
            return allSuccess 
              ? (isDark ? '#10b981' : '#059669')
              : (isDark ? '#ef4444' : '#dc2626')
          })()}`
        }}>
          {(() => {
            const allSuccess = Object.values(systemStatus).filter(val => val?.status === 'success').length >= 4
            return allSuccess ? (
              <>
                <CheckCircle size={20} className="text-green-500" />
                <span style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: isDark ? '#10b981' : '#059669'
                }}>
                  Sistema funcionando correctamente
                </span>
              </>
            ) : (
              <>
                <AlertCircle size={20} className="text-red-500" />
                <span style={{
                  fontSize: '16px',
                  fontWeight: '500',
                  color: isDark ? '#ef4444' : '#dc2626'
                }}>
                  Hay problemas en el sistema
                </span>
              </>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
