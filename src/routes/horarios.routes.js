import { Router } from "express";

import {
  createHorario,
  deleteHorario,
  getHorarios,
  getHorariosByEstudianteId,
  updateHorario,
} from "../controllers/horario.controller.js";

const router = Router();

router.get("/horarios", getHorarios);

router.get("/horarios/estudiante/:estudiante_id", getHorariosByEstudianteId);

router.post("/horarios", createHorario);

router.put("/horarios/:id", updateHorario);

router.delete("/horarios/:id", deleteHorario);

export default router;


