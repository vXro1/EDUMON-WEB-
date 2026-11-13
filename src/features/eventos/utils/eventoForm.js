// Formularios de evento con fecha (type="date") + hora separadas (calendario
// general y calendario del curso). El backend exige fechaFin > fechaInicio,
// descripción ≥ 10, ubicación ≥ 3 y hora HH:MM; antes se mandaba
// fechaFin = fechaInicio (mismo string de fecha) y todo evento de un solo día
// respondía 400.

const pad = (n) => String(n).padStart(2, "0");

// "YYYY-MM-DD" en hora local (slice(0, 10) del ISO da el día UTC: un evento a
// las 20:00 en Colombia aparecía al día siguiente)
export const fechaLocal = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

// Inicio = fecha + hora; fin = fin del día elegido (o del mismo día). Siempre fin > inicio.
export const rangoEvento = ({ fechaInicio, fechaFin, hora }) => {
  const inicio = new Date(`${fechaInicio}T${hora || "00:00"}`);
  let fin = new Date(`${fechaFin || fechaInicio}T23:59`);
  if (fin <= inicio) fin = new Date(inicio.getTime() + 60 * 60 * 1000);
  return { fechaInicio: inicio.toISOString(), fechaFin: fin.toISOString() };
};

// Mismas reglas que eventoValidator del backend, por campo, para avisar antes de enviar
const REGLAS = [
  ["titulo",      (f) => f.titulo.trim().length >= 3,      "El título debe tener al menos 3 caracteres."],
  ["descripcion", (f) => f.descripcion.trim().length >= 10, "La descripción debe tener al menos 10 caracteres."],
  ["fechaInicio", (f) => Boolean(f.fechaInicio),            "La fecha de inicio es requerida."],
  ["hora",        (f) => /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(f.hora), "La hora es requerida."],
  ["ubicacion",   (f) => f.ubicacion.trim().length >= 3,    "La ubicación debe tener al menos 3 caracteres."],
  ["fechaFin",    (f) => !f.fechaFin || f.fechaFin >= f.fechaInicio, "La fecha de fin no puede ser anterior a la de inicio."],
];

// campos = null → todas las reglas (crear); con lista → solo esos campos (editar)
export const validarEvento = (form, campos = null) => {
  const regla = REGLAS.find(([campo, ok]) => (!campos || campos.includes(campo)) && !ok(form));
  return regla ? regla[2] : "";
};

export const cuerpoEvento = (form) => ({
  titulo:      form.titulo.trim(),
  descripcion: form.descripcion.trim(),
  ...rangoEvento(form),
  hora:        form.hora,
  ubicacion:   form.ubicacion.trim(),
  categoria:   form.categoria,
});

// Edición: solo lo que cambió (un dato antiguo que ya no pasa el validador no
// bloquea cambiar otro campo, y la hora real no se pisa si no se tocan fechas)
export const cambiosEvento = (original, form) => {
  const body = {};
  for (const k of ["titulo", "descripcion", "ubicacion"]) {
    if (form[k].trim() !== (original[k] ?? "").trim()) body[k] = form[k].trim();
  }
  if (form.categoria !== original.categoria) body.categoria = form.categoria;
  const fechasCambiaron = ["fechaInicio", "fechaFin", "hora"].some((k) => form[k] !== original[k]);
  if (fechasCambiaron) Object.assign(body, rangoEvento(form), { hora: form.hora });
  return body;
};

export const formDesdeEvento = (evento) => ({
  titulo:      evento.titulo      ?? "",
  descripcion: evento.descripcion ?? "",
  fechaInicio: fechaLocal(evento.fechaInicio),
  fechaFin:    fechaLocal(evento.fechaFin),
  hora:        evento.hora        ?? "",
  ubicacion:   evento.ubicacion   ?? "",
  categoria:   evento.categoria   ?? "institucional",
});
