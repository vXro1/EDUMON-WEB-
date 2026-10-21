import { useEffect, useState } from "react";
import { RotateCcw, PencilLine, WifiOff, Loader2 } from "lucide-react";
import EdumonMascota from "./EdumonMascota";

export default function ErrorRespuesta({ error, enLinea, reintentando, onReintentar, onEditar }) {
  const [restante, setRestante] = useState(error.esperaSegundos ?? 0);

  useEffect(() => {
    setRestante(error.esperaSegundos ?? 0);
    if (!error.esperaSegundos) return undefined;
    const t = setInterval(() => setRestante((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [error]);

  const bloqueadoPorRed = !enLinea && (error.tipo === "sin_conexion" || error.tipo === "red");
  const puedeReintentar = error.reintentable && restante === 0 && !bloqueadoPorRed && !reintentando;

  return (
    <div className="ech-fila ech-fila--bot">
      <div className="ech-error" role="alert">
        <EdumonMascota size={72} expresion={error.expresion ?? "no"} className="ech-error__mascota" decorativa />
        <div className="ech-error__cuerpo">
          <p className="ech-error__titulo">{error.titulo}</p>
          <p className="ech-error__texto">{error.texto}</p>

          {bloqueadoPorRed && (
            <p className="ech-error__nota">
              <WifiOff size={15} aria-hidden="true" /> Esperando conexión… el botón se activará cuando vuelva internet.
            </p>
          )}

          <div className="ech-error__acciones">
            {error.reintentable && (
              <button type="button" className="ech-btn ech-btn--primario" onClick={onReintentar} disabled={!puedeReintentar}>
                {reintentando
                  ? <><Loader2 size={16} className="ech-girar" aria-hidden="true" /> Intentando…</>
                  : <><RotateCcw size={16} aria-hidden="true" /> {restante > 0 ? `Intentar en ${restante} s` : "Intentar de nuevo"}</>}
              </button>
            )}
            {onEditar && (
              <button type="button" className="ech-btn ech-btn--suave" onClick={onEditar} disabled={reintentando}>
                <PencilLine size={16} aria-hidden="true" /> Editar mensaje
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
