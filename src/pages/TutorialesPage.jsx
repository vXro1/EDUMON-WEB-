import { useEffect, useState } from "react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { Link, useLocation } from "react-router-dom";
import edumonLogo from "@/assets/icons/edumon-logo-letras.svg";
import edumonLetras from "@/assets/img/edumon-letras.webp";
import mascota from "@/assets/img/edumon-mascota.svg";
import mascotasEquipo from "@/assets/img/edumon-mascotas-jugando.webp";
import avatarVerde from "@/assets/img/avatars/Avatar5.svg";
import avatarProfe from "@/assets/img/avatars/Avatar3.svg";
import circulo1 from "@/assets/img/circulos/circulo1.svg";
import circulo2 from "@/assets/img/circulos/circulo2.svg";
import circulo4 from "@/assets/img/circulos/circulo4.svg";
import circulo5 from "@/assets/img/circulos/circulo5.svg";
import circulo6 from "@/assets/img/circulos/circulo6.svg";
import circulo7 from "@/assets/img/circulos/circulo7.svg";
import circulo9 from "@/assets/img/circulos/circulo9.svg";
import circulo11 from "@/assets/img/circulos/circulo11.svg";
import { TUTORIALES } from "./tutoriales.data";

import "./LandingPage.css";
import "./TutorialesPage.css";

const IconPlay = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
);

const IconArrowLeft = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const IconExternal = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const IconSparkles = ({ size = 14, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.88 5.76L20 10l-5.76 1.88L12 18l-1.88-5.76L4 10l5.76-1.88z" />
    <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
  </svg>
);

const IconStar = ({ size = 16, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const IconYouTube = ({ size = 18 }) => (
  <svg width={size} height={size * 0.72} viewBox="0 0 28 20" aria-hidden="true">
    <rect width="28" height="20" rx="6" fill="#FF0000" />
    <polygon points="11 5.5 19 10 11 14.5" fill="#fff" />
  </svg>
);

const IconDownload = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const BURBUJAS = [
  { src: circulo1, cls: "b1" },
  { src: circulo5, cls: "b2" },
  { src: circulo9, cls: "b4" },
  { src: circulo11, cls: "b6" },
];

const BURBUJAS_CTA = [
  { src: circulo2, cls: "c1" },
  { src: circulo4, cls: "c2" },
  { src: circulo6, cls: "c3" },
  { src: circulo7, cls: "c4" },
  { src: circulo9, cls: "c5" },
];

const CANAL_YOUTUBE = "https://www.youtube.com/@EDUMONEduca";

const ACCESOS = [
  { id: "padres", label: "Soy padre de familia", avatar: avatarVerde, tono: "green" },
  { id: "docentes", label: "Soy docente", avatar: avatarProfe, tono: "cyan" },
];

function VideoPlayer({ t, playing, onPlay }) {
  if (playing) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return (
      <div className="tuto-video">
        <iframe
          className="tuto-video__frame"
          src={`https://www.youtube.com/embed/${t.youtubeId}?autoplay=1&rel=0&playsinline=1&origin=${encodeURIComponent(origin)}`}
          title={t.titulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      className="tuto-video tuto-video--poster"
      onClick={onPlay}
      aria-label={`Video en YouTube: reproducir ${t.titulo}`}
    >
      <img className="tuto-video__thumb" src={t.banner} alt={`Miniatura del video de EDUMON: ${t.titulo}`} width={960} height={540} loading="lazy" />
      <span className="tuto-video__yt" aria-hidden="true">
        <IconYouTube size={18} /> Video en YouTube
      </span>
      <span className="tuto-video__play" aria-hidden="true">
        <IconPlay size={28} />
      </span>
    </button>
  );
}

function TutorialCard({ t }) {
  const [playing, setPlaying] = useState(false);

  return (
    <article className={`tuto-card tuto-card--${t.tono}`} id={t.id}>
      <img className="tuto-card__peek" src={t.mascota} alt={`Mascota de EDUMON del tutorial ${t.titulo}`} aria-hidden="true" draggable={false} />

      <div className="tuto-card__media">
        <VideoPlayer t={t} playing={playing} onPlay={() => setPlaying(true)} />
      </div>

      <div className="tuto-card__body">
        <div className="tuto-card__meta">
          <span className="tuto-card__num">{t.numero}</span>
          {t.publico.map((p) => (
            <span className="tuto-chip" key={p}>{p}</span>
          ))}
        </div>

        <h2 className="tuto-card__title">{t.titulo}</h2>
        <p className="tuto-card__desc">{t.desc}</p>

        <ol className="tuto-card__steps">
          {t.puntos.map((p, i) => (
            <li key={p}>
              <span className="tuto-card__step-num">{i + 1}</span>
              {p}
            </li>
          ))}
        </ol>

        <div className="tuto-card__actions">
          {!playing && (
            <button type="button" className="tuto-btn tuto-btn--main" onClick={() => setPlaying(true)}>
              <IconPlay size={14} /> Ver tutorial
            </button>
          )}
          <a
            className="tuto-btn tuto-btn--ghost"
            href={`https://youtu.be/${t.youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconYouTube size={20} /> Abrir en YouTube <IconExternal size={12} />
          </a>
        </div>
      </div>
    </article>
  );
}

export default function TutorialesPage() {
  const { hash } = useLocation();

  usePageMeta({
    title: "Tutoriales de EDUMON | Aprende a usar la plataforma",
    description: "Videos tutoriales de EDUMON para docentes y padres de familia: aprende a usar la app móvil y la plataforma web paso a paso.",
    path: "/tutoriales",
  });

  useEffect(() => {
    const target = hash && document.getElementById(hash.slice(1));
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    else window.scrollTo(0, 0);
  }, [hash]);

  const irA = (e, id) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="landing tuto-page">
      <header className="landing-header">
        <nav className="landing-nav">
          <Link to="/" className="landing-nav__logo" aria-label="Ir al inicio de Edumon">
            <img src={edumonLogo} alt="Logo de EDUMON" className="landing-nav__logo-img" />
          </Link>

          <Link to="/" className="tuto-back" aria-label="Volver al inicio">
            <IconArrowLeft size={16} />
            <span>Volver al inicio</span>
          </Link>
        </nav>
      </header>

      <main>
        <section className="tuto-hero">
          <div className="tuto-hero__bubbles" aria-hidden="true">
            {BURBUJAS.map((b) => (
              <img key={b.cls} src={b.src} alt="" className={`tuto-bubble tuto-bubble--${b.cls}`} />
            ))}
          </div>

          <div className="tuto-hero__inner">
            <div className="tuto-hero__content">
              <h1 className="tuto-hero__title">
                <span className="tuto-hero__line">Aprende a usar</span>
                <img src={edumonLetras} alt="EDUMON" className="tuto-hero__letras" width={900} height={354} fetchPriority="high" />
                <span className="tuto-hero__line">
                  <span className="tuto-mark">paso a paso</span>
                </span>
              </h1>

              <p className="tuto-hero__text">
                Videos cortos y sencillos para que padres de familia y docentes
                instalen la app móvil y le saquen el máximo provecho desde el primer día.
              </p>

              <div className="tuto-hero__accesos">
                {ACCESOS.map((a) => (
                  <a
                    key={a.id}
                    href={`#${a.id}`}
                    onClick={(e) => irA(e, a.id)}
                    className={`tuto-acceso tuto-acceso--${a.tono}`}
                  >
                    <img src={a.avatar} alt={`Mascota de EDUMON para ${a.label}`} aria-hidden="true" />
                    {a.label}
                  </a>
                ))}
              </div>

              <a
                className="tuto-hero__canal"
                href={CANAL_YOUTUBE}
                target="_blank"
                rel="noopener noreferrer"
              >
                Todos los videos están en nuestro canal de YouTube <strong>@EDUMONEduca</strong>
                <IconExternal size={12} />
              </a>
            </div>

            <div className="tuto-hero__visual" aria-hidden="true">
              <div className="tuto-hero__circle" />
              <IconStar size={22} className="tuto-spark tuto-spark--1" />
              <IconSparkles size={26} className="tuto-spark tuto-spark--2" />
              <div className="tuto-hero__bubble-talk">¡Dale play y aprende conmigo!</div>
              <img src={mascota} alt="Mascota de EDUMON" className="tuto-hero__mascota" width={660} height={626} />
            </div>
          </div>

        </section>

        <section className="tuto-list" aria-label="Lista de tutoriales">
          {TUTORIALES.map((t) => (
            <TutorialCard key={t.id} t={t} />
          ))}
        </section>

        <section className="tuto-cta">
          <div className="tuto-cta__card">
            <div className="tuto-cta__bubbles" aria-hidden="true">
              {BURBUJAS_CTA.map((b) => (
                <img key={b.cls} src={b.src} alt="" className={`tuto-cta__bubble tuto-cta__bubble--${b.cls}`} />
              ))}
            </div>
            <div className="tuto-cta__content">
              <h2 className="tuto-cta__title">¿Aún no tienes la app?</h2>
              <p className="tuto-cta__text">
                Descárgala gratis para Android y únete a la familia Edumon.
              </p>
              <Link to="/#app" className="tuto-cta__btn">
                <IconDownload size={18} />
                Ir a descargar
              </Link>
            </div>
            <img src={mascotasEquipo} alt="Las mascotas de EDUMON" className="tuto-cta__crew" width={640} height={427} loading="lazy" />
          </div>
        </section>
      </main>

      <footer className="landing-footer__bottom">
        © 2026 Edumon. Todos los derechos reservados. Proyecto educativo sin fines de lucro.
      </footer>
    </div>
  );
}
