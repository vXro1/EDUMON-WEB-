import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Megaphone, Send, School, Layers, ClipboardList, BookOpen, MessageSquare, Calendar, Users, CalendarDays, Loader2, CheckCircle2,
} from "lucide-react";
import { Button, Select, Textarea, Input, Toast } from "@/components";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { cursosGetVisibles } from "@/features/cursos/services/cursosService";
import { tareasGetAll } from "@/features/cursos/services/tareasService";
import { eventosGetAll } from "@/features/eventos/services/eventosService";
import { institucionesGetAll } from "@/services/institucionesService";
import { notificacionesEnviarAviso } from "@/features/notificaciones/services/notificacionesService";
import { humanizeError } from "@/utils/humanizeError";

const card = {
  background: "var(--color-surface)", border: "1px solid var(--color-border)",
  borderRadius: 16, padding: 20, boxShadow: "var(--clay-card)",
};

const fechaCorta = (f) => (f ? new Date(f).toLocaleDateString("es-CO", { day: "numeric", month: "short" }) : "");

// ─── Enviar aviso ───────────────────────────────────────────────────────────
function EnviarAviso({ cursos, esSuperadmin, instituciones, notify }) {
  const [alcance, setAlcance] = useState("curso");
  const [cursoId, setCursoId] = useState("");
  const [institucionId, setInstitucionId] = useState("");
  const [destinatarios, setDestinatarios] = useState("familias");
  const [tipo, setTipo] = useState("libre");
  const [referencia, setReferencia] = useState("");
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [correo, setCorreo] = useState(false);
  const [opciones, setOpciones] = useState({ tareas: [], eventos: [], cargando: false });
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState(null);

  useEffect(() => { if (!cursoId && cursos.length) setCursoId(cursos[0]._id); }, [cursos, cursoId]);

  // retos y eventos del curso elegido, para los recordatorios
  useEffect(() => {
    if (alcance !== "curso" || !cursoId) return;
    let vivo = true;
    setOpciones((o) => ({ ...o, cargando: true }));
    Promise.all([
      tareasGetAll({ cursoId, limit: 50 }).catch(() => ({ tareas: [] })),
      eventosGetAll({ cursoId, limit: 50 }).catch(() => ({ eventos: [] })),
    ]).then(([t, e]) => {
      if (!vivo) return;
      setOpciones({ tareas: t?.tareas ?? [], eventos: e?.eventos ?? [], cargando: false });
    });
    return () => { vivo = false; };
  }, [alcance, cursoId]);

  useEffect(() => { setReferencia(""); }, [tipo, cursoId, alcance]);

  const esRecordatorio = tipo !== "libre";
  const lista = tipo === "tarea" ? opciones.tareas : tipo === "evento" ? opciones.eventos : [];
  const puedeEnviar = (alcance === "colegio" ? (!esSuperadmin || institucionId) : cursoId)
    && (esRecordatorio ? referencia : mensaje.trim().length >= 3);

  const enviar = async (e) => {
    e.preventDefault();
    if (!puedeEnviar) return;
    const aQuien = { familias: "las familias", docentes: "los docentes", todos: "familias y docentes" }[destinatarios];
    const donde = alcance === "colegio" ? "todo el colegio" : `el curso «${cursos.find((c) => c._id === cursoId)?.nombre ?? ""}»`;
    if (!window.confirm(`¿Enviar el aviso a ${aQuien} de ${donde}? Les llegará como notificación.`)) return;

    setEnviando(true);
    setResultado(null);
    try {
      const body = {
        alcance, destinatarios, correo,
        ...(alcance === "curso" ? { cursoId } : {}),
        ...(alcance === "colegio" && esSuperadmin ? { institucionId } : {}),
        ...(tipo === "tarea" ? { tareaId: referencia } : {}),
        ...(tipo === "evento" ? { eventoId: referencia } : {}),
        ...(titulo.trim() ? { titulo: titulo.trim() } : {}),
        ...(mensaje.trim() ? { mensaje: mensaje.trim() } : {}),
      };
      const r = await notificacionesEnviarAviso(body);
      setResultado(r);
      notify(`Aviso enviado a ${r.enviadas} de ${r.destinatarios} personas`);
      setMensaje("");
      setTitulo("");
    } catch (err) {
      notify(humanizeError(err, "No se pudo enviar el aviso"), "error");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <section style={card} aria-labelledby="titulo-aviso">
      <h2 id="titulo-aviso" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 17, fontWeight: 800, margin: "0 0 4px" }}>
        <Megaphone size={19} aria-hidden="true" /> Enviar aviso
      </h2>
      <p style={{ margin: "0 0 16px", fontSize: 13.5, color: "var(--color-text-muted)" }}>
        Llega como notificación en la app (y al celular si la persona tiene la app instalada). Úsalo para avisos urgentes o para recordar un reto o un evento.
      </p>

      <form onSubmit={enviar} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        <Select label="¿A dónde?" value={alcance} onChange={(e) => setAlcance(e.target.value)}>
          <option value="curso">Un curso</option>
          <option value="colegio">Todo el colegio</option>
        </Select>

        {alcance === "curso" ? (
          <Select label="Curso" value={cursoId} onChange={(e) => setCursoId(e.target.value)} disabled={!cursos.length}>
            {cursos.map((c) => <option key={c._id} value={c._id}>{c.nombre}</option>)}
          </Select>
        ) : esSuperadmin ? (
          <Select label="Institución" value={institucionId} onChange={(e) => setInstitucionId(e.target.value)}>
            <option value="">Selecciona…</option>
            {instituciones.map((i) => <option key={i._id} value={i._id}>{i.nombre}</option>)}
          </Select>
        ) : <div />}

        <Select label="¿A quién?" value={destinatarios} onChange={(e) => setDestinatarios(e.target.value)}>
          <option value="familias">Familias</option>
          <option value="docentes">Docentes</option>
          <option value="todos">Familias y docentes</option>
        </Select>

        <Select label="Tipo de aviso" value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="libre">Aviso libre</option>
          {alcance === "curso" && <option value="tarea">Recordar un reto</option>}
          {alcance === "curso" && <option value="evento">Recordar un evento</option>}
        </Select>

        {esRecordatorio && (
          <div style={{ gridColumn: "1 / -1" }}>
            <Select
              label={tipo === "tarea" ? "Reto" : "Evento"}
              value={referencia}
              onChange={(e) => setReferencia(e.target.value)}
              disabled={opciones.cargando}
              hint={!opciones.cargando && !lista.length ? `Este curso no tiene ${tipo === "tarea" ? "retos" : "eventos"}.` : undefined}
            >
              <option value="">{opciones.cargando ? "Cargando…" : "Selecciona…"}</option>
              {lista.map((x) => (
                <option key={x._id} value={x._id}>
                  {x.titulo} · {tipo === "tarea" ? `entrega ${fechaCorta(x.fechaEntrega)}` : fechaCorta(x.fechaInicio)}
                </option>
              ))}
            </Select>
          </div>
        )}

        <div style={{ gridColumn: "1 / -1" }}>
          <Input label="Título (opcional)" value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={80} placeholder="Ej.: Aviso del colegio" />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <Textarea
            label={esRecordatorio ? "Mensaje (opcional: si lo dejas vacío se arma solo)" : "Mensaje"}
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            rows={3}
            maxLength={500}
            placeholder={esRecordatorio ? "Recordatorio: el reto «…» se entrega el …" : "Ej.: Mañana no hay clases por jornada pedagógica."}
          />
        </div>

        <label style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, cursor: "pointer" }}>
          <input type="checkbox" checked={correo} onChange={(e) => setCorreo(e.target.checked)} />
          Enviar también por correo (solo a quienes tienen un correo real registrado)
        </label>

        <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Button type="submit" loading={enviando} disabled={!puedeEnviar} leftIcon={<Send size={16} aria-hidden="true" />}>
            Enviar aviso
          </Button>
          {resultado && (
            <span role="status" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "#047857", fontWeight: 600 }}>
              <CheckCircle2 size={16} aria-hidden="true" />
              Enviado a {resultado.enviadas} de {resultado.destinatarios} · {resultado.conPush} al celular
              {resultado.fallidas > 0 && ` · ${resultado.fallidas} con error`}
            </span>
          )}
        </div>
      </form>
    </section>
  );
}

// ─── Cursos: accesos directos para gestionarlos ──────────────────────────────
const ACCESOS = [
  { tab: "tareas", label: "Retos", icon: ClipboardList },
  { tab: "modulos", label: "Módulos", icon: BookOpen },
  { tab: "foros", label: "Foros", icon: MessageSquare },
  { tab: "calendario", label: "Calendario", icon: Calendar },
  { tab: "participantes", label: "Participantes", icon: Users },
];

function Cursos({ cursos, cargando }) {
  return (
    <section style={card} aria-labelledby="titulo-cursos">
      <h2 id="titulo-cursos" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 17, fontWeight: 800, margin: "0 0 4px" }}>
        <Layers size={19} aria-hidden="true" /> Cursos del colegio
      </h2>
      <p style={{ margin: "0 0 14px", fontSize: 13.5, color: "var(--color-text-muted)" }}>
        Puedes crear y editar retos, módulos, foros y eventos de cualquier curso. Los retos quedan a nombre de la docente del curso.
      </p>
      {cargando && <p role="status" style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13.5 }}><Loader2 size={16} className="animate-spin" /> Cargando cursos…</p>}
      {!cargando && !cursos.length && <p style={{ fontSize: 13.5, color: "var(--color-text-muted)" }}>No hay cursos todavía.</p>}
      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {cursos.map((c) => (
          <li key={c._id} style={{ border: "1px solid var(--color-border)", borderRadius: 12, padding: "12px 14px", display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 220px", minWidth: 0 }}>
              <Link to={`/cursos/${c._id}`} style={{ fontWeight: 700, fontSize: 14.5, color: "var(--color-text)", textDecoration: "none" }}>{c.nombre}</Link>
              <div style={{ fontSize: 12.5, color: "var(--color-text-muted)" }}>
                {c.docenteId?.nombre ? `Docente: ${c.docenteId.nombre} ${c.docenteId.apellido ?? ""}` : "Sin docente asignada"}
                {Array.isArray(c.participantes) && ` · ${c.participantes.filter((p) => p.etiqueta === "padre").length} familias`}
              </div>
            </div>
            <nav aria-label={`Gestionar ${c.nombre}`} style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {ACCESOS.map(({ tab, label, icon: Icono }) => (
                <Link key={tab} to={`/cursos/${c._id}?tab=${tab}`} className="btn btn-outline btn-sm" style={{ textDecoration: "none" }}>
                  <Icono size={14} aria-hidden="true" /> {label}
                </Link>
              ))}
            </nav>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function PanelColegioPage() {
  const { user } = useAuth();
  const esSuperadmin = user?.rol === "superadmin";
  const [cursos, setCursos] = useState([]);
  const [instituciones, setInstituciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [toast, setToast] = useState({ msg: "", type: "success" });

  const notify = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 4000);
  }, []);

  useEffect(() => {
    cursosGetVisibles(user?.rol, { limit: 100 })
      .then((r) => setCursos((r?.cursos ?? r?.data ?? []).filter((c) => c.estado !== "archivado")))
      .catch((err) => notify(humanizeError(err, "No se pudieron cargar los cursos"), "error"))
      .finally(() => setCargando(false));
    if (esSuperadmin) institucionesGetAll().then((r) => setInstituciones(r?.instituciones ?? r ?? [])).catch(() => {});
  }, [user?.rol, esSuperadmin, notify]);

  const ordenados = useMemo(() => [...cursos].sort((a, b) => a.nombre.localeCompare(b.nombre, "es")), [cursos]);

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto", display: "flex", flexDirection: "column", gap: 18 }}>
      <Toast msg={toast.msg} type={toast.type} />
      <header>
        <h1 style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 800, margin: 0 }}>
          <School size={24} aria-hidden="true" /> Panel del colegio
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--color-text-muted)" }}>
          Todo lo necesario para administrar el colegio en un solo lugar, también en una emergencia.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
          <Link to="/eventos" className="btn btn-outline btn-sm" style={{ textDecoration: "none" }}><CalendarDays size={14} aria-hidden="true" /> Eventos</Link>
          <Link to="/usuarios" className="btn btn-outline btn-sm" style={{ textDecoration: "none" }}><Users size={14} aria-hidden="true" /> Usuarios y contraseñas</Link>
          <Link to="/cursos" className="btn btn-outline btn-sm" style={{ textDecoration: "none" }}><Layers size={14} aria-hidden="true" /> Crear o editar cursos</Link>
        </div>
      </header>

      <EnviarAviso cursos={ordenados} esSuperadmin={esSuperadmin} instituciones={instituciones} notify={notify} />
      <Cursos cursos={ordenados} cargando={cargando} />
    </div>
  );
}
