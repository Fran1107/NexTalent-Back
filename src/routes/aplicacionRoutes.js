import { Router } from "express";
import { AplicacionController } from "../controllers/AplicacionController.js";
import { authenticate, isPasante, isEmpresa } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { createAplicacionSchema, updateEstadoAplicacionSchema } from "../schemas/validation.js";

const router = Router();

// --- RUTAS DE PASANTE ---

// POST /api/aplicaciones -> Postularme
router.post(
    "/", 
    authenticate, 
    isPasante, 
    validate(createAplicacionSchema), 
    AplicacionController.createAplicacion
);

// GET /api/aplicaciones/my-history -> Ver Mis Postulaciones
router.get(
    "/my-history", 
    authenticate, 
    isPasante, 
    AplicacionController.getMyAplicaciones
);

// --- RUTAS DE EMPRESA ---

// GET /api/aplicaciones/postulacion/:postulacionId -> Ver candidatos de una oferta
router.get(
    "/postulacion/:postulacionId", 
    authenticate, 
    isEmpresa, 
    AplicacionController.getAplicacionesByPostulacion
);

// PATCH /api/aplicaciones/:id/status -> Aceptar/Rechazar candidato
router.patch(
    "/:id/status", 
    authenticate, 
    isEmpresa, 
    validate(updateEstadoAplicacionSchema), 
    AplicacionController.updateAplicacionStatus
);

export default router;