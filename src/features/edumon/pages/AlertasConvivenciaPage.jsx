import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, Info } from "lucide-react";
import { Button, Toast } from "@/components";
import { humanizeError } from "@/utils/humanizeError";
import AlertaCard from "../components/AlertaCard";
import EdumonMascota from "../components/EdumonMascota";
import { IntegridadGlobal } from "../components/IntegridadBitacora";
import {
  edumonGetAlertas, edumonGetAlerta, edumonActualizarAlerta, esAlertaModificada, mensajeErrorIA,
} from "../services/edumonService";

const FILTROS = [
  ["", "Todas"],
  ["nueva", "Nuevas"],
  ["en_atencion", "En atención"],
  ["cerrada", "Cerradas"],
];

const card = {
  background: "var(--color-surface)", borderRadius: 16,
  border: "1px solid var(--color-border)", boxShadow: "var(--clay-card)",
};

export default function AlertasConvivenciaPage() {
  const navigate = useNavigate();
  const [alertas, setAlertas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [sinPermiso, setSinPermiso] = useState("");
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const avisar = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3500);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { alertas } = await edumonGetAlertas(filtro);
        setAlertas(alertas);
      } catch (err) {
        if (err?.data?.message?.includes("institución")) setSinPermiso(err.data.message);
        else avisar(humanizeError(err), "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [filtro]);

  const reemplazar = (alerta) =>
    setAlertas((as) => as.map((a) => (a._id === alerta._id ? alerta : a)).filter((a) => !filtro || a.estado === filtro));

  const actualizar = async (id, cambios) => {
    try {
      const { alerta } = await edumonActualizarAlerta(id, cambios);
      reemplazar(alerta);
      avisar("Alerta actualizada");
    } catch (err) {
      // 409: otra persona la cambió al mismo tiempo -> se recarga la versión vigente
      if (esAlertaModificada(err)) {
        try { reemplazar((await edumonGetAlerta(id)).alerta); } catch { /* se muestra el aviso igual */ }
      }
      avisar(mensajeErrorIA(err, "No pudimos actualizar la alerta."), "error");
    }
  };

  if (sinPermiso) {
    return (
      <div style={{ ...card, maxWidth: 560, margin: "40px auto", padding: 32, textAlign: "center" }}>
        <ShieldAlert size={32} color="var(--color-text-muted)" />
        <p style={{ fontSize: 14.5, fontWeight: 600, margin: "10px 0 0" }}>{sinPermiso}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <Toast msg={toast.msg} type={toast.type} />

      <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 14 }}>
        <EdumonMascota size={72} expresion="alerta" />
        <div>
        <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldAlert size={24} color="#DC2626" aria-hidden="true" /> Alertas de convivencia
        </h1>
        <p style={{ fontSize: 15, color: "var(--color-text-muted)", margin: "4px 0 0" }}>
          Posibles situaciones de riesgo que Edumon detectó en las conversaciones de las familias. Como docente ves las de las familias de tus cursos.
        </p>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <IntegridadGlobal />
      </div>

      <div style={{ ...card, padding: "12px 16px", marginBottom: 16, display: "flex", gap: 10, fontSize: 15, lineHeight: 1.5 }}>
        <Info size={16} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: 2 }} />
        <span>
          Edumon solo comparte el mensaje que originó la alerta, nunca la conversación completa. Abre
          <strong> "Ver qué hacer y por qué" </strong> en cada alerta para ver por qué se generó, la ruta de atención con su fundamento normativo y verificar su bitácora.
        </span>
      </div>

      <div role="group" aria-label="Filtrar alertas por estado" style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {FILTROS.map(([valor, label]) => (
          <Button key={label} size="sm" variant={filtro === valor ? "primary" : "outline-neutral"} onClick={() => setFiltro(valor)} aria-pressed={filtro === valor}>
            {label}
          </Button>
        ))}
      </div>

      {loading ? (
        <p role="status" style={{ color: "var(--color-text-muted)", fontSize: 15 }}>Cargando alertas…</p>
      ) : alertas.length === 0 ? (
        <div style={{ ...card, padding: 28, textAlign: "center", color: "var(--color-text-muted)", fontSize: 15 }}>
          No hay alertas {filtro ? "en este estado" : "por ahora"}.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {alertas.map((a) => (
            <AlertaCard
              key={a._id}
              alerta={a}
              onActualizar={actualizar}
              onVerDetalle={(id) => navigate(`/convivencia/alertas/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
