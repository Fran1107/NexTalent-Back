import Postulacion from "../model/Postulacion.js";


export const createPostulacion = async (req, res) => {
  try {
    const nueva = new Postulacion(req.body); // 
    await nueva.save();

    res.status(201).json({ message: "Oferta creada correctamente", data: nueva });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la oferta" });
  }
};



export const updatePostulacion = async (req, res) => {
  try {
    const { id } = req.params;
    const empresaId = req.user.id;

    const oferta = await Postulacion.findById(id);
    if (!oferta) return res.status(404).json({ error: "Oferta no encontrada" });

    if (oferta.empresaId.toString() !== empresaId)
      return res.status(403).json({ error: "No autorizado" });

    const actualizada = await Postulacion.findByIdAndUpdate(id, req.body, {
      new: true
    });

    res.json({ message: "Oferta actualizada", data: actualizada });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar la oferta" });
  }
};


export const deletePostulacion = async (req, res) => {
  try {
    const { id } = req.params;
    const empresaId = req.user.id;

    const oferta = await Postulacion.findById(id);
    if (!oferta) return res.status(404).json({ error: "Oferta no encontrada" });

    if (oferta.empresaId.toString() !== empresaId)
      return res.status(403).json({ error: "No autorizado" });

    await oferta.deleteOne();

    res.json({ message: "Oferta eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la oferta" });
  }
};


export const getMyPostulaciones = async (req, res) => {
  try {
    const empresaId = req.user.id;

    const ofertas = await Postulacion.find({ empresaId });

    res.json(ofertas);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las ofertas" });
  }
};


export const getAllPostulaciones = async (req, res) => {
  try {
    const filtros = {};

    if (req.query.modalidad) filtros.modalidad = req.query.modalidad;
    if (req.query.estado) filtros.estado = req.query.estado;
    if (req.query.provincia) filtros["lugar.provincia"] = req.query.provincia;

    const ofertas = await Postulacion.find(filtros)
      .populate("empresaId", "nombre email telefono");

    res.json(ofertas);
  } catch (error) {
    console.error("error get all post: ", error)
    res.status(500).json({ error: "Error al obtener las ofertas" });
  }
};



export const getPostulacionById = async (req, res) => {
  try {
    const { id } = req.params;

    const oferta = await Postulacion.findById(id)
      .populate("empresaId", "nombre email telefono");

    if (!oferta) return res.status(404).json({ error: "Oferta no encontrada" });

    res.json(oferta);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la oferta" });
  }
};
