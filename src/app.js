import express from "express";
import helmet from "helmet";
import { configurarCors } from "./middlewares/corsConfig.js";
import { apiLimiter } from "./middlewares/rateLimiter.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Seguridad HTTP headers con Helmet
app.use(helmet());

// Control de acceso y orígenes CORS
app.use(configurarCors());

// Límite de carga en peticiones JSON
app.use(express.json({ limit: "100kb" }));

// Rutas de la API v1 con limitador general de peticiones
app.use("/api/v1", apiLimiter, routes);

// Manejo central de 404 y errores
app.use(notFound);
app.use(errorHandler);

export default app;

