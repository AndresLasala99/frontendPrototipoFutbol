import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Usuario from "../model/usuario.model.js";

const generarToken = (usuario) => {
  return jwt.sign(
    { id: usuario._id, rol: usuario.rol, nombre: usuario.nombre },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

export const registrarUsuario = async ({ nombre, email, password, rol }) => {
  const existente = await Usuario.findOne({ email });
  if (existente) {
    const error = new Error("Ya existe un usuario con ese email");
    error.status = 409;
    throw error;
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const usuario = await Usuario.create({ nombre, email, password: passwordHash, rol });
  const token = generarToken(usuario);
  return { usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }, token };
};

export const loginUsuario = async ({ email, password }) => {
  const usuario = await Usuario.findOne({ email }).select("+password");
  if (!usuario) {
    const error = new Error("Email o contraseña incorrectos");
    error.status = 401;
    throw error;
  }
  const esValida = await bcrypt.compare(password, usuario.password);
  if (!esValida) {
    const error = new Error("Email o contraseña incorrectos");
    error.status = 401;
    throw error;
  }
  const token = generarToken(usuario);
  return { usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }, token };
};
