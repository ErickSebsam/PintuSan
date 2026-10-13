import { Router } from "express";
import { obtenerAjustesPublicos } from "../controllers/ajustesController.js";
import { cacheControl } from "../middlewares/cacheControl.js";

const router = Router();

// Cache para ajustes públicos de la tienda (60s cliente, 300s CDN)
router.use(cacheControl(60, 300));

router.get("/", obtenerAjustesPublicos);

export default router;
