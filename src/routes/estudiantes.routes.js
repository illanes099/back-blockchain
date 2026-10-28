import { Router } from "express";

import {
  createestudiante,
  deleteestudiante,
  getestudianteById,
  getestudiantes,
  updateestudiante,
} from "../controllers/estudiantes.controller.js";

const router = Router();

router.get("/estudiantes", getestudiantes);
router.get("/estudiantes/:id", getestudianteById);

router.post("/estudiantes", createestudiante);

router.delete("/estudiantes/:id", deleteestudiante);

router.put("/estudiantes/:id", updateestudiante);

export default router;
