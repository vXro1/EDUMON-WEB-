import { apiFetch } from '@/services/core/apiClient';

// ─── Familia ──────────────────────────────────────────────────────────────────
export const edumonGetConsentimiento = () => apiFetch('/ia/consentimiento');

export const edumonAceptarConsentimiento = (version) =>
  apiFetch('/ia/consentimiento', { method: 'POST', body: JSON.stringify({ version }) });

export const edumonRevocarConsentimiento = () =>
  apiFetch('/ia/consentimiento', { method: 'DELETE' });

export const edumonGetConversaciones = () => apiFetch('/ia/conversaciones');

export const edumonCrearConversacion = () =>
  apiFetch('/ia/conversaciones', { method: 'POST' });

export const edumonGetConversacion = (id) => apiFetch(`/ia/conversaciones/${id}`);

export const edumonEliminarConversacion = (id) =>
  apiFetch(`/ia/conversaciones/${id}`, { method: 'DELETE' });

// nivel 2: la familia acepta que orientación y su docente la contacten
export const edumonPedirAyuda = (id) =>
  apiFetch(`/ia/conversaciones/${id}/ayuda`, { method: 'POST' });

export const edumonEnviarMensaje = (id, contenido) =>
  apiFetch(`/ia/conversaciones/${id}/mensajes`, { method: 'POST', body: JSON.stringify({ contenido }) });

// ─── Colegio ──────────────────────────────────────────────────────────────────
export const edumonGetAlertas = (estado) =>
  apiFetch(`/ia/alertas${estado ? `?estado=${estado}` : ''}`);

export const edumonGetAlerta = (id) => apiFetch(`/ia/alertas/${id}`);

export const edumonActualizarAlerta = (id, body) =>
  apiFetch(`/ia/alertas/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

export const edumonGetTemas = () => apiFetch('/ia/temas');

export const edumonGenerarReto = (body) =>
  apiFetch('/ia/retos/borrador', { method: 'POST', body: JSON.stringify(body) });

export const edumonSugerirModulos = (body) =>
  apiFetch('/ia/modulos/sugerencias', { method: 'POST', body: JSON.stringify(body) });

// ─── Lineamientos de escuela de padres (rectoría → docentes) ─────────────────
export const lineamientosGet = () => apiFetch('/ia/lineamientos');

export const lineamientosSeguimiento = () => apiFetch('/ia/lineamientos/seguimiento');

// { archivo (PDF, opcional), texto, instrucciones }
export const lineamientosGenerar = ({ archivo, texto, instrucciones }) => {
  const datos = new FormData();
  if (archivo) datos.append('archivo', archivo);
  if (texto) datos.append('texto', texto);
  if (instrucciones) datos.append('instrucciones', instrucciones);
  return apiFetch('/ia/lineamientos/borrador', { method: 'POST', body: datos });
};

// trazabilidad por familia de un grupo (retos entregados y encuentros asistidos)
export const participacionDetalle = (cursoId) => apiFetch(`/ia/lineamientos/seguimiento/${cursoId}`);

// asistencia a encuentros de escuela de padres (la marca el docente o el admin)
export const asistenciaGet = (eventoId) => apiFetch(`/eventos/${eventoId}/asistencia`);

export const asistenciaMarcar = (eventoId, registros) =>
  apiFetch(`/eventos/${eventoId}/asistencia`, { method: 'PUT', body: JSON.stringify({ registros }) });

export const lineamientosGuardar = (borrador) =>
  apiFetch('/ia/lineamientos', { method: 'PUT', body: JSON.stringify({ borrador }) });

export const lineamientosPublicar = () =>
  apiFetch('/ia/lineamientos/publicar', { method: 'POST' });

export const asignarResponsableConvivencia = (docenteId) =>
  apiFetch('/instituciones/responsable-convivencia', { method: 'PATCH', body: JSON.stringify({ docenteId }) });

export const esConsentimientoRequerido = (err) => err?.data?.code === 'CONSENTIMIENTO_REQUERIDO';
