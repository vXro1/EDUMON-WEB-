import { describe, it, expect } from 'vitest';
import { rangoEvento, validarEvento, cambiosEvento, cuerpoEvento, fechaLocal } from './eventoForm';

const base = {
  titulo: 'Reunión de padres',
  descripcion: 'Entrega de boletines del periodo',
  fechaInicio: '2030-03-10',
  fechaFin: '',
  hora: '08:30',
  ubicacion: 'Salón 3',
  categoria: 'institucional',
};

describe('eventoForm', () => {
  it('un evento de un solo día manda fechaFin posterior a fechaInicio', () => {
    const { fechaInicio, fechaFin } = rangoEvento(base);
    expect(new Date(fechaFin) > new Date(fechaInicio)).toBe(true);
    expect(new Date(fechaInicio).getHours()).toBe(8);
    expect(new Date(fechaInicio).getMinutes()).toBe(30);
  });

  it('si la hora es 23:59 el fin queda una hora después', () => {
    const { fechaInicio, fechaFin } = rangoEvento({ ...base, hora: '23:59' });
    expect(new Date(fechaFin) - new Date(fechaInicio)).toBe(60 * 60 * 1000);
  });

  it('valida con las mismas reglas del backend', () => {
    expect(validarEvento(base)).toBe('');
    expect(validarEvento({ ...base, descripcion: 'corta' })).toMatch(/descripción/);
    expect(validarEvento({ ...base, hora: '' })).toMatch(/hora/);
    expect(validarEvento({ ...base, ubicacion: '' })).toMatch(/ubicación/);
    // al editar solo se validan los campos que se envían
    expect(validarEvento({ ...base, descripcion: 'corta' }, ['titulo'])).toBe('');
  });

  it('al editar solo envía lo que cambió y no toca las fechas si no cambiaron', () => {
    expect(cambiosEvento(base, { ...base, titulo: 'Otro título' })).toEqual({ titulo: 'Otro título' });
    const body = cambiosEvento(base, { ...base, hora: '10:00' });
    expect(Object.keys(body).sort()).toEqual(['fechaFin', 'fechaInicio', 'hora']);
    expect(cambiosEvento(base, { ...base })).toEqual({});
  });

  it('crear incluye todos los campos', () => {
    expect(Object.keys(cuerpoEvento(base)).sort()).toEqual([
      'categoria',
      'descripcion',
      'fechaFin',
      'fechaInicio',
      'hora',
      'titulo',
      'ubicacion',
    ]);
  });

  it('fechaLocal usa el día local, no el UTC', () => {
    const d = new Date(2030, 2, 10, 22, 0);
    expect(fechaLocal(d.toISOString())).toBe('2030-03-10');
    expect(fechaLocal('')).toBe('');
  });
});
