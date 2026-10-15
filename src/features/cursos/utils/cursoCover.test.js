import { describe, it, expect } from "vitest";
import { getCursoAvatar, getCursoCover, CURSO_AVATARS } from "./cursoCover";

describe("getCursoAvatar", () => {
  it("devuelve siempre el mismo avatar para el mismo curso", () => {
    const curso = { _id: "65f1c2a9e4b0a1b2c3d4e5f6" };
    expect(getCursoAvatar(curso)).toBe(getCursoAvatar({ ...curso }));
  });

  it("devuelve uno de los avatares de Edumon", () => {
    expect(CURSO_AVATARS).toContain(getCursoAvatar({ _id: "abc" }));
    expect(CURSO_AVATARS).toContain(getCursoAvatar(null));
  });

  it("reparte cursos distintos entre varios avatares", () => {
    const usados = new Set(Array.from({ length: 24 }, (_, i) => getCursoAvatar({ _id: `curso-${i}` })));
    expect(usados.size).toBeGreaterThan(4);
  });
});

describe("getCursoCover", () => {
  it("prioriza la portada real del curso", () => {
    expect(getCursoCover({ fotoPortada: "/uploads/a.jpg", imagen: "/b.jpg" })).toBe("/uploads/a.jpg");
    expect(getCursoCover({ fotoPortadaUrl: "/uploads/c.jpg" })).toBe("/uploads/c.jpg");
  });

  it("devuelve null si no hay portada", () => {
    expect(getCursoCover({})).toBeNull();
    expect(getCursoCover(undefined)).toBeNull();
  });
});
