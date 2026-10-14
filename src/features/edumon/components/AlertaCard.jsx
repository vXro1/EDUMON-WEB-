import { useState, useEffect } from "react";
import { ShieldAlert, Phone, Mail, User, Clock, ChevronRight } from "lucide-react";
import { Badge, Button } from "@/components";
import { CATEGORIAS_ALERTA } from "../data/rutasAtencion";

export const ESTADOS_ALERTA = {
  nueva: { label: "Nueva", variant: "error" },
  en_atencion: { label: "En atención", variant: "warning" },
  cerrada: { label: "Cerrada", variant: "neutral" },
};

const card = {
  background: "var(--color-surface)", borderRadius: 16,
  border: "1px solid var(--color-border)", boxShadow: "var(--clay-card)",
};

function formatFecha(fecha) {
  return new Date(fecha).toLocaleString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

// onVerDetalle: si viene, muestra el botón "Ver qué hacer" (uso en el listado)
export default function AlertaCard({ alerta, onActualizar, onVerDetalle }) {
  const [notas, setNotas] = useState(alerta.notas || "");
  const [guardando, setGuardando] = useState(null);
  const familia = alerta.usuarioId;

  useEffect(() => { setNotas(alerta.notas || ""); }, [alerta.notas]);

  const actualizar = async (cambios, accion) => {
    setGuardando(accion);
    try {
      await onActualizar(alerta._id, cambios);
    } finally {
      setGuardando(null);
    }
  };

  return (
    <div style={{ ...card, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <ShieldAlert size={18} color="#DC2626" />
        <strong style={{ fontSize: 15 }}>{CATEGORIAS_ALERTA[alerta.categoria] ?? alerta.categoria}</strong>
        <Badge variant={ESTADOS_ALERTA[alerta.estado]?.variant} size="sm" dot>{ESTADOS_ALERTA[alerta.estado]?.label}</Badge>
        <Badge variant={alerta.origen === "solicitada" ? "info" : "warning"} size="sm">
          {alerta.origen === "solicitada" ? "La familia pidió apoyo" : "Detectada por Edumon IA (caso grave)"}
        </Badge>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--color-text-muted)", display: "flex", alignItems: "center", gap: 4 }}>
          <Clock size={12} /> {formatFecha(alerta.createdAt)}
        </span>
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <User size={13} /> {familia ? `${familia.nombre} ${familia.apellido}` : "Familia"}
          {alerta.perfilId?.nombre && <em style={{ color: "var(--color-text-muted)" }}> (perfil: {alerta.perfilId.nombre})</em>}
        </span>
        {familia?.telefono && <a href={`tel:${familia.telefono}`} style={{ display: "flex", alignItems: "center", gap: 5 }}><Phone size={13} /> {familia.telefono}</a>}
        {familia?.correo && <a href={`mailto:${familia.correo}`} style={{ display: "flex", alignItems: "center", gap: 5 }}><Mail size={13} /> {familia.correo}</a>}
      </div>

      <blockquote style={{
        margin: 0, padding: "10px 14px", borderLeft: "3px solid #DC2626", borderRadius: 8,
        background: "rgba(239,68,68,0.05)", fontSize: 13.5, lineHeight: 1.5, whiteSpace: "pre-wrap",
      }}>
        “{alerta.mensajeDisparador}”
      </blockquote>

      <textarea
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
        placeholder="Notas del seguimiento (acciones, contacto con la familia, remisiones)…"
        rows={2}
        maxLength={2000}
        style={{
          resize: "vertical", fontSize: 13, padding: "8px 10px", borderRadius: 10, fontFamily: "inherit",
          border: "1px solid var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)",
        }}
      />

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Button size="sm" variant="outline" onClick={() => actualizar({ notas }, "notas")} loading={guardando === "notas"} disabled={notas === (alerta.notas || "")}>
          Guardar notas
        </Button>
        {alerta.estado === "nueva" && (
          <Button size="sm" variant="warning" onClick={() => actualizar({ estado: "en_atencion", notas }, "atender")} loading={guardando === "atender"}>
            Marcar en atención
          </Button>
        )}
        {alerta.estado !== "cerrada" && (
          <Button size="sm" variant="secondary" onClick={() => actualizar({ estado: "cerrada", notas }, "cerrar")} loading={guardando === "cerrar"}>
            Cerrar caso
          </Button>
        )}
        {alerta.atendidaPor && (
          <span style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Atendida por {alerta.atendidaPor.nombre} {alerta.atendidaPor.apellido}
          </span>
        )}
        {onVerDetalle && (
          <Button size="sm" variant="ghost-primary" onClick={() => onVerDetalle(alerta._id)} rightIcon={<ChevronRight size={14} />} style={{ marginLeft: "auto" }}>
            Ver qué hacer
          </Button>
        )}
      </div>
    </div>
  );
}
