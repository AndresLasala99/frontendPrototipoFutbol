import mongoose from "mongoose";

const salioSentidoSchema = new mongoose.Schema(
  {
    fecha: { type: String, required: true }, // 'YYYY-MM-DD'
    jugador: { type: mongoose.Schema.Types.ObjectId, ref: "Jugador", required: true },
    motivo: { type: String, default: "" },
  },
  { timestamps: true }
);

salioSentidoSchema.index({ fecha: 1, jugador: 1 }, { unique: true });

export default mongoose.model("SalioSentido", salioSentidoSchema);
