import { useState, useEffect } from 'react'
import { useThemeStore } from '../../../app/store'
import { ticketService } from '../../../services/api'
import { 
  X, 
  Save, 
  AlertCircle, 
  Tag, 
  MessageSquare,
  Loader2,
  Flag
} from 'lucide-react'

function TicketForm({ ticket, currentUser, onClose, onSave }) {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    priority: 'medium'
  })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    loadCategories()
    if (ticket) {
      setFormData({
        title: ticket.title || '',
        description: ticket.description || '',
        category_id: ticket.category_id || '',
        priority: ticket.priority || 'medium'
      })
    }
  }, [ticket])

  const loadCategories = async () => {
    try {
      setLoadingCategories(true)
      console.log('🔍 Cargando categorías...')
      
      // Verificar token
      const token = localStorage.getItem('token')
      console.log('🎫 Token presente:', !!token)
      
      const response = await ticketService.getCategories()
      console.log('📋 Respuesta categorías:', response)
      console.log('📋 Response data:', response.data)
      console.log('📋 Response status:', response.status)
      
      // El backend devuelve directamente el array, no un objeto con .data
      let categoriesData = []
      if (Array.isArray(response)) {
        categoriesData = response
      } else if (response.data && Array.isArray(response.data)) {
        categoriesData = response.data
      } else {
        console.warn('⚠️ Respuesta inesperada:', response)
        setCategories([])
        return
      }
      
      setCategories(categoriesData)
      console.log('✅ Categorías cargadas:', categoriesData.length, 'categorías')
    } catch (error) {
      console.error('❌ Error loading categories:', error)
      console.error('❌ Error response:', error.response)
      console.error('❌ Error status:', error.response?.status)
      console.error('❌ Error data:', error.response?.data)
      setCategories([])
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido'
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'El título debe tener al menos 3 caracteres'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida'
    }

    if (!formData.category_id) {
      newErrors.category_id = 'La categoría es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setLoading(true)

      const ticketData = {
        ...formData,
        user_id: currentUser.id
      }

      let response
      if (ticket) {
        response = await ticketService.update(ticket.id, ticketData)
      } else {
        response = await ticketService.create(ticketData)
      }

      onSave(response.data)
      onClose()
    } catch (error) {
      console.error('Error saving ticket:', error)
      setErrors({
        submit: error.response?.data?.message || 'Error al guardar el ticket'
      })
    } finally {
      setLoading(false)
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

  const getPriorityDescription = (priority) => {
    switch (priority) {
      case 'low': return 'Problema menor, sin impacto crítico'
      case 'medium': return 'Problema estándar, afecta funcionalidad'
      case 'high': return 'Problema grave, afecta operación'
      case 'urgent': return 'Emergencia, requiere atención inmediata'
      default: return ''
    }
  }

  if (loadingCategories) {
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

  // TEMP: Debug info
  console.log('🎫 TicketForm Debug:', {
    categories: categories,
    categoriesLength: categories.length,
    currentUser: currentUser,
    userRole: currentUser?.role,
    loadingCategories
  });

  // TEMP: Botón para inicializar categorías si no existen
  if (categories.length === 0 && !loadingCategories) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
        padding: '20px'
      }}>
        <div style={{
          background: isDark ? '#1f2937' : '#fff',
          borderRadius: '16px',
          padding: '30px',
          textAlign: 'center',
          maxWidth: '400px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: isDark ? '#fff' : '#111' }}>
            ⚠️ No hay categorías de tickets
          </h3>
          <p style={{ margin: '0 0 20px 0', color: isDark ? '#9ca3af' : '#6b7280' }}>
            Las categorías de tickets son necesarias para crear tickets. 
            {currentUser?.role === 'admin' || currentUser?.role === 'super_admin' 
              ? ' ¿Deseas inicializar las categorías por defecto?'
              : ' Contacta a un administrador para configurar las categorías.'
            }
          </p>
          {currentUser?.role === 'admin' || currentUser?.role === 'super_admin' ? (
            <button
              onClick={async () => {
                try {
                  console.log('🔧 Inicializando categorías...');
                  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                  const response = await fetch(`${API_BASE_URL}/tickets/init-categories`, {
                    method: 'POST',
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`,
                      'Content-Type': 'application/json'
                    }
                  });
                  const result = await response.json();
                  console.log('✅ Categorías inicializadas:', result);
                  window.location.reload(); // Recargar para cargar categorías
                } catch (error) {
                  console.error('❌ Error inicializando categorías:', error);
                }
              }}
              style={{
                padding: '12px 24px',
                background: '#dc2626',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Inicializar Categorías
            </button>
          ) : (
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                background: '#6b7280',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
      padding: '20px'
    }}>
      <div style={{
        background: isDark ? '#1f2937' : '#fff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <MessageSquare size={20} color="#fff" />
            </div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: isDark ? '#fff' : '#111' }}>
              {ticket ? 'Editar Ticket' : 'Crear Nuevo Ticket'}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: isDark ? '#374151' : '#f3f4f6',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              color: isDark ? '#fff' : '#374151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '24px',
          overflow: 'auto',
          flex: 1
        }}>
          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
                color: isDark ? '#d1d5db' : '#374151'
              }}>
                Título del Ticket *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Describe brevemente tu problema..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: isDark ? '#111827' : '#f9fafb',
                  border: `1px solid ${errors.title ? '#ef4444' : isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: isDark ? '#fff' : '#111',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              />
              {errors.title && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '6px',
                  color: '#ef4444',
                  fontSize: '13px'
                }}>
                  <AlertCircle size={14} />
                  {errors.title}
                </div>
              )}
            </div>

            {/* Category */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
                color: isDark ? '#d1d5db' : '#374151'
              }}>
                Categoría *
              </label>
              
              {/* TEMP: Debug info */}
              <div style={{ marginBottom: '8px', fontSize: '12px', color: isDark ? '#9ca3af' : '#6b7280' }}>
                Categorías cargadas: {categories.length} | Rol: {currentUser?.role}
                <button
                  onClick={async () => {
                    try {
                      console.log('🔍 Probando conexión a BD...');
                      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                      const response = await fetch(`${API_BASE_URL}/tickets/test-db`);
                      const result = await response.json();
                      console.log('✅ Test BD:', result);
                      alert(`Test BD: ${result.message}. Categorías: ${result.tests.ticketCategoryModel}. Revisa la consola del backend.`);
                    } catch (error) {
                      console.error('❌ Error test BD:', error);
                      alert('Error al testear BD. Revisa la consola.');
                    }
                  }}
                  style={{
                    marginLeft: '10px',
                    padding: '4px 8px',
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  Test BD
                </button>
                <button
                  onClick={async () => {
                    try {
                      console.log('🔍 Verificando tabla directamente...');
                      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                      const response = await fetch(`${API_BASE_URL}/tickets/check-table`, {
                        headers: {
                          'Authorization': `Bearer ${localStorage.getItem('token')}`,
                          'Content-Type': 'application/json'
                        }
                      });
                      const result = await response.json();
                      console.log('✅ Verificación de tabla:', result);
                      alert(`Tabla verificada: ${result.count} categorías encontradas. Revisa la consola.`);
                    } catch (error) {
                      console.error('❌ Error verificando tabla:', error);
                      alert('Error al verificar tabla. Revisa la consola.');
                    }
                  }}
                  style={{
                    marginLeft: '10px',
                    padding: '4px 8px',
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  Verificar Tabla
                </button>
                {categories.length === 0 && (
                  <button
                    onClick={async () => {
                      try {
                        console.log('🔧 Inicializando categorías manualmente...');
                        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
                        const response = await fetch(`${API_BASE_URL}/tickets/init-categories`, {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'Content-Type': 'application/json'
                          }
                        });
                        const result = await response.json();
                        console.log('✅ Categorías inicializadas:', result);
                        window.location.reload();
                      } catch (error) {
                        console.error('❌ Error:', error);
                        alert('Error al inicializar categorías. Revisa la consola.');
                      }
                    }}
                    style={{
                      marginLeft: '10px',
                      padding: '4px 8px',
                      background: '#dc2626',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    Inicializar Categorías
                  </button>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <select
                  value={formData.category_id}
                  onChange={(e) => handleChange('category_id', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: isDark ? '#111827' : '#f9fafb',
                    border: `1px solid ${errors.category_id ? '#ef4444' : isDark ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    color: isDark ? '#fff' : '#111',
                    fontSize: '14px',
                    outline: 'none',
                    appearance: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">
                    {categories.length === 0 ? 'No hay categorías disponibles' : 'Selecciona una categoría'}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <Tag 
                  size={18} 
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: isDark ? '#9ca3af' : '#6b7280',
                    pointerEvents: 'none'
                  }}
                />
              </div>
              {errors.category_id && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '6px',
                  color: '#ef4444',
                  fontSize: '13px'
                }}>
                  <AlertCircle size={14} />
                  {errors.category_id}
                </div>
              )}
            </div>

            {/* Priority */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
                color: isDark ? '#d1d5db' : '#374151'
              }}>
                Prioridad
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                {['low', 'medium', 'high', 'urgent'].map((priority) => (
                  <div
                    key={priority}
                    onClick={() => handleChange('priority', priority)}
                    style={{
                      padding: '12px',
                      background: formData.priority === priority 
                        ? `${getPriorityColor(priority)}20`
                        : isDark ? '#111827' : '#f9fafb',
                      border: `2px solid ${
                        formData.priority === priority 
                          ? getPriorityColor(priority)
                          : isDark ? '#374151' : '#e5e7eb'
                      }`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '4px'
                    }}>
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: getPriorityColor(priority)
                      }} />
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: isDark ? '#fff' : '#111'
                      }}>
                        {getPriorityLabel(priority)}
                      </span>
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: '12px',
                      color: isDark ? '#9ca3af' : '#6b7280'
                    }}>
                      {getPriorityDescription(priority)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '8px',
                color: isDark ? '#d1d5db' : '#374151'
              }}>
                Descripción Detallada *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe en detalle tu problema, qué esperas que suceda y qué está ocurriendo..."
                rows={6}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: isDark ? '#111827' : '#f9fafb',
                  border: `1px solid ${errors.description ? '#ef4444' : isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: isDark ? '#fff' : '#111',
                  fontSize: '14px',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
              />
              {errors.description && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '6px',
                  color: '#ef4444',
                  fontSize: '13px'
                }}>
                  <AlertCircle size={14} />
                  {errors.description}
                </div>
              )}
            </div>

            {/* General Error */}
            {errors.submit && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                background: '#ef444420',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                marginBottom: '20px',
                color: '#ef4444',
                fontSize: '14px'
              }}>
                <AlertCircle size={16} />
                {errors.submit}
              </div>
            )}

            {/* Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '12px 20px',
                  background: isDark ? '#374151' : '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  color: isDark ? '#fff' : '#374151',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 20px',
                  background: loading ? '#6b7280' : '#dc2626',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {ticket ? 'Actualizar' : 'Crear'} Ticket
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default TicketForm
