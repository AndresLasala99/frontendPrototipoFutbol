import mongoose from "mongoose";

const campeonatoSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, unique: true, trim: true },
    color: { type: String, default: "" }, // se puede calcular en frontend por orden, o guardar acá
  },
  { timestamps: true }
);

export default mongoose.model("Campeonato", campeonatoSchema);
