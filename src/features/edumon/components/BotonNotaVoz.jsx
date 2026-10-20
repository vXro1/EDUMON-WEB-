import { useState, useRef, useEffect } from "react";
import { Mic, Square } from "lucide-react";
import "../edumon-ia.css";

// límite del backend (IA_AUDIO_MAX_SEGUNDOS = 120): se corta antes para no rozarlo
const MAX_SEGUNDOS = 115;

// formatos que acepta el backend, en orden de preferencia del navegador
const TIPOS = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];

const tipoSoportado = () =>
  typeof window !== "undefined" && window.MediaRecorder && TIPOS.find((t) => window.MediaRecorder.isTypeSupported?.(t));

export const notasDeVozSoportadas = () =>
  typeof window !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia) && Boolean(tipoSoportado());

const extension = (tipo) => (tipo.includes("ogg") ? "ogg" : tipo.includes("mp4") ? "m4a" : "webm");

/**
 * Micrófono del chat: graba, y al detener entrega un File listo para POST …/audio.
 * onAudio(file) · onError(mensaje) · deshabilitado mientras Edumon responde.
 */
export default function BotonNotaVoz({ onAudio, onError, deshabilitado }) {
  const [grabando, setGrabando] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const recorder = useRef(null);
  const partes = useRef([]);
  const reloj = useRef(null);

  const soltarMicrofono = () => {
    clearInterval(reloj.current);
    recorder.current?.stream?.getTracks().forEach((t) => t.stop());
  };

  useEffect(() => () => {
    // al salir de la página: no dejar el micrófono encendido ni enviar nada
    if (recorder.current) recorder.current.onstop = null;
    if (recorder.current?.state === "recording") recorder.current.stop();
    soltarMicrofono();
  }, []);

  const detener = () => {
    if (recorder.current?.state === "recording") recorder.current.stop();
  };

  const empezar = async () => {
    const tipo = tipoSoportado();
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      onError("No pudimos usar el micrófono. Revisa el permiso del navegador o escribe tu mensaje.");
      return;
    }
    partes.current = [];
    const rec = new window.MediaRecorder(stream, { mimeType: tipo });
    rec.ondataavailable = (e) => { if (e.data.size) partes.current.push(e.data); };
    rec.onstop = () => {
      soltarMicrofono();
      setGrabando(false);
      const blob = new Blob(partes.current, { type: tipo.split(";")[0] });
      if (blob.size < 1000) { onError("La nota de voz quedó vacía. Intenta de nuevo o escribe tu mensaje."); return; }
      onAudio(new File([blob], `nota-de-voz.${extension(tipo)}`, { type: blob.type }));
    };
    recorder.current = rec;
    rec.start();
    setSegundos(0);
    setGrabando(true);
    reloj.current = setInterval(() => {
      setSegundos((s) => {
        if (s + 1 >= MAX_SEGUNDOS) detener();
        return s + 1;
      });
    }, 1000);
  };

  const mmss = `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, "0")}`;

  return (
    <>
      {grabando && (
        <span role="status" aria-live="polite" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 15, fontWeight: 700, color: "#B91C1C", alignSelf: "center", whiteSpace: "nowrap" }}>
          <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: "50%", background: "#DC2626", animation: "edumon-puntos 1.2s infinite ease-in-out" }} />
          Grabando {mmss}
        </span>
      )}
      <button
        type="button"
        className="eia-focus"
        onClick={grabando ? detener : empezar}
        disabled={deshabilitado && !grabando}
        aria-pressed={grabando}
        aria-label={grabando ? "Detener y enviar la nota de voz" : "Grabar una nota de voz"}
        title={grabando ? "Detener y enviar" : "Grabar nota de voz"}
        style={{
          width: 40, height: 40, borderRadius: "50%", flexShrink: 0, cursor: deshabilitado && !grabando ? "default" : "pointer",
          border: grabando ? "none" : "1.5px solid var(--color-border)",
          background: grabando ? "#DC2626" : "var(--color-surface)", color: grabando ? "#fff" : "var(--color-text)",
          display: "flex", alignItems: "center", justifyContent: "center", opacity: deshabilitado && !grabando ? 0.5 : 1,
        }}
      >
        {grabando ? <Square size={15} aria-hidden="true" /> : <Mic size={18} aria-hidden="true" />}
      </button>
    </>
  );
}
