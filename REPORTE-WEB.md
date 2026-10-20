### REPORTE WEB EDUMON

**Fecha y hora:** 2026-10-20, 16:40 (hora de Colombia)
**Rama:** `feature/modulo-ia` (repo web `vXro1/Edumon-Repositorio-nuevo`; GitHub avisa que se movió a `vXro1/EDUMON-WEB-`, la redirección funciona y no cambié el remoto)
**Último commit en GitHub:** el commit de este reporte (`docs: reporte web…`), que sigue a `0831967` (guía de la demo, capturas y changelog)
**Autor verificado:** sí. Todos los commits nuevos son de Bryan Yepes <bryanyepes.dev@gmail.com>, sin trailers ni menciones a IA como autor. Los únicos commits de otros autores en la rama (vXro1, David Melo) ya existían en `main` o en `IAedumon`.

**Preparación (PASO 0):**
- `refactor/design-system`: tus 4 archivos quedaron en 2 commits (`e0dbaa6` eliminar institución, `283eec5` errores y textos), merge de la remota sin conflictos, build y pruebas en verde, push.
- **Base de la demo: `refactor/design-system`.** Contiene a `main` (0 commits de `main` le faltan) y solo le suma 3 commits pequeños (case-sensitivity de avatares y tus 2 commits); compila, pasa las pruebas y no toca chat, alertas, cursos ni panel. `feature/modulo-ia` (que estaba en `92fadbd`, 6 commits detrás de `main`) avanzó por fast-forward.
- Backend: `feature/modulo-ia` en `da2a1ab`, al día (`git pull --ff-only`: sin cambios). No modifiqué nada.
- Repo raíz y punteros de submódulos: sin tocar.

**1. Diagnóstico inicial**

Hallazgo clave: la rama remota `origin/IAedumon` de la web (vXro1, 14-10) ya traía el chat, el consentimiento, las alertas y el asistente de retos. Se fusionó en `feature/modulo-ia` (`78419d3`). La tabla refleja el estado después de ese merge, comparado con el contrato.

| # | Función | Estado | Dónde | Falta (h) |
|---|---|---|---|---|
| 1 | Consentimiento + 403 | ✅ | EdumonChatPage, ConsentimientoModal | 0 |
| 2 | Conversaciones listar/crear/ver/borrar | ⚠️ historial no navegable con teclado | EdumonChatPage | 0,1 |
| 3 | Enviar, fuentes y práctica | ✅ | EdumonChatPage | 0 |
| 4 | Etiqueta `ia.modo` | ❌ | — | 0,2 |
| 5 | "Edumon está pensando…" | ⚠️ sin cambio a los 8 s; timeout de 30 s corto | EdumonChatPage, apiClient | 0,2 |
| 6 | 429 LIMITE_IA | ❌ | — | 0,1 |
| 7 | "¿Por qué Edumon dijo esto?" | ❌ | — | 0,6 |
| 8 | 👍/👎 | ❌ | — | 0,4 |
| 9 | Oferta de ayuda | ✅ | TarjetaPedirAyuda | 0 |
| 10 | Notas de voz | ❌ | — | 1 |
| 11 | Tablero con ruta | ⚠️ ruta local, no la `rutaAtencion` del backend | AlertasConvivenciaPage, AlertaCard | 0,3 |
| 12 | "Bitácora íntegra" | ❌ | — | 0,2 |
| 13 | Verificar integridad | ❌ | — | 0,2 |
| 14 | Por qué se generó + fundamento | ⚠️ explicación armada en la web, sin fundamento | AlertaTrazabilidad | 0,4 |
| 15 | Estado/notas + 409 | ⚠️ sin 409 | AlertaCard | 0,1 |
| 16 | Vista del Ciclo | ❌ | — | 0,5 |
| 17 | Sugerencia + 422 | ❌ | — | 0,3 |
| 18 | Crear el reto sugerido | ⚠️ existe el asistente de retos, sin conexión al ciclo | EdumonRetoAsistente, TareasTab | 0,3 |
| 19 | Proveedores (`/health`) | ❌ | — | 0,3 |
| 20 | Métricas (`/metricas`) | ❌ | — | 0,4 |
| 21 | Retroalimentación | ❌ | — | 0,3 |
| 22 | Costo | ❌ | — | 0,2 |
| 23 | Impacto | ❌ | — | 0,3 |

Plan: P1 → P2 → P3 → P4 y, al final, P5 solo si sobraba tiempo. Sobró, así que **no hubo recorte**.

**2. Estado final**

| # | Estado | Nota |
|---|---|---|
| 1 | ✅ | Sin cambios; el 403 abre la autorización |
| 2 | ✅ | Historial con botones reales y foco visible |
| 3 | ✅ | Fuentes con enlace y práctica |
| 4 | ✅ | "Respuesta basada en fichas curadas, sin IA generativa" en `fichas_fallback`/`simulado`; "Texto fijo…" en `plantilla` |
| 5 | ✅ | Cambio a "Sigue pensando, ya casi…" a los 8 s; envío deshabilitado; timeout del chat de 60 s |
| 6 | ✅ | `message` del backend tal cual, en un aviso fijo |
| 7 | ✅ | Resumen, quién decidió, modo, fichas, fuentes, `kiero → quiero` y ruta |
| 8 | ✅ | PUT con `sesionValidacion: "feria-2026-10-21"`, voto inmediato y comentario opcional |
| 9 | ✅ | Sin cambios |
| 10 | ✅ | Probado con Whisper real; con 404 o 503 se oculta el micrófono y se pide escribir |
| 11 | ✅ | Ámbito, tipo Ley 1620 o protocolo y siempre la nota de validación |
| 12 | ✅ | Verde, o rojo con el evento y el motivo |
| 13 | ✅ | Verde "Bitácora íntegra · N eventos" o rojo con el evento y el motivo; probado con manipulación real en Mongo |
| 14 | ✅ | Del endpoint `/explicacion`; norma, artículo, texto literal y enlace oficial |
| 15 | ✅ | 409: recarga la alerta y lo explica (sin prueba E2E, ver riesgos) |
| 16 | ✅ | Temas con nº de familias, regla de 5 familias y 30 días, temas ocultos |
| 17 | ✅ | Módulos y borrador; 422 con mensaje claro (el seed no lo produce) |
| 18 | ✅ | Abre el formulario normal de retos del curso con el borrador listo para "Usar en el reto" |
| 19 | ✅ | Activo, en pausa (segundos restantes), sin llave; última latencia y errores |
| 20 | ✅ | Nota desarrollo vs. ciego siempre visible; holdout marcado "DESARROLLO"; el ciego se destaca cuando exista |
| 21 | ✅ | Total, % útil y comentarios; filtro por sesión |
| 22 | ✅ | Costo por mensaje, proyección mensual y supuesto editable |
| 23 | ✅ | Etiqueta "Datos de demostración" con `VITE_MODO_DEMO=true` |

**3. Recorrido de la demo** (automatizado con Playwright desde fuera del repo; resultado del 20-10, 16:31–16:35)

| Paso | Proveedor real (Groq) | Simulado |
|---|---|---|
| Familia escribe → respuesta con fuentes | sí (redactada por LLM) | sí (etiqueta de fichas) |
| 👍 + comentario | sí | sí |
| "¿Por qué?" | sí | sí |
| Mensaje grave con mala ortografía → líneas de ayuda | sí | sí |
| "¿Por qué?" del grave: `kiero → quiero` y ruta | sí | sí |
| La alerta aparece en convivencia con su ruta | sí | sí |
| Marcar en atención | sí | sí |
| Verificar integridad (verde) | sí | sí |
| Explicación de la alerta y fundamento normativo | sí | sí |
| Bitácora manipulada → rojo con evento y motivo | — | sí |
| Docente Quinto A: ciclo, sugerencia, crear reto | sí (reto redactado por IA) | sí (plantilla) |
| Admin: proveedores, métricas, retroalimentación, costo, impacto | sí | sí |
| Nota de voz | sí (transcripción real) | sí (función apagada → aviso y micrófono oculto) |

Con proveedor real pasan 31/31 verificaciones. En simulado pasan 30/30; la única queja es el registro del navegador "Failed to load resource 404", que es la respuesta esperada del contrato cuando las notas de voz están apagadas, y la web la maneja.

Build de producción ✅ · pruebas 65/65 ✅ · ESLint sin errores en lo tocado ✅.

**4. Capturas** (`docs/demo/`, cada una con sufijo `-real` y `-simulado`)
- `01-chat-respuesta` · `02-chat-calificacion` · `03-chat-por-que` · `04-chat-grave` · `05-chat-grave-por-que`
- `06-convivencia-tablero` · `07-alerta-detalle-integridad` · `08-alerta-por-que` · `09-alerta-fundamento`
- `10-ciclo-temas` · `11-ciclo-sugerencia` · `12-ciclo-crear-reto`
- `13-admin-proveedores` · `14-admin-metricas` · `15-admin-retroalimentacion` · `16-admin-costo` · `17-admin-impacto`
- `18-voz-transcripcion-real` · `18-voz-desactivada-simulado`
- `19-bitacora-alterada-tablero` · `20-bitacora-alterada-detalle`

**5. Cómo levantar la demo en el portátil de la feria** (detalle y checklist clic a clic en `DEMO-WEB.md`)

```bash
# Terminal 1
cd Backend && node tests/demo/mongoEfimero.mjs --puerto 27999
# Terminal 2
cd Backend
NODE_ENV=development MONGO_URI="mongodb://127.0.0.1:27999/edumon_demo" node src/scripts/seedDemo.js
env NODE_ENV=development PORT=4100 MONGO_URI="mongodb://127.0.0.1:27999/edumon_demo" FRONTEND_URL= SMTP_HOST= IA_NOTAS_VOZ=true IA_RATE_LIMIT_MAX=200 node src/index.js
#   plan B (simulado): agregar OPENAI_API_KEY= GROQ_API_KEY= y quitar IA_NOTAS_VOZ=true
# Terminal 3
cd Frontend && cp .env.example .env.local && npm run dev    # http://localhost:5173
```

Usuarios (contraseña en `Backend/DEMO-BACKEND.md`): Familia1 `3009990006`, Familia2 `3009990007` (voz), Orientadora `3009990002`, Docente Quinto `3009990003`, Rectora `3009990001`.

**6. Riesgos y pendientes** (por impacto en la demo)
1. **Cuota de Groq gratuita.** En el ensayo entró en pausa (429) después de 4 o 5 llamadas, y la **llave de OpenAI responde 401**, así que no hay respaldo real. Con varios jurados a la vez, buena parte de las respuestas saldrán de fichas curadas: la web lo marca y todo sigue funcionando. Para evitarlo: Dev Tier de Groq o una llave válida de OpenAI en `Backend/.env`.
2. **El 👍/👎 de esta tarde con familias reales** necesita esta rama desplegada en el ambiente que usen. No desplegué nada (regla). Sin despliegue, solo funciona en el portátil local.
3. **409 ALERTA_MODIFICADA** está implementado y cubierto por prueba unitaria, pero no lo probé de punta a punta (requiere dos ediciones simultáneas). El **422 del ciclo** tampoco se puede reproducir con el seed.
4. **No hay métrica final de seguridad:** el conjunto ciego del backend está vacío. El panel lo dice explícitamente; si un jurado pregunta, los números son de desarrollo.
5. **MongoDB en memoria:** si se cierra la terminal 1 se pierde todo, incluidas las calificaciones de la feria. Si se quieren conservar, usar el MongoDB local instalado (`C:/Program Files/MongoDB/Server/8.0`) o Docker, que no se ensayó.

**7. Decisiones que tomé sin preguntarte**
1. **Fusioné `origin/IAedumon`** (trabajo de vXro1 con chat, alertas y asistente de retos) en lugar de reescribirlo, con un merge normal que conserva su autoría. Resolví 3 conflictos: el menú (combiné ambos lados), los imports de `ModulosTab` (ambos) y el manual PDF (conservé la versión de `main` del 15-10, que es más reciente). Ese merge trae cambios de vXro1 en `TareaForm` y `TareasPage`; yo no los refactoricé.
2. **El borrador del ciclo** llega al formulario de retos por `sessionStorage` (vigencia de 30 min) y lo lee `EdumonRetoAsistente`, para no tocar `TareaForm` ni `TareasTab`. El docente igual pulsa "Usar en el reto" y publica por el flujo normal.
3. **`apiFetch` acepta `timeoutMs`** y adjunta `status` al error. El chat, la voz y la sugerencia usan 60 s, porque el backend puede tardar hasta unos 40 s si fallan los dos proveedores.
4. **El voto 👍/👎 se guarda al instante**; el comentario, si se escribe, reemplaza la calificación (el PUT lo permite). Así no se pierde el voto si la familia no comenta. El backend no devuelve calificaciones previas al recargar la conversación, así que los pulgares vuelven a aparecer vacíos.
5. **La etiqueta del modo solo aparece cuando no redactó un modelo** (fichas o texto fijo), para que sea discreta. En `plantilla` dice "Texto fijo revisado de antemano".
6. **Rutas nuevas:** `/escuela-padres/ciclo` (docente y administrador) y `/edumon-ia/panel` (solo administrador), con sus entradas en el menú.
7. **Variables de entorno de la web:** `VITE_MODO_DEMO` (etiqueta de demo), `VITE_IA_SESION_VALIDACION` (sesión del 👍/👎) y `VITE_BACKEND_URL`, documentadas en `.env.example`. Para versionar ese archivo agregué `!.env.example` al `.gitignore`.
8. **Métricas:** muestro siempre la `nota` del backend y marco cada fila holdout u original como "DESARROLLO". Aunque el contrato dice que "el número que importa es holdout", seguí tu regla de nunca presentarlo como métrica final.
9. **Prueba de roles:** el único `"admin"` en las pruebas era un caso de normalización; lo cambié por `"administrador"`.
10. **Playwright no está configurado en el repo**, así que lo usé desde una carpeta temporal (sin tocar `package.json`) para el ensayo y las capturas, y dejé el checklist clic a clic en `DEMO-WEB.md`. Para la nota de voz usé un audio de prueba sintetizado con la voz en español de Windows.
11. **Contraste y legibilidad:** subí los tamaños de texto del módulo (16 px en el chat), destaqué las líneas de ayuda y cambié el botón "Ver qué hacer y por qué" a contorno, porque el amarillo tenía poco contraste.
12. No cambié el remoto de la web pese al aviso de que el repo se movió.
