import mongoose from "mongoose";

const lesionSchema = new mongoose.Schema(
  {
    texto: { type: String, default: "" },
    desde: { type: String, required: true }, // fecha ISO 'YYYY-MM-DD'
    hasta: { type: String, required: true },
  },
  { _id: true, timestamps: true }
);

const cargaControladaSchema = new mongoose.Schema(
  {
    motivo: { type: String, default: "" },
    desde: { type: String, required: true },
    hasta: { type: String, required: true },
    automatica: { type: Boolean, default: false },
    fechaPartido: { type: String }, // fecha del partido que generó la carga controlada automática
  },
  { _id: true, timestamps: true }
);

const partidoJugadoSchema = new mongoose.Schema(
  {
    fecha: { type: String, required: true },
    rival: { type: String, default: "" },
    minutos: { type: Number, default: 0 },
    motivo: { type: String, default: "" }, // "No ingresó", etc. cuando minutos = 0
  },
  { _id: false }
);

const estadisticaCampeonatoSchema = new mongoose.Schema(
  {
    campeonato: { type: String, required: true },
    partidos: [partidoJugadoSchema],
  },
  { _id: false }
);

const jugadorSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    posicion: { type: String, default: "" },
    altura: { type: Number },
    peso: { type: Number },
    fotoUrl: { type: String, default: "" },
    notas: { type: String, default: "" },
    lesiones: [lesionSchema],
    cargasControladas: [cargaControladaSchema],
    estadisticas: [estadisticaCampeonatoSchema],
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Jugador", jugadorSchema);
