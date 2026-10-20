import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldAlert, ListChecks, PhoneCall, AlertTriangle } from "lucide-react";
import { Button, Toast } from "@/components";
import { humanizeError } from "@/utils/humanizeError";
import AlertaCard from "../components/AlertaCard";
import AlertaTrazabilidad from "../components/AlertaTrazabilidad";
import AlertaExplicacion from "../components/AlertaExplicacion";
import { VerificarIntegridad } from "../components/IntegridadBitacora";
import EdumonMascota from "../components/EdumonMascota";
import { RUTAS_ATENCION, CATEGORIAS_ALERTA } from "../data/rutasAtencion";
import {
  edumonGetAlerta, edumonActualizarAlerta, esAlertaModificada, mensajeErrorIA,
} from "../services/edumonService";

const LINEAS = [
  ["ICBF", "141", "Protección de niños, niñas y adolescentes (24 h)"],
  ["Línea 155", "155", "Orientación a mujeres víctimas de violencia"],
  ["Salud mental", "192", "Opción 4"],
  ["Emergencias", "123", "Peligro inmediato"],
];

const card = {
  background: "var(--color-surface)", borderRadius: 16,
  border: "1px solid var(--color-border)", boxShadow: "var(--clay-card)",
};

// Destino de la notificación de alerta: el caso + qué hacer paso a paso
export default function AlertaDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alerta, setAlerta] = useState(null);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "success" });

  useEffect(() => {
    edumonGetAlerta(id)
      .then(({ alerta }) => setAlerta(alerta))
      .catch((err) => setError(humanizeError(err, "No se pudo cargar la alerta")));
  }, [id]);

  const actualizar = async (alertaId, cambios) => {
    try {
      const { alerta } = await edumonActualizarAlerta(alertaId, cambios);
      setAlerta(alerta);
      setToast({ msg: "Alerta actualizada", type: "success" });
    } catch (err) {
      // 409: otra persona la cambió al mismo tiempo -> se recarga la versión vigente
      if (esAlertaModificada(err)) {
        try { setAlerta((await edumonGetAlerta(alertaId)).alerta); } catch { /* se muestra el aviso igual */ }
      }
      setToast({ msg: mensajeErrorIA(err, "No pudimos actualizar la alerta."), type: "error" });
    }
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  const ruta = alerta && RUTAS_ATENCION[alerta.categoria];

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      <Toast msg={toast.msg} type={toast.type} />

      <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={15} />} onClick={() => navigate("/convivencia/alertas")}>
        Todas las alertas
      </Button>

      {error && (
        <div style={{ ...card, padding: 28, marginTop: 16, textAlign: "center" }}>
          <ShieldAlert size={30} color="var(--color-text-muted)" />
          <p style={{ fontSize: 14.5, fontWeight: 600, margin: "10px 0 0" }}>{error}</p>
        </div>
      )}

      {!alerta && !error && <p style={{ color: "var(--color-text-muted)", fontSize: 13, marginTop: 16 }}>Cargando alerta…</p>}

      {alerta && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "10px 0 16px" }}>
            <EdumonMascota size={86} expresion="alerta" />
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 800, color: "#0284C7" }}>EDUMON IA DETECTÓ</div>
              <h1 style={{ fontSize: 20, fontWeight: 800, margin: "2px 0 4px", display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldAlert size={20} color="#DC2626" /> {CATEGORIAS_ALERTA[alerta.categoria]}
              </h1>
              {ruta && (
                <p style={{ fontSize: 13.5, color: "var(--color-text-muted)", margin: 0 }}>
                  <strong style={{ color: "#DC2626" }}>Urgencia: {ruta.urgencia}.</strong> {ruta.resumen}
                </p>
              )}
            </div>
          </div>

          <AlertaCard alerta={alerta} onActualizar={actualizar} />

          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
            <AlertaExplicacion alertaId={alerta._id} rutaRespaldo={alerta.rutaAtencion} />
            <VerificarIntegridad key={alerta.historial?.length ?? 0} alertaId={alerta._id} />
          </div>

          <AlertaTrazabilidad alerta={alerta} soloHistorial />

          {ruta && (
            <div style={{ ...card, padding: 20, marginTop: 16 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
                <ListChecks size={20} color="var(--color-primary)" aria-hidden="true" /> Qué hacer ahora (guía del colegio)
              </h2>
              {/* números explícitos: el reset global de estilos oculta los de <ol> */}
              <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
                {ruta.pasos.map((paso, i) => (
                  <li key={paso} style={{ display: "flex", gap: 10, fontSize: 15, lineHeight: 1.55 }}>
                    <span style={{
                      flexShrink: 0, width: 22, height: 22, borderRadius: "50%", marginTop: 1,
                      background: "rgba(12,106,196,0.12)", color: "var(--color-primary)",
                      fontSize: 12, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {i + 1}
                    </span>
                    <span>{paso}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <div style={{ ...card, padding: 20, marginTop: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <EdumonMascota size={72} expresion="llamar" />
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                  <PhoneCall size={18} color="var(--color-primary)" /> Líneas de atención
                </h2>
                <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "var(--color-text-muted)" }}>
                  Si el caso lo requiere, llama o compártelas con la familia.
                </p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 10 }}>
              {LINEAS.map(([nombre, numero, detalle]) => (
                <a key={nombre} href={`tel:${numero}`} style={{
                  padding: "10px 12px", borderRadius: 12, border: "1px solid var(--color-border)",
                  background: "var(--color-bg)", textDecoration: "none", color: "var(--color-text)",
                }}>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{numero}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700 }}>{nombre}</div>
                  <div style={{ fontSize: 11.5, color: "var(--color-text-muted)" }}>{detalle}</div>
                </a>
              ))}
            </div>
          </div>

          <p style={{ fontSize: 11.5, color: "var(--color-text-muted)", margin: "14px 0 0", display: "flex", gap: 6 }}>
            <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
            Guía orientativa basada en la Ley 1620 de 2013 y el Decreto 1965 de 2013. Sigue siempre el protocolo y el manual de convivencia de tu institución.
          </p>
        </>
      )}
    </div>
  );
}
