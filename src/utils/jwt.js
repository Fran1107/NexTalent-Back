// Importamos la librería jsonwebtoken, que permite crear y verificar tokens JWT
import jwt from 'jsonwebtoken';

// ===================================================================
// Función para generar un token JWT (usado al iniciar sesión)
// ===================================================================
export const generateToken = (userId, userType) => {
    // Creamos un token firmado digitalmente con los datos del usuario
    // En este caso, guardamos en el "payload" el id y el tipo de usuario (userType)
    const token = jwt.sign( 
        { 
            id: userId,         // ID del usuario (referencia en la base de datos)
            userType: userType  // Tipo de usuario: 'pasante' o 'empresa'
        },
        process.env.JWT_SECRET, // Clave secreta que se usa para firmar el token (definida en .env)
        {
            expiresIn: '7d'     // Tiempo de expiración del token (7 días)
        }
    )
    
    // Devolvemos el token firmado
    return token
};

// ===================================================================
// Función para verificar si un token JWT es válido
// ===================================================================
export const verifyToken = (token) => {
    try {
        // Decodificamos y verificamos el token usando la misma clave secreta
        // Si el token fue modificado o está vencido, jwt.verify lanzará un error
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        
        // Si todo está bien, devolvemos los datos decodificados del token
        // Por ejemplo: { id: 'abc123', userType: 'empresa', iat: ..., exp: ... }
        return decoded
    } catch (error) {
        // Si el token no es válido o expiró, devolvemos null
        return null
    }
};
