const PIDE_RECURSOS = /\b(videos?|recursos?|art[ií]culos?|lecturas?|enlaces?|links?|d[oó]nde (puedo )?(encontrar|leer|ver|aprender)|aprender m[aá]s|saber m[aá]s|m[aá]s informaci[oó]n|profundizar|mu[eé]strame ejemplos|busca(r|me)? informaci[oó]n|material(es)?)\b/i;

export const pideRecursos = (texto = "") => PIDE_RECURSOS.test(texto);

export const parrafos = (texto = "") =>
  String(texto).split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

const URL = /(https?:\/\/[^\s<>()]+[^\s<>().,;:!?'"])/g;

export function trozosConEnlaces(texto = "") {
  const trozos = [];
  let ultimo = 0;
  for (const m of String(texto).matchAll(URL)) {
    if (m.index > ultimo) trozos.push({ tipo: "texto", valor: texto.slice(ultimo, m.index) });
    trozos.push({ tipo: "enlace", valor: m[0] });
    ultimo = m.index + m[0].length;
  }
  if (ultimo < texto.length) trozos.push({ tipo: "texto", valor: texto.slice(ultimo) });
  return trozos;
}

export function tiempoRelativo(fecha, ahora = new Date()) {
  if (!fecha) return "";
  const d = new Date(fecha);
  if (Number.isNaN(d.getTime())) return "";
  const minutos = Math.round((ahora - d) / 60000);
  if (minutos < 1) return "Ahora";
  if (minutos < 60) return `Hace ${minutos} min`;
  const mismoDia = d.toDateString() === ahora.toDateString();
  if (mismoDia) return d.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" });
  const ayer = new Date(ahora);
  ayer.setDate(ahora.getDate() - 1);
  if (d.toDateString() === ayer.toDateString()) return "Ayer";
  const dias = Math.floor((ahora - d) / 86400000);
  if (dias < 7) return d.toLocaleDateString("es-CO", { weekday: "long" });
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}
