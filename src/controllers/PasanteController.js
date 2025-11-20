// Importamos los modelos necesarios
// Pasante -> contiene la información del perfil del estudiante
// User -> contiene los datos base del usuario (email, password, rol, etc.)
import mongoose from 'mongoose';
import Pasante from '../model/Pasante.js';
import Pasantia from '../model/Pasantia.js';
import User from '../model/User.js';

// Controlador encargado de manejar todas las operaciones relacionadas con los pasantes
export class PasanteController {

    // ============================================================
    // 🧍‍♂️ Obtener perfil del pasante autenticado
    // ============================================================
    static getMyProfile = async (req, res) => {
        try {
            // Busca el perfil del pasante asociado al usuario autenticado
            const pasante = await Pasante.findOne({ userId: req.user.id });

            // Si no existe un perfil asociado, devuelve error 404
            if (!pasante) {
                return res.status(404).json({ 
                    error: 'Perfil de pasante no encontrado' 
                });
            }

            // Si se encuentra el perfil, se devuelve en la respuesta
            return res.status(200).json({ pasante });
        } catch (error) {
            // En caso de error del servidor, se devuelve código 500
            return res.status(500).json({ 
                error: 'Error al obtener perfil',
                details: error.message 
            });
        }
    };

    // ============================================================
    // 📝 Actualizar perfil del pasante autenticado
    // ============================================================
    static updateMyProfile = async (req, res) => {
        try {
            // Lista de campos que el pasante puede modificar
            const allowedUpdates = [
                'nombre', 
                'apellido', 
                'telefono', 
                'provincia', 
                'localidad', 
                'linkedinUrl', 
                'carrera', 
                'sobreMi',
                'habilidades',
                'disponibilidad',
                'fotoPerfil'
            ];

            // Se crea un objeto vacío que contendrá solo los campos permitidos
            const updates = {};

            // Se recorren las claves enviadas en el body del request
            Object.keys(req.body).forEach(key => {
                // Solo se agregan al objeto los campos que estén en la lista permitida
                if (allowedUpdates.includes(key)) {
                    updates[key] = req.body[key];
                }
            });

            // Se actualiza el perfil del pasante según su userId
            const pasante = await Pasante.findOneAndUpdate(
                { userId: req.user.id }, // Filtro de búsqueda
                updates,                 // Datos a actualizar
                { new: true, runValidators: true } // Retorna el documento actualizado y valida los campos
            );

            // Si no existe el perfil, se devuelve error 404
            if (!pasante) {
                return res.status(404).json({ 
                    error: 'Perfil de pasante no encontrado' 
                });
            }

            // Devuelve mensaje de éxito junto con el perfil actualizado
            return res.status(200).json({
                message: 'Perfil actualizado exitosamente',
                pasante
            });
        } catch (error) {
            // Manejo de errores generales
            return res.status(500).json({ 
                error: 'Error al actualizar perfil',
                details: error.message 
            });
        }
    };

    // ============================================================
    // 🌍 Obtener todos los pasantes (ruta pública)
    // ============================================================
    static getAllPasantes = async (req, res) => {
        try {
            // Se obtienen los parámetros de consulta para filtros y paginación
            const { 
                page = 1,            // Página actual (por defecto 1)
                limit = 10,          // Cantidad de resultados por página
                provincia,           // Filtro por provincia
                carrera,             // Filtro por carrera
                disponibilidad       // Filtro por disponibilidad
            } = req.query;

            // Se construye un objeto de búsqueda dinámico
            const query = {};
            
            if (provincia) query.provincia = provincia;
            if (carrera) query.carrera = new RegExp(carrera, 'i'); // Búsqueda insensible a mayúsculas/minúsculas
            if (disponibilidad) query.disponibilidad = disponibilidad;

            // Busca los pasantes que cumplan con los filtros
            const pasantes = await Pasante.find(query)
                .select('-userId')              // Excluye el userId del resultado por seguridad
                .limit(limit * 1)               // Limita la cantidad de resultados
                .skip((page - 1) * limit)       // Salta los registros previos según la página
                .sort({ createdAt: -1 });       // Ordena por fecha de creación (más recientes primero)

            // Cuenta el total de documentos que cumplen la búsqueda
            const count = await Pasante.countDocuments(query);

            // Devuelve los pasantes junto con información de paginación
            return res.status(200).json({
                pasantes,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                total: count
            });
        } catch (error) {
            return res.status(500).json({ 
                error: 'Error al obtener pasantes',
                details: error.message 
            });
        }
    };

    // ============================================================
    // 🔍 Obtener pasante por ID (ruta pública)
    // ============================================================
    static getPasanteById = async (req, res) => {
        try {
            const { id } = req.params;

            // Busca un pasante por su ID
            const pasante = await Pasante.findById(id).select('-userId');

            // Si no se encuentra el pasante, devuelve error 404
            if (!pasante) {
                return res.status(404).json({ 
                    error: 'Pasante no encontrado' 
                });
            }

            // Devuelve el perfil del pasante encontrado
            return res.status(200).json({ pasante });
        } catch (error) {
            return res.status(500).json({ 
                error: 'Error al obtener pasante',
                details: error.message 
            });
        }
    };

    // ============================================================
    // ❌ Eliminar cuenta del pasante autenticado
    // ============================================================
    static deleteMyAccount = async (req, res) => {
        try {
            // 1️⃣ Elimina el perfil del pasante asociado al usuario autenticado
            await Pasante.findOneAndDelete({ userId: req.user.id });

            // 2️⃣ Desactiva el usuario (no se borra del todo para mantener historial)
            await User.findByIdAndUpdate(req.user.id, { isActive: false });

            // 3️⃣ Elimina la cookie del token de autenticación
            res.clearCookie('token', {
                httpOnly: true, // Solo accesible desde el servidor
                secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
                sameSite: 'strict' // Evita envíos entre dominios
            });

            // 4️⃣ Envía mensaje de éxito
            return res.status(200).json({
                message: 'Cuenta eliminada exitosamente'
            });
        } catch (error) {
            return res.status(500).json({ 
                error: 'Error al eliminar cuenta',
                details: error.message 
            });
        }
    };

    // ============================================================
    // Agregar una postulación a favoritos
    // ============================================================
    static addFavorito = async (req, res) => {
        try {
            // Obtener IDs (pasantía del parámetro, pasante del token)
            const { pasantiaId } = req.params
            const pasanteId = req.user?.id

            // Validacióm de pasantía
            if ( !pasantiaId || mongoose.Types.ObjectId.isValid(pasantiaId) ) {
                return res.status(400).message('ID de pasantía incorrecto')
            }

            // Validación de pasante
            if ( !pasanteId || mongoose.Types.ObjectId.isValid(pasanteId) ) {
                return res.status(400).message('Usuario no autenticado')
            }

      // -------------------------------------------------------
      // 3️⃣  Agregar al array usando $addToSet (evita duplicados)
      // -------------------------------------------------------
      const actualizada = await Pasantia.findByIdAndUpdate(
        pasantiaId,
        { $addToSet: { favoritos: pasanteId } }, // <-- $addToSet = “agregar si no está”
        { new: true }                         // devuelve el doc actualizado
      )
        .populate("favoritos", "nombre email") // opcional: trae datos del pasante
        .exec();

      if (!actualizada) {
        return res.status(404).json({ message: "Pasantía no encontrada" });
      }

      // -------------------------------------------------------
      // 4️⃣  Responder al cliente
      // -------------------------------------------------------
      return res.status(200).json({
        message: "Pasantía añadida a favoritos",
        totalFavoritos: actualizada.favoritos.length,
        favoritos: actualizada.favoritos, // datos ya poblados
        pasantia: {
          _id: actualizada._id,
          titulo: actualizada.titulo,
          estado: actualizada.estado,
        },
      });
    } catch (err) {
      console.error("[addFavorito] →", err);
      return res
        .status(500)
        .json({ message: "Error interno del servidor", error: err.message });
    }
  };

    // static removeFavorito = async (req, res) => {

    // }
}

