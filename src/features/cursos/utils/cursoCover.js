import avatar1 from "@/assets/img/avatars/mini/avatar1.webp";
import avatar2 from "@/assets/img/avatars/mini/avatar2.webp";
import avatar3 from "@/assets/img/avatars/mini/avatar3.webp";
import avatar4 from "@/assets/img/avatars/mini/avatar4.webp";
import avatar5 from "@/assets/img/avatars/mini/avatar5.webp";
import avatar6 from "@/assets/img/avatars/mini/avatar6.webp";
import avatar7 from "@/assets/img/avatars/mini/avatar7.webp";
import avatar8 from "@/assets/img/avatars/mini/avatar8.webp";

export const CURSO_AVATARS = [avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8];

export function getCursoAvatar(curso) {
  const key = String(curso?._id ?? curso?.id ?? curso?.nombre ?? "");
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return CURSO_AVATARS[hash % CURSO_AVATARS.length];
}

export function getCursoCover(curso) {
  return curso?.fotoPortada || curso?.fotoPortadaUrl || curso?.imagen || null;
}
