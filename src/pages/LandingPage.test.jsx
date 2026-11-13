import { describe, it, expect, vi, afterEach, beforeAll } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import { renderPagina } from "@/test/renderPagina";

vi.mock("@/features/auth/context/AuthContext", () => ({
  useAuthContext: () => ({ user: null, isAuthenticated: false }),
  useUserContext: () => ({ user: null }),
}));
vi.mock("@/services/appMovilService", async (orig) => ({
  ...(await orig()),
  appMovilGetActual: () => Promise.resolve(null),
}));

beforeAll(() => {
  // jsdom no implementa matchMedia (lo usa embla-carousel)
  window.matchMedia ??= () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
  // ni IntersectionObserver: este reporta todo como visible al observarlo
  globalThis.IntersectionObserver ??= class {
    constructor(cb) { this.cb = cb; }
    observe(el) { this.cb([{ isIntersecting: true, target: el }]); }
    unobserve() {}
    disconnect() {}
  };
  globalThis.ResizeObserver ??= class { observe() {} unobserve() {} disconnect() {} };
});

const { default: LandingPage } = await import("./LandingPage");

afterEach(cleanup);

describe("LandingPage", () => {
  it("renderiza y carga el carrusel de módulos desde su chunk", async () => {
    renderPagina(<LandingPage />);
    // al "verse" la sección, CargarAlVer descarga y monta el carrusel
    expect((await screen.findAllByText("Mi familia y mi identidad")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("Familia que dialoga").length).toBeGreaterThan(0);
  });
});
