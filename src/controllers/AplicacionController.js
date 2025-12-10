import Aplicacion from '../model/Aplicacion.js';
import Postulacion from '../model/Postulacion.js';
import Pasante from '../model/Pasante.js';

export class AplicacionController {

    // ============================================================
    // 📨 Crear Aplicación (Botón "Postularme")
    // ============================================================
    static createAplicacion = async (req, res) => {
        try {
            const { postulacionId, mensaje } = req.body;
            const userId = req.user.id; 

            // 1. Validar Pasante y CV
            const pasante = await Pasante.findOne({ userId });
            if (!pasante) return res.status(404).json({ error: 'Perfil de pasante no encontrado' });
            
            if (!pasante.cvUrl) {
                return res.status(400).json({ error: 'Debes subir tu CV en "Mi Perfil" antes de postularte.' });
            }

            // 2. Validar que la Postulación exista
            const oferta = await Postulacion.findById(postulacionId);
            if (!oferta) return res.status(404).json({ error: 'La publicación no existe' });

            // 3. Crear la aplicación
            const nuevaAplicacion = new Aplicacion({
                postulacionId,
                pasanteId: pasante._id,
                empresaId: oferta.empresaId, // Obtenemos el ID de la empresa desde la oferta
                cvUrl: pasante.cvUrl,
                mensaje
            });

            await nuevaAplicacion.save();

            res.status(201).json({ message: '¡Postulación enviada con éxito!', aplicacion: nuevaAplicacion });

        } catch (error) {
            // Código 11000 es duplicado en MongoDB
            if (error.code === 11000) {
                return res.status(400).json({ error: 'Ya te has postulado a esta oferta previamente.' });
            }
            res.status(500).json({ error: 'Error al crear la aplicación', details: error.message });
        }
    };

    // ============================================================
    // 📂 Mis Aplicaciones (Para el Pasante)
    // ============================================================
    static getMyAplicaciones = async (req, res) => {
        try {
            const pasante = await Pasante.findOne({ userId: req.user.id });
            if (!pasante) return res.status(404).json({ error: 'Pasante no encontrado' });

            const aplicaciones = await Aplicacion.find({ pasanteId: pasante._id })
                .populate('postulacionId', 'titulo modalidad lugar') // Trae datos de la oferta
                .populate('empresaId', 'nombre logo')     // Trae datos de la empresa
                .sort({ createdAt: -1 });

            res.json({ aplicaciones });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener historial', details: error.message });
        }
    };

    // ============================================================
    // 🏢 Ver Candidatos (Para la Empresa)
    // ============================================================
    static getAplicacionesByPostulacion = async (req, res) => {
        try {
            const { postulacionId } = req.params;
            
            // Buscamos quienes se postularon a esta oferta específica
            const aplicaciones = await Aplicacion.find({ postulacionId })
                .populate('pasanteId', 'nombre apellido carrera fotoPerfil provincia localidad')
                .sort({ createdAt: -1 });

            res.json({ aplicaciones });
        } catch (error) {
            res.status(500).json({ error: 'Error al obtener candidatos', details: error.message });
        }
    };

    // ============================================================
    // ✅ Cambiar Estado (Aceptar/Rechazar)
    // ============================================================
    static updateAplicacionStatus = async (req, res) => {
        try {
            const { id } = req.params; // ID de la APLICACIÓN
            const { estado } = req.body;

            const aplicacion = await Aplicacion.findByIdAndUpdate(
                id,
                { estado },
                { new: true }
            );

            if (!aplicacion) return res.status(404).json({ error: 'Aplicación no encontrada' });

            res.json({ message: `Candidato actualizado a: ${estado}`, aplicacion });
        } catch (error) {
            res.status(500).json({ error: 'Error al actualizar estado', details: error.message });
        }
    };
}