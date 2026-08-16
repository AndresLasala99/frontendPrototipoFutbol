import apiClient from "./client";

export const login = (credenciales) => apiClient.post("/auth/login", credenciales).then((r) => r.data);

export const registro = (datos) => apiClient.post("/auth/registro", datos).then((r) => r.data);
