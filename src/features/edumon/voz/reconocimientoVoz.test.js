import { describe, it, expect, beforeEach, vi } from "vitest";
import { dictar, reconocimientoSoportado } from "./reconocimientoVoz";

let ultimo;
class ReconocedorFalso {
  constructor() { ultimo = this; this.start = vi.fn(); this.stop = vi.fn(() => this.onend?.()); this.abort = vi.fn(); }
}
const resultado = (texto, isFinal) => Object.assign([{ transcript: texto }], { isFinal });

describe("dictar", () => {
  beforeEach(() => { window.SpeechRecognition = ReconocedorFalso; });

  it("detecta el soporte del navegador", () => {
    expect(reconocimientoSoportado()).toBe(true);
  });

  it("va entregando el texto en vivo y lo devuelve completo al pausar", () => {
    const onTexto = vi.fn();
    const onFin = vi.fn();
    const sesion = dictar({ onTexto, onFin });
    expect(ultimo.continuous).toBe(true);
    ultimo.onresult({ resultIndex: 0, results: [resultado("mi hijo no", false)] });
    expect(onTexto).toHaveBeenLastCalledWith("mi hijo no");
    ultimo.onresult({ resultIndex: 0, results: [resultado("mi hijo no duerme", true)] });
    ultimo.onresult({ resultIndex: 1, results: [resultado("mi hijo no duerme", true), resultado("bien", false)] });
    expect(onTexto).toHaveBeenLastCalledWith("mi hijo no duerme bien");
    sesion.detener();
    expect(onFin).toHaveBeenCalledWith("mi hijo no duerme bien");
  });

  it("ignora el silencio y avisa los errores reales", () => {
    const onError = vi.fn();
    dictar({ onError });
    ultimo.onerror({ error: "no-speech" });
    expect(onError).not.toHaveBeenCalled();
    ultimo.onerror({ error: "not-allowed" });
    expect(onError).toHaveBeenCalledWith("not-allowed");
  });

  it("cancelar no entrega texto", () => {
    const onFin = vi.fn();
    const sesion = dictar({ onFin });
    sesion.cancelar();
    expect(ultimo.abort).toHaveBeenCalled();
    expect(onFin).not.toHaveBeenCalled();
  });
});
