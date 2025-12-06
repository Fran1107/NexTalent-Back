// FUNCIONALIDAD 5 
// import Resena from "../model/Review.js";
// import Aplicacion from "../model/Aplicacion.js";

// // Crear reseña: solo pasantes que trabajaron en la empresa (Aplicación en estado "Aceptada")
// export const createResena = async (req, res) => {
//     try {
//         const pasanteId = req.user.id;
//         const { empresaId, rating, titulo, comentario } = req.body;

// // Validar que el pasante realmente trabajó allí
//     const aplicacion = await Aplicacion.findOne({
//         pasanteId,
//         empresaId,
//         estado: "Aceptada"
//     });

//     if (!aplicacion) {
//         return res.status(403).json({
//         error: "Solo puedes dejar una reseña si trabajaste en esta empresa."
//     });
//     }

//     const nueva = await Resena.create({
//         empresaId,
//         pasanteId,
//         rating,
//         titulo,
//         comentario
//     });

//     res.status(201).json({
//         message: "Reseña creada correctamente",
//         reseña: nueva
//     });

//     } catch (error) {
//     res.status(500).json({ error: error.message });
//     }
// };

// // Obtener reseñas por empresa (público)
// export const getResenasByEmpresa = async (req, res) => {
//     try {
//     const { empresaId } = req.params;

//     const reseñas = await Resena.find({ empresaId })
//         .populate('pasanteId', 'nombre apellido') 
//         .sort({ createdAt: -1 });

//         res.json({ reseñas });

//     } catch (error) {
//     res.status(500).json({ error: error.message });
//     }
// };

// // Actualizar reseña
// export const updateResena = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const pasanteId = req.user.id;

//     const reseña = await Resena.findById(id);

//     if (!reseña) {
//         return res.status(404).json({ error: "Reseña no encontrada" });
//     }

//     if (reseña.pasanteId.toString() !== pasanteId) {
//         return res.status(403).json({ error: "No puedes editar esta reseña" });
//     }

//     reseña.rating = req.body.rating ?? reseña.rating;
//     reseña.titulo = req.body.titulo ?? reseña.titulo;
//     reseña.comentario = req.body.comentario ?? reseña.comentario;

//     await reseña.save();

//     res.json({ message: "Reseña actualizada", reseña });

//     } catch (error) {
//     res.status(500).json({ error: error.message });
//     } 
// };

// // Eliminar reseña
// export const deleteResena = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const pasanteId = req.user.id;

//     const reseña = await Resena.findById(id);

//     if (!reseña) {
//         return res.status(404).json({ error: "Reseña no encontrada" });
//     }

//     if (reseña.pasanteId.toString() !== pasanteId) {
//         return res.status(403).json({ error: "No puedes eliminar esta reseña" });
//     }

//     await reseña.deleteOne();

//     res.json({ message: "Reseña eliminada" });

//     } catch (error) {
//     res.status(500).json({ error: error.message });
//     }
// };
