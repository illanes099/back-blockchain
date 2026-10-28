import { Router } from "express";

import {
  createBoletin,
  deleteBoletin,
  getBoletines,
  getBoletin1,
  updateBoletin,
} from "../controllers/boletines.controllers.js";

const router = Router();

router.get("/boletines", getBoletines);
router.get("/boletines/:id", getBoletin1);
router.post("/boletines", createBoletin);
router.put("/boletines/:id", updateBoletin);
router.delete("/boletines/:id", deleteBoletin);

export default router;
