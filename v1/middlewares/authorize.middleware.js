// Uso: authorize("admin", "dt") -> solo esos roles pueden pasar
export const authorize = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: "No autenticado" });
    }
    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ error: "No tenés permiso para hacer esta acción" });
    }
    next();
  };
};
