import { useEffect, useRef, useState } from "react";
import { Mic, Square, X, Loader2, Volume2, Keyboard } from "lucide-react";
import { escucharFrase, reconocimientoSoportado, mensajeErrorVoz } from "../voz/reconocimientoVoz";
import { leer, detenerLectura, useLectorVoz } from "../voz/lectorVoz";

const ETIQUETAS = {
  listo: "Toca el micrófono y habla",
  escuchando: "Te escucho…",
  procesando: "Edumon está pensando…",
  hablando: "Edumon está respondiendo",
  error: "Algo no salió bien",
};

export default function ModoVoz({ onEnviar, onSalir, ocupado }) {
  const soportado = reconocimientoSoportado();
  const { soportado: lecturaSoportada } = useLectorVoz();
  const [fase, setFase] = useState("listo");
  const [parcial, setParcial] = useState("");
  const [error, setError] = useState("");
  const [continua, setContinua] = useState(true);
  const escucha = useRef(null);
  const activo = useRef(true);
  const continuaRef = useRef(continua);

  useEffect(() => { continuaRef.current = continua; }, [continua]);

  useEffect(() => {
    activo.current = true;
    return () => {
      activo.current = false;
      escucha.current?.cancelar();
      detenerLectura();
    };
  }, []);

  const escuchar = async () => {
    if (!activo.current || ocupado) return;
    detenerLectura();
    setError("");
    setParcial("");
    setFase("escuchando");
    const sesion = escucharFrase({ onParcial: setParcial });
    escucha.current = sesion;
    let texto;
    try {
      texto = await sesion.promesa;
    } catch (err) {
      if (!activo.current) return;
      setError(mensajeErrorVoz(err.codigo));
      setFase("error");
      return;
    } finally {
      escucha.current = null;
    }
    if (!activo.current || !texto) { setFase("listo"); return; }

    setFase("procesando");
    const respuesta = await onEnviar(texto);
    if (!activo.current) return;
    setParcial("");
    if (!respuesta) {
      setError("Edumon no pudo responder. Revisa el aviso en la conversación y vuelve a intentarlo.");
      setFase("error");
      return;
    }
    if (!lecturaSoportada) { setFase("listo"); return; }

    setFase("hablando");
    leer(respuesta.id, respuesta.texto, {
      onFin: (motivo) => {
        if (!activo.current) return;
        if (motivo === "fin" && continuaRef.current) escuchar();
        else setFase("listo");
      },
    });
  };

  const accionPrincipal = () => {
    if (fase === "escuchando") escucha.current?.terminar();
    else if (fase === "hablando") { detenerLectura(); setFase("listo"); }
    else if (fase !== "procesando") escuchar();
  };

  const salir = () => {
    activo.current = false;
    escucha.current?.cancelar();
    detenerLectura();
    onSalir();
  };

  if (!soportado) {
    return (
      <div className="ech-voz ech-voz--sin-soporte" role="status">
        <p>
          Tu navegador no permite hablar con Edumon por voz. Prueba con Chrome, Edge o Safari actualizados,
          o sigue escribiendo.
        </p>
        <button type="button" className="ech-btn ech-btn--suave" onClick={onSalir}>
          <Keyboard size={16} aria-hidden="true" /> Volver a escribir
        </button>
      </div>
    );
  }

  const etiquetaBoton = {
    listo: "Empezar a hablar",
    error: "Intentar hablar de nuevo",
    escuchando: "Terminé de hablar",
    procesando: "Esperando la respuesta",
    hablando: "Detener la respuesta hablada",
  }[fase];

  return (
    <div className={`ech-voz ech-voz--${fase}`}>
      <div className="ech-voz__fila">
        <button
          type="button"
          className="ech-voz__mic"
          onClick={accionPrincipal}
          disabled={fase === "procesando"}
          aria-label={etiquetaBoton}
        >
          {fase === "procesando" && <Loader2 size={26} className="ech-girar" aria-hidden="true" />}
          {fase === "escuchando" && <Square size={22} aria-hidden="true" />}
          {fase === "hablando" && <Volume2 size={26} aria-hidden="true" />}
          {(fase === "listo" || fase === "error") && <Mic size={26} aria-hidden="true" />}
        </button>

        <div className="ech-voz__info">
          <p className="ech-voz__estado" role="status" aria-live="polite">
            {fase === "error" ? error : ETIQUETAS[fase]}
          </p>
          {parcial && <p className="ech-voz__parcial">“{parcial}”</p>}
          {fase === "escuchando" && <p className="ech-voz__ayuda">Toca el cuadrado cuando termines.</p>}
          {fase === "hablando" && <p className="ech-voz__ayuda">Toca el botón para detener la voz.</p>}
        </div>

        <button type="button" className="ech-icono-btn" onClick={salir} aria-label="Salir del modo voz y volver a escribir" title="Salir del modo voz">
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="ech-voz__opciones">
        <label className="ech-voz__continua">
          <input type="checkbox" checked={continua} onChange={(e) => setContinua(e.target.checked)} />
          Seguir escuchando después de cada respuesta
        </label>
        <span className="ech-voz__privacidad">
          Tu voz la convierte en texto el reconocimiento de voz del navegador (en Chrome lo procesa Google). Edumon recibe solo el texto.
        </span>
      </div>
    </div>
  );
}
