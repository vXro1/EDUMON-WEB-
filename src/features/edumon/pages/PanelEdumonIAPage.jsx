import { useState, useEffect, useCallback, useId } from "react";
import {
  Server, ShieldCheck, ThumbsUp, Coins, BarChart3, RefreshCw, FlaskConical, AlertTriangle, MessageSquareQuote,
} from "lucide-react";
import { Button } from "@/components";
import EdumonMascota from "../components/EdumonMascota";
import {
  edumonSaludIA, edumonMetricasIA, edumonRetroalimentacion, edumonCostos, edumonImpacto,
  mensajeErrorIA, SESION_VALIDACION,
} from "../services/edumonService";
import "../edumon-ia.css";

// la etiqueta "Datos de demostración" se controla sin tocar código (VITE_MODO_DEMO=true en la feria)
const MODO_DEMO = String(import.meta.env.VITE_MODO_DEMO ?? "").toLowerCase() === "true";

const pct = (f, dec = 1) => (f === null || f === undefined ? "—" : `${(f * 100).toFixed(dec).replace(".", ",")} %`);
const pct100 = (n) => (n === null || n === undefined ? "—" : `${Number(n).toFixed(1).replace(".", ",")} %`);
const usd = (n, dec = 4) => (n === null || n === undefined ? "—" : `US$ ${Number(n).toFixed(dec).replace(".", ",")}`);
const fechaHora = (f) => (f ? new Date(f).toLocaleString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—");
const num = (n) => (n === null || n === undefined ? "—" : Number(n).toLocaleString("es-CO"));

/** Carga independiente por sección: error claro y reintento, nunca pantalla en blanco. */
function useCarga(fn, deps) {
  const [estado, setEstado] = useState({ cargando: true, datos: null, error: "" });
  const cargar = useCallback(async () => {
    setEstado((e) => ({ ...e, cargando: true, error: "" }));
    try {
      setEstado({ cargando: false, datos: await fn(), error: "" });
    } catch (err) {
      setEstado({ cargando: false, datos: null, error: mensajeErrorIA(err, "No pudimos cargar esta sección.") });
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { cargar(); }, [cargar]);
  return { ...estado, recargar: cargar };
}

function Seccion({ id, icono: Icono, titulo, carga, children, extra }) {
  return (
    <section className="eia-card" aria-labelledby={id} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <h2 id={id} style={{ fontSize: 19, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <Icono size={21} aria-hidden="true" /> {titulo}
        </h2>
        {extra}
        <Button size="sm" variant="outline" onClick={carga.recargar} loading={carga.cargando} leftIcon={<RefreshCw size={14} aria-hidden="true" />}
          aria-label={`Actualizar: ${titulo}`}>
          Actualizar
        </Button>
      </div>
      {carga.cargando && !carga.datos && <p role="status" style={{ margin: 0, fontSize: 15 }}>Cargando…</p>}
      {carga.error && <p role="alert" style={{ margin: 0, fontSize: 15, color: "#B91C1C" }}>{carga.error}</p>}
      {carga.datos && children(carga.datos)}
    </section>
  );
}

function Kpi({ valor, etiqueta, tono }) {
  return (
    <div style={{ padding: "12px 14px", borderRadius: 12, background: "var(--color-bg)", border: "1px solid var(--color-border)", minWidth: 150, flex: "1 1 150px" }}>
      <div className="eia-kpi" style={tono ? { color: tono } : undefined}>{valor}</div>
      <div style={{ fontSize: 14, marginTop: 2 }}>{etiqueta}</div>
    </div>
  );
}

function Nota({ children, tono = "info" }) {
  const t = tono === "aviso"
    ? { background: "#FFFBEB", border: "1.5px solid #F59E0B", color: "#78350F" }
    : { background: "#F0F9FF", border: "1px solid #7DD3FC", color: "#0C4A6E" };
  return <div role="note" style={{ ...t, padding: "10px 14px", borderRadius: 12, fontSize: 14.5, lineHeight: 1.55 }}>{children}</div>;
}

// ─── 1. Proveedores ──────────────────────────────────────────────────────────
const NOMBRES = { groq: "Groq", openai: "OpenAI" };
const ESTADOS = {
  activo: { texto: "Activo", color: "#065F46", fondo: "#D1FAE5" },
  en_cooldown: { texto: "En pausa (cooldown)", color: "#78350F", fondo: "#FEF3C7" },
  sin_llave: { texto: "Sin llave", color: "#374151", fondo: "#E5E7EB" },
  fuera_del_orden: { texto: "Fuera del orden", color: "#374151", fondo: "#E5E7EB" },
};

function Proveedores({ datos }) {
  return (
    <>
      <p style={{ margin: 0, fontSize: 15.5 }}>
        Modo actual: <strong>{datos.modo === "llm" ? "IA generativa (LLM)" : "Simulado: reglas y fichas curadas, sin llaves de IA"}</strong>
        {datos.orden?.length > 0 && <> · orden: {datos.orden.join(" → ")}</>}
      </p>
      <div style={{ overflowX: "auto" }}>
        <table className="eia-tabla">
          <caption className="sr-only">Estado de cada proveedor de IA</caption>
          <thead><tr><th scope="col">Proveedor</th><th scope="col">Modelo</th><th scope="col">Estado</th><th scope="col">Última latencia</th><th scope="col">Último éxito</th><th scope="col">Último error</th></tr></thead>
          <tbody>
            {datos.proveedores.map((p) => {
              const e = ESTADOS[p.estado] ?? { texto: p.estado, color: "#374151", fondo: "#E5E7EB" };
              return (
                <tr key={p.nombre}>
                  <th scope="row" style={{ textAlign: "left" }}>{NOMBRES[p.nombre] ?? p.nombre}{p.orden ? ` (${p.orden}.º)` : ""}</th>
                  <td>{p.modelo}</td>
                  <td>
                    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, fontWeight: 800, fontSize: 13.5, color: e.color, background: e.fondo }}>{e.texto}</span>
                    {p.estado === "en_cooldown" && <div style={{ fontSize: 13, marginTop: 4 }}>Vuelve en {p.cooldownRestanteSegundos} s{p.motivoCooldown ? ` · ${p.motivoCooldown === "rate_limit" ? "límite de cuota" : "llave rechazada"}` : ""}</div>}
                  </td>
                  <td>{p.ultimaLatenciaMs != null ? `${(p.ultimaLatenciaMs / 1000).toFixed(2).replace(".", ",")} s` : "—"}</td>
                  <td>{fechaHora(p.ultimoExito)}</td>
                  <td>{p.ultimoError ? `${p.ultimoError.tipo}${p.ultimoError.status ? ` (${p.ultimoError.status})` : ""} · ${fechaHora(p.ultimoError.en)}` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="eia-muted" style={{ margin: 0, fontSize: 14 }}>
        Si todos los proveedores fallan, Edumon responde con fichas curadas y la red de seguridad de casos graves sigue funcionando (son reglas).
      </p>
    </>
  );
}

// ─── 2. Métricas de seguridad ────────────────────────────────────────────────
const CONJUNTOS = { original: "Original", holdout: "Holdout v1", ciego: "Ciego" };

function Metricas({ datos }) {
  const ultimas = [...(datos.ultimas ?? [])].sort((a, b) => (a.conjunto === "ciego" ? -1 : b.conjunto === "ciego" ? 1 : 0));
  const ciego = ultimas.filter((u) => u.conjunto === "ciego");
  return (
    <>
      <Nota tono="aviso">
        <strong>Desarrollo vs. ciego.</strong> {datos.nota}
      </Nota>
      {ciego.length === 0 ? (
        <Nota>
          <strong>Todavía no hay métrica final:</strong> el conjunto ciego aún no tiene casos evaluados. Los números de abajo son de
          <strong> desarrollo</strong> (sus fallos se usaron para mejorar las reglas), así que no deben leerse como el desempeño final.
        </Nota>
      ) : (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {ciego.map((c) => (
            <div key={`${c.modo}`} style={{ flex: "1 1 260px", padding: 14, borderRadius: 14, border: "2px solid #059669", background: "#ECFDF5" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "#065F46" }}>MÉTRICA FINAL · CONJUNTO CIEGO · {c.modo === "llm" ? `con ${c.modelo ?? "LLM"}` : "solo reglas"}</div>
              <div style={{ display: "flex", gap: 18, marginTop: 6, flexWrap: "wrap" }}>
                <div><div className="eia-kpi">{pct(c.recallGraves)}</div><div style={{ fontSize: 14 }}>recall de casos graves</div></div>
                <div><div className="eia-kpi">{pct(c.tasaFalsasAlarmas)}</div><div style={{ fontSize: 14 }}>falsas alarmas graves</div></div>
              </div>
              <div style={{ fontSize: 13.5, marginTop: 4 }}>{c.casos} casos · {fechaHora(c.fecha)}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ overflowX: "auto" }}>
        <table className="eia-tabla">
          <caption className="sr-only">Última evaluación por conjunto y modo</caption>
          <thead><tr><th scope="col">Conjunto</th><th scope="col">Modo</th><th scope="col">Casos</th><th scope="col">Recall de graves</th><th scope="col">Falsas alarmas</th><th scope="col">Fecha</th></tr></thead>
          <tbody>
            {ultimas.map((u) => (
              <tr key={`${u.conjunto}-${u.modo}`} style={u.conjunto === "ciego" ? { background: "#ECFDF5", fontWeight: 700 } : undefined}>
                <th scope="row" style={{ textAlign: "left" }}>
                  {CONJUNTOS[u.conjunto] ?? u.conjunto}
                  <div style={{ fontSize: 12.5, fontWeight: 800, color: u.conjunto === "ciego" ? "#065F46" : "#92400E" }}>
                    {u.conjunto === "ciego" ? "FINAL" : "DESARROLLO"}
                  </div>
                </th>
                <td>{u.modo === "llm" ? `IA (${u.modelo ?? u.proveedor ?? "LLM"})` : "Solo reglas (simulado)"}</td>
                <td>{num(u.casos)}</td>
                <td style={{ fontSize: 17, fontWeight: 800 }}>{pct(u.recallGraves)}</td>
                <td style={{ fontSize: 17, fontWeight: 800 }}>{pct(u.tasaFalsasAlarmas)}</td>
                <td>{fechaHora(u.fecha)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {ultimas.some((u) => u.gravesPerdidos?.length || u.falsasAlarmas?.length) && (
        <details>
          <summary className="eia-focus" style={{ cursor: "pointer", fontSize: 15, fontWeight: 700 }}>Ver los casos que fallaron (textos ficticios de evaluación)</summary>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10, fontSize: 14.5 }}>
            {ultimas.map((u) => (u.gravesPerdidos?.length || u.falsasAlarmas?.length ? (
              <div key={`f-${u.conjunto}-${u.modo}`}>
                <strong>{CONJUNTOS[u.conjunto] ?? u.conjunto} · {u.modo === "llm" ? "IA" : "solo reglas"}</strong>
                <ul style={{ margin: "4px 0 0", paddingLeft: 20 }}>
                  {u.gravesPerdidos?.map((g) => <li key={`g-${g.texto}`}>Grave no detectado: “{g.texto}”</li>)}
                  {u.falsasAlarmas?.map((g) => <li key={`a-${g.texto}`}>Falsa alarma: “{g.texto}”</li>)}
                </ul>
              </div>
            ) : null))}
          </div>
        </details>
      )}
    </>
  );
}

// ─── 3. Retroalimentación ────────────────────────────────────────────────────
function Retroalimentacion({ datos }) {
  return (
    <>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Kpi valor={num(datos.total)} etiqueta="calificaciones" />
        <Kpi valor={pct100(datos.porcentajeUtil)} etiqueta={`les sirvió (${num(datos.utiles)} 👍 · ${num(datos.noUtiles)} 👎)`} tono="#047857" />
      </div>
      {datos.total === 0 && <p style={{ margin: 0, fontSize: 15 }}>Aún no hay calificaciones en este filtro.</p>}
      {datos.comentariosRecientes?.length > 0 && (
        <div>
          <p className="eia-seccion-t" style={{ display: "flex", alignItems: "center", gap: 6 }}><MessageSquareQuote size={15} aria-hidden="true" /> Comentarios recientes</p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
            {datos.comentariosRecientes.map((c, i) => (
              <li key={`${c.fecha}-${i}`} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--color-bg)", border: "1px solid var(--color-border)", fontSize: 15 }}>
                <span aria-label={c.util ? "Le sirvió" : "No le sirvió"}>{c.util ? "👍" : "👎"}</span> “{c.comentario}”
                <div className="eia-muted" style={{ fontSize: 13 }}>
                  {fechaHora(c.fecha)}{c.modoIA ? ` · respuesta ${c.modoIA === "llm" ? "con IA" : c.modoIA}` : ""}{c.sesionValidacion ? ` · ${c.sesionValidacion}` : ""}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="eia-muted" style={{ margin: 0, fontSize: 13.5 }}>Sin datos personales: los comentarios ocultan correos, teléfonos y números largos.</p>
    </>
  );
}

// ─── 4. Costo ────────────────────────────────────────────────────────────────
function Costo({ datos }) {
  const p = datos.proyeccionMensual ?? {};
  const sinLlamadas = !datos.llamadas;
  return (
    <>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Kpi valor={usd(datos.chat?.costoPorMensajeUSD, 5)} etiqueta="costo por mensaje del chat" />
        <Kpi valor={usd(p.costoUSD, 2)} etiqueta={`proyección mensual del colegio (${num(p.familias)} familias)`} />
        <Kpi valor={usd(datos.costoAcumuladoUSD, 4)} etiqueta={`acumulado · ${num(datos.llamadas)} llamadas`} />
      </div>
      <Nota>
        <strong>Supuesto:</strong> {num(p.mensajesPorFamiliaMes)} mensajes por familia al mes × {num(p.familias)} familias = {num(p.mensajesMes)} mensajes al mes.
        {p.supuesto ? ` ${p.supuesto}` : ""}
      </Nota>
      {sinLlamadas && (
        <p style={{ margin: 0, fontSize: 15 }}>
          Todavía no hay llamadas registradas a un proveedor de IA (por ejemplo, en modo simulado), así que no hay costo medido para proyectar.
        </p>
      )}
      {datos.hayModelosSinPrecio && <p style={{ margin: 0, fontSize: 14.5, color: "#92400E" }}>Hay modelos sin precio en la tabla: su costo no se suma.</p>}
      <p className="eia-muted" style={{ margin: 0, fontSize: 13.5 }}>
        {datos.alcance} Precios oficiales consultados el {datos.tablaDePrecios?.modelos?.[0]?.consultado ?? "—"} (tokens reales reportados por el proveedor).
      </p>
    </>
  );
}

// ─── 5. Impacto ──────────────────────────────────────────────────────────────
const AMBITOS = { escolar: "Escolar", hogar: "Hogar", personal: "Personal" };

function Impacto({ datos }) {
  const a = datos.alertas ?? {};
  const r = datos.retosDelCiclo ?? {};
  return (
    <>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Kpi valor={num(datos.uso?.familiasQueUsaronEdumon)} etiqueta="familias usaron Edumon" />
        <Kpi valor={num(datos.uso?.mensajesDeFamilias)} etiqueta={`mensajes en ${num(datos.uso?.conversaciones)} conversaciones`} />
        <Kpi valor={num(a.total)} etiqueta={`alertas (${num(a.porGravedad?.grave)} graves · ${num(a.porGravedad?.moderado)} moderadas)`} />
        <Kpi valor={pct100(a.porcentajeDentroDelPlazo)} etiqueta="atendidas dentro del plazo" tono="#047857" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14, fontSize: 15 }}>
        <div>
          <p className="eia-seccion-t">Alertas por ámbito</p>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {Object.entries(a.porAmbito ?? {}).map(([k, v]) => <li key={k}>{AMBITOS[k] ?? k}: <strong>{v.total}</strong> ({v.grave} graves, {v.moderado} moderadas)</li>)}
          </ul>
          <p style={{ margin: "8px 0 0" }}>
            Plazos: {a.plazosHoras?.grave} h graves · {a.plazosHoras?.moderado} h moderadas
            {a.plazosHoras?.pendienteValidacion ? " (pendientes de validación)" : ""}.
            Atendidas en plazo: {num(a.atendidasDentroDelPlazo)} · fuera de plazo: {num(a.fueraDelPlazo)} · sin atender aún en plazo: {num(a.sinAtenderAunEnPlazo)}.
          </p>
          {a.horasPromedioHastaPrimeraAtencion != null && (
            <p style={{ margin: "6px 0 0" }}>Tiempo promedio hasta la primera atención: <strong>{String(a.horasPromedioHastaPrimeraAtencion).replace(".", ",")} h</strong> (según la bitácora).</p>
          )}
        </div>
        <div>
          <p className="eia-seccion-t">Retos del ciclo</p>
          <p style={{ margin: 0 }}>{num(r.retos)} retos · {num(r.entregas)} entregas · participación {pct100(r.porcentajeParticipacion)}</p>
          {r.porCurso?.length > 0 && (
            <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
              {r.porCurso.map((c) => <li key={c.cursoId}>{c.nombre}: {c.retos} retos · {c.familiasQueParticiparon}/{c.familias} familias</li>)}
            </ul>
          )}
          {r.otrosCursos && <p className="eia-muted" style={{ margin: "6px 0 0", fontSize: 14 }}>Cursos con menos de {r.minimoFamiliasPorCurso} familias se agrupan para no exponerlas.</p>}
        </div>
      </div>
      {datos.periodo?.nota && <p className="eia-muted" style={{ margin: 0, fontSize: 13.5 }}>Periodo: {fechaHora(datos.periodo.desde)} – {fechaHora(datos.periodo.hasta)}. {datos.periodo.nota}</p>}
    </>
  );
}

function EtiquetaDemo() {
  if (!MODO_DEMO) return null;
  return (
    <span role="note" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: "#FEF3C7", border: "1.5px solid #D97706", color: "#78350F", fontWeight: 800, fontSize: 14 }}>
      <FlaskConical size={15} aria-hidden="true" /> Datos de demostración
    </span>
  );
}

export default function PanelEdumonIAPage() {
  const sesionId = useId();
  const mensajesId = useId();
  const [sesion, setSesion] = useState(SESION_VALIDACION);
  const [mensajesMes, setMensajesMes] = useState(10);
  const [mensajesAplicados, setMensajesAplicados] = useState(10);

  const salud = useCarga(() => edumonSaludIA(), []);
  const metricas = useCarga(() => edumonMetricasIA(), []);
  const retro = useCarga(() => edumonRetroalimentacion({ sesion }), [sesion]);
  const costos = useCarga(() => edumonCostos({ mensajesPorFamiliaMes: mensajesAplicados }), [mensajesAplicados]);
  const impacto = useCarga(() => edumonImpacto(), []);

  const sesiones = [...new Set([SESION_VALIDACION, ...(retro.datos?.sesionesValidacion ?? [])])];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
        <EdumonMascota size={76} expresion="ia" />
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Panel de Edumon IA</h1>
          <p className="eia-muted" style={{ fontSize: 15, margin: "4px 0 0" }}>
            Con qué IA responde Edumon, qué tan segura es, si les sirve a las familias, cuánto cuesta y qué impacto tiene.
          </p>
        </div>
      </div>

      <Seccion id="sec-proveedores" icono={Server} titulo="Proveedores de IA" carga={salud}>
        {(d) => <Proveedores datos={d} />}
      </Seccion>

      <Seccion id="sec-metricas" icono={ShieldCheck} titulo="Métricas de seguridad" carga={metricas}>
        {(d) => <Metricas datos={d} />}
      </Seccion>

      <Seccion
        id="sec-retro" icono={ThumbsUp} titulo="¿Les sirve Edumon?" carga={retro}
        extra={(
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <label htmlFor={sesionId} style={{ fontSize: 14, fontWeight: 700 }}>Sesión</label>
            <select id={sesionId} className="eia-focus" value={sesion} onChange={(e) => setSesion(e.target.value)}
              style={{ fontSize: 15, padding: "6px 10px", borderRadius: 10, border: "1.5px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)" }}>
              <option value="">Todas</option>
              {sesiones.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
      >
        {(d) => <Retroalimentacion datos={d} />}
      </Seccion>

      <Seccion
        id="sec-costo" icono={Coins} titulo="Costo de la IA" carga={costos}
        extra={(
          <form
            onSubmit={(e) => { e.preventDefault(); setMensajesAplicados(Math.max(0, Number(mensajesMes) || 0)); }}
            style={{ display: "flex", alignItems: "center", gap: 6 }}
          >
            <label htmlFor={mensajesId} style={{ fontSize: 14, fontWeight: 700 }}>Mensajes por familia al mes</label>
            <input id={mensajesId} className="eia-focus" type="number" min={0} max={1000} value={mensajesMes} onChange={(e) => setMensajesMes(e.target.value)}
              style={{ width: 80, fontSize: 15, padding: "6px 8px", borderRadius: 10, border: "1.5px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)" }} />
            <Button type="submit" size="sm">Recalcular</Button>
          </form>
        )}
      >
        {(d) => <Costo datos={d} />}
      </Seccion>

      <Seccion id="sec-impacto" icono={BarChart3} titulo="Impacto" carga={impacto} extra={<EtiquetaDemo />}>
        {(d) => <Impacto datos={d} />}
      </Seccion>

      <p className="eia-muted" style={{ margin: 0, fontSize: 13.5, display: "flex", gap: 6 }}>
        <AlertTriangle size={14} aria-hidden="true" style={{ flexShrink: 0, marginTop: 3 }} />
        Todos los números vienen del backend sin ajustar. Los de impacto son agregados de la institución, sin datos de familias.
      </p>
    </div>
  );
}
