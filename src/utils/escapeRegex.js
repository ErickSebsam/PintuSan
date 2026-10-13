/**
 * Escapa caracteres especiales de expresiones regulares para evitar errores de sintaxis
 * y prevenir ataques ReDoS en consultas regex hacia MongoDB.
 *
 * @param {string} text
 * @returns {string}
 */
export function escapeRegex(text) {
  if (typeof text !== "string") return "";
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
