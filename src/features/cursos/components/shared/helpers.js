// ─────────────────────────────────────────────────────────────────────────────
// Helpers de formato y normalización compartidos entre tabs
// ─────────────────────────────────────────────────────────────────────────────

export function fmt(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function fmtHour(date) {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const esPasada = (fecha) => fecha && new Date(fecha) < new Date();

/** Fábrica de hook: notificaciones toast de 3 s */
export function makeNotify(setToast) {
  return (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: "", type: "success" }), 3000);
  };
}