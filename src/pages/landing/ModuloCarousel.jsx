// Carrusel de módulos de la landing. Va en un chunk aparte (con embla-carousel)
// y se descarga cuando la sección se acerca a la pantalla, no al cargar la página.
import { useState, useEffect, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const IconUsers = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const IconChevronLeft = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const IconChevronRight = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const IconApple = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 6.5c-3.5 0-6.5 2.7-6.5 7.3 0 4 2.7 8.2 5.5 8.2 1 0 1.5-.5 2-.5s1 .5 2 .5c2.3 0 4-2.8 5-5.6" />
    <path d="M12 6.5c0-2.1 1.6-3.8 3.7-3.8" />
    <path d="M15.3 9.3c2.1 0 3.9 2 3.9 4.7" />
  </svg>
);

const IconHeartHandshake = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 7c-1.3-1.9-3.7-2.5-5.6-1.2C4.6 7 3.8 9.7 5.2 11.8L12 19l6.8-7.2c1.4-2.1.6-4.8-1.4-6.1C15.5 4.5 13.3 5.1 12 7z" />
    <path d="M8 12.5l2 2 2-2 2 2" />
  </svg>
);

const IconSmile = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);

const IconShieldCheck = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const IconMessageCircle = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.5 8.5 0 01-8.5 8.5 8.4 8.4 0 01-4-1L3 21l2-4.5a8.4 8.4 0 01-1-4A8.5 8.5 0 0112.5 3 8.5 8.5 0 0121 11.5z" />
  </svg>
);

const IconSprout = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21V10" />
    <path d="M12 10C12 6 9 4 5 4c0 4 2 7 7 7z" />
    <path d="M12 10c0-3.5 2.5-5 6-5 0 3.5-1.5 6.5-6 6.5" />
  </svg>
);

const IconRepeat = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 2l4 4-4 4" />
    <path d="M3 11V9a4 4 0 014-4h14" />
    <path d="M7 22l-4-4 4-4" />
    <path d="M21 13v2a4 4 0 01-4 4H3" />
  </svg>
);

const IconPuzzle = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 7h3.3a1.5 1.5 0 000-3H7V3h4v1.3a1.5 1.5 0 003 0V3h4v4h-1.3a1.5 1.5 0 000 3H20v4h-1.3a1.5 1.5 0 000 3H20v4h-4v-1.3a1.5 1.5 0 00-3 0V21H9v-1.3a1.5 1.5 0 00-3 0V21H4v-4h1.3a1.5 1.5 0 000-3H4z" />
  </svg>
);

const IconCompass = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <polygon points="15 9 13 13 9 15 11 11 15 9" />
  </svg>
);

const MODULOS = [
  {
    icon: <IconUsers size={24} />,
    color: "#0C6AC4",
    title: "Mi familia y mi identidad",
    desc: "Ayuda a tu hijo a sentirse querido, reconocer quién es y valorar a su familia y comunidad.",
  },

  {
    icon: <IconHeartHandshake size={24} />,
    color: "#F23D7F",
    title: "Sentirse querido y seguro",
    desc: "Fortalece los vínculos afectivos y acompaña a tu hijo para que crezca sintiéndose valorado y protegido.",
  },

  {
    icon: <IconMessageCircle size={24} />,
    color: "#0DC5E2",
    title: "Hablar, imaginar y expresar",
    desc: "Anima a tu hijo a contar sus ideas, sentimientos y emociones mediante palabras, juegos, dibujos y otras formas de expresión.",
  },

  {
    icon: <IconSmile size={24} />,
    color: "#FCBD00",
    title: "Mis emociones",
    desc: "Aprende a reconocer y acompañar las emociones de tu hijo para que pueda expresarlas de manera saludable.",
  },

  {
    icon: <IconCompass size={24} />,
    color: "#41D958",
    title: "Explorar y descubrir",
    desc: "Acompaña a tu hijo a observar, preguntar, experimentar y descubrir cómo funciona el mundo que lo rodea.",
  },

  {
    icon: <IconPuzzle size={24} />,
    color: "#0C6AC4",
    title: "Aprender a resolver problemas",
    desc: "Invita a tu hijo a buscar soluciones, tomar pequeñas decisiones y aprender de las situaciones de la vida cotidiana.",
  },

  {
    icon: <IconSprout size={24} />,
    color: "#41D958",
    title: "Descubrir mi entorno",
    desc: "Ayuda a tu hijo a conocer, cuidar y apropiarse de los espacios, lugares y comunidad donde vive.",
  },

  {
    icon: <IconRepeat size={24} />,
    color: "#FCBD00",
    title: "Aprender con el cuerpo y el movimiento",
    desc: "Promueve juegos y actividades donde tu hijo pueda moverse libremente, explorar y conocer su propio cuerpo.",
  },

  {
    icon: <IconShieldCheck size={24} />,
    color: "#0DC5E2",
    title: "Límites con amor",
    desc: "Establece límites claros y respetuosos que ayuden a tu hijo a sentirse seguro y aprender a convivir con los demás.",
  },

  {
    icon: <IconHeartHandshake size={24} />,
    color: "#F23D7F",
    title: "Familia que dialoga",
    desc: "Crea espacios para conversar, escuchar y compartir en familia, fortaleciendo la confianza y los vínculos.",
  },

  {
    icon: <IconApple size={24} />,
    color: "#41D958",
    title: "Cuidar y crecer juntos",
    desc: "Descubre prácticas sencillas para acompañar el desarrollo integral de tu hijo desde el hogar.",
  },
];

function ModuloCard({ m }) {
  return (
    <article
      className="modulo-card"
      style={{ "--m-color": m.color }}
    >
      <div className="modulo-card__bar" style={{ background: m.color }} />
      <div className="modulo-card__body">
        <div
          className="modulo-card__icon"
          style={{ background: `${m.color}1f`, color: m.color, boxShadow: `0 10px 22px ${m.color}40` }}
        >
          {m.icon}
        </div>
        <h3 className="modulo-card__title">{m.title}</h3>
        <p className="modulo-card__desc">{m.desc}</p>
      </div>
    </article>
  );
}

const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

/* Hook: calcula, para cada slide, su distancia (en fracción de
   "snap") respecto al punto de scroll actual. Es el patrón oficial
   de Embla para animar scale/opacity en función del scroll, sin
   tocar `left`/`width` (todo vía transform, barato para el GPU). */
function useEmblaTween(emblaApi) {
  const [tweenValues, setTweenValues] = useState([]);

  const onScroll = useCallback(() => {
    if (!emblaApi) return;
    const progress = emblaApi.scrollProgress();
    const snaps = emblaApi.scrollSnapList();
    setTweenValues(snaps.map((snap) => snap - progress));
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onScroll();
    emblaApi.on("scroll", onScroll);
    emblaApi.on("reInit", onScroll);
    return () => {
      emblaApi.off("scroll", onScroll);
      emblaApi.off("reInit", onScroll);
    };
  }, [emblaApi, onScroll]);

  return tweenValues;
}

/* Cuántas tarjetas se ven (y avanzan) a la vez según el ancho:
   PC avanza en grupos de 3, tablet de 2, móvil sigue de a una. */
function getPerView() {
  if (typeof window === "undefined") return 3;
  const w = window.innerWidth;
  if (w <= 640) return 1;
  if (w <= 1024) return 2;
  return 3;
}

/* ── Carrusel de módulos ("Featured Cards") ──
   En móvil: una tarjeta centrada a escala completa, las vecinas se
   asoman más pequeñas y atenuadas (efecto scroll con Embla).
   En PC/tablet: rejilla de 3 (o 2) tarjetas que avanza por grupos,
   todas a la misma escala. */
export default function ModuloCarousel() {
  const reduceMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );

  const [perView, setPerView] = useState(getPerView);
  const singleView = perView === 1;

  useEffect(() => {
    const onResize = () => setPerView(getPerView());
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const autoplay = useRef(
    Autoplay({
      delay: 5000,
      stopOnMouseEnter: true,
      stopOnInteraction: false,
      playOnInit: !reduceMotion.current,
    })
  );

  /* ─────────────────────────────────────────
     EMBLA — CARRUSEL INFINITO
  ───────────────────────────────────────── */

  const emblaOptions = {
    align: singleView ? "center" : "start",
    loop: true,
    slidesToScroll: perView,
    skipSnaps: false,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(emblaOptions, [autoplay.current]);

  /* align + slidesToScroll dependen de perView: al cruzar un
     breakpoint hay que re-inicializar el motor. */
  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.reInit({
      align: singleView ? "center" : "start",
      loop: true,
      slidesToScroll: perView,
      skipSnaps: false,
    });
  }, [emblaApi, perView, singleView]);

  const tweenValues = useEmblaTween(emblaApi);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState([]);

  useEffect(() => {
    if (!emblaApi) return;
    const update = () => setScrollSnaps(emblaApi.scrollSnapList());
    update();
    emblaApi.on("reInit", update);
    return () => emblaApi.off("reInit", update);
  }, [emblaApi]);

  /* ─────────────────────────────────────────
     ACTUALIZAR CARD ACTIVA
  ───────────────────────────────────────── */

  const onSelect = useCallback(() => {
    if (!emblaApi) return;

    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  /* ─────────────────────────────────────────
     NAVEGACIÓN
  ───────────────────────────────────────── */

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (i) => {
      emblaApi?.scrollTo(i);
    },
    [emblaApi]
  );

  /* ─────────────────────────────────────────
     TECLADO
  ───────────────────────────────────────── */

  const onViewportKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollPrev();
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollNext();
    }
  };

  return (
    <div className="modulo-embla">

      {/* ───────────────── VIEWPORT ───────────────── */}

      <div
        className="modulo-embla__viewport"
        ref={emblaRef}
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label="Módulos de aprendizaje"
        onKeyDown={onViewportKeyDown}
      >

        <div className="modulo-embla__container">

          {MODULOS.map((m, i) => {

            /*
              Embla proporciona la posición de cada card.

              Esto permite crear el efecto de:
              - card activa = grande
              - cards laterales = más pequeñas
              - cards laterales = ligeramente transparentes
            */

            const diff = tweenValues[i] ?? 0;

            /* El efecto de zoom/atenuación por scroll solo aplica en
               móvil (una tarjeta). En PC las 3 tarjetas del grupo se
               ven iguales, a escala completa. */
            const scale = singleView
              ? clamp(1 - Math.abs(diff) * 0.24, 0.82, 1)
              : 1;

            const opacity = singleView
              ? clamp(1 - Math.abs(diff) * 0.65, 0.4, 1)
              : 1;

            const isActive = singleView && i === selectedIndex;

            return (
              <div
                className="modulo-embla__slide"
                key={m.title}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} de ${MODULOS.length}: ${m.title}`}
              >

                <div
                  className={`modulo-embla__slide__inner ${
                    isActive ? "is-active" : ""
                  }`}

                  /*
                    Importante:
                    mantenemos el efecto de zoom
                    controlado por JS.
                  */
                  style={{
                    transform: `scale(${scale})`,
                    opacity,
                  }}

                  onClick={() => {
                    if (singleView && !isActive) {
                      scrollTo(i);
                    }
                  }}

                  tabIndex={singleView && !isActive ? 0 : -1}

                  onKeyDown={(e) => {
                    if (
                      singleView &&
                      !isActive &&
                      (e.key === "Enter" || e.key === " ")
                    ) {
                      e.preventDefault();
                      scrollTo(i);
                    }
                  }}
                >

                  <ModuloCard m={m} />

                </div>
              </div>
            );
          })}

        </div>
      </div>

      {/* ───────────────── FLECHA ANTERIOR ───────────────── */}

      <button
        type="button"
        className="modulo-embla__arrow modulo-embla__arrow--prev"
        onClick={scrollPrev}
        aria-label="Módulo anterior"
      >
        <IconChevronLeft size={20} />
      </button>

      {/* ───────────────── FLECHA SIGUIENTE ───────────────── */}

      <button
        type="button"
        className="modulo-embla__arrow modulo-embla__arrow--next"
        onClick={scrollNext}
        aria-label="Siguiente módulo"
      >
        <IconChevronRight size={20} />
      </button>

      {/* ───────────────── DOTS ───────────────── */}

      <div
        className="modulo-embla__dots"
        role="tablist"
        aria-label="Selecciona un grupo de módulos"
      >

        {scrollSnaps.map((_, i) => (

          <button
            type="button"
            key={i}
            role="tab"

            aria-selected={i === selectedIndex}

            aria-label={`Ir al grupo ${i + 1} de ${scrollSnaps.length}`}

            className={`modulo-embla__dot ${
              i === selectedIndex ? "is-active" : ""
            }`}

            onClick={() => scrollTo(i)}
          />

        ))}

      </div>

    </div>
  );
}
