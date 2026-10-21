import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Send, Plus, ShieldCheck, BookOpen, Mic, CalendarDays, ClipboardList, ArrowRight, Lock, Sparkles,
  HeartHandshake, PlayCircle, FileText, Ban, Phone, HandHeart, History, AudioLines, AlertCircle, ChevronDown, Pause,
} from "lucide-react";
import { Toast, Button, UserAvatar } from "@/components";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useConfirm } from "@/context/ConfirmContext";
import { humanizeError } from "@/utils/humanizeError";
import ConsentimientoModal from "../components/ConsentimientoModal";
import EdumonMascota, { precargarExpresiones } from "../components/EdumonMascota";
import RespuestaAcciones from "../components/RespuestaAcciones";
import BotonNotaVoz, { notasDeVozSoportadas } from "../components/BotonNotaVoz";
import HistorialConversaciones from "../components/HistorialConversaciones";
import ErrorRespuesta from "../components/ErrorRespuesta";
import AjustesVoz from "../components/AjustesVoz";
import ModoVoz from "../components/ModoVoz";
import { detenerLectura } from "../voz/lectorVoz";
import { dictar, reconocimientoSoportado, mensajeErrorVoz } from "../voz/reconocimientoVoz";
import { clasificarErrorChat } from "../utils/erroresChat";
import { pideRecursos, parrafos, trozosConEnlaces } from "../utils/textoChat";
import "../edumon-ia.css";
import "../edumon-chat.css";
import {
  edumonGetConsentimiento, edumonAceptarConsentimiento, edumonRevocarConsentimiento,
  edumonGetConversaciones, edumonCrearConversacion, edumonGetConversacion,
  edumonEliminarConversacion, edumonEnviarMensaje, esConsentimientoRequerido, edumonPedirAyuda,
  mensajeErrorIA, edumonEnviarAudio,
} from "../services/edumonService";

const VOZ_NO_DISPONIBLE = ["NOTAS_VOZ_DESACTIVADAS", "TRANSCRIPCION_NO_DISPONIBLE"];

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

const TIPOS_SIN_EXTRAS = ["charla", "pedir_edad", "fuera_alcance", "no_tareas"];

const fechaLarga = (fecha) => new Date(fecha).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
const hora = (fecha) => (fecha ? new Date(fecha).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" }) : "");
const primerNombre = (u) => (u?.nombre ?? "").trim().split(/\s+/)[0] ?? "";

function tipoDe(m) {
  return m.tipo
    ?? (m.esRespuestaRiesgo ? "riesgo"
      : m.contenido?.startsWith("¿Qué edad") ? "pedir_edad"
        : m.contenido?.startsWith("Todavía no tengo") ? "fuera_alcance" : "respuesta");
}

function expresionDe(m) {
  const tipo = tipoDe(m);
  if (tipo === "riesgo" || m.atencion) return "alerta";
  if (tipo === "pedir_edad") return "pensando";
  if (tipo === "fuera_alcance" || tipo === "no_tareas") return "no";
  if (tipo === "charla") return "saludo";
  return "ia";
}

const LINEAS_AYUDA = [
  { numero: "141", nombre: "ICBF", detalle: "Protección de niños, niñas y adolescentes · 24 h" },
  { numero: "155", nombre: "Línea 155", detalle: "Orientación a mujeres víctimas de violencia" },
  { numero: "192", nombre: "Línea 192 · opción 4", detalle: "Apoyo en salud mental" },
  { numero: "123", nombre: "Emergencias", detalle: "Si hay peligro inmediato" },
];

function textoLectura(mensaje) {
  const tipo = tipoDe(mensaje);
  let texto = mensaje.contenido ?? "";
  if (mensaje.practica) texto += `\nPara esta semana: ${mensaje.practica}`;
  if (tipo !== "riesgo" && !(tipo === "apoyo" && mensaje.ofrecerAyuda)) return texto;
  const faltan = LINEAS_AYUDA.filter((l) => !texto.includes(l.numero));
  if (!faltan.length) return texto;
  return `${texto}\nLíneas de ayuda gratuitas: ${faltan.map((l) => `${l.nombre}, ${l.numero}: ${l.detalle}`).join(". ")}.`;
}

function TextoConEnlaces({ texto }) {
  return trozosConEnlaces(texto).map((t, i) => (t.tipo === "enlace"
    ? <a key={i} href={t.valor} target="_blank" rel="noreferrer">{t.valor}<span className="sr-only"> (se abre en una pestaña nueva)</span></a>
    : <span key={i}>{t.valor}</span>));
}

function Contenido({ texto }) {
  return parrafos(texto).map((p, i) => <p key={i}><TextoConEnlaces texto={p} /></p>);
}

function TarjetaLlamar() {
  return (
    <section className="ech-llamar" aria-label="Líneas de ayuda">
      <EdumonMascota size={72} expresion="llamar" decorativa className="ech-llamar__mascota" />
      <div className="ech-llamar__cuerpo">
        <h3>Llama ahora · es gratis y confidencial</h3>
        <div className="ech-llamar__lineas">
          {LINEAS_AYUDA.map((l) => (
            <a key={l.numero} href={`tel:${l.numero}`} title={l.detalle} aria-label={`Llamar al ${l.numero}, ${l.nombre}: ${l.detalle}`}>
              <Phone size={17} aria-hidden="true" />
              <span>
                <strong>{l.numero}</strong>
                <span>{l.nombre}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function TarjetaPedirAyuda({ oferta, onPedirAyuda }) {
  const [enviando, setEnviando] = useState(false);
  const [descartada, setDescartada] = useState(false);

  if (oferta.solicitada) {
    return (
      <p className="ech-ayuda-ok">
        <ShieldCheck size={15} aria-hidden="true" /> Pediste apoyo: orientación escolar y tu docente te van a contactar.
      </p>
    );
  }
  if (descartada) return null;

  const pedir = async () => {
    setEnviando(true);
    try { await onPedirAyuda(); } finally { setEnviando(false); }
  };

  return (
    <div className="ech-ayuda">
      <p className="ech-ayuda__titulo"><HandHeart size={16} aria-hidden="true" /> ¿Quieres que te acompañen?</p>
      <p className="ech-ayuda__texto">
        Si quieres, aviso a orientación escolar y a tu docente para que te contacten y te apoyen.
        <strong> Solo lo haré si tú lo pides</strong>; no verán tu conversación, solo el tipo de situación y el mensaje que la originó.
      </p>
      <div className="ech-ayuda__acciones">
        <Button size="sm" onClick={pedir} loading={enviando}>Sí, quiero que me contacten</Button>
        <Button size="sm" variant="ghost" onClick={() => setDescartada(true)} disabled={enviando}>Ahora no</Button>
      </div>
    </div>
  );
}

function Recursos({ recursos, abiertoInicial }) {
  return (
    <details className="ech-recursos" open={abiertoInicial || undefined}>
      <summary>
        <PlayCircle size={16} aria-hidden="true" />
        <span>Videos y artículos para profundizar ({recursos.length})</span>
        <ChevronDown size={16} className="ech-recursos__flecha" aria-hidden="true" />
      </summary>
      <ul>
        {recursos.map((r) => (
          <li key={r.url}>
            <a href={r.url} target="_blank" rel="noreferrer">
              {r.tipo === "video" ? <PlayCircle size={17} aria-hidden="true" /> : <FileText size={17} aria-hidden="true" />}
              <span className="ech-recursos__titulo">{r.titulo}</span>
              <span className="ech-recursos__tipo">
                {r.tipo === "video" ? (r.esBusqueda ? "Buscar en YouTube" : "Ver video") : (r.esBusqueda ? "Buscar artículos" : "Leer artículo")}
              </span>
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

function DelColegio({ mensaje }) {
  const { retoSugerido: reto, eventoSugerido: evento } = mensaje;
  if (!reto && !evento) return null;
  return (
    <div className="ech-colegio">
      <p className="ech-colegio__intro">En tu colegio hay algo que te puede servir:</p>
      {reto && (
        <Link to={`/familia/entregas/${reto.tareaId}`} className="ech-colegio__item">
          <ClipboardList size={18} aria-hidden="true" />
          <span>
            <strong>{reto.titulo}</strong>
            <span>Reto de escuela de padres · entrega hasta el {fechaLarga(reto.fechaEntrega)}</span>
          </span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
      {evento && (
        <Link to="/calendario" className="ech-colegio__item">
          <CalendarDays size={18} aria-hidden="true" />
          <span>
            <strong>{evento.titulo}</strong>
            <span>
              {fechaLarga(evento.fechaInicio)}
              {evento.hora && ` · ${evento.hora}`}
              {evento.ubicacion && ` · ${evento.ubicacion}`}
            </span>
          </span>
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

function MensajeBot({ mensaje, pidioRecursos, onPedirAyuda, conversacionId, avisar }) {
  const tipo = tipoDe(mensaje);
  const esRiesgo = tipo === "riesgo";
  const sinExtras = TIPOS_SIN_EXTRAS.includes(tipo);

  return (
    <article className="ech-fila ech-fila--bot" aria-label="Respuesta de Edumon">
      <div className="ech-autor">
        <EdumonMascota size={34} expresion={expresionDe(mensaje)} decorativa className="ech-autor__avatar" />
        <strong>Edumon</strong>
        {mensaje.creadoEn && <time dateTime={mensaje.creadoEn}>{hora(mensaje.creadoEn)}</time>}
      </div>

      <div className={`ech-burbuja ech-burbuja--bot${esRiesgo ? " ech-burbuja--riesgo" : ""}`}>
        <Contenido texto={mensaje.contenido} />
        {mensaje.practica && !sinExtras && (
          <div className="ech-practica">
            <strong>Para esta semana</strong>
            <p>{mensaje.practica}</p>
          </div>
        )}
      </div>

      {(esRiesgo || (tipo === "apoyo" && mensaje.ofrecerAyuda)) && <TarjetaLlamar />}
      {mensaje.ofrecerAyuda && <TarjetaPedirAyuda oferta={mensaje.ofrecerAyuda} onPedirAyuda={onPedirAyuda} />}

      {!sinExtras && <DelColegio mensaje={mensaje} />}
      {!sinExtras && mensaje.recursos?.length > 0 && <Recursos recursos={mensaje.recursos} abiertoInicial={pidioRecursos} />}

      {!sinExtras && mensaje.fuentes?.length > 0 && (
        <p className="ech-fuentes">
          <BookOpen size={14} aria-hidden="true" />
          <span>Basado en </span>
          {mensaje.fuentes.map((f, i) => (
            <span key={f.nombre}>
              {i > 0 && ", "}
              {f.url ? <a href={f.url} target="_blank" rel="noreferrer">{f.nombre}</a> : f.nombre}
            </span>
          ))}
        </p>
      )}

      <RespuestaAcciones
        conversacionId={conversacionId}
        mensaje={mensaje}
        avisar={avisar}
        textoLectura={textoLectura(mensaje)}
        compacta={sinExtras}
      />
    </article>
  );
}

function MensajeUsuario({ mensaje, usuario }) {
  const esVoz = mensaje.entrada === "voz";
  const fallido = mensaje.estado === "fallido";
  return (
    <article className={`ech-fila ech-fila--usuario${fallido ? " ech-fila--fallido" : ""}`} aria-label={fallido ? "Tu mensaje (no se envió)" : "Tu mensaje"}>
      <div className="ech-burbuja ech-burbuja--usuario">
        {esVoz && (
          <span className="ech-burbuja__voz"><Mic size={13} aria-hidden="true" /> Nota de voz · transcripción</span>
        )}
        <Contenido texto={mensaje.contenido} />
      </div>
      <div className="ech-usuario-pie">
        {fallido
          ? <span className="ech-no-enviado"><AlertCircle size={14} aria-hidden="true" /> No se envió</span>
          : mensaje.creadoEn && <time dateTime={mensaje.creadoEn}>{hora(mensaje.creadoEn)}</time>}
        <UserAvatar user={usuario} size={26} />
      </div>
    </article>
  );
}

const ESPERA_LARGA_MS = 8000;
const ESPERA_MUY_LARGA_MS = 25000;

function Escribiendo() {
  const [fase, setFase] = useState(0);
  useEffect(() => {
    const t1 = setTimeout(() => setFase(1), ESPERA_LARGA_MS);
    const t2 = setTimeout(() => setFase(2), ESPERA_MUY_LARGA_MS);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);
  const texto = ["Edumon está pensando…", "Sigue pensando, ya casi…", "Está tardando más de lo normal. Seguimos esperando la respuesta…"][fase];
  return (
    <div className="ech-fila ech-fila--bot">
      <div className="ech-autor">
        <EdumonMascota size={34} expresion="pensando" animacion="pensar" decorativa className="ech-autor__avatar" />
        <strong>Edumon</strong>
      </div>
      <div className="ech-burbuja ech-burbuja--bot ech-escribiendo" role="status" aria-live="polite">
        <span className="ech-puntos" aria-hidden="true"><i /><i /><i /></span>
        <span>{texto}</span>
      </div>
    </div>
  );
}

function Bienvenida({ nombre, sugerencias, onElegir, deshabilitado }) {
  return (
    <div className="ech-bienvenida">
      <EdumonMascota size={112} expresion="saludo" decorativa className="ech-bienvenida__mascota" />
      <h1 className="ech-bienvenida__titulo">{nombre ? `¡Hola, ${nombre}!` : "¡Hola!"} Soy Edumon</h1>
      <p className="ech-bienvenida__texto">
        Cuéntame qué está pasando con tu hijo o hija y te doy ideas basadas en guías de UNICEF, OMS, ICBF y MinEducación.
        Si me dices su edad, mis ideas serán más precisas.
      </p>
      <p className="ech-bienvenida__label" id="ech-sugerencias">Puedes empezar con una de estas:</p>
      <div className="ech-sugerencias" role="group" aria-labelledby="ech-sugerencias">
        {sugerencias.map((s) => (
          <button key={s} type="button" onClick={() => onElegir(s)} disabled={deshabilitado}>{s}</button>
        ))}
      </div>
      <p className="ech-bienvenida__nota">
        <Ban size={13} aria-hidden="true" /> No hago tareas académicas: te ayudo a acompañar a tu hijo para que las haga.
      </p>
    </div>
  );
}

function useEnLinea() {
  const [enLinea, setEnLinea] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine !== false));
  useEffect(() => {
    const on = () => setEnLinea(true);
    const off = () => setEnLinea(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);
  return enLinea;
}

function useAlturaVisible(ref, activo) {
  useEffect(() => {
    const vv = window.visualViewport;
    const el = ref.current;
    if (!activo || !vv || !el) return undefined;
    const ajustar = () => el.style.setProperty("--ech-vvh", `${Math.round(vv.height)}px`);
    ajustar();
    vv.addEventListener("resize", ajustar);
    return () => vv.removeEventListener("resize", ajustar);
  }, [ref, activo]);
}

export default function EdumonChatPage() {
  const { user } = useAuth();
  const confirmar = useConfirm();
  const enLinea = useEnLinea();
  const [consentimiento, setConsentimiento] = useState(null);
  const [mostrarConsentimiento, setMostrarConsentimiento] = useState(false);
  const [conversaciones, setConversaciones] = useState([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [activa, setActiva] = useState(null);
  const [abriendoId, setAbriendoId] = useState(null);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [fallo, setFallo] = useState(null);
  const [toast, setToast] = useState({ msg: "", type: "success" });
  const [aviso, setAviso] = useState("");
  const [vozDisponible, setVozDisponible] = useState(notasDeVozSoportadas);
  const [modoVoz, setModoVoz] = useState(false);
  const [historialAbierto, setHistorialAbierto] = useState(false);
  const [dictando, setDictando] = useState(false);
  const [dictadoDisponible] = useState(reconocimientoSoportado);
  const dictado = useRef(null);
  const baseDictado = useRef("");
  const accionDictado = useRef("editar");
  const enviarRef = useRef(null);
  const raizRef = useRef(null);
  const finRef = useRef(null);
  const inputRef = useRef(null);
  const botonHistorialRef = useRef(null);

  useAlturaVisible(raizRef, Boolean(consentimiento?.aceptado));

  const sugerencias = useMemo(
    () => [...SUGERENCIAS].sort(() => Math.random() - 0.5).slice(0, 4),
    [activa?._id], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const avisar = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  }, []);

  const pedirConsentimientoSiFalta = (err) => {
    if (esConsentimientoRequerido(err)) {
      setConsentimiento((c) => ({ ...c, aceptado: false }));
      setMostrarConsentimiento(true);
      return true;
    }
    return false;
  };

  const cargarConversaciones = async () => {
    setCargandoLista(true);
    try {
      const { conversaciones } = await edumonGetConversaciones();
      setConversaciones(conversaciones);
    } catch (err) {
      if (!pedirConsentimientoSiFalta(err)) avisar(humanizeError(err), "error");
    } finally {
      setCargandoLista(false);
    }
  };

  useEffect(() => {
    precargarExpresiones();
    return () => {
      detenerLectura();
      dictado.current?.cancelar();
    };
  }, []);

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
  }, [activa?.mensajes?.length, enviando, fallo]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [texto]);

  useEffect(() => {
    if (!historialAbierto) return undefined;
    const escape = (e) => { if (e.key === "Escape") cerrarHistorial(); };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [historialAbierto]);

  const cerrarHistorial = () => {
    setHistorialAbierto(false);
    botonHistorialRef.current?.focus();
  };

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
    const ok = await confirmar({
      title: "¿Retirar la autorización?",
      message: "Se borrarán todas tus conversaciones con Edumon y no podrás usarlo hasta que vuelvas a aceptar.",
      confirmLabel: "Retirar y borrar",
      danger: true,
    });
    if (!ok) return;
    try {
      await edumonRevocarConsentimiento();
      setConversaciones([]);
      setActiva(null);
      setFallo(null);
      setConsentimiento((c) => ({ ...c, aceptado: false }));
      avisar("Autorización retirada y conversaciones eliminadas");
    } catch (err) {
      avisar(humanizeError(err), "error");
    }
  };

  const abrir = async (id) => {
    setHistorialAbierto(false);
    if (activa?._id === id && !fallo) return;
    detenerLectura();
    setAbriendoId(id);
    try {
      const { conversacion } = await edumonGetConversacion(id);
      setActiva(conversacion);
      setFallo(null);
      setAviso("");
    } catch (err) {
      if (!pedirConsentimientoSiFalta(err)) avisar(humanizeError(err), "error");
    } finally {
      setAbriendoId(null);
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
    detenerLectura();
    setActiva(null);
    setFallo(null);
    setAviso("");
    setHistorialAbierto(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const eliminar = async (c) => {
    const ok = await confirmar({
      title: "¿Eliminar esta conversación?",
      message: `«${c.titulo || "Conversación"}» se borrará y no se puede recuperar.`,
      confirmLabel: "Eliminar",
      danger: true,
    });
    if (!ok) return;
    try {
      await edumonEliminarConversacion(c._id);
      setConversaciones((cs) => cs.filter((x) => x._id !== c._id));
      if (activa?._id === c._id) { setActiva(null); setFallo(null); }
    } catch (err) {
      avisar(humanizeError(err), "error");
    }
  };

  const procesar = async ({ optimista, llamar, alFallarEspecial }) => {
    setEnviando(true);
    setAviso("");
    setFallo(null);
    let conversacion = activa;
    try {
      if (!conversacion?._id) {
        ({ conversacion } = await edumonCrearConversacion());
        conversacion = { ...conversacion, mensajes: [] };
      }
      const base = conversacion.mensajes.filter((m) => m.estado !== "fallido");
      conversacion = { ...conversacion, mensajes: base };
      setActiva({ ...conversacion, mensajes: [...base, { _id: "pendiente", rol: "usuario", ...optimista }] });

      const { mensajeUsuario, respuesta, conversacion: meta } = await llamar(conversacion._id);
      const actualizada = { ...conversacion, ...meta, mensajes: [...base, mensajeUsuario, respuesta] };
      setActiva(actualizada);
      setConversaciones((cs) => [
        { _id: actualizada._id, titulo: actualizada.titulo, edadHijo: actualizada.edadHijo, ultimaActividad: new Date().toISOString() },
        ...cs.filter((c) => c._id !== actualizada._id),
      ]);
      return respuesta;
    } catch (err) {
      if (pedirConsentimientoSiFalta(err)) {
        setActiva((a) => (a ? { ...a, mensajes: a.mensajes.filter((m) => m._id !== "pendiente") } : a));
        return null;
      }
      if (alFallarEspecial?.(err)) {
        setActiva((a) => (a ? { ...a, mensajes: a.mensajes.filter((m) => m._id !== "pendiente") } : a));
        return null;
      }
      setActiva((a) => {
        const actual = a ?? { _id: null, titulo: "Nueva conversación", mensajes: [] };
        const mensajes = actual.mensajes.some((m) => m._id === "pendiente")
          ? actual.mensajes.map((m) => (m._id === "pendiente" ? { ...m, _id: "fallido", estado: "fallido" } : m))
          : [...actual.mensajes, { _id: "fallido", rol: "usuario", estado: "fallido", ...optimista }];
        return { ...actual, mensajes };
      });
      setFallo({
        error: clasificarErrorChat(err, { enLinea: typeof navigator === "undefined" || navigator.onLine !== false }),
        optimista,
        llamar,
        alFallarEspecial,
      });
      return null;
    } finally {
      setEnviando(false);
      if (!modoVoz) inputRef.current?.focus();
    }
  };

  const enviar = async (contenido = texto) => {
    const limpio = contenido.trim();
    if (!limpio || enviando) return null;
    setTexto("");
    const respuesta = await procesar({
      optimista: { contenido: limpio },
      llamar: (id) => edumonEnviarMensaje(id, limpio),
    });
    return respuesta ? { id: respuesta._id, texto: textoLectura(respuesta) } : null;
  };

  enviarRef.current = enviar;

  const unirTexto = (base, dicho) => [base.trim(), dicho].filter(Boolean).join(" ");

  const empezarDictado = () => {
    if (dictado.current || enviando) return;
    detenerLectura();
    setAviso("");
    baseDictado.current = texto;
    accionDictado.current = "editar";
    try {
      dictado.current = dictar({
        onTexto: (dicho) => setTexto(unirTexto(baseDictado.current, dicho)),
        onError: (codigo) => setAviso(mensajeErrorVoz(codigo)),
        onFin: (dicho) => {
          const final = unirTexto(baseDictado.current, dicho);
          dictado.current = null;
          setDictando(false);
          if (accionDictado.current === "enviar" && final.trim()) {
            enviarRef.current?.(final);
          } else {
            setTexto(final);
            setTimeout(() => inputRef.current?.focus(), 0);
          }
        },
      });
      setDictando(true);
    } catch (err) {
      dictado.current = null;
      setAviso(mensajeErrorVoz(err.codigo));
    }
  };

  const pausarDictado = () => {
    accionDictado.current = "editar";
    dictado.current?.detener();
  };

  const enviarDictado = () => {
    accionDictado.current = "enviar";
    dictado.current?.detener();
  };

  const reintentar = () => {
    if (!fallo || enviando) return;
    const { optimista, llamar, alFallarEspecial } = fallo;
    procesar({ optimista, llamar, alFallarEspecial });
  };

  const editarFallido = () => {
    if (!fallo) return;
    setTexto(fallo.optimista.contenido ?? "");
    setFallo(null);
    setActiva((a) => (a ? { ...a, mensajes: a.mensajes.filter((m) => m.estado !== "fallido") } : a));
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const enviarNotaDeVoz = async (archivo) => {
    if (enviando) return;
    await procesar({
      optimista: { contenido: "Transcribiendo tu nota de voz…", entrada: "voz" },
      llamar: (id) => edumonEnviarAudio(id, archivo),
      alFallarEspecial: (err) => {
        const codigo = err?.data?.code;
        if (VOZ_NO_DISPONIBLE.includes(codigo)) setVozDisponible(false);
        if (codigo && (VOZ_NO_DISPONIBLE.includes(codigo) || codigo.startsWith("AUDIO_"))) {
          setAviso(mensajeErrorIA(err, "No pudimos enviar la nota de voz. Escribe tu mensaje, por favor."));
          return true;
        }
        return false;
      },
    });
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (dictando) enviarDictado();
      else enviar();
    }
  };

  if (!consentimiento) {
    return (
      <div className="ech-cargando" role="status">
        <Toast msg={toast.msg} type={toast.type} />
        <EdumonMascota size={80} expresion="pensando" animacion="pensar" decorativa />
        <span>Cargando Edumon…</span>
      </div>
    );
  }

  if (!consentimiento.aceptado) {
    return (
      <div>
        <Toast msg={toast.msg} type={toast.type} />
        <ConsentimientoModal
          isOpen={mostrarConsentimiento}
          version={consentimiento.versionVigente}
          onAceptar={aceptarConsentimiento}
          onCancelar={() => setMostrarConsentimiento(false)}
        />
        <div className="ech-intro">
          <EdumonMascota size={200} expresion="ia" animacion="flotar" className="ech-intro__mascota" />
          <div className="ech-intro__cuerpo">
            <span className="ech-intro__etiqueta">Asistente con inteligencia artificial</span>
            <h1>Conoce a Edumon IA</h1>
            <p>
              Tu acompañante para la vida de tus hijos en casa y en el colegio: emociones, organización, alimentación,
              convivencia y crianza. Pregúntale a cualquier hora y recibe ideas basadas en guías de UNICEF, OMS, ICBF y MinEducación.
            </p>
            <ul>
              {[
                [HeartHandshake, "Respuestas basadas en UNICEF, ICBF, OMS y el Ministerio de Educación"],
                [Sparkles, "Una práctica corta para la semana, y videos y artículos si quieres profundizar"],
                [Ban, "No hace tareas académicas: te ayuda a acompañar a tu hijo"],
                [Lock, "Conversaciones privadas: tu colegio no puede leerlas"],
              ].map(([Icono, txt]) => (
                <li key={txt}><Icono size={18} aria-hidden="true" /> {txt}</li>
              ))}
            </ul>
            <Button onClick={() => setMostrarConsentimiento(true)} leftIcon={<ShieldCheck size={16} />}>
              Leer autorización y empezar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const mensajes = activa?.mensajes ?? [];
  const nombre = primerNombre(user);
  const puedeEnviar = Boolean(texto.trim()) && !enviando;

  return (
    <div className="ech" ref={raizRef}>
      <Toast msg={toast.msg} type={toast.type} />

      <aside className={`ech-historial${historialAbierto ? " ech-historial--abierto" : ""}`}>
        <HistorialConversaciones
          id="ech-historial"
          conversaciones={conversaciones}
          cargando={cargandoLista}
          activaId={activa?._id}
          abriendoId={abriendoId}
          onAbrir={abrir}
          onNueva={nueva}
          onEliminar={eliminar}
          onRevocar={revocar}
          onCerrar={cerrarHistorial}
        />
      </aside>
      {historialAbierto && <div className="ech-velo" onClick={cerrarHistorial} aria-hidden="true" />}

      <section className="ech-chat" aria-label="Conversación con Edumon IA">
        <header className="ech-head">
          <button
            ref={botonHistorialRef}
            type="button"
            className="ech-head__btn ech-head__historial"
            onClick={() => setHistorialAbierto(true)}
            aria-expanded={historialAbierto}
            aria-controls="ech-historial"
            aria-label="Ver historial de conversaciones"
            title="Historial"
          >
            <History size={19} aria-hidden="true" />
          </button>
          <EdumonMascota size={38} circulo enLinea={enLinea} decorativa className="ech-head__avatar" />
          <div className="ech-head__info">
            <p className="ech-head__nombre">Edumon IA</p>
            <p className="ech-head__estado">
              {!enLinea ? "Sin conexión" : enviando ? "Escribiendo…" : activa?.titulo && activa.titulo !== "Nueva conversación" ? activa.titulo : "Asistente para familias"}
            </p>
          </div>
          <AjustesVoz />
          <button
            type="button"
            className={`ech-head__btn${modoVoz ? " ech-head__btn--activo" : ""}`}
            onClick={() => { detenerLectura(); dictado.current?.cancelar(); dictado.current = null; setDictando(false); setModoVoz((v) => !v); }}
            aria-pressed={modoVoz}
            aria-label={modoVoz ? "Salir del modo voz" : "Hablar con Edumon por voz"}
            title="Modo voz"
          >
            <AudioLines size={19} aria-hidden="true" />
          </button>
          <button type="button" className="ech-head__btn" onClick={nueva} aria-label="Nueva conversación" title="Nueva conversación">
            <Plus size={20} aria-hidden="true" />
          </button>
        </header>

        {!enLinea && (
          <p className="ech-offline" role="status">
            Estás sin conexión. Puedes leer la conversación; para enviar mensajes necesitas internet.
          </p>
        )}

        <div className="ech-mensajes" aria-busy={Boolean(abriendoId) || undefined}>
          <div className="ech-mensajes__inner" role="log" aria-live="polite" aria-relevant="additions" aria-label="Mensajes">
            {mensajes.length === 0 && !abriendoId && (
              <Bienvenida nombre={nombre} sugerencias={sugerencias} onElegir={enviar} deshabilitado={enviando} />
            )}
            {abriendoId && mensajes.length === 0 && (
              <p className="ech-abriendo" role="status">Abriendo la conversación…</p>
            )}
            {mensajes.map((m, i) => {
              if (m.rol === "usuario") return <MensajeUsuario key={m._id || i} mensaje={m} usuario={user} />;
              const anterior = mensajes.slice(0, i).reverse().find((x) => x.rol === "usuario");
              return (
                <MensajeBot
                  key={m._id || i}
                  mensaje={m}
                  pidioRecursos={pideRecursos(anterior?.contenido)}
                  onPedirAyuda={pedirAyuda}
                  conversacionId={activa?._id}
                  avisar={avisar}
                />
              );
            })}
            {enviando && <Escribiendo />}
            {fallo && !enviando && (
              <ErrorRespuesta
                error={fallo.error}
                enLinea={enLinea}
                reintentando={enviando}
                onReintentar={reintentar}
                onEditar={fallo.optimista.entrada === "voz" ? null : editarFallido}
              />
            )}
            <div ref={finRef} />
          </div>
        </div>

        <footer className="ech-composer">
          {aviso && (
            <div role="alert" className="ech-aviso">
              <span>{aviso}</span>
              <button type="button" className="ech-enlace" onClick={() => setAviso("")}>Entendido</button>
            </div>
          )}

          {modoVoz ? (
            <ModoVoz onEnviar={enviar} onSalir={() => setModoVoz(false)} ocupado={enviando} />
          ) : (
            <>
              {dictando && (
                <div className="ech-dictado" role="status" aria-live="polite">
                  <span className="ech-dictado__punto" aria-hidden="true" />
                  <span>
                    <strong>Te escucho…</strong> Pausa para revisar el texto o envíalo directo.
                  </span>
                </div>
              )}
              <div className={`ech-campo${texto.trim() ? " ech-campo--lleno" : ""}${dictando ? " ech-campo--dictando" : ""}`}>
                <textarea
                  ref={inputRef}
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder={dictando ? "Habla, aquí aparece lo que dices…" : "Escríbele a Edumon…"}
                  aria-label="Mensaje para Edumon"
                  rows={1}
                  maxLength={2000}
                  enterKeyHint="send"
                  readOnly={dictando}
                />
                {dictadoDisponible ? (
                  <button
                    type="button"
                    className={`ech-mic${dictando ? " ech-mic--activo" : ""}`}
                    onClick={dictando ? pausarDictado : empezarDictado}
                    disabled={enviando && !dictando}
                    aria-pressed={dictando}
                    aria-label={dictando ? "Pausar y revisar el texto dictado" : "Dictar un mensaje con la voz"}
                    title={dictando ? "Pausar y revisar" : "Dictar con la voz"}
                  >
                    {dictando ? <Pause size={18} aria-hidden="true" /> : <Mic size={18} aria-hidden="true" />}
                  </button>
                ) : vozDisponible && (
                  <BotonNotaVoz onAudio={enviarNotaDeVoz} onError={setAviso} deshabilitado={enviando} />
                )}
                <button
                  type="button"
                  className="ech-enviar"
                  onClick={() => (dictando ? enviarDictado() : enviar())}
                  disabled={dictando ? enviando : !puedeEnviar}
                  aria-label={dictando ? "Terminar de dictar y enviar" : enviando ? "Esperando la respuesta de Edumon" : "Enviar mensaje"}
                >
                  <Send size={18} aria-hidden="true" />
                </button>
              </div>
            </>
          )}
          <p className="ech-descargo">
            Edumon IA puede equivocarse y no reemplaza a orientación escolar ni a profesionales de salud.
          </p>
        </footer>
      </section>
    </div>
  );
}
