import { describe, it, expect } from "vitest";
import { pideRecursos, parrafos, trozosConEnlaces, tiempoRelativo } from "./textoChat";
import { textoParaLeer, enFrases } from "../voz/lectorVoz";

describe("pideRecursos", () => {
  it("reconoce cuando la familia pide videos o más información", () => {
    expect(pideRecursos("¿Me puedes recomendar videos?")).toBe(true);
    expect(pideRecursos("Quiero aprender más sobre este tema")).toBe(true);
    expect(pideRecursos("¿Dónde puedo encontrar más información?")).toBe(true);
    expect(pideRecursos("Dame recursos para estudiar")).toBe(true);
  });

  it("no confunde una consulta normal con un pedido de recursos", () => {
    expect(pideRecursos("Hola")).toBe(false);
    expect(pideRecursos("Mi hijo juega videojuegos todo el día")).toBe(false);
    expect(pideRecursos("No quiere hacer las tareas")).toBe(false);
  });
});

describe("parrafos y enlaces", () => {
  it("separa párrafos por líneas en blanco y conserva los saltos simples", () => {
    expect(parrafos("Uno.\n\nDos\ncontinúa.\n\n\n")).toEqual(["Uno.", "Dos\ncontinúa."]);
  });

  it("detecta enlaces sin incluir la puntuación final", () => {
    const t = trozosConEnlaces("Mira https://www.unicef.org/colombia. Gracias");
    expect(t).toEqual([
      { tipo: "texto", valor: "Mira " },
      { tipo: "enlace", valor: "https://www.unicef.org/colombia" },
      { tipo: "texto", valor: ". Gracias" },
    ]);
  });
});

describe("tiempoRelativo", () => {
  const ahora = new Date("2026-10-20T15:00:00");
  it("describe fechas recientes de forma corta", () => {
    expect(tiempoRelativo(new Date("2026-10-20T14:58:00"), ahora)).toBe("Hace 2 min");
    expect(tiempoRelativo(new Date("2026-10-19T09:00:00"), ahora)).toBe("Ayer");
    expect(tiempoRelativo(null, ahora)).toBe("");
  });
});

describe("lectura en voz alta", () => {
  it("expande abreviaturas y quita viñetas y separadores visuales", () => {
    const t = textoParaLeer("• Dedica 5 min al día, p. ej. antes de dormir · etc.");
    expect(t).toContain("5 minutos");
    expect(t).toContain("por ejemplo");
    expect(t).toContain("etcétera");
    expect(t).not.toMatch(/[•·]/);
  });

  it("divide textos largos en partes que el navegador no corta", () => {
    const largo = `${"palabra ".repeat(60)}fin.`;
    expect(enFrases(largo).every((p) => p.length <= 180)).toBe(true);
  });
});
