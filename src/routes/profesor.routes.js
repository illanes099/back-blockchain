import { Router } from "express";
import {
  createProfesor,
  deleteProfesor,
  getProfesores,
  getProfesor,
  updateProfesor,
  getCalificacionesGeneral,
  getMateriasConProfesores,
} from "../controllers/profesor.controllers.js";

const router = Router();

router.get("/profesores", getProfesores);
router.get("/profesores/:id", getProfesor);
router.post("/profesores", createProfesor);
router.put("/profesores/:id", updateProfesor);
router.delete("/profesores/:id", deleteProfesor);
router.get("/profesoresGeneralEstudiantes", getCalificacionesGeneral);
router.get("/profesoresMaterias", getMateriasConProfesores);

export default router;