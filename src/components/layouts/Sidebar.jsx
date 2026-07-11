import React from 'react'
import { NavLink } from 'react-router-dom'
import * as Icons from 'lucide-react' // Importa todos los iconos disponibles
import { useThemeStore } from '../../app/store' // Ajusta la ruta a tu store de Zustand/Redux
import { menuOptions } from '../../hooks/menuConfig'
import useAuth from '../../hooks/useAuth' // Ajusta la ruta a tu hook useAuth


function Sidebar() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'
  const { user } = useAuth()
  const iconBittu = '../../../../public/icon-bittu.svg'

  // Filtramos el menú según el rol del usuario conectado en el almacenamiento local
  const menuFiltrado = menuOptions.filter(option => 
    option.role.includes(user?.role)
  )

  return (
    <div style={{
width: '260px',
    height: '100%',                  // 👈 Cambia minHeight: '100vh' por height: '100%'
    background: isDark ? '#000000' : '#ffffff',
    borderRight: `1px solid ${isDark ? 'rgb(110, 0, 0)' : '#e5e7eb'}`,
    padding: '24px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
    boxSizing: 'border-box',
    // position: 'fixed',
    }}>
      {/* Brand / Logo */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', paddingLeft: '8px' }}>
        <img src={iconBittu} alt="Logo" style={{ width: '150px', height: '150px', fill: isDark ? '#ff0000' : '#111' }} />
      </div>

      {/* Navigation Items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {menuFiltrado.map((item) => {
          // Buscamos dinámicamente el componente del icono usando su nombre en string
          const LucideIcon = Icons[item.icon] || Icons.HelpCircle

          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                transition: 'all 0.2s ease',
                background: isActive ? '#dc2626' : 'transparent',
                color: isActive 
                  ? '#ffffff' 
                  : (isDark ? '#9ca3af' : '#4b5563')
              })}
              onMouseEnter={(e) => {
                // Efecto hover suave si no está activo
                if (!e.currentTarget.className.includes('active')) {
                  e.currentTarget.style.background = isDark ? '#1f2937' : '#f3f4f6'
                  e.currentTarget.style.color = isDark ? '#f3f4f6' : '#111'
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.className.includes('active')) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = isDark ? '#9ca3af' : '#4b5563'
                }
              }}
            >
              <LucideIcon size={18} />
              <span>{item.name}</span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}

export default Sidebar