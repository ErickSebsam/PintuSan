import mongoose from "mongoose";
import Producto from "../models/Producto.js";
import { AppError } from "../utils/AppError.js";
import { escapeRegex } from "../utils/escapeRegex.js";

/**
 * GET /api/v1/productos
 * Catálogo público de productos con filtros, buscador en tiempo real y paginación.
 */
export async function obtenerProductos(req, res) {
  const {
    q,
    categoria,
    marca,
    esMarcaPropia,
    linea,
    permitePreparacion,
    destacado,
    medida,
    page = 1,
    limit = 20,
    sort = "orden",
  } = req.query;

  const filtro = { disponible: true };

  // Filtro por categoría (RF-03)
  if (categoria) {
    filtro.categoria = categoria.trim();
  }

  // Filtro por marca
  if (marca) {
    const marcaSegura = escapeRegex(marca.trim());
    filtro.marca = { $regex: new RegExp(`^${marcaSegura}$`, "i") };
  }

  // Filtro por marca propia PintuSan (RF-01, RF-10)
  if (esMarcaPropia !== undefined) {
    filtro.esMarcaPropia = esMarcaPropia === "true" || esMarcaPropia === true;
  }

  // Línea de la marca propia (Tipo 1, Tipo 2, Coraza)
  if (linea) {
    filtro.linea = linea.trim();
  }

  // Filtro por productos preparados / tinturables (RF-05)
  if (permitePreparacion !== undefined) {
    filtro.permitePreparacion = permitePreparacion === "true" || permitePreparacion === true;
  }

  // Filtro por destacados (RF-01)
  if (destacado !== undefined) {
    filtro.destacado = destacado === "true" || destacado === true;
  }

  // Filtro por medida disponible en sus variantes (RF-02)
  if (medida) {
    const medidaSegura = escapeRegex(medida.trim());
    filtro["variantes.medida"] = { $regex: new RegExp(medidaSegura, "i") };
  }

  // Buscador en tiempo real por término (RF-04)
  if (q && q.trim()) {
    const termino = escapeRegex(q.trim());
    filtro.$or = [
      { nombre: { $regex: termino, $options: "i" } },
      { descripcion: { $regex: termino, $options: "i" } },
      { marca: { $regex: termino, $options: "i" } },
      { categoria: { $regex: termino, $options: "i" } },
      { "variantes.medida": { $regex: termino, $options: "i" } },
      { "variantes.etiqueta": { $regex: termino, $options: "i" } },
    ];
  }

  // Criterios de ordenamiento
  let ordenCriterio = { orden: 1, destacado: -1, nombre: 1 };
  if (sort === "nombre_asc") ordenCriterio = { nombre: 1 };
  if (sort === "nombre_desc") ordenCriterio = { nombre: -1 };
  if (sort === "recientes") ordenCriterio = { createdAt: -1 };
  if (sort === "precio_asc") ordenCriterio = { "variantes.0.precio": 1 };
  if (sort === "precio_desc") ordenCriterio = { "variantes.0.precio": -1 };

  const numPage = Math.max(1, parseInt(page, 10) || 1);
  const numLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (numPage - 1) * numLimit;

  const [productos, total] = await Promise.all([
    Producto.find(filtro).sort(ordenCriterio).skip(skip).limit(numLimit).lean(),
    Producto.countDocuments(filtro),
  ]);

  res.json({
    total,
    pagina: numPage,
    limite: numLimit,
    totalPaginas: Math.ceil(total / numLimit),
    productos,
  });
}

/**
 * GET /api/v1/productos/destacados
 * Productos destacados para el Home / Hero de la tienda (PintuSan y ofertas estrella).
 */
export async function obtenerDestacados(req, res) {
  const productos = await Producto.find({
    destacado: true,
    disponible: true,
  })
    .sort({ orden: 1, createdAt: -1 })
    .limit(10)
    .lean();

  res.json({
    total: productos.length,
    productos,
  });
}

/**
 * GET /api/v1/productos/categorias
 * Lista de categorías con el número de productos disponibles en cada una.
 */
export async function obtenerCategorias(req, res) {
  const categorias = await Producto.aggregate([
    { $match: { disponible: true } },
    {
      $group: {
        _id: "$categoria",
        totalProductos: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    categorias: categorias.map((c) => ({
      nombre: c._id,
      totalProductos: c.totalProductos,
    })),
  });
}

/**
 * GET /api/v1/productos/:slug
 * Detalle completo de un producto con sus variantes de fracciones y precios.
 */
export async function obtenerProductoPorSlug(req, res) {
  const { slug } = req.params;

  let producto = await Producto.findOne({ slug, disponible: true }).lean();

  // Si no se encuentra por slug y el parámetro es un ObjectId válido, intenta buscar por _id
  if (!producto && mongoose.Types.ObjectId.isValid(slug)) {
    producto = await Producto.findOne({ _id: slug, disponible: true }).lean();
  }

  if (!producto) {
    throw new AppError(404, `Producto "${slug}" no encontrado`);
  }

  res.json(producto);
}
