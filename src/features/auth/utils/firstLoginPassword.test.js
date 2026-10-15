import { describe, it, expect, beforeEach } from "vitest";
import { stashLoginPassword, readLoginPassword, clearLoginPassword } from "./firstLoginPassword";

beforeEach(() => {
  clearLoginPassword();
  sessionStorage.clear();
  localStorage.clear();
});

describe("contraseña del primer inicio", () => {
  it("se guarda y se lee en memoria", () => {
    stashLoginPassword("Temporal123");
    expect(readLoginPassword()).toBe("Temporal123");
  });

  it("nunca se escribe en sessionStorage ni localStorage", () => {
    stashLoginPassword("Temporal123");
    expect(JSON.stringify({ ...sessionStorage })).not.toContain("Temporal123");
    expect(JSON.stringify({ ...localStorage })).not.toContain("Temporal123");
  });

  it("se borra al limpiar", () => {
    stashLoginPassword("Temporal123");
    clearLoginPassword();
    expect(readLoginPassword()).toBeNull();
  });
});
