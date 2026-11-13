import { apiFetch } from '@/services/core/apiClient';

export const calendarioGetByCurso = (cursoId, params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return apiFetch(`/calendario/${cursoId}${qs ? `?${qs}` : ''}`);
};

