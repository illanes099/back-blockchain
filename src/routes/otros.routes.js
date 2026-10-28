import { Router } from "express";

import {
  createOtros,
  deleteOtros,
  getOtros,
  updateOtros,
} from "../controllers/otros.controllers.js";

const router = Router();

router.get("/otros", getOtros);

router.post("/otros", createOtros);

router.delete("/otros/:id", deleteOtros);

router.put("/otros/:id", updateOtros);

export default router;
