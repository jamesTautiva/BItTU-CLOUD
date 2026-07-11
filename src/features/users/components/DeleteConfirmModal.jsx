import { useThemeStore } from '../../../app/store'
import { AlertTriangle, X } from 'lucide-react'

function DeleteConfirmModal({ isOpen, onClose, onConfirm, userName, loading }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100
    }}>
      <div style={{
        background: isDark ? '#1f2937' : '#fff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '400px',
        margin: '16px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: isDark ? '#fff' : '#111'
          }}>
            Confirmar Eliminación
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: '8px',
              borderRadius: '6px',
              background: 'transparent',
              border: 'none',
              color: isDark ? '#9ca3af' : '#6b7280',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div style={{
              padding: '12px',
              background: 'rgba(220,38,38,0.1)',
              borderRadius: '50%'
            }}>
              <AlertTriangle size={28} color="#dc2626" />
            </div>
            <div>
              <p style={{
                fontSize: '14px',
                color: isDark ? '#d1d5db' : '#374151',
                margin: 0
              }}>
                ¿Estás seguro de que deseas eliminar al usuario?
              </p>
              <p style={{
                fontSize: '16px',
                fontWeight: 600,
                color: isDark ? '#fff' : '#111',
                margin: '4px 0 0 0'
              }}>
                {userName}
              </p>
            </div>
          </div>

          <p style={{
            fontSize: '13px',
            color: isDark ? '#9ca3af' : '#6b7280',
            marginBottom: '24px'
          }}>
            Esta acción no se puede deshacer. Todos los datos asociados a este usuario serán eliminados permanentemente.
          </p>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: 'transparent',
                border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
                borderRadius: '6px',
                color: isDark ? '#d1d5db' : '#374151',
                fontSize: '14px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: '#dc2626',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Eliminando...' : 'Eliminar Usuario'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirmModal
