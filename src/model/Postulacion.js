import mongoose from "mongoose";

const postulacionSchema = new mongoose.Schema({
    // Relación con la Empresa dueña
    empresaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Empresa",
        required: true
    },
    // Datos redundantes para mostrar rápido en cards (Opcional pero recomendado)
    empresaNombre: {
        type: String
    },
    logo: {
        type: String,
        required: false
    },
    // Detalles de la oferta
    titulo: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: true,
        trim: true,
        maxlength: 3000
    },
    requisitos: [{
        type: String,
        trim: true
    }],
    lugar: {
        provincia: { type: String, required: true },
        localidad: { type: String, required: true }
    },
    modalidad: {
        type: String,
        enum: ["Hibrido", "Remoto", "Presencial"],
        required: true
    },
    // Estado de la OFERTA (No de la aplicación)
    estado: {
        type: String,
        enum: ["Activa", "Pausada", "Cerrada"],
        default: "Activa"
    }
}, { 
    timestamps: true 
});

const Postulacion = mongoose.model("Postulacion", postulacionSchema);
export default Postulacion;