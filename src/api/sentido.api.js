import apiClient from "./client";

export const listarPorFecha = (fecha) => apiClient.get(`/sentido/${fecha}`).then((r) => r.data);

export const marcar = (fecha, jugador, motivo) =>
  apiClient.post("/sentido", { fecha, jugador, motivo }).then((r) => r.data);

export const quitar = (fecha, jugadorId) => apiClient.delete(`/sentido/${fecha}/${jugadorId}`).then((r) => r.data);
