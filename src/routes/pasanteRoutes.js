import { Router } from "express";
import { PasanteController } from "../controllers/PasanteController.js";
import { authenticate, isPasante } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { updatePasanteSchema } from "../schemas/validation.js";

const router = Router();

// Rutas públicas
router.get("/", PasanteController.getAllPasantes);
router.get("/:id", PasanteController.getPasanteById);

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
  "/favoritos/my",
  authenticate,
  isPasante,
  PasanteController.getMyFavoritos
);

// Rutas protegidas (requieren autenticación y ser pasante)
router.get(
    "/profile/me", 
    authenticate, 
    isPasante, 
    PasanteController.getMyProfile
);

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

export default router;