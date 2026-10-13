import Admin from "../models/Admin.js";
import { AppError } from "../utils/AppError.js";
import { verificarToken } from "../utils/jwt.js";

/**
 * Middleware para proteger rutas que requieren autenticación de administrador.
 * Extrae y valida el JWT enviado en la cabecera "Authorization: Bearer <token>".
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new AppError(401, "No autorizado. Token de autenticación requerido");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = verificarToken(token);
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      throw new AppError(401, "La sesión ha expirado. Por favor ingresa nuevamente");
    }
    throw new AppError(401, "Token de autenticación no válido");
  }

  const admin = await Admin.findById(decoded.id);

  if (!admin) {
    throw new AppError(401, "El usuario administrador ya no existe");
  }

  if (!admin.activo) {
    throw new AppError(403, "Tu cuenta de administrador ha sido desactivada");
  }

  req.admin = admin;
  next();
}

/**
 * Middleware para restringir rutas por rol específico (ej. "superadmin").
 * Debe usarse después de requireAuth.
 * @param  {...string} rolesPermitidos - Lista de roles con permiso
 */
export function requireRol(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.admin) {
      throw new AppError(401, "Autenticación requerida antes de verificar roles");
    }

    if (!rolesPermitidos.includes(req.admin.rol)) {
      throw new AppError(
        403,
        `Acceso restringido: se requiere rol de ${rolesPermitidos.join(" o ")}`
      );
    }

    next();
  };
}
