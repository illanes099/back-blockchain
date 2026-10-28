import { Router } from "express";
import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  getUsuarioById,
} from "../controllers/usuario.controllers.js";


const router = Router();

router.get("/usuarios", getUsuarios);
router.get("/usuarios/:id", getUsuarioById);
router.post("/usuarios", createUsuario);
router.put("/usuarios/:id", updateUsuario);
router.delete("/usuarios/:id", deleteUsuario);

export default router;
