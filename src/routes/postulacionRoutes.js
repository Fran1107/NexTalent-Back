import { Router } from "express"; // Nota: usa Router directamente si prefieres, o express.Router()
import { authenticate, isEmpresa } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js"; // Asegúrate de importar esto
import { createPostulacionSchema, updatePostulacionSchema } from "../schemas/validation.js"; // Y los schemas

// 👇 CAMBIO IMPORTANTE: Importamos la CLASE entera, no los métodos sueltos
import { PostulacionController } from "../controllers/PostulacionController.js";

const router = Router();


// --- RUTAS PÚBLICAS ---
router.get("/", PostulacionController.getAllPostulaciones);
router.get("/:id", PostulacionController.getPostulacionById);

// --- RUTAS PROTEGIDAS (EMPRESA) ---

// Crear oferta
router.post(
    "/", 
    authenticate, 
    isEmpresa, 
    validate(createPostulacionSchema), 
    PostulacionController.createPostulacion
);

// Ver mis ofertas (Dashboard)
router.get(
    "/dashboard/mis-ofertas", 
    authenticate, 
    isEmpresa, 
    PostulacionController.getMyPostulaciones
);

// Editar oferta
router.put(
    "/:id", 
    authenticate, 
    isEmpresa, 
    validate(updatePostulacionSchema), 
    PostulacionController.updatePostulacion
);

// Eliminar oferta
router.delete(
    "/:id", 
    authenticate, 
    isEmpresa, 
    PostulacionController.deletePostulacion
);

export default router;
