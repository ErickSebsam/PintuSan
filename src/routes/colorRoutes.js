import { Router } from "express";
import {
  obtenerColores,
  obtenerColecciones,
  obtenerColorPorCodigo,
} from "../controllers/colorController.js";
import { cacheControl } from "../middlewares/cacheControl.js";

const router = Router();

// Aplica cabeceras de caché HTTP para lecturas públicas de colores (120s cliente, 600s CDN)
router.use(cacheControl(120, 600));

router.get("/", obtenerColores);
router.get("/colecciones", obtenerColecciones);
router.get("/:codigo", obtenerColorPorCodigo);

export default router;
