import mongoose from "mongoose";

const pasantiaSchema = new mongoose.Schema({
  empresaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Empresa", // Relación: quién publicó la pasantía
    required: true,
  },
  titulo: {
    type: String,
    required: true,
    trim: true,
  },
  descripcion: {
    type: String,
    required: true,
    maxlength: 2000,
  },
  requisitos: [String], // array de strings
  modalidad: {
    type: String,
    enum: ["Remoto", "Presencial", "Híbrido"],
    default: "Presencial",
  },
  duracion: {
    type: String, // Ej: "3 meses", "6 meses"
    default: "",
  },
  fechaPublicacion: {
    type: Date,
    default: Date.now,
  },
  estado: {
    type: String,
    enum: ["Activa", "Cerrada"],
    default: "Activa",
  },
      /** Usuarios que marcaron esta pasantía como favorita */
    favoritos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pasante"
      },
    ],
}, {
  timestamps: true
});

const Pasantia = mongoose.model("Pasantia", pasantiaSchema);
export default Pasantia;
