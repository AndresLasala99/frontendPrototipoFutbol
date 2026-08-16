import * as jugadoresService from "../services/jugadores.services.js";

export const listar = async (req, res, next) => {
  try {
    const jugadores = await jugadoresService.listarJugadores();
    res.json(jugadores);
  } catch (error) {
    next(error);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const jugador = await jugadoresService.obtenerJugador(req.params.id);
    res.json(jugador);
  } catch (error) {
    next(error);
  }
};

export const crear = async (req, res, next) => {
  try {
    const jugador = await jugadoresService.crearJugador(req.body);
    res.status(201).json(jugador);
  } catch (error) {
    next(error);
  }
};

export const editar = async (req, res, next) => {
  try {
    const jugador = await jugadoresService.editarJugador(req.params.id, req.body);
    res.json(jugador);
  } catch (error) {
    next(error);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    await jugadoresService.eliminarJugador(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const agregarLesion = async (req, res, next) => {
  try {
    const jugador = await jugadoresService.agregarLesion(req.params.id, req.body);
    res.status(201).json(jugador);
  } catch (error) {
    next(error);
  }
};

export const editarLesion = async (req, res, next) => {
  try {
    const jugador = await jugadoresService.editarLesion(req.params.id, req.params.lesionId, req.body);
    res.json(jugador);
  } catch (error) {
    next(error);
  }
};

export const eliminarLesion = async (req, res, next) => {
  try {
    const jugador = await jugadoresService.eliminarLesion(req.params.id, req.params.lesionId);
    res.json(jugador);
  } catch (error) {
    next(error);
  }
};

export const agregarCargaControlada = async (req, res, next) => {
  try {
    const jugador = await jugadoresService.agregarCargaControlada(req.params.id, req.body);
    res.status(201).json(jugador);
  } catch (error) {
    next(error);
  }
};

export const eliminarCargaControlada = async (req, res, next) => {
  try {
    const jugador = await jugadoresService.eliminarCargaControlada(req.params.id, req.params.cargaId);
    res.json(jugador);
  } catch (error) {
    next(error);
  }
};

export const disponibilidad = async (req, res, next) => {
  try {
    const jugador = await jugadoresService.obtenerJugador(req.params.id);
    const fecha = req.query.fecha;
    if (!fecha) {
      return res.status(400).json({ error: "Falta el parámetro 'fecha' (YYYY-MM-DD)" });
    }
    const estado = jugadoresService.calcularDisponibilidad(jugador, fecha);
    res.json(estado);
  } catch (error) {
    next(error);
  }
};

export const agregarEstadisticaPartido = async (req, res, next) => {
  try {
    const { campeonato, fecha, rival, minutos, motivo } = req.body;
    const jugador = await jugadoresService.actualizarEstadisticaPartido(req.params.id, {
      campeonatoNombre: campeonato,
      fecha,
      rival: rival || "",
      minutos: minutos || 0,
      motivo: motivo || (minutos > 0 ? "" : "No ingresó"),
    });
    res.status(201).json(jugador);
  } catch (error) {
    next(error);
  }
};

export const eliminarEstadisticaPartido = async (req, res, next) => {
  try {
    const { campeonato, fecha } = req.body;
    const jugador = await jugadoresService.eliminarEstadisticaPartido(req.params.id, {
      campeonatoNombre: campeonato,
      fecha,
    });
    res.json(jugador);
  } catch (error) {
    next(error);
  }
};
