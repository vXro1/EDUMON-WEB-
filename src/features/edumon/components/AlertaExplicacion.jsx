import { useState, useEffect } from "react";
import { Cpu, SpellCheck } from "lucide-react";
import RutaAtencionInfo from "./RutaAtencionInfo";
import { edumonExplicacionAlerta, mensajeErrorIA } from "../services/edumonService";
import "../edumon-ia.css";

const DECIDIO = {
  regla: "Una regla de seguridad revisada por personas",
  modelo: "El modelo de IA",
  ambos: "La regla de seguridad y el modelo de IA (coincidieron)",
  familia: "La familia pidió que la contactaran",
};

/** "Por qué se generó esta alerta" (GET /ia/alertas/:id/explicacion) + ruta con fundamento normativo. */
export default function AlertaExplicacion({ alertaId, rutaRespaldo }) {
  const [estado, setEstado] = useState({ cargando: true, exp: null, error: "" });

  useEffect(() => {
    let vivo = true;
    edumonExplicacionAlerta(alertaId)
      .then(({ explicacion }) => vivo && setEstado({ cargando: false, exp: explicacion, error: "" }))
      .catch((err) => vivo && setEstado({ cargando: false, exp: null, error: mensajeErrorIA(err, "No pudimos cargar la explicación de esta alerta.") }));
    return () => { vivo = false; };
  }, [alertaId]);

  const { exp } = estado;
  const regla = exp?.clasificacion?.reglaSegura || exp?.clasificacion?.reglaDudosa;
  const ruta = exp?.rutaAtencion ?? rutaRespaldo;

  return (
    <section className="eia-card" aria-label="Por qué se generó esta alerta" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
        <Cpu size={20} aria-hidden="true" /> Por qué se generó esta alerta
      </h2>
      {estado.cargando && <p role="status" style={{ margin: 0, fontSize: 15 }}>Cargando la explicación…</p>}
      {estado.error && <p role="alert" style={{ margin: 0, fontSize: 15, color: "#B91C1C" }}>{estado.error}</p>}
      {exp && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 15, lineHeight: 1.6 }}>
          {exp.resumen && (
            <p style={{ margin: 0, padding: "12px 14px", borderRadius: 12, background: "#F0F9FF", border: "1px solid #7DD3FC", fontSize: 16 }}>{exp.resumen}</p>
          )}
          <p style={{ margin: 0 }}><strong>Quién decidió:</strong> {DECIDIO[exp.decidio] ?? "No se registró"}</p>
          {regla?.fragmento && (
            <p style={{ margin: 0 }}>
              <strong>Frase detectada:</strong> “{regla.fragmento}”{regla.aproximado ? " (después de corregir la ortografía)" : ""}
            </p>
          )}
          {regla?.correcciones?.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <SpellCheck size={16} aria-hidden="true" /> <strong>Ortografía corregida:</strong>
              {regla.correcciones.map((c) => (
                <span key={`${c.de}-${c.a}`} className="eia-chip" style={{ fontSize: 15 }}>
                  <s>{c.de}</s> <span aria-hidden="true">→</span><span className="sr-only">se corrigió a</span> <strong>{c.a}</strong>
                </span>
              ))}
            </div>
          )}
          {exp.clasificacion?.modeloDijo && (
            <p style={{ margin: 0 }} className="eia-muted">
              El modelo de IA lo clasificó como: {exp.clasificacion.modeloDijo.categoria ?? "—"} ({exp.clasificacion.modeloDijo.gravedad ?? "sin gravedad"}).
            </p>
          )}
        </div>
      )}
      {(exp || estado.error) && ruta && <RutaAtencionInfo ruta={ruta} />}
    </section>
  );
}
