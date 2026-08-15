# Frontend — Organizador de microciclos de fútbol

React + Vite, con Redux Toolkit para el estado global y react-router-dom para las rutas.
Organizado por features (auth, plantel, calendario — como el proyecto de la facultad).

## Cómo correrlo

1. Con el backend ya corriendo (ver su propio README).
2. `npm install`
3. Copiá `.env.example` a `.env` (por defecto apunta a `http://localhost:3000/v1`, que es
   donde corre el backend).
4. `npm run dev` y abrí la URL que te muestre (por defecto `http://localhost:5173`).

## Qué está hecho

- **Login / Registro**, con roles (colaborador, dt, preparador físico, médico,
  nutricionista, admin).
- **Rutas protegidas**: si no iniciaste sesión, te manda al login.
- **Layout con las dos pestañas** (Calendario y microciclos / Plantel).
- **Plantel completo**: tarjetas de jugador con foto (Cloudinary), semáforo de
  disponibilidad (apto/carga controlada/lesionado), alta de jugador, perfil con datos,
  historial de lesiones editable, **estadísticas por campeonato** (con desglose "por
  rival" expandible) y **carga GPS individual** (total del microciclo actual, total
  histórico separado en entrenamientos/partidos, e historial completo desplegable).
- **Calendario y microciclos completo**:
  - Campeonatos (crear, renombrar, eliminar)
  - Calendario mensual: marcar/sacar partidos, coloreados por campeonato, con el
    nombre del rival arriba del número
  - Panel de datos del partido: campeonato, rival, resultado, citados (bloquea
    lesionados automáticamente), minutos jugados por citado
  - Lista de microciclos filtrada por el mes que estás mirando
  - Grilla del microciclo con las 4 categorías por defecto, coloreada por nivel de carga
  - Detalle de cada celda: resumen/detalle, jugadores disponibles (todos/ninguno/
    automático), lo específico de cada categoría (km por jugador en Físico, imágenes +
    link de práctica en Táctica, link de video en Video, solo comentarios en Emocional),
    y marcador de "salió sentido" por jugador y día
  - División en subgrupos dentro de cualquier celda
  - **Alerta de vencimiento de lesión** arriba de todo, cuando corresponde
  - **Vista "Hoy"**: si la fecha de hoy cae dentro de algún microciclo cargado
  - **Resumen mensual descargable** (archivo HTML con todo lo del mes elegido)
- **Modo administrador real**: usando el rol del usuario logueado (admin/dt) en vez de
  un PIN inventado — los botones de eliminar partido, eliminar fila y eliminar
  campeonato solo aparecen para esos roles. El backend ya lo exige también del lado
  del servidor.
- La carga controlada automática (MD+1/MD+2 al jugar 45'+) ya se refleja sola en el
  semáforo de cada jugador apenas cargás los minutos del partido.
- **"Jugaron menos de 45' / 45'+"**: filtra automáticamente según los minutos reales
  del partido más cercano anterior a esa fecha (en el modo simple y en cada subgrupo).
- **División en subgrupos con datos reales**: al dividir una celda, arma solos
  "Jugaron" / "Pocos minutos y no citados" usando los minutos del partido anterior,
  en vez de arrancar vacío.
- **Acumulado de GPS de todo el plantel** para el microciclo actual, desplegable
  dentro de la celda de Físico.
- **Leyenda de colores por campeonato** debajo del calendario.
- **Restablecer sugerido** (solo admin/dt) y **Imprimir / PDF** de la grilla del
  microciclo.
- **Carga controlada manual** desde un botón chico y separado en la tarjeta del
  jugador (no hace falta pasar por el círculo de lesión para marcarla).
- **Eliminar imágenes** de táctica ya subidas.
- **Métrica GPS editable** directo desde la celda de Físico (no solo se muestra).
- **Resumen "Participan / No participan"** debajo de cada checklist de jugadores
  (modo simple, cada subgrupo, y los citados del partido).
- Si un jugador ya citado se lesiona después, se saca solo de los citados del
  partido (antes solo quedaba bloqueado visualmente).
- **La alerta de vencimiento de lesión ahora se ve en cualquier pestaña** (antes solo
  aparecía dentro de Calendario).
- **Al marcar un partido nuevo, salta directo a ver ese microciclo** y te pregunta a
  qué campeonato pertenece en el momento (como en el prototipo), en vez de tener que
  asignarlo después a mano.
- **Renombrar un campeonato es editar el texto directo** (como cualquier otro campo
  de la app), en vez de una ventanita de "prompt" del navegador.
- **Los subgrupos ahora también muestran el color de disponibilidad** (rojo lesionado,
  amarillo carga controlada) en su checklist, igual que el modo simple.
- **Los chips de partidos están filtrados por el mes visible** del calendario, y tienen
  su propia "×" para sacar el partido rápido (solo admin/dt).
- **Cambiar el nivel de carga (Baja/Media/Alta) directo desde la grilla** — antes no
  había ninguna forma de tocarlo, solo se veía el color que traía por defecto.
- **Estado de cada lesión** (Activa / Futura / Finalizada) en el historial del perfil.
- **Cargar o eliminar un partido a mano** en el desglose por campeonato del perfil, sin
  depender de que ese partido exista en el calendario.
- **Total "TODOS"** sumado de todos los campeonatos, debajo del desglose por campeonato.
- **Panorama del mes** (gráfico de barras Carga baja/media/alta) en Resumen mensual,
  y el resumen descargable ahora incluye lesionados del mes, el nivel de cada celda y
  el listado de jugadores por celda/subgrupo (antes solo texto).
- Vista "Hoy" ahora también muestra el chip de nivel (Baja/Media/Alta) por fila.
- **El desglose "Por rival" del perfil ahora es totalmente editable en línea**
  (rival, minutos, y un selector de motivo "No citado/Lesionado/Otro" cuando jugó 0
  minutos) — antes solo se podía agregar o borrar, no corregir un dato ya cargado.
- **El perfil muestra todos los campeonatos existentes**, tenga o no partidos
  cargados en cada uno (antes solo aparecían los que ya tenían algún dato).
- **"Microciclo actual" vuelve a aparecer en la carga GPS individual del perfil**,
  buscando sola la semana vigente (o la más reciente).

## Qué podría seguir sumándose más adelante

- Perfiles diferenciados de verdad para médico/nutricionista (hoy todos los roles
  logueados ven las mismas pantallas; el backend ya distingue roles, falta que cada uno
  tenga su propia vista con solo los campos que le corresponden).
- Exportar/importar backup completo (como teníamos en el prototipo) — con base de datos
  de verdad esto ya no es tan crítico, pero podría servir como resguardo extra.
- Tests automáticos.

Con esto la app ya cubre, funcionalmente, todo lo que teníamos armado en el prototipo.
