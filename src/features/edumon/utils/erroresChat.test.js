import { describe, it, expect } from "vitest";
import { clasificarErrorChat } from "./erroresChat";

const http = (status, data = {}) => Object.assign(new Error(data.message || `Error ${status}`), { status, data });

describe("clasificarErrorChat", () => {
  it("un 402 no se presenta como problema de conexión ni se puede reintentar", () => {
    const e = clasificarErrorChat(http(402));
    expect(e.tipo).toBe("servicio_restringido");
    expect(e.reintentable).toBe(false);
    expect(e.texto).toMatch(/no es un problema de tu conexión/i);
    expect(e.texto).not.toMatch(/revisa tu conexión/i);
  });

  it("un 402 con mensaje del servidor muestra ese mensaje", () => {
    const e = clasificarErrorChat(http(402, { message: "El colegio agotó los créditos de IA de este mes." }));
    expect(e.texto).toBe("El colegio agotó los créditos de IA de este mes.");
  });

  it("LIMITE_IA permite reintentar después de la espera que indica el servidor", () => {
    const e = clasificarErrorChat(http(429, { code: "LIMITE_IA", retryAfter: 42 }));
    expect(e.tipo).toBe("limite");
    expect(e.reintentable).toBe(true);
    expect(e.esperaSegundos).toBe(42);
  });

  it("sin conexión del navegador se informa como problema de conexión", () => {
    const e = clasificarErrorChat(new TypeError("Failed to fetch"), { enLinea: false });
    expect(e.tipo).toBe("sin_conexion");
    expect(e.reintentable).toBe(true);
  });

  it("el fallo de red con el navegador en línea no afirma que no hay internet", () => {
    const e = clasificarErrorChat(new TypeError("Failed to fetch"), { enLinea: true });
    expect(e.tipo).toBe("red");
  });

  it("detecta el tiempo agotado que lanza apiFetch", () => {
    const e = clasificarErrorChat(new Error("La solicitud tardó demasiado. Verifica tu conexión e intenta de nuevo."));
    expect(e.tipo).toBe("tiempo_agotado");
    expect(e.reintentable).toBe(true);
  });

  it("un 5xx es un fallo temporal reintentable", () => {
    const e = clasificarErrorChat(http(503));
    expect(e.tipo).toBe("temporal");
    expect(e.reintentable).toBe(true);
  });

  it("un 400 no se ofrece reintentar tal cual", () => {
    const e = clasificarErrorChat(http(400, { message: "El mensaje debe tener entre 1 y 2000 caracteres" }));
    expect(e.reintentable).toBe(false);
    expect(e.texto).toMatch(/2000 caracteres/);
  });
});
