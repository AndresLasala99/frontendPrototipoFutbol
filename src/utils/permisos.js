export function puedeAdministrar(usuario) {
  return !!usuario && (usuario.rol === "admin" || usuario.rol === "dt");
}

// Un colaborador solo puede mirar: cualquier otro rol puede crear/editar.
export function puedeEditar(usuario) {
  return !!usuario && usuario.rol !== "colaborador";
}
