import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/queryKeys';
import { institucionesGetAll } from '@/services/institucionesService';

// Lista de instituciones (GET /instituciones), compartida en caché entre la
// gestión de instituciones y el selector de institución de Usuarios
export function useInstituciones(opciones = {}) {
  return useQuery({
    queryKey: queryKeys.instituciones.all(),
    queryFn: async () => {
      const res = await institucionesGetAll();
      const list = res?.instituciones ?? res ?? [];
      return Array.isArray(list) ? list : [];
    },
    staleTime: 60_000,
    ...opciones,
  });
}
