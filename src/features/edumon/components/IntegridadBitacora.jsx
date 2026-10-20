import { useState, useEffect, useCallback } from "react";
import { ShieldCheck, ShieldX, RefreshCw, Fingerprint } from "lucide-react";
import { Button } from "@/components";
import { edumonIntegridadAlertas, edumonIntegridadAlerta, mensajeErrorIA } from "../services/edumonService";
import "../edumon-ia.css";

const MOTIVOS = {
  sin_hash: "el evento es anterior a la bitácora encadenada (falta encadenarla)",
  secuencia: "falta o sobra un evento en la secuencia",
  enlace_roto: "el evento no apunta al anterior, o se editó el mensaje o la categoría de la alerta",
  hash_no_coincide: "el evento fue editado después de registrarse",
};

const ACCIONES = { creada: "creación", estado: "cambio de estado", nota: "nota" };

const fechaHora = (f) => (f ? new Date(f).toLocaleString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");

export function describirRotura(rotaEn) {
  if (!rotaEn) return "";
  const accion = ACCIONES[rotaEn.accion] ?? rotaEn.accion ?? "evento";
  return `Se rompe en el evento ${rotaEn.indice + 1} (${accion}${rotaEn.en ? `, ${fechaHora(rotaEn.en)}` : ""}): ${MOTIVOS[rotaEn.motivo] ?? rotaEn.motivo}.`;
}

function Caja({ valida, children }) {
  const Icono = valida ? ShieldCheck : ShieldX;
  return (
    <div
      role="status"
      style={{
        display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px", borderRadius: 14,
        background: valida ? "#ECFDF5" : "#FEF2F2",
        border: `2px solid ${valida ? "#059669" : "#DC2626"}`,
        color: valida ? "#064E3B" : "#7F1D1D",
      }}
    >
      <Icono size={26} aria-hidden="true" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, fontSize: 15, lineHeight: 1.5 }}>{children}</div>
    </div>
  );
}

/** Indicador del tablero: verifica todas las alertas visibles. */
export function IntegridadGlobal() {
  const [estado, setEstado] = useState({ cargando: true, datos: null, error: "" });

  const verificar = useCallback(async () => {
    setEstado((e) => ({ ...e, cargando: true, error: "" }));
    try {
      const datos = await edumonIntegridadAlertas();
      setEstado({ cargando: false, datos, error: "" });
    } catch (err) {
      setEstado({ cargando: false, datos: null, error: mensajeErrorIA(err, "No pudimos verificar la bitácora.") });
    }
  }, []);

  useEffect(() => { verificar(); }, [verificar]);

  const { datos } = estado;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {estado.error && <p role="alert" style={{ margin: 0, fontSize: 15, color: "#B91C1C" }}>{estado.error}</p>}
      {datos && (
        <Caja valida={datos.valida}>
          {datos.valida ? (
            <>
              <strong style={{ fontSize: 17 }}>Bitácora íntegra</strong> · {datos.eventos} eventos en {datos.alertas} alertas.
              <div style={{ fontSize: 14 }}>Ningún registro de atención fue modificado después de escribirse (cadena SHA-256).</div>
            </>
          ) : (
            <>
              <strong style={{ fontSize: 17 }}>Bitácora alterada en {datos.rotas.length} {datos.rotas.length === 1 ? "alerta" : "alertas"}</strong>
              <ul style={{ margin: "4px 0 0", paddingLeft: 18, fontSize: 14 }}>
                {datos.rotas.map((r) => <li key={r.alertaId}>{describirRotura(r.rotaEn) || "La cadena no cuadra."}</li>)}
              </ul>
            </>
          )}
          <div style={{ fontSize: 13, marginTop: 2 }}>Verificada: {fechaHora(datos.verificadaEn)}</div>
        </Caja>
      )}
      <div>
        <Button size="sm" variant="outline" onClick={verificar} loading={estado.cargando} leftIcon={<RefreshCw size={14} aria-hidden="true" />}>
          Verificar bitácora de nuevo
        </Button>
      </div>
    </div>
  );
}

/** Botón "Verificar integridad" del detalle de una alerta. */
export function VerificarIntegridad({ alertaId }) {
  const [estado, setEstado] = useState({ cargando: false, datos: null, error: "" });

  const verificar = async () => {
    setEstado({ cargando: true, datos: null, error: "" });
    try {
      const datos = await edumonIntegridadAlerta(alertaId);
      setEstado({ cargando: false, datos, error: "" });
    } catch (err) {
      setEstado({ cargando: false, datos: null, error: mensajeErrorIA(err, "No pudimos verificar la integridad de esta alerta.") });
    }
  };

  const { datos } = estado;
  return (
    <section className="eia-card" aria-label="Integridad de la bitácora" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h2 style={{ fontSize: 17, fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <Fingerprint size={20} aria-hidden="true" /> Integridad de la bitácora
        </h2>
        <Button onClick={verificar} loading={estado.cargando} leftIcon={<ShieldCheck size={16} aria-hidden="true" />}>
          Verificar integridad
        </Button>
      </div>
      {!datos && !estado.error && (
        <p style={{ margin: 0, fontSize: 14.5 }} className="eia-muted">
          Recalcula la cadena de hashes de cada evento para comprobar que nadie editó el historial de esta alerta.
        </p>
      )}
      {estado.error && <p role="alert" style={{ margin: 0, fontSize: 15, color: "#B91C1C" }}>{estado.error}</p>}
      {datos && (
        <Caja valida={datos.valida}>
          {datos.valida ? (
            <strong style={{ fontSize: 17 }}>Bitácora íntegra · {datos.eventos} eventos</strong>
          ) : (
            <>
              <strong style={{ fontSize: 17 }}>Bitácora alterada</strong>
              <div>{describirRotura(datos.rotaEn) || "La cadena de eventos no cuadra."}</div>
            </>
          )}
          {datos.estadoCoherente === false && (
            <div style={{ fontWeight: 700 }}>El estado visible no coincide con el último cambio registrado.</div>
          )}
          {datos.ultimoHash && (
            <div style={{ fontSize: 13, fontFamily: "ui-monospace, monospace", wordBreak: "break-all" }}>
              Último hash: {datos.ultimoHash}
            </div>
          )}
        </Caja>
      )}
    </section>
  );
}
