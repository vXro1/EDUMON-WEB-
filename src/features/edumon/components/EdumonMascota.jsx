import ia from "@/assets/img/edumon/edumon-ia.webp";
import logo from "@/assets/img/edumon/edumon-ia-logo.webp";
import saludo from "@/assets/img/edumon/edumon-saludo.webp";
import pensando from "@/assets/img/edumon/edumon-pensando.webp";
import alerta from "@/assets/img/edumon/edumon-alerta.webp";
import no from "@/assets/img/edumon/edumon-no.webp";
import llamar from "@/assets/img/edumon/edumon-llamar.webp";

// Edumon IA: el robot es la cara de la IA (logo = cabeza, ia = cuerpo completo);
// las demás son expresiones con las que reacciona en el chat
export const EXPRESIONES = { ia, logo, saludo, pensando, alerta, no, llamar };

const ALT = {
  ia: "Edumon IA",
  logo: "Edumon IA",
  saludo: "Edumon saludando",
  pensando: "Edumon pensando",
  alerta: "Edumon preocupado",
  no: "Edumon diciendo que no",
  llamar: "Edumon hablando por teléfono",
};

// keyframes inyectados una sola vez
const CSS = `
@keyframes edumon-flotar { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
@keyframes edumon-pensar { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg); } }
@keyframes edumon-aparecer { from { opacity: 0; transform: scale(0.85) translateY(6px); } to { opacity: 1; transform: none; } }
@keyframes edumon-pulso { 0% { box-shadow: 0 0 0 0 rgba(14,165,233,0.55); } 70% { box-shadow: 0 0 0 14px rgba(14,165,233,0); } 100% { box-shadow: 0 0 0 0 rgba(14,165,233,0); } }
@keyframes edumon-puntos { 0%, 80%, 100% { opacity: 0.25; transform: translateY(0); } 40% { opacity: 1; transform: translateY(-3px); } }
`;
if (typeof document !== "undefined" && !document.getElementById("edumon-mascota-css")) {
  const style = document.createElement("style");
  style.id = "edumon-mascota-css";
  style.textContent = CSS;
  document.head.appendChild(style);
}

const ANIMACIONES = {
  flotar: "edumon-flotar 3s ease-in-out infinite",
  pensar: "edumon-pensar 0.9s ease-in-out infinite",
  aparecer: "edumon-aparecer 0.35s ease-out both",
};

/**
 * expresion: "ia" | "logo" | "saludo" | "pensando" | "alerta" | "no" | "llamar"
 * animacion: "flotar" | "pensar" | "aparecer" | null
 * circulo: la cabeza de Edumon IA dentro de un círculo (avatar de chat)
 */
export default function EdumonMascota({ size = 120, expresion = "ia", animacion = null, circulo = false, enLinea = false, style }) {
  if (circulo) {
    return (
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0, ...style }}>
        <div style={{
          width: size, height: size, borderRadius: "50%", overflow: "hidden",
          background: "radial-gradient(circle at 50% 35%, #E0F2FE, #BAE6FD 70%)",
          border: "2px solid rgba(14,165,233,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <img src={logo} alt="Edumon IA" draggable={false} style={{ width: "92%", height: "92%", objectFit: "contain" }} />
        </div>
        {enLinea && (
          <span title="En línea" style={{
            position: "absolute", right: 0, bottom: 0, width: Math.max(9, size * 0.24), height: Math.max(9, size * 0.24),
            borderRadius: "50%", background: "#22C55E", border: "2px solid var(--color-surface, #fff)",
          }} />
        )}
      </div>
    );
  }

  return (
    <img
      src={EXPRESIONES[expresion] ?? ia}
      alt={ALT[expresion] ?? "Edumon IA"}
      draggable={false}
      style={{
        width: size, height: size, objectFit: "contain", flexShrink: 0,
        animation: animacion ? ANIMACIONES[animacion] : undefined,
        transformOrigin: "50% 90%", userSelect: "none",
        ...style,
      }}
    />
  );
}
