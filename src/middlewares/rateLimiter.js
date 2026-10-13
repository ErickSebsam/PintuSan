import rateLimit from "express-rate-limit";

/**
 * Limitador estricto para rutas de autenticación (login).
 * Mitiga ataques de fuerza bruta y relleno de credenciales.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // Máximo 10 peticiones por ventana
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Demasiados intentos de inicio de sesión desde esta IP. Intenta nuevamente en 15 minutos.",
  },
});

/**
 * Limitador general para el tráfico de la API pública.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300, // Máximo 300 peticiones por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Límite de solicitudes excedido. Por favor intenta más tarde.",
  },
});
