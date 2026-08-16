import cloudinary from "../config/cloudinary.js";

export const subirImagen = (buffer, carpeta = "microciclo-futbol") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: carpeta, resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};
