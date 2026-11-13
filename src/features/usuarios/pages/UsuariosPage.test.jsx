import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { renderPagina } from "@/test/renderPagina";

const usuario = { _id: "a1", rol: "administrador", nombre: "Ana", institucionId: "i1" };
vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuthContext: () => ({ user: usuario, isAuthenticated: true }),
  useUserContext: () => ({ user: usuario }),
}));

const usersGetAll = vi.fn();
vi.mock("@/services/usersService", async (orig) => ({
  ...(await orig()),
  usersGetAll: (...a) => usersGetAll(...a),
}));

const { default: UsuariosPage } = await import("./UsuariosPage");

afterEach(() => { cleanup(); vi.clearAllMocks(); });

const pagina = (n) => ({
  users: [{ _id: `u${n}`, nombre: `Usuario${n}`, apellido: "Prueba", rol: "padre", estado: "activo" }],
  pagination: { currentPage: n, totalPages: 3, totalUsers: 40 },
});

describe("UsuariosPage", () => {
  it("cambiar un filtro estando en otra página pide una sola vez, ya en la página 1", async () => {
    usersGetAll.mockImplementation((p) => Promise.resolve(pagina(p.page)));
    const { container } = renderPagina(<UsuariosPage />);

    expect(await screen.findByText(/Usuario1/)).toBeTruthy();
    // ir a la página 2
    const paginacion = screen.getByText(/Página 1 de 3/).parentElement;
    fireEvent.click(paginacion.querySelectorAll("button")[1]);
    expect(await screen.findByText(/Usuario2/)).toBeTruthy();
    usersGetAll.mockClear();

    // filtrar por rol
    const selectRol = container.querySelectorAll("select")[0];
    fireEvent.change(selectRol, { target: { value: "docente" } });

    await waitFor(() => expect(usersGetAll).toHaveBeenCalled());
    await screen.findByText(/Usuario1/);
    expect(usersGetAll).toHaveBeenCalledTimes(1);
    expect(usersGetAll.mock.calls[0][0]).toMatchObject({ page: 1, rol: "docente" });
  });
});
