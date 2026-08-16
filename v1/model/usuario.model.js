import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    rol: {
      type: String,
      enum: ["admin", "dt", "preparador_fisico", "medico", "nutricionista", "colaborador"],
      default: "colaborador",
    },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Usuario", usuarioSchema);
