import apiClient from "./client";

export const obtenerMetrica = () => apiClient.get("/gps/metrica").then((r) => r.data.metrica);

export const guardarMetrica = (metrica) => apiClient.patch("/gps/metrica", { metrica }).then((r) => r.data);

export const obtenerRegistro = (fecha) => apiClient.get(`/gps/${fecha}`).then((r) => r.data);

export const guardarValores = (fecha, valores) =>
  apiClient.patch(`/gps/${fecha}`, { valores }).then((r) => r.data);

export const acumulado = (desde, hasta) =>
  apiClient.get("/gps/acumulado", { params: { desde, hasta } }).then((r) => r.data);

export const historialJugador = (jugadorId) => apiClient.get(`/gps/jugador/${jugadorId}`).then((r) => r.data);

export const extraerDesdeImagen = (file) => {
  const formData = new FormData();
  formData.append("imagen", file);
  return apiClient
    .post("/gps/extraer-imagen", formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
};
