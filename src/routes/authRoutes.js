// Importamos Router desde Express para crear un conjunto de rutas agrupadas
import { Router } from 'express'

// Importamos el controlador que contiene la lógica de autenticación
import { AuthController } from '../controllers/AuthController.js'

// Middleware para validar el token JWT y comprobar que el usuario esté autenticado
import { authenticate } from '../middlewares/auth.js'

// Middleware que valida los datos del cuerpo de la request contra un esquema Zod
import { validate } from '../middlewares/validate.js'

import passport from 'passport'
import '../config/passport.js'
import { generateToken } from '../utils/jwt.js'

// Importamos los esquemas de validación definidos con Zod
// Cada uno define las reglas para el registro o login
import {
    registerPasanteSchema,
    registerEmpresaSchema,
    loginSchema,
} from '../schemas/validation.js'

// Creamos una instancia de router para manejar las rutas de autenticación
const router = Router()

// Ruta que inicia el proceso de google
router.get('/google', passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false // Importante: false porque usamos JWT, no sesiones de express
}));

// 2. Callback donde Google nos devuelve al usuario
router.get('/google/callback', 
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    (req, res) => {
        // En este punto, req.user ya tiene el usuario (encontrado o creado)
        const user = req.user;

        // Generamos tu JWT igual que en AuthController 
        const token = generateToken(user._id, user.userType);

        // Configuramos la cookie igual que en AuthController 
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
        });

        // REDIRECCIÓN INTELIGENTE
        // Aquí decide el frontend a dónde ir basándose en la URL
        if (!user.isProfileComplete || !user.userType) {
            // Opción 3: Si es nuevo, al onboarding
            // Nota: Cambia esta URL por la de tu FRONTEND (React)
            res.redirect(`${process.env.FRONTEND_URL}onboarding`);
        } else {
            // Si ya existía y está completo, al dashboard
            res.redirect(`${process.env.FRONTEND_URL}dashboard`);
        }
    }
);

// 1. Ruta que inicia el login (redirige a LinkedIn)
// 1. INICIAR LOGIN: Redirigimos manualmente a LinkedIn
router.get('/linkedin', (req, res) => {
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.LINKEDIN_CLIENT_ID,
        redirect_uri: 'http://localhost:3000/api/auth/linkedin/callback',
        scope: 'openid profile email', // Permisos nuevos
        state: 'random_string_xyz' // Un string cualquiera
    });
    
    res.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`);
});

// 2. CALLBACK: Recibimos el código y lo procesamos manualmente
router.get('/linkedin/callback', AuthController.linkedinCallback);

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

// RUTA NUEVA: Completar perfil de Google
// Nota: Usamos un middleware de autenticación si lo tienes, sino confíamos en la cookie
router.put('/google/complete-profile', authenticate, AuthController.completeGoogleProfile);

// Exportamos el router para usarlo en app.js o index.js
export default router
