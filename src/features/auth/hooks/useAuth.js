import { useAuthContext, useUserContext } from '../context/AuthContext';

// Full auth context — includes token, loading, showWarning (use for auth guards and session modals)
export const useAuth = () => useAuthContext();

// Solo cambia al entrar o salir, no con cada cambio de la sesión.
// Por eso es el que usan Sidebar, Navbar y los hooks de permisos.
export const useUser = () => useUserContext();
