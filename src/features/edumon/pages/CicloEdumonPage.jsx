import { useState, useEffect, useCallback, useId } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Users, Lock, EyeOff, Sparkles, ClipboardList, Layers, CalendarClock, ArrowRight, RefreshCw } from "lucide-react";
import { Button, Toast } from "@/components";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { cursosGetVisibles } from "@/features/cursos/services/cursosService";
import EdumonMascota from "../components/EdumonMascota";
import { edumonGetCiclo, edumonSugerirDesdeCiclo, mensajeErrorIA } from "../services/edumonService";
import { guardarRetoDelCiclo } from "../data/retoDelCiclo";
import "../edumon-ia.css";

const fecha = (f) => (f ? new Date(f).toLocaleDateString("es-CO", { day: "numeric", month: "long" }) : "");

const ORIGEN = {
  ia: "Propuesto con IA a partir de fichas curadas",
  catalogo: "Tomado del catálogo curado (sin IA generativa)",
  plantilla: "Armado con la plantilla curada (sin IA generativa)",
};

function Tema({ tema }) {
  return (
    <li className="eia-card" style={{ padding: 16, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
        <strong style={{ fontSize: 18 }}>{tema.subtemaLabel ?? tema.subtema}</strong>
        <span className="eia-muted" style={{ fontSize: 14 }}>{tema.ejeLabel ?? tema.eje}</span>
        <span className="eia-chip" style={{ marginLeft: "auto", fontSize: 15 }}>
          <Users size={15} aria-hidden="true" /> {tema.familias} familias
        </span>
      </div>
      {tema.retosCreados?.length > 0 ? (
        <div style={{ fontSize: 14.5 }}>
          <span className="eia-muted">Retos ya creados sobre este tema:</span>
          <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
            {tema.retosCreados.map((r) => (
              <li key={r.tareaId}>
                <strong>{r.titulo}</strong>{" "}
                <span className="eia-muted">· {r.estado === "publicada" ? "publicado" : "cerrado"}{r.fechaEntrega ? ` · entrega ${fecha(r.fechaEntrega)}` : ""}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <span className="eia-muted" style={{ fontSize: 14.5 }}>Aún no hay retos sobre este tema.</span>
      )}
    </li>
  );
}

function Lista({ titulo, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <p className="eia-seccion-t">{titulo}</p>
      <ol style={{ margin: 0, paddingLeft: 22, display: "flex", flexDirection: "column", gap: 4, fontSize: 15, lineHeight: 1.55 }}>
        {items.map((t, i) => <li key={`${i}-${t}`}>{t}</li>)}
      </ol>
    </div>
  );
}

function Sugerencia({ sugerencia, onCrear }) {
  const { basadoEn, modulos, reto } = sugerencia;
  return (
    <section className="eia-card" aria-label="Sugerencia de Edumon" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ margin: 0, fontSize: 15.5 }}>
        Basado en el tema más consultado: <strong>{basadoEn?.subtemaLabel ?? basadoEn?.subtema}</strong> ({basadoEn?.familias} familias).
      </p>

      {reto && (
        <div style={{ padding: 16, borderRadius: 14, border: "2px solid #0284C7", background: "#F0F9FF", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <ClipboardList size={20} color="#0369A1" aria-hidden="true" />
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, flex: 1 }}>Borrador de reto: {reto.titulo}</h3>
            {reto.duracionDias && <span className="eia-chip"><CalendarClock size={14} aria-hidden="true" /> {reto.duracionDias} días</span>}
          </div>
          <p className="eia-muted" style={{ margin: 0, fontSize: 13.5 }}>{ORIGEN[reto.generadoPor] ?? "Borrador sugerido"} · no se ha guardado</p>
          {reto.introduccion && <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>{reto.introduccion}</p>}
          {reto.objetivo && <p style={{ margin: 0, fontSize: 15 }}><strong>Objetivo:</strong> {reto.objetivo}</p>}
          <Lista titulo="Qué hacer en casa" items={reto.pasos} />
          <Lista titulo="Preguntas de reflexión" items={reto.reflexion} />
          <div>
            <Button onClick={onCrear} leftIcon={<Sparkles size={16} aria-hidden="true" />}>
              Crear este reto en el curso
            </Button>
            <p className="eia-muted" style={{ margin: "6px 0 0", fontSize: 13.5 }}>
              Abre el formulario normal de retos con el borrador cargado: lo revisas, eliges módulo y fecha, y lo publicas.
            </p>
          </div>
        </div>
      )}

      {modulos?.modulos?.length > 0 && (
        <div>
          <p className="eia-seccion-t" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Layers size={15} aria-hidden="true" /> Módulos sugeridos · {ORIGEN[modulos.generadoPor] ?? ""}
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
            {modulos.modulos.map((m) => (
              <li key={m.titulo} style={{ padding: 12, borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
                <strong style={{ fontSize: 15.5 }}>{m.titulo}</strong>
                <div className="eia-muted" style={{ fontSize: 13 }}>{m.ejeLabel}</div>
                <p style={{ margin: "6px 0", fontSize: 14.5 }}>{m.descripcion}</p>
                {m.ideasRetos?.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14 }}>
                    {m.ideasRetos.map((idea) => <li key={idea}>{idea}</li>)}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default function CicloEdumonPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const cursoId = searchParams.get("curso") ?? "";
  const selectorId = useId();

  const [cursos, setCursos] = useState({ cargando: true, lista: [], error: "" });
  const [ciclo, setCiclo] = useState({ cargando: false, datos: null, error: "" });
  const [sug, setSug] = useState({ cargando: false, datos: null, error: "" });
  const [toast, setToast] = useState({ msg: "", type: "success" });

  useEffect(() => {
    cursosGetVisibles(user?.rol)
      .then((r) => {
        const lista = r?.cursos ?? r?.data ?? (Array.isArray(r) ? r : []);
        setCursos({ cargando: false, lista, error: "" });
        if (!cursoId && lista.length) setSearchParams({ curso: lista[0]._id }, { replace: true });
      })
      .catch((err) => setCursos({ cargando: false, lista: [], error: mensajeErrorIA(err, "No pudimos cargar tus cursos.") }));
  }, [user?.rol]); // eslint-disable-line react-hooks/exhaustive-deps

  const cargarCiclo = useCallback(async () => {
    if (!cursoId) return;
    setCiclo({ cargando: true, datos: null, error: "" });
    setSug({ cargando: false, datos: null, error: "" });
    try {
      setCiclo({ cargando: false, datos: await edumonGetCiclo(cursoId), error: "" });
    } catch (err) {
      setCiclo({ cargando: false, datos: null, error: mensajeErrorIA(err, "No pudimos cargar el ciclo de este curso.") });
    }
  }, [cursoId]);

  useEffect(() => { cargarCiclo(); }, [cargarCiclo]);

  const sugerir = async () => {
    setSug({ cargando: true, datos: null, error: "" });
    try {
      setSug({ cargando: false, datos: await edumonSugerirDesdeCiclo(cursoId), error: "" });
    } catch (err) {
      setSug({ cargando: false, datos: null, error: mensajeErrorIA(err, "Edumon no pudo preparar la sugerencia. Intenta de nuevo.") });
    }
  };

  const crearReto = () => {
    if (!guardarRetoDelCiclo(cursoId, sug.datos.reto)) {
      setToast({ msg: "Tu navegador no permitió guardar el borrador. Ábrelo desde Retos → Crear reto con Edumon IA.", type: "error" });
      return;
    }
    navigate(`/cursos/${cursoId}?tab=tareas&edumon=1`);
  };

  const d = ciclo.datos;

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", gap: 16 }}>
      <Toast msg={toast.msg} type={toast.type} />

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <EdumonMascota size={76} expresion="ia" />
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Ciclo Edumon: ¿qué preguntan las familias de mi curso?</h1>
          <p className="eia-muted" style={{ fontSize: 15, margin: "4px 0 0" }}>
            Temas anónimos de las conversaciones con Edumon → módulo y reto sugeridos → retos creados.
          </p>
        </div>
      </div>

      <div className="eia-card" style={{ padding: "12px 16px", display: "flex", gap: 10, fontSize: 15, lineHeight: 1.55 }}>
        <Lock size={18} aria-hidden="true" style={{ flexShrink: 0, marginTop: 3 }} />
        <span>
          Privacidad: solo aparecen temas consultados por <strong>al menos 5 familias distintas</strong> en los <strong>últimos 30 días</strong>.
          Nunca se muestra el texto de los mensajes ni quién preguntó.
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label htmlFor={selectorId} style={{ fontSize: 14, fontWeight: 700 }}>Curso</label>
          <select
            id={selectorId}
            className="eia-focus"
            value={cursoId}
            onChange={(e) => setSearchParams({ curso: e.target.value }, { replace: true })}
            disabled={cursos.cargando || !cursos.lista.length}
            style={{ fontSize: 16, padding: "9px 12px", borderRadius: 10, border: "1.5px solid var(--color-border)", background: "var(--color-surface)", color: "var(--color-text)", minWidth: 260 }}
          >
            {cursos.lista.map((c) => <option key={c._id} value={c._id}>{c.nombre}</option>)}
          </select>
        </div>
        <Button variant="outline" onClick={cargarCiclo} loading={ciclo.cargando} disabled={!cursoId} leftIcon={<RefreshCw size={15} aria-hidden="true" />}>
          Actualizar
        </Button>
      </div>

      {cursos.cargando && <p role="status" style={{ fontSize: 15 }}>Cargando cursos…</p>}
      {cursos.error && <p role="alert" style={{ fontSize: 15, color: "#B91C1C" }}>{cursos.error}</p>}
      {!cursos.cargando && !cursos.error && !cursos.lista.length && (
        <p style={{ fontSize: 15 }}>No tienes cursos todavía. <Link to="/cursos">Ir a cursos</Link></p>
      )}

      {ciclo.cargando && <p role="status" style={{ fontSize: 15 }}>Cargando temas del curso…</p>}
      {ciclo.error && <p role="alert" style={{ fontSize: 15, color: "#B91C1C" }}>{ciclo.error}</p>}

      {d && (
        <>
          <section aria-label="Temas consultados" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, margin: 0 }}>
              Temas de {d.curso?.nombre} · desde el {fecha(d.ventana?.desde)} ({d.ventana?.dias ?? 30} días)
            </h2>
            {d.temas.length === 0 ? (
              <p className="eia-card" style={{ padding: 16, margin: 0, fontSize: 15 }}>
                Todavía ningún tema reúne {d.minimoFamilias ?? 5} familias. Cuando más familias usen Edumon, aparecerán aquí.
              </p>
            ) : (
              <ul style={{ margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {d.temas.map((t) => <Tema key={`${t.eje}-${t.subtema}`} tema={t} />)}
              </ul>
            )}
            {d.hayTemasOcultos && (
              <p style={{ margin: 0, fontSize: 14.5, display: "flex", alignItems: "center", gap: 6 }} className="eia-muted">
                <EyeOff size={16} aria-hidden="true" /> Hay otros temas consultados por menos de {d.minimoFamilias ?? 5} familias: no se muestran para proteger su privacidad.
              </p>
            )}
          </section>

          <section aria-label="Sugerir módulo y reto" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div>
              <Button size="lg" onClick={sugerir} loading={sug.cargando} leftIcon={<Sparkles size={18} aria-hidden="true" />}>
                Sugerirme módulo y reto
              </Button>
            </div>
            {sug.cargando && <p role="status" style={{ margin: 0, fontSize: 15 }}>Edumon está preparando la sugerencia…</p>}
            {sug.error && (
              <p role="alert" style={{ margin: 0, padding: "10px 14px", borderRadius: 12, background: "#FFFBEB", border: "1.5px solid #F59E0B", color: "#78350F", fontSize: 15 }}>
                {sug.error}
              </p>
            )}
            {sug.datos && <Sugerencia sugerencia={sug.datos} onCrear={crearReto} />}
          </section>
        </>
      )}

      {d && (
        <p className="eia-muted" style={{ margin: 0, fontSize: 13.5, display: "flex", alignItems: "center", gap: 6 }}>
          <ArrowRight size={14} aria-hidden="true" /> Los retos publicados con el tema de Edumon cierran el ciclo y aparecen en el tema correspondiente.
        </p>
      )}
    </div>
  );
}
