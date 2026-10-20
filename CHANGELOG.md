# Changelog

## Módulo Edumon IA en la web (rama `feature/modulo-ia`, 20-10-2026)

Integra el módulo de IA de la rama `IAedumon` y lo completa contra el contrato del backend (`Backend/CONTRATOS-WEB.md`).

**Chat de la familia (`/familia/edumon`)**
- Calificación 👍/👎 bajo cada respuesta, con comentario opcional y `sesionValidacion` (`VITE_IA_SESION_VALIDACION`, por defecto `feria-2026-10-21`).
- Panel "¿Por qué Edumon dijo esto?": resumen, quién decidió, cómo se escribió, fichas, fuentes con enlace, correcciones de ortografía y ruta de atención.
- Etiqueta del modo cuando la respuesta no la redactó un modelo (fichas curadas o texto fijo).
- "Edumon está pensando…" y, pasados 8 s, "Sigue pensando, ya casi…"; envío deshabilitado mientras espera; timeout de 60 s para el chat.
- 429 `LIMITE_IA` con el mensaje del backend en un aviso que no desaparece solo.
- Respuesta grave con las líneas de ayuda más grandes y destacadas.
- Notas de voz: grabar, transcribir y responder; si el backend tiene la función apagada (404) o sin transcripción (503), se oculta el micrófono y se pide escribir.
- Historial navegable con teclado y foco visible en la caja de mensaje.

**Convivencia (`/convivencia/alertas`)**
- Indicador "Bitácora íntegra" (o alterada, con el evento y el motivo) y botón "Verificar integridad" por alerta.
- Columna de ruta de atención (ámbito, tipo Ley 1620 o protocolo y nota de validación).
- "Por qué se generó esta alerta" y fundamento normativo con norma, artículo, texto literal y enlace oficial.
- 409 `ALERTA_MODIFICADA`: recarga la alerta y explica qué pasó.

**Ciclo Edumon (`/escuela-padres/ciclo`, docente y administrador)**
- Temas anónimos por curso (mínimo 5 familias, 30 días, aviso de temas ocultos) y retos creados.
- "Sugerirme módulo y reto" (con el 422 explicado) y "Crear este reto en el curso", que abre el formulario normal de retos con el borrador.

**Panel Edumon IA (`/edumon-ia/panel`, administrador)**
- Proveedores, métricas de seguridad (desarrollo vs. ciego), retroalimentación con filtro de sesión, costo con su supuesto e impacto con la etiqueta "Datos de demostración" (`VITE_MODO_DEMO`).

**Otros**
- `apiFetch` acepta `timeoutMs` por llamada y adjunta `status` a los errores.
- `.env.example` de la web y `DEMO-WEB.md`.
- Pruebas: el rol `admin` pasa a `administrador`; pruebas nuevas de los mensajes de error de IA.

## Auth: fix 401 en login

El frontend enviaba `{ telefono, contraseña }` (con tilde); el backend espera `contrasena` (sin tilde). Corregido en `authLogin`, `authRegister`, `authChangePassword`, `authResetPassword`.
