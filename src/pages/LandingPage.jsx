import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { buzonEnviar } from '@/features/buzon/services/buzonService';
import { appMovilGetActual } from '@/services/appMovilService';
import { normalizePhone } from '@/utils/normalizePhone';
import { formatBytes } from '@/utils/formatBytes';
import { TUTORIALES } from './tutoriales.data';
import useDialogFocus from '@/hooks/useDialogFocus';
import edumonLogo from '@/assets/icons/edumon-logo-letras.svg';
import edumonIcono from '@/assets/icons/edumon-logo.svg';
import edumonLetras from '@/assets/img/edumon-letras-sm.webp';
import mascota from '@/assets/img/edumon-mascota.svg';
import soporte from '@/assets/img/edumon-mascota-buzon-soporte.svg';
import mascotasEquipo from '@/assets/img/edumon-mascotas-jugando.webp';

/* ─── Burbujas decorativas (assets reales) ─── */
import circulo1 from '@/assets/img/circulos/circulo1.svg';
import circulo2 from '@/assets/img/circulos/circulo2.svg';
import circulo3 from '@/assets/img/circulos/circulo3.svg';
import circulo4 from '@/assets/img/circulos/circulo4.svg';
import circulo5 from '@/assets/img/circulos/circulo5.svg';
import circulo6 from '@/assets/img/circulos/circulo6.svg';
import circulo7 from '@/assets/img/circulos/circulo7.svg';
import circulo8 from '@/assets/img/circulos/circulo8.svg';
import circulo9 from '@/assets/img/circulos/circulo9.svg';
import circulo10 from '@/assets/img/circulos/circulo10.svg';
import circulo11 from '@/assets/img/circulos/circulo11.svg';
import circulo12 from '@/assets/img/circulos/circulo12.svg';

import './LandingPage.css';

const ModuloCarousel = lazy(() => import('./landing/ModuloCarousel'));

// Monta a sus hijos solo cuando el contenedor se acerca a la pantalla; mientras
// tanto reserva el alto para no mover el contenido
function CargarAlVer({ children, alto, margen = '300px' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(typeof IntersectionObserver === 'undefined');
  useEffect(() => {
    if (visible || !ref.current) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: margen },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [visible, margen]);
  const reserva = <div style={{ minHeight: alto }} aria-hidden="true" />;
  return <div ref={ref}>{visible ? <Suspense fallback={reserva}>{children}</Suspense> : reserva}</div>;
}

const CIRCULOS = [
  circulo1,
  circulo2,
  circulo3,
  circulo4,
  circulo5,
  circulo6,
  circulo7,
  circulo8,
  circulo9,
  circulo10,
  circulo11,
  circulo12,
];

/* ─── Iconos SVG inline ─── */
const IconSparkles = ({ size = 14, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3l1.88 5.76L20 10l-5.76 1.88L12 18l-1.88-5.76L4 10l5.76-1.88z" />
    <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
  </svg>
);

const IconCheck = ({ size = 16, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconHome = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
    <path d="M9 21V12h6v9" />
  </svg>
);

const IconUsers = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const IconAward = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="6" />
    <path d="M8.56 14.59L7 22l5-3 5 3-1.56-7.41" />
  </svg>
);

const IconArrowRight = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconPlay = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const IconSend = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const IconMail = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <polyline points="2 4 12 13 22 4" />
  </svg>
);

const IconYoutube = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="5" width="20" height="14" rx="4" />
    <polygon points="10 9 15 12 10 15 10 9" fill="currentColor" />
  </svg>
);

const IconMapPin = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconLogIn = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);

const IconHeart = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
  </svg>
);

const IconNavigation = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="3 11 22 2 13 21 11 13 3 11" />
  </svg>
);

const IconStar = ({ size = 16, className }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={className}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

/* ─── Iconos de los módulos de aprendizaje ─── */
const IconSmartphone = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="6" y="2" width="12" height="20" rx="2" />
    <line x1="11" y1="18" x2="13" y2="18" />
  </svg>
);

const IconAndroid = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M6 18a1 1 0 001 1h1v3a1.5 1.5 0 003 0v-3h2v3a1.5 1.5 0 003 0v-3h1a1 1 0 001-1V9H6zM3.5 9A1.5 1.5 0 002 10.5v6a1.5 1.5 0 003 0v-6A1.5 1.5 0 003.5 9zm17 0a1.5 1.5 0 00-1.5 1.5v6a1.5 1.5 0 003 0v-6A1.5 1.5 0 0020.5 9zM15.53 2.16l1.3-1.3a.4.4 0 00-.57-.56l-1.48 1.48A6.9 6.9 0 0012 1c-.99 0-1.93.2-2.78.55L7.74.06a.4.4 0 00-.57.56l1.3 1.3A6.53 6.53 0 006 7.5h12a6.53 6.53 0 00-2.47-5.34zM9.75 5.25a.75.75 0 110-1.5.75.75 0 010 1.5zm4.5 0a.75.75 0 110-1.5.75.75 0 010 1.5z" />
  </svg>
);

const IconDownload = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

/* ── Datos ── */
const CONTACTO = {
  correo: 'edumonsoporte@gmail.com',
  youtube: 'https://www.youtube.com/@EDUMONEduca',
  youtubeHandle: '@EDUMONEduca',
};

const Letras = () => <img src={edumonLetras} alt="EDUMON" className="edumon-letras" width={480} height={189} />;

const NAV_LINKS = [
  { label: 'Inicio', href: '#inicio' },
  { label: 'Pilares', href: '#pilares' },
  { label: 'Aprende', href: '#aprende' },
  { label: 'Quiénes somos', href: '#quienes' },
  { label: 'Contáctanos', href: '#contacto' },
  { label: 'App', href: '#app' },
];

/* Equipo mostrado en "Quiénes somos" — se renderiza con clases CSS
   (.quienes-member-card__avatar), sin estilos inline. */
const EQUIPO = [
  { iniciales: 'VM', nombre: 'Veronica Mancilla', rol: 'Diseñadora UX/UI', tono: 'pink' },
  { iniciales: 'BY', nombre: 'Bryan David Yepes', rol: 'Desarrollador Backend', tono: 'blue' },
];

const PILARES = [
  {
    icon: <IconHome size={40} />,
    title: 'Educación completa, en un solo lugar',
    desc: 'Crea y comparte experiencias sobre valores, emociones, vínculos afectivos, convivencia familiar y cuidado, todo desde un solo lugar, fácil de usar. Porque en la primera infancia educar es acompañar el desarrollo integral.',
  },
  {
    icon: <IconUsers size={40} />,
    title: 'La familia como parte activa del aprendizaje',
    desc: 'Los padres y tutores reciben avisos, entregan actividades y siguen de cerca el proceso de sus hijos en tiempo real, desde cualquier dispositivo.',
  },
  {
    icon: <IconAward size={40} />,
    title: 'Motivación que se ve y se siente',
    desc: 'Edumon convierte el aprendizaje en un juego, con premios y logros que animan a los estudiantes y a toda la familia a seguir participando.',
  },
];

/* ── Config de burbujas decorativas por sección ──
   circulo: índice 1-12 del asset (src/assets/img/circulos/circuloN.svg)
   anim: variante de animación flotante (a | b | c)
   Todas usan position absolute dentro de un contenedor .deco-bubbles */
/* Menos burbujas y más tenues: antes saturaban cada sección (6 arrays,
   ~35 SVGs). Ahora 2-4 por sección y con poca opacidad, para que
   acompañen sin competir con el contenido. */
const HERO_BUBBLES = [
  { circulo: 1, top: '5%', left: '1%', size: '140px', opacity: 0.5, anim: 'a', delay: '0s' },
  { circulo: 7, bottom: '8%', left: '6%', size: '94px', opacity: 0.42, anim: 'c', delay: '0.5s' },
  { circulo: 2, top: '7%', right: '4%', size: '86px', opacity: 0.44, anim: 'b', delay: '0.3s' },
  { circulo: 5, bottom: '5%', right: '3%', size: '118px', opacity: 0.48, anim: 'a', delay: '0.8s' },
  { circulo: 10, top: '40%', left: '3%', size: '40px', opacity: 0.4, anim: 'b', delay: '1.4s' },
];

const PILARES_BUBBLES = [
  { circulo: 3, top: '2%', left: '3%', size: '76px', opacity: 0.24, anim: 'a', delay: '0.2s' },
  { circulo: 8, top: '10%', right: '4%', size: '66px', opacity: 0.24, anim: 'c', delay: '0.6s' },
  { circulo: 11, bottom: '2%', right: '12%', size: '50px', opacity: 0.22, anim: 'b', delay: '1.9s' },
  { circulo: 6, bottom: '8%', left: '5%', size: '44px', opacity: 0.2, anim: 'a', delay: '1.1s' },
];

const APRENDE_BUBBLES = [
  { circulo: 9, top: '3%', left: '2%', size: '60px', opacity: 0.24, anim: 'b', delay: '0.4s' },
  { circulo: 7, bottom: '3%', right: '6%', size: '74px', opacity: 0.24, anim: 'b', delay: '0.2s' },
  { circulo: 12, top: '12%', right: '3%', size: '46px', opacity: 0.2, anim: 'c', delay: '1s' },
];

const QUIENES_BUBBLES = [
  { circulo: 5, top: '6%', right: '2%', size: '100px', opacity: 0.24, anim: 'a', delay: '0s' },
  { circulo: 8, bottom: '6%', left: '3%', size: '64px', opacity: 0.22, anim: 'b', delay: '1.2s' },
  { circulo: 10, bottom: '20%', right: '22%', size: '44px', opacity: 0.2, anim: 'c', delay: '1.7s' },
];

const TUTORIALES_BUBBLES = [
  { circulo: 11, top: '6%', right: '3%', size: '70px', opacity: 0.22, anim: 'b', delay: '0.4s' },
  { circulo: 1, bottom: '6%', left: '3%', size: '58px', opacity: 0.2, anim: 'a', delay: '1.3s' },
];

const APP_BUBBLES = [
  { circulo: 4, top: '8%', left: '3%', size: '64px', opacity: 0.24, anim: 'a', delay: '0.3s' },
  { circulo: 6, bottom: '8%', right: '5%', size: '76px', opacity: 0.24, anim: 'c', delay: '1.1s' },
];

const CONTACTO_BUBBLES = [
  { circulo: 2, top: '3%', left: '0%', size: '82px', opacity: 0.24, anim: 'a', delay: '0.3s' },
  { circulo: 12, bottom: '5%', left: '16%', size: '48px', opacity: 0.22, anim: 'b', delay: '1.5s' },
  { circulo: 9, bottom: '12%', right: '8%', size: '42px', opacity: 0.2, anim: 'a', delay: '2s' },
];

const FOOTER_BUBBLES = [
  { circulo: 6, top: '6%', left: '4%', size: '58px', opacity: 0.2, anim: 'a', delay: '0.4s' },
  { circulo: 3, top: '12%', right: '6%', size: '66px', opacity: 0.2, anim: 'c', delay: '0.8s' },
  { circulo: 8, bottom: '6%', right: '18%', size: '44px', opacity: 0.18, anim: 'a', delay: '1.9s' },
];

/* ── Componente de burbujas decorativas reutilizable ── */
function DecoBubbles({ items, className = '' }) {
  return (
    <div className={`deco-bubbles ${className}`} aria-hidden="true">
      {items.map((b, i) => (
        <img
          key={i}
          src={CIRCULOS[b.circulo - 1]}
          alt=""
          draggable={false}
          className={`deco-bubble deco-bubble--${b.anim ?? 'a'}`}
          style={{
            top: b.top,
            left: b.left,
            right: b.right,
            bottom: b.bottom,
            width: b.size,
            opacity: b.opacity ?? 1,
            animationDelay: b.delay ?? '0s',
          }}
        />
      ))}
    </div>
  );
}

function useIntersect(ref, threshold = 0.15) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold },
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return visible;
}

/* ── Tarjeta individual del carrusel ── */
export default function LandingPage() {
  usePageMeta({
    title: 'EDUMON | Plataforma educativa para docentes y familias',
    description:
      'EDUMON integra a docentes, estudiantes y familias para acompañar el desarrollo integral de cada niño: cursos, retos, calificaciones, foros y calendario.',
    path: '/',
  });
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    telefono: '',
    institucion: '',
    mensaje: '',
  });
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [submitError, setSubmitError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const confirmPanelRef = useRef(null);
  const closeConfirm = useCallback(() => setShowConfirm(false), []);
  useDialogFocus(confirmPanelRef, showConfirm, closeConfirm);
  // Versión activa del APK (GET /apk/actual, público). null = sin publicar
  // (404) — la sección "App" cae con gracia a "Próximamente".
  const [appBuild, setAppBuild] = useState(null);

  useEffect(() => {
    let alive = true;
    appMovilGetActual()
      .then((res) => {
        if (alive) setAppBuild(res?.apk ?? null);
      })
      .catch(() => {
        if (alive) setAppBuild(null);
      });
    return () => {
      alive = false;
    };
  }, []);

  const heroRef = useRef(null);
  const pilaresRef = useRef(null);
  const aprendeRef = useRef(null);
  const quienesRef = useRef(null);
  const appRef = useRef(null);
  const tutorialesRef = useRef(null);
  const contactoRef = useRef(null);

  const pilaresVis = useIntersect(pilaresRef);
  const aprendeVis = useIntersect(aprendeRef);
  const quienesVis = useIntersect(quienesRef);
  const appVis = useIntersect(appRef);
  const tutorialesVis = useIntersect(tutorialesRef);
  const contactoVis = useIntersect(contactoRef);

  useEffect(() => {
    if (!hash) return;
    const id = setTimeout(() => {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
    return () => clearTimeout(id);
  }, [hash]);

  useEffect(() => {
    const sections = ['inicio', 'pilares', 'aprende', 'quienes', 'contacto', 'app', 'tutoriales'];
    const handler = () => {
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const handleNav = (e, href) => {
    e.preventDefault();
    setMenuOpen(false);
    const id = href.replace('#', '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFormChange = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitStatus('idle');
    setSubmitError('');
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setShowConfirm(false);
    setSubmitStatus('loading');
    setSubmitError('');
    try {
      const payload = {
        ...formData,
        telefono: normalizePhone(formData.telefono) ?? formData.telefono,
      };
      await buzonEnviar(payload);
      setSubmitStatus('success');
      setFormData({ nombre: '', correo: '', telefono: '', institucion: '', mensaje: '' });
    } catch (err) {
      setSubmitStatus('error');
      if (err.validationErrors?.length) {
        const FIELD_LABELS = {
          nombre: 'Nombre',
          correo: 'Correo',
          telefono: 'Teléfono',
          mensaje: 'Mensaje',
        };
        const msgs = err.validationErrors.map((ve) => `${FIELD_LABELS[ve.path] ?? ve.path}: ${ve.msg}`);
        setSubmitError(msgs.join(' · '));
      } else {
        setSubmitError(err.message || 'No se pudo enviar el mensaje. Intenta de nuevo.');
      }
    }
  };

  return (
    <div className="landing">
      <header className="landing-header">
        <nav className="landing-nav">
          <a href="#inicio" className="landing-nav__logo" onClick={(e) => handleNav(e, '#inicio')}>
            <img src={edumonLogo} alt="Logo de EDUMON" className="landing-nav__logo-img" width={699} height={372} />
          </a>

          <ul className="landing-nav__links">
            {NAV_LINKS.map((l, index) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={(e) => handleNav(e, l.href)}
                  className={`${activeSection === l.href.replace('#', '') ? 'active' : ''} nav-color-${index + 1}`}
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <Link to="/tutoriales" className="landing-nav__tutoriales">
                <IconPlay size={11} />
                Tutoriales
              </Link>
            </li>
          </ul>

          <button className="landing-nav__cta" onClick={() => navigate('/login')}>
            <IconLogIn size={16} />
            Inicio de sesión
          </button>

          <button
            className="landing-nav__hamburger"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
            <span className={`hamburger-line ${menuOpen ? 'open' : ''}`} />
          </button>
        </nav>

        <div className={`landing-nav__mobile-menu ${menuOpen ? 'open' : ''}`}>
          {NAV_LINKS.map((l, index) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => {
                handleNav(e, l.href);
                setMenuOpen(false);
              }}
              className={`nav-color-${index + 1}`}
            >
              {l.label}
            </a>
          ))}
          <Link to="/tutoriales" className="landing-nav__tutoriales" onClick={() => setMenuOpen(false)}>
            <IconPlay size={11} />
            Tutoriales
          </Link>
          <button
            className="landing-nav__mobile-cta"
            onClick={() => {
              navigate('/login');
              setMenuOpen(false);
            }}
          >
            <IconLogIn size={16} />
            Inicio de sesión
          </button>
        </div>
      </header>

      <section id="inicio" className="landing-hero" ref={heroRef}>
        <DecoBubbles items={HERO_BUBBLES} />

        <div className="landing-hero__content-row">
          <div className="landing-hero__content">
            <h1 className="landing-hero__title">
              <span className="sr-only">EDUMON: </span>
              <span className="gradient-word">Pequeños pasos, grandes aprendizajes.</span>
            </h1>

            <p className="landing-hero__subtitle">
              Edumon integra a profesores, estudiantes y familias en un mismo espacio, para acompañar a cada niño en su
              desarrollo integral, fortaleciendo sus aprendizajes, emociones, vínculos y convivencia.
            </p>

            <div className="landing-hero__actions">
              <a href="#contacto" className="landing-hero__btn-primary" onClick={(e) => handleNav(e, '#contacto')}>
                Quiero saber más <IconArrowRight size={16} />
              </a>
              <a href="#pilares" className="landing-hero__btn-secondary" onClick={(e) => handleNav(e, '#pilares')}>
                <IconPlay size={14} /> Ver cómo funciona
              </a>
            </div>
          </div>

          <div className="edumon-mascot-visual" aria-hidden="true">
            <IconSparkles size={28} className="edumon-mascot-sparkle edumon-mascot-sparkle--1" />
            <IconStar size={18} className="edumon-mascot-sparkle edumon-mascot-sparkle--2" />
            <IconStar size={13} className="edumon-mascot-sparkle edumon-mascot-sparkle--3" />
            <IconSparkles size={16} className="edumon-mascot-sparkle edumon-mascot-sparkle--4" />
            <IconStar size={22} className="edumon-mascot-sparkle edumon-mascot-sparkle--5" />
            <IconSparkles size={12} className="edumon-mascot-sparkle edumon-mascot-sparkle--6" />
            <IconStar size={15} className="edumon-mascot-sparkle edumon-mascot-sparkle--7" />
            <img
              src={mascota}
              alt="Mascota de EDUMON saludando con su mochila"
              className="edumon-mascot-img"
              width={660}
              height={626}
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

      <section
        id="pilares"
        className="landing-pilares"
        ref={pilaresRef}
        style={{ transform: pilaresVis ? 'none' : 'translateY(12px)', transition: 'transform 0.6s ease' }}
      >
        <DecoBubbles items={PILARES_BUBBLES} />

        <div className="pilares-content">
          <div className="pilares-label">
            <IconSparkles size={13} />
            Pilares
          </div>

          <h2 className="pilares-title">
            <span className="pilares-rainbow"> Aprende de forma integral</span>
          </h2>

          <div className="pilares-divider" />

          <p className="pilares-subtitle">
            Tres pilares que transforman la experiencia educativa de toda la comunidad escolar.
          </p>

          <div className="pilares-grid">
            {PILARES.map((p) => (
              <div className="pilar-card" key={p.title}>
                <div className="pilar-card__icon-circle">{p.icon}</div>
                <h3 className="pilar-card__title">{p.title}</h3>
                <p className="pilar-card__desc">{p.desc}</p>
                <div className="pilar-card__bar" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="aprende"
        className="landing-aprende"
        ref={aprendeRef}
        style={{
          transform: aprendeVis ? 'none' : 'translateY(12px)',
          transition: 'transform 0.6s ease',
        }}
      >
        <DecoBubbles items={APRENDE_BUBBLES} />

        <div className="aprende-content">
          <div className="aprende-head">
            <div className="aprende-head__label">
              <IconSparkles size={13} />
              Módulos de aprendizaje
            </div>

            <h2 className="aprende-head__title">
              ¿Qué podrás aprender en <Letras />?
            </h2>

            <p className="aprende-head__desc">
              Cada módulo propone experiencias prácticas para compartir y aprender con tus hijos desde el primer día,
              con orientaciones sencillas y cercanas para acompañar su desarrollo integral.
            </p>
          </div>

          <CargarAlVer alto={340}>
            <ModuloCarousel />
          </CargarAlVer>
        </div>
      </section>

      <section
        id="quienes"
        className="landing-section--alt"
        ref={quienesRef}
        style={{
          transform: quienesVis ? 'none' : 'translateY(12px)',
          transition: 'transform 0.6s ease',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <DecoBubbles items={QUIENES_BUBBLES} />

        <div className="landing-quienes">
          <div className="quienes-content">
            <div className="section-label">
              <IconSparkles size={14} />
              Quiénes somos
            </div>

            <h2 className="quienes-content__title">Nacimos en un aula</h2>
            <div className="quienes-content__sub">
              <span>pensando </span>
              <span>en </span>
              <span>todas </span>
              <span>las </span>
              <span>familias</span>
            </div>

            <p className="quienes-content__text">
              Edumon es un proyecto educativo desarrollado por dos estudiantes colombianos, con la convicción de que la
              tecnología puede fortalecer la relación entre escuela y familia.
            </p>
            <p className="quienes-content__text">
              Nació como proyecto de aula, pero creció con un propósito real: crear una plataforma integral que acompañe
              el desarrollo académico, emocional y social de los estudiantes, involucrando activamente a sus familias y
              docentes.
            </p>
            <p className="quienes-content__tagline">Hecho con esfuerzo, código y mucho amor por la educación.</p>
          </div>

          <div className="quienes-cards">
            {EQUIPO.map((m) => (
              <div className="quienes-member-card" key={m.iniciales}>
                <div className={`quienes-member-card__avatar quienes-member-card__avatar--${m.tono}`}>
                  {m.iniciales}
                </div>
                <div className="quienes-member-card__name">{m.nombre}</div>
                <span className="quienes-member-card__role">{m.rol}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="contacto"
        ref={contactoRef}
        className="landing-contacto-section"
        style={{
          transform: contactoVis ? 'none' : 'translateY(12px)',
          transition: 'transform 0.6s ease',
        }}
      >
        <DecoBubbles items={CONTACTO_BUBBLES} />

        <div className="landing-contacto">
          <div className="contacto-left">
            <div className="contacto-left__badge">
              <IconStar size={13} />
              Instituciones educativas
            </div>

            <h2 className="contacto-left__title">
              ¿Tu institución quiere ser parte de <Letras />?
            </h2>

            <p className="contacto-left__text">
              Nuestro equipo te acompaña en todo el proceso, desde el primer día: configuramos la plataforma contigo,
              capacitamos a tus docentes y te damos soporte continuo para que empieces rápido y sin complicaciones.
            </p>

            <div className="contacto-beneficios">
              <div className="beneficio">
                <span>
                  <IconCheck size={15} />
                </span>{' '}
                Implementación guiada
              </div>
              <div className="beneficio">
                <span>
                  <IconCheck size={15} />
                </span>{' '}
                Capacitación para docentes
              </div>
              <div className="beneficio">
                <span>
                  <IconCheck size={15} />
                </span>{' '}
                Soporte continuo
              </div>
            </div>

            <div className="contacto-left__img-wrap">
              <div className="buzon-scene">
                <IconStar size={16} className="buzon-spark buzon-spark--1" />
                <IconSparkles size={20} className="buzon-spark buzon-spark--2" />
                <IconStar size={12} className="buzon-spark buzon-spark--3" />

                <img
                  src={soporte}
                  alt="Mascota de EDUMON junto al buzón de soporte"
                  className="buzon-scene__img"
                  width={538}
                  height={502}
                  loading="lazy"
                />

                {/* Banderita del buzón: se levanta al pasar el mouse */}
                <span className="buzon-flag" aria-hidden="true" />

                {/* Pedestal + sombra en el piso, para que "se pare" como un buzón real */}
                <span className="buzon-scene__post" aria-hidden="true" />
                <span className="buzon-scene__shadow" aria-hidden="true" />

                <div className="buzon-chip">
                  <span className="buzon-chip__dot" />
                  Soporte en línea · respondemos rápido
                </div>
              </div>
            </div>
          </div>

          <div className="contacto-form-card">
            <div className="contacto-form-card__title">Solicitar información</div>
            <div className="contacto-form-card__sub">Completa el formulario y te contactamos pronto.</div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="nombre">Nombre completo</label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.nombre}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="correo">Correo electrónico</label>
                  <input
                    id="correo"
                    name="correo"
                    type="email"
                    placeholder="correo@institución.edu"
                    value={formData.correo}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="telefono">Número de contacto</label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    placeholder="300 000 0000"
                    value={formData.telefono}
                    onChange={handleFormChange}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="institucion">Nombre de la institución</label>
                  <input
                    id="institucion"
                    name="institucion"
                    type="text"
                    placeholder="Colegio / Escuela"
                    value={formData.institucion}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              <div className="form-field form-field--full">
                <label htmlFor="mensaje">¿Cómo podemos ayudarte?</label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows={4}
                  placeholder="Cuéntanos sobre tu institución y lo que necesitas..."
                  value={formData.mensaje}
                  onChange={handleFormChange}
                />
              </div>

              <button
                type="submit"
                className="contacto-form-card__submit"
                disabled={submitStatus === 'loading' || submitStatus === 'success'}
                style={{
                  opacity: submitStatus === 'loading' ? 0.7 : 1,
                  cursor: submitStatus === 'loading' ? 'wait' : undefined,
                }}
              >
                <IconSend size={15} />
                {submitStatus === 'loading' ? 'Enviando…' : 'Enviar información'}
              </button>

              {submitStatus === 'success' && (
                <p className="form-msg form-msg--ok">¡Mensaje enviado! Te contactaremos pronto.</p>
              )}
              {submitStatus === 'error' && <p className="form-msg form-msg--err">{submitError}</p>}
            </form>

            <p className="contacto-form-card__privacy">Tu información es confidencial y nunca será compartida.</p>
          </div>
        </div>
      </section>

      <section
        id="app"
        ref={appRef}
        className="landing-app"
        style={{
          transform: appVis ? 'none' : 'translateY(12px)',
          transition: 'transform 0.6s ease',
        }}
      >
        <DecoBubbles items={APP_BUBBLES} />

        <div className="landing-app__grid">
          <div className="landing-app__content">
            <div className="section-label">
              <IconSmartphone size={14} />
              App móvil
            </div>

            <h2 className="landing-app__title">
              Lleva <Letras /> en el bolsillo
            </h2>

            <p className="landing-app__text">
              Consulta retos, entregas, foros y avisos desde el celular. La app reúne todo lo de la plataforma en una
              experiencia pensada para el día a día de las familias.
            </p>

            <div className="landing-app__android">
              <IconAndroid size={16} />
              Disponible solo para Android
            </div>

            <div className="landing-app__cta">
              {appBuild?.urlDescarga ? (
                <a className="landing-app__btn" href={appBuild.urlDescarga} rel="noopener noreferrer">
                  <IconDownload size={18} />
                  Descargar APK
                </a>
              ) : (
                <button className="landing-app__btn" type="button" disabled>
                  <IconDownload size={18} />
                  Próximamente
                </button>
              )}

              <p className="landing-app__meta">
                {appBuild
                  ? [
                      appBuild.version ? `Versión ${appBuild.version}` : 'Última versión',
                      appBuild.tamano ? formatBytes(appBuild.tamano) : null,
                      'APK para Android',
                    ]
                      .filter(Boolean)
                      .join(' · ')
                  : 'Aún no publicamos la primera versión.'}
              </p>
            </div>
          </div>

          <div className="landing-app__visual">
            {appBuild?.urlDescarga ? (
              <a
                className="landing-app__icon"
                href={appBuild.urlDescarga}
                rel="noopener noreferrer"
                aria-label="Descargar la app de Edumon para Android"
              >
                <span className="landing-app__icon-tile">
                  <img src={edumonIcono} alt="Ícono de la app EDUMON" width={504} height={504} loading="lazy" />
                  <span className="landing-app__icon-badge" aria-hidden="true">
                    <IconDownload size={16} />
                  </span>
                </span>
                <span className="landing-app__icon-label">Edumon</span>
              </a>
            ) : (
              <div className="landing-app__icon landing-app__icon--off" aria-hidden="true">
                <span className="landing-app__icon-tile">
                  <img src={edumonIcono} alt="Ícono de la app EDUMON" width={504} height={504} loading="lazy" />
                </span>
                <span className="landing-app__icon-label">Edumon</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section
        id="tutoriales"
        ref={tutorialesRef}
        className="landing-tutoriales"
        style={{
          transform: tutorialesVis ? 'none' : 'translateY(12px)',
          transition: 'transform 0.6s ease',
        }}
      >
        <DecoBubbles items={TUTORIALES_BUBBLES} />

        <div className="landing-tutoriales__inner">
          <div className="landing-tutoriales__head">
            <span className="landing-tutoriales__badge">
              <IconPlay size={11} />
              Tutoriales
            </span>
            <h2 className="landing-tutoriales__title">
              Aprende a usar <Letras /> <span className="landing-tutoriales__mark">en minutos</span>
            </h2>
            <p className="landing-tutoriales__text">
              Videos cortos para padres de familia y profesores: cómo instalar la app móvil y cómo sacarle provecho
              desde el primer día.
            </p>
          </div>

          <div className="landing-tutoriales__grid">
            {TUTORIALES.map((t) => (
              <Link key={t.id} to={`/tutoriales#${t.id}`} className={`tuto-teaser tuto-teaser--${t.tono}`}>
                <img
                  className="tuto-teaser__peek"
                  src={t.mascota}
                  alt={`Mascota de EDUMON del tutorial ${t.titulo}`}
                  aria-hidden="true"
                  draggable={false}
                  loading="lazy"
                />
                <div className="tuto-teaser__media">
                  <img
                    src={t.banner}
                    alt={`Miniatura del tutorial de EDUMON: ${t.titulo}`}
                    width={960}
                    height={540}
                    loading="lazy"
                  />
                  <span className="tuto-teaser__play" aria-hidden="true">
                    <IconPlay size={20} />
                  </span>
                </div>
                <div className="tuto-teaser__body">
                  <div className="tuto-teaser__chips">
                    {t.publico.map((p) => (
                      <span key={p}>{p}</span>
                    ))}
                  </div>
                  <h3 className="tuto-teaser__title">{t.titulo}</h3>
                  <span className="tuto-teaser__more">
                    Ver tutorial <IconArrowRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <Link to="/tutoriales" className="landing-tutoriales__cta">
            Ver todos los tutoriales <IconArrowRight size={16} />
          </Link>
        </div>
      </section>

      <footer className="landing-footer">
        <DecoBubbles items={FOOTER_BUBBLES} />

        <div className="landing-footer__grid">
          <div className="footer-brand">
            <img
              src={edumonLetras}
              alt="EDUMON"
              className="footer-brand__letras"
              width={480}
              height={189}
              loading="lazy"
            />
            <p className="footer-brand__tagline">
              Educación conectada, <strong>familias unidas.</strong>
            </p>
            <img
              src={mascotasEquipo}
              width={640}
              height={427}
              alt="Las mascotas de EDUMON jugando con bloques"
              className="footer-crew"
              loading="lazy"
            />
            <div className="footer-brand__made">
              <IconHeart size={13} />
              Hecho con amor en Colombia
            </div>
            <div className="footer-brand__authors">Por Veronica Mancilla &amp; Bryan Yepes</div>
          </div>

          <div className="footer-col">
            <div className="footer-col__title">
              <IconNavigation size={15} />
              Navegación
            </div>
            <ul>
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={(e) => handleNav(e, l.href)}>
                    <IconArrowRight size={12} />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <div className="footer-col__title">
              <IconSmartphone size={15} />
              App móvil
            </div>
            <ul>
              <li>
                <a href="#app" onClick={(e) => handleNav(e, '#app')}>
                  <IconDownload size={12} />
                  Descargar para Android
                </a>
              </li>
              <li>
                <Link to="/tutoriales">
                  <IconPlay size={12} />
                  Tutoriales en video
                </Link>
              </li>
            </ul>
            <p className="footer-col__note">Solo disponible para Android.</p>
          </div>

          <div className="footer-col">
            <div className="footer-col__title">
              <IconMail size={15} />
              Contacto
            </div>
            <div className="footer-contact-item">
              <IconMail size={15} />
              <a href={`mailto:${CONTACTO.correo}`}>{CONTACTO.correo}</a>
            </div>
            <div className="footer-contact-item">
              <IconYoutube size={15} />
              <a href={CONTACTO.youtube} target="_blank" rel="noopener noreferrer">
                YouTube {CONTACTO.youtubeHandle}
              </a>
            </div>
            <div className="footer-contact-item">
              <IconMapPin size={15} />
              Popayán, Cauca, Colombia
            </div>
          </div>
        </div>

        <div className="landing-footer__bottom">
          © 2026 Edumon. Todos los derechos reservados. Proyecto educativo sin fines de lucro.
        </div>
      </footer>

      {showConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowConfirm(false);
          }}
        >
          <div
            ref={confirmPanelRef}
            style={{
              background: '#fff',
              borderRadius: 20,
              padding: '2rem',
              width: '100%',
              maxWidth: 480,
              boxShadow: '0 24px 60px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  flexShrink: 0,
                  background: '#0C6AC4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconSend size={18} color="#fff" />
              </div>
              <div>
                <h2
                  id="confirm-modal-title"
                  style={{ margin: 0, fontSize: '1.05rem', fontWeight: 900, color: '#0D0D0D' }}
                >
                  Confirmar envío
                </h2>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#0D0D0D' }}>Revisa tu información antes de enviar</p>
              </div>
            </div>

            <div
              style={{
                background: '#f8fafc',
                borderRadius: 12,
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}
            >
              {[
                { label: 'Nombre', value: formData.nombre },
                { label: 'Correo', value: formData.correo },
                { label: 'Teléfono', value: normalizePhone(formData.telefono) ?? formData.telefono },
                { label: 'Institución', value: formData.institucion || '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 700, color: '#0D0D0D', minWidth: 90 }}>{label}:</span>
                  <span style={{ color: '#0D0D0D', wordBreak: 'break-word' }}>{value}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.6rem', fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 700, color: '#0D0D0D', display: 'block', marginBottom: 4 }}>Mensaje:</span>
                <span style={{ color: '#0D0D0D', lineHeight: 1.5, display: 'block' }}>{formData.mensaje}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: 10,
                  border: '1.5px solid #e2e8f0',
                  background: '#fff',
                  color: '#0D0D0D',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Editar
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  padding: '0.6rem 1.5rem',
                  borderRadius: 10,
                  border: 'none',
                  background: '#0C6AC4',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <IconSend size={14} />
                Confirmar y enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
