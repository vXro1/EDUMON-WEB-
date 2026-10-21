export const MODO_DEMO = String(import.meta.env.VITE_MODO_DEMO ?? "").toLowerCase() === "true";

const CLAVE = "edumon-sesion-feria";

export function marcarSesionFeria() {
  try {
    window.sessionStorage.setItem(CLAVE, "1");
  } catch {
    return;
  }
}

const CLAVE_BORRADOR = "edumon-borrador-chat";

export function guardarBorradorChat(texto) {
  try {
    window.sessionStorage.setItem(CLAVE_BORRADOR, texto.slice(0, 2000));
  } catch {
    return;
  }
}

export function tomarBorradorChat() {
  try {
    const texto = window.sessionStorage.getItem(CLAVE_BORRADOR);
    window.sessionStorage.removeItem(CLAVE_BORRADOR);
    return texto ?? "";
  } catch {
    return "";
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
