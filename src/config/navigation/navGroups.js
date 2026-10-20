import {
  Home, BookOpen, Bell, Calendar, Building2, Layers,
  GraduationCap, ClipboardList, MessageCircle, Users, FileText,
  Smartphone, Sparkles, ShieldAlert,
} from "lucide-react";
import { createElement } from "react";
import edumonLogo from "@/assets/img/edumon/edumon-ia-logo.webp";

// logo de Edumon IA con la misma firma que los íconos de lucide (size)
const EdumonIA = ({ size = 17 }) => createElement("img", {
  src: edumonLogo,
  alt: "",
  style: { width: size + 7, height: size + 7, objectFit: "contain", margin: -3 },
});

export const ICONS = {
  home:                 Home,
  book:                 BookOpen,
  "book-open":          BookOpen,
  bell:                 Bell,
  calendar:             Calendar,
  school:               Building2,
  building:             Building2,
  layers:               Layers,
  "chalkboard-teacher": GraduationCap,
  clipboard:            ClipboardList,
  "message-circle":     MessageCircle,
  users:                Users,
  "file-text":          FileText,
  smartphone:           Smartphone,
  sparkles:             Sparkles,
  "edumon-ia":          EdumonIA,
  "shield-alert":       ShieldAlert,
};

export const ROLE_LABELS = {
  superadmin:    "Super Admin",
  administrador: "Administrador",
  docente:       "Docente",
  padre:         "Padre / Tutor",
  "padre/tutor": "Padre / Tutor",
};

export const NAV_GROUPS = {
  superadmin: [
    {
      group: "Principal",
      items: [{ label: "Inicio", path: "/admin", icon: "home", exact: true }],
    },
    {
      group: "Gestión global",
      items: [
        { label: "Instituciones", path: "/instituciones", icon: "building" },
        { label: "Usuarios",      path: "/usuarios",      icon: "users" },
      ],
    },
    {
      group: "Sistema",
      items: [
        { label: "App móvil",      path: "/app-movil",      icon: "smartphone" },
        { label: "Notificaciones", path: "/notificaciones", icon: "bell" },
      ],
    },
  ],

  administrador: [
    {
      group: "Principal",
      items: [{ label: "Inicio", path: "/admin", icon: "home", exact: true }],
    },
    {
      group: "Mi institución",
      items: [
        { label: "Institución", path: "/institucion", icon: "school" },
        { label: "Docentes",    path: "/docentes",    icon: "chalkboard-teacher" },
        { label: "Cursos",      path: "/cursos",      icon: "layers" },
        { label: "Calendario",  path: "/calendario",  icon: "calendar" },
      ],
    },
    {
      group: "Escuela de padres",
      items: [
        { label: "Lineamientos y seguimiento", path: "/escuela-padres/lineamientos", icon: "edumon-ia" },
      ],
    },
    {
      group: "Comunicación",
      items: [
        { label: "Notificaciones",        path: "/notificaciones",      icon: "bell" },
        { label: "Alertas convivencia",   path: "/convivencia/alertas", icon: "shield-alert" },
      ],
    },
  ],

  docente: [
    {
      group: "Principal",
      items: [{ label: "Inicio", path: "/docente", icon: "home", exact: true }],
    },
    {
      group: "Enseñanza",
      items: [
        { label: "Cursos",      path: "/cursos",      icon: "layers" },
        { label: "Retos",       path: "/tareas",      icon: "clipboard" },
        { label: "Foros",       path: "/foros",       icon: "message-circle" },
        { label: "Calendario",  path: "/calendario",  icon: "calendar" },
        { label: "Lineamientos escuela de padres", path: "/escuela-padres/lineamientos", icon: "edumon-ia" },
      ],
    },
    {
      group: "Comunicación",
      items: [
        { label: "Notificaciones",        path: "/notificaciones",      icon: "bell" },
        { label: "Alertas convivencia",   path: "/convivencia/alertas", icon: "shield-alert" },
      ],
    },
  ],

  padre: [
    {
      group: "Principal",
      items: [
        { label: "Inicio", path: "/padre",          icon: "home", exact: true },
        { label: "Edumon IA", path: "/familia/edumon", icon: "edumon-ia" },
      ],
    },
    {
      group: "Mis hijos",
      // sin entrada aparte de "Entregas": cada reto ya lleva directo a su entrega
      items: [
        { label: "Perfiles",   path: "/familia/perfiles",   icon: "users" },
        { label: "Cursos",     path: "/familia/cursos",     icon: "layers" },
        { label: "Retos",      path: "/familia/tareas",     icon: "clipboard" },
        { label: "Foros",      path: "/familia/foros",      icon: "message-circle" },
        { label: "Calendario", path: "/calendario",          icon: "calendar" },
      ],
    },
    {
      group: "Comunicación",
      items: [{ label: "Notificaciones", path: "/notificaciones", icon: "bell" }],
    },
  ],
};

NAV_GROUPS["padre/tutor"] = NAV_GROUPS.padre;
