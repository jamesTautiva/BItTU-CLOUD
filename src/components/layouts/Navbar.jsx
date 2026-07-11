import { Menu, Music2, LogOut, User, Moon, Sun } from 'lucide-react'
import { useAppStore, useAuthStore, useThemeStore } from '../../app/store'
import NotificationWidget from '../../features/notifications/components/NotificationWidget'

function Navbar() {
  const { toggleSidebar } = useAppStore()
  const { user, logout } = useAuthStore()
  const { theme, toggleTheme } = useThemeStore()
  const isDark = theme === 'dark'
  // traer info del localstorage
  const userLocal = JSON.parse(localStorage.getItem('auth-storage'))

  const iconBittu = '../../../../public/icon-bittu.svg'


  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid rgb(117, 0, 0)', background: isDark ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}>
      <div style={{ display: 'flex', height: '56px', alignItems: 'center', padding: '0 16px', gap: '16px' }}>


        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src={iconBittu} alt="Logo" style={{ width: '32px', height: '32px', fill: isDark ? '#ff0000' : '#111' }} />
          <span style={{ fontFamily: 'Cinzel Decorative', fontWeight: 'bold', fontSize: '18px', color: isDark ? '#fff' : '#111' }}>BITU-CLOUD</span>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={toggleTheme}
            style={{ padding: '8px', borderRadius: '6px', background: 'transparent', border: 'none', color: isDark ? '#d1d5db' : '#374151', cursor: 'pointer' }}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <NotificationWidget />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '9999px', background: isDark ? '#374151' : '#e5e7eb' }}>
            <User size={16} />
            <span style={{ fontSize: '14px', color: isDark ? '#fff' : '#374151' }}>{userLocal?.state?.user?.username || 'Usuario'}</span>
          </div>

          <button
            onClick={logout}
            style={{ padding: '8px', borderRadius: '6px', background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer' }}
            title="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
