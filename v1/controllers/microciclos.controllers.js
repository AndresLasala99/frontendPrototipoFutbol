import * as microciclosService from "../services/microciclos.services.js";

export const listarGaps = async (req, res, next) => {
  try {
    res.json(await microciclosService.calcularGaps());
  } catch (error) {
    next(error);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const { fechaDesde, fechaHasta } = req.params;
    res.json(await microciclosService.obtenerMicrociclo(fechaDesde, fechaHasta));
  } catch (error) {
    next(error);
  }
};

export const restablecerSugerido = async (req, res, next) => {
  try {
    const { fechaDesde, fechaHasta } = req.params;
    res.json(await microciclosService.restablecerSugerido(fechaDesde, fechaHasta));
  } catch (error) {
    next(error);
  }
};

export const actualizarCelda = async (req, res, next) => {
  try {
    const { fechaDesde, fechaHasta } = req.params;
    const { fecha, filaKey, datos } = req.body;
    res.json(await microciclosService.actualizarCelda(fechaDesde, fechaHasta, fecha, filaKey, datos));
  } catch (error) {
    next(error);
  }
};

export const editarEtiquetaDia = async (req, res, next) => {
  try {
    const { fechaDesde, fechaHasta } = req.params;
    const { fecha, etiqueta } = req.body;
    res.json(await microciclosService.editarEtiquetaDia(fechaDesde, fechaHasta, fecha, etiqueta));
  } catch (error) {
    next(error);
  }
};

export const agregarFila = async (req, res, next) => {
  try {
    const { fechaDesde, fechaHasta } = req.params;
    res.status(201).json(await microciclosService.agregarFila(fechaDesde, fechaHasta, req.body));
  } catch (error) {
    next(error);
  }
};

export const eliminarFila = async (req, res, next) => {
  try {
    const { fechaDesde, fechaHasta, key } = req.params;
    res.json(await microciclosService.eliminarFila(fechaDesde, fechaHasta, key));
  } catch (error) {
    next(error);
  }
};
