import { subirImagen } from "../utils/cloudinary.util.js";

export const subir = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ningún archivo" });
    }
    const carpeta = req.body.carpeta || "microciclo-futbol";
    const resultado = await subirImagen(req.file.buffer, carpeta);
    res.status(201).json({ url: resultado.secure_url });
  } catch (error) {
    next(error);
  }
};
