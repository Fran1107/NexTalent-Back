// Importamos "mongoose", una librería que facilita la conexión y manejo de MongoDB.
import mongoose from 'mongoose'

// Importamos "colors" solo para mejorar la visualización de los mensajes en consola.
import colors from 'colors'

// Importamos "exit" de Node.js, que nos permite finalizar el proceso si ocurre un error grave.
import { exit } from 'node:process'

// Función asíncrona que conecta la base de datos MongoDB con nuestra aplicación.
export const connectDB = async () => {
    try {
        // Intentamos conectar a MongoDB usando la URL guardada en las variables de entorno (.env)
        // Mongoose devuelve un objeto con información de la conexión.
        const { connection } = await mongoose.connect(process.env.DATABASE_URL)

        // Obtenemos y mostramos el host y puerto de la conexión activa.
        const url = `${connection.host}:${connection.port}`
        console.log(colors.bgGreen.bold(`MongoDB Conectado en: ${url}`))
    } catch (error) {
        // Si ocurre algún error (por ejemplo, la base de datos no está levantada),
        // mostramos un mensaje de error en amarillo para destacarlo.
        console.log(colors.bgYellow.bold('Error al conectar a MongoDB'))

        // Finalizamos el proceso del servidor para evitar que siga corriendo sin conexión a la base de datos.
        exit(1)
    }
}
