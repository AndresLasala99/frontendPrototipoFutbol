import Joi from "joi";

export const crearJugadorSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  posicion: Joi.string().allow("").max(60),
  altura: Joi.number().min(100).max(230),
  peso: Joi.number().min(30).max(150),
  fotoUrl: Joi.string().uri().allow(""),
  notas: Joi.string().allow("").max(2000),
});

export const editarJugadorSchema = Joi.object({
  nombre: Joi.string().min(2).max(100),
  posicion: Joi.string().allow("").max(60),
  altura: Joi.number().min(100).max(230),
  peso: Joi.number().min(30).max(150),
  fotoUrl: Joi.string().uri().allow(""),
  notas: Joi.string().allow("").max(2000),
  activo: Joi.boolean(),
});

export const lesionSchema = Joi.object({
  texto: Joi.string().allow("").max(300),
  desde: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  hasta: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
});

export const cargaControladaSchema = Joi.object({
  motivo: Joi.string().allow("").max(300),
  desde: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  hasta: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
});
