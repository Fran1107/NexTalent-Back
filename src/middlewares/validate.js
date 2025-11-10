/**
 * 🧩 Middleware: validate
 * --------------------------------------
 * Esta función sirve para **validar los datos** que llegan desde el frontend 
 * (por ejemplo, en un formulario de registro o login) antes de ejecutar el controlador.
 * 
 * Usa un "schema" (esquema de validación) creado con la librería **Zod** 
 * para asegurarse de que el cuerpo de la petición (req.body)
 * tenga el formato correcto, los campos requeridos, y los tipos esperados.
 * 
 * ✅ Si la validación pasa → continúa al siguiente middleware/controlador.
 * ❌ Si falla → responde con un error 400 (Bad Request) y muestra los campos incorrectos.
 */


// Función que recibe un esquema Zod (schema) y devuelve un middleware de validación
export const validate = (schema) => {
    // Retorna una función middleware estándar (req, res, next)
    return (req, res, next) => {
        try {
            // 1️⃣ Intenta validar los datos del cuerpo de la petición usando el esquema
            // Si todo está bien, no lanza error
            schema.parse(req.body);

            // 2️⃣ Si pasa la validación, continúa al siguiente middleware o controlador
            next();
        } catch (error) {
            // 3️⃣ Si la validación falla, Zod lanza un error con todos los detalles

            // Mapeamos los errores para enviarlos de forma clara al frontend
            const errors = error.errors.map(err => ({
                field: err.path.join('.'),  // Nombre del campo que falló (por ejemplo "email" o "password")
                message: err.message        // Mensaje descriptivo del error
            }));
            
            // 4️⃣ Responder con un código 400 (Bad Request) y los detalles de los errores
            return res.status(400).json({
                error: 'Errores de validación',
                details: errors
            });
        }
    };
};
