import { describe, it, expect } from "vitest";
import { humanizeError, humanizeCursosActivosError } from "./humanizeError";

describe("humanizeError", () => {
  it("usa el mensaje por defecto sin error", () => {
    expect(humanizeError(null)).toBe("Ocurrió un error. Intenta de nuevo");
    expect(humanizeError(undefined, "Falló")).toBe("Falló");
  });

  it("traduce credenciales inválidas", () => {
    expect(humanizeError({ message: "Credenciales inválidas" })).toBe("Usuario o contraseña incorrectos");
  });

  it("traduce errores de red", () => {
    expect(humanizeError(new Error("Failed to fetch"))).toBe("Sin conexión. Revisa tu internet e intenta de nuevo");
  });

  it("traduce errores de tipo de archivo", () => {
    expect(humanizeError({ message: "Tipo de archivo no permitido" })).toMatch(/no es compatible/);
  });

  it("conserva un mensaje corto del backend con mayúscula inicial", () => {
    expect(humanizeError({ message: "el curso está archivado" })).toBe("El curso está archivado");
  });

  it("usa el mensaje del estado HTTP cuando no hay texto útil", () => {
    expect(humanizeError({ status: 403, message: "" })).toBe("No tienes permiso para esta acción");
    expect(humanizeError({ response: { status: 503, data: {} } })).toBe("Servicio no disponible. Intenta más tarde");
  });

  it("no muestra trazas técnicas", () => {
    const err = { status: 500, message: "TypeError: cannot read properties of undefined" };
    expect(humanizeError(err)).toBe("Error del servidor. Intenta más tarde");
  });
});

describe("humanizeCursosActivosError", () => {
  it("lista los cursos que bloquean la suspensión", () => {
    const err = { data: { cursosActivos: [{ nombre: "Matemáticas 5°" }, { codigoCurso: "CN-01" }] } };
    expect(humanizeCursosActivosError(err)).toBe(
      "No se puede suspender: tiene cursos activos (Matemáticas 5°, CN-01). Archívalos o reasígnalos antes de suspender."
    );
  });

  it("devuelve null si no aplica", () => {
    expect(humanizeCursosActivosError({ data: {} })).toBeNull();
    expect(humanizeCursosActivosError(undefined)).toBeNull();
  });
});
