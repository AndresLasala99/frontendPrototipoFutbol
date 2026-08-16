import * as campeonatosService from "../services/campeonatos.services.js";

export const listar = async (req, res, next) => {
  try {
    res.json(await campeonatosService.listarCampeonatos());
  } catch (error) {
    next(error);
  }
};

export const crear = async (req, res, next) => {
  try {
    res.status(201).json(await campeonatosService.crearCampeonato(req.body));
  } catch (error) {
    next(error);
  }
};

export const renombrar = async (req, res, next) => {
  try {
    res.json(await campeonatosService.renombrarCampeonato(req.params.id, req.body.nombre));
  } catch (error) {
    next(error);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    await campeonatosService.eliminarCampeonato(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
