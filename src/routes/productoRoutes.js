import { Router } from "express";
import {
  obtenerProductos,
  obtenerDestacados,
  obtenerCategorias,
  obtenerProductoPorSlug,
} from "../controllers/productoController.js";
import { cacheControl } from "../middlewares/cacheControl.js";

const router = Router();

// Aplica cabeceras de caché HTTP para lecturas públicas (60s cliente, 300s edge CDN)
router.use(cacheControl(60, 300));

router.get("/", obtenerProductos);
router.get("/destacados", obtenerDestacados);
router.get("/categorias", obtenerCategorias);
router.get("/:slug", obtenerProductoPorSlug);

export default router;
