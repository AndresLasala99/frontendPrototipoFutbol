import Microciclo from "../model/microciclo.model.js";
import Partido from "../model/partido.model.js";
import { construirDias, FILAS_DEFAULT, notaMicrociclo } from "../utils/microciclo.util.js";

// Devuelve los microciclos posibles: uno por cada dos partidos consecutivos marcados en el calendario.
export const calcularGaps = async () => {
  const partidos = await Partido.find().sort({ fecha: 1 });
  const fechas = partidos.map((p) => p.fecha);
  const gaps = [];
  for (let i = 0; i < fechas.length - 1; i++) {
    const fechaDesde = fechas[i];
    const fechaHasta = fechas[i + 1];
    const dias = construirDias(fechaDesde, fechaHasta).length;
    if (dias === 0) continue; // partidos en días consecutivos, no hay microciclo que armar
    gaps.push({ fechaDesde, fechaHasta, dias, nota: notaMicrociclo(dias) });
  }
  return gaps;
};

const mapACeldasPlano = (dia) => ({
  fecha: dia.fecha,
  etiqueta: dia.etiqueta,
  celdas: dia.celdas instanceof Map ? Object.fromEntries(dia.celdas) : dia.celdas,
});

const microcicloAPlano = (doc) => ({
  fechaDesde: doc.fechaDesde,
  fechaHasta: doc.fechaHasta,
  filas: doc.filas,
  dias: doc.dias.map(mapACeldasPlano),
});

// Devuelve el microciclo si ya existe guardado; si no, devuelve uno generado
// por defecto (sin guardarlo todavía) para que se pueda ver antes de editar nada.
export const obtenerMicrociclo = async (fechaDesde, fechaHasta) => {
  const existente = await Microciclo.findOne({ fechaDesde, fechaHasta });
  if (existente) {
    return { ...microcicloAPlano(existente), existente: true };
  }
  const dias = construirDias(fechaDesde, fechaHasta);
  return { fechaDesde, fechaHasta, filas: FILAS_DEFAULT, dias, existente: false };
};

// Trae el documento real de la base, creándolo primero desde la plantilla si hace falta.
async function obtenerOCrearDocumento(fechaDesde, fechaHasta) {
  let doc = await Microciclo.findOne({ fechaDesde, fechaHasta });
  if (!doc) {
    const dias = construirDias(fechaDesde, fechaHasta);
    doc = await Microciclo.create({ fechaDesde, fechaHasta, filas: FILAS_DEFAULT, dias });
  }
  return doc;
}

export const restablecerSugerido = async (fechaDesde, fechaHasta) => {
  const dias = construirDias(fechaDesde, fechaHasta);
  const doc = await Microciclo.findOneAndUpdate(
    { fechaDesde, fechaHasta },
    { dias, filas: FILAS_DEFAULT },
    { upsert: true, new: true }
  );
  return microcicloAPlano(doc);
};

export const actualizarCelda = async (fechaDesde, fechaHasta, fechaDia, filaKey, datosParciales) => {
  const doc = await obtenerOCrearDocumento(fechaDesde, fechaHasta);
  const dia = doc.dias.find((d) => d.fecha === fechaDia);
  if (!dia) {
    const error = new Error("Ese día no pertenece a este microciclo");
    error.status = 404;
    throw error;
  }
  const actual = dia.celdas.get(filaKey) || {};
  const actualPlano = actual.toObject ? actual.toObject() : actual;
  dia.celdas.set(filaKey, { ...actualPlano, ...datosParciales });
  doc.markModified("dias");
  await doc.save();
  return microcicloAPlano(doc);
};

export const agregarFila = async (fechaDesde, fechaHasta, fila) => {
  const doc = await obtenerOCrearDocumento(fechaDesde, fechaHasta);
  if (doc.filas.some((f) => f.key === fila.key)) {
    const error = new Error("Ya existe una fila con esa clave");
    error.status = 409;
    throw error;
  }
  doc.filas.push(fila);
  doc.dias.forEach((dia) => {
    dia.celdas.set(fila.key, {
      nivel: 1,
      resumen: "",
      detalle: "",
      jugadores: null,
      dividido: false,
      grupos: [],
      imagenes: [],
      linkPractica: "",
      linkVideo: "",
    });
  });
  doc.markModified("dias");
  await doc.save();
  return microcicloAPlano(doc);
};

export const eliminarFila = async (fechaDesde, fechaHasta, key) => {
  const doc = await obtenerOCrearDocumento(fechaDesde, fechaHasta);
  doc.filas = doc.filas.filter((f) => f.key !== key);
  doc.dias.forEach((dia) => dia.celdas.delete(key));
  doc.markModified("dias");
  await doc.save();
  return microcicloAPlano(doc);
};

export const editarEtiquetaDia = async (fechaDesde, fechaHasta, fechaDia, etiqueta) => {
  const doc = await obtenerOCrearDocumento(fechaDesde, fechaHasta);
  const dia = doc.dias.find((d) => d.fecha === fechaDia);
  if (!dia) {
    const error = new Error("Ese día no pertenece a este microciclo");
    error.status = 404;
    throw error;
  }
  dia.etiqueta = etiqueta;
  await doc.save();
  return microcicloAPlano(doc);
};
