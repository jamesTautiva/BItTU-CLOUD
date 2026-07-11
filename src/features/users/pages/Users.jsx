import { useState, useEffect } from 'react'
import { Plus, Users as UsersIcon, Loader2, Search } from 'lucide-react'
import { useThemeStore } from '../../../app/store'
import { userService, uploadService } from '../../../services/api'
import CreateUserModal from '../components/CreateUserModal'
import DeleteConfirmModal from '../components/DeleteConfirmModal'
import UserTable from '../components/UserTable'
import Toast from '../../../components/ui/Toast'
import { Permiso } from '../../../hooks/permissions'

function Users() {
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [userToDelete, setUserToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Edit states
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({
    username: '',
    avatar_file: null,
    previewAvatar: null
  })

  // Toast state
  const [toast, setToast] = useState({
    isOpen: false,
    message: '',
    type: 'success'
  })

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type })
  }

  const hideToast = () => {
    setToast({ ...toast, isOpen: false })
  }

  // Load users on mount
  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await userService.getAll()
      console.log('Users API response:', response)
      // La API puede retornar array directo o { data: [] }
      const usersData = Array.isArray(response) ? response : (response.data || [])
      setUsers(usersData)
    } catch (err) {
      setError('Error al cargar usuarios: ' + (err.message || 'Error desconocido'))
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create user
  const handleCreateUser = async (formData) => {
    try {
      setLoading(true)
      
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role || 'user'
      }

      console.log('Creating user:', userData)
      const response = await userService.create(userData)
      console.log('Create user response:', response)
      
      // Extraer ID del usuario creado - la respuesta puede ser { user: {...} } o directamente el objeto
      const newUserId = response?.user?.id || response?.data?.user?.id || response?.data?.id || response?.id
      console.log('New user ID:', newUserId)
      
      // Si se subió avatar, actualizar el usuario con el avatar
      if (formData.avatar_file && newUserId) {
        try {
          const uploadRes = await uploadService.uploadAvatar(newUserId, formData.avatar_file)
          console.log('Avatar uploaded for new user:', uploadRes)
        } catch (uploadErr) {
          console.warn('Avatar upload failed for new user:', uploadErr)
        }
      }
      
      setIsCreateModalOpen(false)
      await loadUsers()
      
      // Extraer datos del usuario creado para mostrar en el toast
      const createdUser = response?.user || response?.data?.user || response?.data || {}
      const roleLabels = {
        user: 'Usuario',
        artist: 'Artista',
        admin: 'Administrador',
        super_admin: 'Super Admin'
      }
      const roleLabel = roleLabels[createdUser.role] || createdUser.role || 'Usuario'
      
      showToast(
        `✓ Usuario "${createdUser.username}" creado\nEmail: ${createdUser.email}\nRol: ${roleLabel}`,
        'success'
      )
    } catch (err) {
      console.error('Error creating user:', err)
      showToast('Error al crear usuario: ' + (err.message || 'Error desconocido'), 'error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete user
  const handleDeleteClick = (user) => {
    setUserToDelete(user)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!userToDelete) return

    try {
      setDeleteLoading(true)
      console.log('Deleting user:', userToDelete.id)
      await userService.delete(userToDelete.id)
      console.log('User deleted successfully')
      setIsDeleteModalOpen(false)
      setUserToDelete(null)
      await loadUsers()
      showToast('Usuario eliminado exitosamente', 'success')
    } catch (err) {
      console.error('Error deleting user:', err)
      showToast('Error al eliminar usuario: ' + (err.message || 'Error desconocido'), 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  // Edit user
  const handleEditClick = (user) => {
    setEditingUser(user.id)
    setEditForm({
      username: user.username,
      avatar_file: null,
      previewAvatar: null
    })
  }

  const handleEditFormChange = (field, value) => {
    if (field === 'avatar_file' && value) {
      // Preview de imagen
      const previewUrl = URL.createObjectURL(value)
      setEditForm(prev => ({
        ...prev,
        avatar_file: value,
        previewAvatar: previewUrl
      }))
    } else {
      setEditForm(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditForm({
      username: '',
      avatar_file: null,
      previewAvatar: null
    })
  }

  const handleSaveEdit = async (userId) => {
    try {
      setLoading(true)
      let avatarUrl = null

      // Si hay nuevo avatar, subirlo primero
      if (editForm.avatar_file) {
        try {
          const uploadRes = await uploadService.uploadAvatar(userId, editForm.avatar_file)
          console.log('Avatar uploaded:', uploadRes)
          // La respuesta puede ser: { success: true, url: "...", path: "..." }
          // o directamente la URL string
          avatarUrl = uploadRes.url || uploadRes.data?.url || (typeof uploadRes === 'string' ? uploadRes : null)
          if (!avatarUrl) {
            console.warn('Upload response did not contain URL:', uploadRes)
          }
        } catch (uploadErr) {
          console.warn('Avatar upload error details:', uploadErr)
          // Si el error contiene la URL en la respuesta (caso raro 400 con success)
          if (uploadErr.data?.url) {
            avatarUrl = uploadErr.data.url
            console.log('Got URL from error response:', avatarUrl)
          } else {
            console.warn('Avatar upload failed completely, no URL available')
          }
        }
      }

      const updateData = {
        username: editForm.username
      }
      if (avatarUrl) {
        updateData.avatar_url = avatarUrl
      }

      console.log('Updating user:', userId, updateData)
      await userService.update(userId, updateData)
      console.log('User updated successfully')
      
      setEditingUser(null)
      await loadUsers()
      showToast('Usuario actualizado exitosamente', 'success')
    } catch (err) {
      console.error('Error updating user:', err)
      showToast('Error al actualizar usuario: ' + (err.message || 'Error desconocido'), 'error')
    } finally {
      setLoading(false)
    }
  }

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <UsersIcon size={28} color="#dc2626" />
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: isDark ? '#fff' : '#111',
            margin: 0
          }}>
            Gestión de Usuarios
          </h1>
        </div>

        {/* add permissions users */}
        <Permiso rolesPermitidos={['super_admin', 'admin']}>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            style={{
              display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: '#dc2626',
            border: 'none',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#b91c1c'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#dc2626'
          }}
        >
          <Plus size={18} />
          Agregar Usuario
        </button>
        </Permiso>
      </div>

      {/* Search and Filter Bar */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {/* Search Input */}
        <div style={{
          position: 'relative',
          flex: 1,
          minWidth: '250px'
        }}>
          <Search size={18} style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#f12727',
            pointerEvents: 'none'
          }} />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              background: isDark ? '#1f293764' : '#fff',
              border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
              borderRadius: '8px',
              color: isDark ? '#fff' : '#111',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.target.style.borderColor = '#dc2626'}
            onBlur={(e) => e.target.style.borderColor = isDark ? '#374151' : '#d1d5db'}
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: '10px 16px',
            background: isDark ? '#1f29376a' : '#fff',
            border: `1px solid ${isDark ? '#374151' : '#d1d5db'}`,
            borderRadius: '8px',
            color: isDark ? '#fff' : '#111',
            fontSize: '14px',
            cursor: 'pointer',
            outline: 'none',
            minWidth: '150px'
          }}
        >
          <option value="all">Todos los roles</option>
          <option value="user">Usuario</option>
          <option value="artist">Artista</option>
          <option value="admin">Administrador</option>
        </select>

        {/* Results count */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 16px',
          background: isDark ? '#1f29376f' : '#f3f4f6',
          borderRadius: '8px',
          color: isDark ? '#ffffff' : '#6b7280',
          fontSize: '14px',
          fontWeight: 500
        }}>
          {filteredUsers.length} de {users.length} usuarios
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          background: 'rgba(220,38,38,0.1)',
          border: '1px solid rgba(220,38,38,0.3)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '16px',
          color: '#ef4444',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '64px',
          color: isDark ? '#9ca3af' : '#6b7280'
        }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginRight: '12px' }} />
          <span>Cargando usuarios...</span>
        </div>
      ) : (
        <UserTable
          users={filteredUsers}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
          editingUser={editingUser}
          onSaveEdit={handleSaveEdit}
          onCancelEdit={handleCancelEdit}
          editForm={editForm}
          onEditFormChange={handleEditFormChange}
        />
      )}

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateUser}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false)
          setUserToDelete(null)
        }}
        onConfirm={handleConfirmDelete}
        userName={userToDelete?.username || ''}
        loading={deleteLoading}
      />

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
        onClose={hideToast}
        duration={3000}
      />
    </div>
  )
}

export default Users
