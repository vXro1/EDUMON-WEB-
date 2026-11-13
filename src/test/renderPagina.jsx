// Render de una página con los proveedores que necesita en la app real
// (React Query, router y búsqueda global). La sesión se simula con vi.mock
// de "@/features/auth/context/AuthContext" en cada test.
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchProvider } from "@/context/SearchContext";

export function renderPagina(ui, { ruta = "/" } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, staleTime: 60_000 } },
  });
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[ruta]}>
        <SearchProvider>{ui}</SearchProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
  return { ...utils, queryClient };
}
