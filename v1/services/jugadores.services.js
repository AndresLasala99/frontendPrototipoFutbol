import Jugador from "../model/jugador.model.js";
import Partido from "../model/partido.model.js";
import RegistroGps from "../model/registroGps.model.js";
import SalioSentido from "../model/salioSentido.model.js";

const noEncontrado = () => {
  const error = new Error("Jugador no encontrado");
  error.status = 404;
  return error;
};

export const listarJugadores = async () => {
  return Jugador.find({ activo: true }).sort({ nombre: 1 });
};

export const obtenerJugador = async (id) => {
  const jugador = await Jugador.findById(id);
  if (!jugador) throw noEncontrado();
  return jugador;
};

export const crearJugador = async (datos) => {
  return Jugador.create(datos);
};

export const editarJugador = async (id, datos) => {
  const jugador = await Jugador.findByIdAndUpdate(id, datos, { new: true, runValidators: true });
  if (!jugador) throw noEncontrado();
  return jugador;
};

export const eliminarJugador = async (id) => {
  const jugador = await Jugador.findById(id);
  if (!jugador) throw noEncontrado();

  await Jugador.deleteOne({ _id: id });

  // Sacarlo de los citados y de los minutos jugados de cualquier partido
  await Partido.updateMany({ citados: id }, { $pull: { citados: id } });
  await Partido.updateMany({ "minutosJugados.jugador": id }, { $pull: { minutosJugados: { jugador: id } } });

  // Sacar su valor de cualquier registro de GPS (el campo es un Map, se borra por clave)
  await RegistroGps.updateMany({ [`valores.${id}`]: { $exists: true } }, { $unset: { [`valores.${id}`]: "" } });

  // Sacar cualquier marca de "salió sentido" que tuviera
  await SalioSentido.deleteMany({ jugador: id });

  return jugador;
};

export const agregarLesion = async (id, lesion) => {
  const jugador = await Jugador.findById(id);
  if (!jugador) throw noEncontrado();
  jugador.lesiones.push(lesion);
  await jugador.save();
  return jugador;
};

export const editarLesion = async (id, lesionId, datos) => {
  const jugador = await Jugador.findById(id);
  if (!jugador) throw noEncontrado();
  const lesion = jugador.lesiones.id(lesionId);
  if (!lesion) throw noEncontrado();
  Object.assign(lesion, datos);
  await jugador.save();
  return jugador;
};

export const eliminarLesion = async (id, lesionId) => {
  const jugador = await Jugador.findById(id);
  if (!jugador) throw noEncontrado();
  jugador.lesiones.pull({ _id: lesionId });
  await jugador.save();
  return jugador;
};

export const agregarCargaControlada = async (id, carga) => {
  const jugador = await Jugador.findById(id);
  if (!jugador) throw noEncontrado();
  jugador.cargasControladas.push({ ...carga, automatica: false });
  await jugador.save();
  return jugador;
};

export const eliminarCargaControlada = async (id, cargaId) => {
  const jugador = await Jugador.findById(id);
  if (!jugador) throw noEncontrado();
  jugador.cargasControladas.pull({ _id: cargaId });
  await jugador.save();
  return jugador;
};

// Devuelve el estado de disponibilidad de un jugador para una fecha puntual:
// 'lesionado' | 'carga_controlada' | 'apto'
export const calcularDisponibilidad = (jugador, fechaISO) => {
  const lesionActiva = jugador.lesiones.find((l) => fechaISO >= l.desde && fechaISO <= l.hasta);
  if (lesionActiva) {
    return { estado: "lesionado", motivo: lesionActiva.texto || "Lesionado" };
  }
  const cargaActiva = jugador.cargasControladas.find((c) => fechaISO >= c.desde && fechaISO <= c.hasta);
  if (cargaActiva) {
    return { estado: "carga_controlada", motivo: cargaActiva.motivo || "Carga controlada" };
  }
  return { estado: "apto", motivo: "" };
};

// Genera (o actualiza) automáticamente la carga controlada de MD+1/MD+2
// para un jugador que jugó 45' o más en un partido puntual.
export const aplicarCargaControladaAutomatica = async (id, { fechaPartido, minutos, rival }) => {
  const jugador = await Jugador.findById(id);
  if (!jugador) throw noEncontrado();

  // saca cualquier carga automática previa ligada a este mismo partido
  jugador.cargasControladas = jugador.cargasControladas.filter(
    (c) => !(c.automatica && c.fechaPartido === fechaPartido)
  );

  if (minutos >= 45) {
    const desde = sumarDias(fechaPartido, 1);
    const hasta = sumarDias(fechaPartido, 2);
    const motivo = `Jugó ${minutos}'${rival ? " vs " + rival : ""}`;
    jugador.cargasControladas.push({ motivo, desde, hasta, automatica: true, fechaPartido });
  }

  await jugador.save();
  return jugador;
};

function sumarDias(fechaISO, dias) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  const fecha = new Date(Date.UTC(y, m - 1, d));
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

// Guarda (o actualiza) la entrada de un partido puntual dentro de las estadísticas
// del jugador para un campeonato dado, identificando el partido por su fecha.
export const actualizarEstadisticaPartido = async (
  jugadorId,
  { campeonatoNombre, fecha, rival, minutos, motivo }
) => {
  const jugador = await Jugador.findById(jugadorId);
  if (!jugador) throw noEncontrado();

  let estadistica = jugador.estadisticas.find((e) => e.campeonato === campeonatoNombre);
  if (!estadistica) {
    estadistica = { campeonato: campeonatoNombre, partidos: [] };
    jugador.estadisticas.push(estadistica);
    estadistica = jugador.estadisticas[jugador.estadisticas.length - 1];
  }

  let partido = estadistica.partidos.find((p) => p.fecha === fecha);
  if (!partido) {
    estadistica.partidos.push({ fecha, rival, minutos, motivo });
  } else {
    partido.rival = rival;
    partido.minutos = minutos;
    partido.motivo = motivo;
  }

  await jugador.save();
  return jugador;
};

export const eliminarEstadisticaPartido = async (jugadorId, { campeonatoNombre, fecha }) => {
  const jugador = await Jugador.findById(jugadorId);
  if (!jugador) throw noEncontrado();
  const estadistica = jugador.estadisticas.find((e) => e.campeonato === campeonatoNombre);
  if (estadistica) {
    estadistica.partidos = estadistica.partidos.filter((p) => p.fecha !== fecha);
  }
  await jugador.save();
  return jugador;
};

