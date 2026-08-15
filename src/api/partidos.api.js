import apiClient from "./client";

export const listarPartidos = () => apiClient.get("/partidos").then((r) => r.data);

export const obtenerPartido = (fecha) => apiClient.get(`/partidos/${fecha}`).then((r) => r.data);

export const crearPartido = (fecha, campeonato) =>
  apiClient.post("/partidos", { fecha, campeonato }).then((r) => r.data);

export const eliminarPartido = (fecha) => apiClient.delete(`/partidos/${fecha}`).then((r) => r.data);

export const editarPartido = (fecha, datos) => apiClient.patch(`/partidos/${fecha}`, datos).then((r) => r.data);

export const setCitados = (fecha, citados) =>
  apiClient.patch(`/partidos/${fecha}/citados`, { citados }).then((r) => r.data);

export const setMinutos = (fecha, minutos) =>
  apiClient.patch(`/partidos/${fecha}/minutos`, { minutos }).then((r) => r.data);
