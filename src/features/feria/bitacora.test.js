import { describe, it, expect } from "vitest";
import { encadenar, verificar, sha256 } from "./bitacora";
import { BITACORA_INICIAL } from "./feriaDatos";

describe("bitácora de /feria", () => {
  it("sha256 coincide con el valor estándar", async () => {
    expect(await sha256("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  it("la cadena original está íntegra", async () => {
    const cadena = await encadenar(BITACORA_INICIAL);
    expect(cadena).toHaveLength(4);
    expect(cadena[1].hashAnterior).toBe(cadena[0].hash);
    expect((await verificar(cadena)).rota).toBe(-1);
  });

  it("editar un evento rompe la cadena desde ese evento", async () => {
    const cadena = await encadenar(BITACORA_INICIAL);
    const alterada = cadena.map((e, i) => (i === 2 ? { ...e, nota: "editado a mano" } : e));
    expect((await verificar(alterada)).rota).toBe(2);
  });
});
