import { useSyncExternalStore } from "react";
import { Volume2, Square } from "lucide-react";
import "../edumon-ia.css";

// Lectura en voz alta con la Web Speech API del navegador (sin backend).
// Un solo lector para todo el chat: si se pide otra respuesta, se corta la anterior.

const sintesis = () => (typeof window !== "undefined" && window.SpeechSynthesisUtterance ? window.speechSynthesis : undefined);

// es-CO primero, luego español latinoamericano y luego cualquier español
const PREFERENCIA = ["es-co", "es-419", "es-mx", "es-us"];
const normalizar = (lang = "") => lang.replace("_", "-").toLowerCase();

export function elegirVozEspanol(voces) {
  const es = voces.filter((v) => normalizar(v.lang).startsWith("es"));
  for (const pref of PREFERENCIA) {
    const v = es.find((x) => normalizar(x.lang) === pref);
    if (v) return v;
  }
  return es[0] ?? null;
}

// ── estado compartido (voz disponible + qué respuesta está sonando) ──
let estado = { voz: null, sonando: null };
const oyentes = new Set();
const emitir = (cambios) => {
  estado = { ...estado, ...cambios };
  oyentes.forEach((fn) => fn());
};

const cargarVoces = () => {
  const s = sintesis();
  if (s) emitir({ voz: elegirVozEspanol(s.getVoices()) });
};

if (sintesis()) {
  cargarVoces();
  // las voces llegan de forma asíncrona (Chrome, Android, iOS)
  sintesis().addEventListener?.("voiceschanged", cargarVoces);
}

const suscribir = (fn) => { oyentes.add(fn); return () => oyentes.delete(fn); };
const leerEstado = () => estado;

/** Texto limpio para leer: sin enlaces, emojis ni marcas. */
export function textoParaLeer(texto = "") {
  return texto
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[*_#>`~]/g, "")
    .replace(/[\p{Extended_Pictographic}️‍]/gu, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

// Chrome de escritorio corta las lecturas largas (~15 s): se lee por frases
function enFrases(texto, max = 180) {
  const frases = texto.split(/(?<=[.!?:;])\s+|\n+/).map((f) => f.trim()).filter(Boolean);
  const partes = [];
  for (const f of frases) {
    if (f.length <= max) { partes.push(f); continue; }
    let resto = f;
    while (resto.length > max) {
      const corte = resto.lastIndexOf(",", max) > 40 ? resto.lastIndexOf(",", max) + 1 : resto.lastIndexOf(" ", max);
      partes.push(resto.slice(0, corte > 0 ? corte : max).trim());
      resto = resto.slice(corte > 0 ? corte : max).trim();
    }
    if (resto) partes.push(resto);
  }
  return partes;
}

export function detenerLectura() {
  const s = sintesis();
  if (s && (s.speaking || s.pending)) s.cancel();
  if (estado.sonando) emitir({ sonando: null });
}

// se llama directo desde el clic: iOS y Android solo permiten hablar tras un gesto del usuario
function leer(id, texto) {
  const s = sintesis();
  const { voz } = estado;
  if (!s || !voz) return;
  s.cancel();
  const partes = enFrases(textoParaLeer(texto));
  if (!partes.length) return;
  emitir({ sonando: id });
  partes.forEach((parte, i) => {
    const u = new window.SpeechSynthesisUtterance(parte);
    u.voice = voz;
    u.lang = voz.lang;
    u.rate = 0.95;
    if (i === partes.length - 1) u.onend = () => { if (estado.sonando === id) emitir({ sonando: null }); };
    u.onerror = () => { if (estado.sonando === id) emitir({ sonando: null }); };
    s.speak(u);
  });
}

/** Botón "Escuchar" de una respuesta. No se muestra sin speechSynthesis o sin voz en español. */
export default function BotonEscuchar({ id, texto }) {
  const { voz, sonando } = useSyncExternalStore(suscribir, leerEstado, leerEstado);
  if (!voz || !texto?.trim()) return null;
  const activo = sonando === id;

  return (
    <button
      type="button"
      className="eia-link"
      onClick={() => (activo ? detenerLectura() : leer(id, texto))}
      aria-pressed={activo}
      aria-label={activo ? "Detener la lectura en voz alta" : "Escuchar esta respuesta en voz alta"}
      style={{ display: "inline-flex", alignItems: "center", gap: 5, color: activo ? "#B91C1C" : undefined }}
    >
      {activo ? <Square size={14} aria-hidden="true" /> : <Volume2 size={16} aria-hidden="true" />}
      {activo ? "Detener" : "Escuchar"}
    </button>
  );
}
