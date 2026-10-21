import { describe, it, expect, beforeEach, vi } from "vitest";

function instalarSintesisFalsa() {
  const habladas = [];
  const sintesis = {
    speaking: false,
    pending: false,
    paused: false,
    getVoices: () => [{ lang: "es-CO", name: "Voz CO", voiceURI: "co" }, { lang: "en-US", name: "En", voiceURI: "en" }],
    addEventListener: () => {},
    speak: vi.fn((u) => { habladas.push(u); sintesis.speaking = true; }),
    cancel: vi.fn(() => { habladas.length = 0; sintesis.speaking = false; sintesis.paused = false; }),
    pause: vi.fn(() => { sintesis.paused = true; }),
    resume: vi.fn(() => { sintesis.paused = false; }),
  };
  window.speechSynthesis = sintesis;
  window.SpeechSynthesisUtterance = function Utterance(texto) { this.text = texto; };
  return { sintesis, habladas };
}

describe("lectorVoz", () => {
  let falso;
  let lector;

  beforeEach(async () => {
    vi.resetModules();
    falso = instalarSintesisFalsa();
    lector = await import("./lectorVoz");
  });

  it("lee con la voz en español y la velocidad elegida, y avisa al terminar", () => {
    const onFin = vi.fn();
    lector.cambiarVelocidad(1.15);
    expect(lector.leer("m1", "Primera frase. Segunda frase.", { onFin })).toBe(true);
    expect(falso.habladas).toHaveLength(2);
    expect(falso.habladas[0].voice.lang).toBe("es-CO");
    expect(falso.habladas[0].rate).toBe(1.15);
    falso.habladas.at(-1).onend();
    expect(onFin).toHaveBeenCalledWith("fin");
  });

  it("pausa y reanuda la lectura en curso", () => {
    lector.leer("m1", "Hola.");
    lector.pausarLectura();
    expect(falso.sintesis.pause).toHaveBeenCalled();
    lector.reanudarLectura();
    expect(falso.sintesis.resume).toHaveBeenCalled();
  });

  it("al leer otra respuesta corta la anterior: nunca suenan dos a la vez", () => {
    const finPrimera = vi.fn();
    lector.leer("m1", "Primera respuesta.", { onFin: finPrimera });
    lector.leer("m2", "Segunda respuesta.");
    expect(falso.sintesis.cancel).toHaveBeenCalled();
    expect(finPrimera).toHaveBeenCalledWith("detenida");
    expect(falso.habladas.map((u) => u.text)).toEqual(["Segunda respuesta."]);
  });

  it("detener avisa con motivo 'detenida' para que el modo voz no vuelva a escuchar", () => {
    const onFin = vi.fn();
    lector.leer("m1", "Hola.", { onFin });
    lector.detenerLectura();
    expect(onFin).toHaveBeenCalledWith("detenida");
  });
});
