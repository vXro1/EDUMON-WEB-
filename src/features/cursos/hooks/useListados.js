// Listados compartidos entre páginas, con caché de React Query: las páginas que
// piden lo mismo (p. ej. Tareas y Entregas de la familia) reutilizan la respuesta
// en lugar de repetir la petición al navegar entre ellas.
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { queryKeys } from "@/services/queryKeys";
import { cursosGetAll, cursosGetMine } from "@/features/cursos/services/cursosService";
import { tareasGetAll } from "@/features/cursos/services/tareasService";
import { normalizeCurso, normalizeTarea } from "@/lib/normalizers";

// { cursos, total } — alcance "mios" (/cursos/mis-cursos) o "todos" (/cursos)
export function useCursosListado({ alcance = "mios", params = {}, ...opciones } = {}) {
  return useQuery({
    queryKey: queryKeys.cursos.list({ alcance, ...params }),
    queryFn: async () => {
      const res = alcance === "todos" ? await cursosGetAll(params) : await cursosGetMine(params);
      const cursos = (res?.cursos ?? res?.data ?? []).map(normalizeCurso);
      return { cursos, total: res?.pagination?.total ?? cursos.length };
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    ...opciones,
  });
}

// Array de tareas normalizadas
export function useTareasListado(params = {}, opciones = {}) {
  return useQuery({
    queryKey: queryKeys.tareas.list(params),
    queryFn: async () => {
      const res = await tareasGetAll(params);
      return (res?.tareas ?? res?.data ?? []).map(normalizeTarea);
    },
    staleTime: 30_000,
    ...opciones,
  });
}
