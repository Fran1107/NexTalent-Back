import mongoose from 'mongoose';

const aplicacionSchema = new mongoose.Schema({
    // Referencia a la Oferta (Postulacion)
    postulacionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Postulacion', 
        required: true
    },
    // Referencia al Pasante
    pasanteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pasante',
        required: true
    },
    // Referencia a la Empresa (Para que la empresa pueda filtrar rápido sus candidatos)
    empresaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Empresa',
        required: true
    },
    // Estado del proceso de selección
    estado: {
        type: String,
        enum: ['Enviada', 'En revision', 'Rechazada', 'Aceptada'],
        default: 'Enviada'
    },
    // Foto del CV en el momento de postularse
    cvUrl: {
        type: String,
        required: true 
    },
    mensaje: {
        type: String,
        trim: true,
        maxlength: 1000
    }
}, {
    timestamps: true
});

// ÍNDICE ÚNICO: Evita que un pasante se postule 2 veces a la misma oferta
aplicacionSchema.index({ postulacionId: 1, pasanteId: 1 }, { unique: true });

const Aplicacion = mongoose.model('Aplicacion', aplicacionSchema);
export default Aplicacion;