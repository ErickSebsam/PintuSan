/**
 * Middleware para configurar encabezados Cache-Control en respuestas públicas de lectura.
 * Permite que navegadores y el Edge Cache de Vercel sirvan respuestas ultra rápidas (< 2s).
 * 
 * @param {number} maxAgeSegundos - Segundos para caché local en el navegador del cliente (por defecto 60s).
 * @param {number} sMaxAgeSegundos - Segundos para caché compartido/CDN de Vercel (por defecto 300s).
 */
export function cacheControl(maxAgeSegundos = 60, sMaxAgeSegundos = 300) {
  return (req, res, next) => {
    if (req.method === "GET") {
      res.set(
        "Cache-Control",
        `public, max-age=${maxAgeSegundos}, s-maxage=${sMaxAgeSegundos}, stale-while-revalidate=600`
      );
    }
    next();
  };
}
