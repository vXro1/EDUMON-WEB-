import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/services/queryKeys';
import { calendarioGetByCurso } from '@/features/calendario/services/calendarioService';
import { eventosDelete, eventosCreateSimple, eventosUpdateSimple } from '@/features/eventos/services/eventosService';
import CalendarWidget from '@/components/ui/CalendarWidget';
import { AppModal, Button, Input, Textarea, Select } from '@/components';
import { parseValidationErrors, summarizeValidationErrors } from '@/utils/parseValidationErrors';
import { cuerpoEvento, cambiosEvento, validarEvento, formDesdeEvento } from '@/features/eventos/utils/eventoForm';

const CATEGORIAS = [
  { value: 'escuela_padres', label: 'Escuela de padres' },
  { value: 'tarea', label: 'Reto' },
  { value: 'institucional', label: 'Institucional' },
];
const SIN_ITEMS = [];

const EMPTY_FORM = {
  titulo: '',
  descripcion: '',
  fechaInicio: '',
  fechaFin: '',
  hora: '',
  ubicacion: '',
  categoria: 'institucional',
};

/* ── Texto de error inline debajo de cada campo ────────────────────── */
function FieldError({ message }) {
  if (!message) return null;
  return (
    <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--color-error-hover)', fontWeight: 600 }}>{message}</p>
  );
}

// ─── Modal crear / editar evento ─────────────────────────────────────────
function EventoFormModal({ cursoId, evento, onClose, onSaved }) {
  const isEdit = !!evento;
  const [original] = useState(() => (isEdit ? formDesdeEvento(evento) : EMPTY_FORM));
  const [form, setForm] = useState(original);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  // Errores específicos por campo, ej: { fechaInicio: "La fecha de inicio debe ser futura" }
  const [fieldErrors, setFieldErrors] = useState({});

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    // Limpiar el error de ese campo apenas el usuario empieza a corregirlo
    if (fieldErrors[k]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[k];
        return next;
      });
    }
  };

  const handleSave = async () => {
    // editar: solo lo que cambió; crear: todo
    const body = isEdit ? cambiosEvento(original, form) : { ...cuerpoEvento(form), cursosIds: [cursoId] };
    if (isEdit && Object.keys(body).length === 0) {
      onClose();
      return;
    }
    const invalido = validarEvento(form, isEdit ? Object.keys(body) : null);
    if (invalido) {
      setError(invalido);
      return;
    }
    setSaving(true);
    setError('');
    setFieldErrors({});
    try {
      if (isEdit) {
        await eventosUpdateSimple(evento._id ?? evento.id, body);
      } else {
        await eventosCreateSimple(body);
      }
      onSaved();
    } catch (err) {
      const parsed = parseValidationErrors(err);
      if (parsed) {
        setFieldErrors(parsed);
        setError(summarizeValidationErrors(parsed));
      } else {
        setError(err.message || 'No se pudo guardar el evento.');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppModal isOpen onClose={onClose} size="md">
      <AppModal.Header
        title={isEdit ? 'Editar evento' : 'Nuevo evento'}
        description={isEdit ? 'Modifica los datos del evento' : 'Crea un evento para este curso'}
        onClose={onClose}
      />
      <AppModal.Body>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && (
            <div
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 13,
                color: 'var(--color-error-hover)',
              }}
            >
              {error}
            </div>
          )}

          <div>
            <Input
              label="Título *"
              value={form.titulo}
              onChange={(e) => set('titulo', e.target.value)}
              placeholder="Nombre del evento"
            />
            <FieldError message={fieldErrors.titulo} />
          </div>

          <div>
            <Textarea
              label="Descripción *"
              value={form.descripcion}
              onChange={(e) => set('descripcion', e.target.value)}
              placeholder="Descripción del evento (mínimo 10 caracteres)"
              rows={3}
            />
            <FieldError message={fieldErrors.descripcion} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <Input
                label="Fecha inicio *"
                type="date"
                value={form.fechaInicio}
                onChange={(e) => set('fechaInicio', e.target.value)}
              />
              <FieldError message={fieldErrors.fechaInicio} />
            </div>
            <div>
              <Input
                label="Fecha fin *"
                type="date"
                value={form.fechaFin}
                min={form.fechaInicio}
                onChange={(e) => set('fechaFin', e.target.value)}
              />
              <FieldError message={fieldErrors.fechaFin} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <Input label="Hora *" type="time" value={form.hora} onChange={(e) => set('hora', e.target.value)} />
              <FieldError message={fieldErrors.hora} />
            </div>
            <div>
              <Select label="Categoría *" value={form.categoria} onChange={(e) => set('categoria', e.target.value)}>
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
              <FieldError message={fieldErrors.categoria} />
            </div>
          </div>

          <div>
            <Input
              label="Ubicación *"
              value={form.ubicacion}
              onChange={(e) => set('ubicacion', e.target.value)}
              placeholder="Salón, virtual, etc."
            />
            <FieldError message={fieldErrors.ubicacion} />
          </div>
        </div>
      </AppModal.Body>
      <AppModal.Footer>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancelar
        </Button>
        <Button size="sm" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear evento'}
        </Button>
      </AppModal.Footer>
    </AppModal>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// CalendarioTab — gestiona fetch + CRUD; delega visual a CalendarWidget
// ══════════════════════════════════════════════════════════════════════════
export default function CalendarioTab({ cursoId, canManage }) {
  const [formEvt, setFormEvt] = useState(null); // null | "new" | elemento
  const queryClient = useQueryClient();

  // misma clave que el calendario general: comparten caché
  const { data, isLoading: loading } = useQuery({
    queryKey: queryKeys.calendario.byCurso(cursoId),
    queryFn: () => calendarioGetByCurso(cursoId),
    enabled: Boolean(cursoId),
    staleTime: 30_000,
  });
  const items = (data?.items ?? SIN_ITEMS).slice().sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  const stats = data?.estadisticas ?? null;

  // tras crear/editar/eliminar: refresca este curso, el calendario general y eventos
  const load = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.calendario.all() });
    queryClient.invalidateQueries({ queryKey: queryKeys.eventos.all() });
  }, [queryClient]);

  const handleDelete = async (id) => {
    await eventosDelete(id);
    load();
  };

  return (
    <>
      <CalendarWidget
        items={items}
        loading={loading}
        stats={stats}
        canManage={canManage}
        onRefresh={load}
        onCreateEvent={() => setFormEvt('new')}
        onEditEvent={(item) => setFormEvt(item)}
        onDeleteEvent={handleDelete}
        title="Calendario del curso"
      />

      {formEvt && (
        <EventoFormModal
          cursoId={cursoId}
          evento={formEvt === 'new' ? null : formEvt}
          onClose={() => setFormEvt(null)}
          onSaved={() => {
            setFormEvt(null);
            load();
          }}
        />
      )}
    </>
  );
}
