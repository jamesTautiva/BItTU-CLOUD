// src/components/Permiso.jsx
import React from 'react';
import useAuth from '../hooks/useAuth'; // Ajusta la ruta relativa hacia tu hook useAuth

/**
 * Componente Guardián para controlar accesos en la interfaz.
 * @param {string[]} rolesPermitidos - Arreglo de strings con los roles que sí tienen acceso (ej: ['admin', 'super_admin'])
 * @param {React.ReactNode} children - Componente o botón original que se renderiza si pasa la validación
 * @param {React.ReactNode} fallback - Componente o botón alternativo (bloqueado) si NO tiene permisos
 */
export const Permiso = ({ rolesPermitidos, children, fallback = null }) => {
  const { hasPermission } = useAuth();

  // Usamos la función lógica que creamos dentro de tu hook useAuth
  if (hasPermission(rolesPermitidos)) {
    return <>{children}</>;
  }

  // Si no tiene permisos, dibuja la opción deshabilitada (o null si no enviaste nada)
  return fallback;
};