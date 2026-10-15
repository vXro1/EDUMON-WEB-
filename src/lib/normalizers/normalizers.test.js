import { describe, it, expect } from "vitest";
import { normalizeEntrega, normalizeTarea, normalizeTareas, normalizeUser } from "./index";

describe("normalizeEntrega", () => {
  it("devuelve null sin datos", () => {
    expect(normalizeEntrega(null)).toBeNull();
  });

  it("toma los ids aunque vengan poblados", () => {
    const entrega = normalizeEntrega({ id: "e1", tareaId: { _id: "t1" }, padreId: "p1" });
    expect(entrega._id).toBe("e1");
    expect(entrega.tareaId).toBe("t1");
    expect(entrega.padreId).toBe("p1");
  });

  it("usa \"Reto\" como título cuando el reto no tiene nombre", () => {
    expect(normalizeEntrega({ _id: "e1", tarea: { _id: "t1" } }).tarea.titulo).toBe("Reto");
    expect(normalizeEntrega({ _id: "e2", tareaId: { _id: "t2" } }).tarea.titulo).toBe("Reto");
  });
});

describe("normalizeTarea", () => {
  it("devuelve null sin datos", () => {
    expect(normalizeTarea(null)).toBeNull();
  });

  it("acepta el curso como curso o cursoId poblado", () => {
    expect(normalizeTarea({ _id: "t1", curso: { id: "c1", nombre: "Ciencias" } }).curso).toEqual({ _id: "c1", nombre: "Ciencias" });
    expect(normalizeTarea({ _id: "t2", cursoId: { _id: "c2" } }).curso).toEqual({ _id: "c2", nombre: "" });
  });

  it("normaliza listas y descarta vacíos", () => {
    const lista = normalizeTareas([{ _id: "t1" }, null, { id: "t2" }]);
    expect(lista.every(Boolean)).toBe(true);
  });
});

describe("normalizeUser", () => {
  it("devuelve un usuario seguro cuando no hay datos", () => {
    const user = normalizeUser(null);
    expect(user.nombre).toBe("Sin nombre");
    expect(user.rol).toBe("desconocido");
    expect(user.primerInicioSesion).toBe(false);
  });
});
