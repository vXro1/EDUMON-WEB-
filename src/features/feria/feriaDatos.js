// Contenido de /feria. Todo lo que dice cómo funciona Edumon está verificado contra el
// backend (modo simulado, 20-10-2026) y Backend/DEMO-BACKEND.md. Las cifras salen de
// Backend/REPORTE-HACKATHON.md: si cambian, se actualizan aquí sin tocar componentes.

export const CIFRAS = [
  { valor: 0.00084, decimales: 5, prefijo: "US$ ", sufijo: "", titulo: "por mensaje del chat", detalle: "Costo medido con tokens reales de Groq y precios oficiales" },
  { valor: 2.53, decimales: 2, prefijo: "US$ ", sufijo: "", titulo: "al mes para un colegio de 300 familias", detalle: "Suponiendo 10 mensajes por familia al mes" },
  { valor: 0, decimales: 0, prefijo: "", sufijo: " %", titulo: "de errores en la prueba de carga", detalle: "182 solicitudes al chat y a las alertas" },
  { valor: 3.9, decimales: 1, prefijo: "", sufijo: " s", titulo: "de respuesta promedio con IA", detalle: "10 mensajes reales con Groq (p95: 10 s)" },
];

// Usuarios del seed de demo (Backend/DEMO-BACKEND.md). La contraseña viene de VITE_DEMO_PASSWORD.
export const ROLES = [
  { id: "familia", rol: "Familia", telefono: "+573009990006", local: "3009990006", destino: "/familia/edumon",
    linea: "Habla o escribe a Edumon, escucha la respuesta y mira por qué respondió eso.", color: "var(--edu-blue-500)" },
  { id: "orientadora", rol: "Orientadora", telefono: "+573009990002", local: "3009990002", destino: "/convivencia/alertas",
    linea: "Alertas con su ruta de la Ley 1620 y verificación de integridad de la bitácora.", color: "var(--edu-pink-600)" },
  { id: "docente", rol: "Docente", telefono: "+573009990003", local: "3009990003", destino: "/escuela-padres/ciclo",
    linea: "El Ciclo Edumon de Grado Quinto A: qué preguntan las familias y qué reto proponer.", color: "var(--edu-green-600)" },
  { id: "rectora", rol: "Rectora", telefono: "+573009990001", local: "3009990001", destino: "/edumon-ia/panel",
    linea: "Panel: IA activa, seguridad, costo, impacto y opinión de las familias.", color: "var(--edu-yellow-600)" },
];

// "Así piensa Edumon": pasos verificados con las respuestas reales del backend
export const EJEMPLOS = [
  {
    id: "rabietas",
    etiqueta: "Crianza",
    mensaje: "mi hija de 4 años hace rabietas terribles",
    mascotaFinal: "saludo",
    pasos: [
      { titulo: "Clasifica el tema", detalle: "Tema: rabietas · edad: 4 años. Sin señales de riesgo.", mascota: "pensando" },
      { titulo: "Busca la ficha curada", detalle: "«Rabietas en niños pequeños», de UNICEF — Crianza positiva.", mascota: "pensando" },
      { titulo: "Responde citando la fuente", detalle: "Ideas para su etapa, una práctica de 5 minutos para la semana y «Basado en: UNICEF».", mascota: "ia" },
      { titulo: "«¿Por qué Edumon dijo esto?»", detalle: "Un toque muestra quién decidió, qué ficha usó y si la redactó un modelo o es la ficha tal cual.", mascota: "saludo" },
    ],
  },
  {
    id: "escolar",
    etiqueta: "Riesgo moderado",
    mensaje: "la profesora le dice bruto delante del salón",
    mascotaFinal: "llamar",
    pasos: [
      { titulo: "Detecta riesgo moderado", detalle: "Una regla de seguridad reconoce «le dice bruto»: posible maltrato psicológico.", mascota: "alerta" },
      { titulo: "Ubica la ruta de atención", detalle: "Ámbito escolar · situación Tipo I de la Ley 1620 (Decreto 1965 de 2013, art. 42).", mascota: "alerta" },
      { titulo: "Ofrece la ayuda del colegio", detalle: "«¿Quieres que orientación y tu docente te contacten?». Sin el permiso de la familia no avisa a nadie.", mascota: "llamar" },
      { titulo: "Si la familia acepta: alerta Tipo I", detalle: "Llega a convivencia como «La familia pidió apoyo», solo con el mensaje que la originó, nunca la conversación.", mascota: "llamar" },
    ],
  },
  {
    id: "grave",
    etiqueta: "Riesgo grave",
    mensaje: "me kiero matar ya no puedo mas",
    mascotaFinal: "llamar",
    pasos: [
      { titulo: "Corrige la ortografía", detalle: "«kiero» → «quiero». Las faltas no esconden un caso grave.", mascota: "pensando" },
      { titulo: "Decide una regla, no la IA", detalle: "La regla de seguridad reconoce «me quiero matar» aunque no haya IA disponible.", mascota: "alerta" },
      { titulo: "Respuesta fija con líneas de ayuda", detalle: "Texto revisado de antemano: ICBF 141, Línea 155, Línea 192 opción 4 y 123 si hay peligro inmediato.", mascota: "llamar" },
      { titulo: "Alerta automática a convivencia", detalle: "Con su bitácora encadenada desde el primer evento.", mascota: "alerta" },
      { titulo: "Protocolo de la ruta de atención", detalle: "Protocolo de salud mental (riesgo suicida), con la fuente oficial pendiente de validación por orientación.", mascota: "llamar" },
    ],
  },
];

export const CICLO = [
  { titulo: "Las familias conversan", detalle: "Preguntan a Edumon a cualquier hora. Sus conversaciones son privadas: el colegio no las lee." },
  { titulo: "Temas anónimos", detalle: "Solo se cuentan etiquetas de tema, y un tema aparece si lo consultaron al menos 5 familias distintas en 30 días." },
  { titulo: "El docente ve su curso", detalle: "Por ejemplo, en la demo: «Pantallas y celular · 6 familias» en Grado Quinto A." },
  { titulo: "Edumon sugiere", detalle: "Módulos y un borrador de reto sobre el tema más consultado. El docente lo revisa: nada se publica solo." },
  { titulo: "Las familias hacen el reto", detalle: "Lo ponen en práctica en casa y entregan una reflexión escrita." },
  { titulo: "Vuelve a empezar", detalle: "Cada reto creado queda ligado a su tema, y las nuevas conversaciones muestran qué sigue preocupando." },
];

export const BITACORA_INICIAL = [
  { accion: "Alerta creada", estado: "nueva", nota: "Edumon detectó un posible riesgo grave." },
  { accion: "Cambio de estado", estado: "en atención", nota: "Orientación llamó a la familia." },
  { accion: "Nota", estado: "en atención", nota: "Se acordó una cita con la familia el jueves." },
  { accion: "Cambio de estado", estado: "cerrada", nota: "Caso remitido a la EPS y cerrado." },
];

export const FUENTES = ["UNICEF", "OMS", "ICBF", "MinEducación"];
export const NORMAS = ["Ley 2025 de 2020", "Ley 1620 de 2013", "Decreto 1965 de 2013", "Decreto 459 de 2024"];
