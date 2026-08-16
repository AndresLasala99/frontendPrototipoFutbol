import apiClient from "./client";

export const listarJugadores = () => apiClient.get("/jugadores").then((r) => r.data);

export const obtenerJugador = (id) => apiClient.get(`/jugadores/${id}`).then((r) => r.data);

export const crearJugador = (datos) => apiClient.post("/jugadores", datos).then((r) => r.data);

export const editarJugador = (id, datos) => apiClient.patch(`/jugadores/${id}`, datos).then((r) => r.data);

export const eliminarJugador = (id) => apiClient.delete(`/jugadores/${id}`).then((r) => r.data);

export const disponibilidadJugador = (id, fecha) =>
  apiClient.get(`/jugadores/${id}/disponibilidad`, { params: { fecha } }).then((r) => r.data);

export const agregarLesion = (id, lesion) =>
  apiClient.post(`/jugadores/${id}/lesiones`, lesion).then((r) => r.data);

export const editarLesion = (id, lesionId, datos) =>
  apiClient.patch(`/jugadores/${id}/lesiones/${lesionId}`, datos).then((r) => r.data);

export const eliminarLesion = (id, lesionId) =>
  apiClient.delete(`/jugadores/${id}/lesiones/${lesionId}`).then((r) => r.data);

export const agregarCargaControlada = (id, carga) =>
  apiClient.post(`/jugadores/${id}/carga-controlada`, carga).then((r) => r.data);

export const eliminarCargaControlada = (id, cargaId) =>
  apiClient.delete(`/jugadores/${id}/carga-controlada/${cargaId}`).then((r) => r.data);

export const agregarEstadisticaPartido = (id, datos) =>
  apiClient.post(`/jugadores/${id}/estadisticas`, datos).then((r) => r.data);

export const eliminarEstadisticaPartido = (id, campeonato, fecha) =>
  apiClient.delete(`/jugadores/${id}/estadisticas`, { data: { campeonato, fecha } }).then((r) => r.data);

export const subirFoto = (file) => {
  const formData = new FormData();
  formData.append("imagen", file);
  formData.append("carpeta", "jugadores");
  return apiClient
    .post("/uploads", formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
};
