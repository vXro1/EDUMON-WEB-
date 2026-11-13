import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { renderPagina } from '@/test/renderPagina';

const usuario = { _id: 'a1', rol: 'administrador', nombre: 'Ana', institucionId: 'i1' };
vi.mock('@/features/auth/context/AuthContext', () => ({
  useAuthContext: () => ({ user: usuario, isAuthenticated: true }),
  useUserContext: () => ({ user: usuario }),
}));

const usersGetAll = vi.fn();
vi.mock('@/services/usersService', async (orig) => ({
  ...(await orig()),
  usersGetAll: (...a) => usersGetAll(...a),
}));

const { default: DocentesPage } = await import('./DocentesPage');

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('DocentesPage', () => {
  it('lista los docentes y al buscar pide una sola vez el listado completo', async () => {
    usersGetAll.mockResolvedValue({
      users: [
        {
          _id: 'd1',
          nombre: 'Luis',
          apellido: 'Pérez',
          rol: 'docente',
          estado: 'activo',
          correo: 'luis@colegio.edu.co',
        },
      ],
      pagination: { totalUsers: 1 },
    });
    renderPagina(<DocentesPage />);

    expect((await screen.findAllByText(/Luis/)).length).toBeGreaterThan(0);
    expect(usersGetAll).toHaveBeenCalledWith({ rol: 'docente', page: 1, limit: 15 });
    usersGetAll.mockClear();

    fireEvent.change(screen.getByPlaceholderText(/Buscar por nombre/), { target: { value: 'lu' } });
    await waitFor(() => expect(usersGetAll).toHaveBeenCalled(), { timeout: 2000 });
    expect(usersGetAll).toHaveBeenCalledTimes(1);
    expect(usersGetAll.mock.calls[0][0]).toEqual({ rol: 'docente', page: 1, limit: 1000 });
  });
});
