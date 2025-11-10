// Importamos Router de Express para crear un conjunto modular de rutas
import { Router } from "express";

// Importamos el controlador que maneja toda la lógica relacionada con las empresas
import { EmpresaController } from "../controllers/EmpresaController.js";

// Importamos middlewares de autenticación
// - authenticate → verifica el token JWT y añade el usuario al request
// - isEmpresa → asegura que el tipo de usuario sea "empresa"
import { authenticate, isEmpresa } from "../middlewares/auth.js";

// Middleware para validar el cuerpo del request según un esquema Zod
import { validate } from "../middlewares/validate.js";

// Esquema de validación para actualizar el perfil de la empresa
import { updateEmpresaSchema } from "../schemas/validation.js";

// Creamos una nueva instancia de Router para agrupar todas las rutas relacionadas con "Empresa"
const router = Router();

// =========================
// 🌐 RUTAS PÚBLICAS
// =========================

// Obtener todas las empresas
// - No requiere autenticación
// - Ideal para mostrar en un listado público
router.get("/", EmpresaController.getAllEmpresas);

// Obtener una empresa por ID
// - También es pública, por si se necesita mostrar el perfil de una empresa específica
router.get("/:id", EmpresaController.getEmpresaById);

// =========================
// RUTAS PROTEGIDAS (solo empresa autenticada)
// =========================

// Obtener perfil de la empresa logueada
// 1️⃣ authenticate → valida el token JWT
// 2️⃣ isEmpresa → verifica que el usuario sea de tipo "empresa"
// 3️⃣ EmpresaController.getMyProfile → devuelve los datos de la empresa asociada al usuario logueado
router.get(
    "/profile/me", 
    authenticate, 
    isEmpresa, 
    EmpresaController.getMyProfile
);

// Actualizar perfil de la empresa logueada
// 1️⃣ authenticate → valida el token JWT
// 2️⃣ isEmpresa → asegura que sea una empresa
// 3️⃣ validate(updateEmpresaSchema) → valida el cuerpo del request (campos actualizados)
// 4️⃣ EmpresaController.updateMyProfile → actualiza los datos en la base
router.put(
    "/profile/me", 
    authenticate, 
    isEmpresa,
    validate(updateEmpresaSchema),
    EmpresaController.updateMyProfile
);

// Eliminar cuenta de empresa
// 1️⃣ authenticate → valida el token JWT
// 2️⃣ isEmpresa → verifica que sea una empresa
// 3️⃣ EmpresaController.deleteMyAccount → elimina tanto el perfil de empresa como el usuario base
router.delete(
    "/profile/me", 
    authenticate, 
    isEmpresa, 
    EmpresaController.deleteMyAccount
);

// Exportamos el router para ser utilizado en app.js o el index de rutas
export default router;
