import Ajustes from "../models/Ajustes.js";

/**
 * GET /api/v1/ajustes
 * Retorna los ajustes generales públicos del negocio (WhatsApp, medios de pago, avisos legales, datos institucionales).
 */
export async function obtenerAjustesPublicos(req, res) {
  const ajustes = await Ajustes.obtenerAjustes();

  res.json({
    whatsapp: ajustes.whatsapp,
    pagos: ajustes.pagos,
    avisos: ajustes.avisos,
    guiaDilucion: ajustes.guiaDilucion,
    calculadora: ajustes.calculadora,
    institucional: ajustes.institucional,
  });
}
