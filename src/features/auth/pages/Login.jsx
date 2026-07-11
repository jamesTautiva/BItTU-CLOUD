import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../app/store'
import { Music2, Lock, Mail } from 'lucide-react'
import { authService } from '../../../services/api'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const iconBittu = '../../../../public/icon-bittu.svg'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Llamada real a la API
      const response = await authService.login(email, password)
      
      // La API retorna { message, token, user }
      if (response.token && response.user) {
        // Guardar usuario con token en el store
        login({ ...response.user, token: response.token })
        navigate('/', { replace: true })
      } else {
        setError(response.message || 'Error en la respuesta del servidor')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError(err.message || 'Error al conectar con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
            <img src={iconBittu} alt="Logo" style={{ width: '40vh', height: '40vh', fill: '#dc2626' }} />
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', fontFamily: 'Cinzel Decorative' }}>BITU-CLOUD</span>
          </div>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>CRM de gestión musical para el metal extremo</p>
        </div>

        <div style={{ background: '#1f2937', padding: '24px', borderRadius: '8px', border: '1px solid #374151' }}>
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: 'rgba(220,38,38,0.2)', padding: '12px', borderRadius: '4px', marginBottom: '16px', color: '#ef4444', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: '#d1d5db' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#6b7280' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@bitu.cloud"
                  required
                  style={{ width: '100%', padding: '10px 12px 10px 36px', background: '#111827', border: '1px solid #374151', borderRadius: '6px', color: '#fff', fontSize: '14px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px', color: '#d1d5db' }}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: '#6b7280' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '10px 12px 10px 36px', background: '#111827', border: '1px solid #374151', borderRadius: '6px', color: '#fff', fontSize: '14px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Entrando...' : 'Iniciar sesión'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: '#6b7280' }}>
            Conectado a: {import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
