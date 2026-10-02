import { Router } from "express";
import mongoose from "mongoose";

const router = Router();

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    api: "PintuSan",
    db: mongoose.connection.readyState === 1 ? "conectada" : "desconectada",
    uptime: Math.round(process.uptime()),
  });
});

export default router;
