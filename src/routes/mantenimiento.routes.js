import { Router } from "express";

import {
  createMantenimientos,
  deleteMantenimientos,
  getMantenimiento,
  getMantenimientos,
  updateMantenimientos,
} from "../controllers/mantenimiento.controllers.js";

const router = Router();

router.get("/mantenimientos", getMantenimientos);

router.get("/mantenimientos/:id", getMantenimiento);

router.post("/mantenimientos", createMantenimientos);

router.delete("/mantenimientos/:id", deleteMantenimientos);

router.put("/mantenimientos/:id", updateMantenimientos);

export default router;
