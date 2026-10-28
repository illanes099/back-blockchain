import { Router } from "express";
import {
  getVistaProfesores,
 
} from "../controllers/profesores.controllers.js";


const router = Router();

router.get("/vista_prof", getVistaProfesores);

export default router;
