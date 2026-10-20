import { apiFetch } from '@/services/core/apiClient';
import { humanizeError } from '@/utils/humanizeError';

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

// la respuesta real tarda 3-10 s, pero si fallan los dos proveedores (20 s de timeout cada uno)
// el backend responde con la ficha pasados ~40 s: el timeout general de 30 s la cortaría
const TIMEOUT_CHAT_MS = 60_000;

export const edumonEnviarMensaje = (id, contenido) =>
  apiFetch(`/ia/conversaciones/${id}/mensajes`, { method: 'POST', body: JSON.stringify({ contenido }), timeoutMs: TIMEOUT_CHAT_MS });

// sesión de validación con usuarios reales (feria); se cambia sin tocar código con VITE_IA_SESION_VALIDACION
export const SESION_VALIDACION = import.meta.env.VITE_IA_SESION_VALIDACION || 'feria-2026-10-21';

export const edumonCalificar = (id, mensajeId, { util, comentario }) =>
  apiFetch(`/ia/conversaciones/${id}/mensajes/${mensajeId}/calificacion`, {
    method: 'PUT',
    body: JSON.stringify({ util, ...(comentario ? { comentario } : {}), sesionValidacion: SESION_VALIDACION }),
  });

export const edumonExplicacionMensaje = (id, mensajeId) =>
  apiFetch(`/ia/conversaciones/${id}/mensajes/${mensajeId}/explicacion`);

export const edumonEnviarAudio = (id, archivo) => {
  const datos = new FormData();
  datos.append('audio', archivo);
  return apiFetch(`/ia/conversaciones/${id}/audio`, { method: 'POST', body: datos, timeoutMs: TIMEOUT_CHAT_MS });
};

// ─── Colegio ──────────────────────────────────────────────────────────────────
export const edumonGetAlertas = (estado) =>
  apiFetch(`/ia/alertas${estado ? `?estado=${estado}` : ''}`);

export const edumonGetAlerta = (id) => apiFetch(`/ia/alertas/${id}`);

export const edumonActualizarAlerta = (id, body) =>
  apiFetch(`/ia/alertas/${id}`, { method: 'PATCH', body: JSON.stringify(body) });

export const edumonIntegridadAlertas = () => apiFetch('/ia/alertas/integridad');

export const edumonIntegridadAlerta = (id) => apiFetch(`/ia/alertas/${id}/integridad`);

export const edumonExplicacionAlerta = (id) => apiFetch(`/ia/alertas/${id}/explicacion`);

// ─── Ciclo Edumon (docente del curso o admin) ────────────────────────────────
export const edumonGetCiclo = (cursoId) => apiFetch(`/ia/cursos/${cursoId}/ciclo`);

export const edumonSugerirDesdeCiclo = (cursoId) =>
  apiFetch(`/ia/cursos/${cursoId}/ciclo/sugerencia`, { method: 'POST', timeoutMs: TIMEOUT_CHAT_MS });

// ─── Panel del administrador ─────────────────────────────────────────────────
const conQuery = (ruta, params = {}) => {
  const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''));
  return q.toString() ? `${ruta}?${q}` : ruta;
};

export const edumonSaludIA = () => apiFetch('/ia/health');
export const edumonMetricasIA = () => apiFetch('/ia/metricas');
export const edumonRetroalimentacion = (params) => apiFetch(conQuery('/ia/retroalimentacion', params));
export const edumonCostos = (params) => apiFetch(conQuery('/ia/costos', params));
export const edumonImpacto = (params) => apiFetch(conQuery('/ia/impacto', params));

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

const codigoDe = (err) => err?.data?.code;

/**
 * Mensaje claro en español para los errores con `code` del contrato de Edumon IA.
 * LIMITE_IA trae un message pensado para mostrarse tal cual.
 */
export function mensajeErrorIA(err, fallback = 'No pudimos completar la acción. Intenta de nuevo.') {
  switch (codigoDe(err)) {
    case 'LIMITE_IA':
      return err.data.message || `Edumon recibió muchas solicitudes. Espera ${err.data.retryAfter ?? 60} s y vuelve a intentarlo.`;
    case 'CONSENTIMIENTO_REQUERIDO':
      return 'Para usar Edumon primero debes aceptar la autorización.';
    case 'ALERTA_MODIFICADA':
      return 'Otra persona cambió esta alerta al mismo tiempo. Cargamos la versión más reciente: revisa y vuelve a guardar.';
    case 'SIN_TEMAS_SUFICIENTES':
      return 'Todavía ningún tema lo han consultado 5 familias o más de este curso, así que Edumon no puede sugerir nada sin exponer a nadie.';
    case 'NOTAS_VOZ_DESACTIVADAS':
      return 'Las notas de voz no están activas. Escribe tu mensaje.';
    case 'TRANSCRIPCION_NO_DISPONIBLE':
      return 'No pudimos entender el audio en este momento. Escribe tu mensaje, por favor.';
    case 'AUDIO_SIN_TEXTO':
      return 'No se entendió ninguna palabra en el audio. Intenta de nuevo o escribe tu mensaje.';
    case 'AUDIO_DEMASIADO_GRANDE':
    case 'AUDIO_DEMASIADO_LARGO':
      return 'La nota de voz es demasiado larga. Graba una más corta (máximo 2 minutos).';
    case 'AUDIO_INVALIDO':
      return 'No pudimos leer el audio. Intenta grabarlo de nuevo.';
    default:
      return humanizeError(err, fallback);
  }
}

export const esLimiteIA = (err) => codigoDe(err) === 'LIMITE_IA';
export const esAlertaModificada = (err) => codigoDe(err) === 'ALERTA_MODIFICADA';
