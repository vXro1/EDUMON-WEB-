import { describe, it, expect, vi, afterEach } from "vitest";
import { screen, cleanup, waitFor } from "@testing-library/react";
import { renderPagina } from "@/test/renderPagina";
import { fotosPredeterminadasQuery } from "@/features/usuarios/hooks/useUsuariosListado";

const usuario = { _id: "p1", rol: "padre", nombre: "Marta", fotoPerfilUrl: "https://edumon.test/static/avatares/avatar2.svg" };
vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuthContext: () => ({ user: usuario, isAuthenticated: true, updateUser: vi.fn(), logout: vi.fn() }),
  useUserContext: () => ({ user: usuario }),
}));

const usersGetDefaultPhotos = vi.fn();
vi.mock("@/services/usersService", async (orig) => ({
  ...(await orig()),
  usersGetDefaultPhotos: (...a) => usersGetDefaultPhotos(...a),
}));

const { default: FirstLoginScreen } = await import("./FirstLoginScreen");

afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("FirstLoginScreen", () => {
  it("carga los avatares una vez y quedan en caché para Mi perfil", async () => {
    usersGetDefaultPhotos.mockResolvedValue({ fotos: [
      { nombre: "avatar1", url: "https://edumon.test/static/avatares/avatar1.svg" },
      { nombre: "avatar2", url: "https://edumon.test/static/avatares/avatar2.svg" },
    ] });
    const { queryClient, container } = renderPagina(<FirstLoginScreen />);

    await waitFor(() => expect(container.querySelectorAll('img[src*="/static/avatares/"]').length).toBeGreaterThanOrEqual(2));
    // Mi perfil pide la misma lista: sale de la caché, sin otra petición
    await queryClient.fetchQuery(fotosPredeterminadasQuery);
    expect(usersGetDefaultPhotos).toHaveBeenCalledTimes(1);
    expect(screen.queryByText(/No se pudieron cargar los avatares/)).toBeNull();
  });
});
