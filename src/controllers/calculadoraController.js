import Ajustes from "../models/Ajustes.js";
import { calcularRendimientoPintuSan } from "../services/calculadoraService.js";

/**
 * GET /api/v1/calculadora
 * Retorna los parámetros base de rendimiento por línea y la guía técnica de dilución.
 */
export async function obtenerParametrosCalculadora(req, res) {
  const ajustes = await Ajustes.obtenerAjustes();

  res.json({
    calculadora: ajustes.calculadora,
    guiaDilucion: ajustes.guiaDilucion,
    mensaje: "Consulta parámetros de rendimiento sin compromiso de compra",
  });
}

/**
 * POST o GET /api/v1/calculadora/calcular
 * Calcula la cantidad de pintura requerida según m2, número de manos y línea opcional.
 */
export async function calcularRendimiento(req, res) {
  const params = {
    m2: req.body?.m2 ?? req.query?.m2,
    manos: req.body?.manos ?? req.query?.manos ?? 2,
    linea: req.body?.linea ?? req.query?.linea ?? null,
  };

  const resultado = await calcularRendimientoPintuSan(params);
  res.json(resultado);
}
