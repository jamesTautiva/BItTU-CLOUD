import React, { useState, useCallback } from 'react'
import { notificationService } from '../../../services/api'

// Hook global para manejo de notificaciones
export const useNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [badgeAnimation, setBadgeAnimation] = useState(false)

  // Actualizar contador inmediatamente
  const incrementCounter = useCallback(() => {
    setUnreadCount(prev => prev + 1)
    
    // Activar animación
    setBadgeAnimation(true)
    setTimeout(() => setBadgeAnimation(false), 600)
  }, [])

  // Decrementar contador (cuando se lee una notificación)
  const decrementCounter = useCallback(() => {
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  // Resetear contador (cuando se leen todas)
  const resetCounter = useCallback(() => {
    setUnreadCount(0)
  }, [])

  // Cargar contador desde el servidor
  const loadCounter = useCallback(async (userId) => {
    try {
      const response = await notificationService.getCount(userId)
      const count = response.total || response.count || 0
      setUnreadCount(count)
      return count
    } catch (error) {
      console.error('Error loading notification count:', error)
      return 0
    }
  }, [])

  // Crear notificación y actualizar contador
  const createNotification = useCallback(async (notificationData) => {
    try {
      const notification = await notificationService.create(notificationData)
      
      // Actualizar contador inmediatamente
      incrementCounter()
      
      console.log('✅ Notificación creada y contador actualizado:', notification)
      return notification
    } catch (error) {
      console.error('❌ Error creando notificación:', error)
      throw error
    }
  }, [incrementCounter])

  return {
    unreadCount,
    badgeAnimation,
    incrementCounter,
    decrementCounter,
    resetCounter,
    loadCounter,
    createNotification
  }
}

// Contexto global para notificaciones (opcional, para uso futuro)
export const NotificationContext = React.createContext()
