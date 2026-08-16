import Joi from "joi";

export const campeonatoSchema = Joi.object({
  nombre: Joi.string().min(2).max(80).required(),
});

export const renombrarCampeonatoSchema = Joi.object({
  nombre: Joi.string().min(2).max(80).required(),
});
