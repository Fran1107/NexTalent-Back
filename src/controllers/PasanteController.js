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
    // Agregar una postulación a favoritos
    // ============================================================
    static addFavorito = async (req, res) => {
        try {
            // Obtener IDs (pasantía del parámetro, pasante del token)
            const { pasantiaId } = req.params
            const pasanteId = req.user?.id

            // Validación de pasantía
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

  static removeFavorito = async (req, res) => {
    try {
      const { pasantiaId } = req.params; // <-- id de la pasantía

      const pasanteId = req.user?.id;      // <-- el id del usuario autenticado

      // -------------------------------------------------
      // 1️⃣  Validaciones básicas
      // -------------------------------------------------
      if (!pasanteId) {
        return res.status(403).json({
          message: "Solo los pasantes pueden remover favoritos",
        });
      }

      if (!mongoose.Types.ObjectId.isValid(pasantiaId)) {
        return res
          .status(400)
          .json({ message: "pasantiaId no es un ObjectId válido" });
      }

      if (!pasanteId || !mongoose.Types.ObjectId.isValid(pasanteId)) {
        return res
          .status(401)
          .json({ message: "Usuario no autenticado o id inválido" });
      }

      // -------------------------------------------------
      // 2️⃣  Quitar del array usando $pull (operación atómica)
      // -------------------------------------------------
      const pasantia = await Pasantia.findByIdAndUpdate(
        pasantiaId,
        { $pull: { favoritos: pasanteId } }, // quita el ObjectId del array
        { new: true }                       // devuelve el documento actualizado
      )
        .populate("favoritos", "nombre email") // opcional: datos del pasante
        .exec();

      // -------------------------------------------------
      // 3️⃣  Manejo de resultados
      // -------------------------------------------------
      if (!pasantia) {
        return res
          .status(404)
          .json({ message: "Pasantía no encontrada" });
      }

      // Si el id no estaba en el array, `favoritos` no cambia,
      // pero seguimos devolviendo 200.

      return res.status(200).json({
        message: "Favorito removido",
        totalFavoritos: pasantia.favoritos.length,
        favoritos: pasantia.favoritos,
        pasantia: {
          _id: pasantia._id,
          titulo: pasantia.titulo,
          estado: pasantia.estado,
        },
      });
    } catch (err) {
      console.error("[removeFavorito] →", err);
      return res.status(500).json({
        message: "Error interno del servidor",
        error: err.message,
      });
    }
  };

// Obtener todas las pasantías favoritas del usuario logueado
    static getMyFavoritos = async (req, res) => {
  try {
    const userId = req.user?.id 

    const favoritas = await Pasantia.find({ 
      favoritos: userId           // busca pasantías que incluyan al usuario en el array
    })
    .populate("empresaId", "nombre sector") 
    .lean();

    return res.json(favoritas);

  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

}

