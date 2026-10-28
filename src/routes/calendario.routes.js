import { Router } from "express";

import {
  createCalendario,
  deleteCalendario,
  getCalendario,
  getCalendario1,
  updateCalendario,
} from "../controllers/calendario.controllers.js";

const router = Router();

router.get("/calendario", getCalendario);
router.get("/calendario/:id", getCalendario1);

router.post("/calendario", createCalendario);

router.delete("/calendario/:id", deleteCalendario);

router.put("/calendario/:id", updateCalendario);

export default router;
