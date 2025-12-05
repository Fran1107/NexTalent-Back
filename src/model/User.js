import mongoose from 'mongoose'
// Importamos mongoose para poder definir esquemas y modelos de base de datos en MongoDB.

// Definimos el esquema del usuario
const userSchema = new mongoose.Schema({
    email: {
        type: String,            // El correo electrónico del usuario
        required: true,          // Es obligatorio para poder registrarse
        unique: true,            // No puede repetirse; garantiza que cada email sea único
        lowercase: true,         // Convierte el valor automáticamente a minúsculas
        trim: true               // Elimina espacios en blanco antes o después del email
    },
    password: {
        type: String,            // Contraseña en formato hash (nunca se guarda en texto plano)
        required: false           // Campo obligatorio
    },
    googleId: { 
        type: String,
        unique: true,
        sparse: true    // Permite que varios usuarios tengan googleId null
    }, 
    linkedinId: { 
        type: String, 
        unique: true, 
        sparse: true 
    },
    userType: {
        type: String,            // Define el tipo o rol del usuario en la plataforma
        enum: ['pasante', 'empresa', 'admin'], // Solo puede ser uno de estos tres valores

        default: null       // Si no se indica, por defecto será un pasante
    },
    isProfileComplete: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,           // Indica si el usuario tiene la cuenta activa o deshabilitada
        default: true            // Por defecto se crea como activo
    },
    createdAt: {
        type: Date,              // Guarda la fecha de creación del usuario
        default: Date.now        // Se establece automáticamente al momento de crear el registro
    }
},
{
    timestamps: true             // Añade automáticamente los campos createdAt y updatedAt
})

// Creamos el modelo "User" basado en el esquema definido
const User = mongoose.model('User', userSchema)

// Exportamos el modelo para poder usarlo en controladores, autenticación, etc.
export default User
