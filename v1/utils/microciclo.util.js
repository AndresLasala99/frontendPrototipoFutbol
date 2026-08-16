// Genera el contenido por defecto de cada día de un microciclo (entre dos partidos),
// con la misma lógica que usábamos en el prototipo: fase según cercanía al partido,
// y ajuste cuando el microciclo es corto (poco tiempo entre partidos).

const TEMPLATES = {
  RECOVERY: {
    fisico: { nivel: 1, resumen: "Regenerativo", detalle: "Trabajo regenerativo de baja intensidad: piscina, movilidad articular, liberación miofascial o rodado suave. El objetivo es acelerar la recuperación, no generar estímulo de entrenamiento." },
    tactica: { nivel: 1, resumen: "Libre / feedback", detalle: "Día libre de trabajo táctico formal, o como mucho una charla breve de cierre grupal. No se introducen conceptos nuevos." },
    video: { nivel: 2, resumen: "Autoanálisis", detalle: "Repaso individual o grupal corto del partido recién jugado: errores puntuales y aciertos a reforzar, sin entrar todavía en el próximo rival." },
    emocional: { nivel: 2, resumen: "Cierre del resultado", detalle: "Espacio para procesar el resultado, bueno o malo, sin que quede instalado. Conversaciones individuales si hace falta bajar tensión o sostener la confianza." },
  },
  LOAD: {
    fisico: { nivel: 3, resumen: "Fuerza, volumen alto", detalle: "Día de mayor volumen e intensidad física de la semana: fuerza, potencia, capacidad aeróbica o anaeróbica según necesidad del plantel. Se aprovecha el margen de recuperación hasta el próximo partido." },
    tactica: { nivel: 2, resumen: "Modelo propio", detalle: "Trabajo sobre el modelo de juego propio: principios de ataque y defensa que no dependen del rival, corrección de patrones detectados en el partido anterior." },
    video: { nivel: 2, resumen: "Patrones a corregir", detalle: "Análisis propio: qué funcionó y qué no en el partido anterior, para reforzar o corregir en los entrenamientos de la semana." },
    emocional: { nivel: 1, resumen: "Bajo perfil", detalle: "Bajo perfil en este eje: el foco del día está puesto en lo físico y en lo colectivo general." },
  },
  PRE2: {
    fisico: { nivel: 2, resumen: "Mantenimiento", detalle: "Se mantiene la frecuencia de estímulo pero sin generar fatiga que comprometa el partido: series cortas, intensidad sí, volumen no." },
    tactica: { nivel: 3, resumen: "Plan vs rival, ABP", detalle: "Entra de lleno el rival: fase ofensiva y defensiva específica según cómo juega, más el trabajo de pelota parada propia y del rival." },
    video: { nivel: 3, resumen: "Rival en detalle", detalle: "Sesión de video más extensa sobre el próximo rival, grupal y por sector o jugador si hace falta bajar algo puntual." },
    emocional: { nivel: 2, resumen: "Enfoque colectivo", detalle: "Se empieza a instalar el foco colectivo en el partido que viene: mensaje sobre lo que representa, sin sobrecargar todavía." },
  },
  PRE1: {
    fisico: { nivel: 1, resumen: "Activación", detalle: "Activación neuromuscular corta, sin volumen de carga. El cuerpo tiene que llegar fresco al día siguiente." },
    tactica: { nivel: 3, resumen: "Repaso final, ABP", detalle: "Repaso final y liviano del plan de partido ya instalado, últimos detalles de pelota parada, sin agregar información nueva." },
    video: { nivel: 2, resumen: "Clips clave", detalle: "Clips puntuales y cortos a modo de recordatorio, no una sesión completa de análisis." },
    emocional: { nivel: 3, resumen: "Charla previa", detalle: "Charla previa al partido: cohesión de grupo, mensaje de confianza y foco. Uno de los momentos de mayor peso emocional de la semana." },
  },
  MATCH: {
    fisico: { nivel: 3, resumen: "Competencia", detalle: "Máxima exigencia física del ciclo: la competencia en sí." },
    tactica: { nivel: 3, resumen: "Ejecución del plan", detalle: "Ejecución en cancha del plan trabajado durante la semana, con los ajustes que haga el cuerpo técnico en el entretiempo o durante el partido." },
    video: { nivel: 1, resumen: "Recordatorio puntual", detalle: "Prácticamente sin uso, salvo algún recordatorio puntual antes de salir a jugar." },
    emocional: { nivel: 3, resumen: "Activación mental", detalle: "Gestión de la previa inmediata: activación mental, manejo de nervios y concentración del plantel." },
  },
};

export const FILAS_DEFAULT = [
  { key: "fisico", label: "Físico" },
  { key: "tactica", label: "Táctica" },
  { key: "video", label: "Video" },
  { key: "emocional", label: "Emocional" },
];

function sumarDias(fechaISO, dias) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const fecha = new Date(Date.UTC(y, m - 1, d));
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

function diffDias(fechaA, fechaB) {
  const [ay, am, ad] = fechaA.split("-").map(Number);
  const [by, bm, bd] = fechaB.split("-").map(Number);
  const a = Date.UTC(ay, am - 1, ad);
  const b = Date.UTC(by, bm - 1, bd);
  return Math.round((b - a) / 86400000);
}

function labelFor(i, n) {
  if (i === 0) return "MD+1";
  if (i === n - 1) return "MD";
  return "MD-" + (n - 1 - i);
}

function phaseFor(label) {
  if (label === "MD+1") return "RECOVERY";
  if (label === "MD") return "MATCH";
  if (label === "MD-2") return "PRE2";
  if (label === "MD-1") return "PRE1";
  return "LOAD";
}

// Construye los días de un microciclo entre dos fechas de partido (sin guardar nada en la base).
export function construirDias(fechaAnterior, fechaProxima) {
  const n = diffDias(fechaAnterior, fechaProxima);
  const inicio = sumarDias(fechaAnterior, 1);
  const dias = [];

  for (let i = 0; i < n; i++) {
    const etiqueta = labelFor(i, n);
    const fase = phaseFor(etiqueta);
    const celdas = JSON.parse(JSON.stringify(TEMPLATES[fase]));

    // Microciclo corto: se reduce la carga física y se adelanta el trabajo de rival/emocional
    if (n <= 4 && fase === "LOAD") {
      celdas.fisico = { nivel: 2, resumen: "Fuerza acotada", detalle: celdas.fisico.detalle };
      celdas.tactica = { nivel: 3, resumen: "Rival desde ya", detalle: celdas.tactica.detalle };
      celdas.video = { nivel: 3, resumen: "Rival en detalle", detalle: celdas.video.detalle };
    }
    if (n <= 4 && fase === "RECOVERY") {
      celdas.tactica = { nivel: 2, resumen: "Primer video rival", detalle: celdas.tactica.detalle };
    }
    if (n <= 3 && (fase === "PRE2" || fase === "LOAD")) {
      celdas.fisico = { nivel: 1, resumen: "Mínimo, sin riesgo", detalle: celdas.fisico.detalle };
    }

    Object.keys(celdas).forEach((key) => {
      celdas[key] = {
        ...celdas[key],
        jugadores: null,
        dividido: false,
        grupos: [],
        imagenes: [],
        linkPractica: "",
        linkVideo: "",
      };
    });

    dias.push({ fecha: sumarDias(inicio, i), etiqueta, celdas });
  }

  return dias;
}

export function notaMicrociclo(n) {
  if (n <= 3) return "Microciclo muy corto: la carga física se reduce al mínimo para llegar fresco. Táctica y aspecto emocional pasan a ser prioridad desde el día después del partido.";
  if (n === 4) return "Microciclo corto: un solo día de carga física relevante. El trabajo de rival y la parte emocional se adelantan.";
  if (n <= 7) return "Semana estándar: día de carga física alta, desarrollo táctico progresivo y picos emocionales cerca del partido.";
  return "Ciclo largo (fecha FIFA o similar): más margen para desarrollo físico y análisis en profundidad antes de entrar en semana de partido.";
}
