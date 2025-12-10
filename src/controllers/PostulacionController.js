import Postulacion from "../model/Postulacion.js";
import Empresa from "../model/Empresa.js"; 

export class PostulacionController {

  // ============================================================
  // 🏢 Crear Nueva Postulación
  // ============================================================
  static createPostulacion = async (req, res) => {
    try {
      // 1. Buscamos el perfil de la empresa usando el ID del usuario logueado
      const empresa = await Empresa.findOne({ userId: req.user.id });
      
      if (!empresa) {
          return res.status(404).json({ error: "Primero debes completar tu perfil de empresa." });
      }

      // 2. Creamos la oferta
      const nueva = new Postulacion({
          ...req.body,
          empresaId: empresa._id,      // ID del documento Empresa
          // CORREGIDO: Usamos 'empresa.nombre' según tu modelo
          empresaNombre: empresa.nombre, 
          logo: empresa.logo || ""     
      }); 
      
      await nueva.save();

      res.status(201).json({ message: "Oferta creada correctamente", data: nueva });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al crear la oferta" });
    }
  };

  // ============================================================
  // ✏️ Editar Postulación
  // ============================================================
  static updatePostulacion = async (req, res) => {
    try {
      const { id } = req.params;
      
      // 1. Buscamos quién es la empresa que intenta editar
      const empresa = await Empresa.findOne({ userId: req.user.id });
      if (!empresa) return res.status(403).json({ error: "No tienes perfil de empresa" });

      const oferta = await Postulacion.findById(id);
      if (!oferta) return res.status(404).json({ error: "Oferta no encontrada" });

      // 2. Verificamos que la oferta pertenezca a esta empresa
      if (oferta.empresaId.toString() !== empresa._id.toString())
        return res.status(403).json({ error: "No autorizado. Esta oferta no es tuya." });

      const actualizada = await Postulacion.findByIdAndUpdate(id, req.body, {
        new: true
      });

      res.json({ message: "Oferta actualizada", data: actualizada });
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar la oferta" });
    }
  };

  // ============================================================
  // 🗑️ Eliminar Postulación
  // ============================================================
  static deletePostulacion = async (req, res) => {
    try {
      const { id } = req.params;

      const empresa = await Empresa.findOne({ userId: req.user.id });
      if (!empresa) return res.status(403).json({ error: "No tienes perfil de empresa" });

      const oferta = await Postulacion.findById(id);
      if (!oferta) return res.status(404).json({ error: "Oferta no encontrada" });

      if (oferta.empresaId.toString() !== empresa._id.toString())
        return res.status(403).json({ error: "No autorizado" });

      await oferta.deleteOne();

      res.json({ message: "Oferta eliminada correctamente" });
    } catch (error) {
      res.status(500).json({ error: "Error al eliminar la oferta" });
    }
  };

  // ============================================================
  // 🏢 Mis Publicaciones (Dashboard)
  // ============================================================
  static getMyPostulaciones = async (req, res) => {
    try {
      const empresa = await Empresa.findOne({ userId: req.user.id });
      if (!empresa) return res.status(404).json({ error: "Perfil de empresa no encontrado" });

      const ofertas = await Postulacion.find({ empresaId: empresa._id }).sort({ createdAt: -1 });

      res.json(ofertas);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener las ofertas" });
    }
  };

  // ============================================================
  // 🌍 Obtener Todas (Público)
  // ============================================================
  static getAllPostulaciones = async (req, res) => {
    try {
      //const filtros = { estado: "Activa" };
      const filtros = {};

      if (req.query.modalidad) filtros.modalidad = req.query.modalidad;
      if (req.query.estado) filtros.estado = req.query.estado; 
      if (req.query.provincia) filtros["lugar.provincia"] = req.query.provincia;

      // CORREGIDO: Populate con los campos reales de tu modelo Empresa
      const ofertas = await Postulacion.find(filtros)
        .populate("empresaId", "nombre logo telefono sitioWeb provincia localidad") 
        .sort({ createdAt: -1 });

      res.json(ofertas);
    } catch (error) {
      console.error("error get all post: ", error)
      res.status(500).json({ error: "Error al obtener las ofertas" });
    }
  };

  // ============================================================
  // 🔍 Detalle por ID (Público)
  // ============================================================
  static getPostulacionById = async (req, res) => {
    try {
      const { id } = req.params;

      // CORREGIDO: Populate con campos reales
      const oferta = await Postulacion.findById(id)
        .populate("empresaId", "nombre logo telefono sitioWeb provincia localidad calle numero");

      if (!oferta) return res.status(404).json({ error: "Oferta no encontrada" });

      res.json(oferta);
    } catch (error) {
      res.status(500).json({ error: "Error al obtener la oferta" });
    }
  };
}