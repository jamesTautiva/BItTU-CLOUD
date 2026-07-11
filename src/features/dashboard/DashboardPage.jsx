import { useState, useEffect } from 'react'
import { useThemeStore } from '../../app/store'
import { api } from '../../services/api'
import {
  Users,
  Music,
  Ticket,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  PlayCircle,
  UserCheck,
  BarChart3,
  RefreshCw,
  Activity
} from 'lucide-react'

function DashboardPage() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [stats, setStats] = useState({
    users: { total: 0, active: 0, loading: true },
    artists: { total: 0, active: 0, loading: true },
    songs: { total: 0, active: 0, loading: true },
    tickets: { 
      total: 0, 
      open: 0, 
      inProgress: 0, 
      resolved: 0, 
      closed: 0,
      assigned: 0,
      unassigned: 0,
      loading: true 
    },
    loading: true,
    lastUpdated: null
  })

  const [refreshing, setRefreshing] = useState(false)

  const loadDashboardStats = async () => {
    try {
      setRefreshing(true)
      const newStats = {
        users: { total: 0, active: 0, loading: false },
        artists: { total: 0, active: 0, loading: false },
        songs: { total: 0, active: 0, loading: false },
        tickets: { 
          total: 0, 
          open: 0, 
          inProgress: 0, 
          resolved: 0, 
          closed: 0,
          assigned: 0,
          unassigned: 0,
          loading: false 
        },
        loading: false,
        lastUpdated: new Date()
      }

      // 1. Obtener estadísticas de usuarios
      try {
        const usersResponse = await api.get('/users')
        const users = Array.isArray(usersResponse) ? usersResponse : usersResponse.users || []
        newStats.users = {
          total: users.length,
          active: users.filter(u => u.active).length,
          loading: false
        }
      } catch (error) {
        console.error('Error loading users stats:', error)
      }

      // 2. Obtener estadísticas de artistas
      try {
        const artistsResponse = await api.get('/artist/all')
        const artists = Array.isArray(artistsResponse) ? artistsResponse : artistsResponse.artists || []
        newStats.artists = {
          total: artists.length,
          active: artists.filter(a => a.active).length,
          loading: false
        }
      } catch (error) {
        console.error('Error loading artists stats:', error)
      }

      // 3. Obtener estadísticas de canciones
      try {
        const songsResponse = await api.get('/song/')
        const songs = Array.isArray(songsResponse) ? songsResponse : songsResponse.songs || []
        newStats.songs = {
          total: songs.length,
          active: songs.filter(s => s.active).length,
          loading: false
        }
      } catch (error) {
        console.error('Error loading songs stats:', error)
      }

      // 4. Obtener estadísticas de tickets
      try {
        const ticketsResponse = await api.get('/tickets/all')
        const tickets = Array.isArray(ticketsResponse) ? ticketsResponse : ticketsResponse.tickets || []
        
        newStats.tickets = {
          total: tickets.length,
          open: tickets.filter(t => t.status === 'open').length,
          inProgress: tickets.filter(t => t.status === 'in_progress').length,
          resolved: tickets.filter(t => t.status === 'resolved').length,
          closed: tickets.filter(t => t.status === 'closed').length,
          assigned: tickets.filter(t => t.assignedTo).length,
          unassigned: tickets.filter(t => !t.assignedTo).length,
          loading: false
        }
      } catch (error) {
        console.error('Error loading tickets stats:', error)
      }

      setStats(newStats)

    } catch (error) {
      console.error('Error loading dashboard stats:', error)
      setStats(prev => ({ ...prev, loading: false }))
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const StatCard = ({ title, value, subtitle, icon, color, loading = false }) => (
    <div style={{
      background: isDark ? '#1f293761' : '#fff',
      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
      borderRadius: '12px',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '0',
        right: '0',
        width: '100px',
        height: '100px',
        background: `${color}10`,
        borderRadius: '50%',
        transform: 'translate(30px, -30px)'
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </div>
          {loading && (
            <RefreshCw size={16} className="animate-spin" style={{ color: isDark ? '#333435' : '#6b7280' }} />
          )}
        </div>
        
        <div style={{
          fontSize: '32px',
          fontWeight: '700',
          color: isDark ? '#fff' : '#111',
          marginBottom: '4px'
        }}>
          {loading ? '...' : value.toLocaleString()}
        </div>
        
        <div style={{
          fontSize: '14px',
          color: isDark ? '#9ca3af' : '#6b7280',
          fontWeight: '500'
        }}>
          {title}
        </div>
        
        {subtitle && (
          <div style={{
            fontSize: '12px',
            color: isDark ? '#6b7280' : '#9ca3af',
            marginTop: '4px'
          }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
  )

  const TicketStatusCard = ({ status, count, color, icon }) => (
    <div style={{
      background: isDark ? '#1f293740' : '#fff',
      border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
      borderRadius: '12px',
      padding: '16px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: `${color}20`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: '24px',
          fontWeight: '700',
          color: isDark ? '#fff' : '#111'
        }}>
          {count.toLocaleString()}
        </div>
        <div style={{
          fontSize: '13px',
          color: isDark ? '#9ca3af' : '#6b7280'
        }}>
          {status}
        </div>
      </div>
    </div>
  )

  return (
    <div style={{
      padding: '24px',
      maxWidth: '1400px',
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
            fontSize: '32px',
            fontWeight: '700',
            color: isDark ? '#fff' : '#111',
            margin: '0 0 8px 0'
          }}>
            Dashboard
          </h1>
          <p style={{
            fontSize: '16px',
            color: isDark ? '#9ca3af' : '#6b7280',
            margin: 0
          }}>
            Resumen general del sistema BITU
          </p>
        </div>
        
        <button
          onClick={loadDashboardStats}
          disabled={refreshing}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: isDark ? '#1f2937' : '#f9fafb',
            border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
            borderRadius: '8px',
            color: isDark ? '#fff' : '#111',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Last Updated */}
      {stats.lastUpdated && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '24px',
          fontSize: '14px',
          color: isDark ? '#9ca3af' : '#6b7280'
        }}>
          <Clock size={16} />
          Última actualización: {stats.lastUpdated.toLocaleString()}
        </div>
      )}

      {/* Main Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <StatCard
          title="Total Usuarios"
          value={stats.users.total}
          subtitle={`${stats.users.active} activos`}
          icon={<Users size={24} style={{ color: '#3b82f6' }} />}
          color="#3b82f6"
          loading={stats.users.loading}
        />
        
        <StatCard
          title="Total Artistas"
          value={stats.artists.total}
          subtitle={`${stats.artists.active} activos`}
          icon={<UserCheck size={24} style={{ color: '#8b5cf6' }} />}
          color="#8b5cf6"
          loading={stats.artists.loading}
        />
        
        <StatCard
          title="Total Tickets"
          value={stats.tickets.total}
          subtitle={`${stats.tickets.assigned} asignados`}
          icon={<Ticket size={24} style={{ color: '#ef4444' }} />}
          color="#ef4444"
          loading={stats.tickets.loading}
        />
        
        <StatCard
          title="Total Canciones"
          value={stats.songs.total}
          subtitle={`${stats.songs.active} activas`}
          icon={<Music size={24} style={{ color: '#10b981' }} />}
          color="#10b981"
          loading={stats.songs.loading}
        />
      </div>

      {/* Tickets Status Grid */}
      <div style={{
        marginBottom: '32px'
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
          <BarChart3 size={24} />
          Tickets por Estado
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <TicketStatusCard
            status="Abiertos"
            count={stats.tickets.open}
            color="#ef4444"
            icon={<AlertCircle size={20} style={{ color: '#ef4444' }} />}
          />
          
          <TicketStatusCard
            status="En Progreso"
            count={stats.tickets.inProgress}
            color="#f59e0b"
            icon={<Clock size={20} style={{ color: '#f59e0b' }} />}
          />
          
          <TicketStatusCard
            status="Resueltos"
            count={stats.tickets.resolved}
            color="#10b981"
            icon={<CheckCircle size={20} style={{ color: '#10b981' }} />}
          />
          
          <TicketStatusCard
            status="Cerrados"
            count={stats.tickets.closed}
            color="#6b7280"
            icon={<Activity size={20} style={{ color: '#6b7280' }} />}
          />
        </div>
      </div>

      {/* Additional Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {/* Assignment Stats */}
        <div style={{
          background: isDark ? '#1f293757' : '#fff',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          borderRadius: '12px',
          padding: '24px'
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
            <Users size={20} />
            Distribución de Tickets
          </h3>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Asignados:</span>
            <span style={{ 
              color: isDark ? '#fff' : '#111', 
              fontWeight: '600' 
            }}>
              {stats.tickets.assigned}
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Sin asignar:</span>
            <span style={{ 
              color: isDark ? '#fff' : '#111', 
              fontWeight: '600' 
            }}>
              {stats.tickets.unassigned}
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Tasa de asignación:</span>
            <span style={{ 
              color: isDark ? '#fff' : '#111', 
              fontWeight: '600' 
            }}>
              {stats.tickets.total > 0 
                ? `${Math.round((stats.tickets.assigned / stats.tickets.total) * 100)}%`
                : '0%'
              }
            </span>
          </div>
        </div>

        {/* Activity Summary */}
        <div style={{
          background: isDark ? '#1f29376f' : '#fff',
          border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
          borderRadius: '12px',
          padding: '24px'
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
            <TrendingUp size={20} />
            Actividad del Sistema
          </h3>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Usuarios activos:</span>
            <span style={{ 
              color: isDark ? '#fff' : '#111', 
              fontWeight: '600' 
            }}>
              {stats.users.total > 0 
                ? `${Math.round((stats.users.active / stats.users.total) * 100)}%`
                : '0%'
              }
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Artistas activos:</span>
            <span style={{ 
              color: isDark ? '#fff' : '#111', 
              fontWeight: '600' 
            }}>
              {stats.artists.total > 0 
                ? `${Math.round((stats.artists.active / stats.artists.total) * 100)}%`
                : '0%'
              }
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>Canciones activas:</span>
            <span style={{ 
              color: isDark ? '#fff' : '#111', 
              fontWeight: '600' 
            }}>
              {stats.songs.total > 0 
                ? `${Math.round((stats.songs.active / stats.songs.total) * 100)}%`
                : '0%'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
