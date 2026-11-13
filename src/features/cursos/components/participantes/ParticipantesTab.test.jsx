import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import { renderPagina } from "@/test/renderPagina";
import { ConfirmProvider } from "@/context/ConfirmContext";

const usuario = { _id: "d1", rol: "docente", nombre: "Luis" };
vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuthContext: () => ({ user: usuario, isAuthenticated: true }),
  useUserContext: () => ({ user: usuario }),
}));

const cursosGetAllParticipantes = vi.fn();
vi.mock("@/features/cursos/services/cursosService", async (orig) => ({
  ...(await orig()),
  cursosGetAllParticipantes: (...a) => cursosGetAllParticipantes(...a),
}));

const { default: ParticipantesTab } = await import("./ParticipantesTab");

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("ParticipantesTab", () => {
  it("lista los participantes del curso", async () => {
    cursosGetAllParticipantes.mockResolvedValue({
      participantes: [{ _id: "p1", etiqueta: "padre", usuario: { _id: "u1", nombre: "Marta", apellido: "Gómez", rol: "padre" } }],
    });
    renderPagina(<ConfirmProvider><ParticipantesTab cursoId="c1" canManage /></ConfirmProvider>);
    expect((await screen.findAllByText(/Marta/)).length).toBeGreaterThan(0);
    expect(cursosGetAllParticipantes).toHaveBeenCalledTimes(1);
    expect(cursosGetAllParticipantes).toHaveBeenCalledWith("c1");
  });
});
