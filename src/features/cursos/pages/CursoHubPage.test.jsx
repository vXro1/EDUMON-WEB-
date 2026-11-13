import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, cleanup, render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfirmProvider } from '@/context/ConfirmContext';

const usuario = { _id: 'd1', rol: 'docente', nombre: 'Luis' };
vi.mock('@/features/auth/context/AuthContext', () => ({
  useAuthContext: () => ({ user: usuario, isAuthenticated: true }),
  useUserContext: () => ({ user: usuario }),
}));

const cursosGetById = vi.fn();
const tareasGetAll = vi.fn();
vi.mock('@/features/cursos/services/cursosService', async (orig) => ({
  ...(await orig()),
  cursosGetById: (...a) => cursosGetById(...a),
  modulosGetByCurso: () => Promise.resolve({ modulos: [] }),
}));
vi.mock('@/features/cursos/services/tareasService', async (orig) => ({
  ...(await orig()),
  tareasGetAll: (...a) => tareasGetAll(...a),
}));

const { default: CursoHubPage } = await import('./CursoHubPage');

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('CursoHubPage', () => {
  it('carga bajo demanda la pestaña de Retos al abrirla', async () => {
    cursosGetById.mockResolvedValue({
      curso: {
        _id: 'c1',
        nombre: 'Lectura',
        descripcion: 'Curso de lectura',
        docenteId: { _id: 'd1', nombre: 'Luis' },
      },
    });
    tareasGetAll.mockResolvedValue({
      tareas: [
        {
          _id: 't1',
          titulo: 'Cuento en familia',
          estado: 'publicada',
          fechaEntrega: new Date(Date.now() + 864e5).toISOString(),
        },
      ],
    });
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <ConfirmProvider>
          <MemoryRouter initialEntries={['/cursos/c1?tab=tareas']}>
            <Routes>
              <Route path="/cursos/:id" element={<CursoHubPage />} />
            </Routes>
          </MemoryRouter>
        </ConfirmProvider>
      </QueryClientProvider>,
    );
    // la pestaña es un chunk diferido: con la suite en paralelo puede tardar más de 1 s
    expect(await screen.findByText('Cuento en familia', {}, { timeout: 5000 })).toBeTruthy();
    expect(tareasGetAll).toHaveBeenCalledWith({ cursoId: 'c1' });
  });
});
