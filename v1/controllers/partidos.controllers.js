import * as partidosService from "../services/partidos.services.js";

export const listar = async (req, res, next) => {
  try {
    res.json(await partidosService.listarPartidos());
  } catch (error) {
    next(error);
  }
};

export const obtener = async (req, res, next) => {
  try {
    res.json(await partidosService.obtenerPorFecha(req.params.fecha));
  } catch (error) {
    next(error);
  }
};

export const crear = async (req, res, next) => {
  try {
    res.status(201).json(await partidosService.crearPartido(req.body));
  } catch (error) {
    next(error);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    await partidosService.eliminarPartido(req.params.fecha);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const editar = async (req, res, next) => {
  try {
    res.json(await partidosService.editarPartido(req.params.fecha, req.body));
  } catch (error) {
    next(error);
  }
};

export const setCitados = async (req, res, next) => {
  try {
    res.json(await partidosService.setCitados(req.params.fecha, req.body.citados));
  } catch (error) {
    next(error);
  }
};

export const setMinutos = async (req, res, next) => {
  try {
    res.json(await partidosService.setMinutos(req.params.fecha, req.body.minutos));
  } catch (error) {
    next(error);
  }
};
