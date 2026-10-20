// Puente entre la vista del Ciclo Edumon y el flujo normal de crear reto:
// el ciclo deja el borrador sugerido y el asistente de retos (dentro del formulario
// de tareas del curso) lo muestra listo para "Usar en el reto". No se guarda nada en
// el backend hasta que el docente publica.

const CLAVE = "edumon:retoDelCiclo";
const VIGENCIA_MS = 30 * 60 * 1000;

export function guardarRetoDelCiclo(cursoId, borrador) {
  try {
    sessionStorage.setItem(CLAVE, JSON.stringify({ cursoId: String(cursoId), borrador, en: Date.now() }));
    return true;
  } catch {
    return false;
  }
}

/** Borrador pendiente para este curso (o null). No lo borra: un remontaje del formulario lo vuelve a leer. */
export function leerRetoDelCiclo(cursoId) {
  try {
    const dato = JSON.parse(sessionStorage.getItem(CLAVE) || "null");
    if (!dato || String(dato.cursoId) !== String(cursoId) || Date.now() - dato.en > VIGENCIA_MS) return null;
    return dato.borrador ?? null;
  } catch {
    return null;
  }
}

export function olvidarRetoDelCiclo() {
  try { sessionStorage.removeItem(CLAVE); } catch { /* sin almacenamiento: nada que limpiar */ }
}
