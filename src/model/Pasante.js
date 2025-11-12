// Se relaciona con el modelo User a través del campo userId, 
// lo que permite manejar autenticación y roles de forma unificada.

import mongoose from 'mongoose'; 
// Importamos mongoose, que nos permite definir esquemas y modelos para MongoDB.

// Definimos el esquema para el pasante
const pasanteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Relaciona este documento con el usuario base en la colección "User"
        ref: 'User', // Hace referencia al modelo User
        required: true // Campo obligatorio
    },
    nombre: {
        type: String,
        required: true, // Debe ser completado
        trim: true // Elimina espacios innecesarios
    },
    apellido: {
        type: String,
        required: true,
        trim: true
    },
    telefono: {
        type: String,
        required: true,
        trim: true
    },
    provincia: {
        type: String,
        required: true,
        trim: true
    },
    localidad: {
        type: String,
        required: true,
        trim: true
    },
    fechaNacimiento: {
        type: Date, // Guarda una fecha en formato Date
        required: true
    },
    linkedinUrl: {
        type: String,
        trim: true,
        default: '' // Valor por defecto vacío si no se proporciona
    },
    fotoPerfil: {
        type: String,
        default: '' // Puede contener la URL de la foto de perfil
    },
    carrera: {
        type: String,
        required: true,
        trim: true // Carrera o área de estudio del pasante
    },
    sobreMi: {
        type: String,
        default: '', // Campo opcional para descripción personal
        trim: true,
        maxlength: 1000 // Límite de caracteres
    },
    habilidades: [{
        type: String, // Array de strings, cada uno representando una habilidad
        trim: true
    }],
    disponibilidad: {
        type: String,
        enum: ['tiempo_completo', 'medio_tiempo', 'flexible'], // Solo puede tener uno de estos valores
        default: 'flexible' // Si no se indica, será "flexible"
    },
    favoritos: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Postulacion',
        required: false
    }
}, {
    timestamps: true // Agrega automáticamente campos createdAt y updatedAt
});

// Creamos el modelo "Pasante" a partir del esquema definido
const Pasante = mongoose.model('Pasante', pasanteSchema);

// Exportamos el modelo para usarlo en otras partes del backend
export default Pasante;
