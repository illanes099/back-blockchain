import { Router } from "express";

import {
  createMateria,
  deleteMateria,
  getMaterias,
  getMateria1,
  updateMateria,
  getMateriaUsername,
} from "../controllers/materias.controllers.js";

const router = Router();

router.get("/materias", getMaterias);
router.get("/materias/:id", getMateria1);
router.post("/materias", createMateria);
router.put("/materias/:id", updateMateria);
router.delete("/materias/:id", deleteMateria);
router.get("/materiasUsername", getMateriaUsername);

export default router;
