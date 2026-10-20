import { describe, it, expect, beforeEach } from "vitest";
import { mensajeErrorIA, esLimiteIA, esAlertaModificada } from "./edumonService";
import { guardarRetoDelCiclo, leerRetoDelCiclo, olvidarRetoDelCiclo } from "../data/retoDelCiclo";

const errorCon = (data, message = "x") => Object.assign(new Error(message), { data });

describe("mensajeErrorIA", () => {
  it("muestra tal cual el message del 429 LIMITE_IA", () => {
    const msg = "Llegaste al límite de 20 solicitudes a Edumon cada 60 segundos. Espera 37 s y vuelve a intentarlo.";
    const err = errorCon({ code: "LIMITE_IA", message: msg, retryAfter: 37 }, msg);
    expect(mensajeErrorIA(err)).toBe(msg);
    expect(esLimiteIA(err)).toBe(true);
  });

  it("explica el 409 ALERTA_MODIFICADA y el 422 SIN_TEMAS_SUFICIENTES en español", () => {
    const e409 = errorCon({ code: "ALERTA_MODIFICADA" });
    expect(esAlertaModificada(e409)).toBe(true);
    expect(mensajeErrorIA(e409)).toMatch(/Otra persona cambió esta alerta/);
    expect(mensajeErrorIA(errorCon({ code: "SIN_TEMAS_SUFICIENTES" }))).toMatch(/5 familias/);
  });

  it("pide escribir el mensaje si la transcripción no está disponible", () => {
    expect(mensajeErrorIA(errorCon({ code: "TRANSCRIPCION_NO_DISPONIBLE" }))).toMatch(/Escribe tu mensaje/);
    expect(mensajeErrorIA(errorCon({ code: "NOTAS_VOZ_DESACTIVADAS" }))).toMatch(/Escribe tu mensaje/);
  });

  it("sin código conocido usa el traductor general", () => {
    expect(mensajeErrorIA(new Error("Failed to fetch"))).toBe("Sin conexión. Revisa tu internet e intenta de nuevo");
  });
});

describe("reto del ciclo", () => {
  beforeEach(() => olvidarRetoDelCiclo());

  it("solo lo entrega al curso que lo pidió y se puede olvidar", () => {
    guardarRetoDelCiclo("curso-1", { titulo: "Reto en familia" });
    expect(leerRetoDelCiclo("curso-2")).toBeNull();
    expect(leerRetoDelCiclo("curso-1")).toEqual({ titulo: "Reto en familia" });
    olvidarRetoDelCiclo();
    expect(leerRetoDelCiclo("curso-1")).toBeNull();
  });
});
