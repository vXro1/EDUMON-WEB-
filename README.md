# Edumon — Frontend

SPA de **Edumon**, plataforma de gestión escolar que conecta instituciones, docentes y padres/acudientes: cursos, módulos, tareas ("retos"), entregas con calificación, foros, calendario/eventos y notificaciones.

## Stack

- React 19 + Vite 7 (no Next.js — el proyecto se inició con `create-next-app` pero se migró; algunos archivos de scaffolding de Next quedaron sin uso, ver más abajo)
- React Router DOM 7, Zustand 5, TanStack Query 5
- Tailwind CSS v4 + un sistema de diseño propio (tokens en `src/styles/tokens/`)
- Firebase (solo el SDK de Cloud Messaging)

## Desarrollo local

```bash
npm install
npm run dev       # http://localhost:5174 — hace proxy de /api al backend de Render
npm run build      # build de producción a dist/
npm run preview    # sirve el build anterior localmente
npm run lint
```

No hay `.env` versionado; las variables están documentadas en `.env.example`. En desarrollo el proxy de `vite.config.js` apunta por defecto al backend local (`http://localhost:4000`); para otro destino, definir `VITE_API_PROXY_TARGET` en un `.env.local`.

## Docker

Hay **dos** archivos relacionados con Docker y sirven para cosas distintas:

| Archivo | Para qué |
|---|---|
| **`docker-compose.yml`** (este repo) | El de **despliegue conjunto**: levanta frontend + backend juntos en una misma red de Docker, el que se usa en la VM real. El frontend (nginx) sirve el build estático y reenvía `/api/` y `/socket.io/` al contenedor del backend por su nombre de servicio interno. |
| `Backend Edumon/docker-compose.yml` (repo del backend) | Solo para desarrollar/probar el backend por separado, sin el frontend. |

Para levantar todo (requiere tener también el repo del backend como carpeta hermana — ver comentario al inicio de `docker-compose.yml`):

```bash
docker compose up --build
# Frontend: http://localhost:8080
# Backend directo (debug): http://localhost:4000
```

Detalle de la imagen del frontend (`Dockerfile` + `nginx.conf.template` + `docker-entrypoint.sh`):

- Build multi-etapa: `node:22-slim` compila el SPA, la imagen final es `nginx:1.27-alpine` — sin Node en producción.
- Corre como el usuario sin privilegios `nginx` (no root), igual que el backend corre como `node`.
- `VITE_API_URL` se puede fijar en build (`--build-arg`) o dejar que se resuelva **en el arranque del contenedor** (por defecto `/api`, ver comentarios en el `Dockerfile`) — la misma imagen sirve para cualquier entorno sin reconstruir.
- HTTPS queda preparado pero apagado en `nginx.conf.template` (bloque `server` comentado) — falta que infraestructura defina dominio y certificado; no se generó ningún certificado falso.

## Estructura

Ver el audit completo de pantallas, componentes, estado, rutas y deuda técnica en la documentación generada para el equipo (o `docs/flutter-migration/BLUEPRINT.md` para el contexto de una eventual migración a Flutter — desactualizado en algunos puntos, ver comentarios en ese mismo archivo).

## Autor

Karen Verónica Mancilla Solarte
