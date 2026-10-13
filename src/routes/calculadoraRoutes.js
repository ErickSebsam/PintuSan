import { Router } from "express";
import {
  obtenerParametrosCalculadora,
  calcularRendimiento,
} from "../controllers/calculadoraController.js";
import { cacheControl } from "../middlewares/cacheControl.js";

const router = Router();

// Parámetros estáticos pueden cachearse
router.get("/", cacheControl(300, 600), obtenerParametrosCalculadora);

// Cálculo interactivo de rendimiento (soporta tanto GET con query params como POST con JSON)
router.get("/calcular", calcularRendimiento);
router.post("/calcular", calcularRendimiento);

export default router;
