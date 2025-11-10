// Importamos Router desde Express para crear un conjunto de rutas agrupadas
import { Router } from 'express'

// Importamos el controlador que contiene la lógica de autenticación
import { AuthController } from '../controllers/AuthController.js'

// Middleware para validar el token JWT y comprobar que el usuario esté autenticado
import { authenticate } from '../middlewares/auth.js'

// Middleware que valida los datos del cuerpo de la request contra un esquema Zod
import { validate } from '../middlewares/validate.js'

// Importamos los esquemas de validación definidos con Zod
// Cada uno define las reglas para el registro o login
import {
    registerPasanteSchema,
    registerEmpresaSchema,
    loginSchema,
} from '../schemas/validation.js'

// Creamos una instancia de router para manejar las rutas de autenticación
const router = Router()

// =========================
// Rutas de Registro
// =========================

// Ruta para registrar un pasante
// 1️⃣ Primero ejecuta el middleware `validate(registerPasanteSchema)`
//     → Valida que los datos enviados cumplan el esquema Zod definido para pasantes.
// 2️⃣ Si todo es válido, ejecuta `AuthController.registerPasante()`
//     → Crea el usuario y el perfil del pasante.
router.post(
    '/register/pasante',
    validate(registerPasanteSchema),
    AuthController.registerPasante
)

// Ruta para registrar una empresa
// Funciona igual que la anterior, pero usa el esquema de validación y controlador correspondiente.
router.post(
    '/register/empresa',
    validate(registerEmpresaSchema),
    AuthController.registerEmpresa
)

// =========================
// Rutas de Login / Logout
// =========================

// Login de usuario (empresa o pasante)
// 1️⃣ Valida el cuerpo del request con `loginSchema`
// 2️⃣ Si es válido, llama a `AuthController.login()`
//     → Verifica credenciales, genera el token JWT y lo guarda en una cookie.
router.post('/login', validate(loginSchema), AuthController.login)

// Logout de usuario
// El controlador borra la cookie que contiene el token JWT
router.post('/logout', AuthController.logout)

// =========================
// Obtener usuario actual
// =========================

// Ruta protegida que requiere autenticación
// 1️⃣ Ejecuta `authenticate` para verificar el token JWT en las cookies.
// 2️⃣ Si el token es válido, pasa al controlador `getCurrentUser()`
//     → Devuelve la información del usuario actualmente logueado.
router.get('/getUser', authenticate, AuthController.getCurrentUser)

// Exportamos el router para usarlo en app.js o index.js
export default router
