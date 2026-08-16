import Joi from "joi";

export const guardarValoresGpsSchema = Joi.object({
  valores: Joi.object().pattern(Joi.string(), Joi.number()).required(),
});

export const metricaSchema = Joi.object({
  metrica: Joi.string().min(1).max(80).required(),
});
