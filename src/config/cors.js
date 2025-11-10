// Importamos el middleware "cors", que sirve para permitir o restringir solicitudes 
// desde diferentes dominios (por ejemplo, desde el frontend al backend).
import cors from 'cors';

// Lista de URLs que tienen permiso para hacer peticiones a nuestro servidor.
// Si existe la variable de entorno FRONTEND_URL, la usa; de lo contrario, 
// por defecto permite las solicitudes desde el localhost del frontend.
const ACCEPTED_ORIGINS = [
    process.env.FRONTEND_URL || 'http://localhost:5173'
]

// Exportamos una función que configura las reglas de CORS.
// Esta función puede recibir un objeto con una lista personalizada de orígenes permitidos.
export const corsConfig = ({ acceptedOrigins = ACCEPTED_ORIGINS } = {}) => cors({
    // La propiedad "origin" define quién puede hacer peticiones al backend.
    origin: (origin, callback) => {
        // Si el origen que hace la petición está en la lista de permitidos, la acepta.
        if (acceptedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Si la petición no tiene "origin" (por ejemplo, herramientas como Postman),
        // también se permite para evitar bloquear pruebas locales.
        if (!origin) {
            return callback(null, true);
        }

        // Si el origen no está permitido, lanza un error indicando que no tiene acceso.
        return callback(new Error('Not allowed by CORS'));
    },
    // Permite el uso de cookies y credenciales (como sesiones o tokens) entre frontend y backend.
    credentials: true
});

// Este archivo define las reglas para el Cross-Origin Resource Sharing (CORS).
// Sirve para que el navegador permita o bloquee solicitudes entre distintos dominios.
// Por ejemplo, evita que alguien desde un sitio desconocido acceda a tu API.
