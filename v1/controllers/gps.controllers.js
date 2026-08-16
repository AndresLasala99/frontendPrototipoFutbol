import * as gpsService from "../services/gps.services.js";

export const obtenerMetrica = async (req, res, next) => {
  try {
    res.json({ metrica: await gpsService.obtenerMetrica() });
  } catch (error) {
    next(error);
  }
};

export const guardarMetrica = async (req, res, next) => {
  try {
    res.json({ metrica: await gpsService.guardarMetrica(req.body.metrica) });
  } catch (error) {
    next(error);
  }
};

export const obtenerRegistro = async (req, res, next) => {
  try {
    res.json(await gpsService.obtenerRegistro(req.params.fecha));
  } catch (error) {
    next(error);
  }
};

export const guardarValores = async (req, res, next) => {
  try {
    res.json(await gpsService.guardarValores(req.params.fecha, req.body.valores));
  } catch (error) {
    next(error);
  }
};

export const acumulado = async (req, res, next) => {
  try {
    const { desde, hasta } = req.query;
    if (!desde || !hasta) {
      return res.status(400).json({ error: "Faltan los parámetros 'desde' y 'hasta'" });
    }
    res.json(await gpsService.acumuladoEntreFechas(desde, hasta));
  } catch (error) {
    next(error);
  }
};

export const extraerDesdeImagen = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ninguna imagen" });
    }
    const resultado = await gpsService.extraerDesdeImagen(req.file.buffer, req.file.mimetype);
    res.json(resultado);
  } catch (error) {
    next(error);
  }
};

export const historialJugador = async (req, res, next) => {
  try {
    res.json(await gpsService.historialJugador(req.params.jugadorId));
  } catch (error) {
    next(error);
  }
};
