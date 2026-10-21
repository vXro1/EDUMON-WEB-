import { useState, useEffect, useRef, useId, useCallback } from "react";
import { Navigate, useNavigate, Link } from "react-router-dom";
import {
  MessageCircleHeart, ShieldAlert, GraduationCap, LayoutDashboard, Play, Pencil, RotateCcw,
  ShieldCheck, ShieldX, Link2, Send, Copy, Check, Smartphone, Loader2, ArrowRight, ArrowDown,
  Users, School, Sparkles, HeartHandshake, BarChart3, Home,
} from "lucide-react";
import EdumonMascota from "@/features/edumon/components/EdumonMascota";
import { useAuth } from "@/features/auth/hooks/useAuth";
import edumonLetras from "@/assets/img/edumon-letras-sm.webp";
import mascota from "@/assets/img/edumon-mascota.svg";
import circulo1 from "@/assets/img/circulos/circulo1.svg";
import circulo2 from "@/assets/img/circulos/circulo2.svg";
import circulo5 from "@/assets/img/circulos/circulo5.svg";
import circulo7 from "@/assets/img/circulos/circulo7.svg";
import circulo9 from "@/assets/img/circulos/circulo9.svg";
import circulo11 from "@/assets/img/circulos/circulo11.svg";
import { CIFRAS, ROLES, GRUPOS_ROLES, EJEMPLOS, CICLO, BITACORA_INICIAL, FUENTES, NORMAS } from "./feriaDatos";
import { encadenar, verificar } from "./bitacora";
import { MODO_DEMO, marcarSesionFeria } from "./sesionFeria";
import "./feria.css";

const CLAVE_DEMO = import.meta.env.VITE_DEMO_PASSWORD ?? "";
const URL_PUBLICA = import.meta.env.VITE_URL_PUBLICA || "edumon-web.vercel.app";

const direccionPublica = () => {
  if (typeof window === "undefined") return URL_PUBLICA;
  const host = window.location.host;
  return /^(localhost|127\.|0\.0\.0\.0|\d+\.\d+\.\d+\.\d+)/.test(host) ? URL_PUBLICA : host;
};

const reducirMovimiento = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const irA = (id) => document.getElementById(id)?.scrollIntoView({ behavior: reducirMovimiento() ? "auto" : "smooth", block: "start" });

const formatear = (n, dec) => n.toLocaleString("es-CO", { minimumFractionDigits: dec, maximumFractionDigits: dec });

const rolPorId = (id) => ROLES.find((r) => r.id === id);

const Letras = ({ className = "fe-letras" }) => <img src={edumonLetras} alt="EDUMON" className={className} width={480} height={189} />;

function Burbujas({ items }) {
  return (
    <div className="fe-burbujas" aria-hidden="true">
      {items.map(([src, clase]) => <img key={clase} src={src} alt="" className={`fe-burbuja-deco ${clase}`} draggable={false} />)}
    </div>
  );
}

function useEntrarComo() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [estado, setEstado] = useState({ cargando: null, error: {} });

  const entrar = useCallback(async (rol) => {
    if (!CLAVE_DEMO) {
      setEstado((e) => ({ ...e, error: { ...e.error, [rol.id]: "Falta configurar la contraseña de la demo. Pídela en la mesa de Edumon." } }));
      return false;
    }
    setEstado((e) => ({ cargando: rol.id, error: { ...e.error, [rol.id]: "" } }));
    try {
      marcarSesionFeria();
      await login({ telefono: rol.telefono, contrasena: CLAVE_DEMO });
      navigate(rol.destino);
      return true;
    } catch (err) {
      const msg = /tard|conexi|fetch|timeout/i.test(err?.message ?? "")
        ? "El servidor está despertando (puede tardar un minuto). Intenta de nuevo."
        : "No pudimos iniciar sesión. Intenta de nuevo.";
      setEstado((e) => ({ cargando: null, error: { ...e.error, [rol.id]: msg } }));
      return false;
    }
  }, [login, navigate]);

  return { entrar, cargando: estado.cargando, error: estado.error };
}

function BotonCopiar({ texto, etiqueta }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1600);
    } catch {
      setCopiado(false);
    }
  };
  return (
    <button type="button" className="fe-copiar" onClick={copiar} aria-label={copiado ? `${etiqueta} copiado` : `Copiar ${etiqueta}`} title="Copiar">
      {copiado ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
    </button>
  );
}

const ICONOS_ROL = {
  familia: MessageCircleHeart, familia2: MessageCircleHeart, docente: GraduationCap, docente2: GraduationCap,
  orientadora: ShieldAlert, rectora: LayoutDashboard,
};

const iniciales = (nombre) => nombre.split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("").toUpperCase();

function Persona({ r, sesion }) {
  const Icono = ICONOS_ROL[r.id] ?? Users;
  const cargando = sesion.cargando === r.id;
  return (
    <li className="fe-persona" style={{ "--c": r.color }}>
      <span className="fe-persona-avatar" aria-hidden="true">{iniciales(r.nombre)}</span>
      <div className="fe-persona-info">
        <strong>{r.nombre}</strong>
        <span className="fe-persona-rol"><Icono size={14} aria-hidden="true" /> {r.rol}</span>
        <span className="fe-persona-ver">{r.ver}</span>
        <span className="fe-persona-usuario">
          Usuario <b>{r.local}</b>
          <BotonCopiar texto={r.local.replace(/\s/g, "")} etiqueta={`usuario de ${r.nombre}`} />
        </span>
        {sesion.error[r.id] && <span className="fe-error" role="alert">{sesion.error[r.id]}</span>}
      </div>
      <button
        type="button"
        className="fe-btn fe-btn-pri fe-persona-btn"
        onClick={() => sesion.entrar(r)}
        disabled={Boolean(sesion.cargando)}
        aria-label={`Entrar como ${r.nombre}, ${r.rol}`}
      >
        {cargando ? <Loader2 size={18} className="fe-girar" aria-hidden="true" /> : <>Entrar <ArrowRight size={18} aria-hidden="true" /></>}
      </button>
    </li>
  );
}

function AsiPiensa({ entrar, cargando, error }) {
  const [elegido, setElegido] = useState(EJEMPLOS[0].id);
  const [visibles, setVisibles] = useState(0);
  const [ronda, setRonda] = useState(0);
  const [propio, setPropio] = useState("");
  const [copiado, setCopiado] = useState("");
  const idPropio = useId();
  const ej = EJEMPLOS.find((e) => e.id === elegido);

  useEffect(() => {
    if (reducirMovimiento()) { setVisibles(ej.pasos.length); return undefined; }
    setVisibles(0);
    let n = 0;
    const t = setInterval(() => { n += 1; setVisibles(n); if (n >= ej.pasos.length) clearInterval(t); }, 1100);
    return () => clearInterval(t);
  }, [ej, ronda]);

  const pasoActual = Math.max(0, Math.min(visibles, ej.pasos.length) - 1);
  const terminado = visibles >= ej.pasos.length;
  const expresion = terminado ? ej.mascotaFinal : ej.pasos[pasoActual]?.mascota ?? "pensando";
  const tono = ej.id === "grave" ? "fe-grave" : ej.id === "escolar" ? "fe-riesgo" : "";

  const llevarAlChat = async (e) => {
    e.preventDefault();
    const texto = propio.trim();
    if (!texto) return;
    try { await navigator.clipboard?.writeText(texto); setCopiado("Copiamos tu mensaje: en el chat, pégalo y envíalo."); }
    catch { setCopiado("En el chat, escribe tu mensaje y envíalo."); }
    await entrar(rolPorId("familia"));
  };

  return (
    <>
      <div className="fe-chips" role="group" aria-label="Mensajes de ejemplo">
        {EJEMPLOS.map((e) => (
          <button key={e.id} type="button" className="fe-chip" aria-pressed={e.id === elegido} onClick={() => setElegido(e.id)}>
            <small>{e.etiqueta}</small>
            <strong>«{e.mensaje}»</strong>
          </button>
        ))}
      </div>

      <div className={`fe-flujo ${tono}`}>
        <div className="fe-flujo-masc" aria-hidden="true">
          <EdumonMascota key={expresion} size={150} expresion={expresion} animacion={terminado ? "aparecer" : "pensar"} />
        </div>
        <div>
          <p className="fe-burbuja">«{ej.mensaje}»</p>
          <ol className="fe-pasos" aria-live="polite">
            {ej.pasos.map((p, i) => (
              <li key={p.titulo} className={`fe-paso ${i < visibles ? "on" : ""} ${i === pasoActual && !terminado ? "actual" : ""}`} aria-hidden={i >= visibles}>
                <span className="fe-paso-n">{i + 1}</span>
                <div><h4>{p.titulo}</h4><p>{p.detalle}</p></div>
              </li>
            ))}
          </ol>
          <button type="button" className="fe-btn fe-btn-sec fe-btn-sm fe-mt" onClick={() => setRonda((r) => r + 1)}>
            <Play size={16} aria-hidden="true" /> Ver de nuevo
          </button>
        </div>
      </div>

      <form className="fe-propio" onSubmit={llevarAlChat}>
        <label htmlFor={idPropio}>Escribe tu propio mensaje (una situación inventada) y llévalo al chat</label>
        <input id={idPropio} value={propio} onChange={(e) => setPropio(e.target.value)} maxLength={500} placeholder="Ej.: mi hijo de 10 años no quiere ir al colegio" />
        <button type="submit" className="fe-btn fe-btn-pri" disabled={!propio.trim() || cargando === "familia"}>
          <Send size={18} aria-hidden="true" /> {cargando === "familia" ? "Entrando…" : "Llévalo al chat"}
        </button>
        {copiado && <p role="status" className="fe-nota-ok">{copiado}</p>}
        {error.familia && <p className="fe-error" role="alert">{error.familia}</p>}
      </form>
    </>
  );
}

function Bitacora() {
  const [cadena, setCadena] = useState(null);
  const [notas, setNotas] = useState(BITACORA_INICIAL.map((e) => e.nota));
  const [editable, setEditable] = useState(false);
  const [resultado, setResultado] = useState({ rota: -1, recalculados: [] });

  useEffect(() => { encadenar(BITACORA_INICIAL).then(setCadena).catch(() => setCadena([])); }, []);

  useEffect(() => {
    if (!cadena?.length) return;
    const actual = cadena.map((e, i) => ({ ...e, nota: notas[i] }));
    verificar(actual).then(setResultado);
  }, [cadena, notas]);

  if (cadena === null) return <p role="status">Calculando la cadena…</p>;
  if (!cadena.length) return <p>Este navegador no permite calcular SHA-256 aquí.</p>;

  const { rota } = resultado;
  return (
    <>
      <div className="fe-cadena">
        {cadena.map((e, i) => {
          const roto = rota !== -1 && i >= rota;
          return (
            <article key={e.hash} className={`fe-bloque ${roto ? "roto" : ""}`} aria-label={`Evento ${i + 1}: ${e.accion}${roto ? ", alterado" : ", íntegro"}`}>
              <span className="fe-estado">Evento {i + 1} · {e.estado}</span>
              <h4>{e.accion}</h4>
              {editable ? (
                <textarea aria-label={`Nota del evento ${i + 1} (edítala para alterar la bitácora)`} value={notas[i]}
                  onChange={(ev) => setNotas((n) => n.map((x, j) => (j === i ? ev.target.value : x)))} />
              ) : <p className="fe-nota">{notas[i]}</p>}
              <div className="fe-hash">sello: {e.hash.slice(0, 12)}…</div>
              <span className="fe-sello">
                {roto ? <ShieldX size={16} aria-hidden="true" /> : <ShieldCheck size={16} aria-hidden="true" />}{roto ? "No cuadra" : "Íntegro"}
              </span>
            </article>
          );
        })}
      </div>
      <div className={`fe-veredicto ${rota === -1 ? "ok" : "mal"}`} role="status" aria-live="polite">
        {rota === -1 ? <ShieldCheck size={22} aria-hidden="true" /> : <ShieldX size={22} aria-hidden="true" />}
        {rota === -1 ? `Bitácora íntegra · ${cadena.length} eventos` : `Bitácora alterada: se rompe en el evento ${rota + 1} y lo que sigue deja de ser confiable.`}
      </div>
      <div className="fe-fila-btns">
        <button type="button" className="fe-btn fe-btn-pri fe-btn-sm" onClick={() => setEditable(true)} disabled={editable}>
          <Pencil size={16} aria-hidden="true" /> Intenta alterar un evento
        </button>
        <button type="button" className="fe-btn fe-btn-sec fe-btn-sm" onClick={() => { setNotas(BITACORA_INICIAL.map((e) => e.nota)); setEditable(false); }}>
          <RotateCcw size={16} aria-hidden="true" /> Restaurar
        </button>
      </div>
      <p className="fe-pie-demo">
        <Link2 size={16} aria-hidden="true" /> Así se verifica cada alerta en Edumon: cada evento queda sellado con el anterior (SHA-256), calculado aquí en tu navegador.
      </p>
    </>
  );
}

const COLORES_CICLO = ["#0C6AC4", "#0A9DB4", "#2FBD45", "#E0A800", "#F23D7F", "#0B3A6E"];

function Ciclo() {
  const [activo, setActivo] = useState(0);
  const tocado = useRef(false);

  useEffect(() => {
    if (reducirMovimiento()) return undefined;
    const t = setInterval(() => { if (!tocado.current) setActivo((a) => (a + 1) % CICLO.length); }, 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fe-ciclo">
      <ol className="fe-ciclo-pasos">
        {CICLO.map((p, i) => (
          <li key={p.titulo}>
            <button type="button" aria-pressed={i === activo} style={{ "--c": COLORES_CICLO[i] }}
              onClick={() => { tocado.current = true; setActivo(i); }}>
              <span>{i + 1}</span>{p.titulo}
            </button>
          </li>
        ))}
      </ol>
      <div className="fe-ciclo-det" aria-live="polite" style={{ "--c": COLORES_CICLO[activo] }}>
        <p className="fe-kicker">Paso {activo + 1} de {CICLO.length}</p>
        <h4>{CICLO[activo].titulo}</h4>
        <p>{CICLO[activo].detalle}</p>
      </div>
    </div>
  );
}

function Cifra({ c }) {
  const ref = useRef(null);
  const [v, setV] = useState(reducirMovimiento() ? c.valor : 0);

  useEffect(() => {
    if (reducirMovimiento() || !ref.current) return undefined;
    let raf;
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const t0 = performance.now();
      const paso = (t) => {
        const p = Math.min(1, (t - t0) / 1400);
        setV(c.valor * (1 - (1 - p) ** 3));
        if (p < 1) raf = requestAnimationFrame(paso);
      };
      raf = requestAnimationFrame(paso);
    }, { threshold: 0.4 });
    obs.observe(ref.current);
    return () => { obs.disconnect(); cancelAnimationFrame(raf); };
  }, [c.valor]);

  return (
    <div className="fe-cifra" ref={ref}>
      <b aria-hidden="true">{c.prefijo}{formatear(v, c.decimales)}{c.sufijo}</b>
      <span className="sr-only">{c.prefijo}{formatear(c.valor, c.decimales)}{c.sufijo}</span>
      <strong>{c.titulo}</strong>
      <small>{c.detalle}</small>
    </div>
  );
}

const PESTANAS = [
  { id: "piensa", titulo: "Cómo responde la IA", icono: Sparkles, intro: "Elige un mensaje y mira, paso a paso, qué hace Edumon: la crianza se responde con fuentes oficiales y el riesgo sigue la ruta del colegio." },
  { id: "bitacora", titulo: "Alertas selladas", icono: ShieldCheck, intro: "Cada paso de una alerta queda sellado con el anterior. Si alguien edita uno, la cadena se rompe desde ahí." },
  { id: "ciclo", titulo: "Ciclo Edumon", icono: HeartHandshake, intro: "Lo que preguntan las familias se vuelve escuela de padres. Toca cada paso para verlo." },
  { id: "cifras", titulo: "En números", icono: BarChart3, intro: "Medido con la plataforma real, no estimado." },
];

function PorDentro({ sesion }) {
  const [activa, setActiva] = useState(PESTANAS[0].id);
  const base = useId();
  const refs = useRef([]);
  const actual = PESTANAS.find((p) => p.id === activa);

  const mover = (e, i) => {
    const total = PESTANAS.length;
    const siguiente = e.key === "ArrowRight" ? (i + 1) % total : e.key === "ArrowLeft" ? (i - 1 + total) % total : null;
    if (siguiente === null) return;
    e.preventDefault();
    setActiva(PESTANAS[siguiente].id);
    refs.current[siguiente]?.focus();
  };

  return (
    <>
      <div className="fe-tabs" role="tablist" aria-label="Lo que hace especial a Edumon">
        {PESTANAS.map((p, i) => {
          const Icono = p.icono;
          const sel = p.id === activa;
          return (
            <button key={p.id} ref={(el) => { refs.current[i] = el; }} type="button" role="tab" id={`${base}-t-${p.id}`}
              aria-selected={sel} aria-controls={`${base}-p-${p.id}`} tabIndex={sel ? 0 : -1}
              className="fe-tab" onClick={() => setActiva(p.id)} onKeyDown={(e) => mover(e, i)}>
              <Icono size={18} aria-hidden="true" /> {p.titulo}
            </button>
          );
        })}
      </div>
      <div className="fe-tabpanel" role="tabpanel" id={`${base}-p-${actual.id}`} aria-labelledby={`${base}-t-${actual.id}`} tabIndex={0}>
        <p className="fe-tab-intro">{actual.intro}</p>
        {actual.id === "piensa" && <AsiPiensa {...sesion} />}
        {actual.id === "bitacora" && <Bitacora />}
        {actual.id === "ciclo" && <Ciclo />}
        {actual.id === "cifras" && (
          <>
            <div className="fe-cifras">{CIFRAS.map((c) => <Cifra key={c.titulo} c={c} />)}</div>
            <p className="fe-honesto">
              <ShieldAlert size={18} aria-hidden="true" />
              <span>
                <b>Edumon IA puede equivocarse,</b> como cualquier inteligencia artificial. Por eso los casos graves los detecta primero
                una regla de seguridad revisada por personas, cada respuesta muestra su fuente y nunca reemplaza a orientación escolar.
              </span>
            </p>
          </>
        )}
      </div>
    </>
  );
}

const QUE_ES = [
  { icono: Users, color: "azul", titulo: "Familias", texto: "Reciben retos de escuela de padres para hacer en casa, los entregan con fotos y conversan en el foro del curso." },
  { icono: Sparkles, color: "rosado", titulo: "Edumon IA", texto: "Responde dudas de crianza a cualquier hora, por texto o por voz, con guías de UNICEF, OMS e ICBF." },
  { icono: School, color: "verde", titulo: "Colegio", texto: "Ve qué preocupa a sus familias, recibe alertas de convivencia a tiempo y mide la participación." },
];

export default function FeriaPage() {
  const sesion = useEntrarComo();

  useEffect(() => { document.title = "EDUMON · Feria de innovación"; }, []);

  useEffect(() => {
    const destino = window.location.hash.slice(1);
    if (!destino) return undefined;
    const llevar = () => document.getElementById(destino)?.scrollIntoView({ block: "start" });
    const tiempos = [100, 600, 1400].map((ms) => setTimeout(llevar, ms));
    return () => tiempos.forEach(clearTimeout);
  }, []);

  if (!MODO_DEMO) return <Navigate to="/" replace />;

  const rapidos = [rolPorId("familia"), rolPorId("docente")];

  return (
    <div className="fe">
      <header className="fe-barra">
        <div className="fe-barra-in">
          <Link to="/" className="fe-marca" aria-label="Ir a la página principal de EDUMON">
            <Letras className="fe-marca-letras" />
          </Link>
          <nav className="fe-nav" aria-label="Secciones">
            <a href="#que-es" onClick={(e) => { e.preventDefault(); irA("que-es"); }}>Qué es</a>
            <a href="#por-dentro" onClick={(e) => { e.preventDefault(); irA("por-dentro"); }}>Por dentro</a>
            <a className="fe-nav-cta" href="#pruebalo" onClick={(e) => { e.preventDefault(); irA("pruebalo"); }}>Pruébalo</a>
          </nav>
        </div>
      </header>

      <main>
        <section id="inicio" className="fe-hero" aria-labelledby="fe-titulo">
          <Burbujas items={[[circulo1, "b1"], [circulo7, "b2"], [circulo5, "b3"], [circulo11, "b4"]]} />
          <div className="fe-hero-in">
            <div className="fe-hero-texto">
              <span className="fe-insignia"><Sparkles size={13} aria-hidden="true" /> Feria de Innovación 2026</span>
              <h1 id="fe-titulo" className="fe-h1">
                <Letras className="fe-h1-letras" />
                <span>une al colegio con las familias</span>
              </h1>
              <p className="fe-hero-frase">
                Escuela de padres con retos en casa, y un asistente con inteligencia artificial que acompaña la crianza
                y avisa al colegio cuando hay riesgo.
              </p>
              <p className="fe-hero-pregunta">¿Cómo quieres conocerla?</p>
              <div className="fe-hero-btns">
                {rapidos.map((r, i) => (
                  <button key={r.id} type="button" className={`fe-btn ${i === 0 ? "fe-btn-pri" : "fe-btn-ver"} fe-btn-grande`}
                    onClick={() => sesion.entrar(r)} disabled={Boolean(sesion.cargando)}>
                    {sesion.cargando === r.id
                      ? <><Loader2 size={20} className="fe-girar" aria-hidden="true" /> Entrando…</>
                      : <>{i === 0 ? <Home size={20} aria-hidden="true" /> : <GraduationCap size={20} aria-hidden="true" />} Entrar como {i === 0 ? "familia" : "docente"}</>}
                  </button>
                ))}
              </div>
              {rapidos.map((r) => sesion.error[r.id] && <p key={r.id} className="fe-error" role="alert">{sesion.error[r.id]}</p>)}
              <button type="button" className="fe-enlace" onClick={() => irA("pruebalo")}>
                O elige otra persona: orientadora, rectora… <ArrowDown size={16} aria-hidden="true" />
              </button>
            </div>
            <div className="fe-hero-masc">
              <div className="fe-hero-globo" aria-hidden="true">¡Hola! Pruébame, es gratis y no necesitas registrarte</div>
              <img src={mascota} alt="Mascota de EDUMON saludando" width={660} height={626} />
            </div>
          </div>
        </section>

        <section id="que-es" className="fe-sec" aria-labelledby="fe-que-es">
          <Burbujas items={[[circulo9, "b5"], [circulo2, "b6"]]} />
          <div className="fe-in">
            <p className="fe-kicker">Qué es</p>
            <h2 id="fe-que-es" className="fe-h2">La escuela de padres, todos los días</h2>
            <div className="fe-franja" aria-hidden="true" />
            <p className="fe-lead">
              La Ley 2025 de 2020 obliga a los colegios a tener escuela de padres, pero suele ser una charla al año.
              EDUMON la convierte en un acompañamiento continuo.
            </p>
            <div className="fe-tres">
              {QUE_ES.map((q) => {
                const Icono = q.icono;
                return (
                  <article key={q.titulo} className={`fe-tarjeta fe-tarjeta--${q.color}`}>
                    <span className="fe-tarjeta-icono"><Icono size={28} aria-hidden="true" /></span>
                    <h3>{q.titulo}</h3>
                    <p>{q.texto}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="pruebalo" className="fe-sec fe-sec--suave" aria-labelledby="fe-pruebalo">
          <div className="fe-in">
            <p className="fe-kicker">Pruébalo</p>
            <h2 id="fe-pruebalo" className="fe-h2">Entra en 1 minuto, sin registrarte</h2>
            <div className="fe-franja" aria-hidden="true" />
            <ol className="fe-pasos-uso">
              <li><span>1</span>Elige una persona</li>
              <li><span>2</span>Toca <b>Entrar</b></li>
              <li><span>3</span>Para probar otra, usa <b>Cambiar de usuario</b></li>
            </ol>

            <div className="fe-personas">
              {GRUPOS_ROLES.map((g) => (
                <div key={g.id} className="fe-grupo">
                  <h3 className="fe-grupo-t">
                    {g.id === "familias" ? <Users size={20} aria-hidden="true" /> : <School size={20} aria-hidden="true" />}
                    {g.titulo}
                  </h3>
                  <ul className="fe-lista-personas">
                    {ROLES.filter((r) => r.grupo === g.id).map((r) => <Persona key={r.id} r={r} sesion={sesion} />)}
                  </ul>
                </div>
              ))}
            </div>

            <div className="fe-acceso">
              <div className="fe-acceso-item">
                <Smartphone size={26} aria-hidden="true" />
                <p>
                  <b>¿En tu celular?</b> Abre <b>{direccionPublica()}</b>, toca
                  «Inicio de sesión» y usa el usuario de cualquier persona.
                </p>
              </div>
              {CLAVE_DEMO && (
                <div className="fe-acceso-clave">
                  <span>Contraseña para todos</span>
                  <b>{CLAVE_DEMO}</b>
                  <BotonCopiar texto={CLAVE_DEMO} etiqueta="contraseña" />
                </div>
              )}
            </div>
          </div>
        </section>

        <section id="por-dentro" className="fe-sec" aria-labelledby="fe-por-dentro">
          <Burbujas items={[[circulo11, "b7"], [circulo5, "b8"]]} />
          <div className="fe-in">
            <p className="fe-kicker">Por dentro</p>
            <h2 id="fe-por-dentro" className="fe-h2">Lo que hace especial a <Letras className="fe-h2-letras" /> IA</h2>
            <div className="fe-franja" aria-hidden="true" />
            <PorDentro sesion={sesion} />
          </div>
        </section>
      </main>

      <footer className="fe-pie">
        <div className="fe-pie-in">
          <div className="fe-pie-marca">
            <Letras className="fe-pie-letras" />
            <p>Ingeniería de Software · Uniautónoma del Cauca</p>
          </div>
          <div className="fe-pie-datos">
            <p><b>Fuentes de las fichas:</b> {FUENTES.join(" · ")}</p>
            <p><b>Normas:</b> {NORMAS.join(" · ")}</p>
          </div>
        </div>
        <p className="fe-aviso">Datos de demostración: usuarios y situaciones inventadas.</p>
      </footer>
    </div>
  );
}
