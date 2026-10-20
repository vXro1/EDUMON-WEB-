import { useState, useEffect } from "react";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components";
import { usersGetAll } from "@/services/usersService";
import { humanizeError } from "@/utils/humanizeError";
import { asignarResponsableConvivencia } from "../services/edumonService";

// Admin del colegio: elige el docente que recibe las alertas de riesgo de Edumon.
export default function ResponsableConvivenciaCard({ responsableActual, onCambio }) {
  const [docentes, setDocentes] = useState([]);
  const [seleccion, setSeleccion] = useState(responsableActual?._id ?? "");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: "", error: false });

  useEffect(() => { setSeleccion(responsableActual?._id ?? ""); }, [responsableActual?._id]);

  useEffect(() => {
    usersGetAll({ rol: "docente", limit: 200 })
      .then((res) => setDocentes((res.users ?? []).filter((d) => d.estado !== "suspendido")))
      .catch(() => setDocentes([]));
  }, []);

  const guardar = async () => {
    setGuardando(true);
    setMensaje({ texto: "", error: false });
    try {
      const { institucion, message } = await asignarResponsableConvivencia(seleccion || null);
      onCambio?.(institucion);
      setMensaje({ texto: message, error: false });
    } catch (err) {
      setMensaje({ texto: humanizeError(err), error: true });
    } finally {
      setGuardando(false);
    }
  };

  const sinCambios = seleccion === (responsableActual?._id ?? "");

  return (
    <div style={{ background: "var(--color-surface)", borderRadius: 16, border: "1px solid var(--color-border)", boxShadow: "var(--clay-card)" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", alignItems: "center", gap: 8 }}>
        <ShieldAlert size={16} color="#DC2626" />
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "var(--color-text)", margin: 0 }}>Responsable de convivencia (Edumon)</h2>
      </div>
      <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <p style={{ fontSize: 12.5, color: "var(--color-text-muted)", margin: 0 }}>
          Recibe las alertas cuando Edumon detecta una posible situación de riesgo en una familia.
          Si no eliges a nadie, las alertas te llegan a ti.
        </p>
        <select
          value={seleccion}
          onChange={(e) => setSeleccion(e.target.value)}
          style={{
            padding: "9px 10px", borderRadius: 10, fontSize: 13.5,
            border: "1px solid var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)",
          }}
        >
          <option value="">Sin designar (las recibe el administrador)</option>
          {docentes.map((d) => (
            <option key={d._id} value={d._id}>{d.nombre} {d.apellido}</option>
          ))}
        </select>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Button size="sm" onClick={guardar} loading={guardando} disabled={sinCambios}>Guardar</Button>
          {mensaje.texto && (
            <span style={{ fontSize: 12.5, color: mensaje.error ? "var(--color-error-hover)" : "var(--edu-green-600)" }}>
              {mensaje.texto}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
