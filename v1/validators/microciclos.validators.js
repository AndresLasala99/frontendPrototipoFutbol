import Joi from "joi";

const fechaPattern = /^\d{4}-\d{2}-\d{2}$/;

export const celdaSchema = Joi.object({
  nivel: Joi.number().valid(1, 2, 3),
  resumen: Joi.string().allow(""),
  detalle: Joi.string().allow(""),
  jugadores: Joi.array().items(Joi.string()).allow(null),
  dividido: Joi.boolean(),
  grupos: Joi.array().items(
    Joi.object({
      etiqueta: Joi.string().allow(""),
      resumen: Joi.string().allow(""),
      detalle: Joi.string().allow(""),
      jugadores: Joi.array().items(Joi.string()).allow(null),
    })
  ),
  imagenes: Joi.array().items(Joi.string()),
  linkPractica: Joi.string().allow(""),
  linkVideo: Joi.string().allow(""),
}).min(1);

export const filaSchema = Joi.object({
  key: Joi.string().required(),
  label: Joi.string().required(),
});

export const fechasParams = Joi.object({
  fechaDesde: Joi.string().pattern(fechaPattern).required(),
  fechaHasta: Joi.string().pattern(fechaPattern).required(),
});
