//MODELO DE ACUERDO A LA FUNCIONALIDAD 5

//import mongoose from "mongoose";

// const ResenaSchema = new mongoose.Schema({
//   empresaId: { type: mongoose.Schema.Types.ObjectId, ref: "Empresa", required: true },
//   pasanteId: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
//   rating: { type: Number, min: 1, max: 5, required: true },
//   titulo: { type: String, trim: true, maxlength: 100 },
//   comentario: { type: String, trim: true, required: true }
// }, { timestamps: true });

// export default mongoose.model("Resena", ResenaSchema);


// CAMBIOS EN LA FUNCIONALIDAD 5


import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre es requerido'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'El rol es requerido'],
    trim: true,
    default: 'Full Stack Developer'
  },
  comment: {
    type: String,
    required: [true, 'El comentario es requerido'],
    trim: true,
    minlength: [10, 'El comentario debe tener al menos 10 caracteres'],
    maxlength: [500, 'El comentario no puede exceder 500 caracteres']
  },
  rating: {
    type: Number,
    required: [true, 'La calificación es requerida'],
    min: [1, 'La calificación mínima es 1'],
    max: [5, 'La calificación máxima es 5']
  },
  isHighlighted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Review', reviewSchema);





