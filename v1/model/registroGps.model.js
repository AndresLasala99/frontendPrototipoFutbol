import mongoose from "mongoose";

const registroGpsSchema = new mongoose.Schema(
  {
    fecha: { type: String, required: true, unique: true }, // 'YYYY-MM-DD'
    metrica: { type: String, default: "Distancia total (m)" },
    valores: {
      type: Map,
      of: Number, // jugadorId (string) -> valor
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.model("RegistroGps", registroGpsSchema);
