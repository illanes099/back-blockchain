import { Router } from "express";
import {
  createDirector,
  deleteDirector,
  getDirector,
  getDirector1,
  updateDirector,
} from "../controllers/director.controller.js";

const router = Router();

router.get("/director", getDirector);
router.get("/director/:id", getDirector1);
router.post("/director", createDirector);
router.put("/director/:id", updateDirector);
router.delete("/director/:id", deleteDirector);

export default router;
