import { Router } from "express";
import {
  certificarBoletin,
  verificarHashPublico,
} from "../controllers/blockchain.controller.js";

const router = Router();

router.post("/certificar", certificarBoletin);

router.get("/verificar", verificarHashPublico);

export default router;
