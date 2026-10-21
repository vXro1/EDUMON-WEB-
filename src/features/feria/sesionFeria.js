export const MODO_DEMO = String(import.meta.env.VITE_MODO_DEMO ?? "").toLowerCase() === "true";

const CLAVE = "edumon-sesion-feria";

export function marcarSesionFeria() {
  try {
    window.sessionStorage.setItem(CLAVE, "1");
  } catch {
    return;
  }
}

export function esSesionFeria() {
  if (!MODO_DEMO) return false;
  try {
    return window.sessionStorage.getItem(CLAVE) === "1";
  } catch {
    return false;
  }
}
