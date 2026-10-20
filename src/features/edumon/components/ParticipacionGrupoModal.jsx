import { useState, useEffect, useCallback } from "react";
import { Download, CalendarCheck, CheckCircle2, Circle, ClipboardCheck, AlertTriangle, Monitor, UserCheck, UserX, Minus } from "lucide-react";
import { AppModal, Button } from "@/components";
import { humanizeError } from "@/utils/humanizeError";
import { descargarXlsx } from "@/utils/xlsxWriter";
import AsistenciaEncuentroModal from "./AsistenciaEncuentroModal";
import { participacionDetalle } from "../services/edumonService";

const fechaCorta = (f) => (f ? new Date(f).toLocaleDateString("es-CO", { day: "numeric", month: "short" }) : "");

const MARCA_ENCUENTRO = {
  presencial: { icono: UserCheck, color: "#059669", texto: "Presencial" },
  virtual: { icono: Monitor, color: "#0284C7", texto: "Virtual" },
  no: { icono: UserX, color: "#DC2626", texto: "No asistió" },
};

const marcaDe = (m, encuentro) => {
  if (!encuentro.realizado) return { clave: "programado", texto: "Programado" };
  if (m.asistio === true) return { clave: m.modalidad ?? "presencial", texto: MARCA_ENCUENTRO[m.modalidad ?? "presencial"].texto };
  if (m.asistio === false) return { clave: "no", texto: "No asistió" };
  return { clave: "sin", texto: "Sin marcar" };
};

function Indicador({ valor, etiqueta, color }) {
  return (
    <div style={{ padding: "10px 12px", borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
      <div style={{ fontSize: 20, fontWeight: 900, color }}>{valor}</div>
      <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{etiqueta}</div>
    </div>
  );
}

/** Trazabilidad nominal de un grupo: qué entregó y a qué asistió cada familia. */
export default function ParticipacionGrupoModal({ cursoId, isOpen, onClose, onCambio }) {
  const [d, setD] = useState(null);
  const [error, setError] = useState("");
  const [asistenciaDe, setAsistenciaDe] = useState(null); // eventoId abierto

  const cargar = useCallback(() => {
    setError("");
    return participacionDetalle(cursoId).then(setD).catch((err) => setError(humanizeError(err)));
  }, [cursoId]);

  useEffect(() => { if (isOpen && cursoId) { setD(null); cargar(); } }, [isOpen, cursoId, cargar]);

  const participaron = d?.familias.filter((f) => f.participo).length ?? 0;
  const pct = d?.familias.length ? Math.round((participaron / d.familias.length) * 100) : 0;
  const encuentrosPeriodo = d?.encuentros.filter((e) => e.enPeriodo) ?? [];

  const descargar = () => {
    const encabezado = [
      "Familia", "Teléfono",
      ...d.retos.map((r) => `Reto: ${r.titulo}`),
      ...encuentrosPeriodo.map((e) => `Encuentro: ${e.titulo} (${fechaCorta(e.fechaInicio)})`),
      "Participó",
    ];
    const filas = d.familias.map((f) => [
      f.nombre, f.telefono ?? "",
      ...f.retos.map((r) => (r.entregadoEn ? `Entregó ${fechaCorta(r.entregadoEn)}` : "No entregó")),
      ...encuentrosPeriodo.map((e) => marcaDe(f.encuentros.find((m) => String(m.eventoId) === String(e._id)) ?? {}, e).texto),
      f.participo ? "Sí" : "No",
    ]);
    const resumen = [
      [], ["Resumen", ""], ["Familias", String(d.familias.length)], ["Participaron (entregaron un reto o asistieron)", `${participaron} (${pct}%)`],
      ["Periodo", `${d.periodo.nombre}: ${fechaCorta(d.periodo.inicio)} – ${fechaCorta(d.periodo.fin)}`],
    ];
    descargarXlsx([encabezado, ...filas, ...resumen], `participacion-${d.curso.nombre.replace(/\s+/g, "-").toLowerCase()}.xlsx`, "Participación");
  };

  return (
    <>
      <AppModal isOpen={isOpen && !asistenciaDe} onClose={onClose} size="xl">
        <AppModal.Header
          title={d ? `Participación · ${d.curso.nombre}` : "Participación del grupo"}
          description={d ? `${d.periodo.nombre} (${fechaCorta(d.periodo.inicio)} – ${fechaCorta(d.periodo.fin)}) · familia que entregó un reto o asistió a un encuentro` : ""}
          onClose={onClose}
        />
        <AppModal.Body>
          {error && <p style={{ color: "var(--color-error-hover)", fontSize: 13 }}>{error}</p>}
          {!d && !error && <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Cargando…</p>}
          {d && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                <Indicador valor={`${pct}%`} etiqueta={`participaron (${participaron} de ${d.familias.length})`} color={pct >= 60 ? "#059669" : pct >= 30 ? "#D97706" : "#DC2626"} />
                <Indicador valor={d.familias.filter((f) => f.retos.some((r) => r.entregadoEn)).length} etiqueta="entregaron un reto" />
                <Indicador valor={d.familias.filter((f) => f.encuentros.some((m) => m.asistio && encuentrosPeriodo.some((e) => String(e._id) === String(m.eventoId)))).length} etiqueta="asistieron a un encuentro" />
                <Indicador valor={`${d.encuentros.filter((e) => e.realizado).length}`} etiqueta="encuentros realizados este año" />
              </div>

              <section>
                <h3 style={{ margin: "0 0 8px", fontSize: 14, fontWeight: 800, display: "flex", gap: 7, alignItems: "center" }}><CalendarCheck size={16} color="#0284C7" /> Encuentros de escuela de padres</h3>
                {d.encuentros.length === 0 && <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-muted)" }}>No hay encuentros de escuela de padres este año. Créalos en Eventos con la categoría "Escuela de padres".</p>}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {d.encuentros.map((e) => (
                    <div key={e._id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, border: "1px solid var(--color-border)", flexWrap: "wrap" }}>
                      <div style={{ flex: "1 1 220px", minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{e.titulo}</div>
                        <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>{fechaCorta(e.fechaInicio)}{!e.enPeriodo && " · fuera del periodo actual"}</div>
                      </div>
                      {!e.realizado
                        ? <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>Programado</span>
                        : e.asistenciaMarcada
                          ? <span style={{ fontSize: 12, color: "#059669", fontWeight: 700, display: "inline-flex", gap: 4, alignItems: "center" }}><CheckCircle2 size={14} /> Asistencia marcada</span>
                          : <span style={{ fontSize: 12, color: "#B45309", fontWeight: 700, display: "inline-flex", gap: 4, alignItems: "center" }}><AlertTriangle size={14} /> Falta marcar asistencia</span>}
                      {e.realizado && (
                        <Button size="sm" variant={e.asistenciaMarcada ? "ghost" : "primary"} onClick={() => setAsistenciaDe(e._id)}>
                          {e.asistenciaMarcada ? "Ver o corregir" : "Marcar asistencia"}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                  <h3 style={{ margin: 0, fontSize: 14, fontWeight: 800, display: "flex", gap: 7, alignItems: "center", flex: 1 }}><ClipboardCheck size={16} color="#0284C7" /> Familias</h3>
                  <Button size="sm" variant="ghost" leftIcon={<Download size={15} />} onClick={descargar}>Descargar Excel</Button>
                </div>
                <div style={{ overflowX: "auto", border: "1px solid var(--color-border)", borderRadius: 12 }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
                    <thead>
                      <tr style={{ background: "var(--color-bg)", textAlign: "left" }}>
                        <th style={{ padding: "8px 12px", fontWeight: 800 }}>Familia</th>
                        {d.retos.map((r) => <th key={r._id} title={r.titulo} style={{ padding: "8px 10px", fontWeight: 700, maxWidth: 140, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>📝 {r.titulo}</th>)}
                        {encuentrosPeriodo.map((e) => <th key={e._id} title={e.titulo} style={{ padding: "8px 10px", fontWeight: 700, whiteSpace: "nowrap" }}>📅 {fechaCorta(e.fechaInicio)}</th>)}
                        <th style={{ padding: "8px 12px", fontWeight: 800 }}>Participó</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.familias.map((f) => (
                        <tr key={f.usuarioId} style={{ borderTop: "1px solid var(--color-border)" }}>
                          <td style={{ padding: "8px 12px", fontWeight: 600, whiteSpace: "nowrap" }}>{f.nombre}</td>
                          {f.retos.map((r) => (
                            <td key={r.tareaId} style={{ padding: "8px 10px" }}>
                              {r.entregadoEn
                                ? <span style={{ color: "#059669", display: "inline-flex", gap: 4, alignItems: "center" }}><CheckCircle2 size={14} /> {fechaCorta(r.entregadoEn)}</span>
                                : <Minus size={14} color="var(--color-text-muted)" />}
                            </td>
                          ))}
                          {encuentrosPeriodo.map((e) => {
                            const m = marcaDe(f.encuentros.find((x) => String(x.eventoId) === String(e._id)) ?? {}, e);
                            const cfg = MARCA_ENCUENTRO[m.clave];
                            const Icono = cfg?.icono ?? Circle;
                            return (
                              <td key={e._id} style={{ padding: "8px 10px" }} title={m.texto}>
                                <span style={{ color: cfg?.color ?? "var(--color-text-muted)", display: "inline-flex", gap: 4, alignItems: "center" }}>
                                  <Icono size={14} /> {cfg ? cfg.texto : m.texto}
                                </span>
                              </td>
                            );
                          })}
                          <td style={{ padding: "8px 12px", fontWeight: 700, color: f.participo ? "#059669" : "#DC2626" }}>{f.participo ? "Sí" : "No"}</td>
                        </tr>
                      ))}
                      {d.familias.length === 0 && <tr><td style={{ padding: 12, color: "var(--color-text-muted)" }}>Este grupo no tiene familias.</td></tr>}
                    </tbody>
                  </table>
                </div>
                {d.retos.length === 0 && <p style={{ margin: "6px 0 0", fontSize: 12, color: "var(--color-text-muted)" }}>No hay retos de escuela de padres en este periodo.</p>}
              </section>
            </div>
          )}
        </AppModal.Body>
      </AppModal>

      <AsistenciaEncuentroModal
        eventoId={asistenciaDe}
        isOpen={Boolean(asistenciaDe)}
        onClose={() => setAsistenciaDe(null)}
        onGuardado={() => { cargar(); onCambio?.(); }}
      />
    </>
  );
}
