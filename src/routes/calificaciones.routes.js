import { Router } from "express";

import {
  createCalificacion,
  deleteCalificacion,
  getCalificaciones,
  getCalificacion1,
  updateCalificacion,
  getCalificacionesMaterias,
} from "../controllers/calificaciones.controllers.js";

const router = Router();

router.get("/calificaciones", getCalificaciones);
router.get("/calificaciones/:id", getCalificacion1);
router.post("/calificaciones", createCalificacion);
router.put("/calificaciones/:id", updateCalificacion);
router.delete("/calificaciones/:id", deleteCalificacion);
router.get("/calificacionesMaterias", getCalificacionesMaterias);

export default router;
