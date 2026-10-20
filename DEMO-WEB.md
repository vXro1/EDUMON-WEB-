# Demo web de Edumon IA (feria, 21-10-2026)

Cómo levantar la web y el backend en el portátil de la feria, con qué usuarios entrar y el recorrido clic a clic.
Todos los datos de la demo son **ficticios** (seed de demo del backend).

- Rama de la web: `feature/modulo-ia` (este repo).
- Rama del backend: `feature/modulo-ia` (`Backend/`).
- Contraseña de los usuarios de demo: está en `Backend/DEMO-BACKEND.md`, sección 1 (no se repite aquí).

## 1. Requisitos

- Node 22 o superior, `npm ci` hecho en `Backend/` y en la web.
- Git Bash en Windows (los comandos de abajo son de Bash).
- Para el modo con IA real: `Backend/.env` con `GROQ_API_KEY` (y `OPENAI_API_KEY` si se quiere respaldo). Sin llaves funciona en **modo simulado**.

## 2. Levantar todo (3 terminales)

Desde la carpeta raíz `Edumon/`. Se ensayó así el 20-10-2026 (MongoDB en memoria: se borra al cerrarlo).

**Terminal 1: MongoDB de demo (en memoria)**

```bash
cd Backend
node tests/demo/mongoEfimero.mjs --puerto 27999
# esperar la línea MONGO_URI=mongodb://127.0.0.1:27999/edumon_demo
```

**Terminal 2: seed y backend**

```bash
cd Backend
NODE_ENV=development MONGO_URI="mongodb://127.0.0.1:27999/edumon_demo" node src/scripts/seedDemo.js

# A) Con el proveedor real (llaves del .env) y notas de voz:
env NODE_ENV=development PORT=4100 MONGO_URI="mongodb://127.0.0.1:27999/edumon_demo" \
  FRONTEND_URL= SMTP_HOST= IA_NOTAS_VOZ=true IA_RATE_LIMIT_MAX=200 node src/index.js

# B) Plan B, modo simulado (sin llaves): reglas + fichas curadas
env NODE_ENV=development PORT=4100 MONGO_URI="mongodb://127.0.0.1:27999/edumon_demo" \
  FRONTEND_URL= SMTP_HOST= OPENAI_API_KEY= GROQ_API_KEY= IA_RATE_LIMIT_MAX=200 node src/index.js
```

Debe imprimir `Servidor corriendo en puerto 4100` y una línea `[Edumon IA] …` (proveedores activos o modo simulado).

**Terminal 3: la web**

```bash
cd Frontend
cp .env.example .env.local      # VITE_BACKEND_URL=http://127.0.0.1:4100 y VITE_MODO_DEMO=true
npm run dev                     # http://localhost:5173
```

> Para volver a dejar los datos como al inicio (por ejemplo, entre dos jurados): repetir el comando del seed en la terminal 2. No hace falta reiniciar el backend.

### Build de producción (opcional)

```bash
cd Frontend
npm run build && npm run preview   # sirve dist/ en http://localhost:4173 (usa el mismo proxy si VITE_BACKEND_URL está definido)
```

## 3. Usuarios del seed

| Rol | Usuario | Teléfono (escribir sin +57) |
|---|---|---|
| Familia | Familia1 | 3009990006 |
| Familia (para la nota de voz) | Familia2 | 3009990007 |
| Docente, responsable de convivencia | Orientadora Convivencia | 3009990002 |
| Docente de Grado Quinto A | Docente Quinto | 3009990003 |
| Administrador (rectora) | Rectora Demo | 3009990001 |

## 4. Recorrido clic a clic (checklist)

Abrir `http://localhost:5173/login`. Cerrar sesión (menú del usuario, arriba a la derecha) entre cada rol.

**Familia (Familia1)**
- [ ] Entrar con `3009990006`. Menú **Edumon IA**.
- [ ] Escribir `mi hija de 4 años hace rabietas terribles` y Enter.
- [ ] Se ve "Edumon está pensando…" (si pasa de 8 s: "Sigue pensando, ya casi…"). El botón de enviar queda deshabilitado.
- [ ] La respuesta muestra práctica de la semana, **Basado en: UNICEF — Crianza positiva** y, si no la redactó un modelo, la etiqueta "Respuesta basada en fichas curadas, sin IA generativa".
- [ ] Clic en **Sí** (👍) → escribir un comentario → **Enviar comentario** → "¡Gracias! Tu opinión nos ayuda a mejorar.".
- [ ] Clic en **¿Por qué Edumon dijo esto?** → resumen, quién decidió, cómo se escribió la respuesta, fichas y fuentes con enlace → **Cerrar**.
- [ ] Escribir `me kiero matar ya no puedo mas` → respuesta fija en rojo con las líneas de ayuda **141, 155, 192, 123** destacadas.
- [ ] **¿Por qué Edumon dijo esto?** → "Una regla de seguridad…", corrección **kiero → quiero**, ruta "Personal (salud mental)" y la nota "Pendiente de validación por orientación/convivencia".

**Nota de voz (Familia2, solo con el backend en modo A)**
- [ ] Entrar con `3009990007` → Edumon IA → botón del **micrófono** → hablar → botón rojo **Detener y enviar**.
- [ ] Aparece la burbuja "Nota de voz · transcripción" con el texto entendido y luego la respuesta.
- [ ] Si el backend no tiene notas de voz (modo B), sale "Las notas de voz no están activas. Escribe tu mensaje." y el micrófono se oculta.

**Convivencia (Orientadora)**
- [ ] Entrar con `3009990002`. Menú **Alertas convivencia**.
- [ ] Arriba, en verde: **Bitácora íntegra · N eventos en M alertas**.
- [ ] La alerta nueva "me kiero matar ya no puedo mas" está de primera, con la columna **Ruta de atención** (ámbito, tipo Ley 1620 o protocolo y la nota de validación).
- [ ] **Ver qué hacer y por qué** → bloque "Por qué se generó esta alerta" (resumen, quién decidió, corrección de ortografía).
- [ ] **Marcar en atención** → "Alerta actualizada".
- [ ] **Verificar integridad** → verde "Bitácora íntegra · 2 eventos".
- [ ] Volver y abrir la alerta "el profesor de música…" → **Fundamento normativo** con la norma, el artículo, el texto literal y **Ver texto oficial**.
- [ ] (Opcional, demostrar manipulación) Ver la sección 5.

**Docente de Grado Quinto A**
- [ ] Entrar con `3009990003`. Menú **Ciclo Edumon**.
- [ ] Temas: **Pantallas y celular · 6 familias** (con el reto ya creado) y **Sueño · 5 familias**. Nota de privacidad (5 familias, 30 días) y aviso de temas ocultos.
- [ ] **Sugerirme módulo y reto** → borrador de reto y módulos sugeridos.
- [ ] **Crear este reto en el curso** → se abre el formulario normal de retos del curso con el borrador → **Usar en el reto** → el formulario queda lleno → elegir módulo y fecha → **Crear reto**.

**Administrador (Rectora)**
- [ ] Entrar con `3009990001`. Menú **Panel Edumon IA**.
- [ ] **Proveedores de IA**: estado de Groq y OpenAI (activo, en pausa o sin llave) y última latencia.
- [ ] **Métricas de seguridad**: nota "Desarrollo vs. ciego"; las filas holdout y original dicen **DESARROLLO**; mientras no haya conjunto ciego se aclara que no hay métrica final.
- [ ] **¿Les sirve Edumon?**: total, % útil y comentarios; filtro **Sesión** = `feria-2026-10-21`.
- [ ] **Costo de la IA**: costo por mensaje, proyección mensual y el **supuesto** (mensajes por familia al mes, editable).
- [ ] **Impacto**: etiqueta **Datos de demostración** (por `VITE_MODO_DEMO=true`).

## 5. Demostrar que la bitácora detecta manipulación (opcional)

Con `mongosh` (instalado con MongoDB), editar a mano un evento de la alerta que se marcó "en atención":

```bash
mongosh "mongodb://127.0.0.1:27999/edumon_demo" --quiet --eval \
  "db.alertariesgos.updateOne({estado:'en_atencion', mensajeDisparador:/kiero/}, {\$set:{'historial.1.nota':'editado a mano'}})"
```

En **Alertas convivencia** el indicador pasa a rojo: "Bitácora alterada en 1 alerta · Se rompe en el evento 2 (cambio de estado…): el evento fue editado después de registrarse". En el detalle, **Verificar integridad** muestra lo mismo. Para volver a verde: repetir el seed.

## 6. Plan B durante la feria

- **Groq gratuito: unos 2 mensajes por minuto en todo el sistema.** Pasado eso responde 429 y Edumon contesta con fichas curadas; la web lo marca con "Respuesta basada en fichas curadas, sin IA generativa" y el panel muestra Groq "En pausa (cooldown)". Es el comportamiento esperado: contenido curado y la red de seguridad de casos graves intacta.
- **La llave de OpenAI del backend responde 401** (ensayo del 20-10): no hay respaldo real si Groq se pausa.
- Si algo falla con el proveedor: reiniciar el backend en **modo B (simulado)**. Todo el recorrido funciona igual, salvo las notas de voz.
- Límite por usuario: si molesta en ensayos repetidos, subir `IA_RATE_LIMIT_MAX` (ya va en 200 en los comandos de arriba). La web muestra el mensaje del 429 tal cual.

## 7. Capturas

En `docs/demo/`, cada pantalla en los dos modos (`-real` y `-simulado`), más la bitácora alterada (`19-` y `20-`).
