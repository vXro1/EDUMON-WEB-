import { useUser } from '@/features/auth/hooks/useAuth';
import { tienePermiso } from '@/security/roleMatrix';
export { PERMISSIONS } from '@/security/permissions';

/**
 * Returns true if the current user has the given permission.
 * @param {string} permission — one of PERMISSIONS.*
 */
export function usePermission(permission) {
  const { user } = useUser();
  return tienePermiso(user?.rol ?? user?.role ?? '', permission);
}
