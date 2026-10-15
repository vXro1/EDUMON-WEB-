import bannerPadres from "@/assets/img/tutoriales/edumon-tutorial-app-padres.webp";
import bannerDocentes from "@/assets/img/tutoriales/edumon-tutorial-app-docentes.webp";
import avatarVerde from "@/assets/img/avatars/Avatar5.svg";
import avatarProfe from "@/assets/img/avatars/Avatar3.svg";

export const TUTORIALES = [
  {
    id: "padres",
    youtubeId: "HR7C16GiGzs",
    numero: "01",
    tono: "green",
    banner: bannerPadres,
    mascota: avatarVerde,
    publico: ["Padres de familia"],
    titulo: "App móvil para padres de familia",
    desc: "Aprende a instalar Edumon en tu celular y a usarla para acompañar a tu hijo desde casa: retos, entregas y avisos, todo en un mismo lugar.",
    puntos: [
      "Descarga e instala la app en Android",
      "Revisa los retos y actividades de tu hijo",
      "Envía entregas y recibe los avisos del colegio",
    ],
  },
  {
    id: "docentes",
    youtubeId: "lx5liXUgpN8",
    numero: "02",
    tono: "cyan",
    banner: bannerDocentes,
    mascota: avatarProfe,
    publico: ["Docentes"],
    titulo: "Cómo usar la app siendo docente",
    desc: "Una guía de uso para profesores: organiza tus cursos, publica retos y mantén el contacto con las familias desde la app.",
    puntos: [
      "Ingresa con tu cuenta de docente",
      "Publica retos y eventos para tus cursos",
      "Revisa entregas y comunícate con las familias",
    ],
  },
];
