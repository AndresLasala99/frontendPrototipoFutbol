import Partido from "../model/partido.model.js";
import Jugador from "../model/jugador.model.js";
import Campeonato from "../model/campeonato.model.js";
import * as jugadoresService from "./jugadores.services.js";

const noEncontrado = () => {
  const error = new Error("Partido no encontrado");
  error.status = 404;
  return error;
};

export const listarPartidos = async () => {
  return Partido.find().sort({ fecha: 1 }).populate("campeonato", "nombre");
};

export const obtenerPorFecha = async (fecha) => {
  const partido = await Partido.findOne({ fecha })
    .populate("campeonato", "nombre")
    .populate("citados", "nombre")
    .populate("minutosJugados.jugador", "nombre");
  if (!partido) throw noEncontrado();
  return partido;
};

export const crearPartido = async ({ fecha, campeonato }) => {
  const existente = await Partido.findOne({ fecha });
  if (existente) return existente;
  return Partido.create({ fecha, campeonato: campeonato || undefined, citados: [], minutosJugados: [] });
};

export const eliminarPartido = async (fecha) => {
  const partido = await Partido.findOneAndDelete({ fecha });
  if (!partido) throw noEncontrado();
  return partido;
};

export const editarPartido = async (fecha, datos) => {
  const partido = await Partido.findOneAndUpdate({ fecha }, datos, { new: true, runValidators: true });
  if (!partido) throw noEncontrado();
  // si cambió el rival o el campeonato, re-propaga los minutos ya cargados
  await repropagarMinutos(partido);
  return partido;
};

// Solo permite citar jugadores que no estén lesionados esa fecha.
export const setCitados = async (fecha, citadosIds) => {
  const partido = await Partido.findOne({ fecha });
  if (!partido) throw noEncontrado();

  const jugadores = await Jugador.find({ _id: { $in: citadosIds } });
  const disponibles = jugadores
    .filter((j) => jugadoresService.calcularDisponibilidad(j, fecha).estado !== "lesionado")
    .map((j) => j._id);

  partido.citados = disponibles;
  await partido.save();
  return partido.populate("citados", "nombre");
};

export const setMinutos = async (fecha, minutosPorJugador) => {
  const partido = await Partido.findOne({ fecha });
  if (!partido) throw noEncontrado();

  partido.minutosJugados = Object.entries(minutosPorJugador).map(([jugadorId, minutos]) => ({
    jugador: jugadorId,
    minutos,
    motivo: minutos > 0 ? "" : "No ingresó",
  }));
  await partido.save();

  await repropagarMinutos(partido);

  return partido.populate("minutosJugados.jugador", "nombre");
};

// Recalcula, para cada jugador citado con minutos cargados:
// 1) su estadística dentro del campeonato del partido
// 2) la carga controlada automática si jugó 45' o más
async function repropagarMinutos(partido) {
  if (!partido.minutosJugados || partido.minutosJugados.length === 0) return;

  let campeonatoNombre = null;
  if (partido.campeonato) {
    const campeonato = await Campeonato.findById(partido.campeonato);
    campeonatoNombre = campeonato ? campeonato.nombre : null;
  }

  for (const mj of partido.minutosJugados) {
    if (campeonatoNombre) {
      await jugadoresService.actualizarEstadisticaPartido(mj.jugador, {
        campeonatoNombre,
        fecha: partido.fecha,
        rival: partido.rival || "",
        minutos: mj.minutos,
        motivo: mj.motivo,
      });
    }
    await jugadoresService.aplicarCargaControladaAutomatica(mj.jugador, {
      fechaPartido: partido.fecha,
      minutos: mj.minutos,
      rival: partido.rival || "",
    });
  }
}
