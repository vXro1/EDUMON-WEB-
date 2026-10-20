import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Send, Plus, Trash2, ShieldCheck, Lightbulb, BookOpen, MessageCircle, Mic,
  CalendarDays, ClipboardList, ArrowRight, Lock, Sparkles, HeartHandshake,
  PlayCircle, FileText, Ban, Phone, HandHeart,
} from "lucide-react";
import { Toast, Button, UserAvatar } from "@/components";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { humanizeError } from "@/utils/humanizeError";
import ConsentimientoModal from "../components/ConsentimientoModal";
import EdumonMascota from "../components/EdumonMascota";
import RespuestaAcciones from "../components/RespuestaAcciones";
import BotonNotaVoz, { notasDeVozSoportadas } from "../components/BotonNotaVoz";
import "../edumon-ia.css";
import {
  edumonGetConsentimiento, edumonAceptarConsentimiento, edumonRevocarConsentimiento,
  edumonGetConversaciones, edumonCrearConversacion, edumonGetConversacion,
  edumonEliminarConversacion, edumonEnviarMensaje, esConsentimientoRequerido, edumonPedirAyuda,
  mensajeErrorIA, esLimiteIA, edumonEnviarAudio,
} from "../services/edumonService";

// códigos con los que el micrófono se oculta y se pide escribir
const VOZ_NO_DISPONIBLE = ["NOTAS_VOZ_DESACTIVADAS", "TRANSCRIPCION_NO_DISPONIBLE"];

// ideas para empezar: se muestran 4 distintas en cada conversación nueva
const SUGERENCIAS = [
  "Mi hijo no suelta el celular", "Mi hija de 4 años hace rabietas muy fuertes", "No quiere ir al colegio",
  "¿Cómo hablo de sexualidad con mi hijo de 11?", "Mis hijos pelean todo el tiempo", "No quiere hacer las tareas",
  "Le cuesta dormirse en la noche", "Mi hijo adolescente ya no me cuenta nada", "Creo que le hacen matoneo en el colegio",
  "Me siento agotada y sin paciencia", "No come casi nada", "Se enoja muy fácil y grita",
  "Tiene miedo de quedarse solo", "¿Cómo pongo límites sin gritar?",
  "¿Cómo organizo las mañanas antes del colegio?", "Mi hijo está triste desde que cambió de colegio",
  "¿Qué le pongo en la lonchera?", "¿Cómo hablo con el docente sobre un problema?",
  "Nos separamos y no sé cómo decírselo a mis hijos", "Encontré un vapeador en la maleta de mi hijo",
  "Va a tener un hermanito y está celoso", "Se le olvidan siempre los cuadernos",
];

const AZUL = "#0284C7";

const card = {
  background: "var(--color-surface)", borderRadius: 18,
  border: "1px solid var(--color-border)", boxShadow: "var(--clay-card)",
};

const fechaLarga = (fecha) => new Date(fecha).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
const hora = (fecha) => (fecha ? new Date(fecha).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }) : "");

// expresión de Edumon según el tipo de respuesta (mensajes viejos sin "tipo": se deduce)
function expresionDe(m) {
  const tipo = m.tipo
    ?? (m.esRespuestaRiesgo ? "riesgo"
      : m.contenido?.startsWith("¿Qué edad") ? "pedir_edad"
        : m.contenido?.startsWith("Todavía no tengo") ? "fuera_alcance" : "respuesta");
  if (tipo === "riesgo" || m.atencion) return "alerta";
  if (tipo === "pedir_edad") return "pensando";
  if (tipo === "fuera_alcance" || tipo === "no_tareas") return "no";
  if (tipo === "charla") return "saludo";
  return "ia";
}

// ─── Piezas del chat ─────────────────────────────────────────────────────────

function NombreBot({ fecha }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11.5, color: "var(--color-text-muted)", margin: "0 0 4px 2px" }}>
      <strong style={{ color: AZUL }}>Edumon IA</strong>
      <span style={{ fontSize: 9.5, fontWeight: 800, padding: "1px 6px", borderRadius: 999, background: "rgba(2,132,199,0.12)", color: AZUL }}>IA</span>
      {fecha && <span>{hora(fecha)}</span>}
    </div>
  );
}

function BurbujaBot({ children, tono = "normal" }) {
  const tonos = {
    normal: { background: "var(--color-surface)", border: "1px solid var(--color-border)" },
    riesgo: { background: "#FEF2F2", border: "2px solid #DC2626", fontSize: 17 },
  };
  return (
    <div style={{
      padding: "12px 16px", borderRadius: 18, borderTopLeftRadius: 6, fontSize: 16, lineHeight: 1.6,
      whiteSpace: "pre-wrap", wordBreak: "break-word", boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
      color: "var(--color-text)", ...tonos[tono],
    }}>
      {children}
    </div>
  );
}

function FilaBot({ expresion = "ia", fecha, children, animarExpresion = false }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", animation: "edumon-aparecer 0.35s ease-out both" }}>
      <EdumonMascota size={58} expresion={expresion} animacion={animarExpresion ? "pensar" : null} style={{ marginTop: 2 }} />
      <div style={{ maxWidth: "min(82%, 600px)", display: "flex", flexDirection: "column", gap: 8, minWidth: 0 }}>
        <NombreBot fecha={fecha} />
        {children}
      </div>
    </div>
  );
}

// tarjeta "rica" dentro del chat (práctica, reto, evento)
function TarjetaChat({ icono: Icono, color, etiqueta, titulo, children, accion }) {
  return (
    <div style={{
      borderRadius: 14, overflow: "hidden", background: "var(--color-surface)",
      border: `1px solid ${color}55`, boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 12px", background: `${color}14`, color, fontSize: 12, fontWeight: 800, letterSpacing: "0.02em" }}>
        <Icono size={14} /> {etiqueta}
      </div>
      <div style={{ padding: "10px 12px", fontSize: 13.5, lineHeight: 1.55 }}>
        {titulo && <div style={{ fontWeight: 700, marginBottom: 2 }}>{titulo}</div>}
        {children}
        {accion && (
          <div style={{ marginTop: 9 }}>
            <Link to={accion.to} style={{
              display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 999,
              background: color, color: "#fff", fontSize: 12.5, fontWeight: 700, textDecoration: "none",
            }}>
              {accion.texto} <ArrowRight size={13} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

const LINEAS_AYUDA = [
  { numero: "141", nombre: "ICBF", detalle: "Protección de niños, niñas y adolescentes · 24 h" },
  { numero: "155", nombre: "Línea 155", detalle: "Orientación a mujeres víctimas de violencia" },
  { numero: "192", nombre: "Línea 192 · opción 4", detalle: "Apoyo en salud mental" },
  { numero: "123", nombre: "Emergencias", detalle: "Si hay peligro inmediato" },
];

// en riesgo: Edumon al teléfono con botones para llamar directo
function TarjetaLlamar() {
  return (
    <section aria-label="Líneas de ayuda" style={{
      display: "flex", gap: 12, alignItems: "center", padding: 14, borderRadius: 14,
      background: "#FFF7ED", border: "2px solid #EA580C",
    }}>
      <EdumonMascota size={86} expresion="llamar" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <h3 style={{ fontSize: 16, fontWeight: 900, color: "#9A3412", letterSpacing: "0.02em", margin: "0 0 8px" }}>
          LLAMA AHORA · ES GRATIS Y CONFIDENCIAL
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 6 }}>
          {LINEAS_AYUDA.map((l) => (
            <a key={l.numero} href={`tel:${l.numero}`} title={l.detalle} className="eia-focus" aria-label={`Llamar al ${l.numero}, ${l.nombre}: ${l.detalle}`} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 10, textDecoration: "none",
              background: "#fff", border: "1.5px solid #FDBA74", color: "#1F2937",
            }}>
              <Phone size={17} color="#C2410C" aria-hidden="true" />
              <span style={{ lineHeight: 1.25 }}>
                <strong style={{ fontSize: 20 }}>{l.numero}</strong>
                <span style={{ display: "block", fontSize: 13, color: "#374151" }}>{l.nombre}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// nivel 2: la familia decide si quiere que la contacten (sin su permiso no se avisa a nadie)
function TarjetaPedirAyuda({ oferta, onPedirAyuda }) {
  const [enviando, setEnviando] = useState(false);
  const [descartada, setDescartada] = useState(false);

  if (oferta.solicitada) {
    return (
      <div style={{ fontSize: 12.5, color: "#047857", display: "flex", alignItems: "center", gap: 6, margin: "0 0 0 2px" }}>
        <ShieldCheck size={14} /> Pediste apoyo: orientación escolar y tu docente te van a contactar.
      </div>
    );
  }
  if (descartada) return null;

  const pedir = async () => {
    setEnviando(true);
    try { await onPedirAyuda(); } finally { setEnviando(false); }
  };

  return (
    <div style={{ padding: 12, borderRadius: 14, background: "#F0F9FF", border: "1px solid #7DD3FC" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, fontWeight: 800, fontSize: 13, color: "#0369A1", marginBottom: 4 }}>
        <HandHeart size={16} /> ¿Quieres que te acompañen?
      </div>
      <div style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 10 }}>
        Si quieres, aviso a orientación escolar y a tu docente para que te contacten y te apoyen.
        <strong> Solo lo haré si tú lo pides</strong>; no verán tu conversación, solo el tipo de situación y el mensaje que la originó.
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Button size="sm" onClick={pedir} loading={enviando}>Sí, quiero que me contacten</Button>
        <Button size="sm" variant="ghost" onClick={() => setDescartada(true)} disabled={enviando}>Ahora no</Button>
      </div>
    </div>
  );
}

function MensajeBot({ mensaje, onPedirAyuda, conversacionId, avisar }) {
  const esRiesgo = mensaje.tipo === "riesgo" || mensaje.esRespuestaRiesgo;
  const recomienda = mensaje.retoSugerido || mensaje.eventoSugerido;

  return (
    <FilaBot expresion={expresionDe(mensaje)} fecha={mensaje.creadoEn}>
      <BurbujaBot tono={esRiesgo ? "riesgo" : "normal"}>{mensaje.contenido}</BurbujaBot>

      {(esRiesgo || mensaje.tipo === "apoyo" && mensaje.ofrecerAyuda) && <TarjetaLlamar />}

      {mensaje.ofrecerAyuda && <TarjetaPedirAyuda oferta={mensaje.ofrecerAyuda} onPedirAyuda={onPedirAyuda} />}

      {mensaje.practica && (
        <TarjetaChat icono={Lightbulb} color="#059669" etiqueta="PRÁCTICA DE ESTA SEMANA · 5 MIN">
          {mensaje.practica}
        </TarjetaChat>
      )}

      {recomienda && (
        <div style={{ fontSize: 13, color: "var(--color-text-muted)", margin: "2px 0 -2px 2px" }}>
          Además, en tu colegio hay algo que te puede servir:
        </div>
      )}

      {mensaje.retoSugerido && (
        <TarjetaChat
          icono={ClipboardList} color={AZUL} etiqueta="RETO DE ESCUELA DE PADRES"
          titulo={mensaje.retoSugerido.titulo}
          accion={{ to: `/familia/entregas/${mensaje.retoSugerido.tareaId}`, texto: "Ir al reto" }}
        >
          <span style={{ color: "var(--color-text-muted)", fontSize: 12.5 }}>
            Tu docente lo dejó para hacer en casa · entrega hasta el {fechaLarga(mensaje.retoSugerido.fechaEntrega)}
          </span>
        </TarjetaChat>
      )}

      {mensaje.eventoSugerido && (
        <TarjetaChat
          icono={CalendarDays} color="#7C3AED" etiqueta="EVENTO RECOMENDADO"
          titulo={mensaje.eventoSugerido.titulo}
          accion={{ to: "/calendario", texto: "Ver en el calendario" }}
        >
          <span style={{ color: "var(--color-text-muted)", fontSize: 12.5 }}>
            {fechaLarga(mensaje.eventoSugerido.fechaInicio)}
            {mensaje.eventoSugerido.hora && ` · ${mensaje.eventoSugerido.hora}`}
            {mensaje.eventoSugerido.ubicacion && ` · ${mensaje.eventoSugerido.ubicacion}`}
          </span>
        </TarjetaChat>
      )}

      {mensaje.recursos?.length > 0 && (
        <TarjetaChat icono={PlayCircle} color="#DC2626" etiqueta="VIDEOS Y ARTÍCULOS PARA PROFUNDIZAR">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {mensaje.recursos.map((r) => (
              <a key={r.url} href={r.url} target="_blank" rel="noreferrer" style={{
                display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 10, textDecoration: "none",
                border: "1px solid var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)", fontSize: 13,
              }}>
                {r.tipo === "video" ? <PlayCircle size={16} color="#DC2626" /> : <FileText size={16} color="#0284C7" />}
                <span style={{ flex: 1 }}>{r.titulo}</span>
                <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>
                  {r.tipo === "video" ? (r.esBusqueda ? "Buscar en YouTube" : "Ver video") : (r.esBusqueda ? "Buscar artículos" : "Leer artículo")}
                </span>
                <ArrowRight size={13} color="var(--color-text-muted)" />
              </a>
            ))}
          </div>
        </TarjetaChat>
      )}

      {mensaje.fuentes?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, fontSize: 13.5, color: "var(--color-text-muted)" }}>
          <BookOpen size={14} aria-hidden="true" /> Basado en:
          {mensaje.fuentes.map((f) => (
            <span key={f.nombre} style={{ padding: "2px 8px", borderRadius: 999, background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
              {f.url ? <a href={f.url} target="_blank" rel="noreferrer" className="eia-focus">{f.nombre}</a> : f.nombre}
            </span>
          ))}
        </div>
      )}

      <RespuestaAcciones conversacionId={conversacionId} mensaje={mensaje} avisar={avisar} />
    </FilaBot>
  );
}

function MensajeUsuario({ mensaje, usuario }) {
  const esVoz = mensaje.entrada === "voz";
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, alignItems: "flex-end", animation: "edumon-aparecer 0.25s ease-out both" }}>
      <div style={{
        maxWidth: "min(75%, 520px)", padding: "10px 15px", borderRadius: 18, borderBottomRightRadius: 6,
        background: `linear-gradient(135deg, ${AZUL}, #2563EB)`, color: "#fff", fontSize: 16, lineHeight: 1.55,
        whiteSpace: "pre-wrap", wordBreak: "break-word", boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
      }}>
        {esVoz && (
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 800, opacity: 0.95, marginBottom: 2 }}>
            <Mic size={13} aria-hidden="true" /> Nota de voz · transcripción
          </span>
        )}
        {mensaje.contenido}
      </div>
      {/* el avatar que la persona eligió en su perfil */}
      <UserAvatar user={usuario} size={34} />
    </div>
  );
}

// la respuesta real tarda entre 3 y 10 s: pasados 8 s se tranquiliza a la familia
const ESPERA_LARGA_MS = 8000;

function Escribiendo() {
  const [larga, setLarga] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLarga(true), ESPERA_LARGA_MS);
    return () => clearTimeout(t);
  }, []);
  return (
    <FilaBot expresion="pensando" animarExpresion>
      <BurbujaBot>
        <span role="status" aria-live="polite" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--color-text-muted)" }}>
          <span style={{ display: "inline-flex", gap: 4 }}>
            {[0, 1, 2].map((i) => (
              <span key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: AZUL, animation: `edumon-puntos 1.2s ${i * 0.15}s infinite ease-in-out` }} />
            ))}
          </span>
          {larga ? "Sigue pensando, ya casi…" : "Edumon está pensando…"}
        </span>
      </BurbujaBot>
    </FilaBot>
  );
}

function Bienvenida({ sugerencias, onElegir, deshabilitado }) {
  return (
    <FilaBot expresion="saludo">
      <BurbujaBot>
        ¡Hola! Soy <strong>Edumon</strong>, tu asistente con inteligencia artificial. 💙{"\n"}
        Te acompaño con lo que viven tus hijos en casa y en el colegio: emociones, organización y rutinas,
        alimentación, convivencia, hermanos, cambios en la familia y la relación con el colegio. Te doy ideas
        basadas en guías de UNICEF, OMS, ICBF y MinEducación, una práctica corta para la semana y videos o artículos para profundizar.
        Si me cuentas la edad de tu hijo o hija, mis ideas serán más precisas.
      </BurbujaBot>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-text-muted)", margin: "2px 0 0 2px" }}>
        <Ban size={13} /> No hago tareas académicas (matemáticas, física, etc.): te ayudo a acompañar a tu hijo para que las haga.
      </div>
      <div style={{ fontSize: 12, color: "var(--color-text-muted)", margin: "2px 0 0 2px" }}>Puedes empezar con una de estas:</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {sugerencias.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onElegir(s)}
            disabled={deshabilitado}
            style={{
              fontSize: 13, padding: "7px 13px", borderRadius: 999, cursor: "pointer", fontWeight: 600,
              border: `1.5px solid ${AZUL}`, background: "rgba(2,132,199,0.06)", color: AZUL,
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </FilaBot>
  );
}

// ─── Página ──────────────────────────────────────────────────────────────────
export default function EdumonChatPage() {
  const { user } = useAuth();
  const [consentimiento, setConsentimiento] = useState(null); // { versionVigente, aceptado }
  const [mostrarConsentimiento, setMostrarConsentimiento] = useState(false);
  const [conversaciones, setConversaciones] = useState([]);
  const [activa, setActiva] = useState(null); // conversación completa
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [aviso, setAviso] = useState(""); // error que no debe desaparecer solo (ej. 429 LIMITE_IA)
  const [vozDisponible, setVozDisponible] = useState(notasDeVozSoportadas);
  const finRef = useRef(null);
  const inputRef = useRef(null);

  const sugerencias = useMemo(
    () => [...SUGERENCIAS].sort(() => Math.random() - 0.5).slice(0, 4),
    [activa?._id], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const avisar = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const pedirConsentimientoSiFalta = (err) => {
    if (esConsentimientoRequerido(err)) {
      setConsentimiento((c) => ({ ...c, aceptado: false }));
      setMostrarConsentimiento(true);
      return true;
    }
    return false;
  };

  const cargarConversaciones = async () => {
    try {
      const { conversaciones } = await edumonGetConversaciones();
      setConversaciones(conversaciones);
    } catch (err) {
      if (!pedirConsentimientoSiFalta(err)) avisar(humanizeError(err), "error");
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const estado = await edumonGetConsentimiento();
        setConsentimiento(estado);
        if (estado.aceptado) await cargarConversaciones();
        else setMostrarConsentimiento(true);
      } catch (err) {
        avisar(humanizeError(err), "error");
      }
    })();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activa?.mensajes?.length, enviando]);

  // el cuadro de texto crece con el mensaje (hasta su maxHeight)
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [texto]);

  const aceptarConsentimiento = async () => {
    try {
      await edumonAceptarConsentimiento(consentimiento.versionVigente);
      setConsentimiento((c) => ({ ...c, aceptado: true }));
      setMostrarConsentimiento(false);
      await cargarConversaciones();
    } catch (err) {
      avisar(humanizeError(err), "error");
    }
  };

  const revocar = async () => {
    if (!window.confirm("¿Retirar la autorización? Se borrarán todas tus conversaciones con Edumon.")) return;
    try {
      await edumonRevocarConsentimiento();
      setConversaciones([]);
      setActiva(null);
      setConsentimiento((c) => ({ ...c, aceptado: false }));
      avisar("Autorización retirada y conversaciones eliminadas");
    } catch (err) {
      avisar(humanizeError(err), "error");
    }
  };

  const abrir = async (id) => {
    try {
      const { conversacion } = await edumonGetConversacion(id);
      setActiva(conversacion);
    } catch (err) {
      if (!pedirConsentimientoSiFalta(err)) avisar(humanizeError(err), "error");
    }
  };

  const pedirAyuda = async () => {
    if (!activa?._id) return;
    try {
      const { mensaje } = await edumonPedirAyuda(activa._id);
      setActiva((a) => ({
        ...a,
        mensajes: [
          ...a.mensajes.map((m) => (m.ofrecerAyuda && !m.ofrecerAyuda.solicitada
            ? { ...m, ofrecerAyuda: { ...m.ofrecerAyuda, solicitada: true } } : m)),
          mensaje,
        ],
      }));
    } catch (err) {
      avisar(humanizeError(err), "error");
    }
  };

  const nueva = () => {
    setActiva(null);
    inputRef.current?.focus();
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Eliminar esta conversación?")) return;
    try {
      await edumonEliminarConversacion(id);
      setConversaciones((cs) => cs.filter((c) => c._id !== id));
      if (activa?._id === id) setActiva(null);
    } catch (err) {
      avisar(humanizeError(err), "error");
    }
  };

  // texto y nota de voz comparten el flujo: conversación (se crea si falta) → mensaje optimista → respuesta
  const procesar = async ({ optimista, llamar, alFallar }) => {
    setEnviando(true);
    setAviso("");
    try {
      let conversacion = activa;
      if (!conversacion) {
        ({ conversacion } = await edumonCrearConversacion());
        conversacion = { ...conversacion, mensajes: [] };
      }
      // optimista: el mensaje del padre aparece de inmediato
      setActiva({ ...conversacion, mensajes: [...conversacion.mensajes, { _id: "pendiente", rol: "usuario", ...optimista }] });

      const { mensajeUsuario, respuesta, conversacion: meta } = await llamar(conversacion._id);
      const actualizada = { ...conversacion, ...meta, mensajes: [...conversacion.mensajes, mensajeUsuario, respuesta] };
      setActiva(actualizada);
      setConversaciones((cs) => [
        { _id: actualizada._id, titulo: actualizada.titulo, ultimaActividad: new Date().toISOString() },
        ...cs.filter((c) => c._id !== actualizada._id),
      ]);
    } catch (err) {
      setActiva((a) => (a ? { ...a, mensajes: a.mensajes.filter((m) => m._id !== "pendiente") } : a));
      if (!pedirConsentimientoSiFalta(err)) alFallar(err);
    } finally {
      setEnviando(false);
      inputRef.current?.focus();
    }
  };

  const enviar = async (contenido = texto) => {
    const limpio = contenido.trim();
    if (!limpio || enviando) return;
    setTexto("");
    await procesar({
      optimista: { contenido: limpio },
      llamar: (id) => edumonEnviarMensaje(id, limpio),
      alFallar: (err) => {
        setTexto(limpio);
        const msg = mensajeErrorIA(err, "Edumon no pudo responder en este momento. Tu mensaje sigue en el cuadro: intenta enviarlo de nuevo.");
        if (esLimiteIA(err)) setAviso(msg);
        else avisar(msg, "error");
      },
    });
  };

  const enviarNotaDeVoz = async (archivo) => {
    if (enviando) return;
    await procesar({
      optimista: { contenido: "Transcribiendo tu nota de voz…", entrada: "voz" },
      llamar: (id) => edumonEnviarAudio(id, archivo),
      alFallar: (err) => {
        // 404 (función apagada) o 503 (sin transcripción): se oculta el micrófono y se pide escribir
        if (VOZ_NO_DISPONIBLE.includes(err?.data?.code)) setVozDisponible(false);
        setAviso(mensajeErrorIA(err, "No pudimos enviar la nota de voz. Escribe tu mensaje, por favor."));
      },
    });
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  // ── Sin consentimiento: presentación de Edumon IA ──
  if (consentimiento && !consentimiento.aceptado) {
    return (
      <div>
        <Toast msg={toast.msg} type={toast.type} />
        <ConsentimientoModal
          isOpen={mostrarConsentimiento}
          version={consentimiento.versionVigente}
          onAceptar={aceptarConsentimiento}
          onCancelar={() => setMostrarConsentimiento(false)}
        />
        <div style={{
          ...card, maxWidth: 820, margin: "24px auto", padding: "28px 32px", display: "flex", gap: 28,
          alignItems: "center", flexWrap: "wrap", justifyContent: "center",
          background: "linear-gradient(135deg, rgba(14,165,233,0.10), rgba(99,102,241,0.08)), var(--color-surface)",
        }}>
          <EdumonMascota size={230} expresion="ia" animacion="flotar" />
          <div style={{ flex: "1 1 320px", minWidth: 0 }}>
            <span style={{ fontSize: 11.5, fontWeight: 800, color: AZUL, letterSpacing: "0.06em" }}>ASISTENTE CON INTELIGENCIA ARTIFICIAL</span>
            <h1 style={{ fontSize: 26, fontWeight: 900, margin: "4px 0 8px" }}>Conoce a Edumon IA</h1>
            <p style={{ fontSize: 14.5, color: "var(--color-text-muted)", margin: "0 0 14px", lineHeight: 1.6 }}>
              Tu acompañante para la vida de tus hijos en casa y en el colegio: emociones, organización, alimentación,
              convivencia y crianza. Pregúntale a cualquier hora y recibe ideas basadas en guías de UNICEF, OMS, ICBF y MinEducación.
            </p>
            {[
              [HeartHandshake, "Respuestas basadas en UNICEF, ICBF, OMS y el Ministerio de Educación"],
              [Sparkles, "Una práctica corta para la semana, y videos y artículos para profundizar"],
              [Ban, "No hace tareas académicas: te ayuda a acompañar a tu hijo"],
              [Lock, "Conversaciones privadas: tu colegio no puede leerlas"],
            ].map(([Icono, txt]) => (
              <div key={txt} style={{ display: "flex", gap: 10, alignItems: "center", fontSize: 13.5, marginBottom: 8 }}>
                <Icono size={17} color={AZUL} style={{ flexShrink: 0 }} /> {txt}
              </div>
            ))}
            <Button onClick={() => setMostrarConsentimiento(true)} leftIcon={<ShieldCheck size={16} />} style={{ marginTop: 8 }}>
              Leer autorización y empezar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const mensajes = activa?.mensajes ?? [];

  return (
    <div>
      <Toast msg={toast.msg} type={toast.type} />

      <div style={{ display: "flex", gap: 16, alignItems: "stretch", flexWrap: "wrap" }}>
        {/* Historial */}
        <aside style={{ ...card, flex: "1 1 220px", maxWidth: 290, padding: 12, display: "flex", flexDirection: "column", gap: 6, height: "fit-content" }}>
          <Button size="sm" fullWidth onClick={nueva} leftIcon={<Plus size={15} />}>Nueva conversación</Button>
          <div style={{ fontSize: 11, fontWeight: 800, color: "var(--color-text-muted)", letterSpacing: "0.06em", margin: "10px 6px 2px" }}>HISTORIAL</div>
          {conversaciones.length === 0 && (
            <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", margin: "4px 6px" }}>Aún no tienes conversaciones.</p>
          )}
          {conversaciones.map((c) => (
            <div
              key={c._id}
              style={{
                display: "flex", alignItems: "center", gap: 4, borderRadius: 10,
                background: activa?._id === c._id ? "rgba(2,132,199,0.10)" : "transparent",
              }}
            >
              <button
                type="button"
                className="eia-item"
                onClick={() => abrir(c._id)}
                aria-current={activa?._id === c._id ? "true" : undefined}
                style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8, padding: "9px 10px", borderRadius: 10, cursor: "pointer", background: "transparent" }}
              >
                <MessageCircle size={16} color="var(--color-text-muted)" style={{ flexShrink: 0 }} aria-hidden="true" />
                <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {c.titulo}
                </span>
              </button>
              <button
                type="button"
                className="eia-focus"
                onClick={() => eliminar(c._id)}
                aria-label={`Eliminar la conversación «${c.titulo}»`}
                title="Eliminar conversación"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, color: "var(--color-text-muted)" }}
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
          <div style={{ borderTop: "1px solid var(--color-border)", marginTop: 8, paddingTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={{ fontSize: 11.5, color: "var(--color-text-muted)", display: "flex", gap: 6, alignItems: "center" }}>
              <Lock size={12} /> Privado · se borra a los 30 días
            </span>
            <button type="button" className="eia-focus" onClick={revocar} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 13, color: "var(--color-error-hover)", textAlign: "left" }}>
              Retirar autorización
            </button>
          </div>
        </aside>

        {/* Ventana del chatbot */}
        <section style={{ ...card, flex: "3 1 440px", display: "flex", flexDirection: "column", height: "calc(100vh - 150px)", minHeight: 520, overflow: "hidden" }}>
          <header style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
            background: `linear-gradient(120deg, ${AZUL}, #4F46E5)`, color: "#fff",
          }}>
            <EdumonMascota size={46} circulo enLinea />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 16, fontWeight: 800 }}>
                Edumon IA
                <span style={{ fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 999, background: "rgba(255,255,255,0.22)" }}>IA</span>
              </div>
              <div style={{ fontSize: 12, opacity: 0.9 }}>
                {enviando ? "Escribiendo…" : "Asistente para familias · En línea"}
              </div>
            </div>
            <button
              type="button"
              onClick={nueva}
              title="Nueva conversación"
              aria-label="Nueva conversación"
              className="eia-focus"
              style={{ background: "rgba(255,255,255,0.18)", border: "none", borderRadius: 10, padding: 8, cursor: "pointer", color: "#fff", display: "flex" }}
            >
              <Plus size={18} />
            </button>
          </header>

          <div style={{
            flex: 1, overflowY: "auto", padding: "18px 18px 8px", display: "flex", flexDirection: "column", gap: 16,
            background: "radial-gradient(circle at 20% 0%, rgba(14,165,233,0.07), transparent 45%), radial-gradient(circle at 90% 100%, rgba(99,102,241,0.07), transparent 40%), var(--color-bg)",
          }}>
            <Bienvenida sugerencias={sugerencias} onElegir={enviar} deshabilitado={enviando || mensajes.length > 0} />
            {mensajes.map((m, i) => (m.rol === "usuario"
              ? <MensajeUsuario key={m._id || i} mensaje={m} usuario={user} />
              : <MensajeBot key={m._id || i} mensaje={m} onPedirAyuda={pedirAyuda} conversacionId={activa?._id} avisar={avisar} />))}
            {enviando && <Escribiendo />}
            <div ref={finRef} />
          </div>

          <div style={{ padding: "10px 14px 8px", borderTop: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
            {aviso && (
              <div role="alert" style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 8, padding: "10px 12px", borderRadius: 12, background: "#FFFBEB", border: "1.5px solid #F59E0B", color: "#78350F", fontSize: 15 }}>
                <span style={{ flex: 1 }}>{aviso}</span>
                <button type="button" className="eia-link" onClick={() => setAviso("")} style={{ color: "#78350F" }}>Entendido</button>
              </div>
            )}
            <div className="eia-campo" style={{
              display: "flex", gap: 8, alignItems: "flex-end", padding: "6px 6px 6px 14px", borderRadius: 22,
              border: `1.5px solid ${texto.trim() ? AZUL : "var(--color-border)"}`, background: "var(--color-bg)",
            }}>
              <textarea
                ref={inputRef}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Escríbele a Edumon IA…"
                aria-label="Mensaje para Edumon"
                rows={1}
                maxLength={2000}
                disabled={enviando}
                style={{
                  flex: 1, resize: "none", fontSize: 16, padding: "8px 0", border: "none", outline: "none",
                  background: "transparent", color: "var(--color-text)", fontFamily: "inherit", maxHeight: 120,
                  overflowY: "auto",
                }}
              />
              {vozDisponible && (
                <BotonNotaVoz onAudio={enviarNotaDeVoz} onError={setAviso} deshabilitado={enviando} />
              )}
              <button
                type="button"
                onClick={() => enviar()}
                disabled={!texto.trim() || enviando}
                aria-label={enviando ? "Esperando la respuesta de Edumon" : "Enviar mensaje"}
                className="eia-focus"
                style={{
                  width: 40, height: 40, borderRadius: "50%", border: "none", flexShrink: 0,
                  cursor: texto.trim() && !enviando ? "pointer" : "default",
                  background: texto.trim() && !enviando ? `linear-gradient(135deg, ${AZUL}, #4F46E5)` : "var(--color-border)",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Send size={17} />
              </button>
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 13, color: "var(--color-text-muted)", textAlign: "center" }}>
              Edumon IA puede equivocarse y no reemplaza a orientación escolar ni a profesionales de salud.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
