import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import logo from "@/assets/img/edumon/edumon-ia-logo.webp";

const ROLES_FAMILIA = ["padre", "padre/tutor"];
const CLAVE_SALUDO = "edumon.launcher.saludoCerrado";

const leerCerrado = () => {
  try { return sessionStorage.getItem(CLAVE_SALUDO) === "1"; } catch { return false; }
};

// Botón flotante de Edumon IA en todas las páginas de la familia (menos en el chat)
export default function EdumonLauncher({ rol }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [saludoCerrado, setSaludoCerrado] = useState(leerCerrado);

  if (!ROLES_FAMILIA.includes(rol) || location.pathname.startsWith("/familia/edumon")) return null;

  const cerrarSaludo = (e) => {
    e.stopPropagation();
    setSaludoCerrado(true);
    try { sessionStorage.setItem(CLAVE_SALUDO, "1"); } catch { /* sin storage: solo dura esta vista */ }
  };

  return (
    <div style={{ position: "fixed", right: 22, bottom: 22, zIndex: 250, display: "flex", alignItems: "flex-end", gap: 10 }}>
      {!saludoCerrado && (
        <div
          onClick={() => navigate("/familia/edumon")}
          style={{
            position: "relative", maxWidth: 230, padding: "10px 30px 10px 14px", borderRadius: 16, borderBottomRightRadius: 4,
            background: "var(--color-surface, #fff)", border: "1px solid rgba(2,132,199,0.35)", cursor: "pointer",
            boxShadow: "0 8px 24px rgba(15,23,42,0.15)", fontSize: 13, lineHeight: 1.45, color: "var(--color-text)",
            animation: "edumon-aparecer 0.35s ease-out both",
          }}
        >
          <strong style={{ color: "#0284C7" }}>¡Hola! Soy Edumon IA.</strong> ¿Te ayudo con algo de tus hijos en casa o en el colegio?
          <button
            type="button"
            onClick={cerrarSaludo}
            aria-label="Cerrar"
            style={{ position: "absolute", top: 6, right: 6, background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 2, display: "flex" }}
          >
            <X size={14} />
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => navigate("/familia/edumon")}
        aria-label="Abrir Edumon IA"
        title="Edumon IA"
        style={{
          width: 66, height: 66, borderRadius: "50%", border: "3px solid #fff", cursor: "pointer", padding: 0,
          background: "radial-gradient(circle at 50% 35%, #E0F2FE, #7DD3FC)", overflow: "hidden",
          boxShadow: "0 8px 22px rgba(2,132,199,0.45)", animation: "edumon-pulso 2.4s infinite",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <img src={logo} alt="" style={{ width: "92%", height: "92%", objectFit: "contain" }} />
      </button>
    </div>
  );
}
