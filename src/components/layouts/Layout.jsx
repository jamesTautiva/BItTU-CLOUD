import { Outlet } from 'react-router-dom'
import { useThemeStore } from '../../app/store'
import Navbar from './Navbar'
import Sidebar from './Sidebar'
import { MouseBackground } from '../../utils/MouseBackground' // 👈 Importa tu nuevo canvas

function Layout() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex',
      flexDirection: 'column', 
      background: isDark ? '#000000' : '#f3f4f6', 
      color: isDark ? '#fff' : '#111' ,
      width: '100%',
      overflow: 'hidden',
      position: 'relative' // Asegura el contexto de posicionamiento
    }}>
      {/* 1. EL CANVAS SE INYECTA AQUÍ AL FONDO */}
      <MouseBackground />

      {/* 2. El resto de tu layout se mantiene intacto, pero agregamos zIndex para ordenarlos */}
      <Navbar style={{ position: 'relative', zIndex: 10 }} />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 5 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto', height: '100%', boxSizing: 'border-box' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout