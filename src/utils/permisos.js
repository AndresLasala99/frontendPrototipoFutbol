export function puedeAdministrar(usuario) {
  return !!usuario && (usuario.rol === "admin" || usuario.rol === "dt");
}
