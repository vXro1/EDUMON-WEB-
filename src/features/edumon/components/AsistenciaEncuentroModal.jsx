import { useState, useEffect, useMemo } from "react";
import { Users, Monitor, UserCheck, UserX, CheckCheck, CalendarDays } from "lucide-react";
import { AppModal, Button } from "@/components";
import { humanizeError } from "@/utils/humanizeError";
import { asistenciaGet, asistenciaMarcar } from "../services/edumonService";

const OPCIONES = [
  { valor: "presencial", label: "Presencial", icono: UserCheck, color: "#059669" },
  { valor: "virtual", label: "Virtual", icono: Monitor, color: "#0284C7" },
  { valor: "no", label: "No vino", icono: UserX, color: "#DC2626" },
];

const aOpcion = (f) => (f.asistio === true ? f.modalidad ?? "presencial" : f.asistio === false ? "no" : null);
const fecha = (f) => (f ? new Date(f).toLocaleString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");

/**
 * El docente (o el admin) marca quién asistió a un encuentro de escuela de padres.
 * onGuardado(resumen) se llama después de guardar.
 */
export default function AsistenciaEncuentroModal({ eventoId, isOpen, onClose, onGuardado }) {
  const [datos, setDatos] = useState(null);
  const [marcas, setMarcas] = useState({}); // usuarioId → "presencial" | "virtual" | "no"
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!isOpen || !eventoId) return;
    setDatos(null);
    setError("");
    asistenciaGet(eventoId)
      .then((r) => {
        setDatos(r);
        setMarcas(Object.fromEntries(r.grupos.flatMap((g) => g.familias).map((f) => [f.usuarioId, aOpcion(f)])));
      })
      .catch((err) => setError(humanizeError(err)));
  }, [isOpen, eventoId]);

  const familias = useMemo(() => datos?.grupos.flatMap((g) => g.familias) ?? [], [datos]);
  const conteo = {
    asistieron: familias.filter((f) => ["presencial", "virtual"].includes(marcas[f.usuarioId])).length,
    sinMarcar: familias.filter((f) => !marcas[f.usuarioId]).length,
  };
  const cambios = familias.filter((f) => marcas[f.usuarioId] && marcas[f.usuarioId] !== aOpcion(f));

  const guardar = async () => {
    setGuardando(true);
    setError("");
    try {
      const r = await asistenciaMarcar(eventoId, cambios.map((f) => ({
        usuarioId: f.usuarioId,
        asistio: marcas[f.usuarioId] !== "no",
        ...(marcas[f.usuarioId] !== "no" && { modalidad: marcas[f.usuarioId] }),
      })));
      setDatos(r);
      onGuardado?.(r.resumen);
      onClose();
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setGuardando(false);
    }
  };

  const ev = datos?.evento;

  return (
    <AppModal isOpen={isOpen} onClose={onClose} size="lg">
      <AppModal.Header
        title="Asistencia al encuentro"
        description={ev ? `${ev.titulo} · ${fecha(ev.fechaInicio)}${ev.ubicacion ? ` · ${ev.ubicacion}` : ""}` : "Escuela de padres"}
        onClose={onClose}
      />
      <AppModal.Body>
        {error && <p style={{ margin: "0 0 10px", color: "var(--color-error-hover)", fontSize: 13 }}>{error}</p>}
        {!datos && !error && <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Cargando familias…</p>}
        {datos && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10, fontSize: 13 }}>
              <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Users size={15} /> <strong>{familias.length}</strong> familias</span>
              <span style={{ color: "#059669", fontWeight: 700 }}>{conteo.asistieron} asistieron</span>
              {conteo.sinMarcar > 0 && <span style={{ color: "#B45309", fontWeight: 700 }}>{conteo.sinMarcar} sin marcar</span>}
              <span style={{ flex: 1 }} />
              <Button size="sm" variant="ghost" leftIcon={<CheckCheck size={15} />}
                onClick={() => setMarcas(Object.fromEntries(familias.map((f) => [f.usuarioId, marcas[f.usuarioId] ?? "presencial"])))}>
                Marcar el resto como presencial
              </Button>
            </div>

            {datos.grupos.map((g) => (
              <div key={g.cursoId}>
                {datos.grupos.length > 1 && <div style={{ fontSize: 12, fontWeight: 800, color: "var(--color-text-muted)", margin: "0 0 6px", letterSpacing: ".04em" }}>{g.nombre.toUpperCase()}</div>}
                {g.familias.length === 0 && <p style={{ fontSize: 13, color: "var(--color-text-muted)" }}>Este grupo no tiene familias.</p>}
                <div style={{ border: "1px solid var(--color-border)", borderRadius: 12, overflow: "hidden" }}>
                  {g.familias.map((f, i) => (
                    <div key={f.usuarioId} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", flexWrap: "wrap",
                      borderTop: i ? "1px solid var(--color-border)" : "none",
                      background: marcas[f.usuarioId] ? "var(--color-surface)" : "rgba(245,158,11,.05)",
                    }}>
                      <div style={{ flex: "1 1 180px", minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{f.nombre}</div>
                        {f.marcadoPor && (
                          <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>Marcó {f.marcadoPor} · {fecha(f.marcadoEn)}</div>
                        )}
                      </div>
                      <div style={{ display: "inline-flex", border: "1px solid var(--color-border)", borderRadius: 10, overflow: "hidden" }}>
                        {OPCIONES.map((o) => {
                          const activa = marcas[f.usuarioId] === o.valor;
                          const Icono = o.icono;
                          return (
                            <button
                              key={o.valor}
                              type="button"
                              aria-pressed={activa}
                              onClick={() => setMarcas((m) => ({ ...m, [f.usuarioId]: o.valor }))}
                              style={{
                                display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 10px", border: 0, cursor: "pointer",
                                fontSize: 12, fontWeight: 700, fontFamily: "inherit",
                                background: activa ? o.color : "var(--color-surface)", color: activa ? "#fff" : "var(--color-text-muted)",
                              }}
                            >
                              <Icono size={14} /> {o.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <p style={{ margin: 0, fontSize: 11.5, color: "var(--color-text-muted)", display: "flex", gap: 6, alignItems: "center" }}>
              <CalendarDays size={13} /> Queda registrado quién marcó y cuándo; las correcciones se guardan en el historial.
            </p>
          </div>
        )}
      </AppModal.Body>
      <AppModal.Footer>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={guardar} loading={guardando} disabled={!cambios.length}>
          {cambios.length ? `Guardar (${cambios.length})` : "Sin cambios"}
        </Button>
      </AppModal.Footer>
    </AppModal>
  );
}
