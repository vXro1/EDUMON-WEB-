import { useEffect, useId, useRef, useState } from "react";
import { SlidersHorizontal, X, Volume2 } from "lucide-react";
import { useLectorVoz, VELOCIDADES, cambiarVelocidad, cambiarVoz, leer, detenerLectura } from "../voz/lectorVoz";

const nombreVoz = (v) => `${v.name.replace(/^(Microsoft|Google)\s+/i, "").replace(/\s*-\s*Spanish.*$/i, "")} (${v.lang})`;

export default function AjustesVoz({ claseBoton = "ech-head__btn" }) {
  const { soportado, voces, voz, velocidad, sonando } = useLectorVoz();
  const [abierto, setAbierto] = useState(false);
  const panelId = useId();
  const tituloId = useId();
  const vozId = useId();
  const contenedor = useRef(null);

  useEffect(() => {
    if (!abierto) return undefined;
    const cerrar = (e) => { if (!contenedor.current?.contains(e.target)) setAbierto(false); };
    const escape = (e) => { if (e.key === "Escape") setAbierto(false); };
    document.addEventListener("pointerdown", cerrar);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", cerrar);
      document.removeEventListener("keydown", escape);
    };
  }, [abierto]);

  if (!soportado) return null;

  const probando = sonando === "prueba-voz";

  return (
    <div className="ech-ajustes" ref={contenedor}>
      <button
        type="button"
        className={claseBoton}
        aria-expanded={abierto}
        aria-controls={panelId}
        aria-label="Ajustes de la voz de Edumon"
        title="Ajustes de voz"
        onClick={() => setAbierto((a) => !a)}
      >
        <SlidersHorizontal size={18} aria-hidden="true" />
      </button>

      {abierto && (
        <div id={panelId} className="ech-ajustes__panel" role="dialog" aria-labelledby={tituloId}>
          <div className="ech-ajustes__top">
            <h2 id={tituloId}>Voz de Edumon</h2>
            <button type="button" className="ech-icono-btn" onClick={() => setAbierto(false)} aria-label="Cerrar ajustes de voz">
              <X size={18} aria-hidden="true" />
            </button>
          </div>

          <fieldset className="ech-ajustes__grupo">
            <legend>Velocidad de lectura</legend>
            <div className="ech-segmentos">
              {VELOCIDADES.map((v) => (
                <label key={v.valor} className={velocidad === v.valor ? "activo" : ""}>
                  <input
                    type="radio"
                    name={`${panelId}-velocidad`}
                    value={v.valor}
                    checked={velocidad === v.valor}
                    onChange={() => cambiarVelocidad(v.valor)}
                  />
                  {v.etiqueta}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="ech-ajustes__grupo">
            <label htmlFor={vozId} className="ech-ajustes__label">Voz</label>
            {voces.length > 0 ? (
              <select id={vozId} value={voz?.voiceURI ?? ""} onChange={(e) => cambiarVoz(e.target.value)}>
                {voces.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>{nombreVoz(v)}</option>
                ))}
              </select>
            ) : (
              <p className="ech-ajustes__nota">
                Este dispositivo no muestra voces en español; se usará la voz predeterminada del sistema.
              </p>
            )}
            <p className="ech-ajustes__nota">Las voces disponibles dependen de tu teléfono o computador.</p>
          </div>

          <button
            type="button"
            className="ech-btn ech-btn--suave"
            onClick={() => (probando ? detenerLectura() : leer("prueba-voz", "Hola, soy Edumon. Así sonará mi voz cuando te lea las respuestas."))}
          >
            <Volume2 size={16} aria-hidden="true" /> {probando ? "Detener prueba" : "Probar voz"}
          </button>
        </div>
      )}
    </div>
  );
}
