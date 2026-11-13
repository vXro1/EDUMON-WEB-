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
vi.mock("@/features/cursos/services/tareasService", async (orig) => ({
  ...(await orig()),
  tareasGetAll: (...a) => tareasGetAll(...a),
}));

const { default: TareasTab } = await import("./TareasTab");

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("TareasTab", () => {
  it("lista los retos del curso con una sola petición", async () => {
    tareasGetAll.mockResolvedValue({ tareas: [{ _id: "t1", titulo: "Dibuja tu familia", estado: "publicada", fechaEntrega: new Date(Date.now() + 864e5).toISOString() }] });
    renderPagina(<ConfirmProvider><TareasTab cursoId="c1" canManage /></ConfirmProvider>);
    expect(await screen.findByText("Dibuja tu familia")).toBeTruthy();
    expect(tareasGetAll).toHaveBeenCalledTimes(1);
    expect(tareasGetAll).toHaveBeenCalledWith({ cursoId: "c1" });
  });
});
