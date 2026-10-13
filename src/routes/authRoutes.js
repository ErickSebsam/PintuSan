import { Router } from "express";
import {
  login,
  obtenerPerfil,
  cambiarPassword,
} from "../controllers/authController.js";
import { requireAuth } from "../middlewares/auth.js";
import { authLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// Endpoint público protegido con rate limiter contra ataques de fuerza bruta
router.post("/login", authLimiter, login);

// Endpoints protegidos que requieren token JWT válido
router.get("/perfil", requireAuth, obtenerPerfil);
router.put("/cambiar-password", requireAuth, cambiarPassword);

export default router;
