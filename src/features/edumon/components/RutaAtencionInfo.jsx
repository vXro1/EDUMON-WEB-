import { Scale, ExternalLink, AlertTriangle } from "lucide-react";
import "../edumon-ia.css";

const AMBITOS = { escolar: "Escolar", hogar: "Hogar", personal: "Personal (salud mental)" };

const NOTA_PENDIENTE = "Pendiente de validación por orientación/convivencia";

/** Etiqueta corta de la ruta: "Escolar · Tipo II" o "Hogar · protocolo". */
export function etiquetaRuta(ruta) {
  if (!ruta) return null;
  const ambito = AMBITOS[ruta.ambito] ?? ruta.ambito;
  if (ruta.ambito === "escolar" && ruta.tipoLey1620) return `${ambito} · Tipo ${ruta.tipoLey1620} (Ley 1620)`;
  return `${ambito} · protocolo`;
}

/** Celda compacta para el tablero: ámbito, tipo o protocolo y la nota de validación, siempre. */
export function RutaResumen({ ruta }) {
  if (!ruta) {
    return (
      <div style={{ fontSize: 13.5 }}>
        <span className="eia-muted">Sin ruta asignada (alerta anterior a la clasificación)</span>
        <div style={{ fontSize: 12.5, color: "#92400E", marginTop: 4 }}>{NOTA_PENDIENTE}</div>
      </div>
    );
  }
  return (
    <div style={{ fontSize: 14, lineHeight: 1.45 }}>
      <strong>{etiquetaRuta(ruta)}</strong>
      {ruta.protocolo && <div style={{ fontSize: 13.5, marginTop: 2 }}>{ruta.protocolo}</div>}
      <div style={{ fontSize: 12.5, color: "#92400E", fontWeight: 700, marginTop: 4 }}>{ruta.nota || NOTA_PENDIENTE}</div>
    </div>
  );
}

/** Ruta completa con criterio y fundamento normativo (norma, artículo, enlace oficial y texto literal). */
export default function RutaAtencionInfo({ ruta, titulo = "Ruta de atención sugerida" }) {
  if (!ruta) return null;
  return (
    <section aria-label={titulo} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
        <Scale size={18} aria-hidden="true" /> {titulo}
      </h3>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <span className="eia-chip">Ámbito: {AMBITOS[ruta.ambito] ?? ruta.ambito}</span>
        {ruta.ambito === "escolar" && ruta.tipoLey1620 && <span className="eia-chip">Tipo {ruta.tipoLey1620} · Ley 1620</span>}
      </div>
      {ruta.protocolo && <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55 }}><strong>Protocolo:</strong> {ruta.protocolo}</p>}
      {ruta.criterio && <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.55 }}><strong>Por qué esta ruta:</strong> {ruta.criterio}</p>}

      {ruta.fundamento?.length > 0 && (
        <div>
          <p className="eia-seccion-t">Fundamento normativo</p>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            {ruta.fundamento.map((f, i) => (
              <li key={`${f.norma}-${f.articulo}-${i}`} style={{ padding: "10px 12px", borderRadius: 12, background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
                <div style={{ fontSize: 14.5, fontWeight: 800 }}>
                  {f.norma}{f.articulo ? `, ${f.articulo}` : ""}
                </div>
                {f.texto && (
                  <blockquote style={{ margin: "6px 0", paddingLeft: 10, borderLeft: "3px solid var(--color-border)", fontSize: 14, lineHeight: 1.55 }}>
                    “{f.texto}”
                  </blockquote>
                )}
                {f.fuente && (
                  <a href={f.fuente} target="_blank" rel="noreferrer" className="eia-focus" style={{ fontSize: 14, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
                    Ver texto oficial <ExternalLink size={14} aria-hidden="true" />
                    <span className="sr-only"> (se abre en una pestaña nueva)</span>
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {ruta.fuentePendiente && (
        <p style={{ margin: 0, fontSize: 14, display: "flex", gap: 6, color: "#92400E" }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
          Fuente oficial pendiente: {ruta.fuentePendiente}
        </p>
      )}

      <p role="note" style={{ margin: 0, padding: "8px 12px", borderRadius: 10, background: "#FFFBEB", border: "1px solid #FCD34D", color: "#78350F", fontSize: 14, fontWeight: 700 }}>
        {ruta.nota || NOTA_PENDIENTE}
      </p>
    </section>
  );
}
