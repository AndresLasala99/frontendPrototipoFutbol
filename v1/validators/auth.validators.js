import Joi from "joi";

// Mientras el resto de los roles está en stand by, cualquiera que se registre
// queda como "dt" — no se acepta otro valor aunque se lo manden desde afuera.
export const registroSchema = Joi.object({
  nombre: Joi.string().min(2).max(80).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required(),
  rol: Joi.string().valid("dt").default("dt"),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
