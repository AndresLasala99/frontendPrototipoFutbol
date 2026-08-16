import * as sentidoService from "../services/sentido.services.js";

export const listarPorFecha = async (req, res, next) => {
  try {
    res.json(await sentidoService.listarPorFecha(req.params.fecha));
  } catch (error) {
    next(error);
  }
};

export const marcar = async (req, res, next) => {
  try {
    res.status(201).json(await sentidoService.marcar(req.body));
  } catch (error) {
    next(error);
  }
};

export const quitar = async (req, res, next) => {
  try {
    await sentidoService.quitar(req.params.fecha, req.params.jugadorId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
