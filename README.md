# Backend — Organizador de microciclos de fútbol

API en Node.js + Express + MongoDB (Mongoose), con la misma arquitectura por capas
que el proyecto de la facultad (config / controllers / middlewares / model / routes /
services / validators).

## Cómo correrlo en tu compu

1. Necesitás tener instalado Node.js (18 o más nuevo) y MongoDB (o una cuenta gratis
   en MongoDB Atlas si preferís que la base esté en la nube).
2. `npm install`
3. Copiá `.env.example` a `.env` y completá los valores (sobre todo `MONGO_URI` y `JWT_SECRET`).
4. `npm run dev` (con recarga automática) o `npm start`.
5. El servidor queda en `http://localhost:3000`.

**Opcional:** si querés usar la función de "leer planilla física con foto" (que la IA
lea automáticamente los datos de GPS de una foto), completá también
`ANTHROPIC_API_KEY` en el `.env` con una clave de la API de Anthropic
(console.anthropic.com). Sin esa clave, el resto de la app funciona igual — solo esa
función puntual no va a andar y te va a avisar con un mensaje claro si la intentás usar.

## Qué está hecho hasta ahora

Todos los módulos del prototipo ya están conectados de punta a punta:

- **Autenticación**: registro y login con JWT (`POST /v1/auth/registro`, `POST /v1/auth/login`).
- **Usuarios con roles**: admin, dt, preparador_fisico, medico, nutricionista, colaborador.
- **Jugadores** (`/v1/jugadores`): CRUD, lesiones, carga controlada (manual y automática),
  endpoint de disponibilidad por fecha.
- **Campeonatos** (`/v1/campeonatos`): CRUD, con renombrado en cascada sobre las
  estadísticas ya cargadas de los jugadores.
- **Partidos** (`/v1/partidos`): marcar partido, editar rival/resultado/campeonato,
  citar jugadores (bloquea automáticamente a los lesionados, igual que en la app),
  cargar minutos por jugador — lo que dispara automáticamente:
  - la actualización de las estadísticas del jugador en ese campeonato
  - la carga controlada automática de MD+1/MD+2 si jugó 45' o más
- **Microciclos** (`/v1/microciclos`): cálculo de los huecos entre partidos, generación
  automática del contenido sugerido por día (igual lógica de fases que el prototipo,
  incluida la compresión cuando el microciclo es corto), edición de celdas, división
  en subgrupos, filas personalizadas, restablecer sugerido.
- **GPS** (`/v1/gps`): métrica configurable, carga por día con guardado que nunca pisa
  a otro jugador, acumulado por rango de fechas, e historial completo por jugador
  (`GET /v1/gps/jugador/:jugadorId`, distingue entrenamientos de partidos).
- **Subida de imágenes** (`/v1/uploads`, Cloudinary): fotos de jugador e imágenes de
  ejercicios de táctica.
- **Estadísticas manuales**: cargar o eliminar un partido a mano en las estadísticas
  de un jugador, sin depender de que exista un `Partido` real en el calendario
  (`POST/DELETE /v1/jugadores/:id/estadisticas`).
- **Permisos por rol**: `authorize("admin","dt")` protege eliminar partido, fila y
  campeonato.

Probé que el servidor arranca y todas las rutas protegidas rechazan bien sin token.

## Qué falta

- Deploy en un hosting real (Render, Railway, etc.) y base en MongoDB Atlas — por ahora
  está pensado para correr en tu compu en local.
- Tests automatizados.

El frontend en React que consume toda esta API ya está armado (ver su propio README).
