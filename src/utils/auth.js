// Importamos bcrypt, una librería que se usa para encriptar (hashear) contraseñas de forma segura
import bcrypt from 'bcrypt'

// Importamos dotenv para poder usar variables de entorno desde un archivo .env
import dotenv from 'dotenv'

// Cargamos las variables de entorno definidas en el archivo .env (por ejemplo, SALT_ROUNDS)
dotenv.config()

// ===================================================================
// Función para encriptar contraseñas antes de guardarlas en la base de datos
// ===================================================================
export const hashPassword = async (password) => {
    // Generamos un "salt" (una cadena aleatoria que se combina con la contraseña)
    // Esto hace que incluso si dos usuarios tienen la misma contraseña, el hash sea diferente
    // El número de "vueltas" del salt (complejidad) se toma de la variable de entorno SALT_ROUNDS
    const salt = await bcrypt.genSalt(parseInt(process.env.SALT_ROUNDS))
    
    // Creamos el hash final combinando la contraseña original con el salt
    // Esto devuelve una versión encriptada de la contraseña que guardaremos en la base de datos
    return await bcrypt.hash(password, salt) 
}

// ===================================================================
// Función para comparar contraseñas durante el login
// ===================================================================
export const checkPassword = async (enterPassword, storedHash) => {
    // Compara la contraseña ingresada por el usuario (enterPassword)
    // con la contraseña encriptada que está guardada en la base de datos (storedHash)
    // Devuelve true si coinciden o false si no coinciden
    return await bcrypt.compare(enterPassword, storedHash)
}
