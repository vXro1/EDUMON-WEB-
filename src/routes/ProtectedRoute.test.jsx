import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

const ensureSession = vi.fn();
const auth = { isAuthenticated: false, user: null, loading: false, sessionChecked: true, ensureSession };

vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuthContext: () => auth,
}));

vi.mock("@/components", () => ({
  LoadingScreen: ({ message }) => <p>{message}</p>,
}));

const { ProtectedRoute, PublicOnlyRoute, RoleRedirect, ROLE_HOME } = await import("./ProtectedRoute");

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<PublicOnlyRoute><p>pantalla login</p></PublicOnlyRoute>} />
        <Route path="/primer-inicio" element={<ProtectedRoute><p>asistente primer inicio</p></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={["administrador", "superadmin"]}><p>inicio admin</p></ProtectedRoute>} />
        <Route path="/docente" element={<ProtectedRoute allowedRoles={["docente"]}><p>inicio docente</p></ProtectedRoute>} />
        <Route path="/padre" element={<ProtectedRoute allowedRoles={["padre", "padre/tutor"]}><p>inicio padre</p></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><p>mi perfil</p></ProtectedRoute>} />
      </Routes>
    </MemoryRouter>
  );
}

function setAuth(next) {
  Object.assign(auth, { isAuthenticated: false, user: null, loading: false, sessionChecked: true }, next);
}

beforeEach(() => {
  ensureSession.mockClear();
  setAuth({});
});
afterEach(cleanup);

describe("ProtectedRoute", () => {
  it("muestra la pantalla de carga mientras verifica la sesión", () => {
    setAuth({ loading: true });
    renderAt("/perfil");
    expect(screen.getByText("Verificando sesión...")).toBeTruthy();
  });

  it("verifica la sesión bajo demanda si todavía no se ha consultado", () => {
    setAuth({ sessionChecked: false });
    renderAt("/perfil");
    expect(screen.getByText("Verificando sesión...")).toBeTruthy();
    expect(ensureSession).toHaveBeenCalledTimes(1);
  });

  it("no vuelve a consultar la sesión si ya se verificó", () => {
    setAuth({ isAuthenticated: true, user: { rol: "docente" } });
    renderAt("/docente");
    expect(ensureSession).not.toHaveBeenCalled();
  });

  it("envía al login a quien no tiene sesión", () => {
    renderAt("/admin");
    expect(screen.getByText("pantalla login")).toBeTruthy();
  });

  it("muestra la página cuando el rol está permitido", () => {
    setAuth({ isAuthenticated: true, user: { rol: "docente" } });
    renderAt("/docente");
    expect(screen.getByText("inicio docente")).toBeTruthy();
  });

  it("redirige al inicio de su rol cuando el rol no está permitido", () => {
    setAuth({ isAuthenticated: true, user: { rol: "padre" } });
    renderAt("/admin");
    expect(screen.getByText("inicio padre")).toBeTruthy();
  });

  it("obliga a completar el primer inicio de sesión", () => {
    setAuth({ isAuthenticated: true, user: { rol: "docente", primerInicioSesion: true } });
    renderAt("/docente");
    expect(screen.getByText("asistente primer inicio")).toBeTruthy();
  });

  it("permite rutas sin restricción de rol a cualquier usuario con sesión", () => {
    setAuth({ isAuthenticated: true, user: { rol: "padre/tutor" } });
    renderAt("/perfil");
    expect(screen.getByText("mi perfil")).toBeTruthy();
  });
});

describe("PublicOnlyRoute", () => {
  it("muestra el login a quien no tiene sesión", () => {
    renderAt("/login");
    expect(screen.getByText("pantalla login")).toBeTruthy();
  });

  it("muestra el login a un rol sin inicio en vez de entrar en un bucle", () => {
    setAuth({ isAuthenticated: true, user: { rol: "estudiante" } });
    renderAt("/dashboard");
    expect(screen.getByText("pantalla login")).toBeTruthy();
  });

  it("envía al inicio de su rol a quien ya inició sesión", () => {
    setAuth({ isAuthenticated: true, user: { rol: "superadmin" } });
    renderAt("/login");
    expect(screen.getByText("inicio admin")).toBeTruthy();
  });
});

describe("RoleRedirect", () => {
  it.each([
    ["administrador", "inicio admin"],
    ["docente", "inicio docente"],
    ["padre/tutor", "inicio padre"],
  ])("lleva a %s a su inicio", (rol, texto) => {
    setAuth({ isAuthenticated: true, user: { rol } });
    renderAt("/dashboard");
    expect(screen.getByText(texto)).toBeTruthy();
  });

  it("cada rol con cuenta tiene un inicio definido", () => {
    for (const rol of ["superadmin", "administrador", "docente", "padre", "padre/tutor"]) {
      expect(ROLE_HOME[rol]).toMatch(/^\//);
    }
  });
});
