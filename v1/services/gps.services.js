import RegistroGps from "../model/registroGps.model.js";
import Config from "../model/config.model.js";
import Jugador from "../model/jugador.model.js";
import { extraerDatosFisicos } from "../utils/anthropic.util.js";
import Partido from "../model/partido.model.js";

const METRICA_KEY = "gps-metrica";
const METRICA_DEFAULT = "Distancia total (m)";

export const obtenerMetrica = async () => {
  const config = await Config.findOne({ key: METRICA_KEY });
  return config ? config.value : METRICA_DEFAULT;
};

export const guardarMetrica = async (metrica) => {
  await Config.findOneAndUpdate(
    { key: METRICA_KEY },
    { value: metrica },
    { upsert: true, new: true }
  );
  return metrica;
};

export const obtenerRegistro = async (fecha) => {
  const registro = await RegistroGps.findOne({ fecha });
  return registro ? Object.fromEntries(registro.valores) : {};
};

// Hace merge: solo pisa los jugadores que vienen en "valores", conserva el resto tal cual estaba.
export const guardarValores = async (fecha, valoresNuevos) => {
  const metrica = await obtenerMetrica();
  let registro = await RegistroGps.findOne({ fecha });
  if (!registro) {
    registro = new RegistroGps({ fecha, metrica, valores: new Map() });
  }
  Object.entries(valoresNuevos).forEach(([jugadorId, valor]) => {
    if (valor === null || valor === undefined || valor === "") {
      registro.valores.delete(jugadorId);
    } else {
      registro.valores.set(jugadorId, Number(valor));
    }
  });
  await registro.save();
  return Object.fromEntries(registro.valores);
};

// Devuelve el total acumulado (por jugador) entre un rango de fechas (inclusive), típicamente el rango de un microciclo.
export const acumuladoEntreFechas = async (fechaDesde, fechaHasta) => {
  const registros = await RegistroGps.find({ fecha: { $gte: fechaDesde, $lte: fechaHasta } });
  const totales = {};
  registros.forEach((r) => {
    r.valores.forEach((valor, jugadorId) => {
      totales[jugadorId] = (totales[jugadorId] || 0) + valor;
    });
  });
  return totales;
};

// Devuelve todos los registros de GPS donde participó un jugador puntual,
// distinguiendo si esa fecha era un entrenamiento o un partido.
export const historialJugador = async (jugadorId) => {
  const registros = await RegistroGps.find({ [`valores.${jugadorId}`]: { $exists: true } }).sort({ fecha: 1 });
  const fechasPartidos = new Set(await Partido.distinct("fecha"));
  return registros.map((r) => ({
    fecha: r.fecha,
    valor: r.valores.get(jugadorId),
    esPartido: fechasPartidos.has(r.fecha),
  }));
};

function normalizarNombre(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

// Lee una foto de planilla física y devuelve un borrador con cada fila emparejada
// (o no) contra el plantel, para que el usuario confirme antes de guardar nada.
export const extraerDesdeImagen = async (buffer, mediaType) => {
  const metrica = await obtenerMetrica();
  const base64 = buffer.toString("base64");
  const filas = await extraerDatosFisicos(base64, mediaType, metrica);

  const jugadores = await Jugador.find({ activo: true });

  const borrador = filas.map((fila) => {
    const nombreNorm = normalizarNombre(fila.nombre);
    let jugador = jugadores.find((j) => normalizarNombre(j.nombre) === nombreNorm);
    if (!jugador) {
      const partesFila = nombreNorm.split(/\s+/).filter((p) => p.length > 2);
      jugador = jugadores.find((j) => {
        const partesJugador = normalizarNombre(j.nombre).split(/\s+/);
        return partesFila.some((p) => partesJugador.includes(p));
      });
    }
    return {
      nombreDetectado: fila.nombre,
      valor: fila.valor,
      jugadorId: jugador ? jugador._id.toString() : null,
      jugadorNombre: jugador ? jugador.nombre : null,
    };
  });

  return { metrica, filas: borrador };
};

