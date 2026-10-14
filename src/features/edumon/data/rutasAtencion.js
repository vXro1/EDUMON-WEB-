// Guía orientativa para quien recibe una alerta de Edumon. Basada en la Ruta de
// Atención Integral para la Convivencia Escolar (Ley 1620 de 2013, Decreto 1965
// de 2013) y en las rutas de protección del ICBF. Debe revisarse con orientación
// escolar y ajustarse al manual de convivencia de cada institución.

export const CATEGORIAS_ALERTA = {
  maltrato_fisico: "Maltrato físico",
  maltrato_psicologico: "Maltrato psicológico",
  abuso_sexual: "Abuso sexual",
  violencia_intrafamiliar: "Violencia intrafamiliar",
  autolesion_suicidio: "Autolesión o suicidio",
  negligencia_grave: "Negligencia grave",
};

// pasos comunes a todas las alertas
const PRIMEROS_PASOS = [
  "Lee el mensaje con calma. Es lo único que Edumon comparte: no tienes acceso a la conversación completa y no debes pedírsela a la familia.",
  "Informa hoy mismo a orientación escolar y a rectoría (Decreto 1965 de 2013). No manejes el caso solo.",
];

const CIERRE = [
  "Registra en las notas de esta alerta cada acción, fecha y a quién se remitió el caso. Cambia el estado a \"En atención\" y ciérrala solo cuando el caso esté remitido o resuelto.",
  "Guarda la confidencialidad: solo deben conocer el caso las personas que intervienen en la ruta.",
];

export const RUTAS_ATENCION = {
  abuso_sexual: {
    urgencia: "Inmediata — situación tipo III",
    resumen: "Un posible delito sexual contra un menor. La institución no investiga: reporta y protege.",
    pasos: [
      ...PRIMEROS_PASOS,
      "Reporta de inmediato al ICBF (línea 141) y a la Policía de Infancia y Adolescencia o la Fiscalía (CAIVAS). Rectoría es responsable de hacer el reporte.",
      "Contacta a la familia para acompañarla, pero no confrontes al presunto agresor ni le cuentes del reporte.",
      "No interrogues al niño ni le pidas detalles: repetir el relato lo revictimiza. Si te cuenta algo, escúchalo, créele y dile que no es su culpa.",
      "Si hay contacto reciente o lesiones, la atención en salud es urgente (las primeras 72 horas son clave).",
      ...CIERRE,
    ],
  },
  maltrato_fisico: {
    urgencia: "Prioritaria — hoy",
    resumen: "El cuidador contó que golpea o castiga físicamente al niño. El castigo físico está prohibido (Ley 2089 de 2021).",
    pasos: [
      ...PRIMEROS_PASOS,
      "Llama a la familia y cítala a una conversación sin juicio: el objetivo es proteger al niño y acompañar a la familia a criar sin golpes, no castigarla.",
      "Observa al estudiante con discreción (cambios de ánimo, miedo a volver a casa, lesiones). Si hay lesiones o el maltrato es grave o repetido, reporta al ICBF (141) o a la Comisaría de Familia.",
      "Ofrece a la familia orientación en disciplina positiva e invítala a la próxima escuela de padres.",
      "Programa un seguimiento en 2 a 4 semanas para confirmar que la situación cambió.",
      ...CIERRE,
    ],
  },
  violencia_intrafamiliar: {
    urgencia: "Prioritaria — hoy",
    resumen: "Violencia entre adultos del hogar que también afecta a los niños.",
    pasos: [
      ...PRIMEROS_PASOS,
      "Contacta a la persona que escribió en un momento y medio seguros: el agresor puede estar cerca o revisar su teléfono.",
      "Orienta hacia la Comisaría de Familia (medidas de protección) y la Línea 155. Si hay peligro inmediato, llamar al 123.",
      "Si los niños están expuestos a la violencia, reporta también al ICBF (141).",
      ...CIERRE,
    ],
  },
  autolesion_suicidio: {
    urgencia: "Inmediata",
    resumen: "Posible riesgo de autolesión o suicidio del estudiante o del cuidador.",
    pasos: [
      ...PRIMEROS_PASOS,
      "Contacta a la familia de inmediato. Si el riesgo es para el estudiante, que no quede solo y que no tenga acceso a medios para hacerse daño.",
      "Remite a urgencias o a la EPS para valoración en salud mental. Línea 192 opción 4 para orientación.",
      "Si la persona en riesgo es el cuidador, oriéntalo a la misma ruta de salud y verifica que los niños queden al cuidado de otro adulto.",
      "Activa el seguimiento con orientación escolar al regresar a clases.",
      ...CIERRE,
    ],
  },
  maltrato_psicologico: {
    urgencia: "Prioritaria — esta semana",
    resumen: "Humillaciones, encierros, amenazas u otras formas de maltrato emocional.",
    pasos: [
      ...PRIMEROS_PASOS,
      "Cita a la familia a una conversación sin juicio y ofrece orientación en crianza respetuosa.",
      "Observa al estudiante y coordina apoyo de orientación escolar.",
      "Si el maltrato persiste o se agrava, reporta a la Comisaría de Familia o al ICBF (141).",
      ...CIERRE,
    ],
  },
  negligencia_grave: {
    urgencia: "Prioritaria — hoy",
    resumen: "El niño podría no estar recibiendo alimentación, cuidado o supervisión básicos.",
    pasos: [
      ...PRIMEROS_PASOS,
      "Contacta a la familia para entender la situación: a veces la negligencia viene de pobreza o crisis y la familia necesita apoyo, no solo un reporte.",
      "Verifica con discreción el estado del estudiante (alimentación, higiene, asistencia).",
      "Reporta al ICBF (141) para verificación de derechos, y gestiona apoyos institucionales disponibles (alimentación escolar, trabajo social).",
      ...CIERRE,
    ],
  },
};
