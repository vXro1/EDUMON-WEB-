import { apiFetch, apiFetchFormData } from './core/apiClient';

export const institucionesCreate = (body) =>
  apiFetch('/instituciones', { method: 'POST', body: JSON.stringify(body) });

export const institucionesGetAll = () => apiFetch('/instituciones');

export const institucionesUpdate = (id, body) =>
  apiFetch(`/instituciones/${id}`, { method: 'PUT', body: JSON.stringify(body) });

// irreversible: borra la institución y todo lo que depende de ella (cursos,
// tareas, entregas, eventos, foros, docentes/admins y los padres que se
// queden sin ningún otro curso)
export const institucionesDelete = (id) =>
  apiFetch(`/instituciones/${id}`, { method: 'DELETE' });

export const institucionesGetMine = () => apiFetch('/instituciones/mi-institucion');

export const institucionesCreateDocente = (body) =>
  apiFetch('/instituciones/docentes', { method: 'POST', body: JSON.stringify(body) });

export const institucionesCreateDocentesCsv = (formData) =>
  apiFetchFormData('/instituciones/docentes/csv', { method: 'POST', body: formData });
