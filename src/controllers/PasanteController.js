// Importamos los modelos necesarios
// Pasante -> contiene la información del perfil del estudiante
// User -> contiene los datos base del usuario (email, password, rol, etc.)
import mongoose from 'mongoose';
import Pasante from '../model/Pasante.js';
import User from '../model/User.js';
import Postulacion from "../model/Postulacion.js"

// Controlador encargado de manejar todas las operaciones relacionadas con los pasantes
export class PasanteController {

    // ============================================================
    // 🧍‍♂️ Obtener perfil del pasante autenticado
    // ============================================================
    static getMyProfile = async (req, res) => {
        try {
            const pasante = await Pasante.findOne({ userId: req.user.id });
            if (!pasante) {
                return res.status(404).json({ error: 'Perfil de pasante no encontrado' });
            }
            return res.status(200).json({ pasante });
        } catch (error) {
            return res.status(500).json({ 
                error: 'Error al obtener perfil',
                details: error.message 
            });
        }
    };

    // ============================================================
    // 📤 Subir/Actualizar CV (PDF)
    // ============================================================
    static uploadCV = async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No se subió ningún archivo PDF' });
            }

            // Normalizamos la ruta (cambia backslashes de Windows \ a /)
            const filePath = req.file.path.replace(/\\/g, "/");

            // Buscamos y actualizamos solo el campo cvUrl
            const pasante = await Pasante.findOneAndUpdate(
                { userId: req.user.id },
                { cvUrl: filePath },
                { new: true } // Retorna el objeto actualizado
            );

            if (!pasante) {
                return res.status(404).json({ error: 'Perfil de pasante no encontrado' });
            }

            return res.status(200).json({ 
                message: 'CV subido correctamente', 
                cvUrl: pasante.cvUrl 
            });

        } catch (error) {
            return res.status(500).json({ 
                error: 'Error al subir el CV',
                details: error.message 
            });
        }
    };

    // ============================================================
    // 📸 Subir/Actualizar Foto de Perfil
    // ============================================================
    static uploadFotoPerfil = async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No se subió ninguna imagen' });
            }

            // Normalizamos la ruta
            const filePath = req.file.path.replace(/\\/g, "/");

            const pasante = await Pasante.findOneAndUpdate(
                { userId: req.user.id },
                { fotoPerfil: filePath },
                { new: true }
            );

            if (!pasante) {
                return res.status(404).json({ error: 'Perfil de pasante no encontrado' });
            }

            return res.status(200).json({ 
                message: 'Foto de perfil actualizada', 
                fotoPerfil: pasante.fotoPerfil 
            });

        } catch (error) {
            return res.status(500).json({ 
                error: 'Error al subir la foto',
                details: error.message 
            });
        }
    };

    // ============================================================
    // 📝 Actualizar perfil del pasante autenticado (Datos texto)
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
                'fotoPerfil', // Se mantiene por compatibilidad
                'cvUrl'       // Agregado por si se requiere update manual
            ];

            const updates = {};
            Object.keys(req.body).forEach(key => {
                if (allowedUpdates.includes(key)) {
                    updates[key] = req.body[key];
                }
            });

            const pasante = await Pasante.findOneAndUpdate(
                { userId: req.user.id }, 
                updates,                 
                { new: true, runValidators: true } 
            );

            if (!pasante) {
                return res.status(404).json({ error: 'Perfil de pasante no encontrado' });
            }

            return res.status(200).json({
                message: 'Perfil actualizado exitosamente',
                pasante
            });
        } catch (error) {
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
            const { 
                page = 1, 
                limit = 10, 
                provincia, 
                carrera, 
                disponibilidad 
            } = req.query;

            const query = {};
            
            if (provincia) query.provincia = provincia;
            if (carrera) query.carrera = new RegExp(carrera, 'i'); 
            if (disponibilidad) query.disponibilidad = disponibilidad;

            const pasantes = await Pasante.find(query)
                .select('-userId') 
                .limit(limit * 1) 
                .skip((page - 1) * limit) 
                .sort({ createdAt: -1 }); 

            const count = await Pasante.countDocuments(query);

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
            const pasante = await Pasante.findById(id).select('-userId');

            if (!pasante) {
                return res.status(404).json({ error: 'Pasante no encontrado' });
            }

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
            await Pasante.findOneAndDelete({ userId: req.user.id });
            await User.findByIdAndUpdate(req.user.id, { isActive: false });

            res.clearCookie('token', {
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                sameSite: 'strict' 
            });

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
  // Agregar una postulación a favoritos del pasante
  // ============================================================
  static addFavorito = async (req, res) => {
    try {
      const { postulacionId } = req.params;
      const userId = req.user?.id;

      if (!postulacionId || !mongoose.Types.ObjectId.isValid(postulacionId)) {
        return res.status(400).json({ message: "ID de postulación incorrecto" });
      }
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }

      // Actualizar el array de favoritos del pasante
      const pasante = await Pasante.findOneAndUpdate(
        { userId },
        { $addToSet: { favoritos: postulacionId } }, // evita duplicados
        { new: true }
      ).lean();

      if (!pasante) {
        return res.status(404).json({ message: "Perfil de pasante no encontrado" });
      }

      // Obtener las postulaciones favoritas actualizadas
      const favoritas = await Postulacion.find(
        { _id: { $in: pasante.favoritos } },
        "titulo empresa descripcion estado duracion modalidad logo"
      ).lean();

      const data = favoritas.map(p => ({
        ...p,
        esFavorito: true
      }));

      return res.status(200).json({
        message: "Postulación añadida a favoritos",
        favoritos: data
      });

    } catch (err) {
      console.error("[addFavorito] →", err);
      return res.status(500).json({
        message: "Error interno del servidor",
        error: err.message,
      });
    }
  };

  // ============================================================
  // Remover una postulación de favoritos del pasante
  // ============================================================
  static removeFavorito = async (req, res) => {
    try {
      const { postulacionId } = req.params;
      const userId = req.user?.id;

      if (!postulacionId || !mongoose.Types.ObjectId.isValid(postulacionId)) {
        return res.status(400).json({ message: "ID de postulación incorrecto" });
      }
      if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(401).json({ message: "Usuario no autenticado" });
      }

      // Quitar del array de favoritos del pasante
      const pasante = await Pasante.findOneAndUpdate(
        { userId },
        { $pull: { favoritos: postulacionId } },
        { new: true }
      ).lean();

      if (!pasante) {
        return res.status(404).json({ message: "Perfil de pasante no encontrado" });
      }

      // Obtener las postulaciones favoritas restantes
      const favoritas = await Postulacion.find(
        { _id: { $in: pasante.favoritos } },
        "titulo empresa descripcion estado duracion modalidad logo"
      ).lean();

      const data = favoritas.map(p => ({
        ...p,
        esFavorito: true
      }));

      return res.status(200).json({
        message: "Postulación removida de favoritos",
        favoritos: data
      });

    } catch (err) {
      console.error("[removeFavorito] →", err);
      return res.status(500).json({
        message: "Error interno del servidor",
        error: err.message,
      });
    }
  };


    // ============================================================
    // Obtener todas las postulaciones favoritas del usuario logueado
    // ============================================================
static getMyFavoritos = async (req, res) => {
  try {
    const userId = req.user?.id; // ID del User autenticado

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    // 1. Obtener el Pasante logueado para acceder a su array de favoritos
    const pasante = await Pasante.findOne({ userId }).lean();

    if (!pasante) {
      return res.status(404).json({ message: "Perfil de pasante no encontrado" });
    }

    // 2. Si no tiene favoritos, retornar array vacío
    if (!pasante.favoritos || pasante.favoritos.length === 0) {
      return res.json([]);
    }

    // 3. Buscar las Postulaciones que están en el array de favoritos del pasante
    const favoritas = await Postulacion.find(
      { _id: { $in: pasante.favoritos } },
      "titulo empresa descripcion estado duracion modalidad logo" // SOLO estos campos
    )
    .lean();

    // 4. Mapear los datos para el frontend
    const data = favoritas.map(p => ({
      ...p,
      esFavorito: true // todas son favoritas
    }));

    return res.json(data);

  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

  }