import mongoose from "mongoose";

const grupoSchema = new mongoose.Schema(
  {
    etiqueta: { type: String, default: "" },
    resumen: { type: String, default: "" },
    detalle: { type: String, default: "" },
    jugadores: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Jugador",
      default: null, // null = automático (todos menos lesionados)
    },
  },
  { _id: false }
);

const celdaSchema = new mongoose.Schema(
  {
    nivel: { type: Number, enum: [1, 2, 3], default: 1 }, // 1 baja, 2 media, 3 alta
    resumen: { type: String, default: "" },
    detalle: { type: String, default: "" },
    jugadores: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Jugador",
      default: null,
    },
    dividido: { type: Boolean, default: false },
    grupos: [grupoSchema],
    // extras específicos de cada categoría (se usan según corresponda)
    imagenes: [{ type: String }], // ej. ejercicios de táctica, se suben a Cloudinary
    linkPractica: { type: String, default: "" },
    linkVideo: { type: String, default: "" },
  },
  { _id: false }
);

const diaSchema = new mongoose.Schema(
  {
    fecha: { type: String, required: true }, // 'YYYY-MM-DD'
    etiqueta: { type: String, required: true }, // 'MD+1', 'MD-2', ..., 'MD' (editable)
    celdas: {
      type: Map,
      of: celdaSchema,
      default: {},
    },
  },
  { _id: false }
);

const filaSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
  },
  { _id: false }
);

const microcicloSchema = new mongoose.Schema(
  {
    fechaDesde: { type: String, required: true }, // fecha del partido anterior
    fechaHasta: { type: String, required: true }, // fecha del próximo partido
    filas: {
      type: [filaSchema],
      default: [
        { key: "fisico", label: "Físico" },
        { key: "tactica", label: "Táctica" },
        { key: "video", label: "Video" },
        { key: "emocional", label: "Emocional" },
      ],
    },
    dias: [diaSchema],
  },
  { timestamps: true }
);

microcicloSchema.index({ fechaDesde: 1, fechaHasta: 1 }, { unique: true });

export default mongoose.model("Microciclo", microcicloSchema);
