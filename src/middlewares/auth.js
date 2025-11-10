// Importamos la función que valida y decodifica el JWT
import { verifyToken } from '../utils/jwt.js'

// Importamos el modelo de usuario para verificar si el usuario existe en la base
import User from '../model/User.js'


// Middleware principal de autenticación
export const authenticate = async (req, res, next) => {
    console.log(req.cookies) // 🔍 Muestra en consola las cookies enviadas por el navegador

    try {
        // 1️⃣ Obtener el token JWT desde las cookies del navegador
        const token = req.cookies.token;
        console.log(token) // Para depuración: muestra el token recibido

        // 2️⃣ Si no hay token, el usuario no está autenticado
        if (!token) {
            return res.status(401).json({ 
                error: 'No autenticado. Token no proporcionado' 
            });
        }

        // 3️⃣ Verificar y decodificar el token
        // verifyToken usa jwt.verify() para confirmar que el token sea válido y no esté vencido
        const decoded = verifyToken(token);

        // Si el token no se pudo verificar (inválido o expirado)
        if (!decoded) {
            return res.status(401).json({ 
                error: 'Token inválido o expirado' 
            });
        }

        // 4️⃣ Verificar que el usuario del token realmente exista en la base de datos
        // decoded.id viene del payload del JWT ({ id: user._id, userType: user.role })
        const user = await User.findById(decoded.id);

        // Si el usuario no existe o está inactivo, se niega el acceso
        if (!user || !user.isActive) {
            return res.status(401).json({ 
                error: 'Usuario no encontrado o inactivo' 
            });
        }

        // 5️⃣ Guardar la información del usuario autenticado dentro del request
        // Esto permite acceder a req.user.id o req.user.userType desde los controladores
        req.user = {
            id: decoded.id,          // ID del usuario logueado (desde el token)
            userType: decoded.userType // Tipo de usuario (por ejemplo: 'pasante' o 'empresa')
        };

        // 6️⃣ Si todo está correcto, continuar al siguiente middleware o controlador
        next();
    } catch (error) {
        // Si ocurre algún error durante el proceso, devolver un error 500
        return res.status(500).json({ 
            error: 'Error en la autenticación',
            details: error.message 
        });
    }
};



// 🧩 Middleware para autorizar solo a pasantes
export const isPasante = (req, res, next) => {
    // Si el tipo de usuario no es 'pasante', se bloquea el acceso
    if (req.user.userType !== 'pasante') {
        return res.status(403).json({ 
            error: 'Acceso denegado. Solo para pasantes' 
        });
    }

    // Si pasa la validación, continúa con el flujo normal
    next();
};



// 🧩 Middleware para autorizar solo a empresas
export const isEmpresa = (req, res, next) => {
    // Si el tipo de usuario no es 'empresa', se bloquea el acceso
    if (req.user.userType !== 'empresa') {
        return res.status(403).json({ 
            error: 'Acceso denegado. Solo para empresas' 
        });
    }

    // Si pasa la validación, continúa con el flujo normal
    next();
};
