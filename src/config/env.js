// Se importa PRIMERO en todo el proyecto: carga .env y valida las variables.
import "dotenv/config";

const required = ["MONGODB_URI"];
if (process.env.NODE_ENV === "production") {
  required.push("JWT_SECRET");
}

const missing = required.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Faltan variables en .env: ${missing.join(", ")}`);
  process.exit(1); // falla rápido: mejor caer al arrancar que a mitad de una petición
}

export const env = {
  PORT: process.env.PORT || 4500,
  MONGODB_URI: process.env.MONGODB_URI,
  NODE_ENV: process.env.NODE_ENV || "development",
  isProd: process.env.NODE_ENV === "production",
  JWT_SECRET: process.env.JWT_SECRET || "pintusan-dev-jwt-secret-seguro-2026",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  FRONTEND_URL: process.env.FRONTEND_URL || "",
};

