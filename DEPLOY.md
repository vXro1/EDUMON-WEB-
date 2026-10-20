# Despliegue de la web en Vercel (demo pública)

La web es una SPA de Vite. Vercel sirve los archivos estáticos y, con un **rewrite**, reenvía `/api`, `/uploads` y `/static` al backend en Render. Así el navegador solo habla con el dominio de Vercel: las cookies de sesión son de primera parte (`SameSite=Lax`, `Secure`) y no hace falta CORS.

Se despliega la rama `feature/modulo-ia`. El backend va primero (ver `Backend/DEPLOY.md`): necesitas su URL de Render.

## 1. Antes de desplegar: poner la URL del backend

En `vercel.json`, reemplazar **las 3 apariciones** de `https://REEMPLAZAR-BACKEND.onrender.com` por la URL real del Web Service de Render (por ejemplo `https://edumon-backend-demo.onrender.com`), sin barra final. Hacer commit y push a `feature/modulo-ia`.

```bash
grep -n "REEMPLAZAR-BACKEND" vercel.json   # debe quedar vacío después del cambio
```

Qué hace `vercel.json`:
- `/api/:path*`, `/uploads/:path*`, `/static/:path*` → backend en Render (API, archivos subidos y avatares).
- `/(.*)` → `/index.html`: fallback de la SPA para que recargar `/familia/edumon` o `/convivencia/alertas/123` no dé 404. Vercel sirve primero los archivos que existen en `dist/` y solo usa el fallback cuando no hay archivo.
- `x-vercel-enable-rewrite-caching: 0` en `/api`: nunca cachear respuestas de la API en el CDN.

## 2. Variables de entorno de producción (Vercel)

Las variables `VITE_*` se leen **al compilar**: si se cambian, hay que volver a desplegar.

| Variable | Valor | Para qué |
|---|---|---|
| `VITE_MODO_DEMO` | `true` | Etiqueta "Datos de demostración" en el panel de Edumon IA |
| `VITE_IA_SESION_VALIDACION` | `feria-2026-10-21` | Sesión que viaja con cada 👍/👎 del chat |
| `VITE_TIEMPO_REAL` | `false` | No intentar conectar socket.io: el rewrite de Vercel no pasa websockets |
| `VITE_BACKEND_URL` | *(no definir)* | Solo la usa el proxy de `npm run dev` en local |
| `VITE_API_URL` | *(no definir)* | Por defecto `/api`, ruta relativa que pasa por el rewrite |
| `VITE_FIREBASE_VAPID_KEY` | *(opcional)* | Push del navegador; no hace falta para la demo |

## 3. Comandos de la CLI de Vercel

Desde la carpeta de la web (`Frontend/`), en la rama `feature/modulo-ia`:

```bash
git checkout feature/modulo-ia && git pull --ff-only

npx vercel login                       # una vez
npx vercel link                        # crea/vincula el proyecto (scope: tu cuenta; framework: Vite)

# variables de producción (cada comando pide confirmar; el valor va por la entrada estándar)
printf 'true'             | npx vercel env add VITE_MODO_DEMO production
printf 'feria-2026-10-21' | npx vercel env add VITE_IA_SESION_VALIDACION production
printf 'false'            | npx vercel env add VITE_TIEMPO_REAL production
npx vercel env ls                      # revisar que estén las 3

npx vercel                             # despliegue de prueba (preview), opcional
npx vercel --prod                      # despliegue a producción
```

Configuración que debe detectar `vercel link` (y que también fija `vercel.json`): Framework **Vite**, Build Command `npm run build`, Output Directory `dist`, Install Command `npm install`. Node 22 (fijado en `package.json` → `engines`).

Después de desplegar, copiar la URL de producción (por ejemplo `https://edumon-web.vercel.app`) y ponerla en `FRONTEND_URL` del backend en Render (ver `Backend/DEPLOY.md`).

## 4. Verificar

```bash
WEB=https://TU-PROYECTO.vercel.app

curl -s -o /dev/null -w "%{http_code}\n" $WEB/                          # 200 (index.html)
curl -s -o /dev/null -w "%{http_code}\n" $WEB/familia/edumon            # 200 (fallback de la SPA, no 404)
curl -s $WEB/api/auth/profile                                          # {"message":"Token requerido"} → el rewrite llega al backend
curl -s -i -X POST $WEB/api/auth/login -H 'Content-Type: application/json' \
  -d '{"telefono":"+573009990001","contraseña":"<SEED_DEMO_PASSWORD>"}' | grep -i "set-cookie"
# → access_token=…; Path=/; HttpOnly; Secure; SameSite=Lax
```

En el navegador: entrar a `$WEB/login`, iniciar sesión con un usuario del seed y recorrer el checklist de `DEMO-WEB.md` (chat, 👍/👎, "¿Por qué?", convivencia, ciclo, panel). En la consola del navegador no debe haber intentos de conexión a `/socket.io`.

## 5. Límites y limitaciones conocidas

- **Tiempo:** el proxy de Vercel espera hasta **120 s** la primera respuesta del backend (y el contador se reinicia mientras lleguen datos). El chat, la nota de voz y la sugerencia del ciclo esperan hasta 60 s en la web, así que caben.
- **Tamaño:** Vercel no documenta un límite propio para el cuerpo de las rewrites externas; el más cercano documentado es 4,5 MB (Functions). Una nota de voz de 2 minutos en webm/opus pesa ~1–2 MB, por debajo. El backend acepta hasta `IA_AUDIO_MAX_MB` (10 MB): si una grabación muy larga fallara con 413 en Vercel, es este límite.
- **Arranque en frío de Render (plan gratuito):** el backend se duerme tras ~15 min sin tráfico y tarda alrededor de un minuto en despertar. La primera petición puede pasar de los 30 s del cliente HTTP y mostrar "La solicitud tardó demasiado". Antes de la demo: abrir `https://<backend>.onrender.com/health` y esperar el `{"ok":true}`.
- **Sin tiempo real:** con `VITE_TIEMPO_REAL=false` el contador de notificaciones y la lista de notificaciones se actualizan al recargar o navegar, no en vivo. Nada más depende del socket.
- **Archivos subidos:** el disco del plan gratuito de Render es efímero; adjuntos y fotos subidos se pierden en cada reinicio. Los avatares predeterminados no se ven afectados.
