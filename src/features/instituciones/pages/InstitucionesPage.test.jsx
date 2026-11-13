import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import { renderPagina } from "@/test/renderPagina";

const usuario = { _id: "s1", rol: "superadmin", nombre: "Sara" };
vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuthContext: () => ({ user: usuario, isAuthenticated: true }),
  useUserContext: () => ({ user: usuario }),
}));

const institucionesGetAll = vi.fn();
vi.mock("@/services/institucionesService", async (orig) => ({
  ...(await orig()),
  institucionesGetAll: (...a) => institucionesGetAll(...a),
}));

const { default: InstitucionesPage } = await import("./InstitucionesPage");

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("InstitucionesPage", () => {
  it("lista las instituciones", async () => {
    institucionesGetAll.mockResolvedValue({ instituciones: [{ _id: "i1", nombre: "Colegio Los Andes", nit: "900123456", estado: "activa" }] });
    renderPagina(<InstitucionesPage />);
    expect((await screen.findAllByText("Colegio Los Andes")).length).toBeGreaterThan(0);
    expect(institucionesGetAll).toHaveBeenCalledTimes(1);
  });
});
