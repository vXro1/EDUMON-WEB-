export const queryKeys = {

  // ─── Cursos ───────────────────────────────────────────────────────────────
  cursos: {
    all:           ()         => ["cursos"],
    list:          (params)   => ["cursos", "list", params ?? {}],
    mine:          ()         => ["cursos", "mine"],
    detail:        (id)       => ["cursos", id],
    participantes: (id)       => ["cursos", id, "participantes"],
    modulos:       (id)       => ["cursos", id, "modulos"],
  },

  // ─── Tareas ───────────────────────────────────────────────────────────────
  tareas: {
    all:     ()         => ["tareas"],
    list:    (params)   => ["tareas", "list", params ?? {}],
    byCurso: (cursoId)  => ["tareas", "curso", cursoId],
    detail:  (id)       => ["tareas", id],
  },

  // ─── Entregas ─────────────────────────────────────────────────────────────
  entregas: {
    all:     ()         => ["entregas"],
    byTarea: (tareaId)  => ["entregas", "tarea", tareaId],
    mine:    (tareaId)  => ["entregas", "mine", tareaId],
  },

  // ─── Foros ────────────────────────────────────────────────────────────────
  foros: {
    all:       ()        => ["foros"],
    byCurso:   (cursoId) => ["foros", "curso", cursoId],
    detail:    (foroId)  => ["foros", foroId],
    messages:  (foroId)  => ["foros", foroId, "mensajes"],
    dashboard: (foroId)  => ["foros", foroId, "dashboard"],
  },

  // ─── Eventos ──────────────────────────────────────────────────────────────
  eventos: {
    all:     ()         => ["eventos"],
    byCurso: (cursoId)  => ["eventos", "curso", cursoId],
    hoy:     ()         => ["eventos", "hoy"],
    detail:  (id)       => ["eventos", id],
  },

  // ─── Calendario ───────────────────────────────────────────────────────────
  calendario: {
    all:     ()         => ["calendario"],
    byCurso: (cursoId)  => ["calendario", "curso", cursoId],
  },

  // ─── Usuarios ─────────────────────────────────────────────────────────────
  usuarios: {
    all:    ()       => ["usuarios"],
    list:   (params) => ["usuarios", "list", params ?? {}],
    detail: (id)     => ["usuarios", id],
  },

  // ─── Perfiles familiares ──────────────────────────────────────────────────
  perfiles: {
    all: () => ["perfiles"],
  },

  // ─── Sesiones ─────────────────────────────────────────────────────────────
  sesiones: {
    list: (page) => ["sesiones", page ?? 1],
  },

  // ─── Notificaciones ───────────────────────────────────────────────────────
  notificaciones: {
    all:    ()   => ["notificaciones"],
    unread: ()   => ["notificaciones", "unread"],
  },

  // ─── Instituciones ────────────────────────────────────────────────────────
  instituciones: {
    all:    ()   => ["instituciones"],
    detail: (id) => ["instituciones", id],
  },

  // ─── Buzon ────────────────────────────────────────────────────────────────
  buzon: {
    mensajes: (params) => ["buzon", "mensajes", params ?? {}],
  },
};
