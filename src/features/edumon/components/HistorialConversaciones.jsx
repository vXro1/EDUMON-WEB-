import { Plus, Trash2, Lock, MessageCircle, X } from "lucide-react";
import { tiempoRelativo } from "../utils/textoChat";

export default function HistorialConversaciones({
  id, conversaciones, cargando, activaId, abriendoId, onAbrir, onNueva, onEliminar, onRevocar, onCerrar,
}) {
  return (
    <nav id={id} className="ech-historial__contenido" aria-label="Historial de conversaciones">
      <div className="ech-historial__top">
        <h2 className="ech-historial__titulo">Conversaciones</h2>
        {onCerrar && (
          <button type="button" className="ech-icono-btn ech-historial__cerrar" onClick={onCerrar} aria-label="Cerrar el historial">
            <X size={20} aria-hidden="true" />
          </button>
        )}
      </div>

      <button type="button" className="ech-btn ech-btn--primario ech-btn--bloque" onClick={onNueva}>
        <Plus size={17} aria-hidden="true" /> Nueva conversación
      </button>

      <div className="ech-historial__lista">
        {cargando && (
          <ul className="ech-historial__items" aria-hidden="true">
            {[0, 1, 2].map((i) => <li key={i} className="ech-historial__esqueleto" />)}
          </ul>
        )}

        {!cargando && conversaciones.length === 0 && (
          <div className="ech-historial__vacio">
            <MessageCircle size={22} aria-hidden="true" />
            <p>Aquí aparecerán tus conversaciones con Edumon.</p>
          </div>
        )}

        {!cargando && conversaciones.length > 0 && (
          <ul className="ech-historial__items">
            {conversaciones.map((c) => {
              const activa = activaId === c._id;
              return (
                <li key={c._id} className={`ech-conv${activa ? " ech-conv--activa" : ""}`}>
                  <button
                    type="button"
                    className="ech-conv__abrir"
                    onClick={() => onAbrir(c._id)}
                    aria-current={activa ? "page" : undefined}
                    aria-busy={abriendoId === c._id || undefined}
                  >
                    <span className="ech-conv__titulo">{c.titulo || "Conversación"}</span>
                    <span className="ech-conv__meta">
                      {tiempoRelativo(c.ultimaActividad ?? c.createdAt)}
                      {c.edadHijo != null && ` · ${c.edadHijo} ${c.edadHijo === 1 ? "año" : "años"}`}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="ech-conv__eliminar"
                    onClick={() => onEliminar(c)}
                    aria-label={`Eliminar la conversación «${c.titulo || "Conversación"}»`}
                    title="Eliminar conversación"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="ech-historial__pie">
        <span><Lock size={13} aria-hidden="true" /> Privado · se borra a los 30 días</span>
        <button type="button" className="ech-enlace ech-enlace--peligro" onClick={onRevocar}>
          Retirar autorización
        </button>
      </div>
    </nav>
  );
}
