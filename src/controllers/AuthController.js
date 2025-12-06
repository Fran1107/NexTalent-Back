// Importamos los modelos que representan las colecciones de la base de datos.
import User from '../model/User.js';
import Pasante from '../model/Pasante.js';
import Empresa from '../model/Empresa.js';

// Importamos la función que genera el token JWT.
import { generateToken } from '../utils/jwt.js';

// Importamos funciones para encriptar y verificar contraseñas.
import { checkPassword, hashPassword } from '../utils/auth.js';

// Creamos una clase que agrupa todos los métodos relacionados con la autenticación.
export class AuthController {

    // ============================
    // 🔹 REGISTRO DE PASANTE
    // ============================
    static registerPasante = async (req, res) => {
        try {
            // Extraemos los datos enviados desde el frontend.
            const { 
                email, 
                password, 
                nombre, 
                apellido, 
                telefono, 
                provincia, 
                localidad, 
                fechaNacimiento, 
                carrera,
                linkedinUrl = '',   // Valor por defecto si no lo envía
                sobreMi = ''        // Valor por defecto si no lo envía
            } = req.body;

            // 1️⃣ Verificar si el email ya está registrado en la base de datos.
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ 
                    error: 'El email ya está registrado' 
                });
            }

            // 2️⃣ Encriptar la contraseña antes de guardarla.
            const hashedPassword = await hashPassword(password);

            // 3️⃣ Crear el usuario base (tabla general User).
            const user = await User.create({
                email,
                password: hashedPassword,
                userType: 'pasante' // Identifica el tipo de usuario
            });

            // 4️⃣ Crear el perfil específico de pasante vinculado al usuario.
            const pasante = await Pasante.create({
                userId: user._id, // Relación con la tabla User
                nombre,
                apellido,
                telefono,
                provincia,
                localidad,
                fechaNacimiento: new Date(fechaNacimiento),
                carrera,
                linkedinUrl,
                sobreMi
            });

            // 5️⃣ Generar un token JWT que identifica la sesión del usuario.
            const token = generateToken(user._id, user.userType);

            // 6️⃣ Configurar la cookie donde se guarda el token en el navegador.
            res.cookie('token', token, {
                httpOnly: true, // Protege contra ataques XSS
                secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
                sameSite: 'strict', // Evita compartir cookies entre sitios
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días de duración
            });

            // 7️⃣ Respuesta al frontend con los datos del usuario creado.
            return res.status(201).json({
                message: 'Pasante registrado exitosamente',
                user: {
                    id: user._id,
                    email: user.email,
                    userType: user.userType,
                    perfil: {
                        id: pasante._id,
                        nombre: pasante.nombre,
                        apellido: pasante.apellido,
                        carrera: pasante.carrera
                    }
                }
            });
        } catch (error) {
            // Si ocurre un error, enviamos un mensaje al frontend con detalles.
            return res.status(500).json({ 
                error: 'Error al registrar pasante',
                details: error.message 
            });
        }
    };

    // ============================
    // 🔹 REGISTRO DE EMPRESA
    // ============================
    static registerEmpresa = async (req, res) => {
        try {
            // Extraemos los datos del formulario de registro de empresa.
            const { 
                email, 
                password, 
                nombre, 
                razonSocial, 
                sector, 
                descripcion, 
                sitioWeb = '',
                provincia, 
                localidad,
                calle, 
                numero, 
                codigoPostal, 
                telefono,
                modalidadTrabajo,
                cantidadEmpleados,
                logo
            } = req.body;

            // 1️⃣ Verificar si el email ya está registrado.
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ 
                    error: 'El email ya está registrado' 
                });
            }

            // 2️⃣ Verificar si la razón social ya está en uso.
            const existingEmpresa = await Empresa.findOne({ razonSocial });
            if (existingEmpresa) {
                return res.status(400).json({ 
                    error: 'El razonSocial ya está registrado' 
                });
            }

            // 3️⃣ Encriptar la contraseña.
            const hashedPassword = await hashPassword(password);

            // 4️⃣ Crear el usuario base.
            const user = await User.create({
                email,
                password: hashedPassword,
                userType: 'empresa'
            });

            // 5️⃣ Crear el perfil de empresa vinculado al usuario.
            const empresa = await Empresa.create({
                userId: user._id,
                nombre,
                razonSocial,
                sector,
                descripcion,
                sitioWeb,
                provincia,
                localidad,
                calle,
                numero,
                codigoPostal,
                telefono,
                modalidadTrabajo,
                cantidadEmpleados,
                logo
            });

            // 6️⃣ Generar token JWT y configurar cookie.
            const token = generateToken(user._id, user.userType);
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            // 7️⃣ Respuesta al frontend con los datos del nuevo usuario.
            return res.status(201).json({
                message: 'Empresa registrada exitosamente',
                user: {
                    id: user._id,
                    email: user.email,
                    userType: user.userType,
                    perfil: {
                        id: empresa._id,
                        nombre: empresa.nombre,
                        sector: empresa.sector,
                        razonSocial: empresa.razonSocial,
                        provincia: empresa.provincia,
                        localidad: empresa.localidad,
                        calle: empresa.calle,
                        numero: empresa.numero,
                        codigoPostal: empresa.codigoPostal,
                        telefono: empresa.telefono,
                        modalidadTrabajo: empresa.modalidadTrabajo,
                        cantidadEmpleados: empresa.cantidadEmpleados,
                        logo: empresa.logo
                    }
                }
            });
        } catch (error) {
            return res.status(500).json({ 
                error: 'Error al registrar empresa',
                details: error.message 
            });
        }
    };

    // ============================
    // 🔹 LOGIN
    // ============================
    static login = async (req, res) => {
        try {
            const { email, password, userType } = req.body;

            // 1️⃣ Buscar el usuario por email y tipo (empresa o pasante).
            const user = await User.findOne({ email, userType });
            if (!user) {
                return res.status(401).json({ 
                    error: 'Credenciales inválidas' 
                });
            }

            // 2️⃣ Verificar si la contraseña ingresada es correcta.
            const isValidPassword = await checkPassword(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ 
                    error: 'Credenciales inválidas' 
                });
            }

            // 3️⃣ Verificar si el usuario está activo (no eliminado o deshabilitado).
            if (!user.isActive) {
                return res.status(401).json({ 
                    error: 'Usuario inactivo' 
                });
            }

            // 4️⃣ Buscar el perfil correspondiente según el tipo de usuario.
            let perfil;
            if (userType === 'pasante') {
                perfil = await Pasante.findOne({ userId: user._id });
            } else {
                perfil = await Empresa.findOne({ userId: user._id });
            }

            // 5️⃣ Generar token JWT y guardar en cookie.
            const token = generateToken(user._id, user.userType);
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            // 6️⃣ Enviar respuesta con los datos del usuario logueado.
            return res.status(200).json({
                message: 'Login exitoso',
                user: {
                    id: user._id,
                    email: user.email,
                    userType: user.userType,
                    perfil: perfil
                }
            });
        } catch (error) {
            return res.status(500).json({ 
                error: 'Error al iniciar sesión',
                details: error.message 
            });
        }
    };

    // ============================
    // 🔹 LOGOUT
    // ============================
    static logout = async (req, res) => {
        try {
            // Eliminamos la cookie del token para cerrar sesión.
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            });

            return res.status(200).json({
                message: 'Logout exitoso'
            });
        } catch (error) {
            return res.status(500).json({ 
                error: 'Error al cerrar sesión',
                details: error.message 
            });
        }
    };

    // ============================
    // 🔹 OBTENER USUARIO ACTUAL
    // ============================
    static getCurrentUser = async (req, res) => {
        try {
            // Buscamos el usuario actual usando el ID del token (req.user se setea en el middleware de autenticación).
            const user = await User.findById(req.user.id).select('-password'); // Excluye la contraseña

            if (!user) {
                return res.status(404).json({ 
                    error: 'Usuario no encontrado' 
                });
            }

            // Buscamos el perfil dependiendo del tipo de usuario.
            let perfil;
            if (user.userType === 'pasante') {
                perfil = await Pasante.findOne({ userId: user._id });
            } else {
                perfil = await Empresa.findOne({ userId: user._id });
            }

            // Enviamos los datos del usuario logueado.
            return res.status(200).json({
                user: {
                    id: user._id,
                    email: user.email,
                    userType: user.userType,
                    perfil: perfil
                }
            });
        } catch (error) {
            return res.status(500).json({ 
                error: 'Error al obtener usuario',
                details: error.message 
            });
        }
    };

    // COMPLETAR PERFIL (Google Onboarding)
    static completeGoogleProfile = async (req, res) => {
        try {
            // 1. Obtenemos el ID del usuario desde el token (gracias al middleware authenticate)
            const userId = req.user.id;
            
            // 2. Extraemos el tipo de usuario y el resto de los datos del formulario
            const { userType, ...profileData } = req.body;

            // Validamos que envíen un tipo de usuario válido
            if (!['pasante', 'empresa'].includes(userType)) {
                return res.status(400).json({ error: 'Tipo de usuario inválido' });
            }

            // 3. Buscamos y actualizamos el usuario base (User)
            const user = await User.findById(userId);
            
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }

            // Actualizamos su rol y marcamos el perfil como completo
            user.userType = userType;
            user.isProfileComplete = true; 
            await user.save();

            // 4. Creamos el perfil específico según el rol elegido
            if (userType === 'pasante') {
                await Pasante.create({
                    userId: user._id,
                    nombre: profileData.nombre,
                    apellido: profileData.apellido,
                    telefono: profileData.telefono || '', // Manejo de opcionales
                    carrera: profileData.carrera,
                    provincia: profileData.provincia, 
                    localidad: profileData.localidad,
                    // Si la fecha viene como string, asegúrate de convertirla, o deja que Mongoose lo intente
                    fechaNacimiento: profileData.fechaNacimiento ? new Date(profileData.fechaNacimiento) : undefined,
                    linkedinUrl: profileData.linkedinUrl || '',
                    sobreMi: profileData.sobreMi || ''
                });

            } else if (userType === 'empresa') {
                await Empresa.create({
                    userId: user._id,
                    nombre: profileData.nombre, // Nombre comercial
                    razonSocial: profileData.razonSocial,
                    sector: profileData.sector,
                    descripcion: profileData.descripcion || '',
                    provincia: profileData.provincia,
                    localidad: profileData.localidad,
                    calle: profileData.calle,
                    numero: profileData.numero,
                    codigoPostal: profileData.codigoPostal,
                    telefono: profileData.telefono,
                    modalidadTrabajo: profileData.modalidadTrabajo, 
                    cantidadEmpleados: profileData.cantidadEmpleados
                });
            }

            // 5. ¡Listo! Devolvemos éxito
            return res.status(200).json({ 
                message: 'Perfil completado exitosamente',
                user: {
                    id: user._id,
                    email: user.email,
                    userType: user.userType,
                    isProfileComplete: user.isProfileComplete
                }
            });

        } catch (error) {
            console.error("Error en completeGoogleProfile:", error);
            // Si hubo un error (ej: validación de Mongoose), devolvemos 500 o 400
            return res.status(500).json({ 
                error: 'Error al completar el perfil',
                details: error.message 
            });
        }
    };

    // LOGIN CON LINKEDIN (MANUAL - SOLUCIÓN DEFINITIVA)
    static linkedinCallback = async (req, res) => {
        try {
            const { code, error } = req.query;

            // 1. Manejo de errores de LinkedIn
            if (error) {
                console.error("❌ LinkedIn devolvió error:", error);
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=${error}`);
            }
            if (!code) {
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_code`);
            }

            // 2. Canjear el 'code' por un 'accessToken'
            // LinkedIn exige form-urlencoded
            const tokenParams = new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: 'http://localhost:3000/api/auth/linkedin/callback', // DEBE SER EXACTA
                client_id: process.env.LINKEDIN_CLIENT_ID,
                client_secret: process.env.LINKEDIN_CLIENT_SECRET
            });

            const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: tokenParams
            });

            if (!tokenResponse.ok) {
                const errData = await tokenResponse.json();
                console.error("❌ Error obteniendo token:", errData);
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=token_failed`);
            }

            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;

            // 3. Obtener datos del usuario (UserInfo - Endpoint NUEVO)
            const userResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });

            if (!userResponse.ok) {
                console.error("❌ Error obteniendo perfil:", await userResponse.text());
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=profile_failed`);
            }

            const profile = await userResponse.json();
            // El perfil llega así: { sub: 'ID', name: 'Nombre', email: 'correo', ... }
            
            console.log("✅ Perfil LinkedIn recibido:", profile.email);

            // 4. Buscar o Crear Usuario (Misma lógica que tenías)
            let user = await User.findOne({ linkedinId: profile.sub }); // 'sub' es el ID

            if (!user && profile.email) {
                user = await User.findOne({ email: profile.email });
                if (user) {
                    user.linkedinId = profile.sub;
                    await user.save();
                }
            }

            if (!user) {
                user = await User.create({
                    email: profile.email,
                    linkedinId: profile.sub,
                    userType: null,
                    isProfileComplete: false,
                });
            }

            // 5. Generar JWT y Cookie
            const token = generateToken(user._id, user.userType);

            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 
            });

            // 6. Redirección final
            if (!user.isProfileComplete || !user.userType) {
                return res.redirect(`${process.env.FRONTEND_URL}onboarding`);
            } else {
                const target = user.userType === 'empresa' ? '/dashboard-empresa' : '/dashboard';
                return res.redirect(`${process.env.FRONTEND_URL}${target}`);
            }

        } catch (error) {
            console.error("🛑 Error crítico en LinkedIn Callback:", error);
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
        }
    };
}
