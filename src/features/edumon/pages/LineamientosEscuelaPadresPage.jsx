import { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileUp, Wand2, Save, Send, Plus, Trash2, AlertTriangle, CheckCircle2, CalendarRange, ClipboardList,
  Users, FileText, X, Minus, Eye, PencilLine, BarChart3, ScrollText, Target, MessageSquareQuote,
  ChevronDown, ChevronUp, Sparkles, Lightbulb, ArrowRight, Circle, Download,
} from "lucide-react";
import { Button, Toast } from "@/components";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { humanizeError } from "@/utils/humanizeError";
import EdumonMascota from "../components/EdumonMascota";
import ParticipacionGrupoModal from "../components/ParticipacionGrupoModal";
import { descargarXlsx } from "@/utils/xlsxWriter";
import { cargarTemas } from "../components/RecomendarConEdumon";
import {
  lineamientosGet, lineamientosSeguimiento, lineamientosGenerar, lineamientosGuardar, lineamientosPublicar,
} from "../services/edumonService";

// ─── Estilos (layout responsive; los colores vienen de los tokens del tema) ───
const CSS = `
.lep { display: flex; flex-direction: column; gap: 14px; max-width: 1180px; margin: 0 auto; padding-bottom: 24px; }
.lep-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 14px; box-shadow: var(--clay-card); padding: 16px; }
.lep-card h3 { margin: 0 0 10px; font-size: 14px; font-weight: 800; display: flex; align-items: center; gap: 7px; }
.lep-head { display: flex; align-items: center; gap: 14px; padding: 12px 16px; flex-wrap: wrap;
  background: linear-gradient(120deg, rgba(14,165,233,0.10), rgba(99,102,241,0.07)), var(--color-surface); }
.lep-head h1 { margin: 0; font-size: 19px; font-weight: 900; line-height: 1.2; }
.lep-eyebrow { font-size: 11px; font-weight: 800; color: #0284C7; letter-spacing: .06em; }
.lep-muted { font-size: 12.5px; color: var(--color-text-muted); line-height: 1.5; }
.lep-tabs { display: flex; gap: 4px; padding: 4px; border-radius: 12px; background: var(--color-surface); border: 1px solid var(--color-border); width: fit-content; max-width: 100%; overflow-x: auto; }
.lep-tab { display: inline-flex; align-items: center; gap: 7px; padding: 8px 14px; border-radius: 9px; border: 0; background: transparent;
  font-size: 13px; font-weight: 700; color: var(--color-text-muted); cursor: pointer; white-space: nowrap; }
.lep-tab[aria-selected="true"] { background: #0284C7; color: #fff; box-shadow: 0 2px 6px rgba(2,132,199,.3); }
.lep-tab .lep-num { width: 20px; height: 20px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 11px;
  background: rgba(2,132,199,.12); color: #0284C7; }
.lep-tab[aria-selected="true"] .lep-num { background: rgba(255,255,255,.25); color: #fff; }
.lep-grid { display: grid; grid-template-columns: minmax(0, 1fr) 330px; gap: 14px; align-items: start; }
.lep-main, .lep-aside { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.lep-aside { position: sticky; top: 12px; }
.lep-field { display: flex; flex-direction: column; gap: 5px; }
.lep-label { font-size: 12px; font-weight: 700; color: var(--color-text); }
.lep-input { width: 100%; font-size: 13.5px; line-height: 1.55; padding: 8px 11px; border-radius: 10px; font-family: inherit; box-sizing: border-box;
  border: 1px solid var(--color-border); background: var(--color-bg); color: var(--color-text); resize: none; outline: none; transition: border-color .15s, background .15s; }
.lep-input:focus { border-color: #0284C7; background: var(--color-surface); }
.lep-numlist { display: flex; flex-direction: column; gap: 6px; }
.lep-numrow { display: grid; grid-template-columns: 24px minmax(0,1fr) 30px; gap: 8px; align-items: start; }
.lep-badge-num { width: 24px; height: 24px; border-radius: 50%; background: rgba(2,132,199,.12); color: #0284C7; font-size: 12px; font-weight: 800;
  display: inline-flex; align-items: center; justify-content: center; margin-top: 6px; }
.lep-icon-btn { width: 30px; height: 30px; border-radius: 8px; border: 0; background: transparent; color: var(--color-text-muted); cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; margin-top: 3px; }
.lep-icon-btn:hover { background: var(--color-bg); color: #DC2626; }
.lep-add { display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 700; color: #0284C7; background: transparent; border: 0; cursor: pointer; padding: 4px 0; }
.lep-chip { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; padding: 3px 9px; border-radius: 999px;
  background: rgba(2,132,199,.08); color: #0369A1; border: 1px solid rgba(2,132,199,.2); }
.lep-chip button { border: 0; background: transparent; cursor: pointer; color: inherit; padding: 0; display: inline-flex; }
.lep-chips { display: flex; flex-wrap: wrap; gap: 5px; }
.lep-eje { display: flex; align-items: center; gap: 9px; width: 100%; padding: 8px 10px; border-radius: 10px; cursor: pointer; text-align: left;
  font-size: 13px; font-weight: 600; border: 1px solid var(--color-border); background: var(--color-bg); color: var(--color-text); }
.lep-eje[aria-pressed="true"] { border-color: rgba(5,150,105,.45); background: rgba(5,150,105,.07); color: #047857; }
.lep-stepper { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.lep-stepper-ctrl { display: inline-flex; align-items: center; border: 1px solid var(--color-border); border-radius: 10px; overflow: hidden; }
.lep-stepper-ctrl button { width: 30px; height: 30px; border: 0; background: var(--color-bg); cursor: pointer; color: var(--color-text); display: inline-flex; align-items: center; justify-content: center; }
.lep-stepper-ctrl span { min-width: 34px; text-align: center; font-weight: 800; font-size: 14px; }
.lep-group { border: 1px solid var(--color-border); border-radius: 12px; overflow: hidden; }
.lep-group + .lep-group { margin-top: 8px; }
.lep-group-head { display: flex; align-items: center; gap: 10px; padding: 10px 12px; cursor: pointer; background: var(--color-surface); border: 0; width: 100%; text-align: left; color: var(--color-text); }
.lep-group-body { padding: 12px; border-top: 1px solid var(--color-border); background: var(--color-bg); display: flex; flex-direction: column; gap: 10px; }
.lep-stats { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 10px; }
.lep-stat { padding: 12px 14px; border-radius: 12px; border: 1px solid var(--color-border); background: var(--color-surface); }
.lep-stat b { display: block; font-size: 22px; font-weight: 900; line-height: 1.1; }
.lep-table { width: 100%; border-collapse: separate; border-spacing: 0; }
.lep-row { display: grid; grid-template-columns: minmax(130px,1.1fr) minmax(120px,1fr) minmax(130px,1.1fr) minmax(110px,.9fr) minmax(140px,1.2fr) auto; gap: 14px; align-items: center;
  padding: 11px 14px; border-top: 1px solid var(--color-border); }
.lep-row.lep-row-head { border-top: 0; font-size: 11px; font-weight: 800; letter-spacing: .05em; color: var(--color-text-muted); padding-top: 4px; padding-bottom: 6px; }
.lep-bar { height: 7px; border-radius: 999px; background: var(--color-bg); border: 1px solid var(--color-border); overflow: hidden; }
.lep-bar > i { display: block; height: 100%; border-radius: 999px; transition: width .4s; }
.lep-quote { position: relative; padding: 14px 16px 14px 18px; border-radius: 12px; background: rgba(2,132,199,.06); border-left: 4px solid #0284C7; font-size: 14px; line-height: 1.65; white-space: pre-wrap; }
.lep-steps { display: flex; flex-direction: column; gap: 10px; }
.lep-step { display: grid; grid-template-columns: 28px 1fr; gap: 10px; font-size: 13px; line-height: 1.5; }
.lep-drop { display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 12px; cursor: pointer; border: 1.5px dashed rgba(2,132,199,.45); background: rgba(2,132,199,.04); }
.lep-drop:hover { background: rgba(2,132,199,.08); }
.lep-mobilebar { display: none; }
.lep-publish-actions { display: grid; grid-template-columns: 1fr 1.4fr; gap: 8px; }
@media (max-width: 960px) {
  .lep-grid { grid-template-columns: minmax(0,1fr); }
  .lep-aside { position: static; }
  .lep-stats { grid-template-columns: repeat(2, minmax(0,1fr)); }
  .lep-row { grid-template-columns: 1fr auto; grid-template-areas: "grupo accion" "progreso progreso" "part part" "enc enc" "ejes ejes"; gap: 8px; }
  .lep-row > :nth-child(1) { grid-area: grupo; } .lep-row > :nth-child(2) { grid-area: progreso; }
  .lep-row > :nth-child(3) { grid-area: part; } .lep-row > :nth-child(4) { grid-area: enc; } .lep-row > :nth-child(5) { grid-area: ejes; } .lep-row > :nth-child(6) { grid-area: accion; }
  .lep-row.lep-row-head { display: none; }
  .lep-mobilebar { display: flex; gap: 8px; position: sticky; bottom: 0; z-index: 5; padding: 10px; margin: 0 -4px; border-radius: 14px;
    background: var(--color-surface); border: 1px solid var(--color-border); box-shadow: 0 -6px 18px rgba(15,23,42,.08); }
  .lep-mobilebar > * { flex: 1; }
  .lep-aside .lep-publish-actions { display: none; }
}
`;

const AZUL = "#0284C7";
const fechaLarga = (f) => (f ? new Date(f).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" }) : "");
const aInputFecha = (f) => (f ? new Date(f).toISOString().slice(0, 10) : "");

const VACIO = {
  resumenComunicado: "", objetivo: "", ejesObligatorios: [], retosPorPeriodo: 1, encuentrosPorAnio: 3,
  periodos: [], formatoEntrega: "", indicacionesDocentes: [], porCurso: [], pendientesPorDefinir: [], mensajeDocentes: "",
};

// comparación para saber si hay cambios sin publicar
const huella = (c) => JSON.stringify({
  ...VACIO, ...c,
  periodos: (c?.periodos ?? []).map((p) => ({ nombre: p.nombre, inicio: aInputFecha(p.inicio), fin: aInputFecha(p.fin) })),
  porCurso: (c?.porCurso ?? []).map((p) => ({ ...p, cursoId: String(p.cursoId) })),
});

const EJEMPLOS_INDICACIONES = [
  "Cada grupo publica 1 reto por periodo",
  "La evidencia es una reflexión corta de la familia",
  "En primaria priorizar pantallas y rutinas",
  "En bachillerato priorizar sexualidad y consumo",
  "Usar TIC para familias que no pueden asistir",
];

// ─── Controles ───────────────────────────────────────────────────────────────
// textarea que crece con el texto: sin cajas vacías enormes
function AutoTextarea({ value, onChange, minRows = 2, ...props }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value]);
  return <textarea ref={ref} rows={minRows} className="lep-input" value={value} onChange={(e) => onChange(e.target.value)} {...props} />;
}

function Stepper({ label, value, onChange, min = 0, max = 20, ayuda }) {
  return (
    <div>
      <div className="lep-stepper">
        <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
        <span className="lep-stepper-ctrl">
          <button type="button" aria-label="Menos" onClick={() => onChange(Math.max(min, value - 1))}><Minus size={14} /></button>
          <span>{value}</span>
          <button type="button" aria-label="Más" onClick={() => onChange(Math.min(max, value + 1))}><Plus size={14} /></button>
        </span>
      </div>
      {ayuda && <div className="lep-muted" style={{ fontSize: 11.5, marginTop: 3 }}>{ayuda}</div>}
    </div>
  );
}

// lista numerada editable (indicaciones)
function ListaNumerada({ items, onChange, agregar, max = 10 }) {
  return (
    <div className="lep-numlist">
      {items.map((item, i) => (
        <div key={i} className="lep-numrow">
          <span className="lep-badge-num">{i + 1}</span>
          <AutoTextarea minRows={1} maxLength={400} value={item} onChange={(v) => onChange(items.map((x, j) => (j === i ? v : x)))} />
          <button type="button" className="lep-icon-btn" aria-label="Quitar" onClick={() => onChange(items.filter((_, j) => j !== i))}>
            <Trash2 size={15} />
          </button>
        </div>
      ))}
      {items.length < max && (
        <button type="button" className="lep-add" onClick={() => onChange([...items, ""])}><Plus size={15} /> {agregar}</button>
      )}
    </div>
  );
}

// temas como fichas: Enter o coma agrega
function ChipsInput({ valores, onChange, placeholder, max = 8 }) {
  const [texto, setTexto] = useState("");
  const agregar = () => {
    const t = texto.trim().replace(/,$/, "");
    if (t && !valores.includes(t) && valores.length < max) onChange([...valores, t]);
    setTexto("");
  };
  return (
    <div className="lep-input" style={{ display: "flex", flexWrap: "wrap", gap: 5, alignItems: "center", padding: "6px 8px" }}>
      {valores.map((v) => (
        <span key={v} className="lep-chip">
          {v}
          <button type="button" aria-label={`Quitar ${v}`} onClick={() => onChange(valores.filter((x) => x !== v))}><X size={12} /></button>
        </span>
      ))}
      <input
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); agregar(); } }}
        onBlur={agregar}
        placeholder={valores.length ? "" : placeholder}
        style={{ flex: "1 1 140px", border: 0, outline: "none", background: "transparent", fontSize: 13, color: "var(--color-text)", padding: "3px 2px", fontFamily: "inherit" }}
      />
    </div>
  );
}

// ─── Vista que reciben los docentes (también es la vista previa del admin) ────
function VistaDocente({ contenido, version, publicadoEn, autor, cursos, ejes, misCursos, seguimiento }) {
  const labelEje = (e) => ejes.find((x) => x.valor === e)?.label ?? e;
  const nombreCurso = (id) => cursos.find((c) => String(c._id) === String(id))?.nombre ?? "Grupo";
  // grupos a mostrar: los del docente (o todos en la vista previa), y solo si tienen algo propio
  const grupos = (contenido.porCurso ?? [])
    .filter((p) => !misCursos || misCursos.includes(String(p.cursoId)))
    .filter((p) => p.temasPrioritarios?.length || p.indicaciones || p.retosPorPeriodo != null);

  return (
    <div className="lep-grid">
      <div className="lep-main">
        <div className="lep-card">
          {contenido.mensajeDocentes && (
            <>
              <div className="lep-quote">{contenido.mensajeDocentes}</div>
              <div className="lep-muted" style={{ margin: "8px 0 16px", display: "flex", gap: 6, alignItems: "center" }}>
                <MessageSquareQuote size={14} /> {autor ? `${autor} · ` : ""}Rectoría{publicadoEn ? ` · ${fechaLarga(publicadoEn)}` : ""}{version ? ` · versión ${version}` : ""}
              </div>
            </>
          )}
          {contenido.resumenComunicado && (
            <section style={{ marginBottom: 14 }}>
              <h3><FileText size={16} color={AZUL} /> Qué nos pidieron</h3>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65 }}>{contenido.resumenComunicado}</p>
            </section>
          )}
          {contenido.objetivo && (
            <section>
              <h3><Target size={16} color={AZUL} /> Objetivo</h3>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65 }}>{contenido.objetivo}</p>
            </section>
          )}
        </div>

        {contenido.indicacionesDocentes?.length > 0 && (
          <div className="lep-card">
            <h3><ClipboardList size={16} color={AZUL} /> Qué debes hacer</h3>
            <div className="lep-numlist">
              {contenido.indicacionesDocentes.map((t, i) => (
                <div key={t} style={{ display: "grid", gridTemplateColumns: "24px 1fr", gap: 10, fontSize: 14, lineHeight: 1.55 }}>
                  <span className="lep-badge-num" style={{ marginTop: 0 }}>{i + 1}</span>
                  <span style={{ paddingTop: 2 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {grupos.length > 0 && (
          <div className="lep-card">
            <h3><Users size={16} color={AZUL} /> {misCursos ? "Para tus grupos" : "Indicaciones por grupo"}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 10 }}>
              {grupos.map((p) => (
                <div key={String(p.cursoId)} style={{ padding: 12, borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-bg)", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <strong style={{ fontSize: 14 }}>{nombreCurso(p.cursoId)}</strong>
                    {p.retosPorPeriodo != null && <span className="lep-chip">{p.retosPorPeriodo} retos/periodo</span>}
                  </div>
                  {p.temasPrioritarios?.length > 0 && (
                    <div className="lep-chips">{p.temasPrioritarios.map((t) => <span key={t} className="lep-chip">{t}</span>)}</div>
                  )}
                  {p.indicaciones && <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{p.indicaciones}</p>}
                  {misCursos && (
                    <Link to={`/cursos/${p.cursoId}?tab=tareas&edumon=1`} style={{ fontSize: 12.5, fontWeight: 700, color: AZUL, display: "inline-flex", gap: 5, alignItems: "center", textDecoration: "none" }}>
                      <Sparkles size={14} /> Crear reto con Edumon <ArrowRight size={13} />
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <aside className="lep-aside">
        {/* el docente: cómo van sus grupos y el atajo para crear el reto */}
        {misCursos && seguimiento?.cursos?.length > 0 && (
          <div className="lep-card" style={{ background: "linear-gradient(135deg, rgba(14,165,233,0.08), rgba(99,102,241,0.06)), var(--color-surface)" }}>
            <h3><Sparkles size={16} color={AZUL} /> Tus grupos</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {seguimiento.cursos.map((c) => {
                const e = ESTADOS[c.estado];
                return (
                  <div key={c.cursoId} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                      <strong>{c.nombre}</strong>
                      <span style={{ color: e.color, fontWeight: 700, fontSize: 12 }}>{c.publicados}/{c.meta} retos</span>
                    </div>
                    <div className="lep-bar"><i style={{ width: `${c.meta ? Math.min(100, (c.publicados / c.meta) * 100) : 100}%`, background: e.color }} /></div>
                    {c.estado !== "al_dia" && (
                      <Link to={`/cursos/${c.cursoId}?tab=tareas&edumon=1`} style={{ fontSize: 12.5, fontWeight: 700, color: AZUL, textDecoration: "none", display: "inline-flex", gap: 4, alignItems: "center" }}>
                        Crear reto con Edumon <ArrowRight size={13} />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <div className="lep-card">
          <h3><BarChart3 size={16} color={AZUL} /> Metas</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div className="lep-stat" style={{ background: "var(--color-bg)" }}><b>{contenido.retosPorPeriodo}</b><span className="lep-muted">retos por periodo en cada grupo</span></div>
            <div className="lep-stat" style={{ background: "var(--color-bg)" }}><b>{contenido.encuentrosPorAnio}</b><span className="lep-muted">encuentros al año</span></div>
          </div>
          {contenido.periodos?.length > 0 && (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              {contenido.periodos.map((p) => (
                <div key={`${p.nombre}-${p.inicio}`} style={{ display: "flex", gap: 8, fontSize: 12.5, alignItems: "center" }}>
                  <CalendarRange size={14} color={AZUL} />
                  <strong>{p.nombre}</strong>
                  <span className="lep-muted">{fechaLarga(p.inicio)} – {fechaLarga(p.fin)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {contenido.ejesObligatorios?.length > 0 && (
          <div className="lep-card">
            <h3><CheckCircle2 size={16} color="#059669" /> Ejes obligatorios</h3>
            <div className="lep-chips">
              {contenido.ejesObligatorios.map((e) => <span key={e} className="lep-chip" style={{ background: "rgba(5,150,105,.08)", color: "#047857", borderColor: "rgba(5,150,105,.25)" }}>{labelEje(e)}</span>)}
            </div>
          </div>
        )}
        {contenido.formatoEntrega && (
          <div className="lep-card">
            <h3><FileUp size={16} color={AZUL} /> Evidencia de las familias</h3>
            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.55 }}>{contenido.formatoEntrega}</p>
          </div>
        )}
      </aside>
    </div>
  );
}

// ─── Seguimiento por grupo ───────────────────────────────────────────────────
const ESTADOS = {
  sin_retos: { label: "Sin retos", color: "#DC2626", fondo: "rgba(220,38,38,.08)" },
  en_progreso: { label: "En progreso", color: "#D97706", fondo: "rgba(217,119,6,.10)" },
  al_dia: { label: "Al día", color: "#059669", fondo: "rgba(5,150,105,.09)" },
};

// en la tabla los nombres completos de los ejes la estiran demasiado
const EJE_CORTO = {
  garantia_derechos: "Derechos",
  educacion_sexualidad: "Sexualidad",
  crianza_amorosa: "Crianza amorosa",
  estilos_vida_saludable: "Vida saludable",
  apoyo_procesos_educativos: "Apoyo educativo",
};

function Seguimiento({ datos, ejes, esAdmin, onRecargar }) {
  const [filtro, setFiltro] = useState("");
  const [detalleDe, setDetalleDe] = useState(null);
  if (!datos) return <div className="lep-card lep-muted">Cargando seguimiento…</div>;

  const labelEje = (e) => EJE_CORTO[e] ?? ejes.find((x) => x.valor === e)?.label ?? e;
  const total = datos.cursos.reduce((acc, c) => ({ familias: acc.familias + c.participacion.familias, participaron: acc.participaron + c.participacion.participaron }), { familias: 0, participaron: 0 });
  const pctTotal = total.familias ? Math.round((total.participaron / total.familias) * 100) : 0;

  // reporte de todos los grupos (para rectoría o la Secretaría)
  const descargarReporte = () => {
    const filas = [
      ["Grupo", "Docente", "Familias", "Entregaron un reto", "Asistieron a un encuentro", "Participaron", "% participación", "Retos publicados", "Meta de retos", "Encuentros realizados", "Meta de encuentros (año)", "Ejes pendientes"],
      ...datos.cursos.map((c) => [
        c.nombre, c.docente ?? "", String(c.participacion.familias), String(c.participacion.entregaron), String(c.participacion.asistieron),
        String(c.participacion.participaron), `${c.participacion.porcentaje}%`, String(c.publicados), String(c.meta),
        String(c.encuentros.realizados), String(c.encuentros.meta), c.ejesFaltantes.map((x) => labelEje(x)).join(", ") || "Completos",
      ]),
      [],
      ["Total", "", String(total.familias), "", "", String(total.participaron), `${pctTotal}%`],
      ["Periodo", `${datos.periodo.nombre}: ${fechaLarga(datos.periodo.inicio)} – ${fechaLarga(datos.periodo.fin)}`],
      ["Generado", new Date().toLocaleString("es-CO")],
    ];
    descargarXlsx(filas, `reporte-escuela-de-padres-${new Date().toISOString().slice(0, 10)}.xlsx`, "Escuela de padres");
  };
  const cuenta = (estado) => datos.cursos.filter((c) => c.estado === estado).length;
  const orden = Object.keys(ESTADOS);
  const filas = datos.cursos
    .filter((c) => !filtro || c.estado === filtro)
    .sort((a, b) => orden.indexOf(a.estado) - orden.indexOf(b.estado) || a.nombre.localeCompare(b.nombre));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="lep-stats">
        <div className="lep-stat">
          <span className="lep-muted" style={{ display: "flex", gap: 5, alignItems: "center" }}><CalendarRange size={13} /> Periodo</span>
          <b style={{ fontSize: 16, marginTop: 4 }}>{datos.periodo.nombre}</b>
          <span className="lep-muted" style={{ fontSize: 11.5 }}>{fechaLarga(datos.periodo.inicio)} – {fechaLarga(datos.periodo.fin)}</span>
          <span style={{ display: "block", fontSize: 12, fontWeight: 700, marginTop: 4, color: pctTotal >= 60 ? "#059669" : pctTotal >= 30 ? "#D97706" : "#DC2626" }}>
            {pctTotal}% de las familias participaron ({total.participaron}/{total.familias})
          </span>
        </div>
        {Object.entries(ESTADOS).map(([k, e]) => (
          <button
            key={k}
            type="button"
            className="lep-stat"
            onClick={() => setFiltro(filtro === k ? "" : k)}
            style={{ textAlign: "left", cursor: "pointer", borderColor: filtro === k ? e.color : undefined, background: filtro === k ? e.fondo : undefined }}
          >
            <b style={{ color: e.color }}>{cuenta(k)}</b>
            <span className="lep-muted">{k === "al_dia" ? "grupos al día" : k === "en_progreso" ? "grupos en progreso" : "grupos sin retos"}</span>
          </button>
        ))}
      </div>

      {!datos.hayLineamientos && (
        <div className="lep-card lep-muted" style={{ display: "flex", gap: 8, alignItems: "center", padding: 12 }}>
          <AlertTriangle size={15} color="#B45309" /> Aún no hay lineamientos publicados: se usa la meta por defecto (1 reto por grupo).
        </div>
      )}

      <div className="lep-card" style={{ padding: "8px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "4px 14px 8px", flexWrap: "wrap" }}>
          <span className="lep-muted" style={{ flex: 1 }}>
            Participa la familia que <strong>entregó un reto</strong> o <strong>asistió a un encuentro</strong> del periodo. Abre un grupo para ver cada familia y marcar asistencia.
          </span>
          <Button size="sm" variant="ghost" leftIcon={<Download size={15} />} onClick={descargarReporte}>Descargar reporte</Button>
        </div>
        <div className="lep-row lep-row-head">
          <span>GRUPO</span><span>RETOS DEL PERIODO</span><span>PARTICIPACIÓN</span><span>ENCUENTROS (AÑO)</span><span>EJES PENDIENTES</span><span />
        </div>
        {filas.length === 0 && <div className="lep-muted" style={{ padding: "14px 16px" }}>{datos.cursos.length ? "Ningún grupo en este estado." : "No hay grupos activos."}</div>}
        {filas.map((c) => {
          const e = ESTADOS[c.estado];
          const pct = c.meta ? Math.min(100, Math.round((c.publicados / c.meta) * 100)) : 100;
          const p = c.participacion;
          const colorP = p.porcentaje >= 60 ? "#059669" : p.porcentaje >= 30 ? "#D97706" : "#DC2626";
          const enc = c.encuentros;
          return (
            <div key={c.cursoId} className="lep-row">
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{c.nombre}</div>
                {c.docente && esAdmin && <div className="lep-muted" style={{ fontSize: 12 }}>{c.docente}</div>}
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: e.color, fontWeight: 700, display: "inline-flex", gap: 4, alignItems: "center" }}><Circle size={8} fill={e.color} stroke="none" /> {e.label}</span>
                  <strong>{c.publicados}/{c.meta}</strong>
                </div>
                <div className="lep-bar"><i style={{ width: `${pct}%`, background: e.color }} /></div>
              </div>
              <div title={`${p.entregaron} entregaron un reto · ${p.asistieron} asistieron a un encuentro`}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: colorP, fontWeight: 800 }}>{p.porcentaje}%</span>
                  <span className="lep-muted" style={{ fontSize: 12 }}>{p.participaron} de {p.familias} familias</span>
                </div>
                <div className="lep-bar"><i style={{ width: `${p.porcentaje}%`, background: colorP }} /></div>
              </div>
              <div style={{ fontSize: 12.5 }}>
                <strong style={{ color: enc.realizados >= enc.meta ? "#059669" : "var(--color-text)" }}>{enc.realizados}/{enc.meta}</strong>
                <span className="lep-muted"> realizados{enc.programados ? ` · ${enc.programados} prog.` : ""}</span>
                {enc.sinAsistenciaMarcada > 0 && (
                  <div style={{ color: "#B45309", fontWeight: 700, fontSize: 11.5, display: "flex", gap: 4, alignItems: "center" }}>
                    <AlertTriangle size={12} /> {enc.sinAsistenciaMarcada} sin asistencia marcada
                  </div>
                )}
              </div>
              <div className="lep-chips">
                {c.ejesFaltantes.length
                  ? c.ejesFaltantes.map((x) => <span key={x} className="lep-chip" style={{ background: "var(--color-bg)", color: "var(--color-text)", borderColor: "var(--color-border)" }}>{labelEje(x)}</span>)
                  : <span style={{ fontSize: 12.5, color: "#059669", fontWeight: 700, display: "inline-flex", gap: 4, alignItems: "center" }}><CheckCircle2 size={14} /> Completos</span>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                <button type="button" className="lep-add" onClick={() => setDetalleDe(c.cursoId)} style={{ whiteSpace: "nowrap" }}>
                  Ver familias <ArrowRight size={13} />
                </button>
                {!esAdmin && (
                  <Link to={`/cursos/${c.cursoId}?tab=tareas&edumon=1`} style={{ fontSize: 12, fontWeight: 700, color: "var(--color-text-muted)", textDecoration: "none", display: "inline-flex", gap: 4, alignItems: "center", whiteSpace: "nowrap" }}>
                    <Sparkles size={12} /> Crear reto
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <ParticipacionGrupoModal cursoId={detalleDe} isOpen={Boolean(detalleDe)} onClose={() => setDetalleDe(null)} onCambio={onRecargar} />
    </div>
  );
}

// ─── Editor del admin ────────────────────────────────────────────────────────
function GrupoEditable({ curso, valor, onChange }) {
  const [abierto, setAbierto] = useState(false);
  const tiene = valor && (valor.temasPrioritarios?.length || valor.indicaciones || valor.retosPorPeriodo != null);
  const v = valor ?? { cursoId: curso._id, temasPrioritarios: [], indicaciones: "", retosPorPeriodo: null };
  const cambiar = (k, x) => onChange({ ...v, [k]: x });

  return (
    <div className="lep-group">
      <button type="button" className="lep-group-head" onClick={() => setAbierto(!abierto)} aria-expanded={abierto}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 13.5 }}>{curso.nombre}</div>
          {!abierto && (
            tiene
              ? <div className="lep-chips" style={{ marginTop: 5 }}>
                  {v.temasPrioritarios.map((t) => <span key={t} className="lep-chip">{t}</span>)}
                  {v.retosPorPeriodo != null && <span className="lep-chip" style={{ background: "var(--color-bg)", color: "var(--color-text)" }}>meta: {v.retosPorPeriodo}</span>}
                  {v.indicaciones && <span className="lep-muted" style={{ fontSize: 12 }}>{v.indicaciones.slice(0, 70)}{v.indicaciones.length > 70 ? "…" : ""}</span>}
                </div>
              : <div className="lep-muted" style={{ fontSize: 12 }}>Sigue las indicaciones generales</div>
          )}
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: AZUL, display: "inline-flex", gap: 3, alignItems: "center" }}>
          {abierto ? <>Listo <ChevronUp size={15} /></> : <>{tiene ? "Editar" : "Agregar"} <ChevronDown size={15} /></>}
        </span>
      </button>
      {abierto && (
        <div className="lep-group-body">
          <div className="lep-field">
            <span className="lep-label">Temas prioritarios</span>
            <ChipsInput valores={v.temasPrioritarios ?? []} onChange={(x) => cambiar("temasPrioritarios", x)} placeholder="Escribe un tema y presiona Enter" />
          </div>
          <div className="lep-field">
            <span className="lep-label">Indicaciones para este grupo</span>
            <AutoTextarea minRows={2} maxLength={800} value={v.indicaciones ?? ""} onChange={(x) => cambiar("indicaciones", x)} placeholder="Opcional" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <Stepper label="Meta propia de retos por periodo" value={v.retosPorPeriodo ?? 0} onChange={(x) => cambiar("retosPorPeriodo", x)} />
            {v.retosPorPeriodo != null && <button type="button" className="lep-add" onClick={() => cambiar("retosPorPeriodo", null)}>Usar la meta general</button>}
          </div>
          {tiene && <button type="button" className="lep-add" style={{ color: "#DC2626", alignSelf: "flex-start" }} onClick={() => { onChange(null); setAbierto(false); }}><Trash2 size={14} /> Quitar indicaciones de este grupo</button>}
        </div>
      )}
    </div>
  );
}

function Editor({ contenido, onChange, cursos, ejes, panel }) {
  const set = (k) => (v) => onChange({ ...contenido, [k]: v });
  const grupoDe = (id) => contenido.porCurso.find((p) => String(p.cursoId) === String(id));
  const cambiarGrupo = (id, valor) => onChange({
    ...contenido,
    porCurso: valor
      ? (grupoDe(id) ? contenido.porCurso.map((p) => (String(p.cursoId) === String(id) ? valor : p)) : [...contenido.porCurso, valor])
      : contenido.porCurso.filter((p) => String(p.cursoId) !== String(id)),
  });

  return (
    <div className="lep-grid">
      <div className="lep-main">
        <div className="lep-card">
          <h3><MessageSquareQuote size={16} color={AZUL} /> Mensaje para tus docentes</h3>
          <AutoTextarea minRows={3} maxLength={1500} value={contenido.mensajeDocentes} onChange={set("mensajeDocentes")} placeholder="Lo primero que leerán tus docentes" />
        </div>

        <div className="lep-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="lep-field">
            <span className="lep-label">Qué les pidieron (resumen del comunicado)</span>
            <AutoTextarea minRows={2} maxLength={3000} value={contenido.resumenComunicado} onChange={set("resumenComunicado")} />
          </div>
          <div className="lep-field">
            <span className="lep-label">Objetivo</span>
            <AutoTextarea minRows={1} maxLength={800} value={contenido.objetivo} onChange={set("objetivo")} />
          </div>
        </div>

        <div className="lep-card">
          <h3><ClipboardList size={16} color={AZUL} /> Qué deben hacer los docentes</h3>
          <ListaNumerada items={contenido.indicacionesDocentes} onChange={set("indicacionesDocentes")} agregar="Agregar indicación" />
        </div>

        <div className="lep-card">
          <h3><Users size={16} color={AZUL} /> Indicaciones por grupo</h3>
          <p className="lep-muted" style={{ margin: "-4px 0 10px" }}>Solo si un grupo necesita algo distinto: temas que priorizar o una meta propia.</p>
          {cursos.length === 0 && <div className="lep-muted">No hay grupos activos.</div>}
          {cursos.map((c) => (
            <GrupoEditable key={c._id} curso={c} valor={grupoDe(c._id)} onChange={(v) => cambiarGrupo(c._id, v)} />
          ))}
        </div>
      </div>

      <aside className="lep-aside">
        {panel}

        {contenido.pendientesPorDefinir.length > 0 && (
          <div className="lep-card" style={{ background: "#FFFBEB", borderColor: "#FCD34D" }}>
            <h3 style={{ color: "#B45309" }}><AlertTriangle size={16} /> Por definir ({contenido.pendientesPorDefinir.length})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {contenido.pendientesPorDefinir.map((p, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 26px", gap: 6, fontSize: 12.5, lineHeight: 1.45, color: "#78350F" }}>
                  <span>{p}</span>
                  <button type="button" className="lep-icon-btn" style={{ width: 26, height: 26, marginTop: 0 }} title="Ya lo resolví" aria-label="Marcar como resuelto"
                    onClick={() => set("pendientesPorDefinir")(contenido.pendientesPorDefinir.filter((_, j) => j !== i))}>
                    <CheckCircle2 size={15} />
                  </button>
                </div>
              ))}
            </div>
            <div className="lep-muted" style={{ fontSize: 11.5, marginTop: 8 }}>Los docentes no ven esta lista.</div>
          </div>
        )}

        <div className="lep-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <h3 style={{ margin: 0 }}><Target size={16} color={AZUL} /> Metas</h3>
          <Stepper label="Retos por periodo (cada grupo)" value={contenido.retosPorPeriodo} onChange={set("retosPorPeriodo")} />
          <Stepper label="Encuentros al año" value={contenido.encuentrosPorAnio} onChange={set("encuentrosPorAnio")} max={50} ayuda="Ley 2025 de 2020: mínimo 3." />
        </div>

        <div className="lep-card">
          <h3><CheckCircle2 size={16} color="#059669" /> Ejes obligatorios</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ejes.map((e) => {
              const activo = contenido.ejesObligatorios.includes(e.valor);
              return (
                <button key={e.valor} type="button" className="lep-eje" aria-pressed={activo}
                  onClick={() => set("ejesObligatorios")(activo ? contenido.ejesObligatorios.filter((x) => x !== e.valor) : [...contenido.ejesObligatorios, e.valor])}>
                  {activo ? <CheckCircle2 size={16} /> : <Circle size={16} color="var(--color-border)" />} {e.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="lep-card">
          <h3><CalendarRange size={16} color={AZUL} /> Periodos</h3>
          {contenido.periodos.length === 0 && <div className="lep-muted" style={{ marginBottom: 6 }}>Sin periodos, el seguimiento cuenta los retos del año.</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {contenido.periodos.map((p, i) => {
              const cambiar = (k, v) => set("periodos")(contenido.periodos.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
              return (
                <div key={i} style={{ padding: 8, borderRadius: 10, border: "1px solid var(--color-border)", display: "flex", flexDirection: "column", gap: 6 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input className="lep-input" maxLength={60} value={p.nombre} onChange={(e) => cambiar("nombre", e.target.value)} />
                    <button type="button" className="lep-icon-btn" aria-label="Quitar periodo" style={{ marginTop: 3 }} onClick={() => set("periodos")(contenido.periodos.filter((_, j) => j !== i))}><Trash2 size={15} /></button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    <input className="lep-input" type="date" aria-label="Inicio" value={aInputFecha(p.inicio)} onChange={(e) => cambiar("inicio", e.target.value || null)} />
                    <input className="lep-input" type="date" aria-label="Fin" value={aInputFecha(p.fin)} onChange={(e) => cambiar("fin", e.target.value || null)} />
                  </div>
                </div>
              );
            })}
          </div>
          {contenido.periodos.length < 8 && (
            <button type="button" className="lep-add" style={{ marginTop: 6 }} onClick={() => set("periodos")([...contenido.periodos, { nombre: `Periodo ${contenido.periodos.length + 1}`, inicio: null, fin: null }])}>
              <Plus size={15} /> Agregar periodo
            </button>
          )}
        </div>

        <div className="lep-card">
          <h3><FileUp size={16} color={AZUL} /> Evidencia de las familias</h3>
          <AutoTextarea minRows={1} maxLength={800} value={contenido.formatoEntrega} onChange={set("formatoEntrega")} placeholder="Ej.: una reflexión escrita corta" />
        </div>
      </aside>
    </div>
  );
}

// ─── Página ──────────────────────────────────────────────────────────────────
export default function LineamientosEscuelaPadresPage() {
  const { user } = useAuth();
  const esAdmin = user?.rol === "administrador";
  const [tab, setTab] = useState(esAdmin ? "fuente" : "lineamientos");
  const [datos, setDatos] = useState(null); // { lineamiento, cursos }
  const [borrador, setBorrador] = useState(VACIO);
  const [seguimiento, setSeguimiento] = useState(null);
  const [ejes, setEjes] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [texto, setTexto] = useState("");
  const [instrucciones, setInstrucciones] = useState("");
  const [vistaPrevia, setVistaPrevia] = useState(false);
  const [ocupado, setOcupado] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const avisar = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 4000);
  };

  const aplicarRespuesta = (r) => {
    setDatos(r);
    if (r.lineamiento?.borrador) setBorrador({ ...VACIO, ...r.lineamiento.borrador });
    if (r.lineamiento?.fuente) setInstrucciones((v) => v || r.lineamiento.fuente.instrucciones || "");
  };

  const cargarSeguimiento = () => lineamientosSeguimiento().then(setSeguimiento).catch((err) => avisar(humanizeError(err), "error"));

  useEffect(() => {
    cargarTemas().then(setEjes);
    lineamientosGet()
      .then((r) => {
        aplicarRespuesta(r);
        if (esAdmin && r.lineamiento?.borrador?.objetivo) setTab("editor");
      })
      .catch((err) => avisar(humanizeError(err), "error"));
    cargarSeguimiento();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const lineamiento = datos?.lineamiento;
  const cursos = datos?.cursos ?? [];
  const publicado = lineamiento?.publicado;
  const hayCambiosSinPublicar = esAdmin && lineamiento && huella(borrador) !== huella(publicado);
  const misCursos = useMemo(() => (esAdmin ? null : (seguimiento?.cursos ?? []).map((c) => String(c.cursoId))), [esAdmin, seguimiento]);
  const autor = lineamiento?.publicadoPor ? `${lineamiento.publicadoPor.nombre} ${lineamiento.publicadoPor.apellido ?? ""}`.trim() : null;

  const generar = async () => {
    setOcupado("generar");
    try {
      const r = await lineamientosGenerar({ archivo, texto: texto.trim(), instrucciones: instrucciones.trim() });
      aplicarRespuesta(r);
      setVistaPrevia(false);
      setTab("editor");
      avisar(r.leidoDelPdf ? `Edumon leyó el PDF (${r.leidoDelPdf.toLocaleString("es-CO")} caracteres) y organizó los lineamientos` : "Edumon organizó los lineamientos");
    } catch (err) {
      avisar(humanizeError(err), "error");
    } finally {
      setOcupado("");
    }
  };

  const guardar = async ({ silencioso } = {}) => {
    setOcupado("guardar");
    try {
      aplicarRespuesta(await lineamientosGuardar(borrador));
      if (!silencioso) avisar("Borrador guardado");
      return true;
    } catch (err) {
      avisar(humanizeError(err), "error");
      return false;
    } finally {
      setOcupado("");
    }
  };

  const publicar = async () => {
    if (!window.confirm("¿Publicar estos lineamientos? Todos los docentes recibirán una notificación.")) return;
    if (!(await guardar({ silencioso: true }))) return;
    setOcupado("publicar");
    try {
      const r = await lineamientosPublicar();
      aplicarRespuesta(r);
      avisar(`Publicado: ${r.docentesNotificados} docente(s) notificados`);
      cargarSeguimiento();
    } catch (err) {
      avisar(humanizeError(err), "error");
    } finally {
      setOcupado("");
    }
  };

  const botones = (
    <>
      <Button variant="ghost" onClick={() => guardar()} loading={ocupado === "guardar"} leftIcon={<Save size={16} />}>Guardar</Button>
      <Button onClick={publicar} loading={ocupado === "publicar"} disabled={!hayCambiosSinPublicar && Boolean(publicado)}
        leftIcon={!hayCambiosSinPublicar && publicado ? <CheckCircle2 size={16} /> : <Send size={16} />}>
        {!hayCambiosSinPublicar && publicado ? "Todo publicado" : publicado ? "Publicar cambios" : "Publicar"}
      </Button>
    </>
  );

  // panel lateral del editor: estado + acciones
  const panelPublicar = (
    <div className="lep-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: hayCambiosSinPublicar ? "#D97706" : publicado ? "#059669" : "var(--color-border)" }} />
        <strong style={{ fontSize: 13.5 }}>
          {hayCambiosSinPublicar ? (publicado ? "Cambios sin publicar" : "Borrador sin publicar") : publicado ? `Publicado · versión ${lineamiento.version}` : "Borrador"}
        </strong>
      </div>
      {publicado && <div className="lep-muted" style={{ fontSize: 12 }}>Última publicación: {fechaLarga(lineamiento.publicadoEn)}{autor ? ` · ${autor}` : ""}</div>}
      {lineamiento?.generadoPor === "plantilla" && (
        <div className="lep-muted" style={{ fontSize: 12, display: "flex", gap: 6, color: "#B45309" }}>
          <AlertTriangle size={14} style={{ flexShrink: 0 }} /> Edumon IA no estaba disponible: se armó una plantilla. Complétala antes de publicar.
        </div>
      )}
      <div className="lep-publish-actions">{botones}</div>
      <button type="button" className="lep-add" onClick={() => setVistaPrevia(!vistaPrevia)}>
        {vistaPrevia ? <><PencilLine size={15} /> Volver a editar</> : <><Eye size={15} /> Ver como lo verán los docentes</>}
      </button>
    </div>
  );

  const tabs = esAdmin
    ? [["fuente", "Lo que te pidieron", FileText], ["editor", "Lineamientos", ScrollText], ["seguimiento", "Seguimiento por grupo", BarChart3]]
    : [["lineamientos", "Lineamientos del colegio", ScrollText], ["seguimiento", "Mis grupos", BarChart3]];

  return (
    <div className="lep">
      <style>{CSS}</style>
      <Toast msg={toast.msg} type={toast.type} />

      <div className="lep-card lep-head">
        <EdumonMascota size={54} expresion={ocupado === "generar" ? "pensando" : "ia"} animacion={ocupado === "generar" ? "pensar" : null} />
        <div style={{ flex: "1 1 280px", minWidth: 0 }}>
          <div className="lep-eyebrow">ESCUELA DE PADRES</div>
          <h1>Lineamientos del colegio</h1>
          <div className="lep-muted">
            {esAdmin
              ? "Lo que pidió el Ministerio o la Secretaría, organizado por Edumon para tus docentes."
              : "Lo que rectoría definió para los retos de escuela de padres. Edumon lo tiene en cuenta cuando te ayuda a diseñar un reto."}
          </div>
        </div>
        {publicado && (
          <span className="lep-chip" style={{ background: "rgba(5,150,105,.08)", color: "#047857", borderColor: "rgba(5,150,105,.3)", padding: "5px 11px" }}>
            <CheckCircle2 size={13} /> Versión {lineamiento.version} · {fechaLarga(lineamiento.publicadoEn)}
          </span>
        )}
      </div>

      <div className="lep-tabs" role="tablist">
        {tabs.map(([k, label, Icono], i) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className="lep-tab" onClick={() => setTab(k)}>
            {esAdmin ? <span className="lep-num">{i + 1}</span> : <Icono size={15} />} {label}
            {k === "editor" && hayCambiosSinPublicar && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#F59E0B" }} title="Cambios sin publicar" />}
          </button>
        ))}
      </div>

      {tab === "fuente" && esAdmin && (
        <div className="lep-grid">
          <div className="lep-main">
            <div className="lep-card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="lep-field">
                <span className="lep-label">Comunicado oficial</span>
                <label className="lep-drop">
                  <span style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(2,132,199,.12)", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <FileUp size={20} color={AZUL} />
                  </span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: 13.5, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {archivo ? archivo.name : "Sube el PDF de la circular"}
                    </strong>
                    <span className="lep-muted" style={{ fontSize: 12 }}>{archivo ? `${(archivo.size / 1024).toFixed(0)} KB · listo para leer` : "Máximo 10 MB · Edumon lee el texto, no guarda el archivo"}</span>
                  </span>
                  {archivo && (
                    <button type="button" className="lep-icon-btn" style={{ marginTop: 0 }} onClick={(e) => { e.preventDefault(); setArchivo(null); }} aria-label="Quitar PDF"><X size={16} /></button>
                  )}
                  <input type="file" accept="application/pdf,.pdf" hidden onChange={(e) => { setArchivo(e.target.files?.[0] ?? null); e.target.value = ""; }} />
                </label>
              </div>
              <div className="lep-field">
                <span className="lep-label">o pega el texto del comunicado</span>
                <AutoTextarea minRows={3} maxLength={60000} value={texto} onChange={setTexto} placeholder="Circular 015 de la Secretaría de Educación: las instituciones deben…" />
              </div>
            </div>

            <div className="lep-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div className="lep-field">
                <span className="lep-label">¿Cómo quieres que se gestionen los retos?</span>
                <AutoTextarea minRows={3} maxLength={3000} value={instrucciones} onChange={setInstrucciones} placeholder="Escribe tus indicaciones, una por línea" />
              </div>
              <div className="lep-chips">
                {EJEMPLOS_INDICACIONES.filter((e) => !instrucciones.includes(e)).map((e) => (
                  <button key={e} type="button" className="lep-chip" style={{ cursor: "pointer" }}
                    onClick={() => setInstrucciones((v) => (v.trim() ? `${v.trim()}\n${e}` : e))}>
                    <Plus size={12} /> {e}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <Button onClick={generar} loading={ocupado === "generar"} disabled={!archivo && !texto.trim() && !instrucciones.trim()} leftIcon={<Wand2 size={16} />}>
                {ocupado === "generar" ? "Edumon está organizando…" : "Organizar con Edumon"}
              </Button>
              {lineamiento?.borrador?.objetivo && <span className="lep-muted">Reemplaza el borrador; lo publicado no cambia hasta que publiques.</span>}
            </div>
          </div>

          <aside className="lep-aside">
            <div className="lep-card">
              <h3><Lightbulb size={16} color="#D97706" /> Cómo funciona</h3>
              <div className="lep-steps">
                {[
                  ["Comparte lo que te pidieron", "El PDF o el texto de la circular, y cómo quieres trabajarlo en tu colegio."],
                  ["Edumon lo organiza", "Metas, ejes, fechas e indicaciones por grupo. Te avisa lo que falta definir."],
                  ["Revisas y publicas", "Tus docentes reciben una notificación y Edumon lo usa al diseñar cada reto."],
                ].map(([t, d], i) => (
                  <div key={t} className="lep-step">
                    <span className="lep-badge-num" style={{ marginTop: 0, width: 28, height: 28 }}>{i + 1}</span>
                    <span><strong>{t}</strong><br /><span className="lep-muted">{d}</span></span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lep-card lep-muted" style={{ fontSize: 12, display: "flex", gap: 8 }}>
              <AlertTriangle size={15} color="#B45309" style={{ flexShrink: 0 }} />
              Si el PDF es escaneado (una foto del documento), Edumon no puede leerlo: pega el texto.
            </div>
          </aside>
        </div>
      )}

      {tab === "editor" && esAdmin && (
        vistaPrevia
          ? (
            <>
              <div className="lep-card" style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", flexWrap: "wrap" }}>
                <Eye size={16} color={AZUL} />
                <span style={{ flex: 1, fontSize: 13 }}><strong>Vista previa:</strong> así lo verán tus docentes.</span>
                <Button size="sm" variant="ghost" leftIcon={<PencilLine size={15} />} onClick={() => setVistaPrevia(false)}>Volver a editar</Button>
                <Button size="sm" onClick={publicar} loading={ocupado === "publicar"} disabled={!hayCambiosSinPublicar && Boolean(publicado)} leftIcon={<Send size={15} />}>Publicar</Button>
              </div>
              <VistaDocente contenido={borrador} cursos={cursos} ejes={ejes} autor={user ? `${user.nombre} ${user.apellido ?? ""}`.trim() : null} />
            </>
          )
          : (
            <>
              <Editor contenido={borrador} onChange={setBorrador} cursos={cursos} ejes={ejes} panel={panelPublicar} />
              <div className="lep-mobilebar">{botones}</div>
            </>
          )
      )}

      {tab === "lineamientos" && !esAdmin && (
        publicado
          ? <VistaDocente contenido={publicado} version={lineamiento.version} publicadoEn={lineamiento.publicadoEn} autor={autor} cursos={cursos} ejes={ejes} misCursos={misCursos} seguimiento={seguimiento} />
          : (
            <div className="lep-card" style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <EdumonMascota size={64} expresion="pensando" />
              <div>
                <strong>Todavía no hay lineamientos</strong>
                <div className="lep-muted">Cuando rectoría los publique, recibirás una notificación y aparecerán aquí.</div>
              </div>
            </div>
          )
      )}

      {tab === "seguimiento" && <Seguimiento datos={seguimiento} ejes={ejes} esAdmin={esAdmin} onRecargar={cargarSeguimiento} />}
    </div>
  );
}
