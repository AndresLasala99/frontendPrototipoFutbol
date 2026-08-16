import Campeonato from "../model/campeonato.model.js";
import Jugador from "../model/jugador.model.js";

const noEncontrado = () => {
  const error = new Error("Campeonato no encontrado");
  error.status = 404;
  return error;
};

export const listarCampeonatos = async () => {
  return Campeonato.find().sort({ createdAt: 1 });
};

export const crearCampeonato = async ({ nombre }) => {
  const existente = await Campeonato.findOne({ nombre });
  if (existente) return existente;
  return Campeonato.create({ nombre });
};

export const renombrarCampeonato = async (id, nuevoNombre) => {
  const campeonato = await Campeonato.findById(id);
  if (!campeonato) throw noEncontrado();
  const nombreAnterior = campeonato.nombre;
  campeonato.nombre = nuevoNombre;
  await campeonato.save();

  // Actualiza el nombre del campeonato dentro de las estadísticas ya cargadas de cada jugador
  await Jugador.updateMany(
    { "estadisticas.campeonato": nombreAnterior },
    { $set: { "estadisticas.$.campeonato": nuevoNombre } }
  );

  return campeonato;
};

export const eliminarCampeonato = async (id) => {
  const campeonato = await Campeonato.findByIdAndDelete(id);
  if (!campeonato) throw noEncontrado();
  return campeonato;
};
