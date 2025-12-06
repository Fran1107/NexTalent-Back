import mongoose from "mongoose";

const AplicacionSchema = new mongoose.Schema({
  pasanteId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  empresaId: { type: mongoose.Schema.Types.ObjectId, ref: "Empresa", required: true },
  estado: { type: String, enum: ["Pendiente", "Aceptada", "Rechazada"], required: true }
}, { timestamps: true });

export default mongoose.model("Aplicacion", AplicacionSchema);
