import { Router } from "express";

import {
  createEncargado,
  deleteEncargado,
  getEncargado,
  getEncargado1,
  updateEncargado,
} from "../controllers/encargado.controllers.js";

const router = Router();

router.get("/encargado", getEncargado);
router.get("/encargado/:id", getEncargado1);

router.post("/encargado", createEncargado);

router.delete("/encargado/:id", deleteEncargado);

router.put("/encargado/:id", updateEncargado);

export default router;
