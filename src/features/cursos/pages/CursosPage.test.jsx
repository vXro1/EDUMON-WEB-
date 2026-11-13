import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import { renderPagina } from "@/test/renderPagina";

const usuario = { _id: "admin1", rol: "administrador", nombre: "Ana" };
vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuthContext: () => ({ user: usuario, isAuthenticated: true }),
  useUserContext: () => ({ user: usuario }),
}));

const cursosGetAll = vi.fn();
const cursosGetById = vi.fn();
vi.mock("@/features/cursos/services/cursosService", async (orig) => ({
  ...(await orig()),
  cursosGetAll: (...a) => cursosGetAll(...a),
  cursosGetMine: (...a) => cursosGetAll(...a),
  cursosGetById: (...a) => cursosGetById(...a),
}));
vi.mock("@/services/usersService", async (orig) => ({
  ...(await orig()),
  usersGetAll: () => Promise.resolve({ users: [] }),
}));

const { default: CursosPage } = await import("./CursosPage");

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("CursosPage", () => {
  it("lista los cursos sin pedir el detalle de cada uno (sin N+1)", async () => {
    cursosGetAll.mockResolvedValue({
      cursos: [
        { _id: "c1", nombre: "Matemáticas", descripcion: "Curso de prueba uno", docenteId: null },
        { _id: "c2", nombre: "Lectura", descripcion: "Curso de prueba dos", docenteId: { _id: "d1", nombre: "Luis", apellido: "Pérez" } },
      ],
      pagination: { total: 2 },
    });

    renderPagina(<CursosPage />);

    expect(await screen.findByText("Matemáticas")).toBeTruthy();
    expect(screen.getByText("Lectura")).toBeTruthy();
    expect(cursosGetAll).toHaveBeenCalledTimes(1);
    expect(cursosGetById).not.toHaveBeenCalled();
  });
});
