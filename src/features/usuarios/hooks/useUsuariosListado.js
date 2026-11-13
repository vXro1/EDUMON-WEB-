import { useCallback } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryKeys";
import { usersGetAll, usersGetDefaultPhotos } from "@/services/usersService";
import { normalizeUser } from "@/lib/normalizers";

// { users, pagination } de GET /users con los filtros dados
export function useUsuariosListado(params, opciones = {}) {
  return useQuery({
    queryKey: queryKeys.usuarios.list(params),
    queryFn: async () => {
      const res = await usersGetAll(params);
      const list = Array.isArray(res) ? res : (res?.users ?? []);
      return {
        users: list.map((u) => normalizeUser(u)),
        pagination: res?.pagination ?? { currentPage: 1, totalPages: 1, totalUsers: list.length },
      };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    ...opciones,
  });
}

// Refleja al instante un cambio de estado (suspender/activar) en todos los
// listados de usuarios en caché, sin volver a pedirlos
export function useMarcarEstadoUsuario() {
  const queryClient = useQueryClient();
  return useCallback((id, estado) => {
    queryClient.setQueriesData({ queryKey: [...queryKeys.usuarios.all(), "list"] }, (old) =>
      old ? { ...old, users: old.users.map((u) => (u._id === id ? { ...u, estado } : u)) } : old
    );
  }, [queryClient]);
}

// Avatares predeterminados (GET /users/fotos-predeterminadas): estáticos, se
// piden una vez y se comparten entre el primer inicio de sesión y Mi perfil
export const fotosPredeterminadasQuery = {
  queryKey: [...queryKeys.usuarios.all(), "fotos-predeterminadas"],
  queryFn: async () => (await usersGetDefaultPhotos()).fotos ?? [],
  staleTime: 60 * 60 * 1000,
};

export function useFotosPredeterminadas() {
  return useQuery(fotosPredeterminadasQuery);
}
