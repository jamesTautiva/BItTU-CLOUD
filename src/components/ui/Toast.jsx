import { useThemeStore } from '../../app/store'
import { CheckCircle, XCircle, X } from 'lucide-react'
import { useEffect } from 'react'

function Toast({ message, type = 'success', isOpen, onClose, duration = 3000 }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  if (!isOpen) return null

  const isSuccess = type === 'success'
  const bgColor = isSuccess
    ? (isDark ? 'rgba(34, 197, 94, 0.9)' : 'rgba(34, 197, 94, 0.95)')
    : (isDark ? 'rgba(239, 68, 68, 0.9)' : 'rgba(239, 68, 68, 0.95)')

  const iconColor = isSuccess ? '#fff' : '#fff'

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 9999,
      animation: 'slideIn 0.3s ease-out'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        background: bgColor,
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        color: '#fff',
        minWidth: '300px',
        maxWidth: '400px'
      }}>
        {isSuccess ? (
          <CheckCircle size={24} color={iconColor} />
        ) : (
          <XCircle size={24} color={iconColor} />
        )}
        
        <div style={{
          flex: 1,
          fontSize: '14px',
          fontWeight: 500,
          whiteSpace: 'pre-line'
        }}>
          {message}
        </div>
        
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            opacity: 0.8,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.opacity = '1'}
          onMouseLeave={(e) => e.target.style.opacity = '0.8'}
        >
          <X size={18} />
        </button>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

export default Toast
