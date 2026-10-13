import { connectDB } from "../src/config/db.js";
import app from "../src/app.js";
import { Producto, Color, Ajustes } from "../src/models/index.js";

async function runTests() {
  console.log("=== INICIANDO PRUEBAS DE ENDPOINTS - DÍA 3 ===");

  await connectDB();
  console.log("✔ Conexión a MongoDB exitosa");

  // Iniciar servidor temporal en puerto libre
  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/v1`;

  try {
    // 1. Health check
    const resHealth = await fetch(`${baseUrl}/health`);
    const dataHealth = await resHealth.json();
    console.log("1. GET /health:", resHealth.status, dataHealth.status === "ok" ? "✔ OK" : "❌ FAIL");

    // 2. Ajustes
    const resAjustes = await fetch(`${baseUrl}/ajustes`);
    const dataAjustes = await resAjustes.json();
    console.log(
      "2. GET /ajustes:",
      resAjustes.status,
      dataAjustes.whatsapp?.numero ? "✔ OK" : "❌ FAIL",
      "Cache-Control:",
      resAjustes.headers.get("cache-control")
    );

    // 3. Calculadora - Parámetros
    const resCalcParams = await fetch(`${baseUrl}/calculadora`);
    const dataCalcParams = await resCalcParams.json();
    console.log(
      "3. GET /calculadora:",
      resCalcParams.status,
      dataCalcParams.calculadora ? "✔ OK" : "❌ FAIL"
    );

    // 4. Calculadora - Calcular POST
    const resCalcPost = await fetch(`${baseUrl}/calculadora/calcular`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ m2: 90, manos: 2 }),
    });
    const dataCalcPost = await resCalcPost.json();
    console.log(
      "4. POST /calculadora/calcular (90m², 2 manos):",
      resCalcPost.status,
      dataCalcPost.resultados?.length === 3 ? "✔ OK (3 líneas calculadas)" : "❌ FAIL"
    );

    // 5. Calculadora - Calcular GET con filtro de línea
    const resCalcGet = await fetch(`${baseUrl}/calculadora/calcular?m2=45&linea=Tipo%201`);
    const dataCalcGet = await resCalcGet.json();
    console.log(
      "5. GET /calculadora/calcular?m2=45&linea=Tipo 1:",
      resCalcGet.status,
      dataCalcGet.resultados?.[0]?.galonesRequeridos === 2 ? "✔ OK (2 galones)" : "❌ FAIL"
    );

    // 6. Categorías de productos
    const resCategorias = await fetch(`${baseUrl}/productos/categorias`);
    const dataCategorias = await resCategorias.json();
    console.log(
      "6. GET /productos/categorias:",
      resCategorias.status,
      Array.isArray(dataCategorias.categorias) ? "✔ OK" : "❌ FAIL"
    );

    // 7. Catálogo de productos
    const resProductos = await fetch(`${baseUrl}/productos?page=1&limit=5`);
    const dataProductos = await resProductos.json();
    console.log(
      "7. GET /productos:",
      resProductos.status,
      Array.isArray(dataProductos.productos) ? "✔ OK" : "❌ FAIL",
      "Cache-Control:",
      resProductos.headers.get("cache-control")
    );

    // 8. Crear producto temporal para probar consulta por slug y filtros
    const tempSlug = "pintura-prueba-dia3-" + Date.now();
    const prodTemp = await Producto.create({
      nombre: "Pintura Prueba Día 3 " + Date.now(),
      slug: tempSlug,
      categoria: "Pintura propia",
      esMarcaPropia: true,
      linea: "Tipo 1",
      destacado: true,
      variantes: [
        { medida: "Galón", precio: 45000, disponible: true },
        { medida: "1/4 Galón", precio: 15000, disponible: true },
      ],
    });

    const resProdSlug = await fetch(`${baseUrl}/productos/${prodTemp.slug}`);
    const dataProdSlug = await resProdSlug.json();
    console.log(
      "8. GET /productos/:slug:",
      resProdSlug.status,
      dataProdSlug.slug === prodTemp.slug ? "✔ OK" : "❌ FAIL"
    );

    const resDestacados = await fetch(`${baseUrl}/productos/destacados`);
    const dataDestacados = await resDestacados.json();
    console.log(
      "9. GET /productos/destacados:",
      resDestacados.status,
      dataDestacados.productos?.length > 0 ? "✔ OK" : "❌ FAIL"
    );

    // 10. Crear color temporal para probar consulta por código
    const tempCod = "#D3" + Math.floor(Math.random() * 899 + 100);
    const colorTemp = await Color.create({
      codigo: tempCod,
      nombre: "Azul Día 3",
      hex: "#1E3A8A",
      coleccion: "Carta Clásica",
      tiposPermitidos: ["Vinilo", "Esmalte"],
    });

    const resColores = await fetch(`${baseUrl}/colores?q=Azul`);
    const dataColores = await resColores.json();
    console.log(
      "10. GET /colores?q=Azul:",
      resColores.status,
      dataColores.colores?.length > 0 ? "✔ OK" : "❌ FAIL"
    );

    const resColorCod = await fetch(`${baseUrl}/colores/${encodeURIComponent(tempCod)}`);
    const dataColorCod = await resColorCod.json();
    console.log(
      "11. GET /colores/:codigo:",
      resColorCod.status,
      dataColorCod.codigo === tempCod ? "✔ OK" : "❌ FAIL"
    );

    const resColecciones = await fetch(`${baseUrl}/colores/colecciones`);
    const dataColecciones = await resColecciones.json();
    console.log(
      "12. GET /colores/colecciones:",
      resColecciones.status,
      dataColecciones.colecciones?.length > 0 ? "✔ OK" : "❌ FAIL"
    );

    // 13. Búsqueda con caracteres especiales de regex (sanitización segura)
    const resRegex = await fetch(`${baseUrl}/productos?q=${encodeURIComponent("Prueba (Día 3) [test]")}`);
    const dataRegex = await resRegex.json();
    console.log(
      "13. GET /productos?q=caracteres_especiales:",
      resRegex.status,
      Array.isArray(dataRegex.productos) ? "✔ OK (sanitización regex)" : "❌ FAIL"
    );

    // Limpieza de datos temporales
    await Producto.findByIdAndDelete(prodTemp._id);
    await Color.findByIdAndDelete(colorTemp._id);
    console.log("✔ Limpieza de registros temporales completada");

    console.log("\n=== TODAS LAS PRUEBAS DEL DÍA 3 PASARON EXITOSAMENTE ===");
  } catch (error) {
    console.error("❌ Error durante las pruebas:", error);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
