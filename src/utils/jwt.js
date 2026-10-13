import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

/**
 * Genera un token JWT firmado para la sesión de un administrador.
 * @param {object} payload - Información a incluir en el token (id, email, rol)
 * @returns {string} Token firmado
 */
export function generarToken(payload) {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

/**
 * Verifica y decodifica un token JWT.
 * @param {string} token - Token recibido en la cabecera Authorization
 * @returns {object} Payload decodificado
 */
export function verificarToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}
