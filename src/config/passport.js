import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2'
import User from '../model/User.js' 
import dotenv from 'dotenv'

dotenv.config()

passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback', // Esta ruta la crearemos en el paso 4
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // 1. Verificar si el usuario ya existe con ese Google ID
                let user = await User.findOne({ googleId: profile.id })

                if (user) {
                    // Caso A: Usuario ya registrado con Google -> LOGIN
                    return done(null, user)
                }

                // 2. Verificar si existe por email (caso de alguien que se registró normal antes)
                // El email viene en profile.emails[0].value
                const email = profile.emails[0].value
                user = await User.findOne({ email })

                if (user) {
                    // Caso B: Existía por correo, le vinculamos la cuenta de Google
                    user.googleId = profile.id
                    // Si ya tenía userType, asumimos que su perfil estaba completo o casi
                    // Si no, forzamos incomplete. Pero por seguridad, si ya existía, no tocamos mucho.
                    await user.save()
                    return done(null, user)
                }

                // Caso C: Usuario NUEVO totalmente (Registro Híbrido)
                // Creamos el "Pre-usuario"
                const newUser = await User.create({
                    email: email,
                    googleId: profile.id,
                    userType: null, // Aún no sabemos qué es
                    isProfileComplete: false, // Bandera para enviarlo a /onboarding
                    // No guardamos password
                })

                return done(null, newUser)
            } catch (error) {
                return done(error, null)
            }
        }
    )
)

// --- ESTRATEGIA LINKEDIN (OPENID CONNECT) ---
// Usamos el nombre 'linkedin' en el primer parámetro para no tener que cambiar tus rutas
passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/api/auth/linkedin/callback", // Asegúrate que coincida con LinkedIn Developers
    
    // 1. CLAVE: Usamos los scopes NUEVOS (OpenID)
    // Esto evita el error de "Scope not authorized"
    scope: ['openid', 'profile', 'email'], 
    
    // 2. CLAVE: Desactivamos state para no necesitar express-session
    state: false 
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        // LOG para ver qué nos trae LinkedIn con esta librería
        console.log("✅ Perfil LinkedIn (OAuth2):", profile.id);

        // La librería passport-linkedin-oauth2 suele normalizar el email en profile.emails
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        // --- LÓGICA DE BASE DE DATOS (Igual que siempre) ---
        
        // 1. Buscar por LinkedIn ID
        let user = await User.findOne({ linkedinId: profile.id });
        if (user) return done(null, user);

        // 2. Buscar por Email
        if (email) {
            user = await User.findOne({ email });
            if (user) {
                user.linkedinId = profile.id;
                await user.save();
                return done(null, user);
            }
        }

        // 3. Crear usuario nuevo
        const newUser = await User.create({
            email: email,
            linkedinId: profile.id,
            userType: null,
            isProfileComplete: false
        });

        return done(null, newUser);
    } catch (error) {
        console.error("❌ Error en Strategy LinkedIn:", error);
        return done(error, null);
    }
  }
));

// Serialización simple (Passport lo necesita aunque usemos JWT después, por protocolo)
passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id)
    done(null, user)
})
