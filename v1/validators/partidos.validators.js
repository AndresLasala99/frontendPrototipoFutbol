import Joi from "joi";

export const crearPartidoSchema = Joi.object({
  fecha: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  campeonato: Joi.string().allow(null, ""),
});

export const editarPartidoSchema = Joi.object({
  campeonato: Joi.string().allow(null, ""),
  rival: Joi.string().allow("").max(120),
  golesPropio: Joi.number().min(0).allow(null),
  golesRival: Joi.number().min(0).allow(null),
});

export const citadosSchema = Joi.object({
  citados: Joi.array().items(Joi.string()).required(),
});

export const minutosSchema = Joi.object({
  minutos: Joi.object()
    .pattern(
      Joi.string(),
      Joi.number().min(0).max(130)
    )
    .required(),
});
