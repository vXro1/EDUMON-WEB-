import { describe, it, expect } from "vitest";
import { elegirVozEspanol, textoParaLeer } from "./BotonEscuchar";

const voz = (lang, name = lang) => ({ lang, name });

describe("elegirVozEspanol", () => {
  it("prefiere es-CO, luego español latinoamericano y luego cualquier español", () => {
    expect(elegirVozEspanol([voz("es-ES"), voz("es-MX"), voz("es-CO")]).lang).toBe("es-CO");
    expect(elegirVozEspanol([voz("es-ES"), voz("es_US"), voz("en-US")]).lang).toBe("es_US");
    expect(elegirVozEspanol([voz("en-US"), voz("es-ES")]).lang).toBe("es-ES");
  });

  it("sin voces en español devuelve null (el botón no se muestra)", () => {
    expect(elegirVozEspanol([voz("en-US"), voz("pt-BR")])).toBeNull();
    expect(elegirVozEspanol([])).toBeNull();
  });
});

describe("textoParaLeer", () => {
  it("quita enlaces, emojis y marcas pero conserva los números de las líneas de ayuda", () => {
    const t = textoParaLeer("📞 ICBF: línea 141 (gratuita).\n**Más** en https://www.icbf.gov.co 💙");
    expect(t).toContain("ICBF: línea 141 (gratuita).");
    expect(t).not.toMatch(/https?:|📞|💙|\*/);
  });
});
