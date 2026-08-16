const METODOS_ESCRITURA = ["POST", "PATCH", "PUT", "DELETE"];

// Un colaborador puede ver todo, pero no puede crear, editar ni eliminar nada.
export const bloquearColaboradorEscritura = (req, res, next) => {
  if (METODOS_ESCRITURA.includes(req.method) && req.usuario?.rol === "colaborador") {
    return res.status(403).json({ error: "Tu rol (colaborador) solo tiene permiso de lectura." });
  }
  next();
};
