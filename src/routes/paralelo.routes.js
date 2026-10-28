import { Router } from "express";

import {
  createParalelo,
  deleteParalelo,
  getParalelos,
  getParalelo1,
  updateParalelo,
} from "../controllers/paralelo.controllers.js";

const router = Router();

router.get("/paralelo", getParalelos);
router.get("/paralelo/:id", getParalelo1);

router.post("/paralelo", createParalelo);

router.delete("/paralelo/:id", deleteParalelo);

router.put("/paralelo/:id", updateParalelo);

export default router;
