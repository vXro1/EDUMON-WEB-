import { useState, useCallback } from "react";

// Página actual que vuelve a 1 cuando cambian los filtros (clave), en el mismo
// render. Con un useEffect(() => setPage(1), [filtros]) aparte, cada cambio de
// filtro pedía primero la página vieja con el filtro nuevo y luego la página 1.
export function usePaginaPorFiltros(clave) {
  const [estado, setEstado] = useState({ pagina: 1, clave });
  const pagina = estado.clave === clave ? estado.pagina : 1;

  const setPagina = useCallback((valor) => {
    setEstado((prev) => {
      const actual = prev.clave === clave ? prev.pagina : 1;
      return { clave, pagina: typeof valor === "function" ? valor(actual) : valor };
    });
  }, [clave]);

  return [pagina, setPagina];
}
