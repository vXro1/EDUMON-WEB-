import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Wand2, Check, CheckCircle2, AlertTriangle, ScrollText, CalendarClock, FolderOpen, PlayCircle, FileText,
  SlidersHorizontal, ChevronDown, ChevronUp, RefreshCw, PencilLine, HelpCircle, Target, Send, X, Sparkles,
} from "lucide-react";
import { Button } from "@/components";
import { humanizeError } from "@/utils/humanizeError";
import EdumonMascota from "./EdumonMascota";
import { cargarTemas } from "./RecomendarConEdumon";
import { edumonGenerarReto, lineamientosGet } from "../services/edumonService";

// ajustes rápidos que el docente puede pedirle a Edumon sobre el borrador
const AJUSTES_RAPIDOS = [
  "Hazlo más corto", "Lenguaje más sencillo", "Para familias que trabajan todo el día",
  "Que lo hagan con los hermanos", "Menos tiempo en casa",
];

// ejemplos para inspirar al docente: cualquier tema vale, no solo los de la lista
const EJEMPLOS = [
  "Uso del celular antes de dormir", "Cómo acompañar las tareas sin pelear", "Celos entre hermanos",
  "Manejar la rabia sin gritos", "Hablar de sexualidad con mi hijo de 11", "Rutinas de la mañana",
  "Qué hacer si le hacen matoneo", "Comer en familia sin pantallas", "Miedo a la oscuridad",
  "Elogiar el esfuerzo y no solo la nota", "Cuidarme como mamá o papá", "Mentiras en la infancia",
  "Preparar el regreso a clases", "Uso de redes sociales en la adolescencia", "Duelo por una mudanza",
];

const AZUL = "#0284C7";
const VERDE = "#059669";

const CSS = `
.era { border-radius: 16px; border: 1px solid rgba(14,165,233,.35); background: linear-gradient(135deg, rgba(14,165,233,.06), rgba(99,102,241,.05)), var(--color-surface); overflow: hidden; }
.era-head { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-bottom: 1px solid rgba(14,165,233,.18); }
.era-body { padding: 14px; display: flex; flex-direction: column; gap: 12px; }
.era-input { width: 100%; font-size: 13.5px; padding: 10px 12px; border-radius: 11px; font-family: inherit; box-sizing: border-box;
  border: 1.5px solid var(--color-border); background: var(--color-surface); color: var(--color-text); outline: none; }
.era-input:focus { border-color: ${AZUL}; }
.era-chip { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; padding: 4px 10px; border-radius: 999px; cursor: pointer;
  border: 1px solid var(--color-border); background: var(--color-surface); color: var(--color-text); font-family: inherit; }
.era-chip:hover { border-color: ${AZUL}; color: ${AZUL}; }
.era-chip[data-tono="verde"] { border-color: rgba(5,150,105,.4); color: #047857; background: rgba(5,150,105,.06); font-weight: 600; }
.era-link { display: inline-flex; align-items: center; gap: 5px; font-size: 12.5px; font-weight: 700; color: ${AZUL}; background: none; border: 0; cursor: pointer; padding: 0; font-family: inherit; }
.era-prop { border-radius: 14px; background: var(--color-surface); border: 1px solid var(--color-border); overflow: hidden; }
.era-prop-head { padding: 14px 16px 10px; }
.era-sec { padding: 10px 16px; border-top: 1px solid var(--color-border); }
.era-sec-t { font-size: 11px; font-weight: 800; letter-spacing: .05em; color: var(--color-text-muted); margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
.era-li { display: grid; grid-template-columns: 22px 1fr; gap: 9px; font-size: 13px; line-height: 1.55; }
.era-li + .era-li { margin-top: 7px; }
.era-n { width: 22px; height: 22px; border-radius: 50%; background: rgba(2,132,199,.12); color: ${AZUL}; font-size: 11.5px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; }
.era-tag { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 999px; }
.era-actions { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; padding: 12px 16px; border-top: 1px solid var(--color-border); background: var(--color-bg); }
.era-sk { height: 11px; border-radius: 6px; background: linear-gradient(90deg, var(--color-border) 25%, var(--color-bg) 50%, var(--color-border) 75%); background-size: 200% 100%; animation: era-brillo 1.2s infinite linear; }
@keyframes era-brillo { from { background-position: 200% 0; } to { background-position: -200% 0; } }
.era-ok { display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 14px; border: 1px solid rgba(5,150,105,.35); background: rgba(5,150,105,.07); }
`;

function Lista({ items, icono }) {
  return items.map((t, i) => (
    <div key={`${i}-${t}`} className="era-li">
      {icono ? <span style={{ display: "inline-flex", justifyContent: "center", paddingTop: 2 }}>{icono}</span> : <span className="era-n">{i + 1}</span>}
      <span>{t}</span>
    </div>
  ));
}

function Esqueleto() {
  return (
    <div className="era-prop" style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
      <div className="era-sk" style={{ width: "55%", height: 15 }} />
      <div className="era-sk" style={{ width: "95%" }} />
      <div className="era-sk" style={{ width: "85%" }} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "22px 1fr", gap: 9, alignItems: "center" }}>
          <div className="era-sk" style={{ width: 22, height: 22, borderRadius: "50%" }} />
          <div className="era-sk" style={{ width: `${88 - i * 12}%` }} />
        </div>
      ))}
    </div>
  );
}

/**
 * Edumon diseña un reto de escuela de padres dentro del formulario de crear reto.
 * onAplicar(borrador) llena el formulario; el docente lo revisa y publica normal.
 * cursoId/moduloId (opcionales) son el contexto: grado y módulo donde se publicará.
 * contexto: texto visible del contexto, ej. "Grado Quinto · Crianza respetuosa".
 * modulos: módulos del curso, para mostrar el que Edumon sugiere.
 */
export default function EdumonRetoAsistente({ onAplicar, cursoId, moduloId, contexto, modulos = [], abiertoInicial = false }) {
  const [abierto, setAbierto] = useState(abiertoInicial);
  const [temas, setTemas] = useState([]);
  const [tema, setTema] = useState("");
  const [eje, setEje] = useState("");
  const [enfoque, setEnfoque] = useState("");
  const [masOpciones, setMasOpciones] = useState(false);
  const [editandoTema, setEditandoTema] = useState(true);
  const [ajuste, setAjuste] = useState("");
  const [borrador, setBorrador] = useState(null);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState("");
  const [aplicado, setAplicado] = useState(false);
  const [lineamientos, setLineamientos] = useState(null); // lo publicado por rectoría
  const raiz = useRef(null);

  // tres ejemplos distintos cada vez que se abre
  const ejemplos = useMemo(
    () => [...EJEMPLOS].sort(() => Math.random() - 0.5).slice(0, 3),
    [abierto], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    if (!abierto) return;
    cargarTemas().then(setTemas);
    lineamientosGet().then(({ lineamiento }) => setLineamientos(lineamiento)).catch(() => setLineamientos(null));
  }, [abierto]);

  // lo que rectoría pidió para este grupo
  const delCurso = lineamientos?.publicado?.porCurso?.find((p) => String(p.cursoId) === String(cursoId));
  const temasPrioritarios = delCurso?.temasPrioritarios ?? [];
  const puedeSinTema = Boolean(lineamientos?.publicado && cursoId);
  const sinTema = !tema.trim() && !eje;

  const generar = async ({ conAjuste } = {}) => {
    setGenerando(true);
    setError("");
    setAplicado(false);
    try {
      const { borrador: nuevo } = await edumonGenerarReto({
        tema: tema.trim() || undefined,
        eje: eje || undefined,
        enfoque: enfoque.trim() || undefined,
        cursoId: cursoId || undefined,
        moduloId: moduloId || undefined,
        ...(conAjuste && borrador && { ajuste: conAjuste, borradorAnterior: borrador }),
      });
      setBorrador(nuevo);
      setEditandoTema(false);
      if (conAjuste) setAjuste("");
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setGenerando(false);
    }
  };

  const aplicar = () => {
    onAplicar(borrador);
    setAplicado(true);
    // que el docente vea el formulario ya lleno
    setTimeout(() => raiz.current?.nextElementSibling?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  const ejeLabel = temas.find((e) => e.valor === borrador?.eje)?.label;
  const moduloSugerido = !moduloId && modulos.find((m) => String(m._id ?? m.id) === String(borrador?.moduloIdSugerido));

  // ── cerrado: invitación ──
  if (!abierto) {
    return (
      <>
      <style>{CSS}</style>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="era"
        style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", textAlign: "left", cursor: "pointer", padding: "10px 14px", borderStyle: "dashed", color: "var(--color-text)" }}
      >
        <EdumonMascota size={48} expresion="saludo" />
        <span style={{ flex: 1 }}>
          <strong style={{ fontSize: 14 }}>¿Es un reto de escuela de padres? Diséñalo con Edumon IA</strong>
          <span style={{ display: "block", fontSize: 12.5, color: "var(--color-text-muted)" }}>
            Edumon arma la actividad para la familia, las preguntas, los criterios, la fecha y el módulo.
          </span>
        </span>
        <Sparkles size={18} color={AZUL} />
      </button>
      </>
    );
  }

  // ── aplicado: barra de confirmación compacta ──
  if (aplicado && borrador) {
    return (
      <div ref={raiz}>
        <style>{CSS}</style>
        <div className="era-ok">
          <CheckCircle2 size={20} color={VERDE} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0, fontSize: 13 }}>
            <strong>Reto aplicado:</strong> {borrador.titulo}
            <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Título, descripción, criterios, fecha y módulo quedaron abajo. Revísalos y publica.</div>
          </div>
          <button type="button" className="era-link" onClick={() => setAplicado(false)}><PencilLine size={14} /> Ver propuesta</button>
        </div>
      </div>
    );
  }

  return (
    <div ref={raiz}>
      <style>{CSS}</style>
      <div className="era">
        <div className="era-head">
          <EdumonMascota size={40} expresion={generando ? "pensando" : error ? "no" : borrador ? "saludo" : "ia"} animacion={generando ? "pensar" : null} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 800 }}>Edumon IA · Diseñador de retos</div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {contexto ? <>Para <strong style={{ color: "var(--color-text)" }}>{contexto}</strong> · </> : null}
              Solo escuela de padres, nada académico
            </div>
          </div>
          <button type="button" className="era-link" style={{ color: "var(--color-text-muted)" }} onClick={() => setAbierto(false)} aria-label="Cerrar asistente"><X size={16} /></button>
        </div>

        <div className="era-body">
          {lineamientos?.publicado && editandoTema && (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12.5, lineHeight: 1.5 }}>
              <ScrollText size={15} color={VERDE} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1 }}>
                Edumon sigue los <Link to="/escuela-padres/lineamientos" target="_blank" style={{ fontWeight: 700, color: VERDE }}>lineamientos de rectoría</Link> (v{lineamientos.version}).
                {temasPrioritarios.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
                    <span style={{ fontSize: 12, color: "var(--color-text-muted)", alignSelf: "center" }}>Prioridad del grupo:</span>
                    {temasPrioritarios.map((t) => (
                      <button key={t} type="button" className="era-chip" data-tono="verde" onClick={() => setTema(t)}>{t}</button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* tema: completo al componer; en una línea cuando ya hay propuesta */}
          {editandoTema ? (
            <>
              <div>
                <input
                  className="era-input"
                  value={tema}
                  maxLength={150}
                  onChange={(e) => setTema(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && (!sinTema || puedeSinTema)) { e.preventDefault(); generar(); } }}
                  placeholder="¿De qué tema quieres el reto para las familias?"
                  aria-label="Tema del reto"
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {ejemplos.map((ej) => <button key={ej} type="button" className="era-chip" onClick={() => setTema(ej)}>{ej}</button>)}
                </div>
              </div>

              <button type="button" className="era-link" style={{ color: "var(--color-text-muted)", fontWeight: 600 }} onClick={() => setMasOpciones(!masOpciones)}>
                {masOpciones ? <ChevronUp size={14} /> : <ChevronDown size={14} />} Más opciones (eje y contexto de las familias)
              </button>
              {masOpciones && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
                  <select className="era-input" value={eje} onChange={(e) => setEje(e.target.value)} aria-label="Eje (opcional)">
                    <option value="">Eje del Decreto 459: que Edumon lo elija</option>
                    {temas.map((e) => <option key={e.valor} value={e.valor}>{e.label}</option>)}
                  </select>
                  <input className="era-input" value={enfoque} maxLength={500} onChange={(e) => setEnfoque(e.target.value)}
                    placeholder="Ej.: muchas familias trabajan en la tarde" aria-label="Contexto" />
                </div>
              )}

              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <Button onClick={() => generar()} loading={generando} disabled={sinTema && !puedeSinTema} leftIcon={<Wand2 size={16} />}>
                  {sinTema && puedeSinTema ? "Proponer según los lineamientos" : borrador ? "Diseñar con este tema" : "Diseñar reto"}
                </Button>
                {sinTema && puedeSinTema && <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Sin tema, Edumon elige lo que rectoría pidió para este grupo.</span>}
                {borrador && <button type="button" className="era-link" style={{ color: "var(--color-text-muted)" }} onClick={() => setEditandoTema(false)}>Cancelar</button>}
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, flexWrap: "wrap" }}>
              <span style={{ color: "var(--color-text-muted)" }}>Tema:</span>
              <strong>{borrador?.tema || tema || "según los lineamientos"}</strong>
              <button type="button" className="era-link" onClick={() => setEditandoTema(true)}><PencilLine size={13} /> Cambiar tema</button>
            </div>
          )}

          {error && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, color: "var(--color-error-hover)", padding: "8px 10px", borderRadius: 10, background: "rgba(220,38,38,.06)" }}>
              <AlertTriangle size={15} /> {error}
            </div>
          )}

          {generando && <Esqueleto />}

          {borrador && !generando && (
            <div className="era-prop">
              <div className="era-prop-head">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 6 }}>
                  {ejeLabel && <span className="era-tag" style={{ background: "rgba(2,132,199,.1)", color: "#0369A1" }}>{ejeLabel}</span>}
                  {borrador.lineamientosAplicados && <span className="era-tag" style={{ background: "rgba(5,150,105,.1)", color: "#047857" }}><ScrollText size={11} /> Lineamientos v{borrador.lineamientosAplicados.version}</span>}
                  <span className="era-tag" style={{ background: "var(--color-bg)", color: "var(--color-text-muted)" }}>{borrador.generadoPor === "ia" ? "Generado con IA" : "Plantilla"}</span>
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.3 }}>{borrador.titulo}</div>
                <p style={{ margin: "6px 0 0", fontSize: 13, lineHeight: 1.55 }}>{borrador.introduccion}</p>
                <div style={{ marginTop: 8, display: "flex", gap: 7, fontSize: 12.5, padding: "8px 10px", borderRadius: 10, background: "rgba(2,132,199,.06)" }}>
                  <Target size={15} color={AZUL} style={{ flexShrink: 0, marginTop: 1 }} /><span><strong>Objetivo:</strong> {borrador.objetivo}</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 10, fontSize: 12, color: "var(--color-text-muted)" }}>
                  <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><CalendarClock size={14} /> {borrador.duracionDias} días</span>
                  {moduloSugerido && <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><FolderOpen size={14} /> {moduloSugerido.titulo}</span>}
                  <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><Send size={14} /> Entrega en texto</span>
                </div>
              </div>

              <div className="era-sec">
                <div className="era-sec-t">QUÉ HACE LA FAMILIA EN CASA</div>
                <Lista items={borrador.pasos} />
              </div>
              <div className="era-sec">
                <div className="era-sec-t">PREGUNTAS PARA LA ENTREGA</div>
                <Lista items={borrador.reflexion} icono={<HelpCircle size={15} color="#7C3AED" />} />
              </div>
              <div className="era-sec">
                <div className="era-sec-t">CRITERIOS</div>
                <Lista items={borrador.criterios} icono={<Check size={15} color={VERDE} />} />
              </div>
              {borrador.recursos?.length > 0 && (
                <div className="era-sec">
                  <div className="era-sec-t">PARA PROFUNDIZAR</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {borrador.recursos.map((r) => (
                      <a key={r.url} href={r.url} target="_blank" rel="noreferrer" className="era-chip" style={{ textDecoration: "none" }}>
                        {r.tipo === "video" ? <PlayCircle size={13} color="#DC2626" /> : <FileText size={13} color={AZUL} />} {r.titulo}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {!borrador.basadoEnFichas && (
                <div className="era-sec" style={{ fontSize: 12, display: "flex", gap: 6, color: "#B45309", background: "#FFFBEB" }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0 }} />
                  Este tema no tiene fichas en la biblioteca de Edumon: usó principios generales de crianza positiva. Revísalo con orientación escolar.
                </div>
              )}

              {/* ajustes sobre la propuesta, sin empezar de cero */}
              <div className="era-sec">
                <div className="era-sec-t"><SlidersHorizontal size={12} /> ¿LE CAMBIO ALGO?</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
                  {AJUSTES_RAPIDOS.map((a) => (
                    <button key={a} type="button" className="era-chip" disabled={generando} onClick={() => generar({ conAjuste: a })}>{a}</button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    className="era-input"
                    style={{ padding: "8px 11px" }}
                    value={ajuste}
                    maxLength={300}
                    onChange={(e) => setAjuste(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && ajuste.trim()) { e.preventDefault(); generar({ conAjuste: ajuste.trim() }); } }}
                    placeholder="Ej.: agrega un paso para hacerlo en la cena"
                    aria-label="Ajuste al reto"
                  />
                  <Button size="sm" variant="ghost" onClick={() => generar({ conAjuste: ajuste.trim() })} disabled={!ajuste.trim()}>Ajustar</Button>
                </div>
              </div>

              <div className="era-actions">
                <Button onClick={aplicar} leftIcon={<Check size={16} />}>Usar en el reto</Button>
                <Button variant="ghost" onClick={() => generar()} leftIcon={<RefreshCw size={15} />}>Otra versión</Button>
                <span style={{ fontSize: 12, color: "var(--color-text-muted)", flex: "1 1 180px" }}>
                  Llena título, descripción, criterios{moduloSugerido ? ", módulo" : ""} y fecha. Podrás editarlo todo.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
