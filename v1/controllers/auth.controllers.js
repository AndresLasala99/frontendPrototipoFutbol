import { registrarUsuario, loginUsuario } from "../services/auth.services.js";

export const registro = async (req, res, next) => {
  try {
    const resultado = await registrarUsuario(req.body);
    res.status(201).json(resultado);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const resultado = await loginUsuario(req.body);
    res.status(200).json(resultado);
  } catch (error) {
    next(error);
  }
};
