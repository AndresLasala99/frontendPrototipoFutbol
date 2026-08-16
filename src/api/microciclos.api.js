import apiClient from "./client";

export const listarGaps = () => apiClient.get("/microciclos/gaps").then((r) => r.data);

export const obtenerMicrociclo = (fechaDesde, fechaHasta) =>
  apiClient.get(`/microciclos/${fechaDesde}/${fechaHasta}`).then((r) => r.data);

export const restablecerSugerido = (fechaDesde, fechaHasta) =>
  apiClient.post(`/microciclos/${fechaDesde}/${fechaHasta}/restablecer`).then((r) => r.data);

export const actualizarCelda = (fechaDesde, fechaHasta, fecha, filaKey, datos) =>
  apiClient
    .patch(`/microciclos/${fechaDesde}/${fechaHasta}/celda`, { fecha, filaKey, datos })
    .then((r) => r.data);

export const editarEtiquetaDia = (fechaDesde, fechaHasta, fecha, etiqueta) =>
  apiClient
    .patch(`/microciclos/${fechaDesde}/${fechaHasta}/etiqueta`, { fecha, etiqueta })
    .then((r) => r.data);

export const agregarFila = (fechaDesde, fechaHasta, fila) =>
  apiClient.post(`/microciclos/${fechaDesde}/${fechaHasta}/filas`, fila).then((r) => r.data);

export const eliminarFila = (fechaDesde, fechaHasta, key) =>
  apiClient.delete(`/microciclos/${fechaDesde}/${fechaHasta}/filas/${key}`).then((r) => r.data);
