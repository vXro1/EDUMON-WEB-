import { useState } from "react";
import { Wand2, Check } from "lucide-react";
import { Button, Badge } from "@/components";
import { humanizeError } from "@/utils/humanizeError";
import EdumonMascota from "./EdumonMascota";
import { edumonSugerirModulos } from "../services/edumonService";

const escapar = (t = "") => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// descripción del módulo en HTML del editor: la frase + las ideas de retos
export const descripcionModuloHtml = (m) =>
  `<p>${escapar(m.descripcion)}</p><p><strong>Ideas de retos:</strong></p><ul>${m.ideasRetos.map((i) => `<li>${escapar(i)}</li>`).join("")}</ul>`;

/**
 * Edumon IA propone módulos de escuela de padres para el curso (grado).
 * onUsar(modulo) llena el formulario de nuevo módulo.
 */
export default function EdumonModulosSugerencias({ cursoId, onUsar }) {
  const [modulos, setModulos] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [usado, setUsado] = useState(null);

  const sugerir = async () => {
    setCargando(true);
    setError("");
    setUsado(null);
    try {
      const res = await edumonSugerirModulos({ cursoId });
      setModulos(res.modulos);
    } catch (err) {
      setError(humanizeError(err));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{
      borderRadius: 14, padding: 12, display: "flex", flexDirection: "column", gap: 10,
      border: "1px solid rgba(14,165,233,0.45)", background: "linear-gradient(120deg, rgba(14,165,233,0.07), rgba(99,102,241,0.07))",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <EdumonMascota size={56} expresion={cargando ? "pensando" : error ? "no" : modulos ? "saludo" : "ia"} animacion={cargando ? "pensar" : null} />
        <div style={{ flex: 1, fontSize: 13, lineHeight: 1.45 }}>
          <div style={{ fontSize: 11.5, fontWeight: 800, color: "#0284C7" }}>EDUMON IA</div>
          {cargando
            ? "Estoy pensando qué módulos le sirven a este curso…"
            : error || (modulos
              ? "Te propongo estos módulos. Elige uno y lo paso al formulario."
              : "¿No sabes qué módulo crear? Te sugiero temas de escuela de padres para este curso.")}
        </div>
        <Button size="sm" variant={modulos ? "ghost" : "primary"} onClick={sugerir} loading={cargando} leftIcon={<Wand2 size={14} />}>
          {modulos ? "Otras ideas" : "Sugerir módulos"}
        </Button>
      </div>

      {modulos?.map((m) => (
        <div key={m.titulo} style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 12, padding: "10px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <strong style={{ fontSize: 13.5 }}>{m.titulo}</strong>
            <Badge variant="info" size="sm">{m.ejeLabel}</Badge>
            <Button
              size="xs"
              variant={usado === m.titulo ? "success" : "outline"}
              style={{ marginLeft: "auto" }}
              leftIcon={usado === m.titulo ? <Check size={13} /> : undefined}
              onClick={() => { onUsar(m); setUsado(m.titulo); }}
            >
              {usado === m.titulo ? "En el formulario" : "Usar"}
            </Button>
          </div>
          <p style={{ margin: "4px 0", fontSize: 12.5, color: "var(--color-text-muted)" }}>{m.descripcion}</p>
          <div style={{ fontSize: 12, color: "var(--color-text-muted)" }}>
            Ideas de retos: {m.ideasRetos.join(" · ")}
          </div>
        </div>
      ))}
    </div>
  );
}
