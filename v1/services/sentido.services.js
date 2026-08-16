import SalioSentido from "../model/salioSentido.model.js";

export const listarPorFecha = async (fecha) => {
  return SalioSentido.find({ fecha }).populate("jugador", "nombre");
};

export const marcar = async ({ fecha, jugador, motivo }) => {
  return SalioSentido.findOneAndUpdate(
    { fecha, jugador },
    { motivo: motivo || "" },
    { upsert: true, new: true }
  );
};

export const quitar = async (fecha, jugadorId) => {
  await SalioSentido.findOneAndDelete({ fecha, jugador: jugadorId });
};
