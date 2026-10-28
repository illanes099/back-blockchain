import { Router } from "express";

import {
  createGrupo,
  deleteGroup,
  getGrupo,
  getGrupos,
  updateGroup,
} from "../controllers/grupos.controllers.js";

const router = Router();

router.get("/grupo", getGrupos);

router.get("/grupo/:id", getGrupo);

router.post("/grupo", createGrupo);

router.delete("/grupo/:id", deleteGroup);

router.put("/grupo/:id", updateGroup);

export default router;
