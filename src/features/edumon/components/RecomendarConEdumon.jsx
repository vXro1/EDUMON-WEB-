import { useState, useEffect } from "react";
import EdumonMascota from "./EdumonMascota";
import { edumonGetTemas } from "../services/edumonService";

// una sola petición de temas por sesión, compartida entre formularios
let temasPromise = null;
export const cargarTemas = () => {
  temasPromise ??= edumonGetTemas().then(({ ejes }) => ejes).catch(() => { temasPromise = null; return []; });
  return temasPromise;
};

const campo = {
  width: "100%", fontSize: 13, padding: "8px 10px", borderRadius: 10, fontFamily: "inherit",
  border: "1px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)",
  boxSizing: "border-box",
};

/**
 * El docente decide si Edumon recomienda este reto o evento en el chat de las
 * familias, y sobre qué tema. value: { eje, subtema, tema } | null
 */
export default function RecomendarConEdumon({ value, onChange, que = "este evento" }) {
  const [temas, setTemas] = useState([]);
  useEffect(() => { cargarTemas().then(setTemas); }, []);

  const activo = Boolean(value);
  const eje = temas.find((e) => e.valor === value?.eje);

  return (
    <div style={{
      border: "1px solid rgba(14,165,233,0.35)", background: "rgba(14,165,233,0.06)",
      borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 10,
    }}>
      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <EdumonMascota size={34} circulo />
        <input
          type="checkbox"
          checked={activo}
          onChange={(e) => onChange(e.target.checked ? { eje: temas[0]?.valor ?? "crianza_amorosa", subtema: null, tema: "" } : null)}
        />
        <span style={{ fontSize: 13, lineHeight: 1.4 }}>
          <strong>Recomendar con Edumon</strong>
          <span style={{ display: "block", color: "var(--color-text-muted)", fontSize: 12 }}>
            Edumon sugerirá {que} a las familias que le pregunten por este tema.
          </span>
        </span>
      </label>

      {activo && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8 }}>
          <select style={campo} value={value.eje} onChange={(e) => onChange({ ...value, eje: e.target.value, subtema: null })} aria-label="Eje">
            {temas.map((e) => <option key={e.valor} value={e.valor}>{e.label}</option>)}
          </select>
          <select style={campo} value={value.subtema ?? ""} onChange={(e) => onChange({ ...value, subtema: e.target.value || null })} aria-label="Tema">
            <option value="">Todo el eje</option>
            {eje?.subtemas.map((s) => <option key={s.valor} value={s.valor}>{s.label}</option>)}
          </select>
          <input
            style={campo}
            maxLength={150}
            value={value.tema ?? ""}
            onChange={(e) => onChange({ ...value, tema: e.target.value })}
            placeholder="Tema en tus palabras (opcional)"
            aria-label="Tema en tus palabras"
          />
        </div>
      )}
    </div>
  );
}

// para FormData o JSON: null quita la recomendación (eje vacío), undefined no la toca
export function camposEscuelaPadres(valor) {
  if (valor === undefined) return {};
  if (!valor) return { escuelaPadresEje: "" };
  return {
    escuelaPadresEje: valor.eje,
    ...(valor.subtema && { escuelaPadresSubtema: valor.subtema }),
    ...(valor.tema?.trim() && { escuelaPadresTema: valor.tema.trim() }),
  };
}
