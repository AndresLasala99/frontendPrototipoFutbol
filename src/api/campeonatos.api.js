import apiClient from "./client";

export const listarCampeonatos = () => apiClient.get("/campeonatos").then((r) => r.data);

export const crearCampeonato = (nombre) => apiClient.post("/campeonatos", { nombre }).then((r) => r.data);

export const renombrarCampeonato = (id, nombre) =>
  apiClient.patch(`/campeonatos/${id}`, { nombre }).then((r) => r.data);

export const eliminarCampeonato = (id) => apiClient.delete(`/campeonatos/${id}`).then((r) => r.data);
