# Edumon Frontend

Aplicación web de Edumon, plataforma de gestión escolar: paneles para superadmin, administrador del colegio, docentes y familias, con cursos, módulos, retos y entregas, foros, calendario, eventos y notificaciones. Consume la API del repositorio `Backend`.

## Stack

- React 19 y Vite 7
- React Router 7, TanStack Query 5 (datos del servidor), Zustand 5 (estado local)
- Tailwind CSS 4 y un sistema de diseño propio (`src/styles`)
- Socket.IO (notificaciones en tiempo real)
- Vitest y Testing Library; ESLint y Prettier
- Producción: nginx (imagen Docker)

## Requisitos

- Node.js 22 o superior
- El backend corriendo en local (`http://localhost:4000` por defecto)

## Instalación

```bash
npm install
cp .env.example .env.local   # opcional
npm run dev                  # http://localhost:5174
```

En desarrollo, Vite reenvía `/api`, `/uploads`, `/static` y `/socket.io` al backend local.

## Variables de entorno

Documentadas en [`.env.example`](.env.example):

- `VITE_API_PROXY_TARGET`: destino del proxy de desarrollo (por defecto `http://localhost:4000`)
- `VITE_API_URL`: base de la API para el navegador (por defecto `/api`). En Docker se puede fijar en el build o al arrancar el contenedor (ver `Dockerfile`).

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Sirve el build localmente |
| `npm test` | Pruebas (Vitest) |
| `npm run lint` | ESLint |
| `npm run format` / `npm run format:check` | Prettier |

## Estructura

```
src/
  main.jsx, App.jsx   arranque y proveedores
  routes/             rutas y protección por rol
  features/           módulos por dominio (cursos, tareas, foros, usuarios, familia...)
  components/         componentes compartidos (layout, formularios, UI)
  services/           cliente HTTP, servicios y claves de React Query
  hooks/, context/, store/, lib/, utils/, security/, config/
  pages/              landing, tutoriales y páginas públicas
  styles/             tokens y estilos del sistema de diseño
docs/                 manuales de usuario y documentación técnica
```

## Docker

`Dockerfile`, `nginx.conf.template` y `docker-entrypoint.sh` construyen la imagen (build con Node, servida con nginx sin privilegios). El despliegue completo está en el repositorio raíz `Edumon`.

## Autora

Karen Verónica Mancilla Solarte
