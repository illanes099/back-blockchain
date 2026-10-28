import { Router } from "express";

import { getTipo } from "../controllers/tipo.controllers.js";


const router = Router();

router.get("/tipo", getTipo);


export default router;
