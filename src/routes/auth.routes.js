import { Router } from "express";
import { login } from "../controllers/auth.controller.js";
import { verificarToken } from "../middleawares/auth.middleware.js";

const router = Router();

router.post("/login", login);

// Ejemplo de ruta protegida
router.get("/perfil", verificarToken, (req, res) => {
  res.json({ message: "Bienvenido al perfil", usuario: req.user });
});

export default router;
