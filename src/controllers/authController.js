import Admin from "../models/Admin.js";
import { AppError } from "../utils/AppError.js";
import { generarToken } from "../utils/jwt.js";

/**
 * POST /api/v1/auth/login
 * Autentica al administrador con email y contraseña, generando un token JWT de sesión.
 */
export async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new AppError(400, "El correo electrónico y la contraseña son obligatorios");
  }

  const emailLimpio = String(email).trim().toLowerCase();

  // Buscar admin incluyendo el campo password explícitamente
  const admin = await Admin.findOne({ email: emailLimpio }).select("+password");

  if (!admin) {
    throw new AppError(401, "Credenciales incorrectas");
  }

  if (!admin.activo) {
    throw new AppError(403, "Esta cuenta de administrador se encuentra desactivada");
  }

  const passwordValido = await admin.compararPassword(password);
  if (!passwordValido) {
    throw new AppError(401, "Credenciales incorrectas");
  }

  // Actualizar marca de último acceso
  admin.ultimoAcceso = new Date();
  await admin.save();

  const token = generarToken({
    id: admin._id,
    email: admin.email,
    rol: admin.rol,
  });

  res.json({
    token,
    admin: admin.toJSON(),
  });
}

/**
 * GET /api/v1/auth/perfil
 * Retorna los datos del administrador autenticado actualmente.
 */
export async function obtenerPerfil(req, res) {
  res.json({
    admin: req.admin.toJSON(),
  });
}

/**
 * PUT /api/v1/auth/cambiar-password
 * Permite al administrador autenticado actualizar su contraseña.
 */
export async function cambiarPassword(req, res) {
  const { passwordActual, passwordNuevo } = req.body || {};

  if (!passwordActual || !passwordNuevo) {
    throw new AppError(400, "Debe proporcionar la contraseña actual y la nueva contraseña");
  }

  if (String(passwordNuevo).length < 6) {
    throw new AppError(400, "La nueva contraseña debe tener al obligatorio al menos 6 caracteres");
  }

  const admin = await Admin.findById(req.admin._id).select("+password");
  if (!admin) {
    throw new AppError(404, "Administrador no encontrado");
  }

  const actualValido = await admin.compararPassword(passwordActual);
  if (!actualValido) {
    throw new AppError(401, "La contraseña actual no es correcta");
  }

  admin.password = passwordNuevo;
  await admin.save();

  res.json({
    mensaje: "Contraseña actualizada con éxito",
  });
}
