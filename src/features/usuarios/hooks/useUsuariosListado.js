import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryKeys";
import { usersGetAll } from "@/services/usersService";
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
