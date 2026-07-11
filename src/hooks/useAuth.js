// src/hooks/useAuth.js
const useAuth = () => {
  const userLocal = JSON.parse(localStorage.getItem('auth-storage'));
  const user = userLocal?.state?.user;

  // Modificado para comprobar si el rol del usuario está dentro de la lista permitida
  const hasPermission = (rolesPermitidos) => {
    if (!user || !user.role) {
      return false; // No hay sesión activa o el usuario no tiene rol
    }
    return rolesPermitidos.includes(user.role);
  };

  return { user, hasPermission };
};

export default useAuth;