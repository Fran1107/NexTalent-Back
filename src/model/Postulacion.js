import mongoose from 'mongoose'

const postulacionSchema = new mongoose.Schema({
    pasantiaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pasantia',
        required: true
    },
    usuarioId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pasante',
        required: true
    },
    fechaPostulacion: {
        type: Date,
        default: Date.now
    },
    estado: {
        type: String,
        enum: ['En revisión', 'Aceptado', 'Rechazado'],
        default: ''
    },
      mensaje: {
    type: String,
    trim: true,
    maxlength: 1000,
  }
}, {
  timestamps: true
});

const Postulacion = mongoose.model("Postulacion", postulacionSchema);
export default Postulacion;

