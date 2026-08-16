import mongoose from "mongoose";

const minutoJugadorSchema = new mongoose.Schema(
  {
    jugador: { type: mongoose.Schema.Types.ObjectId, ref: "Jugador", required: true },
    minutos: { type: Number, default: 0 },
    motivo: { type: String, default: "" }, // "No ingresó" si minutos = 0
  },
  { _id: false }
);

const partidoSchema = new mongoose.Schema(
  {
    fecha: { type: String, required: true, unique: true }, // 'YYYY-MM-DD'
    campeonato: { type: mongoose.Schema.Types.ObjectId, ref: "Campeonato" },
    rival: { type: String, default: "" },
    golesPropio: { type: Number },
    golesRival: { type: Number },
    citados: [{ type: mongoose.Schema.Types.ObjectId, ref: "Jugador" }],
    minutosJugados: [minutoJugadorSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Partido", partidoSchema);
