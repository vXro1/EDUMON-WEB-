import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderPagina } from "@/test/renderPagina";

const usuario = { _id: "p1", rol: "padre", nombre: "Marta" };
vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuthContext: () => ({ user: usuario, isAuthenticated: true }),
  useUserContext: () => ({ user: usuario }),
}));

const tareasGetAll = vi.fn();
const cursosGetMine = vi.fn();
vi.mock("@/features/cursos/services/tareasService", async (orig) => ({
  ...(await orig()),
  tareasGetAll: (...a) => tareasGetAll(...a),
}));
vi.mock("@/features/cursos/services/cursosService", async (orig) => ({
  ...(await orig()),
  cursosGetMine: (...a) => cursosGetMine(...a),
}));

const { default: FamiliaTareasPage } = await import("./FamiliaTareasPage");
const { default: FamiliaEntregasPage } = await import("./FamiliaEntregasPage");
const { default: FamiliaCursosPage } = await import("./FamiliaCursosPage");

const futura = new Date(Date.now() + 7 * 864e5).toISOString();

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("listados de la familia", () => {
  it("Tareas y Entregas comparten la misma petición en caché", async () => {
    tareasGetAll.mockResolvedValue({
      tareas: [{ _id: "t1", titulo: "Leer un cuento", estado: "publicada", fechaEntrega: futura, cursoId: { _id: "c1", nombre: "Lectura" } }],
    });
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 60_000 } } });
    const envolver = (ui) => (
      <QueryClientProvider client={queryClient}><MemoryRouter>{ui}</MemoryRouter></QueryClientProvider>
    );

    const { unmount } = render(envolver(<FamiliaTareasPage />));
    expect(await screen.findByText("Leer un cuento")).toBeTruthy();
    unmount();

    render(envolver(<FamiliaEntregasPage />));
    expect(await screen.findByText("Leer un cuento")).toBeTruthy();
    expect(tareasGetAll).toHaveBeenCalledTimes(1);
  });

  it("Cursos lista los cursos del padre", async () => {
    cursosGetMine.mockResolvedValue({ cursos: [{ _id: "c1", nombre: "Lectura", descripcion: "Curso de lectura" }] });
    renderPagina(<FamiliaCursosPage />);
    expect(await screen.findByText("Lectura")).toBeTruthy();
    expect(cursosGetMine).toHaveBeenCalledWith({ limit: 50 });
  });
});
