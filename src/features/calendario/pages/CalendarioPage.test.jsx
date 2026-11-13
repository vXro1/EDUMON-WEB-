import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import { renderPagina } from "@/test/renderPagina";

const usuario = { _id: "d1", rol: "docente", nombre: "Luis" };
vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuthContext: () => ({ user: usuario, isAuthenticated: true }),
  useUserContext: () => ({ user: usuario }),
}));

const cursosGetMine = vi.fn();
const cursosGetAll = vi.fn();
const calendarioGetByCurso = vi.fn();
vi.mock("@/features/cursos/services/cursosService", async (orig) => ({
  ...(await orig()),
  cursosGetMine: (...a) => cursosGetMine(...a),
  cursosGetAll: (...a) => cursosGetAll(...a),
}));
vi.mock("@/features/calendario/services/calendarioService", async (orig) => ({
  ...(await orig()),
  calendarioGetByCurso: (...a) => calendarioGetByCurso(...a),
}));

const { default: CalendarioPage } = await import("./CalendarioPage");

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("CalendarioPage", () => {
  it("une el calendario de todos los cursos del docente, uno por curso", async () => {
    const hoy = new Date();
    hoy.setHours(Math.min(hoy.getHours() + 1, 23), 0, 0, 0);
    cursosGetMine.mockResolvedValue({ cursos: [
      { _id: "c1", nombre: "Lectura", descripcion: "Curso de lectura" },
      { _id: "c2", nombre: "Ciencias", descripcion: "Curso de ciencias" },
    ] });
    calendarioGetByCurso.mockImplementation((id) => Promise.resolve({
      items: [{ _id: `e-${id}`, tipo: "evento", titulo: id === "c1" ? "Club de lectura" : "Feria de ciencias", fecha: hoy.toISOString(), hora: "10:00", categoria: "institucional" }],
      estadisticas: { totalEventos: 1 },
    }));

    renderPagina(<CalendarioPage />);

    expect(await screen.findByText("Club de lectura")).toBeTruthy();
    expect(await screen.findByText("Feria de ciencias")).toBeTruthy();
    expect(calendarioGetByCurso).toHaveBeenCalledTimes(2);
    expect(cursosGetAll).not.toHaveBeenCalled();
  });
});
