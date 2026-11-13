import { describe, it, expect, vi, afterEach } from 'vitest';
import { cleanup, waitFor } from '@testing-library/react';
import { renderPagina } from '@/test/renderPagina';

const usuario = { _id: 'p1', rol: 'padre', nombre: 'Marta' };
vi.mock('@/features/auth/context/AuthContext', () => ({
  useAuthContext: () => ({ user: usuario, isAuthenticated: true }),
  useUserContext: () => ({ user: usuario }),
}));

const usersGetMyProfile = vi.fn();
const cursosGetMine = vi.fn();
const perfilesGetAll = vi.fn();
vi.mock('@/services/usersService', async (orig) => ({
  ...(await orig()),
  usersGetMyProfile: (...a) => usersGetMyProfile(...a),
}));
vi.mock('@/features/cursos/services/cursosService', async (orig) => ({
  ...(await orig()),
  cursosGetMine: (...a) => cursosGetMine(...a),
}));
vi.mock('@/features/familia/services/perfilesService', async (orig) => ({
  ...(await orig()),
  perfilesGetAll: (...a) => perfilesGetAll(...a),
}));

const { default: PerfilPage } = await import('./PerfilPage');

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('PerfilPage', () => {
  it('pide cursos y perfiles en paralelo con el perfil, sin esperarlo', async () => {
    usersGetMyProfile.mockReturnValue(new Promise(() => {})); // el perfil no responde
    cursosGetMine.mockResolvedValue({ cursos: [] });
    perfilesGetAll.mockResolvedValue({ perfiles: [] });

    renderPagina(<PerfilPage />);

    await waitFor(() => {
      expect(cursosGetMine).toHaveBeenCalledTimes(1);
      expect(perfilesGetAll).toHaveBeenCalledTimes(1);
    });
    expect(usersGetMyProfile).toHaveBeenCalledTimes(1);
  });
});
