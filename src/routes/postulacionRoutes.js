import express from "express";
import { authenticate, isEmpresa } from "../middlewares/auth.js";
import {
  createPostulacion,
  updatePostulacion,
  deletePostulacion,
  getMyPostulaciones,
  getAllPostulaciones,
  getPostulacionById
} from "../controllers/PostulacionController.js";

const router = express.Router();


router.get("/", getAllPostulaciones);
router.get("/empresa/mine", authenticate, isEmpresa, getMyPostulaciones);

router.get("/:id", getPostulacionById);

router.post("/create", createPostulacion);

router.put("/:id", authenticate, isEmpresa, updatePostulacion);
router.delete("/:id", authenticate, isEmpresa, deletePostulacion);

router.get("/test", (req, res) => res.json({ ok: true, msg: "postulaciones router ok" }));


export default router;
