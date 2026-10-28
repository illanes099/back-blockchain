import { Router } from "express";

import {
  createInfraestructura,
  deleteInfraestructura,
  getInfraestructura,
  updateInfraestructura,
} from "../controllers/infraestructura.controllers.js";

const router = Router();

router.get("/infraestructura", getInfraestructura);

router.post("/infraestructura", createInfraestructura);

router.delete("/infraestructura/:id", deleteInfraestructura);

router.put("/infraestructura/:id", updateInfraestructura);

export default router;
