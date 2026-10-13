import { Router } from "express";
import mongoose from "mongoose";
import productoRoutes from "./productoRoutes.js";
import colorRoutes from "./colorRoutes.js";
import ajustesRoutes from "./ajustesRoutes.js";
import calculadoraRoutes from "./calculadoraRoutes.js";
import authRoutes from "./authRoutes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    api: "PintuSan",
    db: mongoose.connection.readyState === 1 ? "conectada" : "desconectada",
    uptime: Math.round(process.uptime()),
  });
});

router.use("/productos", productoRoutes);
router.use("/colores", colorRoutes);
router.use("/ajustes", ajustesRoutes);
router.use("/calculadora", calculadoraRoutes);
router.use("/auth", authRoutes);

export default router;
