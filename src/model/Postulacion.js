import mongoose from "mongoose";

const postulacionSchema = new mongoose.Schema({
  empresaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Empresa",
    required: true
  },
  empresa: {
  type: String
},
logo: {
  type: String,
  required: false
},
  titulo: {
    type: String,
    required: true,
    trim: true
  },
  descripcion: {
    type: String,
    required: true,
    trim: true
  },
  requisitos: {
    type: [String],
    required: true
  },
  lugar: {
    provincia: { type: String, required: true },
    localidad: { type: String, required: true }
  },
  modalidad: {
    type: String,
    enum: ["Hibrido", "Remoto", "Presencial"],
    required: true
  },
  estado: {
    type: String,
    enum: ["Activa", "Pausada", "Cerrada"],
    default: "Activa"
  }
}, { timestamps: true });

const Postulacion = mongoose.model("Postulacion", postulacionSchema);
export default Postulacion;
