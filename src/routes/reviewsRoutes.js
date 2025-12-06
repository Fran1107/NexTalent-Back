//###MODELO PARA RESENA SEGUN FUNCIONALIDAD 5
// import { Router } from "express";
// import {createResena,getResenasByEmpresa, updateResena, deleteResena} from "../controllers/ResenaController.js";
// import { authenticate, isPasante } from "../middlewares/auth.js";
// import { validate } from "../middlewares/validate.js";
// import { crearResenaSchema, actualizarResenaSchema} from "../schemas/validation.js";
// //Obtener reseñas de una empresa (público)
// router.get("/empresa/:empresaId", getResenasByEmpresa);

// // Crear reseña (solo pasantes)
// router.post(
//   "/",
//   authenticate,
//   isPasante,
//   validate(crearResenaSchema),
//   createResena
// );

// // Editar reseña propia
// router.put(
//   "/:id",
//   authenticate,
//   isPasante,
//   validate(actualizarResenaSchema), 
//   updateResena
// );

// // Borrar reseña propia
// router.delete(
//   "/:id",
//   authenticate,
//   isPasante,
//   deleteResena
// );

// export default router;


//### FUNCIONALIDAD MODIFICADA 


import express from "express";
import Review from "../model/Review.js";

const router = express.Router();

// Obtener todas las reseñas
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener reseñas', 
      error: error.message 
    });
  }
});

// Obtener reseñas destacadas (máximo 3)
router.get('/highlighted', async (req, res) => {
  try {
    const reviews = await Review.find({ isHighlighted: true })
      .sort({ rating: -1, createdAt: -1 })
      .limit(3);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener reseñas destacadas', 
      error: error.message 
    });
  }
});

// Crear una nueva reseña
router.post('/', async (req, res) => {
  try {
    const { name, role, comment, rating } = req.body;

    const newReview = new Review({
      name,
      role: role || 'Full Stack Developer',
      comment,
      rating
    });

    const savedReview = await newReview.save();
    res.status(201).json({
      message: 'Reseña creada exitosamente',
      review: savedReview
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Error de validación',
        errors: Object.values(error.errors).map(e => e.message)
      });
    }
    res.status(500).json({ 
      message: 'Error al crear reseña', 
      error: error.message 
    });
  }
});

// Actualizar estado destacado
router.patch('/:id/highlight', async (req, res) => {
  try {
    const { id } = req.params;
    const { isHighlighted } = req.body;

    const review = await Review.findByIdAndUpdate(
      id,
      { isHighlighted },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    res.json(review);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al actualizar reseña', 
      error: error.message 
    });
  }
});

// Eliminar reseña
router.delete('/:id', async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    
    if (!review) {
      return res.status(404).json({ message: 'Reseña no encontrada' });
    }

    res.json({ message: 'Reseña eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al eliminar reseña', 
      error: error.message 
    });
  }
});

export default router;