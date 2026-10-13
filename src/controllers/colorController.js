import mongoose from "mongoose";
import Color from "../models/Color.js";
import { AppError } from "../utils/AppError.js";
import { escapeRegex } from "../utils/escapeRegex.js";

/**
 * GET /api/v1/colores
 * Lista catálogo de colores para "Color a la Medida" con filtros y paginación.
 */
export async function obtenerColores(req, res) {
  const {
    q,
    coleccion,
    tipo,
    popular,
    page = 1,
    limit = 50,
    sort = "orden",
  } = req.query;

  const filtro = { disponible: true };

  // Filtro por colección
  if (coleccion) {
    filtro.coleccion = coleccion.trim();
  }

  // Filtro por tipo de pintura compatible (ej. Vinilo, Esmalte)
  if (tipo) {
    const tipoSeguro = escapeRegex(tipo.trim());
    filtro.tiposPermitidos = { $regex: new RegExp(`^${tipoSeguro}$`, "i") };
  }

  // Filtro por colores populares
  if (popular !== undefined) {
    filtro.popular = popular === "true" || popular === true;
  }

  // Búsqueda en tiempo real por texto / código / nombre
  if (q && q.trim()) {
    const termino = escapeRegex(q.trim());
    filtro.$or = [
      { codigo: { $regex: termino, $options: "i" } },
      { nombre: { $regex: termino, $options: "i" } },
      { coleccion: { $regex: termino, $options: "i" } },
    ];
  }

  // Opciones de orden
  let ordenCriterio = { orden: 1, nombre: 1 };
  if (sort === "nombre_asc") ordenCriterio = { nombre: 1 };
  if (sort === "nombre_desc") ordenCriterio = { nombre: -1 };
  if (sort === "recientes") ordenCriterio = { createdAt: -1 };

  const numPage = Math.max(1, parseInt(page, 10) || 1);
  const numLimit = Math.min(150, Math.max(1, parseInt(limit, 10) || 50));
  const skip = (numPage - 1) * numLimit;

  const [colores, total] = await Promise.all([
    Color.find(filtro).sort(ordenCriterio).skip(skip).limit(numLimit).lean(),
    Color.countDocuments(filtro),
  ]);

  res.json({
    total,
    pagina: numPage,
    limite: numLimit,
    totalPaginas: Math.ceil(total / numLimit),
    colores,
  });
}

/**
 * GET /api/v1/colores/colecciones
 * Retorna las colecciones o cartas de color disponibles con su conteo de tonos.
 */
export async function obtenerColecciones(req, res) {
  const colecciones = await Color.aggregate([
    { $match: { disponible: true } },
    {
      $group: {
        _id: "$coleccion",
        totalColores: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    colecciones: colecciones.map((c) => ({
      nombre: c._id,
      totalColores: c.totalColores,
    })),
  });
}

/**
 * GET /api/v1/colores/:codigo
 * Obtiene el detalle de un color por su código (ej. "#A45") o _id.
 */
export async function obtenerColorPorCodigo(req, res) {
  const { codigo } = req.params;

  let color = null;

  // Si tiene formato de ObjectId, intenta buscar por ID primero
  if (mongoose.Types.ObjectId.isValid(codigo)) {
    color = await Color.findOne({ _id: codigo, disponible: true }).lean();
  }

  // Si no se encontró por ID, busca por código exacto (mayúsculas o normalizado)
  if (!color) {
    const normalizado = codigo.trim().toUpperCase();
    color = await Color.findOne({
      $or: [{ codigo: normalizado }, { codigo: `#${normalizado.replace(/^#/, "")}` }],
      disponible: true,
    }).lean();
  }

  if (!color) {
    throw new AppError(404, `Color con código "${codigo}" no encontrado`);
  }

  res.json(color);
}
