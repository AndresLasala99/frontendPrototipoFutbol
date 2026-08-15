import apiClient from "./client";

export const subirImagen = (file, carpeta = "microciclo-futbol") => {
  const formData = new FormData();
  formData.append("imagen", file);
  formData.append("carpeta", carpeta);
  return apiClient
    .post("/uploads", formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
};
