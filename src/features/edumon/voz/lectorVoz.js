import { useSyncExternalStore } from "react";

const sintesis = () => (typeof window !== "undefined" && window.SpeechSynthesisUtterance ? window.speechSynthesis : undefined);

const PREFERENCIA = ["es-co", "es-419", "es-mx", "es-us"];
const normalizarLang = (lang = "") => lang.replace("_", "-").toLowerCase();

export function elegirVozEspanol(voces) {
  const es = voces.filter((v) => normalizarLang(v.lang).startsWith("es"));
  for (const pref of PREFERENCIA) {
    const v = es.find((x) => normalizarLang(x.lang) === pref);
    if (v) return v;
  }
  return es[0] ?? null;
}

export const VELOCIDADES = [
  { valor: 0.8, etiqueta: "Lenta" },
  { valor: 0.95, etiqueta: "Normal" },
  { valor: 1.15, etiqueta: "Rápida" },
];

const CLAVE_PREFS = "edumon-voz-prefs";

const leerPrefs = () => {
  try {
    return JSON.parse(window.localStorage.getItem(CLAVE_PREFS)) ?? {};
  } catch {
    return {};
  }
};

const guardarPrefs = (prefs) => {
  try {
    window.localStorage.setItem(CLAVE_PREFS, JSON.stringify(prefs));
  } catch {
    return;
  }
};

const prefsIniciales = typeof window !== "undefined" ? leerPrefs() : {};

let estado = {
  soportado: Boolean(sintesis()),
  voces: [],
  voz: null,
  velocidad: VELOCIDADES.some((v) => v.valor === prefsIniciales.velocidad) ? prefsIniciales.velocidad : 0.95,
  sonando: null,
  pausado: false,
  error: "",
};

const oyentes = new Set();
const emitir = (cambios) => {
  estado = { ...estado, ...cambios };
  oyentes.forEach((fn) => fn());
};

const cargarVoces = () => {
  const s = sintesis();
  if (!s) return;
  const voces = s.getVoices().filter((v) => normalizarLang(v.lang).startsWith("es"));
  const guardada = voces.find((v) => v.voiceURI === leerPrefs().vozURI);
  emitir({ voces, voz: guardada ?? (estado.voz && voces.includes(estado.voz) ? estado.voz : elegirVozEspanol(voces)) });
};

if (sintesis()) {
  cargarVoces();
  sintesis().addEventListener?.("voiceschanged", cargarVoces);
}

const suscribir = (fn) => { oyentes.add(fn); return () => oyentes.delete(fn); };
const leerEstado = () => estado;

export const useLectorVoz = () => useSyncExternalStore(suscribir, leerEstado, leerEstado);

const ABREVIATURAS = [
  [/\bp\. ?ej\./gi, "por ejemplo"],
  [/\betc\./gi, "etcétera"],
  [/\baprox\./gi, "aproximadamente"],
  [/\bDr\./g, "doctor"],
  [/\bDra\./g, "doctora"],
  [/\bSr\./g, "señor"],
  [/\bSra\./g, "señora"],
  [/\bN\.?º/g, "número"],
  [/\bmin\b\.?/g, "minutos"],
];

export function textoParaLeer(texto = "") {
  let t = String(texto)
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_#>`~]/g, "")
    .replace(/[\p{Extended_Pictographic}️‍]/gu, "")
    .replace(/^\s*[-•·]\s+/gm, "")
    .replace(/\s*[→·|]\s*/g, ", ");
  for (const [patron, reemplazo] of ABREVIATURAS) t = t.replace(patron, reemplazo);
  return t
    .replace(/[ \t]+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/,\s*,/g, ",")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export function enFrases(texto, max = 180) {
  const frases = texto.split(/(?<=[.!?:;])\s+|\n+/).map((f) => f.trim()).filter(Boolean);
  const partes = [];
  for (const f of frases) {
    if (f.length <= max) { partes.push(f); continue; }
    let resto = f;
    while (resto.length > max) {
      const coma = resto.lastIndexOf(",", max);
      const corte = coma > 40 ? coma + 1 : resto.lastIndexOf(" ", max);
      partes.push(resto.slice(0, corte > 0 ? corte : max).trim());
      resto = resto.slice(corte > 0 ? corte : max).trim();
    }
    if (resto) partes.push(resto);
  }
  return partes;
}

let alTerminar = null;
let lecturaActual = 0;

const finalizar = (id, motivo) => {
  if (estado.sonando !== id) return;
  emitir({ sonando: null, pausado: false });
  const fn = alTerminar;
  alTerminar = null;
  fn?.(motivo);
};

export function detenerLectura() {
  const s = sintesis();
  const id = estado.sonando;
  lecturaActual += 1;
  if (s && (s.speaking || s.pending || s.paused)) s.cancel();
  if (id) finalizar(id, "detenida");
}

export function leer(id, texto, { onFin } = {}) {
  const s = sintesis();
  if (!s) {
    emitir({ error: "Tu navegador no permite leer en voz alta." });
    onFin?.("no_soportado");
    return false;
  }
  if (estado.sonando) detenerLectura();
  const partes = enFrases(textoParaLeer(texto));
  if (!partes.length) { onFin?.("vacio"); return false; }

  const lectura = ++lecturaActual;
  alTerminar = onFin ?? null;
  emitir({ sonando: id, pausado: false, error: "" });

  partes.forEach((parte, i) => {
    const u = new window.SpeechSynthesisUtterance(parte);
    if (estado.voz) {
      u.voice = estado.voz;
      u.lang = estado.voz.lang;
    } else {
      u.lang = "es-CO";
    }
    u.rate = estado.velocidad;
    if (i === partes.length - 1) u.onend = () => { if (lectura === lecturaActual) finalizar(id, "fin"); };
    u.onerror = (e) => {
      if (lectura !== lecturaActual || e.error === "interrupted" || e.error === "canceled") return;
      emitir({ error: "No se pudo reproducir el audio en este dispositivo." });
      s.cancel();
      finalizar(id, "error");
    };
    s.speak(u);
  });
  return true;
}

export function pausarLectura() {
  const s = sintesis();
  if (!s || !estado.sonando || estado.pausado) return;
  s.pause();
  emitir({ pausado: true });
}

export function reanudarLectura() {
  const s = sintesis();
  if (!s || !estado.sonando || !estado.pausado) return;
  s.resume();
  emitir({ pausado: false });
}

export function cambiarVelocidad(valor) {
  emitir({ velocidad: valor });
  guardarPrefs({ ...leerPrefs(), velocidad: valor });
}

export function cambiarVoz(vozURI) {
  const voz = estado.voces.find((v) => v.voiceURI === vozURI) ?? null;
  emitir({ voz });
  guardarPrefs({ ...leerPrefs(), vozURI: voz?.voiceURI ?? null });
}

export const limpiarErrorLectura = () => emitir({ error: "" });
