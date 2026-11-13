import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import { renderPagina } from "@/test/renderPagina";
import { ConfirmProvider } from "@/context/ConfirmContext";

const usuario = { _id: "d1", rol: "docente", nombre: "Luis" };
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

const { default: TareasPage } = await import("./TareasPage");

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("TareasPage", () => {
  it("lista los retos y los cursos con una petición cada uno", async () => {
    cursosGetMine.mockResolvedValue({ cursos: [{ _id: "c1", nombre: "Lectura", descripcion: "Curso de lectura" }] });
    tareasGetAll.mockResolvedValue({ tareas: [{ _id: "t1", titulo: "Cuento en familia", estado: "publicada", fechaEntrega: new Date(Date.now() + 864e5).toISOString(), cursoId: "c1" }] });
    renderPagina(<ConfirmProvider><TareasPage /></ConfirmProvider>);
    expect(await screen.findByText("Cuento en familia")).toBeTruthy();
    expect(tareasGetAll).toHaveBeenCalledTimes(1);
    expect(tareasGetAll).toHaveBeenCalledWith({ limit: 200 });
    expect(cursosGetMine).toHaveBeenCalledTimes(1);
  });
});
