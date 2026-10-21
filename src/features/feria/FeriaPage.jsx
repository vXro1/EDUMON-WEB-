import { useState, useEffect, useRef, useId, useCallback } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  MessageCircleHeart, ShieldAlert, GraduationCap, LayoutDashboard, ArrowDown, Play, Pencil, RotateCcw,
  ShieldCheck, ShieldX, Link2, Send, LogIn,
} from "lucide-react";
import EdumonMascota from "@/features/edumon/components/EdumonMascota";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { CIFRAS, ROLES, EJEMPLOS, CICLO, BITACORA_INICIAL, FUENTES, NORMAS } from "./feriaDatos";
import { encadenar, verificar } from "./bitacora";
import "./feria.css";

const MODO_DEMO = String(import.meta.env.VITE_MODO_DEMO ?? "").toLowerCase() === "true";
const CLAVE_DEMO = import.meta.env.VITE_DEMO_PASSWORD ?? "";

const reducirMovimiento = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const irA = (id) => document.getElementById(id)?.scrollIntoView({ behavior: reducirMovimiento() ? "auto" : "smooth", block: "start" });

const formatear = (n, dec) => n.toLocaleString("es-CO", { minimumFractionDigits: dec, maximumFractionDigits: dec });

// ─── Login de demo compartido por las tarjetas y el "escribe tu mensaje" ─────
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

// ─── 3. Así piensa Edumon ────────────────────────────────────────────────────
function AsiPiensa({ entrar, cargando, error }) {
  const [elegido, setElegido] = useState(EJEMPLOS[0].id);
  const [visibles, setVisibles] = useState(0);
  const [ronda, setRonda] = useState(0); // "Ver de nuevo" reinicia la animación
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
    await entrar(ROLES[0]);
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
          <EdumonMascota key={expresion} size={200} expresion={expresion} animacion={terminado ? "aparecer" : "pensar"} />
        </div>
        <div>
          <p className="fe-burbuja">«{ej.mensaje}»</p>
          <ol className="fe-pasos" aria-live="polite">
            {ej.pasos.map((p, i) => (
              <li key={p.titulo} className={`fe-paso ${i < visibles ? "on" : ""} ${i === pasoActual && !terminado ? "actual" : ""}`} aria-hidden={i >= visibles}>
                <span className="fe-paso-n">{i + 1}</span>
                <div><h3>{p.titulo}</h3><p>{p.detalle}</p></div>
              </li>
            ))}
          </ol>
          <div style={{ marginTop: 16 }}>
            <button type="button" className="fe-btn fe-btn-sec fe-btn-sm" onClick={() => setRonda((r) => r + 1)}>
              <Play size={16} aria-hidden="true" /> Ver de nuevo
            </button>
          </div>
        </div>
      </div>

      <form className="fe-propio" onSubmit={llevarAlChat}>
        <label htmlFor={idPropio}>Escribe tu propio mensaje (una situación inventada)</label>
        <input id={idPropio} value={propio} onChange={(e) => setPropio(e.target.value)} maxLength={500} placeholder="Ej.: mi hijo de 10 años no quiere ir al colegio" />
        <button type="submit" className="fe-btn fe-btn-pri" disabled={!propio.trim() || cargando === "familia"}>
          <Send size={18} aria-hidden="true" /> {cargando === "familia" ? "Entrando…" : "Llévalo al chat"}
        </button>
        {copiado && <p role="status" style={{ width: "100%", margin: 0, fontWeight: 700 }}>{copiado}</p>}
        {error.familia && <p className="fe-error" role="alert">{error.familia}</p>}
      </form>
    </>
  );
}

// ─── 4. Bitácora ─────────────────────────────────────────────────────────────
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
              <h3>{e.accion}</h3>
              {editable ? (
                <textarea aria-label={`Nota del evento ${i + 1} (edítala para alterar la bitácora)`} value={notas[i]}
                  onChange={(ev) => setNotas((n) => n.map((x, j) => (j === i ? ev.target.value : x)))} />
              ) : <p className="fe-nota">{notas[i]}</p>}
              <div className="fe-hash">hash anterior: {e.hashAnterior.slice(0, 16)}…</div>
              <div className="fe-hash">hash: {e.hash.slice(0, 16)}…</div>
              {roto && resultado.recalculados[i] && <div className="fe-hash" style={{ color: "#B91C1C" }}>recalculado: {resultado.recalculados[i].slice(0, 16)}…</div>}
              <span className="fe-sello" style={{ marginTop: 8 }}>
                {roto ? <ShieldX size={16} aria-hidden="true" /> : <ShieldCheck size={16} aria-hidden="true" />}{roto ? "No cuadra" : "Íntegro"}
              </span>
            </article>
          );
        })}
      </div>
      <div className={`fe-veredicto ${rota === -1 ? "ok" : "mal"}`} role="status" aria-live="polite">
        {rota === -1 ? <ShieldCheck size={24} aria-hidden="true" /> : <ShieldX size={24} aria-hidden="true" />}
        {rota === -1 ? `Bitácora íntegra · ${cadena.length} eventos` : `Bitácora alterada: se rompe en el evento ${rota + 1} y todo lo que sigue deja de ser confiable.`}
      </div>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <button type="button" className="fe-btn fe-btn-pri fe-btn-sm" onClick={() => setEditable(true)} disabled={editable}>
          <Pencil size={16} aria-hidden="true" /> Intenta alterar un evento
        </button>
        <button type="button" className="fe-btn fe-btn-sec fe-btn-sm" onClick={() => { setNotas(BITACORA_INICIAL.map((e) => e.nota)); setEditable(false); }}>
          <RotateCcw size={16} aria-hidden="true" /> Restaurar
        </button>
      </div>
      <p style={{ margin: "16px 0 0", fontWeight: 700 }}>
        <Link2 size={18} aria-hidden="true" style={{ verticalAlign: "-3px" }} /> Así se verifica cada alerta en Edumon: SHA-256 encadenado, calculado aquí mismo en tu navegador.
      </p>
    </>
  );
}

// ─── 5. Ciclo ────────────────────────────────────────────────────────────────
const COLORES_CICLO = ["#0C6AC4", "#0E7490", "#15803D", "#B45309", "#BE185D", "#0B3A6E"];

function Ciclo() {
  const [activo, setActivo] = useState(0);
  const tocado = useRef(false);

  useEffect(() => {
    if (reducirMovimiento()) return undefined;
    const t = setInterval(() => { if (!tocado.current) setActivo((a) => (a + 1) % CICLO.length); }, 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <div className="fe-ciclo">
        <div className="fe-rueda" role="group" aria-label="Los 6 pasos del Ciclo Edumon">
          <div className="fe-rueda-centro" aria-hidden="true"><EdumonMascota size={130} expresion="ia" animacion="flotar" /></div>
          {CICLO.map((p, i) => {
            const ang = (i / CICLO.length) * 2 * Math.PI - Math.PI / 2;
            return (
              <button key={p.titulo} type="button" className="fe-nodo" aria-pressed={i === activo}
                style={{ left: `${50 + 40 * Math.cos(ang)}%`, top: `${50 + 40 * Math.sin(ang)}%`, "--c": COLORES_CICLO[i] }}
                onClick={() => { tocado.current = true; setActivo(i); }}>
                <span>{i + 1}</span>{p.titulo}
              </button>
            );
          })}
        </div>
        <div className="fe-ciclo-det" aria-live="polite">
          <p className="fe-kicker">Paso {activo + 1} de {CICLO.length}</p>
          <h3>{CICLO[activo].titulo}</h3>
          <p>{CICLO[activo].detalle}</p>
        </div>
      </div>
      <p className="fe-cita">La escuela de padres deja de ser una charla al año y se convierte en un ciclo que aprende.</p>
    </>
  );
}

// ─── 7. Números ──────────────────────────────────────────────────────────────
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

const ICONOS_ROL = { familia: MessageCircleHeart, orientadora: ShieldAlert, docente: GraduationCap, rectora: LayoutDashboard };

// ─── Página ──────────────────────────────────────────────────────────────────
export default function FeriaPage() {
  const sesion = useEntrarComo();

  useEffect(() => { document.title = "Edumon · Feria de innovación"; }, []);

  if (!MODO_DEMO) return <Navigate to="/" replace />;

  return (
    <div className="fe">
      <div className="fe-franja" aria-hidden="true" />
      <header className="fe-barra">
        <div className="fe-barra-in">
          <a className="fe-marca" href="#inicio" onClick={(e) => { e.preventDefault(); irA("inicio"); }}>
            <EdumonMascota size={34} expresion="logo" /> Edumon
          </a>
          <nav className="fe-nav" aria-label="Secciones">
            <a href="#como-funciona" onClick={(e) => { e.preventDefault(); irA("como-funciona"); }}>Cómo piensa</a>
            <a href="#bitacora" onClick={(e) => { e.preventDefault(); irA("bitacora"); }}>Bitácora</a>
            <a href="#ciclo" onClick={(e) => { e.preventDefault(); irA("ciclo"); }}>Ciclo</a>
            <a className="fe-nav-cta" href="#pruebalo" onClick={(e) => { e.preventDefault(); irA("pruebalo"); }}>Pruébalo</a>
          </nav>
        </div>
      </header>

      <main>
        {/* 1. Inicio */}
        <section id="inicio" className="fe-hero" aria-labelledby="fe-titulo">
          <div className="fe-hero-in">
            <div>
              <h1 id="fe-titulo" className="fe-h1">Edumon</h1>
              <p className="fe-hero-frase">Acompañamos a las familias en la crianza y avisamos al colegio cuando hay riesgo.</p>
              <div className="fe-hero-btns">
                <button type="button" className="fe-btn fe-btn-pri" onClick={() => irA("pruebalo")}>
                  <LogIn size={20} aria-hidden="true" /> Pruébalo ahora
                </button>
                <button type="button" className="fe-btn fe-btn-sec" onClick={() => irA("como-funciona")}>
                  <ArrowDown size={20} aria-hidden="true" /> Mira cómo funciona
                </button>
              </div>
            </div>
            <div className="fe-hero-masc">
              <div className="fe-hero-halo" aria-hidden="true" />
              <EdumonMascota size={300} expresion="saludo" animacion="flotar" style={{ position: "relative" }} />
            </div>
          </div>
        </section>

        {/* 2. El problema */}
        <section className="fe-sec" aria-labelledby="fe-problema">
          <div className="fe-in">
            <p className="fe-kicker">El problema</p>
            <h2 id="fe-problema" className="sr-only">El problema</h2>
            <div className="fe-problema">
              <p style={{ "--c": "var(--fe-azul)" }}>La Ley 2025 de 2020 obliga a los colegios a tener escuela de padres.</p>
              <p style={{ "--c": "var(--fe-amarillo)" }}>En la práctica, suele ser una charla al año.</p>
              <p style={{ "--c": "var(--fe-rosado)" }}>Entre charla y charla, las familias están solas.</p>
            </div>
          </div>
        </section>

        {/* 3. Así piensa Edumon */}
        <section id="como-funciona" className="fe-sec" aria-labelledby="fe-piensa">
          <div className="fe-in">
            <p className="fe-kicker">Así piensa Edumon</p>
            <h2 id="fe-piensa" className="fe-h2">Elige un mensaje y mira qué hace, paso a paso</h2>
            <p className="fe-lead">Cada caso se trata distinto: la crianza se responde con fuentes oficiales; el riesgo sigue la ruta del colegio.</p>
            <AsiPiensa {...sesion} />
          </div>
        </section>

        {/* 4. Bitácora */}
        <section id="bitacora" className="fe-sec" aria-labelledby="fe-bitacora">
          <div className="fe-in">
            <p className="fe-kicker">Bitácora que no se puede alterar</p>
            <h2 id="fe-bitacora" className="fe-h2">Cada paso de una alerta queda sellado</h2>
            <p className="fe-lead">Cada evento se firma con el anterior. Si alguien edita uno, la cadena se rompe desde ahí. Ejemplo de una alerta:</p>
            <Bitacora />
          </div>
        </section>

        {/* 5. Ciclo */}
        <section id="ciclo" className="fe-sec" aria-labelledby="fe-ciclo">
          <div className="fe-in">
            <p className="fe-kicker">El Ciclo Edumon</p>
            <h2 id="fe-ciclo" className="fe-h2">Lo que preguntan las familias se vuelve escuela de padres</h2>
            <p className="fe-lead">Toca cada paso para verlo.</p>
            <Ciclo />
          </div>
        </section>

        {/* 6. Pruébalo */}
        <section id="pruebalo" className="fe-sec" aria-labelledby="fe-pruebalo">
          <div className="fe-in">
            <p className="fe-kicker">Pruébalo en vivo</p>
            <h2 id="fe-pruebalo" className="fe-h2">Entra con un rol, sin escribir contraseñas</h2>
            <p className="fe-lead">Cada botón inicia sesión con un usuario de demostración y te lleva directo a su pantalla.</p>
            <div className="fe-roles">
              {ROLES.map((r) => {
                const Icono = ICONOS_ROL[r.id];
                return (
                  <div key={r.id} className="fe-rol" style={{ "--c": r.color }}>
                    <h3><Icono size={28} aria-hidden="true" /> {r.rol}</h3>
                    <p>{r.linea}</p>
                    <span className="fe-tel">Usuario: {r.local}</span>
                    <button type="button" className="fe-btn fe-btn-pri" onClick={() => sesion.entrar(r)} disabled={sesion.cargando === r.id}
                      aria-label={`Entrar como ${r.rol}`}>
                      {sesion.cargando === r.id ? "Entrando…" : `Entrar como ${r.rol}`}
                    </button>
                    {sesion.error[r.id] && (
                      <p className="fe-error" role="alert">{sesion.error[r.id]}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7. Números */}
        <section className="fe-sec" aria-labelledby="fe-numeros">
          <div className="fe-in">
            <p className="fe-kicker">En números</p>
            <h2 id="fe-numeros" className="fe-h2">Medido, no estimado</h2>
            <div className="fe-cifras">{CIFRAS.map((c) => <Cifra key={c.titulo} c={c} />)}</div>
          </div>
        </section>
      </main>

      {/* 8. Pie */}
      <footer className="fe-pie">
        <div className="fe-pie-grid">
          <div><h2>Fuentes de las fichas</h2><ul>{FUENTES.map((f) => <li key={f}>{f}</li>)}</ul></div>
          <div><h2>Normas</h2><ul>{NORMAS.map((n) => <li key={n}>{n}</li>)}</ul></div>
          <div><h2>Proyecto</h2><p style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Ingeniería de Software · Uniautónoma del Cauca</p></div>
        </div>
        <p className="fe-aviso">Datos de demostración. Escribe situaciones inventadas.</p>
      </footer>
    </div>
  );
}
