import Joi from "joi";

export const salioSentidoSchema = Joi.object({
  fecha: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required(),
  jugador: Joi.string().required(),
  motivo: Joi.string().allow("").max(300),
});
