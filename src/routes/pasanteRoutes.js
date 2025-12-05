import { Router } from "express";
import { PasanteController } from "../controllers/PasanteController.js";
import { authenticate, isPasante } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { updatePasanteSchema } from "../schemas/validation.js";
import upload from "../middlewares/multerConfig.js";
const router = Router();

// Rutas públicas
router.get("/", PasanteController.getAllPasantes);

// Favoritos de pasantías (solo pasantes)
router.post(
  "/favoritos/:pasantiaId",
  authenticate,
  isPasante,
  PasanteController.addFavorito
);

router.delete(
  "/favoritos/:pasantiaId",
  authenticate,
  isPasante,
  PasanteController.removeFavorito
);

router.get(
  "/favoritos",
  // authenticate,
  // isPasante,
  PasanteController.getMyFavoritos
);
router.get("/pasantes", PasanteController.getAllPasantes);
router.get("/pasantes/:id", PasanteController.getPasanteById);

// Rutas protegidas (requieren autenticación y ser pasante)
router.get(
    "/profile/me", 
    authenticate, 
    isPasante, 
    PasanteController.getMyProfile
);

// --- RUTAS DE ARCHIVOS (NUEVAS) ---
// El string 'fotoPerfil' debe coincidir con el name del input en el Frontend
router.post(
    "/upload-foto", 
    authenticate, 
    isPasante, 
    upload.single('fotoPerfil'), 
    PasanteController.uploadFotoPerfil
);

// El string 'cv' debe coincidir con el name del input en el Frontend
router.post(
    "/upload-cv", 
    authenticate, 
    isPasante, 
    upload.single('cv'), 
    PasanteController.uploadCV
);
// --------------------------------

router.put(
    "/profile/me", 
    authenticate, 
    isPasante,
    validate(updatePasanteSchema),
    PasanteController.updateMyProfile
);

router.delete(
    "/profile/me", 
    authenticate, 
    isPasante, 
    PasanteController.deleteMyAccount
);

router.get("/:id", PasanteController.getPasanteById);
export default router;