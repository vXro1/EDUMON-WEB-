// Cadena de hashes SHA-256 (Web Crypto), igual en espíritu a la bitácora de alertas del
// backend: cada evento se firma junto con el hash del anterior, así que editar uno rompe
// la cadena desde ese punto en adelante.

const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

export async function sha256(texto) {
  return hex(await globalThis.crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto)));
}

const contenido = (e) => JSON.stringify({ accion: e.accion, estado: e.estado, nota: e.nota });

/** Encadena eventos: [{...evento, hashAnterior, hash}] */
export async function encadenar(eventos, genesis = "alerta-demo-edumon") {
  let anterior = await sha256(genesis);
  const cadena = [];
  for (const e of eventos) {
    const hash = await sha256(anterior + contenido(e));
    cadena.push({ ...e, hashAnterior: anterior, hash });
    anterior = hash;
  }
  return cadena;
}

/**
 * Verifica una cadena (posiblemente editada): recalcula cada hash con el contenido actual.
 * Devuelve el índice del primer evento que no cuadra (o -1 si está íntegra) y los hashes recalculados.
 */
export async function verificar(cadena) {
  const recalculados = [];
  let rota = -1;
  for (let i = 0; i < cadena.length; i++) {
    const e = cadena[i];
    const anteriorEsperado = i === 0 ? e.hashAnterior : cadena[i - 1].hash;
    const h = await sha256(e.hashAnterior + contenido(e));
    recalculados.push(h);
    if (rota === -1 && (h !== e.hash || e.hashAnterior !== anteriorEsperado)) rota = i;
  }
  return { rota, recalculados };
}
