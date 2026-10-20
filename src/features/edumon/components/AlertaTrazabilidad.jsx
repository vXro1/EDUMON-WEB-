import { History, Cpu, HandHeart, CircleDot, CheckCircle2, StickyNote, Clock } from "lucide-react";

const card = {
  background: "var(--color-surface)", borderRadius: 16,
  border: "1px solid var(--color-border)", boxShadow: "var(--clay-card)", padding: 20,
};

const GRAVEDAD = { grave: "grave", moderado: "moderado" };
const ESTADO = { nueva: "Nueva", en_atencion: "En atención", cerrada: "Cerrada" };

const fechaHora = (f) => (f ? new Date(f).toLocaleString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");
const nombre = (u) => (u ? `${u.nombre ?? ""} ${u.apellido ?? ""}`.trim() : null);

// "2 h 15 min", "3 días"
function duracion(desde, hasta) {
  const min = Math.round((new Date(hasta) - new Date(desde)) / 60000);
  if (min < 60) return `${min} min`;
  if (min < 60 * 48) return `${Math.floor(min / 60)} h${min % 60 ? ` ${min % 60} min` : ""}`;
  return `${Math.round(min / 1440)} días`;
}

// explicación en lenguaje claro de por qué existe la alerta
function explicacion(alerta) {
  const d = alerta.deteccion;
  if (alerta.origen === "solicitada") {
    return {
      icono: HandHeart,
      titulo: "La familia pidió que la contactaran",
      detalle: "Edumon le ofreció apoyo y la familia aceptó que orientación y sus docentes la contacten.",
    };
  }
  if (!d) return { icono: Cpu, titulo: "Detectada por Edumon", detalle: "Esta alerta es anterior al registro detallado de la detección." };
  const regla = d.reglaSegura || d.reglaDudosa;
  const porRegla = regla?.patron ? `la frase "${regla.patron}" (${GRAVEDAD[regla.gravedad] ?? regla.gravedad})` : null;
  const porIA = d.llm ? `el modelo de IA la clasificó como riesgo ${GRAVEDAD[d.llm.gravedad] ?? d.llm.gravedad}` : null;
  const textos = {
    regla: `La red de seguridad de Edumon encontró ${porRegla}.${porIA ? ` Además, ${porIA}.` : ""}`,
    regla_confirmada_por_ia: `Edumon encontró ${porRegla} y ${porIA}, así que lo confirmó.`,
    ia: `${porIA ? porIA.charAt(0).toUpperCase() + porIA.slice(1) : "El modelo de IA detectó riesgo"} a partir del mensaje.`,
  };
  return {
    icono: Cpu,
    titulo: "Cómo la detectó Edumon",
    detalle: textos[d.decidio] ?? "Edumon detectó un posible riesgo en el mensaje.",
    tecnico: [
      d.fuente === "ia" ? `IA + reglas · modelo ${d.modelo ?? "—"}` : "Solo reglas (la IA no estaba disponible)",
      d.errorIA && `error de la IA: ${d.errorIA}`,
    ].filter(Boolean).join(" · "),
  };
}

const ICONO_ACCION = { creada: CircleDot, estado: CheckCircle2, nota: StickyNote };

/**
 * Por qué existe la alerta + la línea de tiempo de su atención (nunca se reescribe).
 * soloHistorial: la explicación ya la muestra AlertaExplicacion (desde el backend).
 */
export default function AlertaTrazabilidad({ alerta, soloHistorial = false }) {
  const exp = explicacion(alerta);
  const Icono = exp.icono;
  const historial = alerta.historial?.length
    ? alerta.historial
    : [{ accion: "creada", estado: "nueva", en: alerta.createdAt, nota: "" }];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, marginTop: 16 }}>
      {!soloHistorial && <div style={card}>
        <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 8 }}>
          <Icono size={18} color="var(--color-primary)" /> {exp.titulo}
        </h2>
        <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6 }}>{exp.detalle}</p>
        {exp.tecnico && <p style={{ margin: "8px 0 0", fontSize: 11.5, color: "var(--color-text-muted)" }}>{exp.tecnico}</p>}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 14, fontSize: 12.5 }}>
          <span><span style={{ color: "var(--color-text-muted)" }}>Creada: </span><strong>{fechaHora(alerta.createdAt)}</strong></span>
          {alerta.atendidaEn && (
            <span><span style={{ color: "var(--color-text-muted)" }}>Primera atención en: </span><strong>{duracion(alerta.createdAt, alerta.atendidaEn)}</strong></span>
          )}
          {alerta.cerradaEn && (
            <span><span style={{ color: "var(--color-text-muted)" }}>Cerrada en: </span><strong>{duracion(alerta.createdAt, alerta.cerradaEn)}</strong></span>
          )}
          {!alerta.atendidaEn && (
            <span style={{ color: "#DC2626", fontWeight: 700, display: "inline-flex", gap: 4, alignItems: "center" }}>
              <Clock size={13} /> Sin atender hace {duracion(alerta.createdAt, new Date())}
            </span>
          )}
        </div>
      </div>}

      <div style={card}>
        <h2 style={{ fontSize: 15, fontWeight: 800, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
          <History size={18} color="var(--color-primary)" /> Historial de atención
        </h2>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {historial.map((h, i) => {
            const IconoAccion = ICONO_ACCION[h.accion] ?? CircleDot;
            const quien = nombre(h.por) ?? (h.accion === "creada" ? "Edumon IA" : "—");
            return (
              <div key={`${h.en}-${i}`} style={{ display: "grid", gridTemplateColumns: "22px 1fr", gap: 10, paddingBottom: i < historial.length - 1 ? 12 : 0, position: "relative" }}>
                {i < historial.length - 1 && <span style={{ position: "absolute", left: 10, top: 22, bottom: 0, width: 2, background: "var(--color-border)" }} />}
                <IconoAccion size={20} color={h.estado === "cerrada" ? "#059669" : "var(--color-primary)"} style={{ background: "var(--color-surface)", position: "relative" }} />
                <div style={{ fontSize: 15, lineHeight: 1.5 }}>
                  <strong>
                    {h.accion === "creada" ? "Alerta creada" : h.accion === "estado" ? `Pasó a "${ESTADO[h.estado] ?? h.estado}"` : "Nota agregada"}
                  </strong>
                  <span style={{ color: "var(--color-text-muted)" }}> · {quien} · {fechaHora(h.en)}</span>
                  {h.nota && <div style={{ color: "var(--color-text-muted)", marginTop: 2, whiteSpace: "pre-wrap" }}>{h.nota}</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
