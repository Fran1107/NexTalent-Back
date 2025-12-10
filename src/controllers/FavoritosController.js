import Pasante from "../models/Pasante.js";

export const toggleFavorito = async (req, res) => {
  try {
    const pasanteId = req.user?.id;
    const { postulacionId } = req.params;

    if (!pasanteId || !postulacionId) {
      return res.status(400).json({ message: "IDs inválidos" });
    }

    const pasante = await Pasante.findById(pasanteId);
    if (!pasante) return res.status(404).json({ message: "Pasante no encontrado" });

    const index = pasante.favoritos.findIndex(f => f.toString() === postulacionId);
    if (index >= 0) {
      // Ya estaba, quitar
      pasante.favoritos.splice(index, 1);
    } else {
      // Agregar
      pasante.favoritos.push(postulacionId);
    }

    await pasante.save();

    return res.json({ favoritos: pasante.favoritos });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error interno" });
  }
};
