/**
 * MODELO: Empresa
 * --------------------------------------
 * Este archivo define la **estructura (schema)** que tendrán los documentos 
 * de las empresas en la base de datos MongoDB.
 * 
 * Usamos **Mongoose**, que nos permite definir un modelo con tipos de datos,
 * validaciones, relaciones y opciones extra (como timestamps).
 * 
 * 🔹 Cada documento en la colección "empresas" representa el perfil de una empresa.
 * 🔹 Está vinculado al usuario que la creó mediante el campo `userId`.
 */ 

import mongoose from 'mongoose';

// Definimos el esquema (estructura) de una Empresa
const empresaSchema = new mongoose.Schema({

    // userId: referencia al usuario dueño de la empresa
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Es un ID de MongoDB
        ref: 'User',                          // Se refiere al modelo "User"
        required: true                        // Es obligatorio
    },

    // nombre comercial de la empresa
    nombre: {
        type: String,
        required: true,   // Campo obligatorio
        trim: true        // Elimina espacios innecesarios al guardar
    },

    // Razón social (única en la base)
    razonSocial: {
        type: String,
        required: true,
        unique: true,     // No puede repetirse
        trim: true
    },

    // Sector o industria a la que pertenece (por ejemplo, Tecnología, Educación, etc.)
    sector: {
        type: String,
        required: true,
        trim: true
    },

    // Descripción de la empresa (máx. 2000 caracteres)
    descripcion: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000   // Límite de longitud
    },

    // Sitio web (opcional)
    sitioWeb: {
        type: String,
        trim: true,
        default: ''       // Si no se proporciona, queda vacío
    },

    // URL del logo (imagen)
    logo: {
        type: String,
        default: ''       // Vacío por defecto
    },

    // Provincia donde se encuentra la empresa
    provincia: {
        type: String,
        required: true,
        trim: true
    },

    // Localidad o ciudad
    localidad: {
        type: String,
        required: true,
        trim: true
    },

    // Calle de la dirección
    calle: {
        type: String,
        required: true,
        trim: true
    },

    // Número de la dirección
    numero: {
        type: String,
        required: true,
        trim: true
    },

    // Código postal
    codigoPostal: {
        type: String,
        required: true,
        trim: true
    },

    // Teléfono de contacto
    telefono: {
        type: String,
        required: true,
        trim: true
    },

    // Modalidad de trabajo (opciones limitadas)
    modalidadTrabajo: {
        type: String,
        enum: ['Remoto', 'Presencial', 'Hibrido'], // Solo puede ser una de estas tres
        default: ''                               // Por defecto vacío
    },

    // Cantidad de empleados (también con valores predefinidos)
    cantidadEmpleados: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
        default: ''
    },

    // Empresa verificada o pendiente de aprobación
    verificada: {
    type: Boolean,
    default: false
    }
}, {
    // timestamps: agrega automáticamente los campos createdAt y updatedAt
    timestamps: true
});

// Creamos el modelo "Empresa" a partir del esquema definido
const Empresa = mongoose.model('Empresa', empresaSchema);

// Exportamos el modelo para usarlo en controladores u otras partes del backend
export default Empresa;
