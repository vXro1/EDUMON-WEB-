import { useState, useId } from "react";
import { ThumbsUp, ThumbsDown, HelpCircle, BookOpen, ExternalLink, Cpu, ShieldCheck, SpellCheck, Info } from "lucide-react";
import { AppModal, Button } from "@/components";
import RutaAtencionInfo from "./RutaAtencionInfo";
import { edumonCalificar, edumonExplicacionMensaje, mensajeErrorIA } from "../services/edumonService";
import "../edumon-ia.css";

// ─── Etiqueta del modo ───────────────────────────────────────────────────────
// discreta: solo se muestra cuando la respuesta NO la redactó un modelo
const MODOS = {
  fichas_fallback: "Respuesta basada en fichas curadas, sin IA generativa",
  simulado: "Respuesta basada en fichas curadas, sin IA generativa",
  plantilla: "Texto fijo revisado de antemano",
};

export function ModoEtiqueta({ ia }) {
  const texto = ia?.modo && MODOS[ia.modo];
  if (!texto) return null;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--color-text-muted)" }}>
      <Info size={13} aria-hidden="true" /> {texto}
    </span>
  );
}

// ─── 👍 / 👎 ────────────────────────────────────────────────────────────────
function Calificacion({ conversacionId, mensajeId, avisar }) {
  const [util, setUtil] = useState(null);          // lo último que guardó el backend
  const [pendiente, setPendiente] = useState(null); // voto elegido, esperando comentario opcional
  const [comentario, setComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [gracias, setGracias] = useState(false);
  const idComentario = useId();

  const guardar = async (valor, texto = "") => {
    setEnviando(true);
    try {
      await edumonCalificar(conversacionId, mensajeId, { util: valor, comentario: texto.trim() });
      setUtil(valor);
      setGracias(true);
      return true;
    } catch (err) {
      avisar(mensajeErrorIA(err, "No pudimos guardar tu calificación. Intenta de nuevo."), "error");
      return false;
    } finally {
      setEnviando(false);
    }
  };

  // el voto se guarda de inmediato; el comentario es opcional y reemplaza la calificación (PUT)
  const votar = async (valor) => {
    if (enviando) return;
    if (await guardar(valor)) {
      setPendiente(valor);
      setComentario("");
    }
  };

  const enviarComentario = async (e) => {
    e.preventDefault();
    if (!comentario.trim()) { setPendiente(null); return; }
    if (await guardar(pendiente, comentario)) setPendiente(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div role="group" aria-label="¿Te sirvió esta respuesta?" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 14, color: "var(--color-text-muted)" }}>¿Te sirvió?</span>
        <button type="button" className="eia-btn" aria-pressed={util === true} disabled={enviando} onClick={() => votar(true)} aria-label="Sí, me sirvió">
          <ThumbsUp size={16} aria-hidden="true" /> Sí
        </button>
        <button type="button" className="eia-btn" data-tono="no" aria-pressed={util === false} disabled={enviando} onClick={() => votar(false)} aria-label="No me sirvió">
          <ThumbsDown size={16} aria-hidden="true" /> No
        </button>
        {gracias && pendiente === null && (
          <span role="status" style={{ fontSize: 14, color: "#047857", fontWeight: 700 }}>¡Gracias! Tu opinión nos ayuda a mejorar.</span>
        )}
      </div>

      {pendiente !== null && (
        <form onSubmit={enviarComentario} style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 520 }}>
          <label htmlFor={idComentario} style={{ fontSize: 14, fontWeight: 700 }}>
            {pendiente ? "¡Gracias! ¿Quieres contarnos algo más? (opcional)" : "Gracias. ¿Qué le faltó a la respuesta? (opcional)"}
          </label>
          <textarea
            id={idComentario}
            className="eia-focus"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            maxLength={500}
            rows={2}
            style={{ fontSize: 15, padding: "8px 10px", borderRadius: 10, fontFamily: "inherit", border: "1.5px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)", resize: "vertical" }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <Button type="submit" size="sm" loading={enviando} disabled={!comentario.trim()}>Enviar comentario</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setPendiente(null)} disabled={enviando}>Omitir</Button>
          </div>
        </form>
      )}
    </div>
  );
}

// ─── "¿Por qué Edumon dijo esto?" ────────────────────────────────────────────
const DECIDIO = {
  regla: "Una regla de seguridad revisada por personas",
  modelo: "El modelo de IA",
  ambos: "La regla de seguridad y el modelo de IA (coincidieron)",
};

const MODO_RESPUESTA = {
  llm: "La redactó un modelo de IA a partir de fichas curadas",
  fichas_fallback: "Ficha curada, sin IA generativa (los proveedores de IA no respondieron)",
  simulado: "Ficha curada, sin IA generativa (modo sin llaves)",
  plantilla: "Texto fijo revisado de antemano; ningún modelo lo redactó",
};

function Correcciones({ hallazgo }) {
  const correcciones = hallazgo?.correcciones ?? [];
  if (!correcciones.length) return null;
  return (
    <div>
      <p className="eia-seccion-t" style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <SpellCheck size={15} aria-hidden="true" /> Ortografía corregida para detectar el riesgo
      </p>
      <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexWrap: "wrap", gap: 8 }}>
        {correcciones.map((c) => (
          <li key={`${c.de}-${c.a}`} className="eia-chip" style={{ fontSize: 15 }}>
            <s>{c.de}</s> <span aria-hidden="true">→</span><span className="sr-only">se corrigió a</span> <strong>{c.a}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Explicacion({ exp }) {
  const cls = exp.clasificacion;
  const regla = cls?.reglaSegura || cls?.reglaDudosa;
  const fuentes = exp.fuentes ?? [];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: 15, lineHeight: 1.6 }}>
      {exp.resumen && (
        <p style={{ margin: 0, padding: "12px 14px", borderRadius: 12, background: "#F0F9FF", border: "1px solid #7DD3FC", fontSize: 16 }}>
          {exp.resumen}
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        <div>
          <p className="eia-seccion-t" style={{ display: "flex", alignItems: "center", gap: 6 }}><ShieldCheck size={15} aria-hidden="true" /> Quién decidió</p>
          <p style={{ margin: 0 }}><strong>{DECIDIO[exp.decidio] ?? "No se registró"}</strong></p>
          {exp.riesgo?.etiqueta && <p style={{ margin: "4px 0 0" }}>Riesgo detectado: {exp.riesgo.etiqueta}{exp.riesgo.gravedad ? ` (${exp.riesgo.gravedad})` : ""}</p>}
          {exp.seNotificoAlColegio && <p style={{ margin: "4px 0 0", fontWeight: 700, color: "#B91C1C" }}>Se avisó al colegio.</p>}
        </div>
        <div>
          <p className="eia-seccion-t" style={{ display: "flex", alignItems: "center", gap: 6 }}><Cpu size={15} aria-hidden="true" /> Cómo se escribió la respuesta</p>
          <p style={{ margin: 0 }}>{MODO_RESPUESTA[exp.respuesta?.modo] ?? "Sin registro del modo"}</p>
          {exp.respuesta?.modelo && <p className="eia-muted" style={{ margin: "4px 0 0", fontSize: 14 }}>Modelo: {exp.respuesta.proveedor ? `${exp.respuesta.proveedor} · ` : ""}{exp.respuesta.modelo}</p>}
        </div>
      </div>

      {regla?.fragmento && (
        <p style={{ margin: 0 }}>
          Frase que activó la regla: <strong>“{regla.fragmento}”</strong>{regla.aproximado ? " (después de corregir la ortografía)" : ""}
        </p>
      )}
      <Correcciones hallazgo={regla} />

      {exp.fichas?.length > 0 && (
        <div>
          <p className="eia-seccion-t" style={{ display: "flex", alignItems: "center", gap: 6 }}><BookOpen size={15} aria-hidden="true" /> Fichas curadas que usó</p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {exp.fichas.map((f) => (
              <li key={f._id ?? f.titulo}>
                <strong>{f.titulo}</strong>
                {Array.isArray(f.edades) && f.edades.length === 2 && <span className="eia-muted"> · {f.edades[0]} a {f.edades[1]} años</span>}
                {f.fuente?.nombre && <span className="eia-muted"> · {f.fuente.nombre}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {fuentes.length > 0 && (
        <div>
          <p className="eia-seccion-t">Fuentes</p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {fuentes.map((f) => (
              <li key={f.nombre}>
                {f.url ? (
                  <a href={f.url} target="_blank" rel="noreferrer" className="eia-focus" style={{ display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 700 }}>
                    {f.nombre} <ExternalLink size={13} aria-hidden="true" /><span className="sr-only"> (se abre en una pestaña nueva)</span>
                  </a>
                ) : f.nombre}
              </li>
            ))}
          </ul>
        </div>
      )}

      {exp.rutaAtencion && <RutaAtencionInfo ruta={exp.rutaAtencion} />}
    </div>
  );
}

function BotonPorQue({ conversacionId, mensajeId }) {
  const [abierto, setAbierto] = useState(false);
  const [estado, setEstado] = useState({ cargando: false, exp: null, error: "" });
  const tituloId = useId();

  const abrir = async () => {
    setAbierto(true);
    if (estado.exp) return;
    setEstado({ cargando: true, exp: null, error: "" });
    try {
      const { explicacion } = await edumonExplicacionMensaje(conversacionId, mensajeId);
      setEstado({ cargando: false, exp: explicacion, error: "" });
    } catch (err) {
      setEstado({ cargando: false, exp: null, error: mensajeErrorIA(err, "No pudimos cargar la explicación. Intenta de nuevo.") });
    }
  };

  return (
    <>
      <button type="button" className="eia-link" onClick={abrir} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
        <HelpCircle size={15} aria-hidden="true" /> ¿Por qué Edumon dijo esto?
      </button>
      <AppModal isOpen={abierto} onClose={() => setAbierto(false)} size="lg" labelledBy={tituloId}>
        <AppModal.Header title="¿Por qué Edumon dijo esto?" titleId={tituloId} onClose={() => setAbierto(false)} />
        <AppModal.Body>
          {estado.cargando && <p role="status" style={{ fontSize: 15 }}>Cargando la explicación…</p>}
          {estado.error && (
            <div role="alert" style={{ fontSize: 15 }}>
              <p style={{ margin: "0 0 10px" }}>{estado.error}</p>
              <Button size="sm" onClick={abrir}>Reintentar</Button>
            </div>
          )}
          {estado.exp && <Explicacion exp={estado.exp} />}
        </AppModal.Body>
        <AppModal.Footer>
          <Button variant="outline" onClick={() => setAbierto(false)}>Cerrar</Button>
        </AppModal.Footer>
      </AppModal>
    </>
  );
}

/** Pie de cada respuesta de Edumon: modo, 👍/👎 y explicación. Solo para mensajes ya guardados. */
export default function RespuestaAcciones({ conversacionId, mensaje, avisar }) {
  if (!conversacionId || !mensaje?._id) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 2 }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "4px 14px" }}>
        <BotonPorQue conversacionId={conversacionId} mensajeId={mensaje._id} />
        <ModoEtiqueta ia={mensaje.ia} />
      </div>
      <Calificacion conversacionId={conversacionId} mensajeId={mensaje._id} avisar={avisar} />
    </div>
  );
}
