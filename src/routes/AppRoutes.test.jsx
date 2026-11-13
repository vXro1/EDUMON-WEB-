import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Outlet } from "react-router-dom";

// Las rutas del frontend deben dejar entrar solo a los roles que el backend
// autoriza en los endpoints de esa página; si no, la página carga y falla (403/404).
const auth = { isAuthenticated: true, user: null, loading: false, sessionChecked: true, ensureSession: vi.fn() };
vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuthContext: () => auth,
  useUserContext: () => ({ user: auth.user }),
}));
vi.mock("../components/layout/MainLayout", () => ({ default: () => <Outlet /> }));
vi.mock("@/components", () => ({ LoadingScreen: () => <p>cargando</p> }));
const pagina = (nombre) => ({ default: () => <p>{nombre}</p> });
vi.mock("../features/dashboard/admin/pages/AdminHomePage", () => pagina("inicio admin"));
vi.mock("../features/dashboard/docente/pages/DocenteHomePage", () => pagina("inicio docente"));
vi.mock("../features/buzon/pages/BuzonPage", () => pagina("pagina buzon"));
vi.mock("../features/instituciones/pages/MiInstitucionPage", () => pagina("pagina mi institucion"));
vi.mock("../features/cursos/pages/CursosPage", () => pagina("pagina cursos"));
vi.mock("../features/tareas/pages/EntregasPage", () => pagina("pagina entregas"));

const { default: AppRoutes } = await import("./AppRoutes");

afterEach(cleanup);

const visitar = (ruta, rol) => {
  auth.user = { _id: "u1", rol, nombre: "Prueba" };
  window.history.pushState({}, "", ruta);
  render(<AppRoutes />);
};

describe("roles por ruta coherentes con el backend", () => {
  it.each([
    ["/buzon", "administrador", "inicio admin"],          // GET /api/buzon: solo superadmin
    ["/cursos", "superadmin", "inicio admin"],            // GET /api/cursos: administrador y docente
    ["/institucion", "superadmin", "inicio admin"],       // el superadmin no tiene institución
    ["/tareas/t1/entregas", "superadmin", "inicio admin"],// entregas por reto: docente y administrador
  ])("%s como %s redirige a su inicio", async (ruta, rol, inicio) => {
    visitar(ruta, rol);
    expect(await screen.findByText(inicio)).toBeTruthy();
  });

  it.each([
    ["/buzon", "superadmin", "pagina buzon"],
    ["/cursos", "administrador", "pagina cursos"],
    ["/cursos", "docente", "pagina cursos"],
    ["/institucion", "administrador", "pagina mi institucion"],
    ["/tareas/t1/entregas", "docente", "pagina entregas"],
  ])("%s como %s sí entra", async (ruta, rol, texto) => {
    visitar(ruta, rol);
    expect(await screen.findByText(texto)).toBeTruthy();
  });
});
