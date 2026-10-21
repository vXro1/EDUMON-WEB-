import { Volume2, Square, Pause, Play } from "lucide-react";
import { useLectorVoz, leer, detenerLectura, pausarLectura, reanudarLectura } from "../voz/lectorVoz";
import "../edumon-ia.css";

export { elegirVozEspanol, textoParaLeer, detenerLectura } from "../voz/lectorVoz";

export default function BotonEscuchar({ id, texto }) {
  const { soportado, sonando, pausado } = useLectorVoz();
  if (!soportado || !texto?.trim()) return null;
  const activo = sonando === id;

  if (!activo) {
    return (
      <button
        type="button"
        className="eia-accion"
        onClick={() => leer(id, texto)}
        aria-label="Escuchar esta respuesta en voz alta"
      >
        <Volume2 size={17} aria-hidden="true" />
        <span>Escuchar</span>
      </button>
    );
  }

  return (
    <span className="eia-lectura" role="group" aria-label="Controles de lectura">
      <span className="eia-lectura__estado" role="status">
        <span className={`eia-onda${pausado ? " eia-onda--pausa" : ""}`} aria-hidden="true">
          <i /><i /><i />
        </span>
        {pausado ? "En pausa" : "Leyendo"}
      </span>
      <button
        type="button"
        className="eia-accion eia-accion--icono"
        onClick={pausado ? reanudarLectura : pausarLectura}
        aria-label={pausado ? "Continuar la lectura" : "Pausar la lectura"}
        title={pausado ? "Continuar" : "Pausar"}
      >
        {pausado ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
      </button>
      <button
        type="button"
        className="eia-accion eia-accion--icono eia-accion--peligro"
        onClick={detenerLectura}
        aria-label="Detener la lectura"
        title="Detener"
      >
        <Square size={14} aria-hidden="true" />
      </button>
    </span>
  );
}
